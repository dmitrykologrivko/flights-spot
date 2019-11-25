import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ConfigModule } from '@app/config.module'
import { ConfigService } from '@app/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.select(ConfigModule).get(ConfigService);

  await app.listen(config.getPort());
}

bootstrap();
