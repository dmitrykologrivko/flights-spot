import { ManyToOne, JoinColumn, Column } from 'typeorm';
import { Result, Validate, ValidationContainerException } from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';
import { FlightAirportMovement } from './flight-airport-movement.value-object';

export class FlightDepartureAirportMovement extends FlightAirportMovement {

    @Column({
        nullable: true,
    })
    actualTimeLocal: string;

    @Column({
        nullable: true,
    })
    actualTimeUtc: string;

    @Column()
    scheduledTimeLocal: string;

    @Column()
    scheduledTimeUtc: string;

    @ManyToOne(type => Airport, { eager: true })
    @JoinColumn({ name: 'DepartureAirportId' })
    airport: Airport;

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
