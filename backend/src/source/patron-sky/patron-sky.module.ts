import { Module } from '@nestjs/common';
import { ConfigModule, PropertyConfigService } from '@nestjs-boilerplate/core';
import { PatronSkyClient } from './patron-sky.client';
import { PatronSkyAircraftsSource } from './patron-sky-aircrafts.source';
import { PatronSkyAirlineSource } from './patron-sky-airline.source';
import { PatronSkyAirportsSource } from './patron-sky-airports.source';
import { PatronSkyFlightsSource } from './patron-sky-flights.source';
import { PATRON_SKY_HOST_PROPERTY } from './patron-sky.properties';
import patronSkyConfig from './patron-sky.config';

const patronSkyClientProvider = {
    provide: PatronSkyClient,
    useFactory: (config: PropertyConfigService) => {
        const apiUrl = config.get(PATRON_SKY_HOST_PROPERTY);
        return new PatronSkyClient(apiUrl);
    },
    inject: [PropertyConfigService],
};

@Module({
    imports: [
        ConfigModule.forFeature(patronSkyConfig),
    ],
    providers: [
        patronSkyClientProvider,
        PatronSkyAircraftsSource,
        PatronSkyAirlineSource,
        PatronSkyAirportsSource,
        PatronSkyFlightsSource,
    ],
    exports: [
        patronSkyClientProvider,
        PatronSkyAircraftsSource,
        PatronSkyAirlineSource,
        PatronSkyAirportsSource,
        PatronSkyFlightsSource,
    ],
})
export class PatronSkyModule {}
