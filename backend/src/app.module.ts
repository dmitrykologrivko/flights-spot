import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { PropertyConfigModule } from '@core/config';
import { PRODUCTION_ENVIRONMENT, DEVELOPMENT_ENVIRONMENT } from '@core/constants';
import { AuthModule } from '@auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';

const configOptions = {
  isGlobal: true,
  ignoreEnvFile: process.env.NODE_ENV === PRODUCTION_ENVIRONMENT,
  envFilePath: `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`,
  load: [appConfig],
};

@Module({
  imports: [
      PropertyConfigModule.forRoot(configOptions),
      CoreModule.forRoot(),
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
