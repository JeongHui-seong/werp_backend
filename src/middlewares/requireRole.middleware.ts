import { NextFunction, Request, Response } from "express";

export function requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "인증 정보가 존재하지 않습니다."
            })
        }
        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "허용되지 않은 직급입니다."
            });
        }
        next()
    }
}