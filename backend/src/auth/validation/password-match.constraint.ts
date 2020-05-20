import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserVerificationService } from '../services/user-verification.service';

const USER_ID_PROPERTY = 'userId';

@ValidatorConstraint({ name: 'passwordMatch', async: true })
@Injectable()
export class PasswordMatchConstraint {
    constructor(
        private readonly userRegistrationService: UserVerificationService,
    ) {}

    async validate(password: string, args: ValidationArguments) {
        if (!password || !args.object.hasOwnProperty(USER_ID_PROPERTY)) {
            return false;
        }

        return this.userRegistrationService.comparePassword(args.object[USER_ID_PROPERTY], password);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Does not match with current user password';
    }
}
