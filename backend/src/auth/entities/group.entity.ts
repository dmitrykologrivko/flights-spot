import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@core/entities';
import { Permission } from './permission.entity';

@Entity()
export class Group extends BaseEntity {

    @Column({ length: 150 })
    name: string;

    @ManyToMany(type => Permission)
    @JoinTable()
    permissions: Permission[];

    /**
     * Checks if group has permission
     * @param codename {string} Permission codename
     * @returns {boolean}
     */
    hasPermission(codename: string) {
        return !!this.permissions.find(permission => permission.codename === codename);
    }

    /**
     * Sets permission to group
     * @param permission {Permission}
     */
    setPermission(permission: Permission) {
        if (!this.hasPermission(permission.codename)) {
            this.permissions.push(permission);
        }
    }

    /**
     * Unset permission for group
     * @param codename {string} Permission codename
     */
    unsetPermission(codename: string) {
        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }
}
