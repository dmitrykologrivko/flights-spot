import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserRegistrationService } from '../services/user-registration.service';

@ValidatorConstraint({ name: 'usernameUnique', async: true })
@Injectable()
export class UsernameUniqueConstraint {
    constructor(
        private readonly userRegistrationService: UserRegistrationService,
    ) {}

    async validate(username: string) {
        return this.userRegistrationService.isUsernameUnique(username);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this username already exists';
    }
}
