import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractLimitOffsetPaginationQuery } from './pagination.utils';

export const LimitOffset = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractLimitOffsetPaginationQuery(request);
    },
);
