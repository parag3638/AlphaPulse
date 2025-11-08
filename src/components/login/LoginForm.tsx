"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import axios, { AxiosHeaders } from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import "@/styles/globals.css";


// Axios should always send/receive cookies cross-site
axios.defaults.withCredentials = true;


// ──────────────────────────────────────────────────────────────────────────────
// API base (strip trailing slashes to avoid // in requests)
// ──────────────────────────────────────────────────────────────────────────────
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://authbackend-cc2d.onrender.com/api/auth";
// const RAW_API_BASE = "http://localhost:9000/api/auth";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// root for non-auth endpoints like /me
const API_ROOT = API_BASE.replace(/\/api\/auth$/, "");


// Attach CSRF for unsafe methods when the csrf_token cookie is present
axios.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // read csrf_token cookie
    const m =
      typeof document !== "undefined"
        ? document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
        : null;
    const csrf = m ? decodeURIComponent(m[1]) : null;

    // ensure headers is an AxiosHeaders instance
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    } else if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }

    // set headers using the AxiosHeaders API
    const h = config.headers as AxiosHeaders;

    if (csrf) h.set("X-CSRF-Token", csrf);
    if (config.data && !h.has("Content-Type")) {
      h.set("Content-Type", "application/json");
    }
  }

  // make sure credentials always go
  config.withCredentials = true;
  return config;
});


// ──────────────────────────────────────────────────────────────────────────────
/** Schemas */
// ──────────────────────────────────────────────────────────────────────────────
const accountFormSchema = z.object({
  mail: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, "This email is not registered with us!")
    .min(5, { message: "Invalid Mail Id." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(30, { message: "Password must not be longer than 30 characters." }),
});

const otpSchema = z.object({
  pin: z
    .string()
    .min(6, { message: "Your one-time password must be 6 characters." })
    .max(6, { message: "OTP must be 6 digits." }),
});

const emailOnlySchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, "This email is not registered with us!")
    .min(5, { message: "Invalid Mail Id." }),
});

const newPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(30, { message: "Password must not be longer than 30 characters." }),
    confirm_password: z.string(),
    show_password: z.boolean().optional(),
  })
  .refine((val) => val.new_password === val.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  });

