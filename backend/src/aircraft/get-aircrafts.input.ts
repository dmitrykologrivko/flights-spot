import { ListQuery } from './crud/list-query.interface';

export class GetAircraftsInput implements ListQuery {
    limit: number;
    page: number;
    path: string;
    search: string;
    sortBy: string[];
    where: [string, string][];
    offset: number;
}
