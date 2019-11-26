import * as dotenv from 'dotenv';
import * as fs from 'fs';

export const PRODUCTION_ENVIRONMENT = 'production';
export const TEST_ENVIRONMENT = 'test';
export const DEVELOPMENT_ENVIRONMENT = 'development';

export const PORT = 'PORT';
export const DATABASE_URL = 'DATABASE_URL';

export class ConfigService {
    private readonly envConfig: Record<string, string>;

    constructor(filePath: string) {
        if (fs.existsSync(filePath)) {
            this.envConfig = dotenv.parse(fs.readFileSync(filePath));
        } else {
            this.envConfig = {};
        }
    }

    get(key: string): string {
        return process.env[key] ? process.env[key] : this.envConfig[key];
    }

    getPort(): number {
        return Number(this.get(PORT)) || 8000;
    }

    getDatabaseUrl(): string {
        return this.get(DATABASE_URL);
    }
}
