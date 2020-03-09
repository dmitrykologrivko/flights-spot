import { Column, ManyToMany, JoinTable } from 'typeorm';
import { Result } from '@usefultools/monads';
import { Entity, BaseEntity } from '@core/entities';
import { Permission } from './permission.entity';
import { Validate } from '@core/utils';
import { ValidationException } from '@core/exceptions';

export const NAME_MAX_LENGTH = 150;

@Entity()
export class Group extends BaseEntity {

    @Column({
        name: 'name',
        length: NAME_MAX_LENGTH,
    })
    private readonly _name: string;

    @ManyToMany(type => Permission)
    @JoinTable()
    private _permissions: Permission[];

    private constructor(name: string) {
        super();
        this._name = name;
    }

    static create(name: string): Result<Group, ValidationException[]> {
        const validateResult = Validate.withResults([
            Group.validateName(name),
        ]);

        return validateResult.map(() => new Group(name));
    }

    get name(): string {
        return this._name;
    }

    get permissions(): Permission[] {
        return this._permissions;
    }

    /**
     * Checks if group has permission
     * @param codename {string} Permission codename
     * @returns {boolean}
     */
    hasPermission(codename: string) {
        return !!this._permissions.find(permission => permission.codename === codename);
    }

    /**
     * Sets permission to group
     * @param permission {Permission}
     */
    setPermission(permission: Permission) {
        if (!this.hasPermission(permission.codename)) {
            this._permissions.push(permission);
        }
    }

    /**
     * Removes permission for group
     * @param codename {string} Permission codename
     */
    removePermission(codename: string) {
        this._permissions = this._permissions.filter(permission => permission.codename !== codename);
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }
}
