import { registerAs } from '../config/property-config.utils';

export default registerAs('databases', () => ([
    {
        type: 'sqlite',
        database: 'database',
        synchronize: true,
        autoLoadEntities: true,
    },
]));
