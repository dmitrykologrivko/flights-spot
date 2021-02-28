import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { AuthModule } from '@nestjs-boilerplate/auth';
import { AircraftModule } from '@aircraft/aircraft.module';
import { AirlineModule } from '@airline/airline.module';
import { AirportModule } from '@airport/airport.module';
import { SourceModule } from '@source/source.module';
import { Flight } from './entities/flight.entity';
import { FlightTicket } from './entities/flight-ticket.value-object';
import { FlightService } from './services/flight.service';
import { FlightController } from './controllers/flight.controller';

@Module({
    imports: [
        DatabaseModule.withEntities([
            Flight,
            FlightTicket,
        ]),
        AuthModule,
        AircraftModule,
        AirlineModule,
        AirportModule,
        SourceModule,
    ],
    providers: [FlightService],
    controllers: [FlightController],
    exports: [DatabaseModule],
})
export class FlightModule {}
