import { ChevronDown, MapPin, Globe, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column */}
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            Cal.com launches v6.2 <span className="text-gray-400">›</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            The better way to schedule your meetings
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
            A fully customizable scheduling software for individuals, businesses
            taking calls and developers building scheduling platforms where users
            meet users.
          </p>

          <div className="flex flex-col w-full max-w-md gap-3 mt-4">
            <button className="w-full bg-gray-900 text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
            <Link href="/signup" className="w-full">
              <button className="w-full bg-white text-gray-900 font-medium py-3.5 px-6 rounded-full border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                Sign up with email <span className="text-gray-400">›</span>
              </button>
            </Link>
            <p className="text-sm text-gray-500 text-center mt-2">
              No credit card required
            </p>
          </div>
        </div>

        {/* Right Column - Booking Card UI */}
        <div className="relative w-full max-w-2xl mx-auto lg:ml-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
            {/* Left Panel */}
            <div className="p-6 sm:w-1/2 border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src="https://picsum.photos/seed/denise/100/100"
                  alt="Denise Wilson"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Denise Wilson</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  Property Viewing
                </h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tour your potential dream home with our experienced real estate
                professionals.
              </p>

              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                  {["15m", "30m", "45m", "1h"].map((time) => (
                    <button
                      key={time}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${time === "45m"
                        ? "bg-white shadow-sm text-gray-900 border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Pine Realty Office
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Australia/Sydney <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Right Panel - Calendar */}
            <div className="p-6 sm:w-1/2 bg-gray-50/50">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-900">
                  May <span className="text-gray-500 font-normal">2025</span>
                </h4>
                <div className="flex gap-2">
                  <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                <div>SUN</div>
                <div>MON</div>
                <div>TUE</div>
                <div>WED</div>
                <div>THU</div>
                <div>FRI</div>
                <div>SAT</div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty days */}
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>

                {/* Days 1-31 */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isAvailable = [15, 16, 20, 22, 23, 27, 28, 29, 30].includes(day);
                  const isSelected = day === 21;

                  return (
                    <button
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${isSelected
                        ? "bg-gray-900 text-white shadow-md"
                        : isAvailable
                          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                          : "text-gray-400 hover:bg-gray-100"
                        }`}
                    >
                      {day}
                      {day === 15 && <div className="absolute mt-5 w-1 h-1 bg-gray-900 rounded-full"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-6 mt-6 px-2">
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#00B67A] p-0.5 rounded-sm">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                <Star className="w-3 h-3 fill-black" /> Trustpilot
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#DA552F] fill-[#DA552F]" />
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#DA552F]">
                <div className="w-4 h-4 rounded-full bg-[#DA552F] text-white flex items-center justify-center text-[10px]">P</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i === 4 ? 'text-red-500/50 fill-red-500/50' : 'text-red-500 fill-red-500'}`} />
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">G</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
