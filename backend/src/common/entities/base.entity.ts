import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseEntity implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    created: Date;

    @Column({ type: 'timestamp' })
    updated: Date;
}
