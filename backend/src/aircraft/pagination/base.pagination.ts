import { Repository, SelectQueryBuilder } from 'typeorm';

export abstract class BasePagination<T, R> {

    protected readonly queryBuilder: SelectQueryBuilder<T>;

    protected constructor(
        queryBuilderOrRepository: Repository<T> | SelectQueryBuilder<T>
    ) {
        if (queryBuilderOrRepository instanceof Repository) {
            this.queryBuilder = queryBuilderOrRepository.createQueryBuilder('e');
        } else {
            this.queryBuilder = queryBuilderOrRepository;
        }
    }

    abstract paginate(): SelectQueryBuilder<T>;

    abstract async toPaginatedResponse(): Promise<R>;
}
