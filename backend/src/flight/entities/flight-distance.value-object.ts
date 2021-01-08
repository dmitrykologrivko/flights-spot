import { Column } from 'typeorm';
import {
    ValueObject,
    BaseValueObject,
    Validate,
    Result,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';

@ValueObject()
export class FlightDistance extends BaseValueObject {

    @Column({
        name: 'feet',
    })
    private readonly _feet: number;

    @Column({
        name: 'km',
    })
    private readonly _km: number;

    @Column({
        name: 'meter',
    })
    private readonly _meter: number;

    @Column({
        name: 'mile',
    })
    private readonly _mile: number;

    @Column({
        name: 'nm',
    })
    private readonly _nm: number;

    private constructor(
        feet: number,
        km: number,
        meter: number,
        mile: number,
        nm: number,
    ) {
        super();
        this._feet = feet;
        this._km = km;
        this._meter = meter;
        this._mile = mile;
        this._nm = nm;
    }

    static create(
        feet: number,
        km: number,
        meter: number,
        mile: number,
        nm: number,
    ): Result<FlightDistance, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightDistance.validateFeet(feet),
            FlightDistance.validateKm(km),
            FlightDistance.validateMeter(meter),
            FlightDistance.validateMile(mile),
            FlightDistance.validateNm(nm),
        ]);

        return validateResult.map(() => {
            return new FlightDistance(
                feet,
                km,
                meter,
                mile,
                nm,
            )
        });
    }

    private static validateFeet(feet: number) {
        return Validate.withProperty('feet', feet)
            .isNotEmpty()
            .isValid();
    }

    private static validateKm(km: number) {
        return Validate.withProperty('km', km)
            .isNotEmpty()
            .isValid();
    }

    private static validateMeter(meter: number) {
        return Validate.withProperty('meter', meter)
            .isNotEmpty()
            .isValid();
    }

    private static validateMile(mile: number) {
        return Validate.withProperty('mile', mile)
            .isNotEmpty()
            .isValid();
    }

    private static validateNm(nm: number) {
        return Validate.withProperty('nm', nm)
            .isNotEmpty()
            .isValid();
    }
}
