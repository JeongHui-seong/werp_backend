import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { AttendanceController } from "./controllers/attendance.controller";
import { LeavesController } from "./controllers/leaves.controller";
import { authenticate } from "./middlewares/auth.middleware";
import { requireRole } from "./middlewares/requireRole.middleware";

export const appRouter = Router();

const authController = new AuthController();
const attendanceController = new AttendanceController();
const leavesController = new LeavesController();

appRouter.post("/auth/find-email", authController.findEmail);
appRouter.post("/auth/resend-code", authController.resendCode);
appRouter.post("/auth/login", authController.login);

appRouter.post("/attendance/clockin", authenticate, attendanceController.clockIn);
appRouter.post("/attendance/clockout", authenticate, attendanceController.clockOut);
appRouter.get("/attendance/today", authenticate, attendanceController.getTodayAttendance);
appRouter.get("/attendance/monthly", authenticate, attendanceController.getMonthlyAttendance);
appRouter.get("/attendance/year-months", authenticate, attendanceController.getYearMonths);

appRouter.get("/leaves/types", authenticate, requireRole("admin"), leavesController.getLeaveTypes);
appRouter.post("/leaves/types", authenticate, requireRole("admin"), leavesController.upsertLeaveTypes);
appRouter.delete("/leaves/types", authenticate, requireRole("admin"), leavesController.deleteLeaveTypes);

appRouter.get("/leaves/policy", authenticate, requireRole("admin"), leavesController.getLeavePolicy);
appRouter.put("/leaves/policy", authenticate, requireRole("admin"), leavesController.updateLeavePolicy);

appRouter.get("/leaves/yearly", authenticate, leavesController.getLeaves);