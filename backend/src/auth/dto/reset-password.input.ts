import { IsJWT } from 'class-validator';
import { ValidatePassword } from '../validation/user.validators';

export class ResetPasswordInput {

    @IsJWT()
    resetPasswordToken: string;

    @ValidatePassword()
    newPassword: string;

}
