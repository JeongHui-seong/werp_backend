import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

export class AttendanceRepository {
    async create(userId: string, dateString?: string, clockinString?: string) {
        // dateString 필수 체크
        if (!dateString) {
            throw new Error("date는 필수입니다. (yyyy-MM-dd 형식)");
        }

        // dateString을 ISO 형식으로 변환 (yyyy-MM-ddT00:00:00)
        const date = new Date(`${dateString}T00:00:00Z`);

        // clockinString 필수 체크
        if (!clockinString) {
            throw new Error("clockin은 필수입니다. (ISO 형식)");
        }

        // clockin은 ISO 형식 문자열을 그대로 Date 객체로 변환
        const clockin = new Date(clockinString);

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
        return prisma.attendance.findFirst({
            where: {
                user_id: userId,
                date: {
                    gte: new Date(`${dateString}T00:00:00Z`),
                    lte: new Date(`${dateString}T23:59:59Z`),
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

        // clockoutString 필수 체크
        if (!clockoutString) {
            throw new Error("clockout은 필수입니다. (ISO 형식)");
        }

        // clockout은 ISO 형식 문자열을 그대로 Date 객체로 변환
        const clockoutTime = new Date(clockoutString);
        
        // worktime 계산 (clockout - clockin을 분 단위로)
        // clockin과 clockout이 이미 ISO 형식의 Date 객체이므로 직접 계산
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
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const nextMonthDate = new Date(Date.UTC(year, month, 1));

        return prisma.attendance.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: startDate,
                    lt: nextMonthDate,
                },
                // 휴가와 연결된 근태는 제외 (leaves_date_id가 null인 것만)
                leave_date_id: null,
            },
            select: {
                id: true,
                user_id: true,
                date: true,
                clockin: true,
                clockout: true,
                worktime: true,
                note: true,
                leave_date: {
                    select: {
                        leave_request: {
                            select: {
                                status: true,
                                leave_type: {
                                    select: {
                                        type: true
                                    }
                                }
                            }
                    }
                }
            }},
            orderBy: {
                date: 'asc',
            }
        });
    }

    async findDistinctYearMonthsByUserId(userId: string): Promise<string[]> {
        // 해당 사용자의 모든 attendance에서 date 필드만 가져오기
        const attendances = await prisma.attendance.findMany({
            where: {
                user_id: userId,
            },
            select: {
                date: true,
            },
            orderBy: {
                date: 'desc',
            }
        });

        // date에서 년월만 추출하여 중복 제거 (타임존 변환 없이 문자열에서 직접 추출)
        const yearMonths = new Set<string>();
        attendances.forEach(attendance => {
            // Date 객체를 ISO 문자열로 변환 후 앞 7자리(YYYY-MM)만 추출
            const yearMonth = attendance.date.toISOString().slice(0, 7);
            yearMonths.add(yearMonth);
        });

        // 배열로 변환하여 내림차순 정렬
        return Array.from(yearMonths).sort((a, b) => b.localeCompare(a));
    }
}

