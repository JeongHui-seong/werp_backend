import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

export interface JWTPayload {
    email: string;
    name: string;
    department: string;
    role: string;
}

/**
 * Authorization 헤더에서 Bearer 토큰을 추출하는 함수
 * @param req Express Request 객체
 * @returns 토큰 문자열 또는 null
 */
export function extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return null;
    }

    // "Bearer <token>" 형식인지 확인
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }

    return parts[1];
}

/**
 * JWT 토큰을 검증하고 페이로드를 반환하는 함수
 * @param token JWT 토큰 문자열
 * @returns 검증된 페이로드 또는 null
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error("JWT 토큰 검증 실패:", error);
        return null;
    }
}

