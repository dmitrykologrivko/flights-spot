import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PropertyConfigModule } from './config';
import { DatabaseModule } from './database';
import { ManagementModule } from './management';
import coreConfig from './core.config';

@Module({
    imports: [
        ConfigModule.forFeature(coreConfig),
        PropertyConfigModule,
        DatabaseModule,
        ManagementModule,
    ],
    exports: [PropertyConfigModule],
})
export class CoreModule {}