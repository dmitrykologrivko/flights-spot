import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class FlightAircraftDto extends BaseEntityDto {

    @Expose()
    name: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

}
