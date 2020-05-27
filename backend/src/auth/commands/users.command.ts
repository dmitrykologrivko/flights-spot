import * as promptSync from 'prompt-sync';
import { Logger } from '@nestjs/common';
import { Command, Handler, CliArgument } from '@core/management';
import { UserService } from '../services/user.service';

const prompt = promptSync({ sigint: true });

@Command({ name: 'users' })
export class UsersCommand {
    constructor(private readonly userService: UserService) {}

    @Handler({ shortcut: 'create-superuser' })
    async createSuperuser(
        @CliArgument({
            name: 'username',
            optional: true,
        })
        username?: string,

        @CliArgument({
            name: 'password',
            optional: true,
        })
        password?: string,

        @CliArgument({
            name: 'email',
            optional: true,
        })
        email?: string,

        @CliArgument({
            name: 'firstName',
            optional: true,
        })
        firstName?: string,

        @CliArgument({
            name: 'lastName',
            optional: true,
        })
        lastName?: string,
    ) {
        if (!username) {
            username = prompt('Username: ');
        }

        if (!password) {
            password = prompt.hide('Password: ');
        }

        if (!email) {
            email = prompt('Email: ');
        }

        if (!firstName) {
            firstName = prompt('First Name: ');
        }

        if (!lastName) {
            lastName = prompt('Last name: ');
        }

        const createUserResult = await this.userService.createUser({
            username,
            password,
            email,
            firstName,
            lastName,
            isActive: true,
            isAdmin: true,
            isSuperuser: true,
        });

        if (createUserResult.is_ok()) {
            Logger.log(`Superuser "${username}" has been created`);
        } else {
            const message = createUserResult.unwrap_err()
                .validationExceptions
                .map(exception => exception.toString())
                .join('');
            Logger.error(message);
        }
    }
}
