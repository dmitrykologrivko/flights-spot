import {
    InfrastructureService,
    ClassTransformer,
    AsyncResult,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseAirlineSource } from '../base/base-airline.source';
import { SourceException } from '../base/source.exception';
import { AirlineDto } from '../base/airline.dto';
import { PatronSkyClient } from './patron-sky.client';

@InfrastructureService()
export class PatronSkyAirlineSource extends BaseAirlineSource {
    constructor(private client: PatronSkyClient) {
        super();
    }

    async getAirlines(): Promise<Result<AirlineDto[], SourceException>> {
        return AsyncResult.from(this.client.getAirlines())
            .map(airlines => ClassTransformer.toClassObjects(AirlineDto, airlines))
            .mapErr(error => new SourceException(error.stack))
            .toPromise();
    }
}
