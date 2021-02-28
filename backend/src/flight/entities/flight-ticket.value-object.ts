import { Column, ManyToOne, JoinColumn } from 'typeorm';
import {
    Element,
    BaseElement,
    getTargetName,
    Result,
    Validate,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/auth';
import { Flight } from './flight.entity';

@Element({ parent: type => Flight })
export class FlightTicket extends BaseElement<Flight> {

    @ManyToOne(getTargetName(User), { eager: true })
    @JoinColumn()
    private readonly _passenger: User;

    @Column({
        name: 'seat',
        nullable: true,
    })
    private readonly _seat: string;

    @Column({
        name: 'note',
        nullable: true,
    })
    private readonly _note: string;

    private constructor(
        passenger: User,
        seat: string,
        note: string,
    ) {
        super();
        this._passenger = passenger;
        this._seat = seat;
        this._note = note;
    }

    static create(
        passenger: User,
        seat: string,
        note: string,
    ): Result<FlightTicket, ValidationContainerException> {
        const validateResult = Validate.withResults([
            FlightTicket.validatePassenger(passenger),
            FlightTicket.validateSeat(seat),
            FlightTicket.validateNote(note),
        ]);

        return validateResult.map(() => (
            new FlightTicket(
                passenger,
                seat,
                note,
            )
        ));
    }

    get passenger(): User {
        return this._passenger;
    }

    get seat(): string {
        return this._seat;
    }

    get note(): string {
        return this._note;
    }

    private static validatePassenger(passenger: User) {
        return Validate.withProperty('passenger', passenger)
            .isNotEmpty()
            .isValid();
    }

    private static validateSeat(seat: string) {
        return Validate.withProperty('seat', seat, true)
            .isValid();
    }

    private static validateNote(note: string) {
        return Validate.withProperty('note', note, true)
            .isValid();
    }
}
