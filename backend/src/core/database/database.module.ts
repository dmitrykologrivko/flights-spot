import { Module, DynamicModule } from '@nestjs/common';
import {
    TypeOrmModule,
    TypeOrmModuleOptions,
    TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { PropertyConfigService } from '../config/property-config/property-config.service';
import {
    DEFAULT_CONNECTION_NAME,
    ENTITY_GLOB_PATTERN,
    MIGRATIONS_GLOB_PATTERN,
} from './database.constants';
import { DATABASES_PROPERTY } from './database.properties';
import { MigrationsCommand } from './migrations.command';
import { EntityMetadataStorage } from './entity-metadata-storage.service';
import { EntityModuleOptions, DatabaseConnection } from './database.interfaces';
import databaseConfig from './database.config';

export type DatabaseModuleOptions = TypeOrmModuleOptions;
export type DatabaseModuleAsyncOptions = TypeOrmModuleAsyncOptions;

@Module({
    imports: [ConfigModule.forFeature(databaseConfig)],
    providers: [
        PropertyConfigService,
        EntityMetadataStorage,
        MigrationsCommand,
    ],
})
export class DatabaseModule {

    static withOptions(options: DatabaseModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRoot(options)],
            exports: [TypeOrmModule],
        };
    }

    static withOptionsAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(options)],
            exports: [TypeOrmModule],
        };
    }

    static withConfigFile(): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRoot()],
            exports: [TypeOrmModule],
        };
    }

    static withConfig(connection: string = DEFAULT_CONNECTION_NAME): DynamicModule {
        const asyncOptions: TypeOrmModuleAsyncOptions = {
            imports: [PropertyConfigService],
            useFactory: (config: PropertyConfigService) => {
                const databaseOptions = config.get(DATABASES_PROPERTY);

                for (const options of databaseOptions) {
                    if (!options.name && connection === DEFAULT_CONNECTION_NAME) {
                        return this.extendDatabaseOptions(connection, options);
                    }

                    if (options.name === connection) {
                        return this.extendDatabaseOptions(connection, options);
                    }
                }

                throw new Error(`${connection} database config is not defined`);
            },
            inject: [PropertyConfigService],
        };

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(asyncOptions)],
            exports: [TypeOrmModule],
        };
    }

    static withEntities(
        entities: Function[] = [],
        moduleOptions?: EntityModuleOptions,
        connection: DatabaseConnection = DEFAULT_CONNECTION_NAME,
    ): DynamicModule {
        if (moduleOptions) {
            this.extendEntityModuleOptions(moduleOptions);
            EntityMetadataStorage.addEntityModuleOptions(moduleOptions);
        }

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forFeature(entities, moduleOptions?.connection || connection)],
            exports: [TypeOrmModule],
        };
    }

    static withEntityModuleOptions(moduleOptions: EntityModuleOptions): DynamicModule {
        this.extendEntityModuleOptions(moduleOptions);
        EntityMetadataStorage.addEntityModuleOptions(moduleOptions);

        return { module: DatabaseModule };
    }

    private static extendDatabaseOptions(connection: string, databaseOptions: TypeOrmModuleOptions) {
        const entityModuleOptions = EntityMetadataStorage.getEntityModuleOptionsByConnection(connection);

        if (!entityModuleOptions) {
            return databaseOptions;
        }

        const entities = databaseOptions.entities || [];
        const migrations = databaseOptions.migrations || [];

        for (const options of entityModuleOptions) {
            if (options.entitiesPath) {
                entities.push(options.entitiesPath);
            }

            if (options.migrationsPath) {
                migrations.push(options.migrationsPath);
            }
        }

        return { ...databaseOptions, entities, migrations };
    }

    private static extendEntityModuleOptions(options: EntityModuleOptions) {
        if (!options.connection) {
            options.connection = DEFAULT_CONNECTION_NAME;
        }

        if (options.modulePath && !options.entitiesPath) {
            options.entitiesPath = `${options.modulePath}${ENTITY_GLOB_PATTERN}`;
        }

        if (options.modulePath && !options.migrationsPath) {
            options.migrationsPath = `${options.modulePath}${MIGRATIONS_GLOB_PATTERN}`;
        }
    }
}
