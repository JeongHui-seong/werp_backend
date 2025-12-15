import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { FindEmailDto } from "../dtos/findEmail.dto";

export class AuthController {
    private service = new AuthService();

    findEmail = async (req: Request, res: Response) => {
        const dto: FindEmailDto = req.body;

        if (!dto.email) {
            return res.status(400).json({
                success: false,
                message: "email을 입력해주세요."
            });
        }

        const result = await this.service.findEmail(dto.email);
        
        if (!result.success) {
            // 사용자를 찾지 못한 경우 404, 이메일 전송 실패 등 기타 오류는 500
            const statusCode = result.message.includes("등록되지 않은 이메일") ? 404 : 500;
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    resendCode = async (req: Request, res: Response) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "email을 입력해주세요."
            });
        }

        const result = await this.service.resendVerificationCode(email);
        
        if (!result.success) {
            // 사용자를 찾지 못한 경우 404, 이메일 전송 실패 등 기타 오류는 500
            const statusCode = result.message.includes("등록되지 않은 이메일") ? 404 : 500;
            return res.status(statusCode).json(result);
        }
        
        return res.status(200).json(result);
    }

    login = async (req: Request, res: Response) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "email을 입력해주세요."
            });
        }

        const result = await this.service.login(email);
        
        if (!result.success) {
            // 사용자를 찾지 못한 경우 404
            return res.status(404).json(result);
        }
        
        return res.status(200).json(result);
    }
}