import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ManagementService } from './management.service';

export async function bootstrapManagement(appModule: any) {
    const app = await NestFactory.createApplicationContext(appModule);

    try {
        await app.get(ManagementService).exec();
    } catch (e) {
        Logger.error(e.message as Error);
        process.exit(1);
    }

    process.exit(0);
}
