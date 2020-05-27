import { Entity as TypeOrmEntity, EntityOptions as TypeOrmEntityOptions } from 'typeorm';

export function ValueObject(options?: TypeOrmEntityOptions) {
    return TypeOrmEntity(options);
}
