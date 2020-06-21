import { Repository } from 'typeorm';
import { InjectRepository } from '@core/database';
import { DomainService } from '@core/domain';
import { User } from '../entities/user.entity';

@DomainService()
export class UserVerificationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async isEmailUnique(email: string): Promise<boolean> {
        return await this.userRepository.count({ where: { _email: email } }) === 0;
    }

    async isEmailActive(email: string): Promise<boolean> {
        return await this.userRepository.findOne({ where: { _email: email, _isActive: true } }) !== undefined;
    }

    async isUsernameUnique(username: string): Promise<boolean> {
        return await this.userRepository.count({ where: { _username: username } }) === 0;
    }

    async isUsernameExists(username: string): Promise<boolean> {
        return await this.userRepository.findOne({ where: { _username: username } }) !== undefined;
    }
}