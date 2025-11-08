"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import Image from "next/image";
import logo from "@/assets/google.png";
import localFont from "next/font/local";

const Nunito = localFont({ src: "../../assets/fonts/NunitoSans-VariableFont.ttf" });

// const AUTH_BASE = (process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:9000/api/auth").replace(/\/+$/, ""); // trim trailing slash
const AUTH_BASE = (process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "https://authbackend-cc2d.onrender.com/api/auth").replace(/\/+$/, ""); // trim trailing slash


export default function FormHandler() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [gLoading, setGLoading] = useState(false);

    const title = mode === "login" ? "Login to your Account" : "Create your Account";
    const subtitle =
        mode === "login"
            ? "Impossible is what we do best!"
            : "Let’s get you set up in under a minute.";

    const startGoogle = () => {
        if (!AUTH_BASE) {
            console.error("NEXT_PUBLIC_AUTH_BASE_URL is missing");
            return;
        }
        setGLoading(true);
        // Full page redirect → /api/auth/google/start
        window.location.replace(`${AUTH_BASE}/google/start`);
        // window.location.replace('/api/auth/google/start'); // or '/auth/google/start' if that's your rewrite
        
    };

    return (
        <div className="w-full">
            <div className={`${Nunito.className} w-full flex flex-col items-center justify-center h-full`}>
                <div className="w-3/4 2xl:w-1/2">
                    {/* Header */}
                    <div className="py-2 pb-2 self-start">
                        <div className="text-[#525252] text-4xl font-bold">{title}</div>
                        <div className="text-[#525252] text-base font-medium pt-1">{subtitle}</div>
                    </div>

                    {/* Google CTA */}
                    <div className="py-2 self-start">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className="w-full py-5 border-gray-200 hover:bg-[#F4F4F5] dark:text-[#828282] bg-white rounded-lg font-semibold text-[#828282] text-sm"
                                        variant="outline"
                                        onClick={startGoogle}
                                        disabled={gLoading}
                                    >
                                        <Image src={logo} alt="" className="w-4 mr-[10px]" />
                                        {gLoading ? "Redirecting…" : "Continue with Google"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Secure Google sign-in, then OTP to your Gmail</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Divider */}
                    <div className="py-4 px-8">
                        <Separator className="bg-[#F2F2F3]" />
                    </div>

                    {/* Auth form area */}
                    <div className="space-y-6">
                        {mode === "login" ? <LoginForm /> : <RegisterForm />}
                    </div>

                    {/* Footer switch */}
                    <div className="flex flex-row pt-12 justify-center text-sm">
                        {mode === "login" ? (
                            <>
                                <div className="pr-[6px] text-[#828282] font-[400]">Not Registered Yet?</div>
                                <button
                                    type="button"
                                    className="text-red-700 font-bold hover:cursor-pointer"
                                    onClick={() => setMode("register")}
                                >
                                    Create an Account
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="pr-[6px] text-[#828282] font-[400]">Already have an account?</div>
                                <button
                                    type="button"
                                    className="text-red-700 font-bold hover:cursor-pointer"
                                    onClick={() => setMode("login")}
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
