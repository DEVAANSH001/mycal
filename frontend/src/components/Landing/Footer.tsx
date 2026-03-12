import { ChevronDown, Star } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Solutions: [
      "iOS/Android App",
      "Self-hosted",
      "Pricing",
      "Docs",
      "Cal.ai - AI Phone Agent",
      "Enterprise",
      "Integrate Cal.com",
      "Routing",
      "Cal.com Atoms",
      "Desktop App",
      "FAQ",
      "Enterprise API",
      "Github",
      "Docker",
    ],
    "Use Cases": [
      "Sales",
      "Marketing",
      "Talent Acquisition",
      "Customer Support",
      "Higher Education",
      "Telehealth",
      "Professional Services",
      "Hiring Marketplace",
      "Human Resources",
      "Tutoring",
      "C-suite",
      "Law",
    ],
    Resources: [
      "Affiliate Program",
      "Help Docs",
      "Blog",
      "Teams",
      "Embed",
      "Recurring events",
      "Developers",
      "OOO",
      "Workflows",
      "Instant Meetings",
      "App Store",
      "Requires confirmation",
      "Payments",
      "Video Conferencing",
    ],
    Company: [
      "Jobs",
      "About",
      "Open Startup",
      "Support",
      "Privacy",
      "Terms",
      "License",
      "Security",
      "Changelog",
      "Get a demo",
      "Talk to sales",
    ],
  };

  return (
    <footer className="bg-gray-100 pt-24 pb-12 px-4 md:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div>
            <Link href="/" className="font-bold text-2xl tracking-tight text-gray-900">
              Cal.com
            </Link>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-xs">
              Cal.com® and Cal® are a registered trademark by Cal.com, Inc. All
              rights reserved.
            </p>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[8px] font-bold text-center leading-tight">ISO<br/>27001</div>
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[8px] font-bold text-center leading-tight">SOC<br/>2</div>
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[8px] font-bold text-center leading-tight">CCPA</div>
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[8px] font-bold text-center leading-tight">GDPR</div>
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[8px] font-bold text-center leading-tight">HIPAA</div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
            Our mission is to connect a billion people by 2031 through calendar
            scheduling.
          </p>

          <div className="flex gap-4">
            <button className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50">
              English <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <button className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50">
              All Systems Operational <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </button>
          </div>

          {/* Downloads */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Downloads</h4>
            <div className="flex flex-wrap gap-2">
              {['iPhone', 'Android', 'Chrome', 'Safari', 'Edge', 'Firefox', 'MacOS', 'Windows', 'Linux'].map((os) => (
                <div key={os} className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-sm"></div> {os}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="flex gap-4">
            <div className="bg-orange-500 text-white p-3 rounded-lg flex items-center gap-3 w-40">
              <div className="flex flex-col">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-white" />)}
                </div>
                <span className="text-[10px] font-medium mt-1">Read our reviews on</span>
              </div>
              <div className="font-bold text-xl ml-auto">G</div>
            </div>
            <div className="bg-[#00B67A] text-white p-3 rounded-lg flex items-center gap-3 w-40">
              <div className="flex flex-col">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-white" />)}
                </div>
                <span className="text-[10px] font-medium mt-1">Read our reviews on</span>
              </div>
              <div className="font-bold text-xl ml-auto">★</div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Need Help? <Link href="#" className="text-blue-600 hover:underline">support@cal.com</Link> or visit <Link href="#" className="text-blue-600 hover:underline">cal.com/help</Link>.
          </p>
        </div>

        {/* Right Columns */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="font-bold text-gray-900">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
