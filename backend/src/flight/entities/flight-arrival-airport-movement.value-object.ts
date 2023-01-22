import { ManyToOne, JoinColumn, Column } from 'typeorm';
import { Result, Validate, ValidationContainerException } from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';
import { FlightAirportMovement } from './flight-airport-movement.value-object';

export class FlightArrivalAirportMovement extends FlightAirportMovement {

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

    @ManyToOne(
        type => Airport,
        { nullable: false, eager: true }
    )
    @JoinColumn({ name: 'ArrivalAirportId' })
    airport: Airport;

    static create(
        actualTimeLocal: string,
        actualTimeUtc: string,
        scheduledTimeLocal: string,
        scheduledTimeUtc: string,
        airport: Airport,
    ): Result<FlightArrivalAirportMovement, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightAirportMovement.validateActualTimeLocal(actualTimeLocal),
            FlightAirportMovement.validateActualTimeUtc(actualTimeUtc),
            FlightAirportMovement.validateScheduledTimeLocal(scheduledTimeLocal),
            FlightAirportMovement.validateScheduledTimeUtc(scheduledTimeUtc),
            FlightAirportMovement.validateAirport(airport),
        ]);

        return validateResult.map(() => {
            return new FlightArrivalAirportMovement(
                actualTimeLocal,
                actualTimeUtc,
                scheduledTimeLocal,
                scheduledTimeUtc,
                airport,
            );
        });
    }
}
