"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Stethoscope } from "lucide-react"


export default function DesktopHero() {
    const router = useRouter()
    const [heroLoaded, setHeroLoaded] = useState(false)

    return (


        <section
            id="home"
            className="
                relative h-screen flex items-center overflow-hidden
                /* defaults (mobile-first) */
                [--bgx:-10%] [--bgy:center]
                /* tune per breakpoint */
                sm:[--bgx:-5%]
                md:[--bgx:20%]
                lg:[--bgx:0%] lg:[--bgy:top]
                xl:[--bgx:0%] xl:[--bgy:top]
                2xl:[--bgx:0%] 2xl:[--bgy:top]
            "
        >
            <div className="absolute inset-0 -z-20 bg-[#030711]">
                <Image
                    src="/hero.png"
                    alt="Doctors collaborating with the AlphaPulse assistant"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    style={{ objectPosition: "var(--bgx) var(--bgy)" }}
                    onLoadingComplete={() => setHeroLoaded(true)}
                />
            </div>

            {/* readability overlay */}
            {heroLoaded && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
            )}

            {!heroLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-0 text-white">
                    <div className="flex items-center gap-3 text-sm font-medium tracking-wide">
                        <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading hero content" />
                        Preparing experience...
                    </div>
                </div>
            )}


            <div
                className={`
                    min-h-screen flex flex-col w-full transition-opacity duration-300
                    ${heroLoaded ? "opacity-100" : "opacity-0"}
                `}
                aria-hidden={!heroLoaded}
            >
                {/* Header */}
                <header className="absolute top-5 left-1/2 -translate-x-1/2 w-11/12 sm:w-3/4 md:w-4/5 rounded-xl z-50 bg-white/20 backdrop-blur-xs shadow-sm">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-6 w-6 text-accent" aria-hidden="true" />
                            <span className="text-xl font-semibold tracking-tight text-white">AlphaPulse</span>
                        </div>


                        <Button
                            variant="default"
                            onClick={() => router.push("/login")}
                            className="text-white font-semibold hover:text-gray-300"
                        >
                            Doctor Login
                        </Button>
                    </div>
                </header>




                {/* Hero Section */}
                <main className="flex-1 flex items-center px-8 sm:px-12 md:px-16 lg:px-24">
                    <div className="max-w-3xl space-y-8 text-left z-10">
                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white drop-shadow-lg leading-tight">
                            {/* Revolutionize Your <br className="hidden sm:block" /> Healthcare Practice */}
                            Revolutionize Your  <br className="hidden sm:block" /> <div className="py-1" />Healthcare Practice
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base lg:text-lg text-white/90 max-w-2xl leading-relaxed">
                            Streamline your healthcare experience with our intelligent AI assistant.
                            Fast, secure, and designed for modern medical practices.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push("/intake")}
                                className="h-12 px-8 text-base font-medium border-white text-black/90 hover:bg-white/10 hover:text-white"
                                aria-label="Start patient intake process"
                            >
                                Patient Check-In
                                <ArrowRight
                                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium z-10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                </span>
                                AI-Powered Healthcare
                            </div>
                        </div>
                    </div>
                </main>


                {/* Trust Indicators */}
                <div className="m-auto">
                    <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center text-white">
                        <p className="text-xs sm:text-sm uppercase tracking-wider font-medium pr-4">
                            Trusted by Healthcare Professionals
                        </p>
                        <div className="hidden sm:flex items-center gap-4 text-xs sm:text-sm font-medium">
                            <span className="whitespace-nowrap">HIPAA Compliant</span>
                            <span className="h-4 w-px bg-white/40"></span>
                            <span className="whitespace-nowrap">End-to-End Encrypted</span>
                            <span className="h-4 w-px bg-white/40"></span>
                            <span className="whitespace-nowrap">SOC 2 Certified</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-border/40 py-6 z-10">
                    <div className="container mx-auto px-6 text-center text-sm text-white">
                        © 2025 AlphaPulse. All rights reserved.
                    </div>
                </footer>
            </div>
        </section>
    )
}
