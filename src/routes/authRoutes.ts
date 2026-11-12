import express from "express";
import { AuthController } from "../controllers/AuthControllers.ts";

const router = express.Router();
// instance of the class
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));

export default router;
