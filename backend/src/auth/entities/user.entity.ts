import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@common/entities';
import { Permission } from './permission.entity';
import { Group } from './group.entity';

@Entity()
export class User extends BaseEntity {

    @Column({ length: 150, unique: true })
    username: string;

    @Column({ length: 128, select: false })
    password: string;

    @Column({ length: 254 })
    email: string;

    @Column({ length: 30 })
    firstName: string;

    @Column({ length: 150 })
    lastName: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ default: false })
    isSuperuser: boolean;

    @ManyToMany(type => Group)
    @JoinTable()
    groups: Group[];

    @ManyToMany(type => Permission)
    @JoinTable()
    permissions: Permission[];

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    getShortName() {
        return this.firstName;
    }

    async setPassword(password: string, saltRounds) {
        this.password = await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }

    hasPermission(codename: string) {
        // Active superusers users have all permissions
        if (this.isActive && this.isSuperuser) {
            return true;
        }

        if (this.findPermission(codename, this.permissions)) {
            return true;
        }

        for (const group of this.groups) {
            if (this.findPermission(codename, group.permissions)) {
                return true;
            }
        }

        return false;
    }

    assignPermission(permission: Permission) {
        if (!this.findPermission(permission.codename, this.permissions)) {
            this.permissions.push(permission);
        }
    }

    refusePermission(codename: string) {
        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }

    setGroup(group: Group) {
        if (!this.findGroup(group)) {
            this.groups.push(group);
        }
    }

    unsetGroup(group: Group) {
        this.groups = this.groups.filter(currentGroup => currentGroup.id !== group.id);
    }

    private findPermission(codename: string, permissions: Permission[]) {
        return permissions.find(permission => permission.codename === codename);
    }

    private findGroup(group: Group) {
        return this.groups.find(currentGroup => currentGroup.id === group.id);
    }
}
