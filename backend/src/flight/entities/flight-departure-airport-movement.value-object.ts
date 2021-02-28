import { ManyToOne, JoinColumn, Column } from 'typeorm';
import { Result, Validate, ValidationContainerException } from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';
import { FlightAirportMovement } from './flight-airport-movement.value-object';

export class FlightDepartureAirportMovement extends FlightAirportMovement {

    @Column({
        name: 'actualTimeLocal',
        nullable: true,
    })
    protected readonly _actualTimeLocal: string;

    @Column({
        name: 'actualTimeUtc',
        nullable: true,
    })
    protected readonly _actualTimeUtc: string;

    @Column({
        name: 'scheduledTimeLocal',
    })
    protected readonly _scheduledTimeLocal: string;

    @Column({
        name: 'scheduledTimeUtc',
    })
    protected readonly _scheduledTimeUtc: string;

    @ManyToOne(type => Airport, { eager: true })
    @JoinColumn({ name: 'DepartureAirportId' })
    protected readonly _airport: Airport;

    static create(
        actualTimeLocal: string,
        actualTimeUtc: string,
        scheduledTimeLocal: string,
        scheduledTimeUtc: string,
        airport: Airport,
    ): Result<FlightDepartureAirportMovement, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightAirportMovement.validateActualTimeLocal(actualTimeLocal),
            FlightAirportMovement.validateActualTimeUtc(actualTimeUtc),
            FlightAirportMovement.validateScheduledTimeLocal(scheduledTimeLocal),
            FlightAirportMovement.validateScheduledTimeUtc(scheduledTimeUtc),
            FlightAirportMovement.validateAirport(airport),
        ]);

        return validateResult.map(() => {
            return new FlightDepartureAirportMovement(
                actualTimeLocal,
                actualTimeUtc,
                scheduledTimeLocal,
                scheduledTimeUtc,
                airport,
            );
        });
    }
}
