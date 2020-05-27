import { Entity as TypeOrmEntity, EntityOptions as TypeOrmEntityOptions } from 'typeorm';

export function Entity(options?: TypeOrmEntityOptions) {
    return TypeOrmEntity(options);
}
