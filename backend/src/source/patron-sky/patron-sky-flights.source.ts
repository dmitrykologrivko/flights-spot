import {
    AsyncResult, ClassTransformer,
    InfrastructureService,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseFlightSource } from '../base/base-flight.source';
import { SourceException } from '../base/source.exception';
import { FlightDto } from '../base/flight.dto';
import { PatronSkyClient } from './patron-sky.client';

@InfrastructureService()
export class PatronSkyFlightsSource extends BaseFlightSource {
    constructor(private client: PatronSkyClient) {
        super();
    }

    async getFlights(
        flightNumber: string,
        dateLocal: string
    ): Promise<Result<FlightDto[], SourceException>> {
        return AsyncResult.from(this.client.getFlights(flightNumber, dateLocal))
            .map(async flights => ClassTransformer.toClassObjects(FlightDto, flights))
            .map_err(error => new SourceException(error.stack))
            .toResult();
    }
}
