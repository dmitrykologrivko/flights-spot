import { Exclude, Expose, Type } from 'class-transformer';
import { FlightAirportDto } from './flight-airport.dto';

@Exclude()
export class FlightAirportMovementDto {

    @Expose()
    actualTimeLocal: string;

    @Expose()
    actualTimeUtc: string;

    @Expose()
    scheduledTimeLocal: string;

    @Expose()
    scheduledTimeUtc: string;

    @Expose()
    @Type(() => FlightAirportDto)
    airport: FlightAirportDto;

}
