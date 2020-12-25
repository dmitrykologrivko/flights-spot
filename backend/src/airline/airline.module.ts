import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { SourceModule } from '@source/source.module';
import { Airline } from './airline.entity';
import { AirlineService } from './airline.service';
import { AirlinesCommand } from './airlines.command';
import { AirlineController } from './airlines.controller';

@Module({
    imports: [
        DatabaseModule.withEntities([Airline]),
        SourceModule,
    ],
    controllers: [AirlineController],
    providers: [AirlineService, AirlinesCommand],
    exports: [DatabaseModule],
})
export class AirlineModule {}
