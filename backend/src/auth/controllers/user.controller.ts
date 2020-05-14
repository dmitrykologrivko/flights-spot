import { Body, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiController } from '@core/controllers';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { ChangePasswordInput } from '../dto/change-password.input';
import { BindSelfInterceptor } from '../interceptors/bind-self.interceptor';

@ApiController('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(BindSelfInterceptor)
    @Post('change-password')
    async changePassword(@Body() input: ChangePasswordInput) {
        const result = await this.userService.changePassword(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
