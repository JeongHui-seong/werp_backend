import { AttendanceRepository } from "../repositories/attendance.repository";
import { UserRepository } from "../repositories/user.repository";
import { verifyToken } from "../utils/jwt";

export class AttendanceService {
    private attendanceRepo = new AttendanceRepository();
    private userRepo = new UserRepository();

    async clockIn(token: string) {
        // JWT 토큰 검증 및 email 추출
        const payload = verifyToken(token);
        
        if (!payload) {
            return {
                success: false,
                message: "유효하지 않은 인증 토큰입니다. 다시 로그인해주세요."
            };
        }

        // email로 user 조회하여 user_id 가져오기
        const user = await this.userRepo.findByEmail(payload.email);
        
        if (!user) {
            return {
                success: false,
                message: "사용자를 찾을 수 없습니다."
            };
        }

        try {
            // 출근 기록 생성
            const attendance = await this.attendanceRepo.create(user.id);

            return {
                success: true,
                message: "출근 완료! 오늘도 힘내세요 ☺️",
                attendance: {
                    id: attendance.id,
                    user_id: attendance.user_id,
                    date: attendance.date,
                    clockin: attendance.clockin,
                    clockout: attendance.clockout,
                }
            };
        } catch (error) {
            console.error("출근 등록 실패:", error);
            return {
                success: false,
                message: "출근 등록에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }
}

