"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    title: "Business Identity",
    content:
      "Just another Business owner with passion and big dreams. Immanuel was able to express all of our passion and ideas into a quality business identity that makes us feel proud and professional.",
    author: "Martin",
    role: "MD PNP",
  },
  {
    title: "Web Development for SaaS",
    content:
      "Immanuel was an absolute legend, made the whole process very simple and effective! Got any changes I needed on the website done within a few hours and the website was online the next day! Highly recommend!",
    author: "Nic H",
    role: "Founder",
  },
  {
    title: "E-Commerce Solution",
    content:
      "They understood what I wanted my e-commerce store to look like and how I wanted it to operate. What they produced was above and beyond what I expected. The whole process was easy and happened much faster than I anticipated.",
    author: "Rene H",
    role: "Founder MYM Consultancy",
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
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />
                ))}
              </div>
              <h3 className="font-semibold text-lg mb-3">{testimonial.title}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{testimonial.content}</p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-medium text-sm">{testimonial.author}</p>
                <p className="text-gray-500 text-xs">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />
              ))}
            </div>
            <h3 className="font-semibold text-lg mb-3">{testimonials[currentIndex].title}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{testimonials[currentIndex].content}</p>
            <div className="border-t border-white/10 pt-4">
              <p className="font-medium text-sm">{testimonials[currentIndex].author}</p>
              <p className="text-gray-500 text-xs">{testimonials[currentIndex].role}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={prevSlide} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-purple-400" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
