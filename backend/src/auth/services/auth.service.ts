import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UserService) {}

    async validateUser(username: string, password: string): Promise<any> {
        // const user = await this.usersService.findUser(username);
        //
        // if (!user) {
        //     return null;
        // }
        //
        // const isPasswordValid = await user.comparePassword(password);
        //
        // if (isPasswordValid) {
        //     return user;
        // }
        //
        // return null;
    }
}
