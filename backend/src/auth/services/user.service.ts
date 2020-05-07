import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, Ok, Err } from '@usefultools/monads';
import { PropertyConfigService } from '@core/config';
import { ApplicationService } from '@core/services';
import { ClassTransformer, ClassValidator } from '@core/utils';
import { EntityNotFoundException, ValidationException } from '@core/exceptions';
import { AUTH_SALT_ROUNDS_PROPERTY } from '../constants/auth.properties';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserOutput } from '../dto/create-user.output';
import { FindUserInput } from '../dto/find-user.input';
import { FindUserOutput } from '../dto/find-user.output';

type CreateUserResult = Promise<Result<CreateUserOutput, ValidationException[]>>;
type FindUserResult = Promise<Result<FindUserOutput, EntityNotFoundException>>;

@ApplicationService()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly config: PropertyConfigService,
    ) {}

    /**
     * Creates a new user entity
     * @param input create user dto
     * @return user dto
     */
    async createUser(input: CreateUserInput): CreateUserResult {
        const validateResult = await ClassValidator.validate(CreateUserInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const createUserResult = await User.create(
            input.username,
            input.password,
            input.email,
            input.firstName,
            input.lastName,
            input.isActive,
            input.isAdmin,
            input.isSuperuser,
            this.config.get(AUTH_SALT_ROUNDS_PROPERTY),
        );

        if (createUserResult.is_err()) {
            return createUserResult;
        }

        const user = await this.userRepository.save(createUserResult.unwrap());

        const output = ClassTransformer.toClassObject(CreateUserOutput, user);

        return Ok(output);
    }

    /**
     * Finds user by provided filters
     * @param input find user dto
     */
    async findUser(input: FindUserInput): FindUserResult {
        const user = await this.userRepository.findOne({
            where: { _username: input.username },
        });

        if (!user) {
            return Err(new EntityNotFoundException());
        }

        const output = ClassTransformer.toClassObject(FindUserOutput, user);

        return Ok(output);
    }
}
