import { Logger } from '@nestjs/common';
import { Command, Handler } from '@nestjs-boilerplate/core';
import { AirportService } from './airport.service';

@Command({ name: 'airports' })
export class AirportCommand {
    constructor(private readonly airportService: AirportService) {}

    @Handler({ shortcut: 'sync' })
    async syncAirports() {
        const result = await this.airportService.syncAirports();

        if (result.is_err()) {
            Logger.error(result.unwrap_err().stack);
        }
    }
}
