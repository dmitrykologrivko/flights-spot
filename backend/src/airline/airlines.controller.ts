import { Get } from '@nestjs/common';
import { ApiController, ListFilter } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { AirlineService } from './airline.service';
import { GetAirlinesInput } from './get-airlines.input';

@ApiController('airlines')
export class AirlineController {
    constructor(
        private airlineService: AirlineService,
    ) {}

    //@UseGuards(JwtAuthGuard)
    @Get()
    async getAirlines(@ListFilter() input: GetAirlinesInput) {
        const result = await this.airlineService.getAirlines(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
