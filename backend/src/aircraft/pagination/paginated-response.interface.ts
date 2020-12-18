import { BasePaginatedResponse } from './base-paginated-response.interface';

export interface PaginatedResponse<T> extends BasePaginatedResponse<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];
}
