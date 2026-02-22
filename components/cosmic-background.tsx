"use client"

import { useEffect, useState } from "react"

export function CosmicBackground() {
  const [mounted, setMounted] = useState(false)

  // Ensure hydration matches server by only rendering random values on client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#020202] -z-10">
      {/* Dynamic Star Field */}
      <div className="absolute inset-0">
        {/* Small Dim Stars */}
        {[...Array(60)].map((_, i) => (
          <div
            key={`star-sm-${i}`}
            className="absolute w-[1px] h-[1px] bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Medium Purple-Tinted Stars */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`star-md-${i}`}
            className="absolute w-[2px] h-[2px] bg-purple-200 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              boxShadow: "0 0 3px 1px rgba(168, 85, 247, 0.2)",
            }}
          />
        ))}

        {/* Large "Engine" Stars */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`star-lg-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.6,
              boxShadow: "0 0 10px 2px rgba(168, 85, 247, 0.4)",
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric AI Glows */}
      {/* Top Hero Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-purple-600/10 blur-[120px] rounded-full opacity-50" />
      
      {/* Mid-Page Logic Glow (Phases/Stats area) */}
      <div className="absolute top-[150vh] right-[-10%] w-[50vw] h-[50vh] bg-blue-600/5 blur-[100px] rounded-full" />
      
      {/* Bottom Conversion Glow (Pricing/Testimonials) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-purple-900/20 blur-[150px] rounded-t-full" />

      {/* Optional: Static Grid Overlay for "Digital" feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  )
}