import { BaseValueObject, Validate } from '@nestjs-boilerplate/core';
import { Airport } from '@airport/airport.entity';

export abstract class FlightAirportMovement extends BaseValueObject {

    protected readonly _actualTimeLocal: string;

    protected readonly _actualTimeUtc: string;

    protected readonly _scheduledTimeLocal: string;

    protected readonly _scheduledTimeUtc: string;

    protected readonly _airport: Airport;

    protected constructor(
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

    get actualTimeLocal(): string {
        return this._actualTimeLocal;
    }

    get actualTimeUtc(): string {
        return this._actualTimeUtc;
    }

    get scheduledTimeLocal(): string {
        return this._scheduledTimeLocal;
    }

    get scheduledTimeUtc(): string {
        return this._scheduledTimeUtc;
    }

    get airport(): Airport {
        return this._airport;
    }

    protected static validateActualTimeLocal(actualTimeLocal: string) {
        return Validate.withProperty('actualTimeLocal', actualTimeLocal, true)
            .isValid();
    }

    protected static validateActualTimeUtc(actualTimeUtc: string) {
        return Validate.withProperty('actualTimeUtc', actualTimeUtc, true)
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
