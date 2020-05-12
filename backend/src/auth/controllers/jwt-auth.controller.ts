import { Request, Post, UseGuards } from '@nestjs/common';
import { ApiController } from '@core/controllers';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthService } from '../services/jwt-auth.service';

@ApiController('auth')
export class JwtAuthController {
    constructor(
        private authService: JwtAuthService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        const result = await this.authService.login({ username: req.user.username });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
