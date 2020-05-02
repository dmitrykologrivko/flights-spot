import { Global, Module, DynamicModule } from '@nestjs/common';
import {
    PropertyConfigModule,
    PropertyConfigFactory,
    PropertyConfigModuleOptions,
} from './property-config/property-config.module';
import baseConfig from './global.config';

export type ConfigModuleOptions = PropertyConfigModuleOptions;
export type ConfigFactory = PropertyConfigFactory;

@Global()
@Module({
    imports: [PropertyConfigModule.forFeature(baseConfig)],
    exports: [PropertyConfigModule],
})
export class ConfigModule {

    static forRoot(options: ConfigModuleOptions): DynamicModule {
        return {
            module: ConfigModule,
            imports: [PropertyConfigModule.forRoot(options)],
        };
    }

    static forFeature(config: ConfigFactory): DynamicModule {
        return {
            module: ConfigModule,
            imports: [PropertyConfigModule.forFeature(config)],
        };
    }
}
