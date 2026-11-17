import type { NextFunction, Response } from "express";
import type { RegisterRequest } from "../types/index.ts";
import { UserService } from "./../services/UserService.ts";
import type { Logger } from "winston";
import { ROLES } from "../constants/index.ts";
import { validationResult } from "express-validator";
import type { TokenService } from "../services/TokenService.ts";
import type { JwtPayload } from "jsonwebtoken";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.createAuthToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.createRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: true,
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: true,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 365,
            });
            res.status(201).json({
                message: "User registered successfully",
                id: user.id,
            });
        } catch (err) {
            next(err);
        }
    }
}
