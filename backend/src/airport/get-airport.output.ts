import { Exclude, Expose, Type } from 'class-transformer';
import { PaginatedContainer } from '@nestjs-boilerplate/core';
import { AirportDto } from './airport.dto';

@Exclude()
export class GetAirportOutput implements PaginatedContainer<AirportDto> {

    @Expose()
    count: number;

    @Expose()
    next: string;

    @Expose()
    previous: string;

    @Type(() => AirportDto)
    @Expose()
    results: AirportDto[];

}
