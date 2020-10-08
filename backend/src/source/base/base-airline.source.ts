import { Result } from '@nestjs-boilerplate/core';
import { AirlineDto } from './airline.dto';
import { SourceException } from './source.exception';

export abstract class BaseAirlineSource {
    abstract async getAirlines(): Promise<Result<AirlineDto[], SourceException>>;
}
