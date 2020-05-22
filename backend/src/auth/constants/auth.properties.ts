import { Property } from '@core/config';

export const AUTH_SALT_ROUNDS_PROPERTY: Property<number> = { path: 'auth.saltRounds' };
export const AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY: Property<string> = { path: 'auth.password.resetTimeout' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
