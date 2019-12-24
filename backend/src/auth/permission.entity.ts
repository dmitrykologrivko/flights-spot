import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@common/entities';

@Entity()
export class Permission extends BaseEntity {

    @Column({ length: 255 })
    name: string;

    @Column({ length: 100, unique: true })
    codename: string;

}
