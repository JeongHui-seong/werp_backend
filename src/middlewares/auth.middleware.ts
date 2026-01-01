import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = extractTokenFromHeader(req);
    if (!token) return res.status(401).json({
        success: false,
        message: "인증 토큰이 필요합니다."
    });

    try{
        const payload = verifyToken(token);
        req.user = payload;
        next()
    } catch {
        return res.status(401).json({
            success: false,
            message: "인증되지 않은 유저입니다. 관리자에게 문의하세요."
        })
    }
}