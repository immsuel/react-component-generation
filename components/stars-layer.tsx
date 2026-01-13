"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface Star {
  id: number
  top: string
  left: string
  size: number
  opacity: number
  delay: number
  duration: number
  glow: boolean
  color: string
}

export function StarsLayer() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generatedStars: Star[] = []
    const colors = [
      "rgba(255, 255, 255, 1)",
      "rgba(199, 210, 254, 1)", // indigo tint
      "rgba(221, 214, 254, 1)", // violet tint
      "rgba(233, 213, 255, 1)", // purple tint
    ]

    // Small shimmering stars
    for (let i = 0; i < 80; i++) {
      generatedStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.4,
        delay: Math.random() * 4,
        duration: 1.5 + Math.random() * 2,
        glow: false,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Medium stars with glow
    for (let i = 80; i < 110; i++) {
      generatedStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 1.5,
        opacity: 0.5 + Math.random() * 0.4,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        glow: true,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Bright accent stars
    for (let i = 110; i < 125; i++) {
      generatedStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 2,
        opacity: 0.7 + Math.random() * 0.3,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 1.5,
        glow: true,
        color: "rgba(192, 132, 252, 1)", // purple glow
      })
    }

    setStars(generatedStars)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: var(--base-opacity); transform: scale(1); }
          50% { opacity: calc(var(--base-opacity) * 0.3); transform: scale(0.8); }
        }
        @keyframes shimmerBright {
          0%, 100% { opacity: var(--base-opacity); transform: scale(1); box-shadow: var(--glow); }
          50% { opacity: calc(var(--base-opacity) * 0.4); transform: scale(0.9); box-shadow: var(--glow-dim); }
        }
      `}</style>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              // @ts-ignore - CSS custom properties
              "--base-opacity": star.opacity,
              "--glow": star.glow ? `0 0 ${star.size * 3}px ${star.size}px rgba(168, 85, 247, 0.5)` : "none",
              "--glow-dim": star.glow
                ? `0 0 ${star.size * 1.5}px ${star.size * 0.5}px rgba(168, 85, 247, 0.2)`
                : "none",
              animation: star.glow
                ? `shimmerBright ${star.duration}s ease-in-out infinite`
                : `shimmer ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: star.glow ? `0 0 ${star.size * 3}px ${star.size}px rgba(168, 85, 247, 0.5)` : "none",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
