import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from '@core/database';
import { ConfigModule, PropertyConfigService } from '@core/config';
import {
    AUTH_JWT_SECRET_PROPERTY,
    AUTH_JWT_EXPIRES_IN_PROPERTY,
} from './constants/property.constants';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { Permission } from './entities/permission.entity';
import { AuthService } from './services/auth.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserService } from './services/user.service';
import { UserRegistrationService } from './services/user-registration.service';
import { JwtAuthController } from './controllers/jwt-auth.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailUniqueConstraint } from './validation/email-unique.constraint';
import { UsernameUniqueConstraint } from './validation/username-unique.constraint';
import { UsersCommand } from './commands/users.command';
import authConfig from './auth.config';

const jwtAsyncOptions = {
    imports: [PropertyConfigService],
    useFactory: (config: PropertyConfigService) => {
        const moduleOptions: JwtModuleOptions = {};

        const secret = config.get(AUTH_JWT_SECRET_PROPERTY);
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
        DatabaseModule.withEntities([User, Group, Permission], { modulePath: __dirname }),
        PassportModule,
        JwtModule.registerAsync(jwtAsyncOptions),
    ],
    providers: [
        UserService,
        UserRegistrationService,
        AuthService,
        JwtAuthService,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        LocalStrategy,
        JwtStrategy,
        EmailUniqueConstraint,
        UsernameUniqueConstraint,
        UsersCommand,
    ],
    controllers: [JwtAuthController],
    exports: [
        DatabaseModule,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
    ],
})
export class AuthModule {}
