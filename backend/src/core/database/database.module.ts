import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyConfigService } from '../config';
import { DATABASE_PROPERTY } from '../constants';
import { MigrationsCommand } from './migrations.command';

@Module({
    imports: [TypeOrmModule.forRootAsync({
        imports: [PropertyConfigService],
        useFactory: (config: PropertyConfigService) => {
            const options = config.get(DATABASE_PROPERTY);

            if (!options) {
                throw new Error('Database config is not defined! Please put it in your application config.');
            }

            return options;
        },
        inject: [PropertyConfigService],
    })],
    providers: [MigrationsCommand],
})
export class DatabaseModule {}
