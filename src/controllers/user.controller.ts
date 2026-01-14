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
                filter: safeParse<{ status?: 'active' | 'inactive' | "quit"; deptId?: number; roleId?: number }>(filter as string),
                sort: safeParse<{ field: 'name' | 'email' | 'hireDate'; order: 'ASC' | 'DESC' }>(sort as string),
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

    getRolesAndDept = async(req: Request, res: Response) => {
        try{
            const result = await this.service.getRolesAndDept();

            return res.status(200).json({
                success: true,
                message: "직급과 부서를 성공적으로 조회했습니다.",
                role: result.role,
                dept: result.dept
            })
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "직급과 부서 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            })
        }
    }

    updateUser = async(req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { departmentId, roleId, ...rest } = req.body;

            const result = await this.service.updateUser(id, {
                ...rest,
                dept_id: departmentId,
                role_id: roleId
            });

            return res.status(200).json({
                success: true,
                message: "직원 정보를 성공적으로 수정했습니다."
            })
        } catch ( err ) {
            return res.status(500).json({
                success: false,
                message: "직원 정보 수정에 실패하였습니다. 잠시 후 다시 시도해주세요."
            })
        }
    }

    createUser = async(req: Request, res: Response) => {
        try {
            const { payload } = req.body;

            const result = await this.service.createUser(payload);

            return res.status(200).json({
                success: true,
                message: "직원을 성공적으로 추가하였습니다."
            })
        } catch ( err ) {
            return res.status(500).json({
                success: false,
                message: "직원 추가에 실패하였습니다. 잠시 후 다시 시도해주세요."
            })
        }
    }

    deleteUser = async(req: Request, res: Response) => {
        try {
            const { ids } = req.body;

            const result = await this.service.deleteUser(ids);

            return res.status(200).json({
                success: true,
                message: "직원 삭제에 성공하였습니다."
            })
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "직원 삭제에 실패하였습니다. 잠시 후 다시 시도해주세요."
            })
        }
    }
}