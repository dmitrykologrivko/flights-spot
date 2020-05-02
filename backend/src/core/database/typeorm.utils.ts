import * as fs from 'fs';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { Logger } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exec = promisify(childProcess.exec);

export enum TypeormCommands {
    MIGRATION_CREATE = 'migration:create',
    MIGRATION_GENERATE = 'migration:generate',
    MIGRATION_RUN = 'migration:run',
    MIGRATION_SHOW = 'migration:show',
    MIGRATION_REVERT = 'migration:revert',
}

export interface TypeormCommandOptions {

    /**
     * execute typeorm cli command through TypeScript interpreter
     */
    useTypescript?: boolean;

}

export interface MigrationsCommandOptions extends TypeormCommandOptions {

    /**
     * Lookup src folder for entities and migrations
     */
    lookupSourceDir?: boolean;

    /**
     * Source files dir
     */
    sourceDir?: string;

    /**
     * Build files dir
     */
    outDir?: string;

}

/**
 * Extends database connection options for migrations command
 * @param connectionOptions database connection options
 * @param commandOptions extra options for executing typeorm migrations cli command
 */
function extendConnectionOptionsForMigrations(
    connectionOptions: ConnectionOptions,
    commandOptions: MigrationsCommandOptions,
) {
    const entities = connectionOptions.entities || [];
    const migrations = connectionOptions.migrations || [];

    if (commandOptions.lookupSourceDir) {
        const isEligiblePath = (path: any) => typeof path === 'string' &&
            path.includes(commandOptions.outDir) &&
            !path.includes('node_modules');

        const replacePath = (path: string) => path.replace(commandOptions.outDir, commandOptions.sourceDir);

        entities.push(
            ...entities.filter(path => isEligiblePath(path))
                .map(path => replacePath(path as string)),
        );

        migrations.push(
            ...migrations.filter(path => isEligiblePath(path))
                .map(path => replacePath(path as string)),
        );
    }

    return { ...connectionOptions, entities, migrations };
}

/**
 * Creates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 * @param destination directory where migration should be created
 * @param commandOptions extra options for executing typeorm migrations cli command
 */
export async function createMigration(
    connection: Connection,
    migrationName: string,
    destination?: string,
    commandOptions: MigrationsCommandOptions = {},
) {
    await execTypeormCommand(
        connection,
        TypeormCommands.MIGRATION_CREATE,
        `-n ${migrationName} -c ${connection.name} ${destination ? `-d ${destination}` : ''}`,
        commandOptions,
        extendConnectionOptionsForMigrations(connection.options, commandOptions),
    );
}

/**
 * Generates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 * @param destination directory where migration should be created
 * @param commandOptions extra options for executing typeorm migrations cli command
 */
export async function generateMigration(
    connection: Connection,
    migrationName: string,
    destination?: string,
    commandOptions: MigrationsCommandOptions = {},
) {
    await execTypeormCommand(
        connection,
        TypeormCommands.MIGRATION_GENERATE,
        `-n ${migrationName} -c ${connection.name} ${destination ? `-d ${destination}` : ''}`,
        commandOptions,
        extendConnectionOptionsForMigrations(connection.options, commandOptions),
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
 * @param commandOptions extra options for executing typeorm cli command
 * @param connectionOptions override database connection options
 */
export async function execTypeormCommand(
    connection: Connection,
    command: TypeormCommands,
    args: string = '',
    commandOptions?: TypeormCommandOptions,
    connectionOptions?: ConnectionOptions,
) {
    const options = connectionOptions || connection.options;

    const configName = 'export_ormconfig.json';
    const configPath = `${process.cwd()}/${configName}`;

    // Create temp database config file for typeorm cli
    await writeFile(configPath, JSON.stringify(options));

    // Safety close current database connection
    await connection.close();

    // Execute cli command
    const executor = commandOptions?.useTypescript ? 'ts-node ./node_modules/typeorm/cli.js' : 'typeorm';
    const { stdout, stderr } = await exec(`${executor} ${command} ${args} -f ${configName}`);

    // Log result
    if (stdout) {
        Logger.verbose(stdout);
    }
    if (stderr) {
        Logger.error(stderr);
    }

    // Delete temp database config file
    await unlink(configPath);
}
