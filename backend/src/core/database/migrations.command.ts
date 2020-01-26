import { Connection } from 'typeorm';
import {
    Command,
    Handler,
    CliArgument,
} from '../management';
import {
    createMigration,
    generateMigration,
    runMigrations,
} from './typeorm.utils';

@Command({ name: 'migrations' })
export class MigrationsCommand {
    constructor(private readonly connection: Connection) {}

    @Handler({ shortcut: 'create' })
    async createMigration(
        @CliArgument({ name: 'name' })
        migrationName: string,
    ) {
        await createMigration(this.connection, migrationName);
    }

    @Handler({ shortcut: 'generate' })
    async generateMigration(
        @CliArgument({
            name: 'name',
            optional: true,
            defaultValue: 'auto',
        })
        migrationName: string,
    ) {
        await generateMigration(this.connection, migrationName);
    }

    @Handler({ shortcut: 'run' })
    async runMigrations() {
        await runMigrations(this.connection);
    }
}
