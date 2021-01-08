import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nestjs-boilerplate/core';
import { BaseFlight } from './entities/base-flight.entity';
import { GeneralFlight } from './entities/general-flight.entity';
import { UserFlight } from './entities/user-flight.entity';
import { FlightAirportMovement } from './entities/flight-airport-movement.value-object';
import { FlightDistance } from './entities/flight-distance.value-object';

const entities = [
    BaseFlight,
    GeneralFlight,
    UserFlight,
    FlightAirportMovement,
    FlightDistance,
];

@Module({
    imports: [DatabaseModule.withEntities(entities)],
    exports: [DatabaseModule],
})
export class FlightModule {}
