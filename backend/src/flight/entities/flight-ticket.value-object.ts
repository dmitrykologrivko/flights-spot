import { Column, ManyToOne, JoinColumn } from 'typeorm';
import {
    BaseValueObject,
    Result,
    Validate,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';

export class FlightTicket extends BaseValueObject {

    @Column({
        nullable: true,
    })
    seat: string;

    @Column({
        nullable: true,
    })
    note: string;

    constructor(seat: string, note: string) {
        super();
        this.seat = seat;
        this.note = note;
    }

    static create(
        seat: string,
        note: string,
    ): Result<FlightTicket, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightTicket.validateSeat(seat),
            FlightTicket.validateNote(note),
        ]);

        return validateResult.map(() => (
            new FlightTicket(seat, note)
        ));
    }

    private static validateSeat(seat: string) {
        return Validate.withProperty('seat', seat)
            .isOptional()
            .isValid();
    }

    private static validateNote(note: string) {
        return Validate.withProperty('note', note)
            .isOptional()
            .isValid();
    }
}
