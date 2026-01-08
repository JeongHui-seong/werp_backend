import { FindAllUsersDTO } from "../dtos/user/findAllUsers";
import { UserRepository } from "../repositories/user.repository";

export class UserService {
    private userRepo = new UserRepository();

    async getAllUsers(options: FindAllUsersDTO) {
        try {
            const usersData = await this.userRepo.findAllUsers(options);

            return {
                success: true,
                message: "사용자 목록을 조회했습니다.",
                data: usersData.users,
                total: usersData.total,
            };
        } catch (err) {
            console.error("사용자 목록 조회 실패:", err);
            return {
                success: false,
                message: "사용자 목록 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }
}