import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { Userdata } from "../types/index.ts";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: Userdata) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            const err = createHttpError(400, "Email already exists");
            throw err;
        }
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });

            return user;
        } catch (err) {
            console.error("Database error:", err);
            throw createHttpError(500, "Unable to save user data");
        }
    }
}
