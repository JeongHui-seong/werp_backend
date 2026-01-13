export type createUserType = {
    email: string;
    name: string;
    phone: string;
    status: "active" | "inactive" | "quit";
    hire_date: Date;
    dept_id: number;
    role_id: number
}