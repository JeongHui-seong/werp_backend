import { LeavesRepository } from "../repositories/leaves.repository";
import { UserRepository } from "../repositories/user.repository";

export class LeavesService {
    private leavesRepo = new LeavesRepository();
    private userRepo = new UserRepository();

    async getLeaveTypes() {
        try {
            const leaveTypes = await this.leavesRepo.findAllLeaveTypes();

            return {
                success: true,
                message: "휴가 유형 목록을 조회했습니다.",
                leavesType: leaveTypes,
            };
        } catch (error) {
            console.error("휴가 유형 목록 조회 실패:", error);
            return {
                success: false,
                message: "휴가 유형 목록 조회에 실패하였습니다. 잠시 후 다시 시도해주세요."
            };
        }
    }

    async upsertLeaveTypes(leaveTypes: Array<{ id?: number; type: string; days: number | string }>) {
        try {
            // 입력 검증
            if (!Array.isArray(leaveTypes) || leaveTypes.length === 0) {
                return {
                    success: false,
                    message: "휴가 유형 데이터가 필요합니다."
                };
            }

            // 각 항목 검증
            for (const leaveType of leaveTypes) {
                if (!leaveType.type || typeof leaveType.type !== 'string') {
                    return {
                        success: false,
                        message: "type은 필수이며 문자열이어야 합니다."
                    };
                }
                if (leaveType.days === undefined || leaveType.days === null) {
                    return {
                        success: false,
                        message: "days는 필수입니다."
                    };
                }
            }

            const results = await this.leavesRepo.upsertLeaveTypes(leaveTypes);

            return {
                success: true,
                message: `${results.length}개의 휴가 유형을 처리했습니다.`
            };
        } catch (error) {
            console.error("휴가 유형 upsert 실패:", error);
            const errorMessage = error instanceof Error ? error.message : "휴가 유형 처리에 실패하였습니다. 잠시 후 다시 시도해주세요.";
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async deleteLeaveTypes(ids: number[]) {
        try {
            // 입력 검증
            if (!Array.isArray(ids) || ids.length === 0) {
                return {
                    success: false,
                    message: "삭제할 id 목록이 필요합니다."
                };
            }

            // 각 id 검증
            const validIds = ids.filter(id => typeof id === 'number' && id > 0);
            if (validIds.length === 0) {
                return {
                    success: false,
                    message: "유효한 id가 없습니다."
                };
            }

            const result = await this.leavesRepo.deleteLeaveTypes(validIds);

            if (result.count === 0) {
                return {
                    success: false,
                    message: "삭제할 휴가 유형을 찾을 수 없습니다."
                };
            }

            return {
                success: true,
                message: `${result.count}개의 휴가 유형을 삭제했습니다.`
            };
        } catch (error) {
            console.error("휴가 유형 삭제 실패:", error);
            const errorMessage = error instanceof Error ? error.message : "휴가 유형 삭제에 실패하였습니다. 잠시 후 다시 시도해주세요.";
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async getLeavePolicy(year: number){
        try{
            const findResult = await this.leavesRepo.findLeavePolicyByYear(year);
            if (findResult) {
                return {
                    success: true,
                    message: `${year}년도 기본 연차를 불러왔습니다.`,
                    result: findResult
                }
            }

            // 해당 년도에 값이 없다면 기본 연차 15일로 만들기
            const createResult = await this.leavesRepo.createLeavePolicy(year, 15);
            return {
                success: true,
                message: `${year}년도 기본 연차가 존재하지 않아 기본값으로 생성하였습니다.`,
                result: createResult
            }

        } catch (error) {
            console.error(`${year}년도 기본 연차 불러오기 실패 : `, error);
            const errorMessage = error instanceof Error ? error.message : `${year}년도 기본 연차를 불러오는데 실패하였습니다. 잠시 후 다시 시도해주세요.`;
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async updateLeavePolicy(year: number, days: number){
        try{
            const result = this.leavesRepo.updateLeavePolicy(year, days);
            return {
                success: true,
                message: `${year}년도 기본 연차를 수정하였습니다.`
            }
        } catch (error) {
            console.error(`${year}년도 기본 연차 수정 실패 : `, error);
            const errorMessage = error instanceof Error? error.message : `${year}년도 기본 연차 수정에 실패하였습니다. 잠시 후 다시 시도해주세요.`
            return {
                success: false,
                message: errorMessage
            }
        }
    }

    async getLeaves(email: string, year: number) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return {
                success: false,
                message: "사용자를 찾을 수 없습니다."
            };
        }

        try {
             const leaves = await this.leavesRepo.findLeavesByUserIdAndYear(user.id, year);

             let remainingLeaves = 0;
             let usedLeaves = 0;
             let pendingLeaves = 0;
             const records = [];

             for (const leave of leaves) {
                if (leave.leave_request.status === 'approved') {
                    usedLeaves += 1;
                } else if (leave.leave_request.status === 'pending') {
                    pendingLeaves += 1;
                }

                records.push({
                    id : leave.leave_request.id,
                    start_date: leave.leave_request.start_date,
                    end_date: leave.leave_request.end_date,
                    status: leave.leave_request.status,
                    reason: leave.leave_request.reason,
                    approved_at: leave.leave_request.approved_at || null,
                    created_at: leave.leave_request.created_at,
                    rejection_reason: leave.leave_request.rejection_reason || null,
                    approver_name: leave.leave_request.approver?.name || null,
                    leave_type: leave.leave_request.leave_type?.type || null,
                })
             }

             const leavePolicyResult = await this.leavesRepo.findLeavePolicyByYear(year);
             const leavePolicyDays = leavePolicyResult?.days || 0;
             remainingLeaves = leavePolicyDays - usedLeaves;

             return {
                 success: true,
                 message: `${year}년도 ${user.name}님의 연차 정보를 불러왔습니다.`,
                 result: {
                    summary: {
                        remainingLeaves: remainingLeaves,
                        usedLeaves: usedLeaves,
                        pendingLeaves: pendingLeaves
                    },
                    records: records
                 }
             };
        } catch (error) {
            console.error(`${year}년도 ${user.name}님의 연차 정보 불러오기 실패 : `, error);
            const errorMessage = error instanceof Error ? error.message : `${year}년도 ${user.name}님의 연차 정보를 불러오는데 실패하였습니다. 잠시 후 다시 시도해주세요.`;
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async createLeaves(email: string, payload: {created_at: string; leave_type: string; startdate: string; enddate: string; reason: string;}) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return {
                success: false,
                message: "사용자를 찾을 수 없습니다."
            };
        }

        try {
            const dates = await this.leavesRepo.createLeavesByUserId(payload, user.id);

            return {
                success: true,
                message: "연차 신청이 완료되었습니다.",
                result: dates
            };
        } catch (error) {
            console.error(`연차 신청 실패 : `, error);
            const errorMessage = error instanceof Error ? error.message : `연차 신청에 실패하였습니다. 잠시 후 다시 시도해주세요.`;
            return {
                success: false,
                message: errorMessage
            };
        }
    }
}

