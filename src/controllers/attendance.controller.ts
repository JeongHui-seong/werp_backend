import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import { extractTokenFromHeader } from "../utils/jwt";

export class AttendanceController {
    private service = new AttendanceService();

    clockIn = async (req: Request, res: Response) => {
        const token = extractTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "인증 토큰이 필요합니다. Authorization 헤더에 Bearer 토큰을 포함해주세요."
            });
        }

        const result = await this.service.clockIn(token);
        
        if (!result.success) {
            // 토큰 검증 실패는 401, 사용자 조회 실패는 404, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("유효하지 않은 인증 토큰")) {
                statusCode = 401;
            } else if (result.message.includes("사용자를 찾을 수 없습니다")) {
                statusCode = 404;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }
}

