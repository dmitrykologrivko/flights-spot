import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Group, Permission } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([User, Group, Permission])],
})
export class AuthModule {}
