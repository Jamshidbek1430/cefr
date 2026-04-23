"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2, Sparkles, AtSign, User, Lock, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const registerSchema = z.object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    telegramUsername: z.string().min(1, { message: "Telegram username is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [pendingRegistration, setPendingRegistration] = useState<RegisterValues | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");

    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            telegramUsername: "",
            password: "",
            confirmPassword: "",
        },
    });

    function handlePrepareVerification(values: RegisterValues) {
        setPendingRegistration(values);
        setVerificationCode("");
        setVerificationError("");
        toast.success("Verification step ready. Ask admin for your verification code.");
    }

    async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!pendingRegistration) {
            toast.error("Please fill your account details first.");
            return;
        }

        const trimmedCode = verificationCode.trim();
        if (trimmedCode.length === 0) {
            setVerificationError("Verification code is required");
            return;
        }

        setVerificationError("");

        setIsLoading(true);
        try {
            const telegramUsername = pendingRegistration.telegramUsername.replace(/^@+/, "");

            const res = await fetch(`/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: pendingRegistration.fullName,
                    telegram_username: telegramUsername,
                    verification_code: trimmedCode,
                    password: pendingRegistration.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const message =
                    data.detail ||
                    data.verification_code?.[0] ||
                    data.telegram_username?.[0] ||
                    data.full_name?.[0] ||
                    "Registration failed.";
                toast.error(message);
                return;
            }

            toast.success("Verification successful. Logging you in...");

            const loginRes = await signIn("credentials", {
                redirect: false,
                telegram_username: telegramUsername,
                password: pendingRegistration.password,
            });

            if (loginRes?.error) {
                toast.error("Account created, but automatic login failed. Please sign in manually.");
                router.push("/login");
            } else {
                toast.success("Welcome to ARTUR.TURKCE!");
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const verificationMode = Boolean(pendingRegistration);

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12">
            <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-secondary/10 opacity-50 blur-3xl" />
            <div className="absolute bottom-1/4 -left-20 h-80 w-80 rounded-full bg-primary/10 opacity-50 blur-3xl" />

            <div className="w-full max-w-xl space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <div className="mb-6 inline-flex rounded-3xl bg-secondary/10 p-4">
                        {verificationMode ? <ShieldCheck className="h-10 w-10 text-secondary" /> : <Sparkles className="h-10 w-10 text-secondary" />}
                    </div>
                    <h1 className="mb-2 text-4xl font-black tracking-tight">
                        {verificationMode ? "Verify Your Account" : "Join ARTUR.TURKCE"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {verificationMode
                            ? "Ask your admin for the verification code, then enter it below."
                            : "Create your account with your full name and Telegram username."}
                    </p>
                </div>

                <Card className="glass relative overflow-hidden border-0 shadow-2xl">
                    <CardHeader className="pt-8 pb-2">
                        <CardTitle className="text-xl font-bold">
                            {verificationMode ? "Account Verification" : "Create Account"}
                        </CardTitle>
                        <CardDescription>
                            {verificationMode
                                ? "Verification successful only if your code matches one of the admin-issued codes."
                                : "Step 1: enter your details. Step 2: verify with a code from admin."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                        {!verificationMode ? (
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(handlePrepareVerification)} className="space-y-4">
                                    <FormField
                                        control={registerForm.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input placeholder="Artur Karimov" {...field} disabled={isLoading} className="h-12 bg-background/40 pl-10 transition-all" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="telegramUsername"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telegram Username</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input placeholder="komilstudent" {...field} disabled={isLoading} className="h-12 bg-background/40 pl-10 transition-all" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} className="h-12 bg-background/40 pl-10 transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} className="h-12 bg-background/40 pl-10 transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="h-12 w-full bg-secondary text-md font-bold text-white shadow-lg shadow-secondary/20"
                                        disabled={isLoading}
                                    >
                                        <span className="flex items-center gap-2">
                                            Continue to Verification <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                                    Ask your verification code from admin. Code can contain letters, numbers, and symbols.
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Verification Code
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Enter code (e.g., ABC123, xyz@789)"
                                            autoComplete="one-time-code"
                                            value={verificationCode}
                                            onChange={(event) => {
                                                setVerificationCode(event.target.value);
                                                if (verificationError) setVerificationError("");
                                            }}
                                            disabled={isLoading}
                                            className="h-14 bg-background/40 pl-10 text-lg transition-all"
                                        />
                                    </div>
                                    {verificationError ? (
                                        <p className="text-sm text-destructive">{verificationError}</p>
                                    ) : null}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 flex-1"
                                        disabled={isLoading}
                                        onClick={() => {
                                            setPendingRegistration(null);
                                            setVerificationCode("");
                                            setVerificationError("");
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-12 flex-1 bg-secondary text-md font-bold text-white shadow-lg shadow-secondary/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify and Register"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="pt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="font-bold text-secondary hover:text-secondary/80">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                        <GraduationCap className="h-4 w-4" /> ARTUR.TURKCE
                    </div>
                </div>
            </div>
        </div>
    );
}
