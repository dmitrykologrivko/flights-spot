import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AirportDto {

    @Expose()
    name: string;

    @Expose()
    city: string;

    @Expose()
    country: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

    @Expose()
    latitude: number;

    @Expose()
    longitude: number;

    @Expose()
    utc: number;

}
