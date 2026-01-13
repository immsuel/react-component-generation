"use client"

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {/* Small stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-[2px] h-[2px] bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
        {/* Medium stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-md-${i}`}
            className="absolute w-[3px] h-[3px] bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              boxShadow: "0 0 4px 1px rgba(255,255,255,0.3)",
            }}
          />
        ))}
        {/* Larger bright stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-lg-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.8,
              boxShadow: "0 0 8px 2px rgba(168, 85, 247, 0.5)",
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Arc SVG - positioned to span across hero to testimonials */}
      
      {/* Ambient gradient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full" />
      <div className="absolute top-[2800px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full" />
    </div>
  )
}
