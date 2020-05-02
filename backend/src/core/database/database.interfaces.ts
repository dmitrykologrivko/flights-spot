import { Connection, ConnectionOptions } from 'typeorm';

export type DatabaseConnection = Connection | ConnectionOptions | string;

export interface EntityModuleOptions {
    modulePath?: string;
    entitiesPath?: string;
    migrationsPath?: string;
    connection?: DatabaseConnection;
}
