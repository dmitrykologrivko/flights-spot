import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MockProxy, mock } from 'jest-mock-extended';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/domain';
import { AuthService } from '../../services/auth.service';
import { IncorrectPasswordException } from '../../exceptions/incorrect-password.exception';
import { User } from '../../entities/user.entity';
import { ValidateCredentialsInput } from '../../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../../dto/validate-credentials.output';
import { UserFactory } from '../factories/user.factory';

describe('AuthService', () => {
    const FIND_USER_QUERY = { where: { _username: UserFactory.DEFAULT_USERNAME, _isActive: true } };

    let service: AuthService;
    let userRepository: MockProxy<Repository<User>>;

    let user: User;

    let validateCredentialsInput: ValidateCredentialsInput;
    let validateCredentialsOutput: ValidateCredentialsOutput;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        service = new AuthService(userRepository);

        user = await UserFactory.makeUser();

        validateCredentialsInput = {
            username: UserFactory.DEFAULT_USERNAME,
            password: UserFactory.DEFAULT_PASSWORD,
        };
        validateCredentialsOutput = ClassTransformer.toClassObject(ValidateCredentialsOutput, user);
    });

    describe('#validateCredentials()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.validateCredentials(validateCredentialsInput);

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(EntityNotFoundException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });

        it('when password is wrong should return incorrect password error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validateCredentials({
                ...validateCredentialsInput,
                password: 'wrong-password',
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(IncorrectPasswordException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });

        it('when username and password are correct should return user', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validateCredentials(validateCredentialsInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toStrictEqual(validateCredentialsOutput);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });
    });
});
