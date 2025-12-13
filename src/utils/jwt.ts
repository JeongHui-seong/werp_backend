import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface JWTPayload {
    email: string;
    name: string;
    department: string;
    role: string;
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

