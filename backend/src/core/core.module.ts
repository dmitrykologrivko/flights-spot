import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ConfigModule } from '@nestjs/config';
import { PropertyConfigModule } from './config';
import { DatabaseModule, DEFAULT_CONNECTION_NAME } from './database';
import { ManagementModule } from './management';
import { UtilsModule } from './utils';
import { isDefined, isNotEmpty } from './utils/precondition.utils';
import coreConfig from './core.config';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    databases?: {
        connections?: string[];
        useDefaultConnection?: boolean;
    };
}

@Module({
    imports: [
        ConfigModule.forFeature(coreConfig),
        PropertyConfigModule,
        ManagementModule,
        UtilsModule,
    ],
    exports: [PropertyConfigModule],
})
export class CoreModule {

    static forRoot(options: CoreModuleOptions = {}): DynamicModule {
        const imports = options.imports || [];

        this.connectDatabase(imports, options);

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectDatabase(imports: any[], options: CoreModuleOptions) {
        const useDefaultConnection = isDefined(options.databases) && isDefined(options.databases.useDefaultConnection)
            ? options.databases.useDefaultConnection
            : true;
        const connections = isDefined(options.databases) && isNotEmpty(options.databases.connections)
            ? [ ...options.databases.connections.filter(connection => connection !== DEFAULT_CONNECTION_NAME) ]
            : [];

        if (useDefaultConnection) {
            connections.push(DEFAULT_CONNECTION_NAME);
        }

        for (const connection of connections) {
            imports.push(DatabaseModule.withConfig(connection));
        }
    }
}
