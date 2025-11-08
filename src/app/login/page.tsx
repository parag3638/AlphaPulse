"use client"

import Image from "next/image";
import { Metadata } from "next";
import sideLogin from "@/assets/sideLogin.png"
import FormHandler from "@/components/login/FormHandler";
import { House } from 'lucide-react';
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  return (
    <>
      <div className="w-full mx-auto overflow-y-hidden flex flex-row h-screen ">

        {/* <div className="hidden xl:block">
          <Image className="z-0 hidden min-[1600px]:block min-[1600px]:w-[1024px] min-[1600px]:h-[1024px]" src={sideLogin} alt="sideLogin" />
        </div> */}

        <div className="relative hidden h-full w-3/5 flex-col bg-muted p-10 text-white xl:flex dark:border-r">
          <div className="absolute inset-0 bg-rose-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            AlphaPulse
          </div>
          <div className="relative z-10 mt-auto pr-8">
            <blockquote className="space-y-2">
              <p className="text-base">
                &ldquo;The right man in the wrong place can make all the difference.&rdquo;
              </p>
              <footer className="text-sm">-Butcher</footer>
            </blockquote>
          </div>
        </div>

        <div className="z-20 mx-auto w-2/3 lg:w-1/2 xl:-ml-12 2xl:-ml-16 xl:bg-white flex flex-col justify-center lg:rounded-l-[48px]">
          <button onClick={() => router.push("/")} className="absolute top-5 right-5 rounded-full bg-muted p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition">
            <House className="w-6 h-6" />
          </button>
          <FormHandler />
        </div>

      </div>
    </>
  );
}
