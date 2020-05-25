import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserPasswordService } from '../services/user-password.service';

const USER_ID_PROPERTY = 'userId';

@ValidatorConstraint({ name: 'passwordMatch', async: true })
@Injectable()
export class PasswordMatchConstraint {
    constructor(
        private readonly userPasswordService: UserPasswordService,
    ) {}

    async validate(password: string, args: ValidationArguments) {
        if (!password || !args.object.hasOwnProperty(USER_ID_PROPERTY)) {
            return false;
        }

        return this.userPasswordService.comparePassword(args.object[USER_ID_PROPERTY], password);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Does not match with current user password';
    }
}