type AccountFormValues = z.infer<typeof accountFormSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type EmailOnlyValues = z.infer<typeof emailOnlySchema>;
type NewPasswordValues = z.infer<typeof newPasswordSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();

  type Mode =
    | "login"         // credentials
    | "login-otp"     // login OTP verify
    | "forgot-email"  // reset step 1
    | "forgot-otp"    // reset step 2
    | "forgot-reset"  // reset step 3
    | "forgot-done";  // reset success

  const [mode, setMode] = useState<Mode>("login");

  // Shared UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login flow state
  const [loginEmail, setLoginEmail] = useState("");
  const [emailForOtp, setEmailForOtp] = useState(""); // used by both flows where relevant
  const [resetToken, setResetToken] = useState("");

  // Resend cooldown (shared for whichever OTP step is active)
  const [resendCooldown, setResendCooldown] = useState(0);
  const canResend = useMemo(() => resendCooldown <= 0, [resendCooldown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Forms
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { mail: "", password: "" },
    mode: "onTouched",
  });

  const otpform = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: "" },
    mode: "onTouched",
  });

  const forgotEmailForm = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const forgotNewPassForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
      show_password: false,
    },
    mode: "onTouched",
  });

  // ────────────────────────────────────────────────────────────────────────────
  // LOGIN: credentials → /login
  // ────────────────────────────────────────────────────────────────────────────
  async function onSubmitLogin(data: AccountFormValues) {
    setLoading(true);
    setError(null);
    setLoginEmail(data.mail);

    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email: data.mail,
        password: data.password,
      });

      const message: string | undefined = res.data?.message;

      if (!message?.toLowerCase().includes("otp")) {
        // backend should always send OTP; treat anything else as an error message
        throw new Error(res.data?.error || res.data?.message || "OTP sending failed");
      }

      setEmailForOtp(data.mail);
      otpform.reset({ pin: "" });
      setResendCooldown(30);
      setMode("login-otp");
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // LOGIN: resend OTP → /resend-otp
  async function onResendLoginOtp() {
    const email = emailForOtp || loginEmail;
    if (!email || !canResend) return;

    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/resend-otp`, { email });
      otpform.reset({ pin: "" });
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Could not resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // LOGIN: verify OTP → /verify-otp
  async function onSubmitLoginOTP(data: OtpValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, {
        email: loginEmail,
        otp: data.pin,
      });

      router.push("/vaultx/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FORGOT: Step 1 → /password-reset/request
  // ────────────────────────────────────────────────────────────────────────────
  async function onRequestResetOtp(data: EmailOnlyValues) {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/password-reset/request`, { email: data.email });
      setEmailForOtp(data.email);
      otpform.reset({ pin: "" });
      setResendCooldown(30);
      setMode("forgot-otp");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onResendForgotOtp() {
    if (!emailForOtp || !canResend) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/password-reset/request`, { email: emailForOtp });
      otpform.reset({ pin: "" });
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Could not resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // FORGOT: Step 2 → /password-reset/verify (capture reset_token)
  async function onVerifyResetOtp(data: OtpValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/password-reset/verify`, {
        email: emailForOtp,
        otp: data.pin,
      });
      const token = res?.data?.reset_token as string | undefined;
      if (!token) throw new Error("Reset token missing in response.");
      setResetToken(token);
      setMode("forgot-reset");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  // FORGOT: Step 3 → /password-reset/complete
  async function onCompleteReset(data: NewPasswordValues) {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/password-reset/complete`, {
        reset_token: resetToken,
        new_password: data.new_password,
      });

      // Don’t attempt auto login here (flow is cookie-based and still requires OTP).
      setMode("forgot-done");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Could not set the new password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  // helpers
  const backToLogin = () => {
    setError(null);
    setResendCooldown(0);
    setMode("login");
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ERROR BANNER */}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* LOGIN: credentials */}
      {mode === "login" && (
        <Form key="login-step" {...form}>
          <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-2" autoComplete="off">
            <FormField
              control={form.control}
              name="mail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="py-5 text-black border-gray-200 bg-white"
                      autoComplete="username"
                      disabled={loading}
                      placeholder="mail@abc.com"
                      {...field}
                    />
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
                  <FormLabel className="text-black">Password</FormLabel>
                  <FormControl>
                    <Input
                      className="py-5 text-black border-gray-200"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={loading}
                      placeholder="************"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                  id="show-password"
                  checked={showPassword}
                  disabled={loading}
                  onCheckedChange={(checked) => setShowPassword(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-[#A1A1A1] font-normal hover:cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  Show Password
                </label>
              </div>

              <div className="text-xs text-black font-medium hover:cursor-pointer">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setResendCooldown(0);
                          forgotEmailForm.reset({ email: "" });
                          setMode("forgot-email");
                        }}
                        className="underline"
                      >
                        Forgot Password?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset via email OTP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Button
              className="w-full hover:bg-[#2F2F31] bg-black py-6 dark:text-[#FFFFFF] rounded-xl text-base font-semibold"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      )}

      {/* LOGIN: OTP */}
      {mode === "login-otp" && (
        <Form key="login-otp-step" {...otpform}>
          <form
            onSubmit={otpform.handleSubmit(onSubmitLoginOTP)}
            className="space-y-4"
            autoComplete="one-time-code"
          >
            <FormField
              control={otpform.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>OTP sent to your registered email(Check Junk Too)</FormDescription>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value ?? ""}
                      onChange={(v) => {
                        const next = v.replace(/\D/g, "").slice(0, 6);
                        field.onChange(next);
                        if (next.length === 6) {
                          setTimeout(() => otpform.handleSubmit(onSubmitLoginOTP)(), 0);
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
                  <FormDescription className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="text-xs underline text-[#828282]"
                      disabled={loading}
                    >
                      Back to Login
                    </button>

                    {/* <span>OTP sent to your registered email</span> */}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={onResendLoginOtp}
                        disabled={loading}
                        className="text-red-500 text-xs underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Sending..." : "Resend OTP"}
                      </button>
                    ) : (
                      <p className="text-red-500 text-xs">Resend in {resendCooldown}s</p>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">

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
            </div>
          </form>
        </Form>
      )}

      {/* FORGOT: Step 1 (Email) */}
      {mode === "forgot-email" && (
        <Form key="forgot-email-step" {...forgotEmailForm}>
          <form
            onSubmit={forgotEmailForm.handleSubmit(onRequestResetOtp)}
            className="space-y-4"
            autoComplete="off"
          >
            <FormField
              control={forgotEmailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Registered Email</FormLabel>
                  <FormControl>
                    <Input
                      className="py-5 text-black border-gray-200 bg-white"
                      placeholder="mail@abc.com"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-end">
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="text-xs underline text-[#828282]"
                      disabled={loading}
                    >
                      Back to Login
                    </button>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
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
                  "Send OTP"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* FORGOT: Step 2 (OTP) */}
      {mode === "forgot-otp" && (
        <Form key="forgot-otp-step" {...otpform}>
          <form
            onSubmit={otpform.handleSubmit(onVerifyResetOtp)}
            className="space-y-4"
            autoComplete="one-time-code"
          >
            <FormField
              control={otpform.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>
                  Enter One-Time Password
                  </FormLabel> */}

                  <FormDescription>
                    <div>OTP sent to {emailForOtp} (Check Junk Too)</div>
                  </FormDescription>

                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value ?? ""}
                      onChange={(v) => {
                        const next = v.replace(/\D/g, "").slice(0, 6);
                        field.onChange(next);
                        if (next.length === 6) {
                          setTimeout(() => otpform.handleSubmit(onVerifyResetOtp)(), 0);
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
                  <FormDescription className="flex justify-between items-start">
                    <button
                      type="button"
                      onClick={() => setMode("forgot-email")}
                      className="text-xs underline text-[#828282]"
                      disabled={loading}
                    >
                      Back
                    </button>

                    <div className="flex flex-col items-end">
                      {/* <div>OTP sent to {emailForOtp}</div> */}
                      {canResend ? (
                        <button
                          type="button"
                          onClick={onResendForgotOtp}
                          disabled={loading}
                          className="text-red-500 text-xs underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Resend OTP"}
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

            <div className="flex items-center justify-between">


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
                  "Verify OTP"
                )}
              </Button>

            </div>
          </form>
        </Form>
      )}

      {/* FORGOT: Step 3 (New Password) */}
      {mode === "forgot-reset" && (
        <Form key="forgot-reset-step" {...forgotNewPassForm}>
          <form
            onSubmit={forgotNewPassForm.handleSubmit(onCompleteReset)}
            className="space-y-4"
            autoComplete="off"
          >
            <FormField
              control={forgotNewPassForm.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">New Password</FormLabel>
                  <FormControl>
                    <Input
                      className="py-5 text-black border-gray-200"
                      type={"password"}
                      placeholder="************"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={forgotNewPassForm.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      className="py-5 text-black border-gray-200"
                      type={forgotNewPassForm.watch("show_password") ? "text" : "password"}
                      placeholder="************"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={forgotNewPassForm.control}
              name="show_password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-new-password"
                      className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      disabled={loading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-[#A1A1A1] font-normal hover:cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      onClick={() => field.onChange(!(field.value === true))}
                    >
                      Show Password
                    </label>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode("forgot-otp")}
                className="text-xs underline text-[#828282]"
                disabled={loading}
              >
                Back
              </button>

              <Button
                className="hover:bg-[#2F2F31] bg-black py-4 dark:text-[#FFFFFF] rounded-xl text-sm font-semibold"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
                  </div>
                ) : (
                  "Save New Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* FORGOT: Done */}
      {mode === "forgot-done" && (
        <div className="mt-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-green-700 font-semibold">
              Your password has been reset successfully.
            </p>
            <div className="mt-4">
              <Button
                className="w-full hover:bg-[#2F2F31] bg-black py-6 dark:text-[#FFFFFF] rounded-xl text-base font-semibold"
                onClick={backToLogin}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
