import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces/config-module-options.interface';
import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';
import { PropertyConfigService } from './property-config.service';

export type PropertyConfigModuleOptions = ConfigModuleOptions;
export type PropertyConfigFactory = ConfigFactory;

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PropertyConfigService],
    exports: [ConfigModule, PropertyConfigService],
})
export class PropertyConfigModule {

    static forRoot(options: PropertyConfigModuleOptions): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [ConfigModule.forRoot(options)],
        };
    }

    static forFeature(config: PropertyConfigFactory): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [ConfigModule.forFeature(config)],
        };
    }
}
