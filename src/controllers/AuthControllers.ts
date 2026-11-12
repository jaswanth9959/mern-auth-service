import type { Response } from "express";
import type { RegisterRequest } from "../types/index.ts";
import { UserService } from "./../services/UserService.ts";

export class AuthController {
    constructor(private userService: UserService) {}
    async register(req: RegisterRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        await this.userService.create({ firstName, lastName, email, password });
        res.status(201).json({
            message: "User registered successfully",
        });
    }
}
