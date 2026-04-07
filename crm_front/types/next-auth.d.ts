import "next-auth";

type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

declare module "next-auth" {
    interface User {
        id: string;
        role: AppRole;
    }

    interface Session {
        user: User & {
            id: string;
            role: AppRole;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: AppRole;
    }
}
