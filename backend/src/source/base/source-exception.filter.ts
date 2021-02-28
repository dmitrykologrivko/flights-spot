import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { SourceException } from './source.exception';

@Catch(SourceException)
export class SourceExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        response.status(503).json({
            statusCode: 503,
            error: 'Service Unavailable',
            message: 'Service Unavailable',
        });
    }
}
