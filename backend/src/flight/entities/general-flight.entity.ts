import {
    ChildEntity,
    Validate,
    ValidationContainerException,
    Result,
} from '@nestjs-boilerplate/core';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { FlightStatusEnum } from '@source/base/flight-status.enum';
import { BaseFlight } from './base-flight.entity';
import { FlightAirportMovement } from './flight-airport-movement.value-object';
import { FlightDistance } from './flight-distance.value-object';

@ChildEntity()
export class GeneralFlight extends BaseFlight {

    private constructor(
        aircraft: Aircraft,
        airline: Airline,
        arrival: FlightAirportMovement,
        departure: FlightAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
    ) {
        super(
            aircraft,
            airline,
            arrival,
            departure,
            distance,
            number,
            callSign,
            status,
        );
    }

    static create(
        aircraft: Aircraft,
        airline: Airline,
        arrival: FlightAirportMovement,
        departure: FlightAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
    ): Result<GeneralFlight, ValidationContainerException> {
        const validateResult = Validate.withResults([
            BaseFlight.validateAircraft(aircraft),
            BaseFlight.validateAirline(airline),
            BaseFlight.validateArrival(arrival),
            BaseFlight.validateDeparture(departure),
            BaseFlight.validateDistance(distance),
            BaseFlight.validateCallSign(callSign),
            BaseFlight.validateNumber(number),
            BaseFlight.validateStatus(status),
        ]);

        return validateResult.map(() => {
            return new GeneralFlight(
                aircraft,
                airline,
                arrival,
                departure,
                distance,
                number,
                callSign,
                status,
            );
        });
    }
}
