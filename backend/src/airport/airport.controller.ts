import { Get } from '@nestjs/common';
import { ApiController, ListFilter } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { AirportService } from './airport.service';
import { GetAirportInput } from './get-airport.input';

@ApiController('airports')
export class AirlineController {
    constructor(
        private airportService: AirportService,
    ) {}

    //@UseGuards(JwtAuthGuard)
    @Get()
    async getAirports(@ListFilter() input: GetAirportInput) {
        const result = await this.airportService.getAirports(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
