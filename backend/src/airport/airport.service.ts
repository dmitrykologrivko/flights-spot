import { Connection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ApplicationService, Result, Ok, Err } from '@nestjs-boilerplate/core';
import { BaseAirportSource, SourceException } from '@source/base';
import { Airport } from './airport.entity';

type SyncAirportsResult = Promise<Result<void, SourceException>>;

@ApplicationService()
export class AirportService {
    constructor(
       private readonly airportSource: BaseAirportSource,
       private readonly connection: Connection,
    ) {}

    async syncAirports(): SyncAirportsResult {
        Logger.log('Downloading airports...');

        const getAirportsResult = await this.airportSource.getAirports();

        if (getAirportsResult.is_err()) {
            Logger.warn(`Downloading airports unsuccessful`);
            return Err(getAirportsResult.unwrap_err());
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
                        _name: item.name,
                        _iata: item.iata,
                        _icao: item.icao,
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

                if (createAirportResult.is_ok()) {
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

        return Ok(null);
    }
}