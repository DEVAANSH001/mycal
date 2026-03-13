// src/app/[username]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Globe, Loader2, Video } from "lucide-react";

interface EventType {
  id:          number;
  title:       string;
  description: string | null;
  duration:    number;
  slug:        string;
}

interface HostUser {
  name:     string;
  username: string;
  timezone: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router       = useRouter();

  const [host, setHost]             = useState<HostUser | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/${username}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setHost(data.user);
        setEventTypes(data.eventTypes);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#555]" />
      </div>
    );
  }

  if (notFound || !host) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-2">404</p>
          <p className="text-[#666] text-sm">This page doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const initials = host.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#101010] flex flex-col items-center px-4 py-10 md:py-16">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 mb-8 md:mb-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl font-bold text-white">
          {initials}
        </div>
        <h1 className="text-2xl font-bold text-white">{host.name}</h1>
        <div className="flex items-center gap-1.5 text-sm text-[#666]">
          <Globe size={13} />
          <span>{host.timezone}</span>
        </div>
      </div>

      {/* Event type cards */}
      <div className="w-full max-w-[520px] space-y-3">
        {eventTypes.length === 0 && (
          <p className="text-center text-[#555] text-sm">No event types available.</p>
        )}
        {eventTypes.map((et) => (
          <button
            key={et.id}
            onClick={() => router.push(`/${host.username}/${et.slug}`)}
            className="w-full text-left bg-[#161616] border border-[#2a2a2a] rounded-xl px-5 py-4 hover:border-[#444] hover:bg-[#1c1c1c] transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm group-hover:text-white truncate">
                  {et.title}
                </p>
                {et.description && (
                  <p className="text-[#666] text-xs mt-1 line-clamp-2">{et.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2.5 text-xs text-[#555]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {et.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={11} />
                    Cal Video
                  </span>
                </div>
              </div>
              <span className="text-[#444] group-hover:text-[#888] text-lg leading-none mt-0.5">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
