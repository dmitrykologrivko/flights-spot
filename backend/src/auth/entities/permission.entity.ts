import { Column } from 'typeorm';
import { Entity, BaseEntity } from '@core/entities';

@Entity()
export class Permission extends BaseEntity {

    @Column({ length: 255 })
    name: string;

    @Column({ length: 100, unique: true })
    codename: string;

}
