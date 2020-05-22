import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './validation.exception';
import { NonFieldValidationException } from './non-field-validation.exception';
import { ValidationResultException } from './validation-result.exception';

@Catch(ValidationException, NonFieldValidationException, ValidationResultException)
export class ValidationExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        const statusCode = 400;
        let message = [];

        if (exception instanceof ValidationException || exception instanceof NonFieldValidationException) {
            message.push(exception);
        }

        if (exception instanceof ValidationResultException) {
            message = message.concat(exception.validationExceptions);
        }

        response.status(400).json({
            statusCode,
            error: 'Bad Request',
            message,
        });
    }
}
