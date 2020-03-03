import { EntityDto } from '@core/dto';

export class UserDto extends EntityDto {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isAdmin: boolean;
    isSuperuser: boolean;
}
