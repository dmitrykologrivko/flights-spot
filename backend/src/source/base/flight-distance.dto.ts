import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightDistanceDto {

    @Expose()
    feet: number

    @Expose()
    km: number;

    @Expose()
    meter: number;

    @Expose()
    mile: number;

    @Expose()
    nm: number;

}
