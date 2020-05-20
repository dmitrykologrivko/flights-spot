import * as request from 'supertest';
import { bootstrapTestingApplication } from '@core/testing';
import { User } from '@auth/entities';
import { UserFactory } from '@auth/test/factories/user.factory';
import { AuthTestUtils } from '@auth/test/auth-test.utils';
import { AppModule } from '@app/app.module';
import unauthorizedResponse from '../common/responses/unauthorized.response';
import changePasswordInvalidDataResponse from './responses/change-password-invalid-data.response';
import changePasswordWrongPasswordResponse from './responses/change-password-wrong-password.response';

describe('UserController (e2e)', () => {
    let app;
    let authTestUtils: AuthTestUtils;

    let user: User;
    let jwtAuthHeader: string;

    beforeAll(async () => {
        const bootstrapper = await bootstrapTestingApplication({ module: AppModule });
        app = bootstrapper.container;
        await bootstrapper.init();

        authTestUtils = new AuthTestUtils(app);

        user = await authTestUtils.makeAndSaveUser();
        jwtAuthHeader = await authTestUtils.getJwtAuthHeader(user);
    });

    afterAll(async () => {
        await authTestUtils.clearAllUsers();
        await app.close();
    });

    describe('/api/users/change-password (POST)', () => {
        it('when request is not authorized should return unauthorized error', async () => {
            return request(app.getHttpServer())
                .post('/api/users/change-password')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when request is invalid should return validation errors', async () => {
            return request(app.getHttpServer())
                .post('/api/users/change-password')
                .send({})
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(400)
                .expect(changePasswordInvalidDataResponse({ userId: user.id }));
        });

        it('when current password is wrong should return validation error', async () => {
            const req = {
                currentPassword: 'wrong-password',
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/users/change-password')
                .send(req)
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(400)
                .expect(changePasswordWrongPasswordResponse({ ...req, userId: user.id }));
        });

        it('when request is valid should return successful response', async () => {
            const req = {
                currentPassword: UserFactory.DEFAULT_PASSWORD,
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/users/change-password')
                .send(req)
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(201);
        });
    });
});
