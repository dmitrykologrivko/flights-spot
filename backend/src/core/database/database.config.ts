const migrationsSourceDir = process.env.MIGRATIONS_SOURCE_DIR || 'src';
const migrationsOutDir = process.env.MIGRATIONS_OUT_DIR || 'dist';

export default () => ({
    databases: [{
        type: 'sqlite',
        database: 'database',
        synchronize: false,
        migrations: [`${migrationsOutDir}/migrations/*{.ts,.js}`],
        cli: {
            migrationsDir: `${migrationsSourceDir}/migrations/`,
        },
    }],
    migrations: {
        useTypescript: Boolean(process.env.MIGRATIONS_USE_TYPESCRIPT) || false,
        lookupSourceDir: Boolean(process.env.MIGRATIONS_LOOKUP_SOURCE_DIR) || false,
        sourceDir: migrationsSourceDir,
        outDir: migrationsOutDir,
    },
});
