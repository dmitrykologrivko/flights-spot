import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class FlightAirlineDto extends BaseEntityDto {

    @Expose()
    name: string;

    @Expose()
    iata: string;

    @Expose()
    icao: string;

    @Expose()
    callsign: string;

    @Expose()
    country: string;

    @Expose()
    active: boolean;

}
