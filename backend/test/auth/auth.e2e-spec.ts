import * as request from 'supertest';
import { Repository } from 'typeorm';
import { bootstrapTestingApplication } from '@core/testing';
import { User } from '@auth/entities';
import { UserFactory } from '@auth/test/factories/user.factory';
import { AppModule } from '@app/app.module';
import unauthorizedResponse from '../common/responses/unauthorized.response';

describe('JwtAuthController (e2e)', () => {
    let app;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        const bootstrapper = await bootstrapTestingApplication({ module: AppModule });
        app = bootstrapper.container;
        await bootstrapper.init();

        userRepository = app.get('UserRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await userRepository.clear();
    });

    describe('/api/auth/login (POST)', () => {
        it('when user not exist should return unauthorized error', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when user is inactive should return unauthorized error', async () => {
            const user = await UserFactory.makeUser();
            user.deactivateUser();
            await userRepository.save(user);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when wrong password is provided should return unauthorized error', async () => {
            const user = await UserFactory.makeUser();
            await userRepository.save(user);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: 'some-wrong-password',
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when username and password are correct should return access token', async () => {
            const user = await UserFactory.makeUser();
            await userRepository.save(user);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(201)
                .then(res => {
                    expect(res.body.accessToken).toBeDefined();
                });
        });
    });
});
