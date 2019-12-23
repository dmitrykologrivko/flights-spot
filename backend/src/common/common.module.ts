import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PropertyConfigModule } from './config';
import { DatabaseModule } from './database';
import commonConfig from './common.config';

@Module({
    imports: [
        ConfigModule.forFeature(commonConfig),
        PropertyConfigModule,
        DatabaseModule,
    ],
    //exports: [PropertyConfigModule],
})
export class CommonModule {}
