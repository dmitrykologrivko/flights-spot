import { Module, DynamicModule } from '@nestjs/common';
import {
    TypeOrmModule,
    TypeOrmModuleOptions,
    TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';
import { isEmpty } from '../utils/precondition.utils';
import { PropertyConfigModule } from '../config/property-config.module';
import { PropertyConfigService } from '../config/property-config.service';
import { DEFAULT_CONNECTION_NAME } from './database.constants';
import { DATABASES_PROPERTY } from './database-property.constants';
import { MigrationsCommand } from './migrations.command';
import databaseConfig from './database.config';

@Module({
    imports: [PropertyConfigModule.forFeature(databaseConfig)],
    providers: [MigrationsCommand],
})
export class DatabaseModule {

    static withOptions(options?: TypeOrmModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRoot(options)],
        };
    }

    static withOptionsAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(options)],
        };
    }

    static withConfig(connection: string = DEFAULT_CONNECTION_NAME): DynamicModule {
        const asyncOptions: TypeOrmModuleAsyncOptions = {
            imports: [PropertyConfigService],
            useFactory: (config: PropertyConfigService) => {
                const options = config.get(DATABASES_PROPERTY);

                for (const option of options) {
                    if (isEmpty(option.name) && connection === DEFAULT_CONNECTION_NAME) {
                        return option;
                    }

                    if (option.name === connection) {
                        return option;
                    }
                }

                throw new Error(`${connection} database config is not defined`);
            },
            inject: [PropertyConfigService],
        };

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(asyncOptions)],
        };
    }
}
