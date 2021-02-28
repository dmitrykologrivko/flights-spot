import {
    ValidateIf,
    IsNotEmpty,
    MaxLength,
    IsNotEmptyObject,
    ValidateNested,
} from 'class-validator';
import {
    Exclude,
    Expose,
    Type,
} from 'class-transformer';
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
import { FlightAircraftDto } from '../flight/flight-aircraft.dto';
import { FlightAirlineDto } from '../flight/flight-airline.dto';
import { FlightAirportMovementDto } from '../flight/flight-airport-movement.dto';
import { FlightDistanceDto } from '../flight/flight-distance.dto';
import { UserFlightTicketDto } from './user-flight-ticket.dto';

const isGeneralType = (object: any) => object.type === FlightType.GENERAL;
const isCustomType = (object: any) => object.type === FlightType.CUSTOM;

@Exclude()
export class UserFlightDto extends BaseTimeStampedEntityDto {

    @Type(() => FlightAircraftDto)
    @ReadOnly()
    aircraft: FlightAircraftDto;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @IsNotEmpty({ always: true })
    @WriteOnly()
    aircraftId: number;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @IsNotEmpty({ always: true })
    @MaxLength(AIRCRAFT_REG_MAX_LENGTH, { always: true })
    @Expose()
    aircraftReg: string;

    @Type(() => FlightAirlineDto)
    @ReadOnly()
    airline: FlightAirlineDto;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @IsNotEmpty({ always: true })
    @WriteOnly()
    airlineId: number;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @ValidateNested({ always: true })
    @IsNotEmpty({ always: true })
    @Type(() => FlightAirportMovementDto)
    @Expose()
    arrival: FlightAirportMovementDto;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @ValidateNested({ always: true })
    @IsNotEmpty({ always: true })
    @Type(() => FlightAirportMovementDto)
    @Expose()
    departure: FlightAirportMovementDto;

    @Type(() => FlightDistanceDto)
    @ReadOnly()
    distance: FlightDistanceDto;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @IsNotEmpty({ always: true })
    @MaxLength(NUMBER_MAX_LENGTH, { always: true })
    @Expose()
    number: string;

    @PartialUpdate()
    @ValidateIf(isCustomType, { always: true })
    @IsNotEmpty({ always: true })
    @MaxLength(CALL_SIGN_MAX_LENGTH, { always: true })
    @Expose()
    callSign: string;

    @ReadOnly()
    status: FlightStatus;

    @IsNotEmpty({ groups: [CrudOperations.CREATE] })
    @Expose({
        groups: [CrudOperations.READ, CrudOperations.CREATE],
    })
    type: FlightType;

    @IsNotEmpty({ always: true })
    @WriteOnly()
    userId: number;

    @PartialUpdate()
    @ValidateNested({ always: true })
    @Type(() => UserFlightTicketDto)
    @Expose()
    ticket: UserFlightTicketDto;

    @ValidateIf(isGeneralType, { groups: [CrudOperations.CREATE] })
    @IsNotEmpty({ groups: [CrudOperations.CREATE] })
    @Expose({ groups: [CrudOperations.CREATE] })
    parentFlight: number;

}
