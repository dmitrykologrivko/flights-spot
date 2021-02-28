import { Post, Body, UseFilters } from '@nestjs/common';
import { ApiController, CrudController } from '@nestjs-boilerplate/core';
import { SourceExceptionFilter } from '@source/base';
import { FlightService } from '../services/flight.service';
import { UserFlightDto } from '../dto/user-flight/user-flight.dto';
import { LookupFlightInput } from '../dto/lookup-flight.input';
import { GetFlightsInput } from '../dto/get-flights.input';
import { RetrieveFlightInput } from '../dto/retrieve-flight.input';
import { DestroyFlightInput } from '../dto/destroy-flight.input';

@UseFilters(SourceExceptionFilter)
@ApiController('flights')
export class FlightController extends CrudController<UserFlightDto> {
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

    protected mapListInput(req: any): GetFlightsInput {
        // TODO: Replace with real user ID !!!
        return { ...super.mapListInput(req), userId: 1 };
    }

    protected mapRetrieveInput(req: any): RetrieveFlightInput {
        // TODO: Replace with real user ID !!!
        return { ...super.mapRetrieveInput(req), userId: 1 };
    }

    protected mapCreateInput(req: any): UserFlightDto {
        // TODO: Replace with real user ID !!!
        return { ...super.mapCreateInput(req), userId: 1 };
    }

    protected mapUpdateInput(req: any): UserFlightDto {
        // TODO: Replace with real user ID !!!
        return { ...super.mapUpdateInput(req), userId: 1 };
    }

    protected mapDestroyInput(req: any): DestroyFlightInput {
        // TODO: Replace with real user ID !!!
        return { ...super.mapDestroyInput(req), userId: 1 };
    }
}
