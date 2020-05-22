import {
    Logger,
    Request,
    Body,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    UseFilters,
    ValidationPipe,
} from '@nestjs/common';
import {
    EntityNotFoundException,
    NonFieldValidationException,
    ValidationExceptionsFilter,
} from '@core/exceptions';
import { ApiController } from '@core/controllers';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { UserPasswordService } from '../services/user-password.service';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { BindSelfInterceptor } from '../interceptors/bind-self.interceptor';

@UsePipes(ValidationPipe)
@UseFilters(ValidationExceptionsFilter)
@ApiController('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly passwordService: UserPasswordService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(BindSelfInterceptor)
    @Post('change-password')
    async changePassword(@Request() req, @Body() input: ChangePasswordInput) {
        Logger.log(`Attempt to change password (IP ${req.ip})`);

        const result = await this.userService.changePassword(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @Post('forgot-password')
    async forgotPassword(@Request() req, @Body() input: ForgotPasswordInput) {
        Logger.log(`Attempt to send recover password email (IP ${req.ip})`);

        const result = await this.passwordService.forgotPassword(input);

        if (result.is_err()) {
            const error = result.unwrap_err();

            if (error instanceof EntityNotFoundException) {
                Logger.warn(`Recover password email cannot be send because "${input.email}" is not found`);
                return;
            }

            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @Post('reset-password')
    async resetPassword(@Request() req, @Body() input: ResetPasswordInput) {
        Logger.log(`Attempt to recover password (IP ${req.ip})`);

        const result = await this.passwordService.resetPassword(input);

        if (result.is_err()) {
            const error = result.unwrap_err();

            if (error instanceof EntityNotFoundException) {
                throw new NonFieldValidationException({
                    [EntityNotFoundException.name]: 'Requested user is not found',
                });
            }

            if (error instanceof ResetPasswordTokenInvalidException) {
                throw new NonFieldValidationException({
                    [ResetPasswordTokenInvalidException.name]: 'Reset password token is invalid',
                });
            }

            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
