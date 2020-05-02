import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { AuthModule } from '@auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: [appConfig],
      }),
      AuthModule,
      ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
