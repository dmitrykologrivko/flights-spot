import { ListQuery } from '@nestjs-boilerplate/core';

export class GetAirlinesInput implements ListQuery {
    limit: number;
    page: number;
    path: string;
    search: string;
    sortBy: string[];
    where: [string, string][];
    offset: number;
}
