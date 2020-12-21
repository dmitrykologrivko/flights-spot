import { Get } from '@nestjs/common';
import { ApiController, ListFilter } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { AircraftService } from './aircraft.service';
import { GetAircraftsInput } from './get-aircrafts.input';

@ApiController('aircrafts')
export class AircraftController {
    constructor(
        private aircraftService: AircraftService,
    ) {}

    //@UseGuards(JwtAuthGuard)
    @Get()
    async getAircrafts(@ListFilter() input: GetAircraftsInput) {
        const result = await this.aircraftService.getAircrafts(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
