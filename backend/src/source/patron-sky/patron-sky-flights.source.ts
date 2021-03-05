import {
    ClassTransformer,
    InfrastructureService,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseFlightSource } from '../base/base-flight.source';
import { SourceException } from '../base/source.exception';
import { FlightDto } from '../base/flight.dto';
import { FlightDistanceDto } from '../base/flight-distance.dto';
import { AirportCodeType } from '../base/airport-code.enum';
import { AirportCodesBy, PatronSkyClient } from './patron-sky.client';

@InfrastructureService()
export class PatronSkyFlightsSource extends BaseFlightSource {
    constructor(private client: PatronSkyClient) {
        super();
    }

    async getFlights(
        flightNumber: string,
        dateLocal: string
    ): Promise<Result<FlightDto[], SourceException>> {
        return (await this.client.getFlights(flightNumber, dateLocal))
            .map(flights => ClassTransformer.toClassObjects(FlightDto, flights))
            .mapErr(error => new SourceException(error.stack));
    }

    async getFlightDistance(
        from: string,
        to: string,
        codeType: AirportCodeType,
    ): Promise<Result<FlightDistanceDto, SourceException>> {
        let codeBy: AirportCodesBy;

        switch (codeType) {
            case AirportCodeType.IATA:
                codeBy = AirportCodesBy.IATA;
                break;
            case AirportCodeType.ICAO:
                codeBy = AirportCodesBy.ICAO;
                break;
        }

        return (await this.client.getFlightDistance(from, to, codeBy))
            .map(distance => ClassTransformer.toClassObject(FlightDistanceDto, distance))
            .mapErr(error => new SourceException(error.stack));
    }
}
