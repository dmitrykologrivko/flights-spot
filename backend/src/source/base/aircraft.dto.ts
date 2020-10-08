import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AircraftDto {

    @Expose()
    name: string;

    @Expose()
    isoCode: string;

    @Expose()
    dafifCode: string;

}
