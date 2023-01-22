import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightTicketDto {

    @Expose()
    seat: string;

    @Expose()
    note: string;

}
