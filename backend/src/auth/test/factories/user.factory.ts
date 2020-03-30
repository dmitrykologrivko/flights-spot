import { User } from '../../entities/user.entity';

export class UserFactory {
    static async makeUser(id: number = 1) {
        const createUserResult = await User.create(
          'john_smith',
          '12345678',
          'test@test.com',
          'John',
          'Smith',
          true,
          false,
          false,
        );

        const user = createUserResult.unwrap();

        user.id = id;

        return user;
    }
}
