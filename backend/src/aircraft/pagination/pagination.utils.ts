import { PagePaginationQuery } from './page.pagination';
import { LimitOffsetPaginationQuery } from './limit-offset.pagination';
import { URL } from 'url';

export function extractPagePaginationQuery(request): PagePaginationQuery {
    const { query } = request;

    return {
        page: query.page ? parseInt(query.page.toString(), 10) : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        path: request.url,
    }
}

export function extractLimitOffsetPaginationQuery(request): LimitOffsetPaginationQuery {
    const { query } = request;

    return {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        offset: query.offset ? parseInt(query.offset.toString(), 10) : undefined,
        path: request.url,
    }
}

export function replaceUrlQueryParam(url: string, key: string, value: any) {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set(key, value.toString());
    return parsedUrl.toString();
}
