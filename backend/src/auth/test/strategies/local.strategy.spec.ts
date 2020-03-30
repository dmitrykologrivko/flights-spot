import { UnauthorizedException } from '@nestjs/common';
import { Ok, Err } from '@usefultools/monads';
import { MockProxy, mock } from 'jest-mock-extended';
import { EntityNotFoundException } from '@core/exceptions';
import { IncorrectPasswordException } from '../../exceptions/incorrect-password.exception';
import { LocalStrategy } from '../../strategies/local.strategy';
import { AuthService } from '../../services/auth.service';
import { User } from '../../entities/user.entity';
import { UserFactory } from '../factories/user.factory';

function f() {
    throw Error('sdf');
}

describe('LocalStrategy', () => {
    let authService: MockProxy<AuthService> & AuthService;
    let strategy: LocalStrategy;

    let user: User;

    beforeEach(async () => {
        authService = mock<AuthService>();
        strategy = new LocalStrategy(authService);

        user = await UserFactory.makeUser();
    });

    describe('#validate()', () => {
        it('when user is not exist should throw unauthorized exception', async () => {
            authService.validateUser.mockReturnValue(Promise.resolve(Err(new EntityNotFoundException())));

            await expect(
                strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('when password is wrong should throw unauthorized exception', async () => {
            authService.validateUser.mockReturnValue(Promise.resolve(Err(new IncorrectPasswordException())));

            await expect(
                strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('when username and password are correct should return user', async () => {
            authService.validateUser.mockReturnValue(Promise.resolve(Ok(user)));

            const result = await strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD);

            expect(result).toBe(user);
        });
    });
});
