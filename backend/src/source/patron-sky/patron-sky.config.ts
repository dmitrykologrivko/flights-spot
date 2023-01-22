export default () => ({
    patronsky: {
        host: process.env.PATRON_SKY_HOST || '',
        token: process.env.PATRON_SKY_TOKEN || ''
    },
});
