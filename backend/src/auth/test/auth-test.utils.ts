import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtAuthService } from '../services/jwt-auth.service';
import { UserPasswordService } from '../services/user-password.service';
import { UserFactory } from './factories/user.factory';

export class AuthTestUtils {
    private readonly _userRepository: Repository<User>;
    private readonly _jwtAuthService: JwtAuthService;
    private readonly _userPasswordService: UserPasswordService;

    constructor(app: any) {
        this._userRepository = app.get('UserRepository');
        this._jwtAuthService = app.get(JwtAuthService);
        this._userPasswordService = app.get(UserPasswordService);
    }

    async saveUser(user: User) {
        return await this._userRepository.save(user);
    }

    async clearAllUsers() {
        await this._userRepository.clear();
    }

    async makeAndSaveUser() {
        const user = await UserFactory.makeUser();
        return await this.saveUser(user);
    }

    async generateJwtToken(user: User) {
        const loginResult = await this._jwtAuthService.login({ username: user.username });
        return loginResult.unwrap().accessToken;
    }

    async generateResetPasswordToken(user: User) {
        return this._userPasswordService.createResetPasswordToken(user);
    }

    async getJwtAuthHeader(user: User) {
        return `Bearer ${await this.generateJwtToken(user)}`;
    }

    get userRepository(): Repository<User> {
        return this._userRepository;
    }
}
