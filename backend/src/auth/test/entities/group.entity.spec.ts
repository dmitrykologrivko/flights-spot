import { Group, Permission } from '../../entities';
import {
    expectHasPermission,
    expectHasNoPermission,
    expectPermissionsCount,
} from '../expect.utils';

describe('GroupEntity', () => {
    let group: Group;
    let readPermission: Permission;
    let writePermission: Permission;

    beforeEach(() => {
        readPermission = new Permission();
        readPermission.name = 'Read Permission';
        readPermission.codename = 'read';

        writePermission = new Permission();
        writePermission.name = 'Write Permission';
        writePermission.codename = 'write';

        group = new Group();
        group.name = 'Managers Group';
        group.permissions = [readPermission, writePermission];
    });

    describe('#hasPermission()', () => {
        it('when group has permission should return true', () => {
             expect(group.hasPermission(readPermission.codename)).toBe(true);
        });

        it('when groups has no permission should return false', () => {
            expect(group.hasPermission('write_users')).toBe(false);
        });
    });

    describe('#setPermission()', () => {
        it('should set new permission', () => {
            const deletePermission = new Permission();
            deletePermission.name = 'Delete Permission';
            deletePermission.codename = 'delete';

            expectInitialPermissions();

            group.setPermission(deletePermission);

            expectPermissionsCount(3, group);
            expectHasPermission(deletePermission, group);
        });

        it('when permission already set should not duplicate', () => {
            expectInitialPermissions();

            group.setPermission(writePermission);

            expectInitialPermissions();
        });
    });

    describe('#popPermission()', () => {
        it('should pop permission', () => {
            expectInitialPermissions();

            group.popPermission(writePermission.codename);

            expectPermissionsCount(1, group);
            expectHasPermission(readPermission, group);
            expectHasNoPermission(writePermission, group);
        });

        it('when permission is not set should not modify existing permissions', () => {
            expectInitialPermissions();

            group.popPermission('write_users');

            expectInitialPermissions();
        });
    });

    const expectInitialPermissions = () => {
        expectPermissionsCount(2, group);
        expectHasPermission(readPermission, group);
        expectHasPermission(writePermission, group);
    };
});
