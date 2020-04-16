import * as fs from 'fs';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { Logger } from '@nestjs/common';
import { Connection } from 'typeorm';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exec = promisify(childProcess.exec);

export enum TypeOrmCommands {
    MIGRATION_CREATE = 'migration:create',
    MIGRATION_GENERATE = 'migration:generate',
    MIGRATION_RUN = 'migration:run',
    MIGRATION_SHOW = 'migration:show',
    MIGRATION_REVERT = 'migration:revert',
}

/**
 * Creates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 */
export async function createMigration(connection: Connection, migrationName: string) {
    await execTypeOrmCommand(
        connection,
        TypeOrmCommands.MIGRATION_CREATE,
        `-n ${migrationName} -c ${connection.name}`,
    );
}

/**
 * Generates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 */
export async function generateMigration(connection: Connection, migrationName: string) {
    await execTypeOrmCommand(
        connection,
        TypeOrmCommands.MIGRATION_GENERATE,
        `-n ${migrationName} -c ${connection.name}`,
    );
}

/**
 * Runs database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 */
export async function runMigrations(connection: Connection) {
    await connection.runMigrations();
    await connection.close();
}

/**
 * Executes typeorm cli command.
 * If ormconfig.json exists then uses it else dynamically generates
 * config file and removes it after command execution.
 * Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param command typeorm command
 * @param args typeorm command arguments
 */
export async function execTypeOrmCommand(
    connection: Connection,
    command: TypeOrmCommands,
    args: string = '',
) {
    const options = connection.options;

    const configPath = `${process.cwd()}/ormconfig.json`;
    const configExists = fs.existsSync(configPath);

    if (!configExists) {
        // Create temp database config file for typeorm cli
        await writeFile(configPath, JSON.stringify(options));

        // Safety close current database connection
        await connection.close();
    }

    if (configExists) {
        Logger.warn('Config file "ormconfig.json" already exists. Skipping dynamic generation...');
    }

    // Exec cli command
    const { stdout, stderr } = await exec(`typeorm ${command} ${args}`);

    // Log result
    if (stdout) {
        Logger.verbose(stdout);
    }
    if (stderr) {
        Logger.error(stderr);
    }

    if (configExists) {
        // Delete temp database config file
        await unlink(configPath);
    }
}
