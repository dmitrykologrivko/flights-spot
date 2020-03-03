import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserRegistrationService } from '../services/user-registration.service';

@ValidatorConstraint({ name: 'usernameUnique', async: true })
@Injectable()
export class UsernameUniqueConstraint {
    constructor(
        private readonly userRegistrationService: UserRegistrationService,
    ) {}

    async validate(text: string) {
        return this.userRegistrationService.isUsernameUnique(text);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this username already exists';
    }
}
