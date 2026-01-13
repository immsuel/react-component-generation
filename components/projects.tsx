const clients = ["VELARI", "FAIRPAY", "MYM CONSULTING", "THANACHART"]

export function Projects() {
  return (
    <section className="px-4 py-20 relative overflow-visible">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Projects</h2>
            <p className="text-gray-400 mb-10 max-w-md">
              A selection of high-performance digital experiences crafted for the world&apos;s most ambitious brands.
            </p>

            <div className="space-y-4">
              {clients.map((client, index) => (
                <div key={client} className="group flex items-center gap-4 cursor-pointer">
                  <div className="w-12 h-[2px] bg-gradient-to-r from-purple-500/50 to-purple-400/50 group-hover:w-20 group-hover:from-purple-400 group-hover:to-purple-300 transition-all shadow-sm shadow-purple-500/50" />
                  <span
                    className={`text-2xl md:text-3xl font-bold tracking-wider transition-colors ${
                      index === 0 ? "text-white" : "text-gray-600 group-hover:text-white"
                    }`}
                  >
                    {client}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Project Preview */}
          <div className="relative">
            <div className="text-gray-500 text-sm mb-4 text-right">2025</div>
            <div className="relative">
              <div className="absolute -inset-2 bg-purple-500/10 blur-xl rounded-3xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm">
                <img
                  src="/Velari.jpg"
                  alt="Velari project preview"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-gray-300 border border-white/10">
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
