import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

export class AttendanceRepository {
    async create(userId: string, dateString?: string, clockinString?: string) {
        // dateString을 ISO 형식으로 변환 (yyyy-MM-ddT00:00:00)
        let date: Date;
        if (dateString) {
            date = new Date(`${dateString}T00:00:00`);
        } else {
            // dateString이 없으면 오늘 날짜 사용
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date = today;
        }

        // clockin 파싱 (HH:mm:ss 형식)
        let clockin: Date | null = null;
        if (clockinString) {
            const [hours, minutes, seconds = 0] = clockinString.split(':').map(Number);
            clockin = new Date(1970, 0, 1, hours, minutes, seconds);
        } else {
            // 현재 시간에서 시간 부분만 추출
            const now = new Date();
            clockin = new Date(1970, 0, 1, now.getHours(), now.getMinutes(), now.getSeconds());
        }

        return prisma.attendance.create({
            data: {
                user_id: userId,
                date: date,
                clockin: clockin,
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
            }
        });
    }

    async findByUserIdAndDate(userId: string, dateString: string) {
        // dateString을 ISO 형식으로 변환하여 날짜 비교
        const date = new Date(`${dateString}T00:00:00`);
        
        // 해당 날짜의 시작과 끝 시간 설정
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return prisma.attendance.findFirst({
            where: {
                user_id: userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
            }
        });
    }

    async updateClockout(attendanceId: number, clockoutString?: string) {
        // 먼저 attendance를 조회하여 clockin과 date 값을 가져옵니다
        const attendance = await prisma.attendance.findUnique({
            where: {
                id: attendanceId,
            },
            select: {
                date: true,
                clockin: true,
            }
        });

        if (!attendance || !attendance.clockin) {
            throw new Error("출근 기록을 찾을 수 없거나 출근 시간이 없습니다.");
        }

        // clockout 파싱 (HH:mm:ss 형식)
        let clockoutTime: Date;
        if (clockoutString) {
            const [hours, minutes, seconds = 0] = clockoutString.split(':').map(Number);
            clockoutTime = new Date(1970, 0, 1, hours, minutes, seconds);
        } else {
            // 현재 시간에서 시간 부분만 추출
            const now = new Date();
            clockoutTime = new Date(1970, 0, 1, now.getHours(), now.getMinutes(), now.getSeconds());
        }
        
        // worktime 계산을 위해 date와 clockin, clockout을 결합
        const clockinDate = new Date(attendance.date);
        clockinDate.setHours(attendance.clockin.getHours(), attendance.clockin.getMinutes(), attendance.clockin.getSeconds());
        
        const clockoutDate = new Date(attendance.date);
        if (clockoutString) {
            const [hours, minutes, seconds = 0] = clockoutString.split(':').map(Number);
            clockoutDate.setHours(hours, minutes, seconds);
        } else {
            const now = new Date();
            clockoutDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        }
        
        // worktime 계산 (clockout - clockin을 분 단위로)
        const worktimeMinutes = Math.floor((clockoutDate.getTime() - clockinDate.getTime()) / (1000 * 60));

        return prisma.attendance.update({
            where: {
                id: attendanceId,
            },
            data: {
                clockout: clockoutTime,
                worktime: worktimeMinutes,
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
                worktime: true,
            }
        });
    }

    async findById(attendanceId: number) {
        return prisma.attendance.findUnique({
            where: {
                id: attendanceId,
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
            }
        });
    }

    async findByUserIdAndMonth(userId: string, year: number, month: number) {
        // 해당 월의 시작일과 종료일 계산
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        return prisma.attendance.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                // 휴가와 연결된 근태는 제외 (leaves_id가 null인 것만)
                leaves_id: null,
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
                worktime: true,
                note: true,
                leave: {
                    select: {
                        status: true,
                        leave_type: {
                            select: {
                                type: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'asc',
            }
        });
    }
}

