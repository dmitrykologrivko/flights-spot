import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Result, Ok, Err } from '@usefultools/monads';
import { ApplicationService } from '@core/services';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/exceptions';
import { BaseAuthService } from './base-auth.service';
import { IncorrectPasswordException } from '../exceptions/incorrect-password.exception';
import { User } from '../entities/user.entity';
import { JwtLoginInput } from '../dto/jwt-login.input';
import { JwtLoginOutput } from '../dto/jwt-login.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';

type ValidatePayloadResult = Promise<Result<ValidatePayloadOutput, EntityNotFoundException>>;
type LoginResult = Promise<Result<JwtLoginOutput, EntityNotFoundException | IncorrectPasswordException>>;

@ApplicationService()
export class JwtAuthService extends BaseAuthService {

    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
        super(userRepository);
    }

    async validatePayload(input: ValidatePayloadInput): ValidatePayloadResult {
        const result = await this.findUser(input.payload.username);

        if (result.is_err()) {
            return Err(result.unwrap_err());
        }

        const user = result.unwrap();

        const output = ClassTransformer.toClassObject(ValidatePayloadOutput, user);

        return Ok(output);
    }

    async login(input: JwtLoginInput): LoginResult {
        const result = await this.findUser(input.username);

        if (result.is_err()) {
            return Err(result.unwrap_err());
        }

        const user = result.unwrap();

        const payload = { username: user.username, sub: user.id };

        return Ok({
            accessToken: await this.jwtService.signAsync(payload),
        });
    }
}
