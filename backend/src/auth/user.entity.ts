import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@common/entities';
import { Permission } from './permission.entity';
import { Group } from './group.entity';

@Entity()
export class User extends BaseEntity {

    @Column({ length: 150, unique: true })
    username: string;

    @Column({ length: 128 })
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
        // Active admin users have all permissions
        if (this.isActive && this.isAdmin) {
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
        this.permissions.filter(permission => permission.codename !== codename);
    }

    private findPermission(codename: string, permissions: Permission[]) {
        return permissions.find(permission => permission.codename === codename);
    }
}
