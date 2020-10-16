import { Connection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ApplicationService, Result, Ok, Err } from '@nestjs-boilerplate/core';
import { BaseAirlineSource, SourceException } from '@source/base';
import { Airline } from './airline.entity';

type SyncAirlinesResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AirlineService {
    constructor(
        private readonly airlineSource: BaseAirlineSource,
        private readonly connection: Connection,
    ) {}

    async syncAirlines(): SyncAirlinesResult {
        Logger.log('Downloading airlines...');

        const getAirlinesResult = await this.airlineSource.getAirlines();

        if (getAirlinesResult.is_err()) {
            Logger.warn(`Downloading airlines unsuccessful`);
            return Err(getAirlinesResult.unwrap_err());
        }

        const dto = getAirlinesResult.unwrap();

        Logger.log(`Downloaded ${dto.length} airlines`);
        Logger.log('Saving airlines...');

        let invalid = 0;
        let skipped = 0;
        let saved = 0;

        await this.connection.transaction(async manager => {
            for (const item of dto) {
                const repository = manager.getRepository(Airline);

                const airline = await repository.findOne({
                    where: {
                        _name: item.name,
                        _iata: item.iata,
                        _icao: item.icao,
                        _callsign: item.callsign,
                        _country: item.country,
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

                if (createAirlineResult.is_ok()) {
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

        return Ok(null);
    }
}
