"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  const isPointerRef = useRef(false)
  const isVisibleRef = useRef(false)
  const mousePos = useRef({ x: -100, y: -100 })
  const delayedPos = useRef({ x: -100, y: -100 })
  const hasMoved = useRef(false)

  useEffect(() => {
    setMounted(true)

    // Disable on touch-only devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return
    }

    const updatePosition = (e: MouseEvent) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY

      // Snap initial position to mouse coordinates on first movement
      if (!hasMoved.current) {
        delayedPos.current.x = e.clientX
        delayedPos.current.y = e.clientY
        hasMoved.current = true
      }

      // Ensure cursor is visible as soon as the mouse moves
      if (!isVisibleRef.current) {
        isVisibleRef.current = true
        setIsVisible(true)
      }

      const target = e.target as HTMLElement | null
      if (!target) return

      const clickable = !!(
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest("label") ||
        target.closest("[role='button']") ||
        target.closest("[role='link']") ||
        target.classList.contains("cursor-pointer")
      )

      if (clickable !== isPointerRef.current) {
        isPointerRef.current = clickable
        setIsPointer(clickable)
      }
    }

    let animationFrameId: number

    const animate = () => {
      delayedPos.current.x += (mousePos.current.x - delayedPos.current.x) * 0.18
      delayedPos.current.y += (mousePos.current.y - delayedPos.current.y) * 0.18

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${delayedPos.current.x}px, ${delayedPos.current.y}px, 0) translate(-50%, -50%)`
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => {
      isVisibleRef.current = false
      setIsVisible(false)
    }
    const handleMouseEnter = () => {
      isVisibleRef.current = true
      setIsVisible(true)
    }

    window.addEventListener("mousemove", updatePosition, { passive: true })
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)
    document.documentElement.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave)
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Hide the native cursor only on desktop/mouse devices */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (hover: hover) and (pointer: fine) {
              html, body, button, a, input, select, textarea, label, [role="button"], [role="link"], * {
                cursor: none !important;
              }
            }
          `,
        }}
      />

      {/* Lagging Outer Ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] rounded-full border transition-[width,height,border-color,background-color,opacity] duration-200 ease-out ${isPointer
            ? "w-12 h-12 border-white/50 bg-white/[0.08] backdrop-blur-[1px]"
            : "w-7 h-7 border-white/30 bg-transparent"
          } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      >
        <div
          className={`w-full h-full rounded-full transition-transform duration-150 ${isClicking ? "scale-75" : "scale-100"
            }`}
        />
      </div>

      {/* Centered Follower Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] rounded-full transition-[width,height,opacity,background-color] duration-150 ${isPointer ? "w-1 h-1 bg-white" : "w-1.5 h-1.5 bg-white/80"
          } ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      />
    </>
  )
}