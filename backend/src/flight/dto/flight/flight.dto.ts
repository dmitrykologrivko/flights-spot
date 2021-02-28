import {
    IsNotEmpty,
    MaxLength,
    IsNotEmptyObject,
    ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseTimeStampedEntityDto,
    ReadOnly,
    WriteOnly,
    PartialUpdate,
    CrudOperations,
} from '@nestjs-boilerplate/core';
import {
    FlightStatus,
    FlightType,
    AIRCRAFT_REG_MAX_LENGTH,
    NUMBER_MAX_LENGTH,
    CALL_SIGN_MAX_LENGTH,
} from '../../entities/flight.entity';
import { FlightAircraftDto } from './flight-aircraft.dto';
import { FlightAirlineDto } from './flight-airline.dto';
import { FlightAirportMovementDto } from './flight-airport-movement.dto';
import { FlightDistanceDto } from './flight-distance.dto';
import { FlightTicketDto } from './flight-ticket.dto';

@Exclude()
export class FlightDto extends BaseTimeStampedEntityDto {

    @Type(() => FlightAircraftDto)
    @ReadOnly()
    aircraft: FlightAircraftDto;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @WriteOnly()
    aircraftId: number;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @MaxLength(AIRCRAFT_REG_MAX_LENGTH, { always: true })
    @Expose()
    aircraftReg: string;

    @Type(() => FlightAirlineDto)
    @ReadOnly()
    airline: FlightAirlineDto;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @WriteOnly()
    airlineId: number;

    @PartialUpdate()
    @ValidateNested({ always: true })
    @IsNotEmpty({ always: true })
    @Type(() => FlightAirportMovementDto)
    @Expose()
    arrival: FlightAirportMovementDto;

    @PartialUpdate()
    @ValidateNested({ always: true })
    @IsNotEmpty({ always: true })
    @Type(() => FlightAirportMovementDto)
    @Expose()
    departure: FlightAirportMovementDto;

    @Type(() => FlightDistanceDto)
    @ReadOnly()
    distance: FlightDistanceDto;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @MaxLength(NUMBER_MAX_LENGTH, { always: true })
    @Expose()
    number: string;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @MaxLength(CALL_SIGN_MAX_LENGTH, { always: true })
    @Expose()
    callSign: string;

    @PartialUpdate()
    @IsNotEmpty({ always: true })
    @Expose()
    status: FlightStatus;

    @IsNotEmpty({ groups: [CrudOperations.CREATE] })
    @Expose({
        groups: [CrudOperations.READ, CrudOperations.CREATE],
    })
    type: FlightType;

    @PartialUpdate()
    @ValidateNested({ always: true })
    @IsNotEmpty({ always: true })
    @Type(() => FlightTicketDto)
    @Expose()
    tickets: FlightTicketDto[];

}
