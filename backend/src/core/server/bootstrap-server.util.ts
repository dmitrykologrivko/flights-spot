import { NestFactory } from '@nestjs/core';
import { PropertyConfigService } from '../config';
import { SERVER_PORT_PROPERTY } from '../constants';

export async function bootstrapServer(appModule: any) {
    const app = await NestFactory.create(appModule);

    const config = app.get(PropertyConfigService);

    await app.listen(config.get(SERVER_PORT_PROPERTY));
}
