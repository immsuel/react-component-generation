"use client"

const integrations = [
  { name: "OpenAI", logo: "/OpenAI.png" },
  { name: "Anthropic", logo: "/Anthropic.svg" },
  { name: "Make.com", logo: "/make.png" },
  { name: "Zapier", logo: "/Zapier.png" },
  { name: "Pinecone", logo: "/Pinecone.svg" },
]

export function TrustedBy() {
  return (
    <section className="py-12 bg-black/95 ">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-gray-600 text-[10px] font-medium uppercase tracking-[0.4em] mb-12">
          Powering Automations with Industry Leaders
        </p>
        
        {/* Changed flex-wrap to flex-nowrap and used justify-between for a clean single row */}
        <div className="flex flex-nowrap justify-between items-center gap-4 md:gap-12 overflow-hidden">
          {integrations.map((brand) => (
            <div 
              key={brand.name} 
              className="group cursor-default transition-all duration-500 opacity-30 hover:opacity-100 flex-shrink-0"
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="h-5 md:h-7 w-auto object-contain filter brightness-0 invert transition-all duration-300 group-hover:brightness-100 group-hover:invert-7"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}