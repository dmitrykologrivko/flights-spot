import { SearchQuery } from './search.filter';
import { OrderingQuery } from './ordering.filter';
import { WhereQuery, QUERY_NAME_CONDITION_REGEX } from './where.filter';

export function extractSearchQuery(request): SearchQuery {
    const { query } = request;

    const search: string = query.search || '';

    return {
        search,
    }
}

export function extractOrderingQuery(request, fieldSeparator = '__'): OrderingQuery {
    const { query } = request;

    let sortBy: string[] = [];

    if (query.sortBy) {
        sortBy = Array.isArray(query.sortBy)
            ? (query.sortBy as string[])
                .filter(param => param.length > 0)
                .map(param => param.split(','))
                .reduce((prev, current) => [...prev, ...current])
                .map(param => param.split(fieldSeparator).join('.'))
            : (query.sortBy as string)
                .split(',')
                .map(param => param.split(fieldSeparator).join('.'));
    }

    return {
        sortBy,
    };
}

export function extractWhereQuery(request, fieldSeparator = '__'): WhereQuery {
    const { query } = request;

    let where : [string, string][] = [];

    function mapCondition(param: string): [string, string] {
        const [ nameAndCondition, value ] = param.split('=');

        const match = nameAndCondition.match(QUERY_NAME_CONDITION_REGEX);

        if (!match) {
            return null;
        }

        return [
            `${match[1].split(fieldSeparator).join('.')}${match[2]}`,
            value,
        ];
    }

    if (query.where) {
        where = Array.isArray(query.where)
            ? (query.where as string[])
                .filter(param => param.length > 0)
                .map(mapCondition)
                .filter(param => param !== null)
            : [query.where as string]
                .map(mapCondition)
                .filter(param => param !== null);
    }

    return {
        where,
    };
}
