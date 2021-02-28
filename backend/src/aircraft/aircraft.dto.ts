import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class AircraftDto extends BaseEntityDto {

    @Expose({ name: '_name' })
    name: string;

    @Expose({ name: '_iata' })
    iata: string;

    @Expose({ name: '_icao' })
    icao: string;

}
