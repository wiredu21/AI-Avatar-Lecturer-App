import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-400 to-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Transform Your Learning Today</h2>
        <p className="text-xl mb-8">Join VirtuAId and experience the future of education</p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          Get Started Now
        </Button>
      </div>
    </section>
  )
}

