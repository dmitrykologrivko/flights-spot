import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PropertyConfigService } from '@core/config';
import { AUTH_JWT_SECRET_PROPERTY } from '../constants/property.constants';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private config: PropertyConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get(AUTH_JWT_SECRET_PROPERTY),
        });
    }

    async validate(payload: any) {
        const result = await this.authService.validatePayload({ payload });

        if (result.is_err()) {
            throw new UnauthorizedException();
        }

        return result.unwrap();
    }
}
