import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";

export class AttendanceController {
    private service = new AttendanceService();

    clockIn = async (req: Request, res: Response) => {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "token을 입력해주세요."
            });
        }

        const result = await this.service.clockIn(token);
        return res.json(result);
    }
}

