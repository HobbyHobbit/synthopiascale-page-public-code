import dynamic from "next/dynamic"
import { ParticleBackground } from "@/components/particle-background"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"

const About = dynamic(() => import("@/components/about").then(mod => ({ default: mod.About })), {
  loading: () => <div className="min-h-screen" />
})
const ArtistsSection = dynamic(() => import("@/components/artists-section").then(mod => ({ default: mod.ArtistsSection })), {
  loading: () => <div className="min-h-screen" />
})
const SamplepacksSection = dynamic(() => import("@/components/samplepacks-section").then(mod => ({ default: mod.SamplepacksSection })), {
  loading: () => <div className="min-h-screen" />
})
const Contact = dynamic(() => import("@/components/contact").then(mod => ({ default: mod.Contact })), {
  loading: () => <div className="min-h-screen" />
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="min-h-[200px]" />
})

export default function Home() {
  return (
    <div className="snap-container">
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <ParticleBackground />
      <Header />
      <main id="main-content" className="relative z-10">
        <section className="snap-section">
          <Hero />
        </section>
        <section className="snap-section">
          <About />
        </section>
        <section className="snap-section">
          <ArtistsSection />
        </section>
        <section className="snap-section">
          <SamplepacksSection />
        </section>
        <section className="snap-section">
          <Contact />
        </section>
      </main>
      <section className="snap-section">
        <Footer />
      </section>
    </div>
  )
}
