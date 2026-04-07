"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2, ArrowRight, AtSign } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  telegramUsername: z.string().min(1, { message: "Telegram username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      telegramUsername: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        telegram_username: values.telegramUsername.replace(/^@+/, ""),
        password: values.password,
      });

      if (res?.error) {
        toast.error("Invalid Telegram username or password.");
      } else {
        toast.success("Successfully logged in.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-12 text-white">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-500/20 bg-teal-500/10">
            <GraduationCap className="h-10 w-10 text-teal-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">
            <span className="text-teal-400">KOMIL</span>_CEFR
          </h1>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500/80">
            Secure Learning Gateway
          </p>
        </div>

        <Card className="border-gray-800 bg-gray-900/90 text-white shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Only Telegram username and password login is enabled for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="telegramUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-200">
                        Telegram Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="komilstudent"
                            {...field}
                            disabled={isLoading}
                            className="h-12 rounded-2xl border-gray-800 bg-gray-950 pl-10 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="password"
                          {...field}
                          disabled={isLoading}
                          className="h-12 rounded-2xl border-gray-800 bg-gray-950 text-white placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl bg-teal-500 text-white hover:bg-teal-400"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-4 text-sm text-gray-400">
              Use the same Telegram username you registered with. The leading <span className="text-gray-200">@</span> is optional.
            </div>

            <p className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-teal-400 hover:text-teal-300">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
