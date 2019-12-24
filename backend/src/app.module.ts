import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@common/common.module';
import { PRODUCTION_ENVIRONMENT, DEVELOPMENT_ENVIRONMENT } from '@common/constants';
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
      ConfigModule.forRoot(configOptions),
      CommonModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
