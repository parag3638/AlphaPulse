"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Stethoscope } from "lucide-react"

export default function MobileHero() {
  const router = useRouter()

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-start bg-cover bg-center"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-10" />

      <div className="min-h-screen flex flex-col w-full">
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
        <main className="flex-1 flex items-center justify-center px-6 py-20">

          <div className="max-w-7xl mx-auto text-center space-y-8 pt-16 absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              AI-Powered Healthcare
            </div>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed text-white z-20">
              Streamline your healthcare experience with our intelligent AI assistant. Fast, secure, and designed for
              modern medical practices.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 z-10">
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/intake")}
                // className="group h-12 px-8 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer z-10"
                className="h-12 px-8 text-base font-medium border-border hover:bg-secondary hover:cursor-pointer z-10"
                aria-label="Start patient intake process"
              >
                Patient Check-In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>

              {/* <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-12 px-8 text-base font-medium border-border hover:bg-secondary hover:cursor-pointer z-10"
                aria-label="Access doctor portal"
              >
                Doctor Portal
              </Button> */}
            </div>


            {/* Trust Indicators */}
            <div className="pt-4 flex flex-col items-center gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Trusted by Healthcare Professionals
              </p>
              <div className="flex items-center gap-8 opacity-90 text-gray-50">
                <div className="text-xs sm:text-sm font-medium">HIPAA Compliant</div>
                <div className="h-4 w-px bg-border"></div>
                <div className="text-xs sm:text-sm font-medium">End-to-End Encrypted</div>
                <div className="h-4 w-px bg-border"></div>
                <div className="text-xs sm:text-sm font-medium">SOC 2 Certified</div>
              </div>
            </div>
          </div>
        </main>

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


