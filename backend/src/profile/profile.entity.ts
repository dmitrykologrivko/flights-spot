import { Entity, Column, PrimaryColumn, OneToOne } from 'typeorm';
import { User } from '@auth/entities';

@Entity()
export class Profile {

    @PrimaryColumn()
    id: number;

    @Column()
    uid: string;

    @OneToOne(type => User)
    user: User;

}
