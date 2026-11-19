import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
// controller
import { AuthController } from "../controllers/AuthControllers.ts";
// services
import { UserService } from "../services/UserService.ts";
import { TokenService } from "../services/TokenService.ts";
//entity
import { User } from "../entities/User.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";
//database connection
import { AppDataSource } from "../config/data-source.ts";
//logger
import logger from "../config/logger.ts";
//express-validator
import registerValidator from "../validators/register-validator.ts";

const router = express.Router();
//tables in db
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
// instance of the class
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
