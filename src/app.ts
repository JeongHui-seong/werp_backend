import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";

export const appRouter = Router();

const authController = new AuthController();

appRouter.post("/auth/find-email", authController.findEmail);