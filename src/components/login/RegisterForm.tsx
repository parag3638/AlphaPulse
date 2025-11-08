"use client";

import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosHeaders } from "axios";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator,
} from "@/components/ui/input-otp";

// Always send/receive cookies cross-site
axios.defaults.withCredentials = true;

// Add CSRF header for unsafe methods (POST/PUT/PATCH/DELETE)
axios.interceptors.request.use((config) => {
    const method = (config.method ?? "get").toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const m =
            typeof document !== "undefined"
                ? document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
                : null;
        const csrf = m ? decodeURIComponent(m[1]) : null;

        if (!config.headers) {
            config.headers = new AxiosHeaders();
        } else if (!(config.headers instanceof AxiosHeaders)) {
            config.headers = new AxiosHeaders(config.headers);
        }
        const h = config.headers as AxiosHeaders;

        if (csrf) h.set("X-CSRF-Token", csrf);
        if (config.data && !h.has("Content-Type")) h.set("Content-Type", "application/json");
    }

    config.withCredentials = true;
    return config;
});




const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || "https://authbackend-cc2d.onrender.com/api/auth";
// const AUTH_BASE = "http://localhost:9000/api/auth";
const API_ROOT = AUTH_BASE.replace(/\/api\/auth$/, ""); // e.g. https://authbackend-cc2d.onrender.com


const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
    mail: z.string()
        .email()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, "Please use a .com email.")
        .min(5, { message: "Invalid Mail Id." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }).max(30),
    confirmPassword: z.string().min(8, { message: "Please confirm password." }),
    terms: z.boolean().refine((v) => v === true, { message: "You must accept the Terms & Privacy Policy." }),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
});

type RegisterValues = z.infer<typeof registerSchema>;

const otpSchema = z.object({
    pin: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});



export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailForOtp, setEmailForOtp] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const router = useRouter();

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", mail: "", password: "", confirmPassword: "", terms: false },
        mode: "onTouched",
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { pin: "" },
        mode: "onTouched",
    });

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    const canResend = useMemo(() => resendCooldown <= 0, [resendCooldown]);

    async function onRegisterSubmit(values: RegisterValues) {
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${AUTH_BASE}/register`, {
                name: values.name,
                email: values.mail,
                password: values.password,
            });
            setEmailForOtp(values.mail);
            setOtpSent(true);
            setResendCooldown(30);
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    }

    async function onResendOtp() {
        if (!emailForOtp || !canResend) return;
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${AUTH_BASE}/register/resend-otp`, { email: emailForOtp });
            otpForm.reset({ pin: "" }); // resets only the pin field
            setResendCooldown(30);
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Could not resend OTP. Try again.");
        } finally {
            setLoading(false);
        }
    }

    async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
        setLoading(true);
        setError(null);
        try {
            // Server will set the HttpOnly access_token + csrf_token cookies
            await axios.post(`${AUTH_BASE}/register/verify`, {
                email: emailForOtp,
                otp: values.pin,
            });

            // (Optional) quick confirm: proves cookie is sent
            try { await axios.get(`${API_ROOT}/me`); } catch { }

            // Proceed
            router.push("/vaultx/dashboard");
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {!otpSent ? (
                <Form key="register-step" {...form}>
                    <form
                        onSubmit={form.handleSubmit(onRegisterSubmit)}
                        className="space-y-2"
                        autoComplete="off"
                    >
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="py-5 text-black border-gray-200 bg-white"
                                            placeholder="John Doe"
                                            autoComplete="off"
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="py-5 text-black border-gray-200 bg-white"
                                            placeholder="mail@abc.com"
                                            autoComplete="off"
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-black">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="py-5 text-black border-gray-200"
                                                type="password"
                                                placeholder="************"
                                                autoComplete="new-password"
                                                disabled={loading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-black">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="py-5 text-black border-gray-200"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="************"
                                                autoComplete="new-password"
                                                disabled={loading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="show-password"
                                    className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                                    checked={showPassword}
                                    disabled={loading}
                                    onCheckedChange={(c) => setShowPassword(c === true)}
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-xs text-[#A1A1A1] font-normal hover:cursor-pointer leading-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    Show Password
                                </label>
                            </div>

                            <FormField
                                control={form.control}
                                name="terms"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    id="terms"
                                                    className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                                                    checked={!!field.value}
                                                    onCheckedChange={(c) => field.onChange(c === true)}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <label
                                                htmlFor="terms"
                                                className="text-xs text-[#A1A1A1] font-normal hover:cursor-pointer leading-none"
                                            >
                                                I agree to the{" "}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="underline underline-offset-2">
                                                            Terms & Privacy Policy
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Under Development</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </label>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            className="w-full hover:bg-[#2F2F31] bg-black py-6 dark:text-[#FFFFFF] rounded-xl text-base font-semibold"
                            disabled={loading || !form.watch("terms")}
                            type="submit"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form key="otp-step" {...otpForm}>
                    <form
                        onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                        className="space-y-4"
                        autoComplete="one-time-code"
                    >
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <FormField
                            control={otpForm.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter One-Time Password</FormLabel>
                                    <FormControl>
                                        {/* IMPORTANT: don't spread {...field}; pass only value/onChange */}
                                        <InputOTP
                                            maxLength={6}
                                            value={field.value ?? ""}
                                            onChange={(v) => {
                                                // keep only digits
                                                const next = v.replace(/\D/g, "").slice(0, 6);
                                                field.onChange(next);
                                                if (next.length === 6) {
                                                    setTimeout(() => otpForm.handleSubmit(onOtpSubmit)(), 0);
                                                }
                                            }}
                                            autoFocus
                                        >
                                            <InputOTPGroup className="space-x-4 justify-center">
                                                <InputOTPSlot index={0} className="" inputMode="numeric" />
                                                <InputOTPSlot index={1} className="" inputMode="numeric" />
                                                <InputOTPSlot index={2} className="" inputMode="numeric" />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup className="space-x-4 justify-center">
                                                <InputOTPSlot index={3} className="" inputMode="numeric" />
                                                <InputOTPSlot index={4} className="" inputMode="numeric" />
                                                <InputOTPSlot index={5} className="" inputMode="numeric" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormDescription className="flex justify-between">
                                        <div>
                                            OTP sent to your email (Check Junk Too)
                                        </div>
                                        <div>
                                            {canResend ? (
                                                <button
                                                    type="button"
                                                    onClick={onResendOtp}
                                                    disabled={loading}
                                                    className="text-red-500 text-xs hover:text-red-600 underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Resend OTP
                                                </button>
                                            ) : (
                                                <p className="text-red-500 text-xs">Resend in {resendCooldown}s</p>
                                            )}
                                        </div>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            className="w-full hover:bg-[#2F2F31] bg-black py-6 dark:text-[#FFFFFF] rounded-xl text-base font-semibold"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                </div>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </form>
                </Form>
            )}
        </>
    );
}
