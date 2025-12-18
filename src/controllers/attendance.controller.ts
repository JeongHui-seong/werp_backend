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

    getTodayAttendance = async (req: Request, res: Response) => {
        const token = extractTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "인증 토큰이 필요합니다. Authorization 헤더에 Bearer 토큰을 포함해주세요."
            });
        }

        const result = await this.service.getTodayAttendance(token);
        
        if (!result.success) {
            // 토큰 검증 실패는 401, 사용자 조회 실패는 404, 데이터 없음은 404, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("유효하지 않은 인증 토큰")) {
                statusCode = 401;
            } else if (result.message.includes("사용자를 찾을 수 없습니다")){
                statusCode = 404;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    clockOut = async (req: Request, res: Response) => {
        const token = extractTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "인증 토큰이 필요합니다. Authorization 헤더에 Bearer 토큰을 포함해주세요."
            });
        }

        // 바디에서 attendance ID 추출
        const { attendanceId } = req.body;

        if (!attendanceId) {
            return res.status(400).json({
                success: false,
                message: "attendanceId가 필요합니다."
            });
        }

        // attendanceId가 숫자인지 확인
        const id = Number(attendanceId);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "유효하지 않은 attendanceId입니다."
            });
        }

        const result = await this.service.clockOut(token, id);
        
        if (!result.success) {
            // 토큰 검증 실패는 401, 사용자 조회 실패는 404, 출근 기록 없음은 404, 
            // 권한 없음은 403, 이미 퇴근 완료는 409, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("유효하지 않은 인증 토큰")) {
                statusCode = 401;
            } else if (result.message.includes("사용자를 찾을 수 없습니다") || 
                       result.message.includes("출근 기록을 찾을 수 없습니다")) {
                statusCode = 404;
            } else if (result.message.includes("본인의 출근 기록만")) {
                statusCode = 403;
            } else if (result.message.includes("이미 퇴근 처리")) {
                statusCode = 409;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    getMonthlyAttendance = async (req: Request, res: Response) => {
        const token = extractTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "인증 토큰이 필요합니다. Authorization 헤더에 Bearer 토큰을 포함해주세요."
            });
        }

        // 쿼리 파라미터에서 yearMonth와 startWorkTime 추출
        const { yearMonth, startWorkTime } = req.query;

        if (!yearMonth || typeof yearMonth !== 'string') {
            return res.status(400).json({
                success: false,
                message: "yearMonth 쿼리 파라미터가 필요합니다. (예: 2025-01)"
            });
        }

        if (!startWorkTime || typeof startWorkTime !== 'string') {
            return res.status(400).json({
                success: false,
                message: "startWorkTime 쿼리 파라미터가 필요합니다. (예: 09:00)"
            });
        }

        const result = await this.service.getMonthlyAttendance(token, yearMonth, startWorkTime);
        
        if (!result.success) {
            // 토큰 검증 실패는 401, 사용자 조회 실패는 404, 유효하지 않은 파라미터는 400, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("유효하지 않은 인증 토큰")) {
                statusCode = 401;
            } else if (result.message.includes("사용자를 찾을 수 없습니다")) {
                statusCode = 404;
            } else if (result.message.includes("유효하지 않은")) {
                statusCode = 400;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }
}

