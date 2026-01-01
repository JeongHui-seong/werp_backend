import { JWTPayload } from "./jwt";
import { Request } from "express";

export function assertAuthenticated(req: Request): asserts req is Request & { user: JWTPayload }{
    if (!req.user) {
        throw new Error("인증 허가 되지 않은 유저입니다.")
    }
}