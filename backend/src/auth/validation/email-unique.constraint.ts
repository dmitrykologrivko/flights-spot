import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: 'emailUnique', async: true })
@Injectable()
export class EmailUniqueConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(email: string) {
        return this.userVerificationService.isEmailUnique(email);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this email already exists';
    }
}
