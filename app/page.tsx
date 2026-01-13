import { Header } from "@/components/header" // This looks for 'export function Header'
import { Hero } from "@/components/hero"
import { TrustedBy } from "@/components/trusted-by"
import { Testimonials } from "@/components/testimonials"
import { Stats } from "@/components/stats"
import { Phases } from "@/components/phases"
import { Projects } from "@/components/projects"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { CTA } from "@/components/cta"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import { StarsLayer } from "@/components/stars-layer"
import { CustomCursor } from "@/components/custom-cursor"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080f] text-white overflow-hidden relative cursor-none">
      <CustomCursor />
      <StarsLayer />

      <Header />

      <div id="hero" className="pt-20">
        <Hero />
      </div>

      <TrustedBy />
      <Testimonials />

      <div id="stats">
        <Stats />
      </div>

      <div id="phases">
        <Phases />
      </div>

      <div id="projects">
        <Projects />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <FAQ />
      <CTA />

      <div id="contact">
        <ContactForm />
      </div>

      <Footer />
    </main>
  )
}
