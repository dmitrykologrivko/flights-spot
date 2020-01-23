import { NestFactory } from '@nestjs/core';
import { ManagementService } from './management.service';

export async function bootstrap(appModule: any) {
    const app = await NestFactory.createApplicationContext(appModule);

    try {
        await app.get(ManagementService).exec();
    } catch (e) {
        // TODO: Replace with logger
        console.log(e);
        process.exit(1);
    }

    process.exit(0);
}
