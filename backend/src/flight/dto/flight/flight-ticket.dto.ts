import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ReadOnly, WriteOnly } from '@nestjs-boilerplate/core';
import { FlightPassengerDto } from './flight-passenger.dto';

@Exclude()
export class FlightTicketDto {

    @Expose()
    seat: string;

    @Expose()
    note: string;

    @Type(() => FlightPassengerDto)
    @ReadOnly()
    user: FlightPassengerDto;

    @IsNotEmpty({ always: true })
    @WriteOnly()
    userId: number;

}
