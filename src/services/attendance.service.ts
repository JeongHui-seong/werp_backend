import { AttendanceRepository } from "../repositories/attendance.repository";
import { UserRepository } from "../repositories/user.repository";
import { verifyToken } from "../utils/jwt";

export class AttendanceService {
    private attendanceRepo = new AttendanceRepository();
    private userRepo = new UserRepository();

    async clockIn(token: string, date?: string, clockin?: string) {
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
            const attendance = await this.attendanceRepo.create(user.id, date, clockin);

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

    async getTodayAttendance(token: string, dateString: string) {
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
            // 날짜 문자열 파싱 (예: "2025-01-15")
            if (!dateString) {
                return {
                    success: false,
                    message: "날짜가 필요합니다. (예: 2025-01-15)"
                };
            }

            // 날짜의 출퇴근 정보 조회
            const attendance = await this.attendanceRepo.findByUserIdAndDate(user.id, dateString);

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

    async clockOut(token: string, attendanceId: number, clockout?: string) {
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
            const updatedAttendance = await this.attendanceRepo.updateClockout(attendanceId, clockout);

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

    async getMonthlyAttendance(token: string, yearMonth: string, startWorkTime: string) {
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
            // yearMonth 파싱 (예: "2025-01")
            const [yearStr, monthStr] = yearMonth.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);

            if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
                return {
                    success: false,
                    message: "유효하지 않은 년월 형식입니다. (예: 2025-01)"
                };
            }

            // startWorkTime 파싱 (예: "09:00")
            const [hourStr, minuteStr] = startWorkTime.split(':');
            const startHour = parseInt(hourStr, 10);
            const startMinute = parseInt(minuteStr, 10);

            if (isNaN(startHour) || isNaN(startMinute) || startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
                return {
                    success: false,
                    message: "유효하지 않은 근무시작시간 형식입니다. (예: 09:00)"
                };
            }

            // 월별 출퇴근 데이터 조회
            const attendances = await this.attendanceRepo.findByUserIdAndMonth(user.id, year, month);

            // summary 계산
            let totalWorkMinutes = 0;
            let overtimeMinutes = 0;
            let lateMinutes = 0;
            const records: any[] = [];

            for (const attendance of attendances) {
                // worktime이 있는 경우에만 계산
                if (attendance.worktime !== null) {
                    totalWorkMinutes += attendance.worktime;

                    // 9시간(540분) 초과한 경우 초과 시간 계산
                    if (attendance.worktime > 540) {
                        overtimeMinutes += (attendance.worktime - 540);
                    }
                }

                // 지각 시간 계산
                if (attendance.clockin) {
                    const clockinDate = new Date(attendance.clockin);
                    const clockinHour = clockinDate.getHours();
                    const clockinMinute = clockinDate.getMinutes();
                    const clockinTotalMinutes = clockinHour * 60 + clockinMinute;
                    const startWorkTotalMinutes = startHour * 60 + startMinute;

                    if (clockinTotalMinutes > startWorkTotalMinutes) {
                        const lateTime = clockinTotalMinutes - startWorkTotalMinutes;
                        lateMinutes += lateTime;
                    }
                }

                // record 생성
                let lateTime = 0;
                if (attendance.clockin) {
                    const clockinDate = new Date(attendance.clockin);
                    const clockinHour = clockinDate.getHours();
                    const clockinMinute = clockinDate.getMinutes();
                    const clockinTotalMinutes = clockinHour * 60 + clockinMinute;
                    const startWorkTotalMinutes = startHour * 60 + startMinute;

                    if (clockinTotalMinutes > startWorkTotalMinutes) {
                        lateTime = clockinTotalMinutes - startWorkTotalMinutes;
                    }
                }

                // leave 정보 추출 (status가 approved인 경우만)
                let leaveType = null;
                if (attendance.leave && attendance.leave.status === 'approved') {
                    leaveType = attendance.leave.leave_type?.type || null;
                }

                records.push({
                    date: attendance.date,
                    clockIn: attendance.clockin,
                    clockOut: attendance.clockout,
                    worktime: attendance.worktime,
                    lateTime: lateTime,
                    leave: leaveType,
                    note: attendance.note,
                });
            }

            // 평균 근무 시간 계산
            const validCount = attendances.filter(a => a.worktime !== null).length;
            const avgWorkMinutes = validCount > 0 ? Math.floor(totalWorkMinutes / validCount) : 0;

            return {
                success: true,
                message: "월별 출퇴근 정보를 조회했습니다.",
                summary: {
                    totalWorkMinutes: totalWorkMinutes,
                    avgWorkMinutes: avgWorkMinutes,
                    overtimeMinutes: overtimeMinutes,
                    lateMinutes: lateMinutes,
                },
                records: records,
            };
        } catch (error) {
            console.error("월별 출퇴근 정보 조회 실패:", error);
            return {
                success: false,
                message: "월별 출퇴근 정보 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }
}

