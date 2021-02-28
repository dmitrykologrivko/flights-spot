import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ReadOnly, WriteOnly } from '@nestjs-boilerplate/core';
import { FlightAirportDto } from './flight-airport.dto';

@Exclude()
export class FlightAirportMovementDto {

    @IsNotEmpty({ always: true })
    @Expose()
    actualTimeLocal: string;

    @IsNotEmpty({ always: true })
    @Expose()
    actualTimeUtc: string;

    @IsNotEmpty({ always: true })
    @Expose()
    scheduledTimeLocal: string;

    @IsNotEmpty({ always: true })
    @Expose()
    scheduledTimeUtc: string;

    @Type(() => FlightAirportDto)
    @ReadOnly()
    airport: FlightAirportDto;

    @IsNotEmpty({ always: true })
    @WriteOnly()
    airportId: number;

}
