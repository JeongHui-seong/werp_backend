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

    async upsertLeaveTypes(leaveTypes: Array<{ id?:number; type: string; days: number | string }>) {
        const results = [];
        
        for (const leaveType of leaveTypes) {
            const result = leaveType.id ?
                await prisma.leaveType.update({
                    where: { id: leaveType.id },
                    data: {
                        type: leaveType.type,
                        days: leaveType.days
                    }
                })
                : await prisma.leaveType.create({
                    data: {
                        type: leaveType.type,
                        days: leaveType.days,
                    }
                })

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

    async findLeavePolicyByYear(year: number){
        return prisma.leavePolicy.findUnique({
            where: {
                year
            }
        })
    }

    async createLeavePolicy(year: number, days: number){
        return prisma.leavePolicy.create({
            data: {
                year,
                days
            }
        })
    }

    async updateLeavePolicy(year: number, days: number){
        return prisma.leavePolicy.update({
            where: {
                year
            },
            data: {
                days
            }
        })
    }

    async findLeavesByUserIdAndYear(userId: string, year: number) {
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year + 1, 0, 1));

        return prisma.leave.findMany({
            where: {
                user_id: userId,
                startdate: {
                    gte: startDate,
                    lt: endDate,
                }
            },
            orderBy: {
                startdate: 'asc',
            },
            select: {
                id: true,
                startdate: true,
                enddate: true,
                status: true,
                reason: true,
                approved_at: true,
                created_at: true,
                rejection_reason: true,
                approver: {
                    select: {
                        name: true,
                    }
                },
                leave_type: {
                    select: {
                        type: true,
                    }
                }
            }
        });
    }
}

