import { Controller, ControllerOptions } from '@nestjs/common';
import { isEmpty, isUndefined } from '@core/utils';

export interface ApiControllerOptions extends ControllerOptions {
    useGlobalPrefix?: boolean;
    rootPrefix?: string;
    version?: number;
    versionPrefix?: string;
    additionalPrefixes?: string[];
}

export function ApiController(): ClassDecorator;

export function ApiController(prefix: string): ClassDecorator;

export function ApiController(options: ApiControllerOptions): ClassDecorator;

export function ApiController(prefixOrOptions?: string | ApiControllerOptions) {
    if (isUndefined(prefixOrOptions)) {
        return Controller();
    }

    if (typeof prefixOrOptions === 'string') {
        return Controller({ path: `api/${prefixOrOptions}` });
    }

    const rootPrefix = prefixOrOptions.useGlobalPrefix
        ? ''
        : `${prefixOrOptions.rootPrefix || 'api'}/`;

    const versionPrefix = isUndefined(prefixOrOptions.version) && isEmpty(prefixOrOptions.versionPrefix)
        ? ''
        : `${prefixOrOptions.version ? `v${prefixOrOptions.version}` : prefixOrOptions.versionPrefix}/`;

    const additionalPrefixes = isEmpty(prefixOrOptions.additionalPrefixes)
        ? ''
        : `${prefixOrOptions.additionalPrefixes.join('/')}/`;

    const prefix = isEmpty(prefixOrOptions.path)
        ? ''
        : prefixOrOptions.path;

    prefixOrOptions.path = `${rootPrefix}${versionPrefix}${additionalPrefixes}${prefix}`;

    return Controller(prefixOrOptions);
}
