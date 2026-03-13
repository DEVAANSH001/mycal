import { Calendar, Copy, Plus, Video, MicOff, MessageSquare, Monitor } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm mb-6">
        🤝 How it works
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
        With us, appointment scheduling is easy
      </h2>

      <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        Effortless scheduling for business and individuals, powerful solutions
        for fast-growing modern companies.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
        <Link
          href="/login"
          className="w-full sm:w-auto bg-gray-900 text-white font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          Get started <span className="text-gray-400">›</span>
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto bg-white text-gray-900 font-medium py-3 px-6 rounded-full border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          Book a demo <span className="text-gray-400">›</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mb-6">
            01
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connect your calendar</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            We&apos;ll handle all the cross-referencing, so you don&apos;t have to worry
            about double bookings.
          </p>
          
          <div className="relative h-48 w-full flex items-center justify-center mt-auto overflow-hidden rounded-xl bg-gray-50/50 border border-gray-100">
            {/* Visual representation */}
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-gray-300"></div>
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-gray-300"></div>
            
            <div className="z-10 bg-white border border-gray-200 rounded-full px-4 py-2 font-bold text-sm shadow-sm">
              Cal.com
            </div>
            
            {/* Orbiting icons */}
            <div className="absolute top-8 left-8 w-8 h-8 bg-white rounded-md shadow border border-gray-100 flex items-center justify-center text-blue-500 font-bold text-xs">
              O
            </div>
            <div className="absolute bottom-12 right-6 w-8 h-8 bg-white rounded-md shadow border border-gray-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-500" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-md shadow border border-gray-100 flex items-center justify-center text-xs font-bold text-red-500">
              17
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mb-6">
            02
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Set your availability</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Want to block off weekends? Set up any buffers? We make that easy.
          </p>
          
          <div className="relative h-48 w-full mt-auto overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex flex-col gap-3">
              {/* Row 1 */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-8">Mon</span>
                <div className="flex-1 flex items-center gap-1 text-xs">
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">8:30 am</span>
                  <span className="text-gray-400">-</span>
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">5:00 pm</span>
                </div>
                <div className="flex gap-1 text-gray-400">
                  <Plus className="w-3 h-3" />
                  <Copy className="w-3 h-3" />
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-8">Tue</span>
                <div className="flex-1 flex items-center gap-1 text-xs">
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">9:00 am</span>
                  <span className="text-gray-400">-</span>
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">6:30 pm</span>
                </div>
                <div className="flex gap-1 text-gray-400">
                  <Plus className="w-3 h-3" />
                  <Copy className="w-3 h-3" />
                </div>
              </div>
              
              {/* Row 3 */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-8">Wed</span>
                <div className="flex-1 flex items-center gap-1 text-xs">
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">10:00 am</span>
                  <span className="text-gray-400">-</span>
                  <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">7:00 pm</span>
                </div>
                <div className="flex gap-1 text-gray-400">
                  <Plus className="w-3 h-3" />
                  <Copy className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mb-6">
            03
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Choose how to meet</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            It could be a video chat, phone call, or a walk in the park!
          </p>
          
          <div className="relative h-48 w-full mt-auto rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-6 bg-gray-50 border-b border-gray-200 flex items-center px-2 gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <div className="flex-1 flex">
              <div className="w-1/2 border-r border-gray-200 flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-end justify-center overflow-hidden">
                  <div className="w-10 h-10 bg-gray-900 rounded-t-full mt-4"></div>
                </div>
              </div>
              <div className="w-1/2 flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-end justify-center overflow-hidden">
                  <div className="w-10 h-10 bg-gray-900 rounded-t-full mt-4"></div>
                </div>
              </div>
            </div>
            <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-center gap-3">
              <Video className="w-3 h-3 text-gray-600" />
              <MicOff className="w-3 h-3 text-gray-600" />
              <MessageSquare className="w-3 h-3 text-gray-600" />
              <Monitor className="w-3 h-3 text-gray-600" />
              <div className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-bold rounded">REC</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
