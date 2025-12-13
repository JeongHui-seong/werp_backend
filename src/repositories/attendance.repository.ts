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
}

