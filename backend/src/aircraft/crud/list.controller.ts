import { Get } from '@nestjs/common';
import { BasePaginatedResponse } from '../pagination/base-paginated-response.interface';
import { BaseCrudService, IdentifiableObject } from './base-crud.service';
import { ListFilter } from './list-filter.decorator';
import { ListQuery } from './list-query.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class ListController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Get()
    async list(@ListFilter() filter: ListQuery): Promise<BasePaginatedResponse<D>> {
        return super.list(filter);
    }
}
