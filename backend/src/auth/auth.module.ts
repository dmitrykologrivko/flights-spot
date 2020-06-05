import { Module, DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from '@core/database';
import {
    ConfigModule,
    PropertyConfigService,
    SECRET_KEY_PROPERTY,
} from '@core/config';
import { isUndefined } from '@core/utils';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { Permission } from './entities/permission.entity';
import { AuthService } from './services/auth.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserPasswordService } from './services/user-password.service';
import { UserService } from './services/user.service';
import { UserRegistrationService } from './services/user-registration.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailUniqueConstraint } from './validation/email-unique.constraint';
import { EmailActiveConstraint } from './validation/email-active.constraint';
import { UsernameUniqueConstraint } from './validation/username-unique.constraint';
import { PasswordMatchConstraint } from './validation/password-match.constraint';
import { ResetPasswordTokenValidConstraint } from './validation/reset-password-token-valid.constraint';
import { BindUserInterceptor } from './interceptors/bind-user.interceptor';
import { BindSelfInterceptor } from './interceptors/bind-self.interceptor';
import { UsersCommand } from './commands/users.command';
import authConfig from './auth.config';

export interface AuthModuleOptions {
    enableUsersApi?: boolean;
    enableAuthApi?: boolean;
}

const jwtAsyncOptions = {
    imports: [PropertyConfigService],
    useFactory: (config: PropertyConfigService) => {
        const moduleOptions: JwtModuleOptions = {};

        const secret = config.get(SECRET_KEY_PROPERTY);
        const expiresIn = config.get(AUTH_JWT_EXPIRES_IN_PROPERTY);

        if (secret) {
            moduleOptions.secret = secret;
        }

        if (expiresIn) {
            moduleOptions.signOptions = { expiresIn };
        }

        return moduleOptions;
    },
    inject: [PropertyConfigService],
};

@Module({
    imports: [
        ConfigModule.forFeature(authConfig),
        DatabaseModule.withEntities([User, Group, Permission]),
        PassportModule,
        JwtModule.registerAsync(jwtAsyncOptions),
    ],
    providers: [
        UserService,
        UserRegistrationService,
        UserPasswordService,
        AuthService,
        JwtAuthService,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        LocalStrategy,
        JwtStrategy,
        EmailUniqueConstraint,
        EmailActiveConstraint,
        UsernameUniqueConstraint,
        PasswordMatchConstraint,
        ResetPasswordTokenValidConstraint,
        BindUserInterceptor,
        BindSelfInterceptor,
        UsersCommand,
    ],
    exports: [
        DatabaseModule,
        UserService,
        JwtAuthService,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        BindUserInterceptor,
        BindSelfInterceptor,
    ],
})
export class AuthModule {

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const controllers = [];

        if (isUndefined(options.enableUsersApi) || options.enableUsersApi === true) {
            controllers.push(AuthPasswordController);
        }

        if (isUndefined(options.enableAuthApi) || options.enableAuthApi === true) {
            controllers.push(AuthJwtController);
        }

        return {
            module: AuthModule,
            controllers,
        };
    }
}
