import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const validateUserResult = await this.authService.validateUser(username, password);

        if (validateUserResult.is_err()) {
            throw new UnauthorizedException();
        }

        return validateUserResult.unwrap();
    }
}
