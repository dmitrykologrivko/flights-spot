import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';

const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

export function DisableActions(actions: string[]) {
    return (target: Function) => {
        console.log(Reflect.getPrototypeOf(target.prototype))
        actions.forEach(action => {
            if (typeof target.prototype[action] === 'function') {
                //Reflect.defineMetadata(PATH_METADATA, '/', target.prototype, action);
                //Reflect.defineMetadata(METHOD_METADATA, RequestMethod.GET, target.prototype, action);
                // Reflect.deleteMetadata(PATH_METADATA, target, action);
                // Reflect.deleteMetadata(METHOD_METADATA, target, action);
            }
        });
    };
}
