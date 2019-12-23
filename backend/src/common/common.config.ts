export default () => ({
    debug: Boolean(process.env.DEBUG) || false,

    server: {
        port: Number(process.env.PORT) || 8000,
    },
});
