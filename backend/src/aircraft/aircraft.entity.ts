import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const IATA_MIN_LENGTH = 2;
export const IATA_MAX_LENGTH = 4;
export const ICAO_MIN_LENGTH = 2;
export const ICAO_MAX_LENGTH = 4;

@Entity()
@Unique(['_name', '_iata', '_icao'])
export class Aircraft extends BaseEntity {

    @Column({
        name: 'name',
        length: NAME_MAX_LENGTH,
    })
    private readonly _name: string;

    @Column({
        name: 'iata',
        length: IATA_MAX_LENGTH,
        nullable: true,
    })
    private readonly _iata: string;

    @Column({
        name: 'icao',
        length: ICAO_MAX_LENGTH,
        nullable: true,
    })
    private readonly _icao: string;

    private constructor(name: string, iata: string, icao: string) {
        super();
        this._name = name;
        this._iata = iata;
        this._icao = icao;
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

    get name(): string {
        return this._name;
    }

    get icao(): string {
        return this._icao;
    }

    get iata(): string {
        return this._iata;
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateIata(iata: string) {
        return Validate.withProperty('iata', iata, true)
            .isNotEmpty()
            .length(IATA_MIN_LENGTH, IATA_MAX_LENGTH)
            .isValid();
    }

    private static validateIcao(icao: string) {
        return Validate.withProperty('icao', icao, true)
            .length(ICAO_MIN_LENGTH, ICAO_MAX_LENGTH)
            .isValid();
    }
}
