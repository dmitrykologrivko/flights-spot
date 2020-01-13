import { NestFactory } from '@nestjs/core';
import { PropertyConfigService } from '@core/config';
import { SERVER_PORT_PROPERTY } from '@core/constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(PropertyConfigService);

  await app.listen(config.get(SERVER_PORT_PROPERTY));
}

bootstrap();
