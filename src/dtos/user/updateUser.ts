export type updateUser = {
    name?: string,
    email?: string,
    phone?: string,
    status?: "active" | "inactive" | "quit",
    dept_id?: number,
    role_id?: number,
    hire_date?: Date;
}