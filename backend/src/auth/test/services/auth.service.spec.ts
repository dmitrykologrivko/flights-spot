import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { EntityNotFoundException } from '@core/exceptions';
import { AuthService } from '../../services/auth.service';
import { IncorrectPasswordException } from '../../exceptions/incorrect-password.exception';
import { User } from '../../entities/user.entity';
import { UserFactory } from '../factories/user.factory';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: MockProxy<Repository<User>>;

    let user: User;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        service = new AuthService(userRepository);

        user = await UserFactory.makeUser();
    });

    describe('#validateUser()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const validateUserResult = await service.validateUser(
                UserFactory.DEFAULT_USERNAME,
                UserFactory.DEFAULT_PASSWORD,
            );

            expect(validateUserResult.is_err()).toBe(true);
            expect(validateUserResult.unwrap_err()).toBeInstanceOf(EntityNotFoundException);
        });

        it('when password is wrong should return incorrect password error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const validateUserResult = await service.validateUser(
                UserFactory.DEFAULT_USERNAME,
                'wrong-password',
            );

            expect(validateUserResult.is_err()).toBe(true);
            expect(validateUserResult.unwrap_err()).toBeInstanceOf(IncorrectPasswordException);
        });

        it('when username and password are correct should return user', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const validateUserResult = await service.validateUser(
                UserFactory.DEFAULT_USERNAME,
                UserFactory.DEFAULT_PASSWORD,
            );

            expect(validateUserResult.is_ok()).toBe(true);
            expect(validateUserResult.unwrap()).toBe(user);
        });
    });
});
