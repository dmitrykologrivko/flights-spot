import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions as ServerConnectionOptions } from '../server';
import { Property } from '../config';

export const DEBUG_PROPERTY: Property<boolean> = { path: 'debug', defaultValue: true };

export const DATABASES_PROPERTY: Property<TypeOrmModuleOptions[]> = {
    path: 'databases',
    defaultValue: [{
        type: 'sqlite',
        database: 'database',
        synchronize: true,
        autoLoadEntities: true,
    }],
};

export const SERVER_PROPERTY: Property<ServerConnectionOptions> = { path: 'server' };
export const SERVER_PORT_PROPERTY: Property<number> = { path: 'server.port', defaultValue: 8000 };
