import { Result } from '@nestjs-boilerplate/core';
import { FlightDto } from './flight.dto';
import { FlightDistanceDto } from './flight-distance.dto';
import { AirportCodeType } from './airport-code.enum';
import { SourceException } from './source.exception';

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
