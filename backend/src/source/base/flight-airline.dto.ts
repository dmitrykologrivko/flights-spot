import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightAirlineDto {

    @Expose()
    name: string;

}
