import { Repository, SelectQueryBuilder } from 'typeorm'
import { BasePagination } from './base.pagination';
import { PaginatedResponse } from './paginated-response.interface';
import { replaceUrlQueryParam } from './pagination.utils';

const OFFSET_QUERY_KEY = 'offset';

export interface LimitOffsetPaginationQuery {
    limit: number;
    offset: number;
    path: string;
}

export interface LimitOffsetPaginationMeta {
    pageSize?: number;
}

export class LimitOffsetPagination<T> extends BasePagination<T, PaginatedResponse<T>> {

    protected readonly limit: number;

    protected readonly offset: number;

    constructor(
        queryBuilderOrRepository: Repository<T> | SelectQueryBuilder<T>,
        protected readonly query: LimitOffsetPaginationQuery,
        protected readonly meta: LimitOffsetPaginationMeta = { pageSize: 100 },
    ) {
        super(queryBuilderOrRepository);
        this.limit = this.query.limit || this.meta.pageSize;
        this.offset = this.query.offset || 0;
    }

    paginate() {
        return this.queryBuilder
            .take(this.limit)
            .skip(this.offset);
    }

    async toPaginatedResponse(): Promise<PaginatedResponse<T>> {
        const [results, count] = await this.queryBuilder.getManyAndCount();

        const previous = this.offset !== 0
            ? replaceUrlQueryParam(this.query.path, OFFSET_QUERY_KEY, this.limit - this.offset)
            : null;
        const next = this.offset < count && this.limit + this.offset < count
            ? replaceUrlQueryParam(this.query.path, OFFSET_QUERY_KEY, this.limit + this.offset)
            : null;

        return {
            count,
            previous,
            next,
            results,
        };
    }
}
