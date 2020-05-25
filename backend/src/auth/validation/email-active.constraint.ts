import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { UserPasswordService } from '../services/user-password.service';

@ValidatorConstraint({ name: 'emailActive', async: true })
@Injectable()
export class EmailActiveConstraint {
    constructor(
        private readonly userPasswordService: UserPasswordService,
    ) {}

    async validate(email: string) {
        return await this.userPasswordService.isEmailActive(email);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is not found';
    }
}
