import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserFlightTicketDto {

    @Expose()
    seat: string;

    @Expose()
    note: string;

}
