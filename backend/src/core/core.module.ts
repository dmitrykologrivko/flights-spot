import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import {
    DEVELOPMENT_ENVIRONMENT,
    PRODUCTION_ENVIRONMENT,
} from './constants/enviroment.constants';
import {
    PropertyConfigModule,
    PropertyConfigModuleOptions,
    PropertyConfigFactory,
} from './config';
import {
    DatabaseModule,
    DatabaseModuleOptions,
    DEFAULT_CONNECTION_NAME,
} from './database';
import { ServerModule } from './server';
import { ManagementModule } from './management';
import { UtilsModule } from './utils';
import {
    isDefined,
    isUndefined,
    isNotEmpty,
} from './utils/precondition.utils';
import coreConfig from './core.config';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: PropertyConfigModuleOptions | PropertyConfigFactory[];
    database?: {
        useConfigFile?: boolean;
        options?: DatabaseModuleOptions | DatabaseModuleOptions[];
        connections?: string[];
    };
}

@Module({
    imports: [
        PropertyConfigModule.forFeature(coreConfig),
        ServerModule,
        ManagementModule,
        UtilsModule,
    ],
    exports: [PropertyConfigModule],
})
export class CoreModule {

    static forRoot(options: CoreModuleOptions = {}): DynamicModule {
        const imports = options.imports || [];

        this.connectConfig(imports, options);
        this.connectDatabase(imports, options);

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectConfig(imports: any[], options: CoreModuleOptions) {
        const defaultOptions = {
            isGlobal: true,
            ignoreEnvFile: process.env.NODE_ENV === PRODUCTION_ENVIRONMENT,
            envFilePath: `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`,
        };

        if (isUndefined(options.config)) {
            imports.push(PropertyConfigModule.forRoot(defaultOptions));
            return;
        }

        if (Array.isArray(options.config)) {
            imports.push(PropertyConfigModule.forRoot({
                ...defaultOptions,
                load: options.config,
            }));
            return;
        }

        imports.push(PropertyConfigModule.forRoot(options.config));
    }

    private static connectDatabase(imports: any[], options: CoreModuleOptions) {
        if (isDefined(options.database) && options.database.useConfigFile) {
            imports.push(DatabaseModule.withConfigFile());
            return;
        }

        if (isDefined(options.database) && isDefined(options.database.options)) {
            if (Array.isArray(options.database.options)) {
                for (const currentOptions of options.database.options) {
                    imports.push(DatabaseModule.withOptions(currentOptions));
                }
            } else {
                imports.push(DatabaseModule.withOptions(options.database.options as DatabaseModuleOptions));
            }
            return;
        }

        const connections = isDefined(options.database) && isNotEmpty(options.database.connections)
            ? options.database.connections
            : [DEFAULT_CONNECTION_NAME];

        for (const connection of connections) {
            imports.push(DatabaseModule.withConfig(connection));
        }
    }
}
