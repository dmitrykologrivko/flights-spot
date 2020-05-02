import { isProductionEnvironment } from '@core/environment';

export default () => {
    const appConfig = {};

    const productionAppConfig = Object.assign({
        databases: [{
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
            cli: {
                migrationsDir: 'src/migrations',
            },
        }],
    }, appConfig);

    console.log(productionAppConfig)

    return isProductionEnvironment() ? productionAppConfig : appConfig;
};
