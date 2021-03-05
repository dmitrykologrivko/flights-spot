import {
    InfrastructureService,
    ClassTransformer,
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
        return (await this.client.getAirports())
            .map(airports => ClassTransformer.toClassObjects(AirportDto, airports))
            .mapErr(error => new SourceException(error.stack));
    }
}
