export default function LogoBar() {
  return (
    <section className="bg-gray-100 py-12 border-y border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/3 shrink-0">
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-[200px]">
            Trusted by fast-growing companies around the world
          </p>
        </div>
        
        <div className="md:w-2/3 flex overflow-hidden relative w-full">
          <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
            {/* Logos - using text/svg approximations for the logos */}
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
              <div className="w-6 h-6 bg-gray-800 rounded-sm flex items-center justify-center text-white text-xs">F</div>
              Framer
            </div>
            
            <div className="flex items-center gap-1 font-bold text-2xl text-gray-900 tracking-tighter">
              ramp <span className="text-gray-900 text-3xl leading-none -mt-2">/</span>
            </div>
            
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-6 h-6 rounded-full border-4 border-gray-900 border-t-transparent rotate-45"></div>
              PlanetScale
            </div>
            
            <div className="flex items-center font-bold text-xl text-gray-800 tracking-tight">
              coinbase
            </div>
            
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
              <div className="w-6 h-6 bg-gray-800 rounded-md flex items-center justify-center text-white text-xs">B</div>
              storyblok
            </div>
            
            <div className="flex items-center font-bold text-xl text-gray-400 opacity-50">
              AngelList
            </div>
            
            {/* Duplicate for seamless scrolling */}
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800 ml-12">
              <div className="w-6 h-6 bg-gray-800 rounded-sm flex items-center justify-center text-white text-xs">F</div>
              Framer
            </div>
            
            <div className="flex items-center gap-1 font-bold text-2xl text-gray-900 tracking-tighter">
              ramp <span className="text-gray-900 text-3xl leading-none -mt-2">/</span>
            </div>
          </div>
          
          {/* Gradients for smooth fade effect on edges */}
          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-100 to-transparent z-10"></div>
        </div>
      </div>
    </section>
  );
}
