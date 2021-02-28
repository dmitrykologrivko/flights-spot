import { NonFieldValidationException } from '@nestjs-boilerplate/core';

export class FlightNotFoundException extends NonFieldValidationException {
    constructor() {
        super({ ['flightNotFound']: 'Requested flight is not found' });
    }
}
