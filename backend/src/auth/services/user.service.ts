import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { PropertyConfigService } from '@core/config';
import { ApplicationService } from '@core/services';
import { ClassTransformer, ClassValidator } from '@core/utils';
import { ValidationException } from '@core/exceptions';
import { AUTH_PASSWORD_SALT_ROUNDS_PROPERTY } from '../constants/auth.properties';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';
import { User } from '../entities/user.entity';
import { UserPasswordService } from './user-password.service';
import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserOutput } from '../dto/create-user.output';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { FindUserInput } from '../dto/find-user.input';
import { FindUserOutput } from '../dto/find-user.output';

type CreateUserResult = Promise<Result<CreateUserOutput, ValidationException[]>>;
type ChangePasswordResult = Promise<Result<void, ValidationException[] | UserNotFoundException>>;
type ForgotPasswordResult = Promise<Result<void, ValidationException[] | UserNotFoundException>>;
type ResetPasswordResult = Promise<Result<void, ValidationException[] | ResetPasswordTokenInvalidException | UserNotFoundException>>;
type FindUserResult = Promise<Result<FindUserOutput, UserNotFoundException>>;

@ApplicationService()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly passwordService: UserPasswordService,
        private readonly config: PropertyConfigService,
    ) {}

    /**
     * Creates a new user entity
     * @param input create user dto
     * @return user dto
     */
    async createUser(input: CreateUserInput): CreateUserResult {
        const validateResult = await ClassValidator.validate(CreateUserInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const createUserResult = await User.create(
            input.username,
            input.password,
            input.email,
            input.firstName,
            input.lastName,
            input.isActive,
            input.isAdmin,
            input.isSuperuser,
            this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY),
        );

        if (createUserResult.is_err()) {
            return createUserResult;
        }

        const user = await this.userRepository.save(createUserResult.unwrap());

        const output = ClassTransformer.toClassObject(CreateUserOutput, user);

        return Ok(output);
    }

    /**
     * Changes user password
     * @param input change password dto
     */
    async changePassword(input: ChangePasswordInput): ChangePasswordResult {
        const validateResult = await ClassValidator.validate(ChangePasswordInput, input);

        if (validateResult.is_err()) {
            return validateResult;
        }

        const user = await this.userRepository.findOne(input.userId);

        if (!user) {
            return Err(new UserNotFoundException());
        }

        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));

        await this.userRepository.save(user);

        return Ok(null);
    }

    /**
     *
     * @param input
     */
    async forgotPassword(input: ForgotPasswordInput): ForgotPasswordResult {
        const validateResult = await ClassValidator.validate(ForgotPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const user = await this.userRepository.findOne({
            where: { _email: input.email, _isActive: true },
        });

        if (!user) {
            return Err(new UserNotFoundException());
        }

        const token = await this.passwordService.createResetPasswordToken(user);

        Logger.debug(`(DEBUG) Reset token: ${token}`);
        Logger.log(`Recover password email has been sent for ${user.username}`);

        return Ok(null);
    }

    /**
     *
     * @param input
     */
    async resetPassword(input: ResetPasswordInput): ResetPasswordResult {
        const validateResult = await ClassValidator.validate(ResetPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const verifyTokenResult = await this.passwordService.verifyResetPasswordToken(input.resetPasswordToken);

        if (verifyTokenResult.is_err()) {
            return Err(verifyTokenResult.unwrap_err());
        }

        const user = verifyTokenResult.unwrap();

        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));
        await this.userRepository.save(user);

        Logger.log(`Password has been recovered for ${user.username}`);

        return Ok(null);
    }

    /**
     * Finds user by provided filters
     * @param input find user dto
     * @return user dto
     */
    async findUser(input: FindUserInput): FindUserResult {
        const user = await this.userRepository.findOne({
            where: { _username: input.username },
        });

        if (!user) {
            return Err(new UserNotFoundException());
        }

        const output = ClassTransformer.toClassObject(FindUserOutput, user);

        return Ok(output);
    }
}
