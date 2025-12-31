import { Request, Response } from "express";
import { LeavesService } from "../services/leaves.service";

export class LeavesController {
    private service = new LeavesService();

    getLeaveTypes = async (req: Request, res: Response) => {
        const result = await this.service.getLeaveTypes();
        
        if (!result.success) {
            // DB 오류 등은 500
            return res.status(500).json(result);
        }
        
        return res.status(200).json(result);
    }

    upsertLeaveTypes = async (req: Request, res: Response) => {
        const { leaveTypes } = req.body;

        // body에서 leaveTypes 배열 추출
        if (!leaveTypes) {
            return res.status(400).json({
                success: false,
                message: "leaveTypes 배열이 필요합니다."
            });
        }

        const result = await this.service.upsertLeaveTypes(leaveTypes);
        
        if (!result.success) {
            // 입력 검증 실패는 400, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("필수") || result.message.includes("유효한")) {
                statusCode = 400;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    deleteLeaveTypes = async (req: Request, res: Response) => {
        const { ids } = req.body;

        // body에서 ids 배열 추출
        if (!ids) {
            return res.status(400).json({
                success: false,
                message: "ids 배열이 필요합니다."
            });
        }

        const result = await this.service.deleteLeaveTypes(ids);
        
        if (!result.success) {
            // 입력 검증 실패는 400, 찾을 수 없음은 404, DB 오류 등은 500
            let statusCode = 500;
            if (result.message.includes("필수") || result.message.includes("유효한")) {
                statusCode = 400;
            } else if (result.message.includes("찾을 수 없습니다")) {
                statusCode = 404;
            }
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    // TODO
    // 로그인이 필요한 메서드에 유저 검증 및 관리자 설정은 관리자 검증
    // middleware에 유저 검증 및 관리자 검증 분기 후 router에서 next를 통해 사용
}

