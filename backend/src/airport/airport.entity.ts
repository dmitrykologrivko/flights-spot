import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const CITY_MAX_LENGTH = 128;
export const COUNTRY_LENGTH = 2;
export const IATA_LENGTH = 3;
export const ICAO_LENGTH = 4;

@Entity()
@Unique(['_name', '_iata', '_icao'])
export class Airport extends BaseEntity {

    @Column({
        name: 'name',
        length: NAME_MAX_LENGTH,
    })
    private readonly _name: string;

    @Column({
        name: 'city',
        length: CITY_MAX_LENGTH,
    })
    private readonly _city: string;

    @Column({
        name: 'country',
        length: COUNTRY_LENGTH,
    })
    private readonly _country: string;

    @Column({
        name: 'iata',
        nullable: true,
    })
    private readonly _iata: string;

    @Column({
        name: 'icao',
        nullable: true,
    })
    private readonly _icao: string;

    @Column({
        name: 'latitude',
    })
    private readonly _latitude: number;

    @Column({
        name: 'longitude',
    })
    private readonly _longitude: number;

    @Column({
        name: 'utc',
    })
    private readonly _utc: number;

    private constructor(
        name: string,
        city: string,
        country: string,
        iata: string,
        icao: string,
        latitude: number,
        longitude: number,
        utc: number,
    ) {
        super();
        this._name = name;
        this._city = city;
        this._country = country;
        this._iata = iata;
        this._icao = icao;
        this._latitude = latitude;
        this._longitude = longitude;
        this._utc = utc;
    }

    static create(
        name: string,
        city: string,
        country: string,
        iata: string,
        icao: string,
        latitude: number,
        longitude: number,
        utc: number,
    ): Result<Airport, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Airport.validateName(name),
            Airport.validateCity(city),
            Airport.validateCountry(country),
            Airport.validateIata(iata),
            Airport.validateIcao(icao),
            Airport.validateLatitude(latitude),
            Airport.validateLongitude(longitude),
            Airport.validateUtc(utc),
        ]);

        return validateResult.map(() => new Airport(
            name,
            city,
            country,
            iata,
            icao,
            latitude,
            longitude,
            utc,
        ));
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateCity(city: string) {
        return Validate.withProperty('city', city)
            .isNotEmpty()
            .maxLength(CITY_MAX_LENGTH)
            .isValid();
    }

    private static validateCountry(country: string) {
        return Validate.withProperty('country', country)
            .isNotEmpty()
            .length(COUNTRY_LENGTH, COUNTRY_LENGTH)
            .isValid();
    }

    private static validateIata(iata: string) {
        return Validate.withProperty('iata', iata, true)
            .isNotEmpty()
            .length(IATA_LENGTH, IATA_LENGTH)
            .isValid();
    }

    private static validateIcao(icao: string) {
        return Validate.withProperty('icao', icao, true)
            .isNotEmpty()
            .length(ICAO_LENGTH, ICAO_LENGTH)
            .isValid();
    }

    private static validateLatitude(latitude: number) {
        return Validate.withProperty('latitude', latitude)
            .isNotEmpty()
            .isValid();
    }

    private static validateLongitude(longitude: number) {
        return Validate.withProperty('longitude', longitude)
            .isNotEmpty()
            .isValid();
    }

    private static validateUtc(utc: number) {
        return Validate.withProperty('utc', utc)
            .isNotEmpty()
            .isValid();
    }
}
