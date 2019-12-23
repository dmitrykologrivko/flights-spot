import { NestFactory } from '@nestjs/core';
import { PropertyConfigService } from '@common/config';
import { SERVER_PORT_PROPERTY } from '@common/constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(PropertyConfigService);

  await app.listen(config.get(SERVER_PORT_PROPERTY));
}

bootstrap();
