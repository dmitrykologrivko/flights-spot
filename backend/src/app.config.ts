export default () => ({
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
});
