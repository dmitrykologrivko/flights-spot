import { Module } from '@nestjs/common';
import { CoreModule } from '@nest-boilerplate/core';
import { AuthModule } from '@nest-boilerplate/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: [appConfig],
      }),
      AuthModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
