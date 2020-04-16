import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Property } from '../config/property.interface';

export const DATABASES_PROPERTY: Property<TypeOrmModuleOptions[]> = {
    path: 'databases',
    defaultValue: [{
        type: 'sqlite',
        database: 'database',
        synchronize: true,
        autoLoadEntities: true,
    }],
};
