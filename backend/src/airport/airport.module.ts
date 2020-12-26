import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { SourceModule } from '@source/source.module';
import { Airport } from './airport.entity';
import { AirportService } from './airport.service';
import { AirportCommand } from './airport.command';
import { AirlineController } from './airport.controller';

@Module({
    imports: [
        DatabaseModule.withEntities([Airport]),
        SourceModule,
    ],
    controllers: [AirlineController],
    providers: [AirportService, AirportCommand],
    exports: [DatabaseModule]
})
export class AirportModule {}
