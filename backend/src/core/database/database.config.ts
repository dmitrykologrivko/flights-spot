export default () => ({
    databases: [{
        type: 'sqlite',
        database: 'database',
        entities: [
            'src/**/*.entity{.ts}',
            'dist/**/*.entity{.js}',
        ],
        synchronize: false,
        migrations: [
            'src/migrations/*{.ts}',
            'dist/migrations/*{.js}',
        ],
        cli: {
            migrationsDir: `src/migrations`,
        },
    }],
});
