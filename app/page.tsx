import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CTA } from "@/components/cta"
import { TrustedBy } from "@/components/trusted-by"
import { Stats } from "@/components/stats"
import { Phases } from "@/components/phases"
import { Systems } from "@/components/systems"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080f] text-white overflow-hidden relative cursor-none">
      <CustomCursor />

      <Header />

      <div id="hero" className="pt-20">
        <Hero />
      </div>

      <TrustedBy />

      <CTA />

      <div id="stats">
        <Stats />
      </div>

      <div id="phases">
        <Phases />
      </div>

      <div id="systems">
        <Systems />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <FAQ />

      <div id="contact">
        <ContactForm />
      </div>

      <Footer />
    </main>
  )
}