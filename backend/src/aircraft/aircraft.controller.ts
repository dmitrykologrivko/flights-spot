import { Get, UseFilters, UseGuards } from '@nestjs/common';
import { ApiController, ListFilter } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { SourceExceptionFilter } from '@source/base';
import { AircraftService } from './aircraft.service';
import { GetAircraftsInput } from './get-aircrafts.input';

@UseGuards(JwtAuthGuard)
@UseFilters(SourceExceptionFilter)
@ApiController('aircrafts')
export class AircraftController {
    constructor(
        private aircraftService: AircraftService,
    ) {}

    @Get()
    async getAircrafts(@ListFilter() input: GetAircraftsInput) {
        const result = await this.aircraftService.getAircrafts(input);

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }
}
