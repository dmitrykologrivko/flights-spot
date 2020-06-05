import { Ok, Err } from '@usefultools/monads';
import { MockProxy, mock } from 'jest-mock-extended';
import { EntityNotFoundException } from '@core/domain';
import { JwtAuthController } from '../../controllers/jwt-auth.controller';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserFactory } from '../factories/user.factory';

describe('JwtAuthController', () => {
    let controller: JwtAuthController;
    let jwtAuthService: MockProxy<JwtAuthService> & JwtAuthService;

    const loginRequest = {
        user: {
            username: UserFactory.DEFAULT_USERNAME,
        },
    };
    const loginResponse = { accessToken: 'qf3fssf54djfsv78' };

    beforeEach(() => {
        jwtAuthService = mock<JwtAuthService>();
        controller = new JwtAuthController(jwtAuthService);
    });

    describe('#login()', () => {
        it('when login unsuccessful should throw error', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(Err(new EntityNotFoundException())));

            await expect(
                controller.login(loginRequest),
            ).rejects.toBeInstanceOf(EntityNotFoundException);
        });

        it('when login successful should return access token', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(Ok(loginResponse)));

            const result = await controller.login(loginRequest);

            expect(result).toBe(loginResponse);
        });
    });
});
