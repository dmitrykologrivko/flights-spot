import { Post, Body, UseFilters, UseGuards } from '@nestjs/common';
import { ApiController, CrudController } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { SourceExceptionFilter } from '@source/base';
import { FlightService } from '../services/flight.service';
import { FlightDto } from '../dto/flight/flight.dto';
import { LookupFlightInput } from '../dto/lookup-flight.input';

@UseGuards(JwtAuthGuard)
@UseFilters(SourceExceptionFilter)
@ApiController('flights')
export class FlightController extends CrudController<FlightDto> {
    constructor(
        private readonly flightService: FlightService,
    ) {
        super(flightService);
    }

    @Post('lookup')
    async lookupFlight(@Body() input: LookupFlightInput) {
        const result = await this.flightService.lookupFlight(input);

        if (result.isOk()) {
            return result.unwrap();
        }

        throw result.unwrapErr();
    }
}
