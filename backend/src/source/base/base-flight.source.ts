import { Result } from '@nestjs-boilerplate/core';
import { FlightDto } from './flight.dto';
import { FlightDistanceDto } from './flight-distance.dto';
import { SourceException } from './source.exception';
import { AirportCodeType } from './airport-code.enum';

export abstract class BaseFlightSource {

    abstract async getFlights(
        flightNumber: string,
        dateLocal: string
    ): Promise<Result<FlightDto[], SourceException>>;

    abstract async getFlightDistance(
        from: string,
        to: string,
        codeType: AirportCodeType,
    ): Promise<Result<FlightDistanceDto, SourceException>>;

}
