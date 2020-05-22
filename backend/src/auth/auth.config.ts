export default () => ({
    auth: {
        saltRounds: Number(process.env.AUTH_SALT_ROUNDS) || 10,
        password: {
            resetTimeout: process.env.AUTH_PASSWORD_RESET_TIMEOUT || '24h',
        },
        jwt: {
          expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '24h',
        },
    },
});
