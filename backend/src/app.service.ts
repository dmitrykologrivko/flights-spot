import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class AppService {
  constructor(
      private readonly modulesContainer: ModulesContainer,
      private readonly metadataScanner: MetadataScanner,
  ) { }

  getHello(): string {
    // const components = [
    //   ...this.modulesContainer.values(),
    // ].map(module => module.components);
    //
    // const instances = components.map(component => [...component.values()].map(({ instance, metatype }) => {
    //   if (!instance) return;
    //
    //   const prototype = Object.getPrototypeOf(instance);
    //   return prototype;
    //   //return this.metadataScanner.scanFromPrototype(instance, prototype, name => name);
    // }));



    const modules = [...this.modulesContainer.values()];
    const controllersMap = modules
        //.filter(({ controllers }) => controllers.size > 0)
        .map(module => module.providers);

    const providers: Map<string, InstanceWrapper> = new Map<string, InstanceWrapper>();

    controllersMap.forEach(moduleProviders => moduleProviders.forEach((provider, key) => providers.set(key, provider)));

    console.log(providers);

    return 'Hello World!';
  }
}
