import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PropertyConfigService } from './property-config.service';

@Global()
@Module({
    imports: [ConfigService],
    providers: [PropertyConfigService],
    exports: [PropertyConfigService],
})
export class PropertyConfigModule {}
