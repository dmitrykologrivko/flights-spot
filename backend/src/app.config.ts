export default () => ({
    database: {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [],
        synchronize: true,
    },
});
