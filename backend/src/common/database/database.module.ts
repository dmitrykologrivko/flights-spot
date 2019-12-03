import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@common/config/config.service';
import { parsePostgresURL } from '@common/database/database.utils';

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
