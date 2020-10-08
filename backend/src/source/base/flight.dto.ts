import { Exclude, Expose, Type } from 'class-transformer';
import { FlightAircraftDto } from './flight-aircraft.dto';
import { FlightAirlineDto } from './flight-airline.dto';
import { FlightAirportMovementDto } from './flight-airport-movement.dto';
import { FlightDistanceDto } from './flight-distance.dto';
import { FlightStatusEnum } from './flight-status.enum';

@Exclude()
export class FlightDto {

    @Expose()
    @Type(() => FlightAircraftDto)
    aircraft: FlightAircraftDto;

    @Expose()
    @Type(() => FlightAirlineDto)
    airline: FlightAirlineDto;

    @Expose()
    @Type(() => FlightAirportMovementDto)
    arrival: FlightAirportMovementDto;

    @Expose()
    @Type(() => FlightAirportMovementDto)
    departure: FlightAirportMovementDto;

    @Expose()
    @Type(() => FlightDistanceDto)
    distance: FlightDistanceDto;

    @Expose()
    number: string;

    @Expose()
    callSign: string;

    @Expose()
    status: FlightStatusEnum;

}
