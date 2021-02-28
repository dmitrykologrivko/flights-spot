import { NonFieldValidationException } from '@nestjs-boilerplate/core';

export class SeveralFlightsFoundException extends NonFieldValidationException {
    constructor() {
        super({ ['severalFlightsFound']: 'Found several flights on the same date' });
    }
}
