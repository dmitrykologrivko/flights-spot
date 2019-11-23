import * as dotenv from 'dotenv';
import * as fs from 'fs';

export const PORT = 'port';

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
}
