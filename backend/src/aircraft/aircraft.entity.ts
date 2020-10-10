import { Column } from 'typeorm';
import {
    Entity,
    BaseEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const NAME_MAX_LENGTH = 128;
export const IATA_LENGTH = 3;
export const ISO_LENGTH = 3;

@Entity()
export class Aircraft extends BaseEntity {

    @Column({
        name: 'name',
        length: NAME_MAX_LENGTH,
        unique: true,
    })
    private readonly _name: string;

    @Column({
        name: 'iataCode',
        length: IATA_LENGTH,
    })
    private readonly _iataCode: string;

    @Column({
        name: 'isoCode',
        length: ISO_LENGTH,
        nullable: true,
    })
    private readonly _isoCode: string;

    private constructor(name: string, iataCode: string, isoCode: string) {
        super();
        this._name = name;
        this._iataCode = iataCode;
        this._isoCode = isoCode;
    }

    static create(
        name: string,
        iataCode: string,
        isoCode: string,
    ): Result<Aircraft, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Aircraft.validateName(name),
            Aircraft.validateIataCode(iataCode),
            Aircraft.validateIsoCode(isoCode),
        ]);

        return validateResult.map(() => new Aircraft(name, iataCode, isoCode));
    }

    get name(): string {
        return this._name;
    }

    get isoCode(): string {
        return this._isoCode;
    }

    get iataCode(): string {
        return this._iataCode;
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateIataCode(iataCode: string) {
        return Validate.withProperty('iataCode', iataCode)
            .isNotEmpty()
            .minLength(IATA_LENGTH)
            .maxLength(IATA_LENGTH)
            .isValid();
    }

    private static validateIsoCode(isoCode: string) {
        if (!isoCode) {
            return Validate.withProperty('isoCode', isoCode)
                .isValid();
        }

        return Validate.withProperty('isoCode', isoCode)
            .minLength(ISO_LENGTH)
            .maxLength(ISO_LENGTH)
            .isValid();
    }
}
