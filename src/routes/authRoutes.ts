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
import loginValidator from "../validators/login-validator.ts";
import { CredentialService } from "../services/CredentialService.ts";
import authenticate from "../middlewares/authenticate.ts";
import { AuthRequest } from "../types/index.ts";

const router = express.Router();
//tables in db
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
// instance of the class
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res),
);

export default router;
