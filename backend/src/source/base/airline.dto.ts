import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AirlineDto {

    @Expose()
    name: string;

    @Expose()
    alias: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

    @Expose()
    callsign: string;

    @Expose()
    country: string;

}
