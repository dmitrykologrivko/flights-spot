import { Exclude, Expose } from 'class-transformer';
import { EntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class AircraftDto extends EntityDto {

    @Expose({ name: '_name' })
    name: string;

    @Expose({ name: '_iata' })
    iata: string;

    @Expose({ name: '_icao' })
    icao: string;

}
