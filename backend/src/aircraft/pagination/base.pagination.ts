import { Repository, SelectQueryBuilder } from 'typeorm';
import { BasePaginatedResponse } from './base-paginated-response.interface';

export abstract class BasePagination<E, P extends BasePaginatedResponse<E>> {

    protected readonly queryBuilder: SelectQueryBuilder<E>;

    protected constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>
    ) {
        if (queryBuilderOrRepository instanceof Repository) {
            this.queryBuilder = queryBuilderOrRepository.createQueryBuilder(
                queryBuilderOrRepository.metadata.name,
            );
        } else {
            this.queryBuilder = queryBuilderOrRepository;
        }
    }

    abstract paginate(): SelectQueryBuilder<E>;

    async toPaginatedResponse(): Promise<P> {
        return {
            results: await this.queryBuilder.getMany(),
        } as P;
    };
}
