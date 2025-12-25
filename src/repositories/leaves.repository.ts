import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

export class LeavesRepository {
    async findAllLeaveTypes() {
        return prisma.leaveType.findMany({
            orderBy: {
                id: 'asc',
            }
        });
    }

    async upsertLeaveTypes(leaveTypes: Array<{ type: string; days: number | string }>) {
        // type을 기준으로 upsert 수행 (type이 unique이므로 Prisma upsert 사용)
        const results = [];
        
        for (const leaveType of leaveTypes) {
            // type이 unique이므로 upsert 사용
            const result = await prisma.leaveType.upsert({
                where: { type: leaveType.type },
                update: { days: leaveType.days } as any,
                create: {
                    type: leaveType.type,
                    days: leaveType.days
                } as any
            });
            results.push(result);
        }

        return results;
    }

    async deleteLeaveTypes(ids: number[]) {
        return prisma.leaveType.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
}

