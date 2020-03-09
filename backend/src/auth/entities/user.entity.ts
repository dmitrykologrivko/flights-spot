import * as bcrypt from 'bcrypt';
import { Column, JoinTable, ManyToMany } from 'typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { Validate, ValidationResult } from '@core/utils';
import { ValidationException } from '@core/exceptions';
import { Entity, BaseEntity } from '@core/entities';
import { Permission } from './permission.entity';
import { Group } from './group.entity';

export const USERNAME_MAX_LENGTH = 150;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const FIRST_NAME_MAX_LENGTH = 30;
export const LAST_NAME_MAX_LENGTH = 150;

@Entity()
export class User extends BaseEntity {

    @Column({
        name: 'username',
        length: USERNAME_MAX_LENGTH,
        unique: true,
    })
    private _username: string;

    @Column({
        name: 'password',
        length: PASSWORD_MAX_LENGTH,
    })
    private _password: string;

    @Column({
        name: 'email',
        length: EMAIL_MAX_LENGTH,
        unique: true,
    })
    private _email: string;

    @Column({
        name: 'firstName',
        length: FIRST_NAME_MAX_LENGTH,
    })
    private _firstName: string;

    @Column({
        name: 'lastName',
        length: LAST_NAME_MAX_LENGTH,
    })
    private _lastName: string;

    @Column({
        name: 'isActive',
        default: true,
    })
    private _isActive: boolean;

    @Column({
        name: 'isAdmin',
        default: false,
    })
    private _isAdmin: boolean;

    @Column({
        name: 'isSuperuser',
        default: false,
    })
    private _isSuperuser: boolean;

    @ManyToMany(type => Group)
    @JoinTable()
    private _groups: Group[];

    @ManyToMany(type => Permission)
    @JoinTable()
    private _permissions: Permission[];

    private constructor(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        isActive?: boolean,
        isAdmin?: boolean,
        isSuperuser?: boolean,
    ) {
        super();

        this._username = username;
        this._email = email;
        this._firstName = firstName;
        this._lastName = lastName;
        this._isActive = isActive;
        this._isAdmin = isAdmin;
        this._isSuperuser = isSuperuser;
    }

    /**
     * Creates new user instance
     * @param username {string}
     * @param password {string}
     * @param email {string}
     * @param firstName {string}
     * @param lastName {string}
     * @param isActive {boolean}
     * @param isAdmin {boolean}
     * @param isSuperuser {boolean}
     * @param saltRounds {number}
     * @returns {Promise}
     */
    static async create(
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string,
        isActive?: boolean,
        isAdmin?: boolean,
        isSuperuser?: boolean,
        saltRounds: number = 10,
    ): Promise<Result<User, ValidationException[]>> {
        const validateResult = Validate.withResults([
            User.validateUsername(username),
            User.validatePassword(password),
            User.validateEmail(email),
            User.validateFirstName(firstName),
            User.validateLastName(lastName),
        ]);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const user = new User(
            username,
            email,
            firstName,
            lastName,
            isActive,
            isAdmin,
            isSuperuser,
        );

        await user.setPassword(password, saltRounds);

        return Ok(user);
    }

    get username(): string {
        return this._username;
    }

    get password(): string {
        return this._password;
    }

    get email(): string {
        return this._email;
    }

    get firstName(): string {
        return this._firstName;
    }

