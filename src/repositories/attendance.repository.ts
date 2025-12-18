import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

export class AttendanceRepository {
    async create(userId: string) {
        return prisma.attendance.create({
            data: {
                user_id: userId,
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

    async findByUserIdAndDate(userId: string, date: Date) {
        // 오늘 날짜의 시작 시간과 끝 시간 설정
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

    async updateClockout(attendanceId: number) {
        // 먼저 attendance를 조회하여 clockin 값을 가져옵니다
        const attendance = await prisma.attendance.findUnique({
            where: {
                id: attendanceId,
            },
            select: {
                clockin: true,
            }
        });

        if (!attendance || !attendance.clockin) {
            throw new Error("출근 기록을 찾을 수 없거나 출근 시간이 없습니다.");
        }

        // clockout 시간 설정
        const clockoutTime = new Date();
        
        // worktime 계산 (clockout - clockin을 분 단위로)
        const worktimeMinutes = Math.floor((clockoutTime.getTime() - attendance.clockin.getTime()) / (1000 * 60));

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

