import { Get, Post, Body } from '@nestjs/common';
import { BasePaginatedResponse } from '../pagination/base-paginated-response.interface';
import { BaseCrudService, IdentifiableObject } from './base-crud.service';
import { ListFilter } from './list-filter.decorator';
import { ListQuery } from './list-query.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class ListCreateController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Get()
    async list(@ListFilter() filter: ListQuery): Promise<BasePaginatedResponse<D>> {
        return super.list(filter);
    }

    @Post()
    async create(@Body() input: D): Promise<D> {
        return super.create(input);
    }
}
