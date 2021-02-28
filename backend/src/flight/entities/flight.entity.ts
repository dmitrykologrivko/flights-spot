import {
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {
    any,
    Entity,
    BaseRootTypeormEntity,
    Embedded,
    ElementCollection,
    Validate,
    ValidationContainerException,
    ValidationResult,
    Result,
    ok,
} from '@nestjs-boilerplate/core';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { FlightStatusEnum } from '@source/base/flight-status.enum';
import { FlightAirportMovement } from './flight-airport-movement.value-object';
import { FlightArrivalAirportMovement } from './flight-arrival-airport-movement.value-object';
import { FlightDepartureAirportMovement } from './flight-departure-airport-movement.value-object';
import { FlightDistance } from './flight-distance.value-object';
import { FlightTicket } from './flight-ticket.value-object';

export type FlightStatus = FlightStatusEnum;

export enum FlightType {
    GENERAL = 'general',
    CUSTOM = 'custom',
}

export const AIRCRAFT_REG_MAX_LENGTH = 128;
export const NUMBER_MAX_LENGTH = 128;
export const CALL_SIGN_MAX_LENGTH = 128;

@Entity()
export class Flight extends BaseRootTypeormEntity {

    @ManyToOne(type => Aircraft, { eager: true })
    @JoinColumn()
    private _aircraft: Aircraft;

    @Column({
        name: 'aircraftReg',
        length: AIRCRAFT_REG_MAX_LENGTH,
    })
    private _aircraftReg: string;

    @ManyToOne(type => Airline, { eager: true })
    @JoinColumn()
    private _airline: Airline;

    @Embedded(type => FlightArrivalAirportMovement)
    private _arrival: FlightArrivalAirportMovement;

    @Embedded(type => FlightDepartureAirportMovement)
    private _departure: FlightDepartureAirportMovement;

    @Embedded(type => FlightDistance)
    private _distance: FlightDistance;

    @Column({
        name: 'number',
        length: NUMBER_MAX_LENGTH,
    })
    private _number: string;

    @Column({
        name: 'callSign',
        length: CALL_SIGN_MAX_LENGTH,
    })
    private _callSign: string;

    @Column({
        name: 'status',
        type: 'text',
    })
    private _status: FlightStatus;

    @Column({
        name: 'type',
        type: 'text',
    })
    private _type: FlightType;

    @ElementCollection(type => FlightTicket)
    private _tickets: FlightTicket[];

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
        type: FlightType,
        tickets?: FlightTicket[],
    ) {
        super();

        // Typeorm requires empty constructor
        if (!any([
            aircraft,
            aircraftReg,
            airline,
            arrival,
            departure,
            distance,
            number,
            callSign,
            status,
            type,
            tickets,
        ])) {
            return;
        }

        Validate.assertResults([
            Flight.validateAircraft(aircraft),
            Flight.validateAircraftReg(aircraftReg),
            Flight.validateAirline(airline),
            Flight.validateArrival(arrival),
            Flight.validateDeparture(departure),
            Flight.validateDistance(distance),
            Flight.validateCallSign(callSign),
            Flight.validateNumber(number),
            Flight.validateStatus(status),
            Flight.validateType(type),
            Flight.validateTickets(tickets, type),
        ]);

        this._aircraft = aircraft;
        this._aircraftReg = aircraftReg;
        this._airline = airline;
        this._arrival = arrival;
        this._departure = departure;
        this._distance = distance;
        this._number = number;
        this._callSign = callSign;
        this._status = status;
        this._type = type;
        this._tickets = tickets;
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
        return Validate.wrapConstruction(() => (
            new Flight(
                aircraft,
                aircraftReg,
                airline,
                arrival,
                departure,
                distance,
                number,
                callSign,
                status,
                FlightType.GENERAL,
            )
        ));
    }

    static createCustom(
        aircraft: Aircraft,
        aircraftReg: string,
        airline: Airline,
        arrival: FlightArrivalAirportMovement,
        departure: FlightDepartureAirportMovement,
        distance: FlightDistance,
        number: string,
        callSign: string,
        ticket: FlightTicket,
    ): Result<Flight, ValidationContainerException> {
        return Validate.wrapConstruction(() => (
            new Flight(
                aircraft,
                aircraftReg,
                airline,
                arrival,
                departure,
                distance,
                number,
                callSign,
                FlightStatusEnum.UNKNOWN,
                FlightType.CUSTOM,
                [ticket],
            )
        ));
    }

    addTicket(ticket: FlightTicket) {
        if (this._type === FlightType.GENERAL) {
            this._tickets = [
                ...this._tickets?.filter(value => value.passenger.id !== ticket.passenger.id),
                ticket,
            ];
        }
    }

    removeTicket(ticket: FlightTicket) {
        if (this._tickets && this._type === FlightType.GENERAL) {
            this._tickets = this._tickets.filter(value => value.passenger.id !== ticket.passenger.id);
        }
    }

    findTicketByPassengerId(passengerId: number) {
        return this._tickets?.find(value => value.passenger.id === passengerId);
    }

    changeAircraft(aircraft: Aircraft): ValidationResult {
        return Flight.validateAircraft(aircraft)
            .map(() => {
                this._aircraft = aircraft;
            });
    }

    changeAircraftReg(aircraftReg: string): ValidationResult {
        return Flight.validateAircraftReg(aircraftReg)
            .map(() => {
                this._aircraftReg = aircraftReg;
            });
    }

    changeAirline(airline: Airline): ValidationResult {
        return Flight.validateAirline(airline)
            .map(() => {
                this._airline = airline;
            });
    }

    changeArrival(arrival: FlightArrivalAirportMovement): ValidationResult {
        return Flight.validateArrival(arrival)
            .map(() => {
                this._arrival = arrival;
            });
    }

    changeDeparture(departure: FlightDepartureAirportMovement): ValidationResult {
        return Flight.validateDeparture(departure)
            .map(() => {
                this._departure = departure;
            });
    }

    changeDistance(distance: FlightDistance): ValidationResult {
        return Flight.validateDistance(distance)
            .map(() => {
                this._distance = distance;
            });
    }

    changeNumber(number: string): ValidationResult {
        return Flight.validateNumber(number)
            .map(() => {
                this._number = number;
            });
    }

    changeCallSign(callSign: string): ValidationResult {
        return Flight.validateCallSign(callSign)
            .map(() => {
                this._callSign = callSign;
            });
    }

    changeStatus(status: FlightStatusEnum): ValidationResult {
        if (this._type === FlightType.GENERAL) {
            return Flight.validateStatus(status)
                .map(() => {
                    this._status = status;
                });
        }
        return ok(null);
    }

    changeTicket(ticket: FlightTicket): ValidationResult {
        return Validate.withProperty('ticket', ticket)
            .isNotEmpty()
            .isValid()
            .map(() => {
                this._tickets = [
                    ...this._tickets?.filter(value => value.passenger.id !== ticket.passenger.id),
                    ticket,
                ];
            });
    }

    get aircraft(): Aircraft {
        return this._aircraft;
    }

    get aircraftReg(): string {
        return this._aircraftReg;
    }

    get airline(): Airline {
        return this._airline;
    }

    get arrival(): FlightArrivalAirportMovement {
        return this._arrival;
    }

    get departure(): FlightDepartureAirportMovement {
        return this._departure;
    }

    get distance(): FlightDistance {
        return this._distance;
    }

    get number(): string {
        return this._number;
    }

    get callSign(): string {
        return this._callSign;
    }

    get status(): FlightStatusEnum {
        return this._status;
    }

    get type(): FlightType {
        return this._type;
    }

    get tickets(): FlightTicket[] {
        return this._tickets;
    }

    protected static validateAircraft(aircraft: Aircraft) {
        return Validate.withProperty('aircraft', aircraft)
            .isNotEmpty()
            .isValid();
    }

    protected static validateAircraftReg(aircraftReg: string) {
        return Validate.withProperty('aircraftReg', aircraftReg)
            .isNotEmpty()
            .maxLength(AIRCRAFT_REG_MAX_LENGTH)
            .isValid();
    }

    protected static validateAirline(airline: Airline) {
        return Validate.withProperty('airline', airline)
            .isNotEmpty()
            .isValid();
    }

    protected static validateArrival(arrival: FlightArrivalAirportMovement) {
        return Validate.withProperty('arrival', arrival)
            .isNotEmpty()
            .isValid();
    }

    protected static validateDeparture(departure: FlightDepartureAirportMovement) {
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
            .maxLength(NUMBER_MAX_LENGTH)
            .isValid();
    }

    protected static validateCallSign(callSign: string) {
        return Validate.withProperty('callSign', callSign)
            .isNotEmpty()
            .maxLength(CALL_SIGN_MAX_LENGTH)
            .isValid();
    }

    protected static validateStatus(status: FlightStatusEnum) {
        return Validate.withProperty('status', status)
            .isNotEmpty()
            .isValid();
    }

    protected static validateType(type: FlightType) {
        return Validate.withProperty('type', type)
            .isNotEmpty()
            .isValid();
    }

    protected static validateTickets(tickets: FlightTicket[], type: FlightType) {
        return Validate.withProperty('tickets', tickets)
            .custom(
                'length',
                'Custom flight must have one ticket',
                (value: FlightTicket[]) => type === FlightType.CUSTOM && value.length === 1,
            )
            .isValid();
    }
}
