import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="px-4 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop Imagining. Start Launching.</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Your new digital home is only 72 hours away. Generate your instant preview today and own the reality of your
          brand.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="URL or Business Idea"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-3 group whitespace-nowrap">
            Generate My Vision
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
