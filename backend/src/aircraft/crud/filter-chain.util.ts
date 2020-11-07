import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseFilter } from '../filters/base.filter';
import { BasePagination } from '../pagination/base.pagination';

export class FilterChain<T, R = unknown> {
    protected queryBuilder: SelectQueryBuilder<T>;

    protected filters: BaseFilter<T>[];

    protected pagination: BasePagination<T, R>;

    constructor(
        queryBuilderOrRepository: Repository<T> | SelectQueryBuilder<T>,
    ) {
        if (queryBuilderOrRepository instanceof Repository) {
            this.queryBuilder = queryBuilderOrRepository.createQueryBuilder('e');
        } else {
            this.queryBuilder = queryBuilderOrRepository;
        }

        this.filters = [];
    }

    static create<T, R = unknown>(
        queryBuilderOrRepository: Repository<T> | SelectQueryBuilder<T>,
    ) {
        return new FilterChain<T, R>(queryBuilderOrRepository);
    }

    addFilter(filterFactory: (qb: SelectQueryBuilder<T>) => BaseFilter<T>): FilterChain<T, R> {
        this.filters.push(filterFactory(this.queryBuilder));
        return this;
    }

    setPagination(paginationFactory: (qb: SelectQueryBuilder<T>) => BasePagination<T, R>): FilterChain<T, R> {
        this.pagination = paginationFactory(this.queryBuilder);
        return this;
    }

    filter(): SelectQueryBuilder<T> {
        for (const filter of this.filters) {
            filter.filter();
        }

        if (this.pagination) {
            this.pagination.paginate();
        }

        return this.queryBuilder;
    }

    async toEntities(): Promise<T[]> {
        return await this.filter().getMany();
    }

    async reduceEntities<V>(factory: (data: T[]) => V): Promise<V> {
        const data = await this.toEntities();
        return factory(data);
    }

    async mapEntities<V>(factory: (data: T[]) => V[]): Promise<V[]> {
        const data = await this.toEntities();
        return factory(data);
    }

    async toPaginatedResponse(): Promise<R> {
        if (!this.pagination) {
            throw new Error('Pagination class does not set!');
        }

        this.filter();

        return await this.pagination.toPaginatedResponse();
    }

    async mapPaginatedResponse<V>(factory: (response: R) => V): Promise<V> {
        const response = await this.toPaginatedResponse();
        return factory(response);
    }
}
