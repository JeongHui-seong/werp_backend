import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { getDateRangeUTC } from "../utils/getDateRangeUTC";

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

        return prisma.leaveDate.findMany({
            where: {
                leave_request: {
                    user_id: userId,
                    start_date: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            },
            select: {
                leave_date: true,
                leave_request: {
                    select: {
                        id: true,
                        start_date: true,
                        end_date: true,
                        status: true,
                        reason: true,
                        approved_at: true,
                        created_at: true,
                        rejection_reason: true,
                        approver: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        leave_type: {
                            select: {
                                id: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findLeavesType(leaveType: string) {
        return prisma.leaveType.findUnique({
            where: {
                type: leaveType
            }
        });
    }

    async createLeavesByUserId(
        payload: {created_at: string; leave_type: string; startdate: string; enddate: string; reason: string;}, user_id: string
    ) {
        const start = new Date(`${payload.startdate}T00:00:00Z`);
        const end = new Date(`${payload.enddate}T00:00:00Z`);

        const dates = getDateRangeUTC(start, end);

        const leaveType = await this.findLeavesType(payload.leave_type);
        if (!leaveType) {
            throw new Error("존재하지 않는 연차 유형입니다.");
        }

        return prisma.leaveRequest.create({
            data: {
            user_id,
            leave_type_id: leaveType?.id!,
            start_date: start,
            end_date: end,
            reason: payload.reason,
            created_at: new Date(`${payload.created_at}T00:00:00Z`),
            status: 'pending',

            dates: {
                create: dates.map(date => ({
                    leave_date: date
                }))
            }
            }
        })
    }
}

