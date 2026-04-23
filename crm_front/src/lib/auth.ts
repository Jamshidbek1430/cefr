import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getBackendUrl } from "@/lib/backend-url";

const BACKEND_URL = getBackendUrl();
type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

function mapBackendRole(user?: { role?: string; is_superuser?: boolean; is_staff?: boolean }): AppRole {
    console.log("Mapping backend user to role:", JSON.stringify(user));
    if (user?.is_superuser) return "ADMIN";
    if (user?.is_staff && user?.role === "admin") return "ADMIN";
    const role = user?.role;
    if (role === "admin" || role === "branch_admin") return "ADMIN";
    if (role === "teacher") return "TEACHER";
    return "STUDENT";
}

export async function syncUserWithPrisma(user: any) {
    if (!user || !user.email) return null;

    try {
        const { prisma } = await import("@/lib/prisma");

        const identifier = user.email;

        // Sync role mapping
        const roleMap: Record<string, number> = {
            "ADMIN": 38,
            "TEACHER": 39,
            "STUDENT": 40
        };

        const roleId = roleMap[user.role] || 40;

        // Update or create user in Prisma
        return await prisma.user.upsert({
            where: { email: identifier },
            update: {
                name: user.name,
                roleId: roleId,
            },
            create: {
                email: identifier,
                name: user.name,
                roleId: roleId,
            },
        });
    } catch (error) {
        console.error("Error syncing user to Prisma:", error);
        return null;
    }
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                telegram_username: { label: "Telegram Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.telegram_username || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await fetch(`${BACKEND_URL}/api/auth/login/`, {
                        method: "POST",
                        body: JSON.stringify({
                            telegram_username: credentials.telegram_username,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await res.json();

                    if (res.ok && data.access) {
                        const user = data.user;
                        const role = mapBackendRole(user);

                        return {
                            id: user.id.toString(),
                            email: user.email || `${user.telegram_username || user.username}@telegram.local`,
                            name: user.full_name || user.username,
                            role: role,
                            accessToken: data.access,
                            refreshToken: data.refresh,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "artur-turkce-fallback-secret-key-2024",
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "credentials") {
                await syncUserWithPrisma(user);
            }
            return true;
        },
        async session({ session, token }) {
            if (token) {
                const sessionWithToken = session as typeof session & { accessToken?: string };
                session.user.id = token.id as string;
                session.user.role = (token.role as AppRole) || "STUDENT";
                sessionWithToken.accessToken = token.accessToken as string | undefined;
                console.log("Session created with role:", session.user.role);
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                const authUser = user as typeof user & {
                    accessToken?: string;
                    refreshToken?: string;
                    role?: AppRole;
                };
                token.id = user.id;
                token.role = authUser.role;
                token.accessToken = authUser.accessToken;
                token.refreshToken = authUser.refreshToken;
            }
            return token;
        },
    },
};
