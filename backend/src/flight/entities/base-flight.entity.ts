import {
    TableInheritance,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Entity, BaseEntity, Validate } from '@nestjs-boilerplate/core';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { FlightStatusEnum } from '@source/base/flight-status.enum';
import { FlightAirportMovement } from './flight-airport-movement.value-object';
import { FlightDistance } from './flight-distance.value-object';

@Entity({ name: 'flight' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class BaseFlight extends BaseEntity {

    @ManyToOne(type => Aircraft)
    @JoinColumn()
    protected _aircraft: Aircraft;

    @ManyToOne(type => Airline)
    @JoinColumn()
    protected _airline: Airline;

    @OneToOne(type => FlightAirportMovement)
    @JoinColumn()
    protected _arrival: FlightAirportMovement;

    @OneToOne(type => FlightAirportMovement)
    @JoinColumn()
    protected _departure: FlightAirportMovement;

    @OneToOne(type => FlightDistance)
    @JoinColumn()
    protected _distance: FlightDistance;

    @Column({
        name: 'number',
    })
    protected _number: string;

    @Column({
        name: 'callSign',
    })
    protected _callSign: string;

    @Column({
        name: 'status',
        type: 'text',
    })
    protected _status: FlightStatusEnum;

    protected constructor(
        aircraft: Aircraft,
        airline: Airline,
        arrival: FlightAirportMovement,
        departure: FlightAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
    ) {
        super();
        this._aircraft = aircraft;
        this._airline = airline;
        this._arrival = arrival;
        this._departure = departure;
        this._distance = distance;
        this._number = number;
        this._callSign = callSign;
        this._status = status;
    }

    protected static validateAircraft(aircraft: Aircraft) {
        return Validate.withProperty('aircraft', aircraft)
            .isNotEmpty()
            .isValid();
    }

    protected static validateAirline(airline: Airline) {
        return Validate.withProperty('airline', airline)
            .isNotEmpty()
            .isValid();
    }

    protected static validateArrival(arrival: FlightAirportMovement) {
        return Validate.withProperty('arrival', arrival)
            .isNotEmpty()
            .isValid();
    }

    protected static validateDeparture(departure: FlightAirportMovement) {
        return Validate.withProperty('departure', departure)
            .isNotEmpty()
            .isValid();
    }

    protected static validateDistance(distance: FlightDistance) {
        return Validate.withProperty('distance', distance)
            .isNotEmpty()
            .isValid();
    }

    protected static validateNumber(number: string) {
        return Validate.withProperty('number', number)
            .isNotEmpty()
            .isValid();
    }

    protected static validateCallSign(callSign: string) {
        return Validate.withProperty('callSign', callSign)
            .isNotEmpty()
            .isValid();
    }

    protected static validateStatus(status: FlightStatusEnum) {
        return Validate.withProperty('status', status)
            .isNotEmpty()
            .isValid();
    }
}
