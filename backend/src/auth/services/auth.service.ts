import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { ApplicationService } from '@core/services';
import { ClassTransformer } from '@core/utils';
import { EntityNotFoundException } from '@core/exceptions';
import { BaseAuthService } from './base-auth.service';
import { IncorrectPasswordException } from '../exceptions/incorrect-password.exception';
import { User } from '../entities/user.entity';
import { ValidateCredentialsInput } from '../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../dto/validate-credentials.output';

type ValidateCredentialsResult = Promise<Result<ValidateCredentialsOutput, EntityNotFoundException | IncorrectPasswordException>>;

@ApplicationService()
export class AuthService extends BaseAuthService {

    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

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
}
