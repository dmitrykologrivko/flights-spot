import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserPasswordService } from '../services/user-password.service';

@ValidatorConstraint({ name: 'resetPasswordTokenValid', async: true })
@Injectable()
export class ResetPasswordTokenValidConstraint {
    constructor(
        private readonly userPasswordService: UserPasswordService,
    ) {}

    async validate(token: string) {
        return await this.userPasswordService.isResetPasswordTokenValid(token);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Reset password token is not valid';
    }
}
