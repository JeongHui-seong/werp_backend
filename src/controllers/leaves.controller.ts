import { Request, Response } from "express";
import { LeavesService } from "../services/leaves.service";
import { assertAuthenticated } from "../utils/assertAuthenticated";

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

    getLeavePolicy = async (req: Request, res: Response) => {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "년도가 전달되지 않았습니다."
            })
        }

        const result = await this.service.getLeavePolicy(Number(year));

        if(!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    }

    updateLeavePolicy = async (req: Request, res: Response) => {
        const { year, days } = req.body;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "업데이트할 년도가 전달되지 않았습니다."
            })
        }

        if (!days) {
            return res.status(400).json({
                success: false,
                message: "업데이트할 날짜가 전달되지 않았습니다."
            })
        }

        const result = await this.service.updateLeavePolicy(year, days)

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result)
    }

    getLeaves = async (req: Request, res: Response) => {
        assertAuthenticated(req);

        const email = req.user.email;
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "년도가 전달되지 않았습니다."
            })
        }

        const result = await this.service.getLeaves(email, Number(year));

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    }
}

