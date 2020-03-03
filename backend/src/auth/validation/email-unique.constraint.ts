import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserRegistrationService } from '../services/user-registration.service';

@ValidatorConstraint({ name: 'emailUnique', async: true })
@Injectable()
export class EmailUniqueConstraint {
    constructor(
        private readonly userRegistrationService: UserRegistrationService,
    ) {}

    async validate(text: string) {
        return this.userRegistrationService.isEmailUnique(text);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this email already exists';
    }
}
