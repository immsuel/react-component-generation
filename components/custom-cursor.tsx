"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  
  // Keep boolean states in React for conditional styling (low frequency)
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    // Use refs for high-frequency position tracking
    const mousePos = { x: 0, y: 0 }
    const delayedPos = { x: 0, y: 0 }

    const updatePosition = (e: MouseEvent) => {
      mousePos.x = e.clientX
      mousePos.y = e.clientY
      if (!isVisible) setIsVisible(true)

      const target = e.target as HTMLElement
      const isClickable = Boolean(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"
      )
      setIsPointer(isClickable)
    }

    // Animation loop for ultra-smooth movement
    const animate = () => {
      // Direct DOM manipulation bypasses React Re-renders
      // 0.2 factor adds that "weighted" high-end feel
      delayedPos.x += (mousePos.x - delayedPos.x) * 0.2
      delayedPos.y += (mousePos.y - delayedPos.y) * 0.2

      cursor.style.transform = `translate3d(${delayedPos.x}px, ${delayedPos.y}px, 0) translate(-50%, -50%)`
      dot.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)`

      requestAnimationFrame(animate)
    }
    const rafId = requestAnimationFrame(animate)

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
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
      document.body.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isVisible])

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border transition-[width,height,border-color,background-color,opacity] duration-300 ease-out ${
          isPointer 
            ? "w-14 h-14 border-white/20 bg-white/[0.03] backdrop-blur-[2px]" 
            : "w-8 h-8 border-white/10 bg-transparent"
        } ${isVisible ? "opacity-100" : "opacity-0"} ${isClicking ? "scale-90" : "scale-100"}`}
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-[width,height,opacity] duration-150 ease-out ${
          isPointer ? "w-1 h-1 bg-white" : "w-1.5 h-1.5 bg-slate-400"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      />
    </>
  )
}