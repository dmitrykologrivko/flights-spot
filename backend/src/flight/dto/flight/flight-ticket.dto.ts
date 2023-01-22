import { IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightTicketDto {

    @IsOptional({ always: true })
    @Expose()
    seat: string;

    @IsOptional({ always: true })
    @Expose()
    note: string;

}
