import { UserService } from "../services/user.service";
import { Request, Response } from "express";

export class UserController {
    private service = new UserService();

    getAllUsers = async (req: Request, res: Response) => {
        const { page, limit, filter, sort, search } = req.query;

        const safeParse = <T>(value?: string): T | undefined => {
            if (!value) return undefined;
            try {
                return JSON.parse(value);
            } catch {
                throw new Error('유효하지 않은 JSON 형식입니다.');
            }
        };

        try {
            const pageNum = Math.max(Number(page) || 1, 1);
            const sizeNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    
    
            const options = {
                pagination: {
                    size: sizeNum,
                    page: pageNum,
                },
                filter: safeParse<{ status?: 'ACTIVE' | 'INACTIVE'; deptName?: string; roleName?: string }>(filter as string),
                sort: safeParse<{ field: 'name' | 'email' | 'phone' | 'hireDate'; order: 'ASC' | 'DESC' }>(sort as string),
                search: safeParse<{ keyword: string; fields?: Array<'name' | 'email' | 'phone'> }>(search as string),
            }
    
            const result = await this.service.getAllUsers(options);

            return res.status(200).json({
                success: true,
                message: "사용자 목록을 성공적으로 조회했습니다.",
                data: result.data,
                total: result.total,
            });
        } catch (err: any) {
            if (err.message === '유효하지 않은 JSON 형식입니다.') {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            console.error("사용자 목록 조회 실패:", err);
            return res.status(500).json({
                success: false,
                message: "사용자 목록 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            });
        }
    }
}