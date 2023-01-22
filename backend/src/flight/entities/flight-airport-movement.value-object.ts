import { BaseValueObject, Validate } from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';

export abstract class FlightAirportMovement extends BaseValueObject {

    actualTimeLocal: string;

    actualTimeUtc: string;

    scheduledTimeLocal: string;

    scheduledTimeUtc: string;

    airport: Airport;

    constructor(
        actualTimeLocal: string,
        actualTimeUtc: string,
        scheduledTimeLocal: string,
        scheduledTimeUtc: string,
        airport: Airport
    ) {
        super();
        this.actualTimeLocal = actualTimeLocal;
        this.actualTimeUtc = actualTimeUtc;
        this.scheduledTimeLocal = scheduledTimeLocal;
        this.scheduledTimeUtc = scheduledTimeUtc;
        this.airport = airport;
    }

    protected static validateActualTimeLocal(actualTimeLocal: string) {
        return Validate.withProperty('actualTimeLocal', actualTimeLocal)
            .isOptional()
            .isValid();
    }

    protected static validateActualTimeUtc(actualTimeUtc: string) {
        return Validate.withProperty('actualTimeUtc', actualTimeUtc)
            .isOptional()
            .isValid();
    }

    protected static validateScheduledTimeLocal(scheduledTimeLocal: string) {
        return Validate.withProperty('scheduledTimeLocal', scheduledTimeLocal)
            .isNotEmpty()
            .isValid();
    }

    protected static validateScheduledTimeUtc(scheduledTimeUtc: string) {
        return Validate.withProperty('scheduledTimeUtc', scheduledTimeUtc)
            .isNotEmpty()
            .isValid();
    }

    protected static validateAirport(airport: Airport) {
        return Validate.withProperty('airport', airport)
            .isNotEmpty()
            .isValid();
    }
}
