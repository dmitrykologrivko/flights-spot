import { Get } from '@nestjs/common';
import { ApiController, ClassTransformer } from '@nestjs-boilerplate/core';
import { JwtAuthGuard } from '@nestjs-boilerplate/auth';
import { AircraftService } from './aircraft.service';
import { GetAircraftsInput } from './get-aircrafts.input';
import { ListFilter } from './crud/list-filter.decorator';

@ApiController('aircrafts')
export class AircraftController {
    constructor(
        private aircraftService: AircraftService,
    ) {}

    //@UseGuards(JwtAuthGuard)
    @Get()
    async getAircrafts(@ListFilter() filter) {
        const input = ClassTransformer.toClassObject(GetAircraftsInput, filter);

        const result = await this.aircraftService.getAircrafts(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap().aircrafts;
    }
}
