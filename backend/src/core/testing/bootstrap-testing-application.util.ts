import { INestApplicationContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';

export interface TestingBootstrapper {
    container: INestApplicationContext;
    init: () => Promise<void>;
}

export interface TestingBootstrapOptions {
    module: any;
    imports?: any[];
}

export async function bootstrapTestingApplication(options: TestingBootstrapOptions): Promise<TestingBootstrapper> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [options.module, ...options.imports || []],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Set dependency injection container for class validator
    useContainer(app.select(options.module), { fallbackOnErrors: true });

    const init = async () => {
        await app.init();
    };

    return {
        container: app,
        init,
    };
}
