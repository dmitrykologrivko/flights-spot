import {
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {
    Entity,
    BaseRootTypeormEntity,
    Embedded,
    Validate,
    ValidationContainerException,
    ValidationResult,
    Result,
    ok,
    err,
    getTargetName,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/user';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { Airport } from '@airport/airport.entity';
import { FlightStatusEnum } from '@source/base/flight-status.enum';
import { IncompleteFlightException } from '../exceptions/incomplete-flight.exception';
import { FlightArrivalAirportMovement } from './flight-arrival-airport-movement.value-object';
import { FlightDepartureAirportMovement } from './flight-departure-airport-movement.value-object';
import { FlightDistance } from './flight-distance.value-object';
import { FlightTicket } from './flight-ticket.value-object';

export type FlightStatus = FlightStatusEnum;

export interface FlightDistanceProvider {
    getFlightDistance(
        arrivalAirport: Airport,
        departureAirport: Airport
    ): Promise<Result<FlightDistance, IncompleteFlightException>>;
}

export const AIRCRAFT_REG_MAX_LENGTH = 128;
export const NUMBER_MAX_LENGTH = 128;
export const CALL_SIGN_MAX_LENGTH = 128;

@Entity()
export class Flight extends BaseRootTypeormEntity {

    @ManyToOne(
        type => Aircraft,
        { nullable: false, eager: true }
    )
    @JoinColumn()
    aircraft: Aircraft;

    @Column({
        length: AIRCRAFT_REG_MAX_LENGTH,
        nullable: true,
    })
    aircraftReg: string;

    @ManyToOne(
        type => Airline,
        { nullable: false, eager: true }
    )
    @JoinColumn()
    airline: Airline;

    @Embedded(type => FlightArrivalAirportMovement)
    arrival: FlightArrivalAirportMovement;

    @Embedded(type => FlightDepartureAirportMovement)
    departure: FlightDepartureAirportMovement;

    @Embedded(type => FlightDistance)
    distance: FlightDistance;

    @Column({
        length: NUMBER_MAX_LENGTH,
    })
    number: string;

    @Column({
        length: CALL_SIGN_MAX_LENGTH,
        nullable: true,
    })
    callSign: string;

    @Column({
        type: 'text',
    })
    status: FlightStatus;

    @Embedded(type => FlightTicket)
    ticket: FlightTicket;

    @ManyToOne(
        getTargetName(User),
        { nullable: false, eager: true }
    )
    @JoinColumn()
    user: User;

    constructor(
        aircraft: Aircraft,
        aircraftReg: string,
        airline: Airline,
        arrival: FlightArrivalAirportMovement,
        departure: FlightDepartureAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
        ticket: FlightTicket,
        user: User,
    ) {
        super();
        this.aircraft = aircraft;
        this.aircraftReg = aircraftReg;
        this.airline = airline;
        this.arrival = arrival;
        this.departure = departure;
        this.distance = distance;
        this.number = number;
        this.callSign = callSign;
        this.status = status;
        this.ticket = ticket;
        this.user = user;
    }

    static async create(
        aircraft: Aircraft,
        aircraftReg: string,
        airline: Airline,
        arrival: FlightArrivalAirportMovement,
        departure: FlightDepartureAirportMovement,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
        ticket: FlightTicket,
        user: User,
        flightDistanceProvider: FlightDistanceProvider,
    ): Promise<Result<Flight, ValidationContainerException | IncompleteFlightException>> {
        // Calculate flight distance between arrival and departure airports
        const getFlightDistanceResult = await flightDistanceProvider.getFlightDistance(
            arrival.airport,
            departure.airport
        );

        if (getFlightDistanceResult.isErr()) {
            return err(getFlightDistanceResult.unwrapErr());
        }

        const distance: FlightDistance = getFlightDistanceResult.unwrap();

        return Validate.withResults([
            Flight.validateAircraft(aircraft),
            Flight.validateAircraftReg(aircraftReg),
            Flight.validateAirline(airline),
            Flight.validateArrival(arrival),
            Flight.validateDeparture(departure),
            Flight.validateDistance(distance),
            Flight.validateCallSign(callSign),
            Flight.validateNumber(number),
            Flight.validateStatus(status),
            Flight.validateTicket(ticket),
            Flight.validateUser(user),
        ]).map(() => new Flight(
            aircraft,
            aircraftReg,
            airline,
            arrival,
            departure,
            getFlightDistanceResult.unwrap(),
            number,
            callSign,
            status,
            ticket,
            user,
        ));
    }

    static createGeneral(
        aircraft: Aircraft,
        aircraftReg: string,
        airline: Airline,
        arrival: FlightArrivalAirportMovement,
        departure: FlightDepartureAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        status: FlightStatusEnum,
    ): Result<Flight, ValidationContainerException> {
        const validateResults = Validate.withResults([
            Flight.validateAircraft(aircraft),
            Flight.validateAircraftReg(aircraftReg),
            Flight.validateAirline(airline),
            Flight.validateArrival(arrival),
            Flight.validateDeparture(departure),
            Flight.validateDistance(distance),
            Flight.validateCallSign(callSign),
            Flight.validateNumber(number),
            Flight.validateStatus(status),
        ]);

        return validateResults.map(() => new Flight(
            aircraft,
            aircraftReg,
            airline,
            arrival,
            departure,
            distance,
            number,
            callSign,
            status,
            null,
            null,
        ));
    }

    async change(
        values: {
            aircraft?: Aircraft,
            aircraftReg?: string,
            airline?: Airline,
            arrival?: FlightArrivalAirportMovement,
            departure?: FlightDepartureAirportMovement,
            distance?: FlightDistance,
            number?: string,
            callSign?: string,
            status?: FlightStatusEnum,
            ticket?: FlightTicket,
        },
        flightDistanceProvider: FlightDistanceProvider,
    ): Promise<Result<Flight, ValidationContainerException | IncompleteFlightException>> {
        let distance: FlightDistance;

        // Calculate flight distance between arrival and departure airports if one of them was changed
        if (values.arrival || values.departure) {
            const getFlightDistanceResult = await flightDistanceProvider.getFlightDistance(
                values.arrival ? values.arrival.airport : this.arrival.airport,
                values.departure ? values.departure.airport : this.departure.airport,
            );

            if (getFlightDistanceResult.isErr()) {
                return err(getFlightDistanceResult.unwrapErr());
            }

            distance = getFlightDistanceResult.unwrap();
        }

        return Validate.withResults([
            values.aircraft ? this.changeAircraft(values.aircraft) : ok(null),
            values.aircraftReg ? this.changeAircraftReg(values.aircraftReg) : ok(null),
            values.airline ? this.changeAirline(values.airline) : ok(null),
            values.arrival ? this.changeArrival(values.arrival) : ok(null),
            values.departure ? this.changeDeparture(values.departure) : ok(null),
            distance ? this.changeDistance(distance) : ok(null),
            values.number ? this.changeNumber(values.number) : ok(null),
            values.callSign ? this.changeCallSign(values.callSign) : ok(null),
            values.status ? this.changeStatus(values.status) : ok(null),
            values.ticket ? this.changeTicket(values.ticket) : ok(null),
        ]).map(() => this);
    }

    changeAircraft(aircraft: Aircraft): ValidationResult {
        return Flight.validateAircraft(aircraft)
            .map(() => {
                this.aircraft = aircraft;
            });
    }

    changeAircraftReg(aircraftReg: string): ValidationResult {
        return Flight.validateAircraftReg(aircraftReg)
            .map(() => {
                this.aircraftReg = aircraftReg;
            });
    }

    changeAirline(airline: Airline): ValidationResult {
        return Flight.validateAirline(airline)
            .map(() => {
                this.airline = airline;
            });
    }

    changeNumber(number: string): ValidationResult {
        return Flight.validateNumber(number)
            .map(() => {
                this.number = number;
            });
    }

    changeCallSign(callSign: string): ValidationResult {
        return Flight.validateCallSign(callSign)
            .map(() => {
                this.callSign = callSign;
            });
    }

    changeStatus(status: FlightStatusEnum): ValidationResult {
        return Flight.validateStatus(status)
            .map(() => {
                this.status = status;
            });
    }

    changeTicket(ticket: FlightTicket): ValidationResult {
        return Flight.validateTicket(ticket)
            .map(() => {
                this.ticket = ticket;
            });
    }

    protected changeArrival(arrival: FlightArrivalAirportMovement): ValidationResult {
        return Flight.validateArrival(arrival)
            .map(() => {
                this.arrival = arrival;
            });
    }

    protected changeDeparture(departure: FlightDepartureAirportMovement): ValidationResult {
        return Flight.validateDeparture(departure)
            .map(() => {
                this.departure = departure;
            });
    }

    protected changeDistance(distance: FlightDistance): ValidationResult {
        return Flight.validateDistance(distance)
            .map(() => {
                this.distance = distance;
            });
    }

    private static validateAircraft(aircraft: Aircraft) {
        return Validate.withProperty('aircraft', aircraft)
            .isNotEmpty()
            .isValid();
    }

    private static validateAircraftReg(aircraftReg: string) {
        return Validate.withProperty('aircraftReg', aircraftReg)
            .isOptional()
            .isNotEmpty()
            .maxLength(AIRCRAFT_REG_MAX_LENGTH)
            .isValid();
    }

    private static validateAirline(airline: Airline) {
        return Validate.withProperty('airline', airline)
            .isNotEmpty()
            .isValid();
    }

    private static validateArrival(arrival: FlightArrivalAirportMovement) {
        return Validate.withProperty('arrival', arrival)
            .isNotEmpty()
            .isValid();
    }

    private static validateDeparture(departure: FlightDepartureAirportMovement) {
        return Validate.withProperty('departure', departure)
            .isNotEmpty()
            .isValid();
    }

    private static validateDistance(distance: FlightDistance) {
        return Validate.withProperty('distance', distance)
            .isNotEmpty()
            .isValid();
    }

    private static validateNumber(number: string) {
        return Validate.withProperty('number', number)
            .isNotEmpty()
            .maxLength(NUMBER_MAX_LENGTH)
            .isValid();
    }

    private static validateCallSign(callSign: string) {
        return Validate.withProperty('callSign', callSign)
            .isOptional()
            .isNotEmpty()
            .maxLength(CALL_SIGN_MAX_LENGTH)
            .isValid();
    }

    private static validateStatus(status: FlightStatusEnum) {
        return Validate.withProperty('status', status)
            .isNotEmpty()
            .isValid();
    }

    private static validateTicket(ticket: FlightTicket) {
        return Validate.withProperty('ticket', ticket)
            .isNotEmpty()
            .isValid();
    }

    private static validateUser(user: User) {
        return Validate.withProperty('user', user)
            .isNotEmpty()
            .isValid();
    }
}
