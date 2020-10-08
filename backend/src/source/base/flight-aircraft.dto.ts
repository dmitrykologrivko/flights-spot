import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlightAircraftDto {

    @Expose()
    name: string;

    @Expose()
    reg: string;

}
