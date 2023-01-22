import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class FlightAirportDto extends BaseEntityDto {

    @Expose()
    id: number;

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
