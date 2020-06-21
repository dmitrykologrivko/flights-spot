import {
    Post,
    UseGuards,
    UsePipes,
    UseFilters,
    ValidationPipe,
} from '@nestjs/common';
import { ApiController } from '@core/rest';
import { ValidationExceptionsFilter } from '@core/utils';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthService } from '../services/jwt-auth.service';
import { User } from '../decorators/user.decorator';
import { BearerToken } from '../decorators/bearer-token.decorator';

@UsePipes(ValidationPipe)
@UseFilters(ValidationExceptionsFilter)
@ApiController('auth')
export class AuthJwtController {
    constructor(
        private readonly authService: JwtAuthService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@User() user) {
        const result = await this.authService.login({ username: user.username });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@BearerToken() token) {
        const result = await this.authService.logout({ token });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}