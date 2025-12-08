import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

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
}
