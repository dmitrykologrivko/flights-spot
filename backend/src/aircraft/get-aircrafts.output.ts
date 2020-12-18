import { Exclude, Expose, Type } from 'class-transformer';
import { AircraftDto } from './aircraft.dto';

@Exclude()
export class GetAircraftsOutput {

    @Type(() => AircraftDto)
    @Expose()
    aircrafts: AircraftDto[];

    constructor(aircrafts: AircraftDto[]) {
        this.aircrafts = aircrafts;
    }
}
