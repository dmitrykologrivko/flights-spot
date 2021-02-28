import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class FlightPassengerDto extends BaseEntityDto {

    @Expose()
    username: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

}
