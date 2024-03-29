import { Connection, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import {
    ApplicationService,
    ClassTransformer,
    InjectRepository,
    ok,
    err,
    Result,
    PagePagination,
    FilterChain,
} from '@nestjs-boilerplate/core';
import { BaseAircraftSource, SourceException } from '@source/base';
import { Aircraft } from './aircraft.entity';
import { AircraftDto } from './aircraft.dto';
import { GetAircraftsInput } from './get-aircrafts.input';
import { GetAircraftsOutput } from './get-aircrafts.output';

type GetAircraftsResult = Promise<Result<GetAircraftsOutput, void>>;
type SyncAircraftsResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AircraftService {
    constructor(
        @InjectRepository(Aircraft)
        private readonly aircraftRepository: Repository<Aircraft>,
        private readonly aircraftSource: BaseAircraftSource,
        private readonly connection: Connection,
    ) {}

    async getAircrafts(input: GetAircraftsInput): GetAircraftsResult {
        const output = await FilterChain.create<Aircraft>(this.aircraftRepository)
            .setPagination(qb => new PagePagination(qb, input))
            .mapPaginatedContainer(response => ({
                ...response,
                results: ClassTransformer.toClassObjects(AircraftDto, response.results),
            })) as GetAircraftsOutput;

        return ok(output);
    }

    async syncAircrafts(): SyncAircraftsResult {
        Logger.log('Downloading aircrafts...');

        const getAircraftsResult = await this.aircraftSource.getAircrafts();

        if (getAircraftsResult.isErr()) {
            Logger.warn(`Downloading aircrafts unsuccessful`);
            return err(getAircraftsResult.unwrapErr());
        }

        const dto = getAircraftsResult.unwrap();

        Logger.log(`Downloaded ${dto.length} aircrafts`);
        Logger.log('Saving aircrafts...');

        let invalid = 0;
        let skipped = 0;
        let saved = 0;

        await this.connection.transaction(async manager => {
            const repository = manager.getRepository(Aircraft);

            for (const item of dto) {
                const aircraft = await repository.findOne({
                    where: {
                        name: item.name,
                        iata: item.iata,
                        icao: item.icao,
                    },
                });

                if (aircraft) {
                    Logger.warn(`SKIP (already exist): ${item.name}`);
                    skipped++;
                    continue;
                }

                const createAircraftResult = Aircraft.create(
                    item.name,
                    item.iata,
                    item.icao,
                );

                if (createAircraftResult.isOk()) {
                    await repository.save(createAircraftResult.unwrap());
                    saved++;
                } else {
                    Logger.warn(`SKIP (invalid): ${item.name}`);
                    invalid++;
                }
            }
        });

        Logger.log(
            `Sync aircrafts has been completed. Saved: ${saved}, Invalid:${invalid}, Skipped: ${skipped}`
        );

        return ok(null);
    }
}
