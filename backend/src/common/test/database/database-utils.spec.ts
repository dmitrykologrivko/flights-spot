import { parsePostgresURL } from '@common/database/database.utils';
import DatabaseConfig from '@common/database/database-config.interface';

describe('parsePostgresURL', () => {
    const ERROR_MESSAGE = 'Provided URL does not match with Postgres URL pattern: ' +
        'postgres://YourUserName:YourPassword@YourHost:5432/YourDatabase';

    it('when database url is empty should throw error', () => {
        expect(() => parsePostgresURL()).toThrow(ERROR_MESSAGE);
    });

    it('when database url is invalid should throw error', () => {
        const invalidURL = 'http://some_invalid_url.com';
        expect(() => parsePostgresURL(invalidURL)).toThrow(ERROR_MESSAGE);
    });

    it('when database url is valid should return database config', () => {
        const username = 'postgres';
        const password = '12345678';
        const host = 'localhost';
        const port = 5432;
        const database = 'test';
        const validURL = `postgres://${username}:${password}@${host}:${port}/${database}`;

        const databaseConfig: DatabaseConfig = {
            username,
            password,
            host,
            port,
            database,
        };

        expect(parsePostgresURL(validURL)).toStrictEqual(databaseConfig);
    });
});
