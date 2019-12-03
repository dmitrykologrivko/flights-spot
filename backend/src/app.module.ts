import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
