import {
    AsyncResult,
    ClassTransformer,
    InfrastructureService,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseFlightSource } from '../base/base-flight.source';
import { SourceException } from '../base/source.exception';
import { FlightDto } from '../base/flight.dto';
import { FlightDistanceDto } from '../base/flight-distance.dto';
import { AirportCodeType } from '../base/airport-code.enum';
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
            .map(flights => ClassTransformer.toClassObjects(FlightDto, flights))
            .mapErr(error => new SourceException(error.stack))
            .toPromise();
    }

    async getFlightDistance(
        from: string,
        to: string,
        codeType: AirportCodeType,
    ): Promise<Result<FlightDistanceDto, SourceException>> {
        return Promise.resolve(Result.ok({
            feet: 0,
            km: 0,
            meter: 0,
            mile: 0,
            nm: 0,
        }));
    }
}
