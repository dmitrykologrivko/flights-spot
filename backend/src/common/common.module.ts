import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { DatabaseModule } from '@common/database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    exports: [ConfigModule, DatabaseModule],
})
export class CommonModule {}
