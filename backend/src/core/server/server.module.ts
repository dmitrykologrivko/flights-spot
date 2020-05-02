import { Module } from '@nestjs/common';
import { PropertyConfigModule } from '../config/property-config/property-config.module';
import serverConfig from './server.config';

@Module({ imports: [PropertyConfigModule.forFeature(serverConfig)] })
export class ServerModule {}
