import {
    InfrastructureService,
    ClassTransformer,
    AsyncResult,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseAirportSource } from '../base/base-airport.source';
import { SourceException } from '../base/source.exception';
import { AirportDto } from '../base/airport.dto';
import { PatronSkyClient } from './patron-sky.client';

@InfrastructureService()
export class PatronSkyAirportsSource extends BaseAirportSource {
    constructor(private client: PatronSkyClient) {
        super();
    }

    async getAirports(): Promise<Result<AirportDto[], SourceException>> {
        return AsyncResult.from(this.client.getAirports())
            .map(async airports => ClassTransformer.toClassObjects(AirportDto, airports))
            .map_err(error => new SourceException(error.stack))
            .toResult();
    }
}