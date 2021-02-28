import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class AirportDto extends BaseEntityDto {

    @Expose({ name: '_name' })
    name: string;

    @Expose({ name: '_city' })
    city: string;

    @Expose({ name: '_country' })
    country: string;

    @Expose({ name: '_iata' })
    iata: string;

    @Expose({ name: '_icao' })
    icao: string;

    @Expose({ name: '_latitude' })
    latitude: number;

    @Expose({ name: '_longitude' })
    longitude: number;

    @Expose({ name: '_utc' })
    utc: number;

}
