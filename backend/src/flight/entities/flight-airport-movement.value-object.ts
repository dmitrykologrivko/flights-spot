import { Column, ManyToOne, JoinColumn } from 'typeorm';
import {
    ValueObject,
    BaseValueObject,
    Validate,
    Result,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';

@ValueObject()
export class FlightAirportMovement extends BaseValueObject {

    @Column({
        name: 'actualTimeLocal',
    })
    private readonly _actualTimeLocal: string;

    @Column({
        name: 'actualTimeUtc',
    })
    private readonly _actualTimeUtc: string;

    @Column({
        name: 'scheduledTimeLocal',
    })
    private readonly _scheduledTimeLocal: string;

    @Column({
        name: 'scheduledTimeUtc',
    })
    private readonly _scheduledTimeUtc: string;

    @ManyToOne(type => Airport)
    @JoinColumn()
    private readonly _airport: Airport;

    private constructor(
        actualTimeLocal: string,
        actualTimeUtc: string,
        scheduledTimeLocal: string,
        scheduledTimeUtc: string,
        airport: Airport,
    ) {
        super();
        this._actualTimeLocal = actualTimeLocal;
        this._actualTimeUtc = actualTimeUtc;
        this._scheduledTimeLocal = scheduledTimeLocal;
        this._scheduledTimeUtc = scheduledTimeUtc;
        this._airport = airport;
    }

    static create(
        actualTimeLocal: string,
        actualTimeUtc: string,
        scheduledTimeLocal: string,
        scheduledTimeUtc: string,
        airport: Airport,
    ): Result<FlightAirportMovement, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightAirportMovement.validateActualTimeLocal(actualTimeLocal),
            FlightAirportMovement.validateActualTimeUtc(actualTimeUtc),
            FlightAirportMovement.validateScheduledTimeLocal(scheduledTimeLocal),
            FlightAirportMovement.validateScheduledTimeUtc(scheduledTimeUtc),
            FlightAirportMovement.validateAirport(airport),
        ]);

        return validateResult.map(() => {
            return new FlightAirportMovement(
              actualTimeLocal,
              actualTimeUtc,
              scheduledTimeLocal,
              scheduledTimeUtc,
              airport,
            );
        });
    }

    private static validateActualTimeLocal(actualTimeLocal: string) {
        return Validate.withProperty('actualTimeLocal', actualTimeLocal)
            .isNotEmpty()
            .isValid();
    }

    private static validateActualTimeUtc(actualTimeUtc: string) {
        return Validate.withProperty('actualTimeUtc', actualTimeUtc)
            .isNotEmpty()
            .isValid();
    }

    private static validateScheduledTimeLocal(scheduledTimeLocal: string) {
        return Validate.withProperty('scheduledTimeLocal', scheduledTimeLocal)
            .isNotEmpty()
            .isValid();
    }

    private static validateScheduledTimeUtc(scheduledTimeUtc: string) {
        return Validate.withProperty('scheduledTimeUtc', scheduledTimeUtc)
            .isNotEmpty()
            .isValid();
    }

    private static validateAirport(airport: Airport) {
        return Validate.withProperty('airport', airport)
            .isNotEmpty()
            .isValid();
    }
}
