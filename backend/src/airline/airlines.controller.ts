import { Get, UseFilters, UseGuards } from '@nestjs/common';
import { ApiController, ListFilter } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { SourceExceptionFilter } from '@source/base';
import { AirlineService } from './airline.service';
import { GetAirlinesInput } from './get-airlines.input';

@UseGuards(JwtAuthGuard)
@UseFilters(SourceExceptionFilter)
@ApiController('airlines')
export class AirlineController {
    constructor(
        private airlineService: AirlineService,
    ) {}

    @Get()
    async getAirlines(@ListFilter() input: GetAirlinesInput) {
        const result = await this.airlineService.getAirlines(input);

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }
}
