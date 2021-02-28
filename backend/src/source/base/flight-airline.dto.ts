import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightAirlineDto {

    @Expose()
    name: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

}
