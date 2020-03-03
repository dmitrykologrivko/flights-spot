import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { Bootstrapper, BootstrapOptions } from './bootstrap.interfaces';
import { PropertyConfigService } from '../config';
import { SERVER_PORT_PROPERTY } from '../constants';

export async function bootstrapServer(options: BootstrapOptions): Promise<Bootstrapper> {
    const app = await NestFactory.create(options.module);

    // Set dependency injection container for class validator
    useContainer(app.select(options.module), { fallbackOnErrors: true });

    const config = app.get(PropertyConfigService);

    const start = async () => {
        await app.listen(config.get(SERVER_PORT_PROPERTY));
    };

    return {
        container: app,
        start,
    };
}
