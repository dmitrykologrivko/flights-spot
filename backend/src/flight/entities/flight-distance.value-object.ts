import { Column } from 'typeorm';
import {
    BaseValueObject,
    Validate,
    Result,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';

export class FlightDistance extends BaseValueObject {

    @Column()
    feet: number;

    @Column()
    km: number;

    @Column()
    meter: number;

    @Column()
    mile: number;

    @Column()
    nm: number;

    constructor(
        feet: number,
        km: number,
        meter: number,
        mile: number,
        nm: number,
    ) {
        super();
        this.feet = feet;
        this.km = km;
        this.meter = meter;
        this.mile = mile;
        this.nm = nm;
    }

    static create(
        feet: number,
        km: number,
        meter: number,
        mile: number,
        nm: number,
    ): Result<FlightDistance, ValidationContainerException> {
        return Validate.withResults([
            FlightDistance.validateFeet(feet),
            FlightDistance.validateKm(km),
            FlightDistance.validateMeter(meter),
            FlightDistance.validateMile(mile),
            FlightDistance.validateNm(nm),
        ]).map(() => (
            new FlightDistance(
                feet,
                km,
                meter,
                mile,
                nm,
            )
        ));
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
