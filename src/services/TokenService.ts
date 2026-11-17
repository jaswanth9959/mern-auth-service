import createHttpError from "http-errors";
import { sign, type JwtPayload } from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import { Config } from "../config/index.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";
import type { User } from "../entities/User.ts";
import type { Repository } from "typeorm";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    createAuthToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/privatekey.pem"),
            );
        } catch {
            const error = createHttpError(
                500,
                "error while crating privatekey",
            );
            throw error;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            issuer: "auth-service",
            expiresIn: "1h",
        });
        return accessToken;
    }

    createRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            issuer: "auth-service",
            expiresIn: "1y",
            jwtid: String(payload.id),
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }
}
