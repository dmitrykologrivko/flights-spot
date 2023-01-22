import { Logger } from '@nestjs/common';
import { Command, Handler } from '@nestjs-boilerplate/core';
import { AircraftService } from './aircraft.service';

@Command({ name: 'aircrafts' })
export class AircraftsCommand {
    constructor(private readonly aircraftService: AircraftService) {}

    @Handler({ shortcut: 'sync' })
    async syncAircrafts() {
       const result = await this.aircraftService.syncAircrafts();

       if (result.isErr()) {
           Logger.error(result.unwrapErr().stack);
       }
    }
}
