import * as request from 'supertest';
import { Repository } from 'typeorm';
import { bootstrapTestingApplication } from '@core/testing';
import { User } from '@auth/entities';
import { UserFactory } from '@auth/test/factories/user.factory';
import { AppModule } from '@app/app.module';

describe('JwtAuthController (e2e)', () => {
    const RESPONSE_UNAUTHORIZED = {
        statusCode: 401,
        error: 'Unauthorized',
    };

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
        it('when user not exist should return 401 error', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .expect(401)
                .expect(RESPONSE_UNAUTHORIZED);
        });

        it('when user is inactive should return 401 error', async () => {
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
                .expect(RESPONSE_UNAUTHORIZED);
        });

        it('when wrong password is provided should return 401 error', async () => {
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
                .expect(RESPONSE_UNAUTHORIZED);
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
