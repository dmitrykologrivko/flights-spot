import {
    InfrastructureService,
    ClassTransformer,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseAircraftSource } from '../base/base-aircraft.source';
import { SourceException } from '../base/source.exception';
import { AircraftDto } from '../base/aircraft.dto';
import { PatronSkyClient } from './patron-sky.client';

@InfrastructureService()
export class PatronSkyAircraftsSource extends BaseAircraftSource {
    constructor(private client: PatronSkyClient) {
        super();
    }

    async getAircrafts(): Promise<Result<AircraftDto[], SourceException>> {
        return (await this.client.getAircrafts())
            .map(aircrafts => ClassTransformer.toClassObjects(AircraftDto, aircrafts))
            .mapErr(error => new SourceException(error.stack));
    }
}
