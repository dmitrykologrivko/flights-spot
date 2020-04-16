import { registerAs } from '@nestjs/config';

export default registerAs('databases', () => ([
    {
        type: 'sqlite',
        database: 'database',
        synchronize: true,
        autoLoadEntities: true,
    },
]));
