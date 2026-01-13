import { createUserType } from "../dtos/user/createUser";
import { FindAllUsersDTO } from "../dtos/user/findAllUsers";
import { updateUser } from "../dtos/user/updateUser";
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
            console.error("사용자 목록 조회 실패 : ", err);
            return {
                success: false,
                message: "사용자 목록 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }

    async getRolesAndDept() {
        try {
            const roleData = await this.userRepo.findRole();
            const deptData = await this.userRepo.findDepartment();

            return {
                success: true,
                message: "직급과 부서를 조회했습니다.",
                role: roleData,
                dept: deptData
            }
        } catch (err) {
            console.error("직급과 부서 조회 실패 : ", err)
            return {
                success: false,
                message: "직급과 부서 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            }
        }
    }

    async updateUser(id: string, data: updateUser) {
        try {
            const result = await this.userRepo.updateUser(id, data);

            return {
                success: true,
                message: "직원 정보 수정을 성공하였습니다."
            }
        } catch (err) {
            console.error("직원 정보 수정 실패 : ", err)
            return {
                success: false,
                message: "직원 정보 수정에 실패하였습니다. 잠시 후 다시 시도해주세요."
            }
        }
    }

    async createUser(payload:createUserType) {
        try {
            const result = await this.userRepo.createUser(payload);

            return {
                success: true,
                message: "직원을 성공적으로 추가하였습니다."
            }
        } catch (err) {
            console.error("직원 추가 실패 : ", err);
            throw err;
        }
    }

    async deleteUser(ids: string[]) {
        try {
            const result = await this.userRepo.deleteUser(ids);

            return {
                success: true,
                message: "직원 삭제에 성공하였습니다."
            }
        } catch (err) {
            console.error("직원 삭제 실패 : ", err);
            throw err;
        }
    }
}