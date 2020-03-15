import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainService } from '@core/services';
import { User } from '../entities/user.entity';

@DomainService()
export class UserRegistrationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async isEmailUnique(email: string): Promise<boolean> {
        return await this.userRepository.count({ where: { email } }) === 0;
    }

    async isUsernameUnique(username: string): Promise<boolean> {
        return await this.userRepository.count({ where: { username } }) === 0;
    }
}