import { ListInput } from '@nestjs-boilerplate/core';

export class GetFlightsInput extends ListInput {
    userId: number;
}
