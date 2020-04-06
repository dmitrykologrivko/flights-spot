import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { Permission } from './entities/permission.entity';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserRegistrationService } from './services/user-registration.service';
import { AuthController } from './controllers/auth.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailUniqueConstraint } from './validation/email-unique.constraint';
import { UsernameUniqueConstraint } from './validation/username-unique.constraint';
import { UsersCommand } from './commands/users.command';
import authConfig from './auth.config';

@Module({
    imports: [
        ConfigModule.forFeature(authConfig),
        TypeOrmModule.forFeature([User, Group, Permission]),
        PassportModule,
    ],
    providers: [
        UserService,
        UserRegistrationService,
        AuthService,
        LocalAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        LocalStrategy,
        EmailUniqueConstraint,
        UsernameUniqueConstraint,
        UsersCommand,
    ],
    controllers: [AuthController],
    exports: [
        TypeOrmModule,
        LocalAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
    ],
})
export class AuthModule {}
