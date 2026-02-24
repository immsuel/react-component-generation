"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    const mousePos = { x: -100, y: -100 }
    const delayedPos = { x: -100, y: -100 }

    const updatePosition = (e: MouseEvent) => {
      mousePos.x = e.clientX
      mousePos.y = e.clientY
      
      const target = e.target as HTMLElement
      const isClickable = !!(
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"
      )
      setIsPointer(isClickable)
    }

    const animate = () => {
      // 0.15 provides a smoother, slightly more delayed "weight"
      delayedPos.x += (mousePos.x - delayedPos.x) * 0.15
      delayedPos.y += (mousePos.y - delayedPos.y) * 0.15

      // Use transform directly
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
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, []) // Removed isVisible dependency to prevent loop restarts

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border transition-[width,height,border-color,background-color,opacity] duration-300 ease-out ${
          isPointer 
            ? "w-12 h-12 border-white/40 bg-white/[0.05] backdrop-blur-[1px]" 
            : "w-6 h-6 border-white/20 bg-transparent"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      >
        {/* We move the scaling logic to an inner div to avoid transform conflicts */}
        <div className={`w-full h-full rounded-full transition-transform duration-200 ${isClicking ? "scale-75" : "scale-100"}`} />
      </div>

      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-[width,height,opacity,background-color] duration-200 ${
          isPointer ? "w-1 h-1 bg-white" : "w-1.5 h-1.5 bg-white/60"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      />
      
      {/* Hide the real cursor */}
      <style jsx global>{`
        html, body, * {
          cursor: none !important;
        }
      `}</style>
    </>
  )
}