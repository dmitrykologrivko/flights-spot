import { ConnectionOptions as DatabaseConnectionOptions } from 'typeorm';
import { ConnectionOptions as ServerConnectionOptions } from '../server';
import { Property } from '../config';

export const DEBUG_PROPERTY: Property<boolean> = { path: 'debug', defaultValue: true };

export const DATABASE_PROPERTY: Property<DatabaseConnectionOptions> = { path: 'database' };

export const SERVER_PROPERTY: Property<ServerConnectionOptions> = { path: 'server' };
export const SERVER_PORT_PROPERTY: Property<number> = { path: 'server.port', defaultValue: 8000 };
