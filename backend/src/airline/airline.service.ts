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
import { BaseAirlineSource, SourceException } from '@source/base';
import { Airline } from './airline.entity';
import { AirlineDto } from './airline.dto';
import { GetAirlinesInput } from './get-airlines.input';
import { GetAirlinesOutput } from './get-airlines.output';

type GetAirlinesResult = Promise<Result<GetAirlinesOutput, void>>;
type SyncAirlinesResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AirlineService {
    constructor(
        @InjectRepository(Airline)
        private readonly airlineRepository: Repository<Airline>,
        private readonly airlineSource: BaseAirlineSource,
        private readonly connection: Connection,
    ) {}

    async getAirlines(input: GetAirlinesInput): GetAirlinesResult {
        const output = await FilterChain.create<Airline>(this.airlineRepository)
            .setPagination(qb => new PagePagination(qb, input))
            .mapPaginatedContainer(response => ({
                ...response,
                results: ClassTransformer.toClassObjects(AirlineDto, response.results),
            })) as GetAirlinesOutput;

        return ok(output);
    }

    async syncAirlines(): SyncAirlinesResult {
        Logger.log('Downloading airlines...');

        const getAirlinesResult = await this.airlineSource.getAirlines();

        if (getAirlinesResult.isErr()) {
            Logger.warn(`Downloading airlines unsuccessful`);
            return err(getAirlinesResult.unwrapErr());
        }

        const dto = getAirlinesResult.unwrap();

        Logger.log(`Downloaded ${dto.length} airlines`);
        Logger.log('Saving airlines...');

        let invalid = 0;
        let skipped = 0;
        let saved = 0;

        await this.connection.transaction(async manager => {
            const repository = manager.getRepository(Airline);

            for (const item of dto) {
                const airline = await repository.findOne({
                    where: {
                        name: item.name,
                        iata: item.iata,
                        icao: item.icao,
                    },
                });

                if (airline) {
                    Logger.warn(`SKIP (already exist): ${item.name}`);
                    skipped++;
                    continue;
                }

                const createAirlineResult = Airline.create(
                    item.name,
                    item.iata,
                    item.icao,
                    item.callsign,
                    item.country,
                    item.active,
                );

                if (createAirlineResult.isOk()) {
                    await repository.save(createAirlineResult.unwrap());
                    saved++;
                } else {
                    Logger.warn(`SKIP (invalid): ${item.name}`);
                    invalid++;
                }
            }
        });

        Logger.log(
            `Sync airlines has been completed. Saved: ${saved}, Invalid:${invalid}, Skipped: ${skipped}`
        );

        return ok(null);
    }
}
