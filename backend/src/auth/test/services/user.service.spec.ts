import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { PropertyConfigService } from '@core/config';
import { ValidationException, EntityNotFoundException } from '@core/exceptions';
import { ClassTransformer } from '@core/utils';
import { SimpleIocContainer, createClassValidatorContainer } from '@core/testing';
import { AUTH_PASSWORD_SALT_ROUNDS_PROPERTY } from '../../constants/auth.properties';
import { UserService } from '../../services/user.service';
import { UserVerificationService } from '../../services/user-verification.service';
import { UsernameUniqueConstraint } from '../../validation/username-unique.constraint';
import { EmailUniqueConstraint } from '../../validation/email-unique.constraint';
import { PasswordMatchConstraint } from '../../validation/password-match.constraint';
import { User } from '../../entities/user.entity';
import { CreateUserInput } from '../../dto/create-user.input';
import { CreateUserOutput } from '../../dto/create-user.output';
import { ChangePasswordInput } from '../../dto/change-password.input';
import { FindUserInput } from '../../dto/find-user.input';
import { FindUserOutput } from '../../dto/find-user.output';
import { UserFactory } from '../factories/user.factory';

describe('UserService', () => {
    const USERNAME_QUERY = { where: { _username: UserFactory.DEFAULT_USERNAME } };

    let container: SimpleIocContainer;
    let userVerificationService: MockProxy<UserVerificationService> & UserVerificationService;
    let userRepository: MockProxy<Repository<User>>;
    let config: MockProxy<PropertyConfigService> & PropertyConfigService;
    let usernameUniqueConstraint: UsernameUniqueConstraint;
    let emailUniqueConstraint: EmailUniqueConstraint;
    let passwordMatchConstraint: PasswordMatchConstraint;
    let service: UserService;

    let user: User;
    let createUserInput: CreateUserInput;
    let createUserOutput: CreateUserOutput;
    let changePasswordInput: ChangePasswordInput;
    let findUserInput: FindUserInput;
    let findUserOutput: FindUserOutput;

    beforeEach(async () => {
        container = createClassValidatorContainer();

        userVerificationService = mock<UserVerificationService>();
        userRepository = mock<Repository<User>>();
        config = mock<PropertyConfigService>();
        usernameUniqueConstraint = new UsernameUniqueConstraint(userVerificationService);
        emailUniqueConstraint = new EmailUniqueConstraint(userVerificationService);
        passwordMatchConstraint = new PasswordMatchConstraint(userVerificationService);

        service = new UserService(userRepository, config);

        container.register(UserVerificationService, userVerificationService, true);
        container.register(UsernameUniqueConstraint, usernameUniqueConstraint);
        container.register(EmailUniqueConstraint, emailUniqueConstraint);
        container.register(PasswordMatchConstraint, passwordMatchConstraint);

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

        changePasswordInput = {
            userId: user.id,
            currentPassword: UserFactory.DEFAULT_PASSWORD,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };

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

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser({
                email: null,
                firstName: null,
                lastName: null,
                username: null,
                password: null,
            });

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(null);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(null);
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

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(false));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);
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

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(false));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);
        });

        it('when input is valid should return successful output', async () => {
            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_ok()).toBe(true);
            expect(createUserResult.unwrap()).toStrictEqual(createUserOutput);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);

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

    describe('#changePassword()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationException[] = [
                new ValidationException(
                    'userId',
                    null,
                    {
                        isDefined: 'userId should not be null or undefined',
                    },
                ),
                new ValidationException(
                    'currentPassword',
                    null,
                    {
                        isNotEmpty: 'currentPassword should not be empty',
                        minLength: 'currentPassword must be longer than or equal to 8 characters',
                        maxLength: 'currentPassword must be shorter than or equal to 128 characters',
                        passwordMatch: 'Does not match with current user password',
                    },
                ),
                new ValidationException(
                    'newPassword',
                    null,
                    {
                        isNotEmpty: 'newPassword should not be empty',
                        minLength: 'newPassword must be longer than or equal to 8 characters',
                        maxLength: 'newPassword must be shorter than or equal to 128 characters',
                    },
                ),
            ];

            userVerificationService.comparePassword.mockReturnValue(Promise.resolve(false));

            const result = await service.changePassword({
                userId: null,
                currentPassword: null,
                newPassword: null,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.comparePassword.mock.calls.length).toBe(0);
        });

        it('when current password is wrong should return validation error', async () => {
            const wrongPassword = 'wrong-password';
            const errors: ValidationException[] = [
                new ValidationException(
                    'currentPassword',
                    wrongPassword,
                    {
                        passwordMatch: 'Does not match with current user password',
                    },
                ),
            ];

            userVerificationService.comparePassword.mockReturnValue(Promise.resolve(false));

            const result = await service.changePassword({
                ...changePasswordInput,
                currentPassword: wrongPassword,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.comparePassword.mock.calls[0][0]).toBe(user.id);
            expect(userVerificationService.comparePassword.mock.calls[0][1]).toBe(wrongPassword);
        });

        it('when input is valid should change password', async () => {
            config.get.mockReturnValue(10);
            userVerificationService.comparePassword.mockReturnValue(Promise.resolve(true));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            expect(await user.comparePassword(changePasswordInput.currentPassword)).toBeTruthy();

            const result = await service.changePassword(changePasswordInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toBeNull();

            expect(await user.comparePassword(changePasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userVerificationService.comparePassword.mock.calls[0][0])
                .toBe(user.id);
            expect(userVerificationService.comparePassword.mock.calls[0][1])
                .toBe(UserFactory.DEFAULT_PASSWORD);
            expect(userRepository.findOne.mock.calls[0][0])
                .toBe(user.id);
            expect(userRepository.save.mock.calls[0][0])
                .toBe(user);
        });
    });

    describe('#findUser()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_err()).toBe(true);
            expect(findUserResult.unwrap_err()).toBeInstanceOf(EntityNotFoundException);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when user exists should return successful output', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_ok()).toBe(true);
            expect(findUserResult.unwrap()).toStrictEqual(findUserOutput);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });
});
