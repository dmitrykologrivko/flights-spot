import { PagePaginationQuery } from './page.pagination';
import { LimitOffsetPaginationQuery } from './limit-offset.pagination';
import { URL } from 'url';

function buildUrlFromRequest(request) {
    return `${request.protocol}://${request.headers.host}${request.url}`;
}

export function extractPagePaginationQuery(request): PagePaginationQuery {
    const { query } = request;

    return {
        page: query.page ? parseInt(query.page.toString(), 10) : undefined,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        path: buildUrlFromRequest(request),
    }
}

export function extractLimitOffsetPaginationQuery(request): LimitOffsetPaginationQuery {
    const { query } = request;

    return {
        limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
        offset: query.offset ? parseInt(query.offset.toString(), 10) : undefined,
        path: buildUrlFromRequest(request),
    }
}

export function replaceUrlQueryParam(url: string, key: string, value: any) {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set(key, value.toString());
        return parsedUrl.toString();
    } catch (e) {
        return null;
    }
}

export function removeUrlQueryParam(url: string, key: string) {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.delete(key);
        return parsedUrl.toString();
    } catch (e) {
        return null;
    }
}
