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
import { BaseAirportSource, SourceException } from '@source/base';
import { Airport } from './airport.entity';
import { AirportDto } from './airport.dto';
import { GetAirportInput } from './get-airport.input';
import { GetAirportOutput } from './get-airport.output';

type GetAirportsResult = Promise<Result<GetAirportOutput, void>>;
type SyncAirportsResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AirportService {
    constructor(
        @InjectRepository(Airport)
        private readonly airportRepository: Repository<Airport>,
        private readonly airportSource: BaseAirportSource,
        private readonly connection: Connection,
    ) {}

    async getAirports(input: GetAirportInput): GetAirportsResult {
        const output = await FilterChain.create<Airport>(this.airportRepository)
            .setPagination(qb => new PagePagination(qb, input))
            .mapPaginatedContainer(response => ({
                ...response,
                results: ClassTransformer.toClassObjects(AirportDto, response.results),
            })) as GetAirportOutput;

        return ok(output);
    }

    async syncAirports(): SyncAirportsResult {
        Logger.log('Downloading airports...');

        const getAirportsResult = await this.airportSource.getAirports();

        if (getAirportsResult.isErr()) {
            Logger.warn(`Downloading airports unsuccessful`);
            return err(getAirportsResult.unwrapErr());
        }

        const dto = getAirportsResult.unwrap();

        Logger.log(`Downloaded ${dto.length} airports`);
        Logger.log('Saving airports...');

        let invalid = 0;
        let skipped = 0;
        let saved = 0;

        await this.connection.transaction(async manager => {
            const repository = manager.getRepository(Airport);

            for (const item of dto) {
                const airport = await repository.findOne({
                    where: {
                        name: item.name,
                        iata: item.iata,
                        icao: item.icao,
                    }
                });

                if (airport) {
                    Logger.warn(`SKIP (already exist): ${item.name}`);
                    skipped++;
                    continue;
                }

                const createAirportResult = Airport.create(
                    item.name,
                    item.city,
                    item.country,
                    item.iata,
                    item.icao,
                    item.latitude,
                    item.longitude,
                    item.utc,
                );

                if (createAirportResult.isOk()) {
                    await repository.save(createAirportResult.unwrap());
                    saved++;
                } else {
                    Logger.warn(`SKIP (invalid): ${item.name}`);
                    invalid++;
                }
            }
        });

        Logger.log(
            `Sync airports has been completed. Saved: ${saved}, Invalid:${invalid}, Skipped: ${skipped}`
        );

        return ok(null);
    }
}