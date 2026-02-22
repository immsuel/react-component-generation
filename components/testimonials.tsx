"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    title: "No more manual data entry",
    content:
      "Immanuel came in and basically rebuilt our entire backend logic. Now, leads just flow into our CRM and Airtable without anyone touching a keyboard.",
    author: "Martin",
    role: "MD at PNP",
  },
  {
    title: "Actually helpful ai",
    content:
      "I wasnt sure about ai chatbots because most of them are useless, but these guys built us a bot that reads our technical docs and answers customers correctly",
    author: "Nic H",
    role: "Founder",
  },
  {
    title: "Fast delivery",
    content:
      "We needed a system to score our incoming leads before sales called them. I expected a month long project, but they had a working prototype in 72 hours. And its not just fast, it actually works exactly how we discussed.",
    author: "Rene H",
    role: "Founder, MYM Consultancy",
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="px-4 py-24 relative bg-black/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
            Client <span className="text-slate-400">Feedback</span>
          </h2>
          <p className="text-gray-600 text-[10px] tracking-[0.4em] uppercase font-medium">
            Direct from the source
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-slate-500 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                ))}
              </div>
              <h3 className="font-medium text-white text-lg mb-4">{testimonial.title}</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed font-normal">
                "{testimonial.content}"
              </p>
              <div className="border-t border-white/5 pt-6">
                <p className="font-semibold text-white text-sm tracking-tight">{testimonial.author}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-slate-500 text-slate-500 opacity-50" />
              ))}
            </div>
            <h3 className="font-medium text-white text-xl mb-4">{testimonials[currentIndex].title}</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed italic">"{testimonials[currentIndex].content}"</p>
            <div className="border-t border-white/5 pt-6">
              <p className="font-semibold text-white text-sm">{testimonials[currentIndex].author}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">{testimonials[currentIndex].role}</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-6 mt-8">
            <button onClick={prevSlide} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-white w-4" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}