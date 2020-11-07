import { Repository, SelectQueryBuilder } from 'typeorm'
import { BasePagination } from './base.pagination';
import { PaginatedResponse } from './paginated-response.interface';
import { replaceUrlQueryParam } from './pagination.utils';

const PAGE_QUERY_KEY = 'page';

export interface PagePaginationQuery {
    limit: number;
    page: number;
    path: string;
}

export interface PagePaginationMeta {
    pageSize?: number;
}

export class PagePagination<T> extends BasePagination<T, PaginatedResponse<T>> {

    protected readonly page: number;

    protected readonly limit: number;

    protected readonly offset: number;

    constructor(
        queryBuilderOrRepository: Repository<T> | SelectQueryBuilder<T>,
        protected readonly query: PagePaginationQuery,
        protected readonly meta: PagePaginationMeta = { pageSize: 100 },
    ) {
        super(queryBuilderOrRepository);
        this.page = this.query.page || 1;
        this.limit = this.query.limit || this.meta.pageSize;
        this.offset = (this.page - 1) * this.limit;
    }

    paginate() {
        return this.queryBuilder
            .take(this.limit)
            .skip(this.offset);
    }

    async toPaginatedResponse(): Promise<PaginatedResponse<T>> {
        const [results, count] = await this.queryBuilder.getManyAndCount();

        const previous = this.offset !== 0
            ? replaceUrlQueryParam(this.query.path, PAGE_QUERY_KEY, this.page - 1)
            : null;
        const next = this.offset < count && this.offset + 1 < count
            ? replaceUrlQueryParam(this.query.path, PAGE_QUERY_KEY, this.page + 1)
            : null;

        return {
            count,
            previous,
            next,
            results,
        };
    }
}
