import { Module } from '@nestjs/common';
import { PatronSkyModule } from './patron-sky/patron-sky.module';
import { BaseAircraftSource } from './base/base-aircraft.source';
import { BaseAirlineSource } from './base/base-airline.source';
import { BaseAirportSource } from './base/base-airport.source';
import { BaseFlightSource } from './base/base-flight.source';
import { PatronSkyAircraftsSource } from './patron-sky/patron-sky-aircrafts.source';
import { PatronSkyAirlineSource } from './patron-sky/patron-sky-airline.source';
import { PatronSkyAirportsSource } from './patron-sky/patron-sky-airports.source';
import { PatronSkyFlightsSource } from './patron-sky/patron-sky-flights.source';

const aircraftSourceProvider = {
    provide: BaseAircraftSource,
    useExisting: PatronSkyAircraftsSource,
};

const airlineSourceProvider = {
    provide: BaseAirlineSource,
    useExisting: PatronSkyAirlineSource,
};

const airportSourceProvider = {
    provide: BaseAirportSource,
    useExisting: PatronSkyAirportsSource,
};

const flightSourceProvider = {
    provide: BaseFlightSource,
    useExisting: PatronSkyFlightsSource,
};

@Module({
    imports: [PatronSkyModule],
    providers: [
        aircraftSourceProvider,
        airlineSourceProvider,
        airportSourceProvider,
        flightSourceProvider,
    ],
    exports: [
        aircraftSourceProvider,
        airlineSourceProvider,
        airportSourceProvider,
        flightSourceProvider,
    ],
})
export class SourceModule {}
