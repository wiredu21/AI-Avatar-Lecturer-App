import Hero from "@/components/hero"
import Features from "@/components/features"
import UniversitySlider from "@/components/university-slider"
import FindYourCourse from "@/components/find-your-course"
import CustomiseAILecturer from "@/components/customise-ai-lecturer"
import ChatSimulator from "@/components/chat-simulator"
import Testimonials from "@/components/testimonials"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <section id="hero">
        <Hero />
      </section>
      <section id="features">
        <Features />
      </section>
      <UniversitySlider />
      <FindYourCourse />
      <CustomiseAILecturer />
      <section id="demo">
        <ChatSimulator />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <CTA />
      <Footer />
    </main>
  )
}

