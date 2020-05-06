import { ModuleRef } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/typeorm';
import {
    Command,
    Handler,
    CliArgument,
} from '../management/management.decorators';
import {
    createMigration,
    generateMigration,
    runMigrations,
} from './typeorm.utils';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Command({ name: 'migrations' })
export class MigrationsCommand {
    constructor(
        private readonly moduleRef: ModuleRef,
    ) {}

    @Handler({ shortcut: 'create' })
    async createMigration(
        @CliArgument({ name: 'name' })
        migrationName: string,

        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connection?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination?: string,

        @CliArgument({
            name: 'useTypescript',
            optional: true,
            defaultValue: false,
        })
        useTypescript?: boolean,
    ) {
        await createMigration(
            this.getConnectionByName(connection),
            migrationName,
            destination,
            { useTypescript },
        );
    }

    @Handler({ shortcut: 'generate' })
    async generateMigration(
        @CliArgument({
            name: 'name',
            optional: true,
            defaultValue: 'auto',
        })
        migrationName: string,

        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connection?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination?: string,

        @CliArgument({
            name: 'useTypescript',
            optional: true,
            defaultValue: false,
        })
        useTypescript?: boolean,
    ) {
        await generateMigration(
            this.getConnectionByName(connection),
            migrationName,
            destination,
            { useTypescript },
        );
    }

    @Handler({ shortcut: 'run' })
    async runMigrations(
        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connection?: string,
    ) {
        await runMigrations(this.getConnectionByName(connection));
    }

    private getConnectionByName(name: string) {
        const connection = this.moduleRef.get(getConnectionToken(name) as string, { strict: false });

        if (connection) {
            return connection;
        }

        throw new Error(`${name} connection does not exist`);
    }
}
