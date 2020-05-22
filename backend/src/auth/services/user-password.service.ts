import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { JwtService } from '@nestjs/jwt';
import { PropertyConfigService } from '@core/config';
import { ApplicationService } from '@core/services';
import { ClassValidator } from '@core/utils';
import { EntityNotFoundException, ValidationException } from '@core/exceptions';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';
import {
    AUTH_PASSWORD_SALT_ROUNDS_PROPERTY,
    AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY,
} from '../constants/auth.properties';
import { User } from '../entities/user.entity';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';

type ForgotPasswordResult = Promise<Result<void, EntityNotFoundException | ValidationException[]>>;
type ResetPasswordResult = Promise<Result<void, ResetPasswordTokenInvalidException | EntityNotFoundException | ValidationException[]>>;

@ApplicationService()
export class UserPasswordService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly config: PropertyConfigService,
    ) {}

    async forgotPassword(input: ForgotPasswordInput): ForgotPasswordResult {
        const validateResult = await ClassValidator.validate(ForgotPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const user = await this.userRepository.findOne({
            where: { _email: input.email, _isActive: true },
        });

        if (!user) {
            return Err(new EntityNotFoundException());
        }

        const payload = { sub: user.id, key: this.createTokenKey(user) };
        const token = await this.jwtService.signAsync(
            payload,
            { expiresIn: this.config.get(AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY) },
        );

        Logger.debug(`(DEBUG) Reset token: ${token}`);
        Logger.log(`Recover password email has been sent for ${user.username}`);

        return Ok(null);
    }

    async resetPassword(input: ResetPasswordInput): ResetPasswordResult {
        const validateResult = await ClassValidator.validate(ResetPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        let payload;

        try {
            payload = await this.jwtService.verifyAsync(input.resetPasswordToken);
        } catch (e) {
            return Err(new ResetPasswordTokenInvalidException());
        }

        const user = await this.userRepository.findOne({
            where: { id: payload.sub, _isActive: true },
        });

        if (!user) {
            return Err(new EntityNotFoundException());
        }

        if (this.createTokenKey(user) !== payload.key) {
            return Err(new ResetPasswordTokenInvalidException());
        }

        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));
        await this.userRepository.save(user);

        Logger.log(`Password has been recovered for ${user.username}`);

        return Ok(null);
    }

    private createTokenKey(user: User) {
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
