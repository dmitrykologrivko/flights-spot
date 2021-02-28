import { Exclude } from 'class-transformer';
import { FlightDto } from './flight/flight.dto';
import { FlightTicketDto } from './flight/flight-ticket.dto';

@Exclude()
export class LookupFlightOutput extends FlightDto {

    @Exclude()
    tickets: FlightTicketDto[];

}
