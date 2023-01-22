import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const IATA_LENGTH = 3;
export const ICAO_MIN_LENGTH = 3;
export const ICAO_MAX_LENGTH = 4;

@Entity()
@Unique(['name', 'iata', 'icao'])
export class Aircraft extends BaseTypeormEntity {

    @Column({
        length: NAME_MAX_LENGTH
    })
    name: string;

    @Column({
        length: IATA_LENGTH,
        nullable: true,
    })
    iata: string;

    @Column({
        length: ICAO_MAX_LENGTH,
        nullable: true,
    })
    icao: string;

    constructor(name: string, iata: string, icao: string) {
        super();
        this.name = name;
        this.iata = iata;
        this.icao = icao;
    }

    static create(
        name: string,
        iata: string,
        icao: string,
    ): Result<Aircraft, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Aircraft.validateName(name),
            Aircraft.validateIata(iata),
            Aircraft.validateIcao(icao),
        ]);

        return validateResult.map(() => new Aircraft(name, iata, icao));
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
            .length(ICAO_MIN_LENGTH, ICAO_MAX_LENGTH)
            .isValid();
    }
}
