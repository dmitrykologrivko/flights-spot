import { ManyToOne, JoinColumn } from 'typeorm';
import {
    ChildEntity,
    getTargetName,
    Validate,
    ValidationContainerException,
    Result,
    Ownable,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/auth';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { FlightStatusEnum } from '@source/base/flight-status.enum';
import { BaseFlight } from './base-flight.entity';
import { GeneralFlight } from './general-flight.entity';
import { FlightAirportMovement } from './flight-airport-movement.value-object';
import { FlightDistance } from './flight-distance.value-object';

@ChildEntity()
export class UserFlight extends BaseFlight implements Ownable {

    @ManyToOne(getTargetName(User))
    @JoinColumn()
    protected _owner: User;

    @ManyToOne(type => GeneralFlight, { nullable: true })
    @JoinColumn()
    protected _parent: GeneralFlight;

    private constructor(
        aircraft: Aircraft,
        airline: Airline,
        arrival: FlightAirportMovement,
        departure: FlightAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
        owner: User,
        parent?: GeneralFlight,
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
        this._owner = owner;
        this._parent = parent;
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
        owner: User,
        parent?: GeneralFlight,
    ): Result<UserFlight, ValidationContainerException> {
        const validateResult = Validate.withResults([
            BaseFlight.validateAircraft(aircraft),
            BaseFlight.validateAirline(airline),
            BaseFlight.validateArrival(arrival),
            BaseFlight.validateDeparture(departure),
            BaseFlight.validateDistance(distance),
            BaseFlight.validateCallSign(callSign),
            BaseFlight.validateNumber(number),
            BaseFlight.validateStatus(status),
            UserFlight.validateOwner(owner),
        ]);

        return validateResult.map(() => {
            return new UserFlight(
                aircraft,
                airline,
                arrival,
                departure,
                distance,
                number,
                callSign,
                status,
                owner,
                parent,
            );
        });
    }

    userId(): number {
        return this._owner.id;
    }

    private static validateOwner(owner: User) {
        return Validate.withProperty('owner', owner)
            .isNotEmpty()
            .isValid();
    }
}
