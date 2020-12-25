import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { SourceModule } from '@source/source.module';
import { Airport } from './airport.entity';
import { AirportService } from './airport.service';
import { AirportCommand } from './airport.command';

@Module({
    imports: [
        DatabaseModule.withEntities([Airport]),
        SourceModule,
    ],
    providers: [AirportService, AirportCommand],
    exports: [DatabaseModule]
})
export class AirportModule {}
