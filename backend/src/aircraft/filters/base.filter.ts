import { Repository, SelectQueryBuilder } from 'typeorm';

export abstract class BaseFilter<T> {

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

    /**
     * Contains filter logic of current class implementation
     */
    abstract filter(): SelectQueryBuilder<T>;

    /**
     * Tries to adapt field name for using in query builder to avoid mistakes in field paths
     * For example "id" field name will be adapt to "entityAlias.id"
     * or "entityAlias.nestedAlias.id" will be adapt to "nestedAlias.id"
     * @param fieldName
     * @protected
     */
    protected adaptFieldName(fieldName: string) {
        const aliasPath = `${this.queryBuilder.alias}.`;
        const nameWithoutAlias = fieldName.replace(aliasPath, '');

        if (nameWithoutAlias.includes('.')) {
            return nameWithoutAlias;
        } else {
            return `${aliasPath}${nameWithoutAlias}`;
        }
    }

    /**
     * Returns unique param index that can be used in where statement
     * @param name param name, usually field name
     * @protected
     */
    protected getParamIndex(name: string): string {
        const time = process.hrtime();
        return `${name.replace('.', '_')}_${time[0]}${time[1]}`;
    }
}
