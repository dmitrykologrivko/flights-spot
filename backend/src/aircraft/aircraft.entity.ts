import { Column, Unique } from 'typeorm';
import {
    Entity,
    BaseEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const IATA_LENGTH = 3;
export const ICAO_LENGTH = 4;

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
            .minLength(ICAO_LENGTH)
            .maxLength(ICAO_LENGTH)
            .isValid();
    }
}
