import { Ok, Err } from '@usefultools/monads';
import { MockProxy, mock } from 'jest-mock-extended';
import { ValidationContainerException } from '@core/utils';
import { UserController } from '../../controllers/user.controller';
import { UserService } from '../../services/user.service';
import { User } from '../../entities/user.entity';
import { UserFactory } from '../factories/user.factory';

describe('UserController', () => {
    const REQUEST = { ip: '0.0.0.0' };

    let controller: UserController;
    let userService: MockProxy<UserService> & UserService;

    let user: User;

    let changePasswordRequest;

    beforeEach(async () => {
        userService = mock<UserService>();
        controller = new UserController(userService);

        user = await UserFactory.makeUser();

        changePasswordRequest = {
            userId: user.id,
            currentPassword: UserFactory.DEFAULT_PASSWORD,
            newPassword: 'new-password',
        };
    });

    describe('#changePassword()', () => {
        it('when change password unsuccessful should throw error', async () => {
            userService.changePassword.mockReturnValue(Promise.resolve(Err(new ValidationContainerException([]))));

            await expect(
                controller.changePassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when change password successful should return successful response', async () => {
            userService.changePassword.mockReturnValue(Promise.resolve(Ok(null)));

            const result = await controller.changePassword(REQUEST, changePasswordRequest);

            expect(result).toBe(null);
        });
    });
});
