import { Repository } from 'typeorm';
import { InjectRepository } from '@core/database';
import { ApplicationService } from '@core/domain';
import {
    Result,
    Ok,
    AsyncResult,
    ClassTransformer,
    ValidationException,
} from '@core/utils';
import { BaseAuthService } from './base-auth.service';
import { UserJwtService } from './user-jwt.service';
import {
    PAYLOAD_VALID,
    JWT_TOKEN_VALID,
    USERNAME_ACTIVE,
} from '../constants/auth.constraints';
import { User } from '../entities/user.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { JwtLoginInput } from '../dto/jwt-login.input';
import { JwtLoginOutput } from '../dto/jwt-login.output';
import { JwtLogoutInput } from '../dto/jwt-logout.input';
import { JwtLogoutOutput } from '../dto/jwt-logout.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';

type ValidatePayloadResult = Promise<Result<ValidatePayloadOutput, ValidationException>>;
type LoginResult = Promise<Result<JwtLoginOutput, ValidationException>>;
type LogoutResult = Promise<Result<JwtLogoutOutput, ValidationException>>;

@ApplicationService()
export class JwtAuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        @InjectRepository(RevokedToken)
        protected readonly revokedTokenRepository: Repository<RevokedToken>,
        private readonly userJwtService: UserJwtService,
    ) {
        super(userRepository);
    }

    async validatePayload(input: ValidatePayloadInput): ValidatePayloadResult {
        return AsyncResult.from(this.userJwtService.validatePayload(input.payload))
            .and_then(user => {
                return Ok(ClassTransformer.toClassObject(ValidatePayloadOutput, user));
            })
            .map_err(() => (
                new ValidationException(
                    'payload',
                    input.payload,
                    { [PAYLOAD_VALID.key]: PAYLOAD_VALID.message },
                )
            ))
            .toResult();
    }

    async login(input: JwtLoginInput): LoginResult {
        return AsyncResult.from(this.userJwtService.generateAccessToken(input.username))
            .map(token => ({ accessToken: token }))
            .map_err(() => (
                new ValidationException(
                    'username',
                    input.username,
                    { [USERNAME_ACTIVE.key]: USERNAME_ACTIVE.message },
                )
            ))
            .toResult();
    }

    async logout(input: JwtLogoutInput): LogoutResult {
        return AsyncResult.from(this.userJwtService.revokeAccessToken(input.token))
            .and_then(async revokedToken => {
                await this.revokedTokenRepository.save(revokedToken);
                return Ok({});
            })
            .map_err(() => (
                 new ValidationException(
                    'token',
                    input.token,
                    { [JWT_TOKEN_VALID.key]: JWT_TOKEN_VALID.message },
                )
            ))
            .toResult();
    }
}
