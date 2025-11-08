// app/page.tsx (wrapper that swaps at md)
"use client"
import DesktopHero from "@/components/hero/DesktopHero" // your first version
import MobileHero from "@/components/hero/MobileHero"   // your second version

export default function HomePage() {
  return (
    <>
      {/* Mobile / small screens */}
      <div className="lg:hidden">
        <MobileHero />
      </div>

      {/* Desktop / md and up */}
      <div className="hidden lg:block">
        <DesktopHero />
      </div>
    </>
  )
}
