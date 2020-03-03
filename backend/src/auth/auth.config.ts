export default () => ({
    auth: {
        saltRounds: Number(process.env.AUTH_SALT_ROUNDS) || 10,
    },
});
