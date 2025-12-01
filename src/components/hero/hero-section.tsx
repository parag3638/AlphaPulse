"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChartNoAxesCombined } from "lucide-react"
import { ArrowRight } from "lucide-react"


export function HeroSection() {

  return (
    <section
      className="
    relative flex w-full flex-col items-center justify-center 
    px-4 py-20 text-center min-h-[500px]
    bg-gradient-to-b from-neutral-800 via-neutral-900/90 to-neutral-950
    overflow-hidden
  ">

      {/* Header */}
      <header className="absolute top-5 left-1/2 -translate-x-1/2 w-11/12 sm:w-3/4 md:w-4/5 rounded-xl z-50 bg-white/10 backdrop-blur-xs shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="text-xl font-semibold tracking-tight text-white">AlphaPulse</span>
          </div>

          <Link href="/vaultx/dashboard" rel="noopener noreferrer" className="hidden md:block">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-5 rounded-lg font-medium shadow-sm">
              Go to Dashboard
            </Button>
          </Link>
          {/* <Link href="/login" rel="noopener noreferrer" className="hidden md:block">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-4 rounded-lg font-medium shadow-sm">
              Login
            </Button>
          </Link> */}
        </div>
      </header>

      {/* Center content */}
      <div className="relative z-10 mt-40 flex flex-col items-center gap-5 sm:gap-6 px-4 max-w-6xl my-80 xl:mb-96drik
       xl:mt-32 2xl:mb-64 2xl:mt-48 h-[calc(72vw-60rem)] text-balance">
        <h1 className="bg-gradient-to-r from-red-600 via-sky-300 to-amber-200 bg-clip-text text-transparent text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-semibold leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          Stay Ahead of Every Market Pulse
        </h1>

        <p className="text-neutral-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
          AlphaPulse fuses equities, crypto, and FX signals into one real-time command center so your team can track sentiment,
          spot anomalies, and act on opportunities before the tape moves.
        </p>

        <Link
          href="/vaultx/dashboard"
          rel="noopener noreferrer"
          className="relative z-10"
        >
          <Button
            size="lg"
            variant="outline"
            className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-white/10 px-6 text-sm font-semibold text-white transition-all hover:bg-white/20 sm:w-auto sm:px-8 sm:text-base"
            aria-label="Start using AlphaPulse"
          >
            Get Started
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        </Link>
      </div>
    </section>
  )
}
