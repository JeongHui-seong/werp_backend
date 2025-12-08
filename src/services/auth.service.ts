import { UserRepository } from "../repositories/user.repository";
import { generateVerificationCode } from "../utils/generateCode";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export class AuthService{
    private userRepo = new UserRepository();

    /**
     * SendGrid를 사용하여 이메일을 전송하는 메서드
     * @param to 수신자 이메일 주소
     * @param subject 이메일 제목
     * @param text 이메일 본문 (텍스트)
     * @param html 이메일 본문 (HTML)
     */
    private async sendEmail(to: string, subject: string, text: string, html?: string) {
        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL || "", // SendGrid에서 인증된 발신자 이메일
            subject,
            text,
            html: html || text,
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error("이메일 전송 실패:", error);
            throw new Error("이메일 전송에 실패했습니다.");
        }
    }

    async findEmail(email: string) {
        const user = await this.userRepo.findByEmail(email);

        if (!user){
            return {
                success: false,
                message: "등록되지 않은 이메일입니다. 관리자에게 문의하세요."
            };
        }

        const code = generateVerificationCode();

        // SendGrid 이메일 전송
        try {
            await this.sendEmail(
                email,
                "WERP 이메일 인증 코드 안내",
                `인증 코드: ${code}`,
                `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>인증 코드 안내</h2>
                    <p>안녕하세요,</p>
                    <p>요청하신 인증 코드는 다음과 같습니다:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #333; margin: 0; text-align: center;">${code}</h1>
                    </div>
                    <p>이 코드는 일정 시간 후 만료됩니다.</p>
                    <p>감사합니다.</p>
                </div>
                `
            );
        } catch (error) {
            return {
                success: false,
                message: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
            };
        }

        return {
            success: true,
            message: "인증 코드가 전송되었습니다.",
            code: code,
        };
    }

    async resendVerificationCode(email: string) {
        const user = await this.userRepo.findByEmail(email);

        if (!user){
            return {
                success: false,
                message: "등록되지 않은 이메일입니다. 관리자에게 문의하세요."
            };
        }

        const code = generateVerificationCode();

        // SendGrid 이메일 전송
        try {
            await this.sendEmail(
                email,
                "인증 코드 재전송 안내",
                `인증 코드: ${code}`,
                `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>인증 코드 재전송 안내</h2>
                    <p>안녕하세요,</p>
                    <p>재요청하신 인증 코드는 다음과 같습니다:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #333; margin: 0; text-align: center;">${code}</h1>
                    </div>
                    <p>이 코드는 일정 시간 후 만료됩니다.</p>
                    <p>감사합니다.</p>
                </div>
                `
            );
        } catch (error) {
            return {
                success: false,
                message: "인증코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
            };
        }

        return {
            success: true,
            message: "인증 코드가 재전송되었습니다.",
            code: code,
        };
    }

    async login(email: string) {
        const user = await this.userRepo.findByEmailWithRelations(email);

        if (!user) {
            return {
                success: false,
                message: "등록되지 않은 이메일입니다. 관리자에게 문의하세요."
            };
        }

        // JWT 페이로드 생성
        const payload = {
            email: user.email,
            name: user.name,
            department: user.department.name,
            role: user.role.name,
        };

        // JWT 토큰 생성 (만료 시간 30일로 설정)
        const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
        const token = jwt.sign(payload, jwtSecret, { expiresIn: "30d" });

        return {
            success: true,
            message: "로그인에 성공했습니다.",
            token,
            user: {
                email: user.email,
                name: user.name,
                department: user.department.name,
                role: user.role.name,
            }
        };
    }
}