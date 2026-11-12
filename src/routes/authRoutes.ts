import express from "express";
import { AuthController } from "../controllers/AuthControllers.ts";
import { UserService } from "../services/UserService.ts";
import { AppDataSource } from "../config/data-source.ts";
import { User } from "../entities/User.ts";

const router = express.Router();
// instance of the class
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

router.post("/register", (req, res) => authController.register(req, res));

export default router;
