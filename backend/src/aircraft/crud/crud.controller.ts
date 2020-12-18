import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { BasePaginatedResponse } from '../pagination/base-paginated-response.interface';
import { BaseCrudService, IdentifiableObject } from './base-crud.service';
import { BaseCrudController } from './base-crud.controller';
import { ListFilter } from './list-filter.decorator';
import { ListQuery } from './list-query.interface';

export abstract class CrudController<D extends IdentifiableObject> extends BaseCrudController<D> {
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

    @Get(':id')
    async retrieve(@Param('id') id: any): Promise<D> {
        return super.retrieve(id);
    }

    @Put(':id')
    async replace(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.replace(id, input);
    }

    @Patch(':id')
    async partial_update(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.partial_update(id, input);
    }

    @Delete(':id')
    async destroy(@Param('id') id: any): Promise<void> {
        return super.destroy(id);
    }
}
