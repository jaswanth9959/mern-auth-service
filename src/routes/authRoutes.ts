import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import { AuthController } from "../controllers/AuthControllers.ts";
import { UserService } from "../services/UserService.ts";
import { AppDataSource } from "../config/data-source.ts";
import { User } from "../entities/User.ts";
import logger from "../config/logger.ts";
import registerValidator from "../validators/register-validator.ts";
import { TokenService } from "../services/TokenService.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";

const router = express.Router();
// instance of the class
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);

const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
