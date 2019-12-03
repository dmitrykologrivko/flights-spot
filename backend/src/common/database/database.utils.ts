import DatabaseConfig from '@common/database/database-config.interface';

export function parsePostgresURL(url: string = ''): DatabaseConfig {
    const PATTERN = /^postgres:\/\/(.*):(.*)@([a-zA-Z0-9.]+):([0-9]{1,5})\/([a-zA-Z0-9\-_]+)$/;

    if (!url.match(PATTERN)) {
        throw new Error('Provided URL does not match with Postgres URL pattern: ' +
            'postgres://YourUserName:YourPassword@YourHost:5432/YourDatabase');
    }

    return {
        username: url.match(PATTERN)[1],
        password: url.match(PATTERN)[2],
        host: url.match(PATTERN)[3],
        port: Number(url.match(PATTERN)[4]),
        database: url.match(PATTERN)[5],
    };
}
