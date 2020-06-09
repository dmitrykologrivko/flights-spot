import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserRegistrationService } from '../services/user-registration.service';

@ValidatorConstraint({ name: 'usernameExists', async: true })
@Injectable()
export class UsernameExistsConstraint {
    constructor(
        private readonly userRegistrationService: UserRegistrationService,
    ) {}

    async validate(username: string) {
        return this.userRegistrationService.isUsernameExists(username);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this username does not exist';
    }
}
