import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
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
@Unique(['name', 'iata', 'icao'])
export class Airport extends BaseTypeormEntity {

    @Column({
        length: NAME_MAX_LENGTH,
    })
    name: string;

    @Column({
        length: CITY_MAX_LENGTH,
    })
    city: string;

    @Column({
        length: COUNTRY_LENGTH,
    })
    country: string;

    @Column({
        nullable: true,
    })
    iata: string;

    @Column({
        nullable: true,
    })
    icao: string;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @Column()
    utc: number;

    constructor(
        name: string,
        city: string,
        country: string,
        iata: string,
        icao: string,
        latitude: number,
        longitude: number,
        utc: number
    ) {
        super();
        this.name = name;
        this.city = city;
        this.country = country;
        this.iata = iata;
        this.icao = icao;
        this.latitude = latitude;
        this.longitude = longitude;
        this.utc = utc;
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
