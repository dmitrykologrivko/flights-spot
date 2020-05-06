import { Connection, ConnectionOptions } from 'typeorm';

export type DatabaseConnection = Connection | ConnectionOptions | string;

export interface EntityOptions {

    /**
     * Entity class (constructor) objects
     */
    entities?: Function[];

    /**
     * Migrations class (constructor) objects
     */
    migrations?: Function[];

    /**
     * Path to entities
     */
    entitiesPath?: string;

    /**
     * Path to migrations
     */
    migrationsPath?: string;

    /**
     * Database connection
     */
    connection?: DatabaseConnection;
}
