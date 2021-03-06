import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class AirlineDto extends BaseEntityDto {

    @Expose({ name: '_name' })
    name: string;

    @Expose({ name: '_iata' })
    iata: string;

    @Expose({ name: '_icao' })
    icao: string;

    @Expose({ name: '_callsign' })
    callsign: string;

    @Expose({ name: '_country' })
    country: string;

    @Expose({ name: '_active' })
    active: boolean;

}
