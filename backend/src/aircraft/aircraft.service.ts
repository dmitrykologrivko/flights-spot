import { Connection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ApplicationService, Result, Ok, Err } from '@nestjs-boilerplate/core';
import { BaseAircraftSource, SourceException } from '@source/base';
import { Aircraft } from './aircraft.entity';

type SyncAircraftsResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AircraftService {
    constructor(
        private readonly aircraftSource: BaseAircraftSource,
        private readonly connection: Connection,
    ) {}

    async syncAircrafts(): SyncAircraftsResult {
        Logger.log('Downloading aircrafts...');

        const getAircraftsResult = await this.aircraftSource.getAircrafts();

        if (getAircraftsResult.is_err()) {
            Logger.warn(`Downloading aircrafts unsuccessful`);
            return Err(getAircraftsResult.unwrap_err());
        }

        const dto = getAircraftsResult.unwrap();

        Logger.log(`Downloaded ${dto.length} aircrafts`);
        Logger.log('Saving aircrafts...');

        let invalid = 0;
        let skipped = 0;
        let saved = 0;

        await this.connection.transaction(async manager => {
            for (const item of dto) {
                const repository = manager.getRepository(Aircraft);

                const aircraft = await repository.findOne({
                    where: {
                        _name: item.name,
                        _iata: item.iata,
                        _icao: item.icao,
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

                if (createAircraftResult.is_ok()) {
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

        return Ok(null);
    }
}
