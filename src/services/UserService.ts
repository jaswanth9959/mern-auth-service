import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { Userdata } from "../types/index.ts";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: Userdata) {
        const user = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });

        return user;
    }
}
