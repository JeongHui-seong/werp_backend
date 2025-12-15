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
        return prisma.attendance.update({
            where: {
                id: attendanceId,
            },
            data: {
                clockout: new Date(),
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
}

