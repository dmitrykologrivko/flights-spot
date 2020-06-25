import { UnauthorizedException } from '@nestjs/common';
import { Ok, Err } from '@usefultools/monads';
import { MockProxy, mock } from 'jest-mock-extended';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/domain';
import { CredentialsInvalidException } from '../../exceptions/credentials-invalid.exception';
import { LocalStrategy } from '../../strategies/local.strategy';
import { AuthService } from '../../services/auth.service';
import { User } from '../../entities/user.entity';
import { ValidateCredentialsOutput } from '../../dto/validate-credentials.output';
import { UserFactory } from '../factories/user.factory';

describe('LocalStrategy', () => {
    let authService: MockProxy<AuthService> & AuthService;
    let strategy: LocalStrategy;

    let user: User;
    let validateCredentialsOutput: ValidateCredentialsOutput;

    beforeEach(async () => {
        authService = mock<AuthService>();
        strategy = new LocalStrategy(authService);

        user = await UserFactory.makeUser();

        validateCredentialsOutput = ClassTransformer.toClassObject(ValidateCredentialsOutput, user);
    });

    describe('#validate()', () => {
        it('when user is not exist should throw unauthorized exception', async () => {
            authService.validateCredentials.mockReturnValue(Promise.resolve(Err(new EntityNotFoundException())));

            await expect(
                strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('when password is wrong should throw unauthorized exception', async () => {
            authService.validateCredentials.mockReturnValue(Promise.resolve(Err(new CredentialsInvalidException())));

            await expect(
                strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('when username and password are correct should return user', async () => {
            authService.validateCredentials.mockReturnValue(Promise.resolve(Ok(validateCredentialsOutput)));

            const result = await strategy.validate(UserFactory.DEFAULT_USERNAME, UserFactory.DEFAULT_PASSWORD);

            expect(result).toBe(validateCredentialsOutput);
        });
    });
});
