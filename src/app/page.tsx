import { HeroSection } from "@/components/hero/hero-section"
import { DashboardPreview } from "@/components/hero/dashboard-preview"
import { SocialProof } from "@/components/hero/social-proof"
import { LargeTestimonial } from "@/components/hero/large-testimonial"
import { FooterSection } from "@/components/hero/footer-section"
import { AnimatedSection } from "@/components/hero/animated-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="mx-auto relative">
          <HeroSection />
          {/* Dashboard Preview Wrapper */}

          <div
            className="
              absolute inset-x-0
              min-[480px]:bottom-[-240px]
              sm:bottom-[-300px]
              md:bottom-[-420px]
              lg:bottom-[-520px]
              xl:bottom-[-580px]
              2xl:bottom-[-620px]
              min-[1380px]:bottom-[-560px]              
              min-[1450px]:bottom-[-560px]              
              min-[1600px]:bottom-[-640px]              
              min-[1700px]:bottom-[-690px]              
              flex justify-center
              z-30
              transition-all duration-300
            "
          >
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>

        </main>

        <AnimatedSection className="relative z-10 mx-auto px-6 min-[480px]:mt-[280px] md:mt-[400px] lg:mt-[540px] xl:mt-[600px] 2xl:mt-[600px] min-[1600px]:mt-[720px]" delay={0.1}>
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 mx-auto mt-8 md:mt-16" delay={0.2}>
          <LargeTestimonial />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 mx-auto mt-8 md:mt-16" delay={0.1}>
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
