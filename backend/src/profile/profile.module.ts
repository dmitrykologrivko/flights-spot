import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database';
import { AuthModule } from '@auth/auth.module';
import { Profile } from './profile.entity';

@Module({
    imports: [AuthModule, DatabaseModule.withEntities([Profile],{
        modulePath: __dirname,
    })],
    exports: [DatabaseModule],
})
export class ProfileModule {}
