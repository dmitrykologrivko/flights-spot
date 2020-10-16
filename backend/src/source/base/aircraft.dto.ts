import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AircraftDto {

    @Expose()
    name: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

}
