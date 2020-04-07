import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { User } from '../../entities/user.entity';
import { UserRegistrationService } from '../../services/user-registration.service';

describe('UserRegistrationService', () => {
    const EMAIL = 'test@test.com';
    const USERNAME = 'john_smith';
    const EMAIL_QUERY = { where: { _email: EMAIL } };
    const USERNAME_QUERY = { where: { _username: USERNAME } };

    let service: UserRegistrationService;
    let userRepository: MockProxy<Repository<User>>;

    beforeEach(() => {
        userRepository = mock<Repository<User>>();
        service = new UserRegistrationService(userRepository);
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
});
