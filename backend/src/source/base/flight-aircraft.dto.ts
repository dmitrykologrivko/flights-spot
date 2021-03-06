import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightAircraftDto {

    @Expose()
    name: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

    @Expose()
    reg: string;

}
