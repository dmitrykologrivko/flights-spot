import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Result, Ok, Err } from '@usefultools/monads';
import { ApplicationService } from '@core/services';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/exceptions';
import { IncorrectPasswordException } from '../exceptions/incorrect-password.exception';
import { User } from '../entities/user.entity';
import { LoginInput } from '../dto/login.input';
import { LoginOutput } from '../dto/login.output';
import { ValidateCredentialsInput } from '../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../dto/validate-credentials.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';

type ValidateCredentialsResult = Promise<Result<ValidateCredentialsOutput, EntityNotFoundException | IncorrectPasswordException>>;
type ValidatePayloadResult = Promise<Result<ValidatePayloadOutput, EntityNotFoundException>>;
type LoginResult = Promise<Result<LoginOutput, EntityNotFoundException | IncorrectPasswordException>>;

@ApplicationService()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async validateCredentials(input: ValidateCredentialsInput): ValidateCredentialsResult {
        const result = await this.findUser(input.username);

        if (result.is_err()) {
            return Err(result.unwrap_err());
        }

        const user = result.unwrap();

        const isPasswordValid = await user.comparePassword(input.password);

        if (!isPasswordValid) {
            return Err(new IncorrectPasswordException());
        }

        const output = ClassTransformer.toClassObject(ValidateCredentialsOutput, user);

        return Ok(output);
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

    async login(input: LoginInput): LoginResult {
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

    private async findUser(username: string): Promise<Result<User, EntityNotFoundException>> {
        const user = await this.userRepository.findOne( {
            where: { _username: username, _isActive: true },
        });

        if (!user) {
            return Err(new EntityNotFoundException());
        }

        return Ok(user);
    }
}
