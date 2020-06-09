import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Result, Ok, Err } from '@usefultools/monads';
import { PropertyConfigService } from '@core/config';
import { InjectRepository } from '@core/database';
import { DomainService } from '@core/domain';
import { AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY } from '../constants/auth.properties';
import { User } from '../entities/user.entity';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';

@DomainService()
export class UserPasswordService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly config: PropertyConfigService,
    ) {}

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

    async isEmailActive(email: string): Promise<boolean> {
        return await this.userRepository.findOne({ where: { _email: email, _isActive: true } }) !== undefined;
    }

    async isResetPasswordTokenValid(token: string): Promise<boolean> {
        const result = await this.verifyResetPasswordToken(token);
        return result.is_ok();
    }

    async createResetPasswordToken(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, key: this.getResetPasswordTokenKey(user) },
            { expiresIn: this.config.get(AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY) },
        );
    }

    async verifyResetPasswordToken(token: string): Promise<Result<User, ResetPasswordTokenInvalidException>> {
        let payload;

        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (e) {
            return Err(new ResetPasswordTokenInvalidException());
        }

        const user = await this.userRepository.findOne({
            where: { id: payload.sub, _isActive: true },
        });

        if (!user || this.getResetPasswordTokenKey(user) !== payload.key) {
            return Err(new ResetPasswordTokenInvalidException());
        }

        return Ok(user);
    }

    private getResetPasswordTokenKey(user: User) {
        /*
         * The user's password hashed by bcrypt that guarantee password has
         * new hash value every time even if a password is the same.
         * It allows us to get one time used key for resetting the password.
         */
        return crypto.createHash('sha256')
            .update(`${user.password}${user.created.getTime()}`, 'utf8')
            .digest('hex');
    }
}
