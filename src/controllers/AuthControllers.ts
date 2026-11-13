import type { NextFunction, Response } from "express";
import type { RegisterRequest } from "../types/index.ts";
import { UserService } from "./../services/UserService.ts";
import type { Logger } from "winston";
import { ROLES } from "../constants/index.ts";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async register(req: RegisterRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug("new reqquest to register a user", {
            firstName,
            lastName,
            email,
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: ROLES.CUSTOMER,
            });
            this.logger.info("User has been ceated", { id: user.id });
            res.status(201).json({
                message: "User registered successfully",
                id: user.id,
            });
        } catch (err) {
            next(err);
        }
    }
}
