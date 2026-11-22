import type { NextFunction, Response } from "express";
import type { AuthRequest, RegisterRequest } from "../types/index.ts";
import { UserService } from "./../services/UserService.ts";
import type { Logger } from "winston";
import { ROLES } from "../constants/index.ts";
import { validationResult } from "express-validator";
import type { TokenService } from "../services/TokenService.ts";
import type { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService.ts";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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

    async login(req: RegisterRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.debug("new reqquest to login a user", {
            email,
        });

        // check if email exists in db
        //compare password
        //generate tokens
        //add tokens to cookies
        //return the response

        try {
            const user = await this.userService.findUserByEmail(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(error);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(400, "incorrect password");
                next(error);
            }

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
            this.logger.info("User has been logged in", { id: user.id });
            res.status(200).json({
                message: "User loggged in successfully",
                id: user.id,
            });
        } catch (err) {
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findUserById(Number(req.auth.sub));
        res.json({ ...user, password: undefined });
    }
}
