import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: 'usernameExists', async: true })
@Injectable()
export class UsernameExistsConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(username: string) {
        return this.userVerificationService.isUsernameExists(username);
    }

    defaultMessage(args: ValidationArguments) {
        return 'User with this username does not exist';
    }
}
