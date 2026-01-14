export type FindAllUsersDTO = {
    pagination: {
        size: number;
        page: number;
    };

    filter?: {
        status?: 'active' | 'inactive' | "quit";
        deptId?: number;
        roleId?: number;
    }

    sort?: {
        field: 'name' | 'email' | 'hireDate';
        order: 'ASC' | 'DESC';
    }

    search?: {
        keyword: string;
        fields?: Array<'name' | 'email' | 'phone'>;
    }
}