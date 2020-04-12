import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MockProxy, mock } from 'jest-mock-extended';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/exceptions';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { User } from '../../entities/user.entity';
import { ValidatePayloadInput } from '../../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../../dto/validate-payload.output';
import { JwtLoginInput } from '../../dto/jwt-login.input';
import { JwtLoginOutput } from '../../dto/jwt-login.output';
import { UserFactory } from '../factories/user.factory';

describe('JwtAuthService', () => {
    const FIND_USER_QUERY = { where: { _username: UserFactory.DEFAULT_USERNAME, _isActive: true } };
    const ACCESS_TOKEN = 'qf3fssf54djfsv78';

    let service: JwtAuthService;
    let userRepository: MockProxy<Repository<User>>;
    let jwtService: MockProxy<JwtService> & JwtService;

    let user: User;
    let payload: {
        username: string,
        sub: number,
    };
    let validatePayloadInput: ValidatePayloadInput;
    let validatePayloadOutput: ValidatePayloadOutput;
    let jwtLoginInput: JwtLoginInput;
    let jwtLoginOutput: JwtLoginOutput;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        jwtService = mock<JwtService>();
        service = new JwtAuthService(userRepository, jwtService);

        user = await UserFactory.makeUser();

        payload = {
            username: user.username,
            sub: user.id,
        };

        validatePayloadInput = { payload: { username: user.username } };
        validatePayloadOutput = ClassTransformer.toClassObject(ValidatePayloadOutput, user);

        jwtLoginInput = { username: user.username };
        jwtLoginOutput = { accessToken: ACCESS_TOKEN };
    });

    describe('#validatePayload()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.validatePayload(validatePayloadInput);

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(EntityNotFoundException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });

        it('when user exists correct should return user', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validatePayload(validatePayloadInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toStrictEqual(validatePayloadOutput);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });
    });

    describe('#login()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.login(jwtLoginInput);

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(EntityNotFoundException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
        });

        it('when user exists should return access token', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));
            jwtService.signAsync.mockReturnValue(Promise.resolve(ACCESS_TOKEN));

            const result = await service.login(jwtLoginInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toStrictEqual(jwtLoginOutput);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(FIND_USER_QUERY);
            expect(jwtService.signAsync.mock.calls[0][0]).toStrictEqual(payload);
        });
    });
});
