import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyConfigService } from '../config';
import { DATABASE_PROPERTY } from '../constants';

export const DatabaseModule = TypeOrmModule.forRootAsync({
    imports: [PropertyConfigService],
    useFactory: (config: PropertyConfigService) => {
        const options = config.get(DATABASE_PROPERTY);

        if (!options) {
            throw new Error('Database config is not defined! Please put it in your application config.');
        }

        return options;
    },
    inject: [PropertyConfigService],
});
