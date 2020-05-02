import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces/config-module-options.interface';
import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';
import { PropertyConfigService } from './property-config.service';

export type PropertyConfigModuleOptions = ConfigModuleOptions;
export type PropertyConfigFactory = ConfigFactory;

@Global()
@Module({
    imports: [NestConfigModule],
    providers: [PropertyConfigService],
    exports: [NestConfigModule, PropertyConfigService],
})
export class PropertyConfigModule {

    static forRoot(options: PropertyConfigModuleOptions): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [NestConfigModule.forRoot(options)],
        };
    }

    static forFeature(config: PropertyConfigFactory): DynamicModule {
        return {
            module: PropertyConfigModule,
            imports: [NestConfigModule.forFeature(config)],
        };
    }
}
