import { Result } from '@nestjs-boilerplate/core';
import { AirportDto } from './airport.dto';
import { SourceException } from './source.exception';

export abstract class BaseAirportSource {

    abstract getAirports(): Promise<Result<AirportDto[], SourceException>>;

}
