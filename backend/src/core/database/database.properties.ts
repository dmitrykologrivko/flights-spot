import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Property } from '../config/property-config/property.interface';
import { MigrationsCommandOptions } from './typeorm.utils';

export const DATABASES_PROPERTY: Property<TypeOrmModuleOptions[]> = { path: 'databases' };
export const MIGRATIONS_PROPERTY: Property<MigrationsCommandOptions> = { path: 'migrations' };
