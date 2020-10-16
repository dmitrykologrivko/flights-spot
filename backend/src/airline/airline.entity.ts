import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const CALLSIGN_MAX_LENGTH = 128;
export const IATA_LENGTH = 2;
export const ICAO_LENGTH = 3;
export const COUNTRY_LENGTH = 2;

@Entity()
@Unique(['_name', '_iata', '_icao', '_callsign', '_country'])
export class Airline extends BaseEntity {

    @Column({
        name: 'name',
        length: NAME_MAX_LENGTH,
    })
    private readonly _name: string;

    @Column({
        name: 'iata',
        length: IATA_LENGTH,
        nullable: true,
    })
    private readonly _iata: string;

    @Column({
        name: 'icao',
        length: ICAO_LENGTH,
        nullable: true,
    })
    private readonly _icao: string;

    @Column({
        name: 'callsign',
        length: CALLSIGN_MAX_LENGTH,
        nullable: true,
    })
    private readonly _callsign: string;

    @Column({
        name: 'country',
        length: COUNTRY_LENGTH,
    })
    private readonly _country: string;

    @Column({
        name: 'active',
        default: true
    })
    private _active: boolean;

    private constructor(
        name: string,
        iata: string,
        icao: string,
        callsign: string,
        country: string,
        active: boolean,
    ) {
        super();
        this._name = name;
        this._iata = iata;
        this._icao = icao;
        this._callsign = callsign;
        this._country = country;
        this._active = active;
    }

    static create(
        name: string,
        iata: string,
        icao: string,
        callsign: string,
        country: string,
        active: boolean = true,
    ): Result<Airline, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Airline.validateName(name),
            Airline.validateIata(iata),
            Airline.validateIcao(icao),
            Airline.validateCallsign(callsign),
            Airline.validateCountry(country),
        ]);

        return validateResult.map(() => new Airline(
            name,
            iata,
            icao,
            callsign,
            country,
            active
        ));
    }

    activateAirline() {
        this._active = true;
    }

    deactivateAirline() {
        this._active = false;
    }

    get name(): string {
        return this._name;
    }

    get iata(): string {
        return this._iata;
    }

    get icao(): string {
        return this._icao;
    }

    get callsign(): string {
        return this._callsign;
    }

    get country(): string {
        return this._country;
    }

    get active(): boolean {
        return this._active;
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateIata(iata: string) {
        if (!iata) {
            return Validate.withProperty('iata', iata)
                .isValid();
        }

        return Validate.withProperty('iata', iata)
            .isNotEmpty()
            .minLength(IATA_LENGTH)
            .maxLength(IATA_LENGTH)
            .isValid();
    }

    private static validateIcao(icao: string) {
        if (!icao) {
            return Validate.withProperty('icao', icao)
                .isValid();
        }

        return Validate.withProperty('icao', icao)
            .isNotEmpty()
            .minLength(ICAO_LENGTH)
            .maxLength(ICAO_LENGTH)
            .isValid();
    }

    private static validateCallsign(callsign: string) {
        if (!callsign) {
            return Validate.withProperty('callsign', callsign)
                .isValid();
        }

        return Validate.withProperty('callsign', callsign)
            .isNotEmpty()
            .maxLength(CALLSIGN_MAX_LENGTH)
            .isValid();
    }

    private static validateCountry(country: string) {
        return Validate.withProperty('country', country)
            .isNotEmpty()
            .minLength(COUNTRY_LENGTH)
            .maxLength(COUNTRY_LENGTH)
            .isValid();
    }
}
