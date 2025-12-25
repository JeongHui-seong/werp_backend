import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { AttendanceController } from "./controllers/attendance.controller";
import { LeavesController } from "./controllers/leaves.controller";

export const appRouter = Router();

const authController = new AuthController();
const attendanceController = new AttendanceController();
const leavesController = new LeavesController();

appRouter.post("/auth/find-email", authController.findEmail);
appRouter.post("/auth/resend-code", authController.resendCode);
appRouter.post("/auth/login", authController.login);

appRouter.post("/attendance/clockin", attendanceController.clockIn);
appRouter.post("/attendance/clockout", attendanceController.clockOut);
appRouter.get("/attendance/today", attendanceController.getTodayAttendance);
appRouter.get("/attendance/monthly", attendanceController.getMonthlyAttendance);
appRouter.get("/attendance/year-months", attendanceController.getYearMonths);

appRouter.get("/leaves/types", leavesController.getLeaveTypes);
appRouter.post("/leaves/types", leavesController.upsertLeaveTypes);
appRouter.delete("/leaves/types", leavesController.deleteLeaveTypes);