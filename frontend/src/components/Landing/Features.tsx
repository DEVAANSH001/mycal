import { ChevronDown, Globe, Video } from "lucide-react";
import Image from "next/image";

export default function Features() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
        Your all-purpose scheduling app
      </h2>

      <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        Discover a variety of our advanced features. Unlimited and free for
        individuals.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
        <button className="w-full sm:w-auto bg-gray-900 text-white font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          Get started <span className="text-gray-400">›</span>
        </button>
        <button className="w-full sm:w-auto bg-white text-gray-900 font-medium py-3 px-6 rounded-full border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          Book a demo <span className="text-gray-400">›</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Card 1: Avoid meeting overload */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Avoid meeting overload</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Only get booked when you want to. Set daily, weekly or monthly limits
            and add buffers around your events to allow you to focus or take a break.
          </p>
          
          <div className="mt-auto border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-900">
              Notice and buffers
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Minimum notice</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  1 hour <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">Buffer before event</label>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    15 mins <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">Buffer after event</label>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    15 mins <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Time-slot intervals</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  5 mins <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Custom booking link */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stand out with a custom booking link</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Customize your booking link so it&apos;s short and easy to remember for
            your bookers. No more long, complicated links one can easily forget.
          </p>
          
          <div className="mt-auto relative pt-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-1.5 font-bold text-sm shadow-sm z-10">
              cal.com/ewa
            </div>
            <div className="border border-gray-100 rounded-xl bg-white shadow-sm p-5 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src="https://picsum.photos/seed/ewa/100/100"
                    alt="Ewa Michalak"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="text-sm font-medium text-gray-500">Ewa Michalak</div>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">Marketing Strategy Session</h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Let&apos;s collaborate on campaigns, co-marketing opportunities, and learn how Cal.com is approaching growth and brand.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div className="flex bg-gray-50 rounded p-0.5 border border-gray-100 text-xs">
                  <span className="px-2 py-0.5 text-gray-500">15m</span>
                  <span className="px-2 py-0.5 bg-white shadow-sm rounded text-gray-900 font-medium">30m</span>
                  <span className="px-2 py-0.5 text-gray-500">45m</span>
                  <span className="px-2 py-0.5 text-gray-500">1h</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                    <Video className="w-2.5 h-2.5" />
                  </div>
                  Google Meet
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Europe/Warsaw <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Streamline bookers experience */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Streamline your bookers&apos; experience</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Let your bookers overlay their calendar, receive booking confirmations
            via text or email, get events added to their calendar, and allow them to
            reschedule with ease.
          </p>
          
          <div className="mt-auto border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center justify-end gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                Overlay my calendar
              </div>
              <div className="flex bg-gray-50 rounded p-0.5 border border-gray-100 text-xs text-gray-400">
                <span className="px-2 py-0.5">12h</span>
                <span className="px-2 py-0.5 bg-white shadow-sm rounded text-gray-900">24h</span>
              </div>
            </div>
            <div className="grid grid-cols-5 divide-x divide-gray-100 bg-gray-50/50">
              {['Wed 06', 'Thu 07', 'Fri 08', 'Sat 09', 'Sun 10'].map((day) => (
                <div key={day} className="flex flex-col">
                  <div className="text-center py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    {day}
                  </div>
                  <div className="h-8 border-b border-gray-100"></div>
                  <div className="h-8 border-b border-gray-100"></div>
                  <div className="h-8 border-b border-gray-100"></div>
                  <div className="h-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Reduce no-shows */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reduce no-shows with automated meeting reminders</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Easily send sms or meeting reminder emails about bookings, and send
            automated follow-ups to gather any relevant information before the meeting.
          </p>
          
          <div className="mt-auto h-48 flex items-center justify-center relative">
            {/* Stacked cards effect */}
            <div className="absolute w-full max-w-sm h-20 bg-gray-100 rounded-xl top-20 translate-y-4 scale-90 opacity-50"></div>
            <div className="absolute w-full max-w-sm h-20 bg-gray-100 rounded-xl top-18 translate-y-2 scale-95 opacity-75"></div>
            
            <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-xl p-4 shadow-lg flex items-start gap-3 z-10">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                Cal
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm">Meeting starts in 15 mins</h4>
                  <span className="text-[10px] text-gray-400">15 mins</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your next meeting is starting in 15 mins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
