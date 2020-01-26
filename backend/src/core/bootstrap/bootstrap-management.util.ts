import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Bootstrapper, BootstrapOptions } from './bootstrap.interfaces';
import { ManagementService } from '../management';

export async function bootstrapManagement(options: BootstrapOptions): Promise<Bootstrapper> {
    const app = await NestFactory.createApplicationContext(options.module);

    const start = async () => {
        try {
            await app.get(ManagementService).exec();
        } catch (e) {
            Logger.error(e.message, e.stack);
            process.exit(1);
        }

        process.exit(0);
    };

    return {
        container: app,
        start,
    };
}
