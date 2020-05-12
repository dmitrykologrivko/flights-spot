import {
    isProductionEnvironment,
    isTestEnvironment,
} from '@core/environment';

export default () => {
    const appConfig = {};

    const productionAppConfig = Object.assign({
        databases: [{
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            migrations: [__dirname + '/migrations/[!index]*{.ts,.js}'],
            cli: {
                migrationsDir: 'src/migrations',
            },
        }],
    }, appConfig);

    const testAppConfig = Object.assign({
        databases: [{
            type: 'sqlite',
            database: 'test_database',
            autoLoadEntities: true,
            synchronize: true,
        }],
    }, appConfig);

    if (isProductionEnvironment()) {
        return productionAppConfig;
    }

    if (isTestEnvironment()) {
        return testAppConfig;
    }

    return appConfig;
};
