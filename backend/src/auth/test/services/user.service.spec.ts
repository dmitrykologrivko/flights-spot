import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { PropertyConfigService } from '@core/config';
import { ValidationException, EntityNotFoundException } from '@core/exceptions';
import { ClassTransformer } from '@core/utils';
import { SimpleIocContainer, createClassValidatorContainer } from '@core/testing';
import { UserService } from '../../services/user.service';
import { UserRegistrationService } from '../../services/user-registration.service';
import { UsernameUniqueConstraint } from '../../validation/username-unique.constraint';
import { EmailUniqueConstraint } from '../../validation/email-unique.constraint';
import { User } from '../../entities/user.entity';
import { CreateUserInput } from '../../dto/create-user.input';
import { CreateUserOutput } from '../../dto/create-user.output';
import { FindUserInput } from '../../dto/find-user.input';
import { FindUserOutput } from '../../dto/find-user.output';
import { UserFactory } from '../factories/user.factory';

describe('UserService', () => {
    let container: SimpleIocContainer;
    let userRegistrationService: MockProxy<UserRegistrationService> & UserRegistrationService;
    let userRepository: MockProxy<Repository<User>>;
    let config: MockProxy<PropertyConfigService> & PropertyConfigService;
    let usernameUniqueConstraint: UsernameUniqueConstraint;
    let emailUniqueConstraint: EmailUniqueConstraint;
    let service: UserService;

    let user: User;
    let createUserInput: CreateUserInput;
    let createUserOutput: CreateUserOutput;
    let findUserInput: FindUserInput;
    let findUserOutput: FindUserOutput;

    beforeEach(async () => {
        container = createClassValidatorContainer();

        userRegistrationService = mock<UserRegistrationService>();
        userRepository = mock<Repository<User>>();
        config = mock<PropertyConfigService>();
        usernameUniqueConstraint = new UsernameUniqueConstraint(userRegistrationService);
        emailUniqueConstraint = new EmailUniqueConstraint(userRegistrationService);

        service = new UserService(userRepository, config);

        container.register(UserRegistrationService, userRegistrationService, true);
        container.register(UsernameUniqueConstraint, usernameUniqueConstraint);
        container.register(EmailUniqueConstraint, emailUniqueConstraint);

        user = await UserFactory.makeUser();

        createUserInput = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: user.password,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
            isSuperuser: user.isSuperuser,
        };
        createUserOutput = ClassTransformer.toClassObject(CreateUserOutput, user);

        findUserInput = { username: user.username };
        findUserOutput = ClassTransformer.toClassObject(FindUserOutput, user);
    });

    describe('#createUser()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationException[] = [
                new ValidationException(
                    'username',
                    null,
                    {
                        isNotEmpty: 'username should not be empty',
                        maxLength: 'username must be shorter than or equal to 150 characters',
                    },
                ),
                new ValidationException(
                    'password',
                    null,
                    {
                        isNotEmpty: 'password should not be empty',
                        minLength: 'password must be longer than or equal to 8 characters',
                        maxLength: 'password must be shorter than or equal to 128 characters',
                    },
                ),
                new ValidationException(
                    'email',
                    null,
                    {
                        isEmail: 'email must be an email',
                        maxLength: 'email must be shorter than or equal to 254 characters',
                    },
                ),
                new ValidationException(
                    'firstName',
                    null,
                    {
                        isNotEmpty: 'firstName should not be empty',
                        maxLength: 'firstName must be shorter than or equal to 30 characters',
                    },
                ),
                new ValidationException(
                    'lastName',
                    null,
                    {
                        isNotEmpty: 'lastName should not be empty',
                        maxLength: 'lastName must be shorter than or equal to 150 characters',
                    },
                ),
            ];

            userRegistrationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userRegistrationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser({
                email: null,
                firstName: null,
                lastName: null,
                username: null,
                password: null,
            });

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);
        });

        it('when email already exists should return validation error', async () => {
            const errors: ValidationException[] = [
                new ValidationException(
                    'email',
                    user.email,
                    {
                        emailUnique: 'User with this email already exists',
                    },
                ),
            ];

            userRegistrationService.isEmailUnique.mockReturnValue(Promise.resolve(false));
            userRegistrationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);
        });

        it('when username already exists should return validation error', async () => {
            const errors: ValidationException[] = [
                new ValidationException(
                    'username',
                    user.username,
                    {
                        usernameUnique: 'User with this username already exists',
                    },
                ),
            ];

            userRegistrationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userRegistrationService.isUsernameUnique.mockReturnValue(Promise.resolve(false));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);
        });

        it('when input is valid should return successful output', async () => {
            userRegistrationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userRegistrationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_ok()).toBe(true);
            expect(createUserResult.unwrap()).toStrictEqual(createUserOutput);

            const callArg = userRepository.save.mock.calls[0][0];

            expect(callArg.username).toBe(user.username);
            expect(callArg.email).toBe(user.email);
            expect(callArg.firstName).toBe(user.firstName);
            expect(callArg.lastName).toBe(user.lastName);
            expect(callArg.isActive).toBe(user.isActive);
            expect(callArg.isAdmin).toBe(user.isAdmin);
            expect(callArg.isSuperuser).toBe(user.isSuperuser);
        });
    });

    describe('#findUser()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_err()).toBe(true);
            expect(findUserResult.unwrap_err()).toBeInstanceOf(EntityNotFoundException);
        });

        it('when user exists should return successful output', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_ok()).toBe(true);
            expect(findUserResult.unwrap()).toStrictEqual(findUserOutput);
        });
    });
});
