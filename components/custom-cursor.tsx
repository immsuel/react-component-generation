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

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Outer ring */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border transition-[width,height,border-color,opacity] duration-200 ease-out ${
          isPointer ? "w-12 h-12 border-purple-400/60" : "w-8 h-8 border-white/40"
        } ${isClicking ? "scale-90" : "scale-100"} ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${isClicking ? "scale(0.9)" : "scale(1)"}`,
          transition: "transform 0.1s ease-out, width 0.2s ease-out, height 0.2s ease-out, border-color 0.2s ease-out, opacity 0.2s ease-out",
          boxShadow: isPointer
            ? "0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(168, 85, 247, 0.1)"
            : "0 0 15px rgba(255, 255, 255, 0.15)",
        }}
      />
      {/* Inner dot */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full transition-[width,height,background-color,opacity] duration-100 ease-out ${
          isPointer ? "w-2 h-2 bg-purple-400" : "w-1.5 h-1.5 bg-white"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.05s linear, width 0.1s ease-out, height 0.1s ease-out, background-color 0.2s ease-out, opacity 0.1s ease-out",
          boxShadow: isPointer ? "0 0 10px rgba(168, 85, 247, 0.8)" : "0 0 8px rgba(255, 255, 255, 0.5)",
        }}
      />
    </>
  )
}
