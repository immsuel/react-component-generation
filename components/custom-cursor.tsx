"use client"

import { useEffect, useState } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      const target = e.target as HTMLElement
      const isClickable = Boolean(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        window.getComputedStyle(target).cursor === "pointer"
      )

      setIsPointer(isClickable)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.body.addEventListener("mouseleave", handleMouseLeave)
    document.body.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
      document.body.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [])

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Outer ring - Industrial Matte Style */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border transition-all duration-300 ease-out ${
          isPointer 
            ? "w-14 h-14 border-white/20 bg-white/[0.03] backdrop-blur-[2px]" 
            : "w-8 h-8 border-white/10 bg-transparent"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${isClicking ? "scale(0.85)" : "scale(1)"}`,
          boxShadow: isPointer
            ? "0 0 30px rgba(255, 255, 255, 0.05)"
            : "none",
        }}
      />
      
      {/* Inner dot - Precision Point */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full transition-all duration-150 ease-out ${
          isPointer ? "w-1 h-1 bg-white" : "w-1.5 h-1.5 bg-slate-400"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
          boxShadow: isPointer ? "0 0 10px rgba(255, 255, 255, 0.8)" : "none",
        }}
      />
    </>
  )
}