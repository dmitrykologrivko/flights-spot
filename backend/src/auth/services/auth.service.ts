import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { DomainService } from '@core/services';
import { EntityNotFoundException } from '@core/exceptions';
import { IncorrectPasswordException } from '../exceptions/incorrect-password.exception';
import { User } from '../entities/user.entity';

type ValidateUserResult = Promise<Result<User, EntityNotFoundException | IncorrectPasswordException>>;

@DomainService()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async validateUser(username: string, password: string): ValidateUserResult {
        const user = await this.userRepository.findOne( {
            where: { _username: username },
        });

        if (!user) {
            return Err(new EntityNotFoundException());
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return Err(new IncorrectPasswordException());
        }

        return Ok(user);
    }
}
