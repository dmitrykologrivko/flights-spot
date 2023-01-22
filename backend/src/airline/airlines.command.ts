import { Logger } from '@nestjs/common';
import { Command, Handler } from '@nestjs-boilerplate/core';
import { AirlineService } from './airline.service';

@Command({ name: 'airlines' })
export class AirlinesCommand {
    constructor(private readonly airlineService: AirlineService) {}

    @Handler({ shortcut: 'sync' })
    async syncAirlines() {
       const result = await this.airlineService.syncAirlines();

       if (result.isErr()) {
           Logger.error(result.unwrapErr().stack);
       }
    }
}
