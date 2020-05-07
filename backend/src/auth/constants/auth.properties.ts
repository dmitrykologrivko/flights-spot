import { Property } from '@core/config';

export const AUTH_SALT_ROUNDS_PROPERTY: Property<number> = { path: 'auth.saltRounds' };
export const AUTH_JWT_SECRET_PROPERTY: Property<string> = { path: 'auth.jwt.secret' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
