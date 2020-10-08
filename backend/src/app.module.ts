import { Module } from '@nestjs/common';
import { CoreModule } from '@nestjs-boilerplate/core';
import { AuthModule } from '@nestjs-boilerplate/auth';
import { SourceModule } from '@source/source.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: [appConfig],
      }),
      AuthModule.forRoot(),
      SourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
