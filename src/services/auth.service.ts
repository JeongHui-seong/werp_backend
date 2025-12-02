import { UserRepository } from "../repositories/user.repository";
import { generateVerificationCode } from "../utils/generateCode";

export class AuthService{
    private userRepo = new UserRepository();

    async findEmail(email: string) {
        const user = await this.userRepo.findByEmail(email);

        if (!user){
            return {
                success: false,
                message: "등록되지 않은 이메일입니다. 관리자에게 문의하세요."
            };
        }

        const code = generateVerificationCode();

        //TODO : sendgrid 이메일 정송

        return {
            success: true,
            message: "인증 코드가 전송되었습니다.",
            code: code,
        };
    }
}