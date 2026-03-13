import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-between px-6 py-3 w-full max-w-5xl">
        <div className="flex items-center gap-8">
          <Link href="/login" className="font-bold text-xl tracking-tight text-gray-900">
            Cal.com
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/login" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              Solutions <ChevronDown className="w-3 h-3" />
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Enterprise
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Cal.ai
            </Link>
            <Link href="/login" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              Developer <ChevronDown className="w-3 h-3" />
            </Link>
            <Link href="/login" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              Resources <ChevronDown className="w-3 h-3" />
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <Link
            href="/login"
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-colors"
          >
            Go to app <span className="text-gray-400">›</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
