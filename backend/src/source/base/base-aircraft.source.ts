import { Result } from '@nestjs-boilerplate/core';
import { AircraftDto } from './aircraft.dto';
import { SourceException } from './source.exception';

export abstract class BaseAircraftSource {

    abstract getAircrafts(): Promise<Result<AircraftDto[], SourceException>>;

}
