import { NonFieldValidationException } from '@nestjs-boilerplate/core';

export class IncompleteFlightException extends NonFieldValidationException {
    constructor() {
        super({ ['incompleteFlight']: 'The flight information incomplete' });
    }
}
