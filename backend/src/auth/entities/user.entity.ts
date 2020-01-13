import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@core/entities';
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

    /**
     * Returns full name (first and last name) of user
     * @returns {string}
     */
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Returns short name (first name) of user
     * @returns {string}
     */
    getShortName() {
        return this.firstName;
    }

    /**
     * Sets password hash from plain password
     * @param {string} password Plain password
     * @param saltRounds {number} Salt Rounds
     * @returns {Promise}
     */
    async setPassword(password: string, saltRounds: number) {
        this.password = await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares plain password with existing user`s password hash
     * @param password {string} Plain password
     * @returns {Promise}
     */
    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }

    /**
     * Checks if user or one of user`s group has permission.
     * If user is active superuser always returns true.
     * @param {string} codename Permission codename
     * @returns {boolean}
     */
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

    /**
     * Assigns permission to user
     * @param permission {Permission}
     */
    assignPermission(permission: Permission) {
        if (!this.findPermission(permission.codename, this.permissions)) {
            this.permissions.push(permission);
        }
    }

    /**
     * Refuses permission for user
     * @param codename {string} Permission codename
     */
    refusePermission(codename: string) {
        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }

    /**
     * Sets group to user
     * @param group {Group}
     */
    setGroup(group: Group) {
        if (!this.findGroup(group)) {
            this.groups.push(group);
        }
    }

    /**
     * Unset group for user
     * @param group {Group}
     */
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
