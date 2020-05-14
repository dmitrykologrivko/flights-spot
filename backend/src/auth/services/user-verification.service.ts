import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainService } from '@core/services';
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

    async isUsernameUnique(username: string): Promise<boolean> {
        return await this.userRepository.count({ where: { _username: username } }) === 0;
    }

    async comparePassword(idOrUsername: number | string, password: string): Promise<boolean> {
        let user;

        if (typeof idOrUsername === 'number') {
            user = await this.userRepository.findOne(idOrUsername);
        }
        if (typeof idOrUsername === 'string') {
            user = await this.userRepository.findOne({ where: { _username: idOrUsername } });
        }

        if (!user) {
            return false;
        }

        return await user.comparePassword(password);
    }
}
