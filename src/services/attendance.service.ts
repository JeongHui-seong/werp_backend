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

    async getTodayAttendance(token: string) {
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
            // 오늘 날짜의 출퇴근 정보 조회
            const today = new Date();
            const attendance = await this.attendanceRepo.findByUserIdAndDate(user.id, today);

            return {
                success: true,
                message: "출퇴근 정보를 조회했습니다.",
                attendance: {
                    id: attendance?.id,
                    user_id: attendance?.user_id,
                    date: attendance?.date ? attendance.date : null,
                    clockin: attendance?.clockin ? attendance.clockin : null,
                    clockout: attendance?.clockout ? attendance.clockout : null,
                }
            };
        } catch (error) {
            console.error("출퇴근 정보 조회 실패:", error);
            return {
                success: false,
                message: "출퇴근 정보 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    } 

    async clockOut(token: string, attendanceId: number) {
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
            // attendance 조회 및 검증
            const attendance = await this.attendanceRepo.findById(attendanceId);
            
            if (!attendance) {
                return {
                    success: false,
                    message: "출근 기록을 찾을 수 없습니다."
                };
            }

            // 본인의 출근 기록인지 확인
            if (attendance.user_id !== user.id) {
                return {
                    success: false,
                    message: "본인의 출근 기록만 수정할 수 있습니다."
                };
            }

            // 이미 퇴근 처리가 되어 있는지 확인
            if (attendance.clockout !== null) {
                return {
                    success: false,
                    message: "이미 퇴근 처리가 완료되었습니다."
                };
            }

            // 퇴근 시간 업데이트
            const updatedAttendance = await this.attendanceRepo.updateClockout(attendanceId);

            return {
                success: true,
                message: "퇴근 완료! 오늘 하루 수고하셨습니다 😊",
                attendance: {
                    id: updatedAttendance.id,
                    user_id: updatedAttendance.user_id,
                    date: updatedAttendance.date,
                    clockin: updatedAttendance.clockin,
                    clockout: updatedAttendance.clockout,
                }
            };
        } catch (error) {
            console.error("퇴근 등록 실패:", error);
            return {
                success: false,
                message: "퇴근 등록에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }
}

