import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core/core.module';
import { PRODUCTION_ENVIRONMENT, DEVELOPMENT_ENVIRONMENT } from '@core/constants';
import { AuthModule } from '@auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';

const configOptions = {
  isGlobal: true,
  ignoreEnvFile: process.env.NODE_ENV === PRODUCTION_ENVIRONMENT,
  envFilePath: `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`,
  load: [appConfig],
};

@Module({
  imports: [
      ConfigModule.forRoot(configOptions),
      CoreModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, MetadataScanner],
})
export class AppModule {}
