import { Exclude, Expose, Type } from 'class-transformer';
import { PaginatedContainer } from '@nestjs-boilerplate/core';
import { AircraftDto } from './aircraft.dto';

@Exclude()
export class GetAircraftsOutput implements PaginatedContainer<AircraftDto> {

    @Expose()
    count: number;

    @Expose()
    next: string;

    @Expose()
    previous: string;

    @Type(() => AircraftDto)
    @Expose()
    results: AircraftDto[];

}
