import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractOrderingQuery } from './filter.utils';

export const SortBy = (fieldSeparator?: string): ParameterDecorator => {
    return createParamDecorator((data: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return extractOrderingQuery(request, data.fieldSeparator);
    })({ fieldSeparator });
};
