import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { parsePostgresURL } from './database.utils';

export const DatabaseModule = TypeOrmModule.forRootAsync({
    imports: [ConfigService],
    useFactory: (config: ConfigService) => {
        const databaseConfig = parsePostgresURL(config.getDatabaseUrl());

        return {
            type: 'postgres',
            host: databaseConfig.host,
            port: databaseConfig.port,
            username: databaseConfig.username,
            password: databaseConfig.password,
            database: databaseConfig.database,
            entities: [],
            synchronize: true,
        };
    },
    inject: [ConfigService],
});
