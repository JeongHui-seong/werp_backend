declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                department: string;
                role: string;
            }
        }
    }
}

export {}

