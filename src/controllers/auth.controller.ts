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
        return res.json(result);
    }
}