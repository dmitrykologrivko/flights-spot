import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractSearchQuery } from './filter.utils';

export const Search = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractSearchQuery(request);
    },
);
