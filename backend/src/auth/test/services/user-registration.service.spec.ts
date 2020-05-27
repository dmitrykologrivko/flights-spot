import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { User } from '../../entities/user.entity';
import { UserRegistrationService } from '../../services/user-registration.service';
import { UserFactory } from '../factories/user.factory';

describe('UserVerificationService', () => {
    const ID = 1;
    const EMAIL = 'test@test.com';
    const USERNAME = UserFactory.DEFAULT_USERNAME;
    const PASSWORD = UserFactory.DEFAULT_PASSWORD;
    const EMAIL_QUERY = { where: { _email: EMAIL } };
    const USERNAME_QUERY = { where: { _username: USERNAME } };

    let service: UserRegistrationService;
    let userRepository: MockProxy<Repository<User>>;

    let user: User;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        service = new UserRegistrationService(userRepository);

        user = await UserFactory.makeUser();
    });

    describe('#isEmailUnique()',  () => {
        it('when email is unique should return true', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(0));

            const result = await service.isEmailUnique(EMAIL);

            expect(result).toBe(true);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(EMAIL_QUERY);
        });

        it('when email is not unique should return false', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(1));

            const result = await service.isEmailUnique(EMAIL);

            expect(result).toBe(false);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(EMAIL_QUERY);
        });
    });

    describe('#isUsernameUnique()',  () => {
        it('when username is unique should return true', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(0));

            const result = await service.isUsernameUnique(USERNAME);

            expect(result).toBe(true);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when username is not unique should return false', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(1));

            const result = await service.isUsernameUnique(USERNAME);

            expect(result).toBe(false);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });

    // describe('#comparePassword()', () => {
    //     it('when user not found by id should return false', async () => {
    //         userRepository.findOne.mockReturnValue(Promise.resolve(null));
    //
    //         const result = await service.comparePassword(ID, PASSWORD);
    //
    //         expect(result).toBe(false);
    //         expect(userRepository.findOne.mock.calls[0][0]).toEqual(ID);
    //     });
    //
    //     it('when user not found by username should return false', async () => {
    //         userRepository.findOne.mockReturnValue(Promise.resolve(null));
    //
    //         const result = await service.comparePassword(USERNAME, PASSWORD);
    //
    //         expect(result).toBe(false);
    //         expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
    //     });
    //
    //     it('when user id and password are match should return true', async () => {
    //         userRepository.findOne.mockReturnValue(Promise.resolve(user));
    //
    //         const result = await service.comparePassword(ID, PASSWORD);
    //
    //         expect(result).toBe(true);
    //         expect(userRepository.findOne.mock.calls[0][0]).toEqual(ID);
    //     });
    //
    //     it('when username and password are match should return true', async () => {
    //         userRepository.findOne.mockReturnValue(Promise.resolve(user));
    //
    //         const result = await service.comparePassword(USERNAME, PASSWORD);
    //
    //         expect(result).toBe(true);
    //         expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
    //     });
    // });
});