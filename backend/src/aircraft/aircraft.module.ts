import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { SourceModule } from '@source/source.module';
import { Aircraft } from './aircraft.entity';
import { AircraftService } from './aircraft.service';
import { AircraftsCommand } from './aircrafts.command';
import { AircraftController } from './aircraft.controller';

@Module({
    imports: [
        DatabaseModule.withEntities([Aircraft]),
        SourceModule,
    ],
    providers: [AircraftService, AircraftsCommand],
    controllers: [AircraftController],
    exports: [DatabaseModule],
})
export class AircraftModule {}