    get lastName(): string {
        return this._lastName;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isAdmin(): boolean {
        return this._isAdmin;
    }

    get isSuperuser(): boolean {
        return this._isSuperuser;
    }

    get groups(): Group[] {
        return this._groups;
    }

    get permissions(): Permission[] {
        return this._permissions;
    }

    /**
     * Changes current username
     * @param username {string} new username
     * @returns {Result}
     */
    changeUsername(username: string): Result<void, ValidationException> {
        const validateResult = User.validateUsername(username);

        if (validateResult.is_err()) {
            return validateResult;
        }

        this._username = username;
    }

    /**
     * Changes current email
     * @param email new email
     * @returns {Result}
     */
    changeEmail(email: string): Result<void, ValidationException> {
        const validateResult = User.validateEmail(email);

        if (validateResult.is_err()) {
            return validateResult;
        }

        this._email = email;
    }

    /**
     * Changes current first and last name
     * @param firstName new first name
     * @param lastName new last name
     * @returns {Result}
     */
    changeName(firstName: string, lastName: string): Result<void, ValidationException[]> {
        const validateResult = Validate.withResults([
            User.validateFirstName(firstName),
            User.validateLastName(lastName),
        ]);

        if (validateResult.is_err()) {
            return validateResult;
        }

        this._firstName = firstName;
        this._lastName = lastName;
    }

    /**
     * Activates current user
     */
    activateUser() {
        this._isActive = true;
    }

    /**
     * Deactivates current user
     */
    deactivateUser() {
        this._isActive = false;
    }

    /**
     * Sets current user as an admin user
     */
    setAdminAccess() {
        this._isAdmin = true;
    }

    /**
     * Sets current user as not admin user
     */
    denyAdminAccess() {
        this._isAdmin = false;
    }

    /**
     * Sets current user as a super user
     */
    setSuperuserAccess() {
        this._isSuperuser = true;
    }

    /**
     * Sets current user as not admin user
     */
    denySuperUserAccess() {
        this._isSuperuser = false;
    }

    /**
     * Returns full name (first and last name) of user
     * @returns {string}
     */
    getFullName() {
        return `${this._firstName} ${this._lastName}`;
    }

    /**
     * Returns short name (first name) of user
     * @returns {string}
     */
    getShortName() {
        return this._firstName;
    }

    /**
     * Sets password hash from plain password
     * @param {string} password Plain password
     * @param saltRounds {number} Salt Rounds
     * @returns {Promise}
     */
    async setPassword(password: string, saltRounds: number): Promise<Result<void, ValidationException>> {
        const validateResult = User.validatePassword(password);

        if (validateResult.is_err()) {
            return validateResult;
        }

        this._password = await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares plain password with existing user`s password hash
     * @param password {string} Plain password
     * @returns {Promise}
     */
    async comparePassword(password: string) {
        return await bcrypt.compare(password, this._password);
    }

    /**
     * Checks if user or one of user`s group has permission.
     * If user is active superuser always returns true.
     * @param {string} codename Permission codename
     * @returns {boolean}
     */
    hasPermission(codename: string) {
        // Active superusers users have all permissions
        if (this._isActive && this._isSuperuser) {
            return true;
        }

        if (this.findPermission(codename, this._permissions)) {
            return true;
        }

        for (const group of this._groups) {
            if (group.hasPermission(codename)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Adds permission to user
     * @param permission {Permission}
     */
    addUserPermission(permission: Permission) {
        if (!this.findPermission(permission.codename, this._permissions)) {
            this._permissions.push(permission);
        }
    }

    /**
     * Removes permission from user
     * @param codename {string} Permission codename
     */
    removeUserPermission(codename: string) {
        this._permissions = this._permissions.filter(permission => permission.codename !== codename);
    }

    /**
     * Adds user to group
     * @param group {Group}
     */
    addToGroup(group: Group) {
        if (!this.findGroup(group)) {
            this._groups.push(group);
        }
    }

    /**
     * Removes user from group
     * @param group {Group}
     */
    removeFromGroup(group: Group) {
        this._groups = this._groups.filter(currentGroup => currentGroup.id !== group.id);
    }

    private static validateUsername(username: string): ValidationResult {
        return Validate.withProperty('username', username)
            .isNotEmpty()
            .maxLength(USERNAME_MAX_LENGTH)
            .isValid();
    }

    private static validatePassword(password: string): ValidationResult {
        return Validate.withProperty('password', password)
            .isNotEmpty()
            .minLength(PASSWORD_MIN_LENGTH)
            .maxLength(PASSWORD_MAX_LENGTH)
            .isValid();
    }

    private static validateEmail(email: string): ValidationResult {
        return Validate.withProperty('email', email)
            .isEmail()
            .maxLength(EMAIL_MAX_LENGTH)
            .isValid();
    }

    private static validateFirstName(firstName: string): ValidationResult {
        return Validate.withProperty('firstName', firstName)
            .isNotEmpty()
            .maxLength(FIRST_NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateLastName(lastName: string): ValidationResult {
        return Validate.withProperty('lastName', lastName)
            .isNotEmpty()
            .maxLength(LAST_NAME_MAX_LENGTH)
            .isValid();
    }

    private findPermission(codename: string, permissions: Permission[]) {
        return permissions.find(permission => permission.codename === codename);
    }

    private findGroup(group: Group) {
        return this._groups.find(currentGroup => currentGroup.id === group.id);
    }
}
