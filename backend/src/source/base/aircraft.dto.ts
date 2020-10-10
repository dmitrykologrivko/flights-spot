import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AircraftDto {

    @Expose()
    name: string;

    @Expose()
    iataCode: string;

    @Expose()
    isoCode: string;

}
