import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { AttendanceController } from "./controllers/attendance.controller";

export const appRouter = Router();

const authController = new AuthController();
const attendanceController = new AttendanceController();

appRouter.post("/auth/find-email", authController.findEmail);
appRouter.post("/auth/resend-code", authController.resendCode);
appRouter.post("/auth/login", authController.login);

appRouter.post("/attendance/clockin", attendanceController.clockIn);
appRouter.post("/attendance/clockout", attendanceController.clockOut);
appRouter.get("/attendance/today", attendanceController.getTodayAttendance);
appRouter.get("/attendance/monthly", attendanceController.getMonthlyAttendance);