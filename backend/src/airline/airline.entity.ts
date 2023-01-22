import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
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
@Unique(['name', 'iata', 'icao'])
export class Airline extends BaseTypeormEntity {

    @Column({
        length: NAME_MAX_LENGTH,
    })
    name: string;

    @Column({
        length: IATA_LENGTH,
        nullable: true,
    })
    iata: string;

    @Column({
        length: ICAO_LENGTH,
        nullable: true,
    })
    icao: string;

    @Column({
        length: CALLSIGN_MAX_LENGTH,
        nullable: true,
    })
    callsign: string;

    @Column({
        length: COUNTRY_LENGTH,
    })
    country: string;

    @Column({
        default: true
    })
    active: boolean;

    constructor(
        name: string,
        iata: string,
        icao: string,
        callsign: string,
        country: string,
        active: boolean,
    ) {
        super();
        this.name = name;
        this.iata = iata;
        this.icao = icao;
        this.callsign = callsign;
        this.country = country;
        this.active = active;
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
        this.active = true;
    }

    deactivateAirline() {
        this.active = false;
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateIata(iata: string) {
        return Validate.withProperty('iata', iata)
            .isOptional()
            .isNotEmpty()
            .length(IATA_LENGTH, IATA_LENGTH)
            .isValid();
    }

    private static validateIcao(icao: string) {
        return Validate.withProperty('icao', icao)
            .isOptional()
            .isNotEmpty()
            .length(ICAO_LENGTH, ICAO_LENGTH)
            .isValid();
    }

    private static validateCallsign(callsign: string) {
        return Validate.withProperty('callsign', callsign)
            .isOptional()
            .isNotEmpty()
            .maxLength(CALLSIGN_MAX_LENGTH)
            .isValid();
    }

    private static validateCountry(country: string) {
        return Validate.withProperty('country', country)
            .isNotEmpty()
            .length(COUNTRY_LENGTH, COUNTRY_LENGTH)
            .isValid();
    }
}
