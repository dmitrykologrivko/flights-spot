import { Exclude, Expose, Type } from 'class-transformer';
import { PaginatedContainer } from '@nestjs-boilerplate/core';
import { AirlineDto } from './airline.dto';

@Exclude()
export class GetAirlinesOutput implements PaginatedContainer<AirlineDto> {

    @Expose()
    count: number;

    @Expose()
    next: string;

    @Expose()
    previous: string;

    @Type(() => AirlineDto)
    @Expose()
    results: AirlineDto[];

}
