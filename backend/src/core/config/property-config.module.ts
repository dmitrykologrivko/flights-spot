import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces/config-module-options.interface';
import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';
import { PropertyConfigService } from './property-config.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PropertyConfigService],
    exports: [ConfigModule, PropertyConfigService],
})
export class PropertyConfigModule {

    static forRoot(options: ConfigModuleOptions): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [ConfigModule.forRoot(options)],
        };
    }

    static forFeature(config: ConfigFactory): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [ConfigModule.forFeature(config)],
        };
    }
}
