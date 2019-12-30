import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@common/entities';
import { Permission } from './permission.entity';

@Entity()
export class Group extends BaseEntity {

    @Column({ length: 150 })
    name: string;

    @ManyToMany(type => Permission)
    @JoinTable()
    permissions: Permission[];

    hasPermission(codename: string) {
        return !!this.permissions.find(permission => permission.codename === codename);
    }

    setPermission(permission: Permission) {
        if (!this.hasPermission(permission.codename)) {
            this.permissions.push(permission);
        }
    }

    popPermission(codename: string) {
        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }
}
