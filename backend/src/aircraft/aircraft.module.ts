import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { SourceModule } from '@source/source.module';
import { Aircraft } from './aircraft.entity';
import { AircraftService } from './aircraft.service';
import { AircraftsCommand } from './aircrafts.command';

@Module({
    imports: [
        DatabaseModule.withEntities([Aircraft]),
        SourceModule,
    ],
    providers: [AircraftService, AircraftsCommand],
    exports: [DatabaseModule],
})
export class AircraftModule {}
