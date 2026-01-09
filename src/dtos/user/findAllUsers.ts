export type FindAllUsersDTO = {
    pagination: {
        size: number;
        page: number;
    };

    filter?: {
        status?: 'ACTIVE' | 'INACTIVE';
        deptName?: string;
        roleName?: string;
    }

    sort?: {
        field: 'name' | 'email' | 'phone' | 'hireDate';
        order: 'ASC' | 'DESC';
    }

    search?: {
        keyword: string;
        fields?: Array<'name' | 'email' | 'phone'>;
    }
}