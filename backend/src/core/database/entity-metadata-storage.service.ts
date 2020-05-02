import { Injectable } from '@nestjs/common';
import { DatabaseConnection, EntityModuleOptions } from './database.interfaces';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Injectable()
export class EntityMetadataStorage {

    private static readonly storage = new Map<string, EntityModuleOptions[]>();

    static addEntityModuleOptions(options: EntityModuleOptions) {
        const token = this.getConnectionToken(options.connection || DEFAULT_CONNECTION_NAME);
        let collection = this.storage.get(token);

        if (!collection) {
            collection = [];
        }

        collection.push(options);

        this.storage.set(token, collection);
    }

    static getEntityModuleOptionsByConnection(connection: DatabaseConnection) {
        const token = this.getConnectionToken(connection);
        return this.storage.get(token);
    }

    static getConnectionToken(connection: DatabaseConnection) {
        return typeof connection === 'string' ? connection : connection.name;
    }

    getEntityModuleOptionsByConnection(connection: DatabaseConnection) {
        return EntityMetadataStorage.getEntityModuleOptionsByConnection(connection);
    }
}
