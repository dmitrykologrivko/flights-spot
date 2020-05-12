import { Ok, Err } from '@usefultools/monads';
import { MockProxy, mock } from 'jest-mock-extended';
import { EntityNotFoundException } from '@core/exceptions';
import { JwtAuthController } from '../../controllers/jwt-auth.controller';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserFactory } from '../factories/user.factory';

describe('JwtAuthController', () => {
    const REQUEST = {
        user: {
            username: UserFactory.DEFAULT_USERNAME,
        },
    };
    const JWT_LOGIN_OUTPUT = { accessToken: 'qf3fssf54djfsv78' };

    let controller: JwtAuthController;
    let jwtAuthService: MockProxy<JwtAuthService> & JwtAuthService;

    beforeEach(() => {
        jwtAuthService = mock<JwtAuthService>();
        controller = new JwtAuthController(jwtAuthService);
    });

    describe('#login()', () => {
        it('when login unsuccessful should throw error', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(Err(new EntityNotFoundException())));

            await expect(
                controller.login(REQUEST),
            ).rejects.toBeInstanceOf(EntityNotFoundException);
        });

        it('when login successful should return access token', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(Ok(JWT_LOGIN_OUTPUT)));

            const result = await controller.login(REQUEST);

            expect(result).toBe(JWT_LOGIN_OUTPUT);
        });
    });
});
