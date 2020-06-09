import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserPasswordService } from '../services/user-password.service';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: 'emailActive', async: true })
@Injectable()
export class EmailActiveConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(email: string) {
        return await this.userVerificationService.isEmailActive(email);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is not found';
    }
}
