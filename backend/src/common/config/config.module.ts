import { Global, Module } from '@nestjs/common';
import { ConfigService, DEVELOPMENT_ENVIRONMENT } from '@common/config/config.service';

@Global()
@Module({
    providers: [
        {
            provide: ConfigService,
            useValue: new ConfigService(`${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`),
        },
    ],
    exports: [
        ConfigService,
    ],
})
export class ConfigModule {}
