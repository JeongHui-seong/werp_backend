import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { FindAllUsersDTO } from "../dtos/user/findAllUsers";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

export class UserRepository {
    findByEmail(email:string) {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    findByEmailWithRelations(email: string) {
        return prisma.user.findUnique({
            where: { email },
            include: {
                department: true,
                role: true,
            }
        })
    }

    async findAllUsers(options: FindAllUsersDTO) {
    const { pagination, filter, sort, search } = options;

    const searchFields = search?.fields ?? ['name', 'email', 'phone'];

    const where = {
        AND: [
        filter?.status ? { status: filter.status } : {},
        filter?.deptId ? { dept_id: filter.deptId } : {},
        filter?.roleId ? { role_id: filter.roleId } : {},
        search?.keyword
            ? {
                OR: searchFields.map(field => ({
                [field]: {
                    contains: search.keyword,
                    mode: 'insensitive',
                },
                })),
            }
            : {},
        ],
    };

    const SORT_FIELD_MAP = {
        name: 'name',
        email: 'email',
        phone: 'phone',
        hireDate: 'hire_date',
    } as const;

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.size,
        take: pagination.size,
        orderBy: sort
            ? {
                [SORT_FIELD_MAP[sort.field]]: sort.order.toLowerCase(),
            }
            : { hire_date: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            hire_date: true,
            status: true,
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        }
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total };
    }
}
