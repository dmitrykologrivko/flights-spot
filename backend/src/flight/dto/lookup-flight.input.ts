import { IsNotEmpty } from 'class-validator';

export class LookupFlightInput {

    @IsNotEmpty()
    flightNumber: string;

    @IsNotEmpty()
    dateLocal: string;

}
