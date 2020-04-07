export default () => ({
    auth: {
        saltRounds: Number(process.env.AUTH_SALT_ROUNDS) || 10,
        jwt: {
          secret: process.env.AUTH_JWT_SECRET,
          expiresIn: process.env.AUTH_JWT_EXPIRES_IN,
        },
    },
});
