import * as bcrypt from 'bcrypt';
import { User, Group, Permission } from '../../entities';
import {
    expectHasPermission,
    expectHasNoPermission,
    expectPermissionsCount,
    exceptGroupsCount,
    exceptHasGroup,
} from '../expect.utils';

describe('UserEntity', () => {
    const SALT_ROUNDS = 10;
    const PASSWORD = 'sfs3opjk*fgsg';

    let hashedPassword: string;

    let user: User;
    let group: Group;
    let readPermission: Permission;
    let writePermission: Permission;
    let deletePermission: Permission;

    beforeAll(async () => {
        hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
    });

    beforeEach (() => {
        readPermission = new Permission();
        readPermission.name = 'Read Permission';
        readPermission.codename = 'read';

        writePermission = new Permission();
        writePermission.name = 'Write Permission';
        writePermission.codename = 'write';

        deletePermission = new Permission();
        deletePermission.name = 'Delete Permission';
        deletePermission.codename = 'delete';

        group = new Group();
        group.id = 1;
        group.name = 'Managers Group';
        group.permissions = [readPermission];

        user = new User();
        user.username = 'happy_user';
        user.password = hashedPassword;
        user.firstName = 'John';
        user.lastName = 'Smith';
        user.email = 'happy.user@email.com';
        user.groups = [group];
        user.permissions = [writePermission];
    });

    describe('#getFullName()', () => {
        it('should return full name', () => {
            expect(user.getFullName()).toBe(`${user.firstName} ${user.lastName}`);
        });
    });

    describe('#getShortName()', () => {
        it('should return short name', () => {
            expect(user.getShortName()).toBe(user.firstName);
        });
    });

    describe('#setPassword()', () => {
        it('should set hashed password', async () => {
            user.password = null;

            await user.setPassword(PASSWORD, SALT_ROUNDS);
            const isMatch = await bcrypt.compare(PASSWORD, user.password);

            expect(isMatch).toBe(true);
        });
    });

    describe('#comparePassword()', () => {
        it('when password matches should return true', async () => {
            const result = await user.comparePassword(PASSWORD);
            expect(result).toBe(true);
        });

        it('when password does not match should return false', async () => {
            const result = await user.comparePassword('some-password');
            expect(result).toBe(false);
        });
    });

    describe('#hasPermission()', () => {
        it('when active superuser has no permission should return true', () => {
            user.isActive = true;
            user.isSuperuser = true;

            // Make sure that user and group have no permission
            expectHasNoPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);

            expect(user.hasPermission(deletePermission.codename)).toBe(true);
        });

        it('when user has no permission should return false', () => {
            // Make sure that user and group have no permission
            expectHasNoPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);

            expect(user.hasPermission(deletePermission.codename)).toBe(false);
        });

        it('when user has permission should return true', () => {
            // Make sure that user has permission
            expectHasPermission(writePermission, user);
            // Make sure that group has no permission
            expectHasNoPermission(writePermission, group);

            expect(user.hasPermission(writePermission.codename)).toBe(true);
        });

        it('when user has no permission and group has it should return true', () => {
            // Make sure that group has permission
            expectHasPermission(readPermission, group);
            // Make sure that user has no permission
            expectHasNoPermission(readPermission, user);

            expect(user.hasPermission(readPermission.codename)).toBe(true);
        });
    });

    describe('#assignPermission()', () => {
        it('should assign new permission', () => {
            expectInitialPermissions();

            user.assignPermission(deletePermission);

            expectPermissionsCount(2, user);
            expectPermissionsCount(1, group);
            expectHasPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);
        });

        it('when permission already assigned should not duplicate', () => {
            expectInitialPermissions();

            user.assignPermission(writePermission);

            expectInitialPermissions();
        });
    });

    describe('#refusePermission()', () => {
        it('should refuse permission', () => {
            expectInitialPermissions();

            user.refusePermission(writePermission.codename);

            expectPermissionsCount(0, user);
            expectPermissionsCount(1, group);
            expectHasNoPermission(writePermission, user);
            expectHasPermission(readPermission, group);
        });

        it('when permission is not assigned should not modify existing permissions', () => {
            expectInitialPermissions();

            user.refusePermission('delete');

            expectInitialPermissions();
        });
    });

    describe('#setGroup()', () => {
        it('should set new group', () => {
            exceptInitialGroups();

            const newGroup = new Group();
            newGroup.id = 2;
            newGroup.name = 'Sales Group';

            user.setGroup(newGroup);

            exceptGroupsCount(2, user);
            exceptHasGroup(newGroup, user);
        });

        it('when group already set should not duplicate', () => {
            exceptInitialGroups();

            user.setGroup(group);

            exceptInitialGroups();
        });
    });

    describe('#unsetGroup()', () => {
        it('should unset group', () => {
            exceptInitialGroups();

            user.unsetGroup(group);

            exceptGroupsCount(0, user);
        });

        it('when group is not set should not modify existing groups', () => {
            exceptInitialGroups();

            const newGroup = new Group();
            newGroup.id = 2;
            newGroup.name = 'Sales Group';

            user.unsetGroup(newGroup);

            exceptInitialGroups();
        });
    });

    const expectInitialPermissions = () => {
        expectPermissionsCount(1, user);
        expectPermissionsCount(1, group);
        expectHasPermission(writePermission, user);
        expectHasPermission(readPermission, group);
    };

    const exceptInitialGroups = () => {
        exceptGroupsCount(1, user);
        exceptHasGroup(group, user);
    };
});
