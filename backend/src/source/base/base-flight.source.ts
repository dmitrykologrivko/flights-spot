import { Result } from '@nestjs-boilerplate/core';
import { FlightDto } from './flight.dto';
import { SourceException } from './source.exception';

export abstract class BaseFlightSource {
    abstract async getFlights(
        flightNumber: string,
        dateLocal: string
    ): Promise<Result<FlightDto[], SourceException>>;
}
