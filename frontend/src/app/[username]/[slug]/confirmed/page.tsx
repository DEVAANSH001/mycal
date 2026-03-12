// src/app/[username]/[slug]/confirmed/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useParams }       from "next/navigation";
import { Check, Clock, Calendar, Mail } from "lucide-react";
import Link from "next/link";

export default function ConfirmedPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const params             = useSearchParams();

  const name     = params.get("name")     || "Guest";
  const date     = params.get("date")     || "";
  const time     = params.get("time")     || "";
  const event    = params.get("event")    || "Meeting";
  const duration = params.get("duration") || "30";
  const meetLink = params.get("meet") || "";

  const formatDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", {
      weekday: "long",
      month:   "long",
      day:     "numeric",
      year:    "numeric",
    });
  };

  const formatTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm   = h >= 12 ? "PM" : "AM";
    const hour   = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl text-center">

        {/* Check icon */}
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
          <Check size={24} className="text-green-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-1">
          You are scheduled!
        </h1>
        <p className="text-sm text-[#666] mb-7">
          A confirmation email has been sent to you.
        </p>

        {/* Booking details card */}
        <div className="bg-[#161616] border border-[#222] rounded-xl p-5 text-left space-y-3.5 mb-6">
          <div className="flex items-start gap-3">
            <Calendar size={15} className="text-[#555] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#555] mb-0.5">Date & Time</p>
              <p className="text-sm text-white font-medium">{formatDate(date)}</p>
              <p className="text-sm text-[#888]">{formatTime(time)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={15} className="text-[#555] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#555] mb-0.5">Event</p>
              <p className="text-sm text-white font-medium">{event}</p>
              <p className="text-sm text-[#888]">{duration} minutes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={15} className="text-[#555] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#555] mb-0.5">Attendee</p>
              <p className="text-sm text-white font-medium">{name}</p>
            </div>
          </div>

          {meetLink && (
            <div className="pt-2">
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                Join Jitsi Meeting
              </a>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link
          href={`/${username}/${slug}`}
          className="text-sm text-[#666] hover:text-white transition-colors underline underline-offset-2"
        >
          Book another meeting
        </Link>
      </div>

      <p className="text-sm font-semibold text-white mt-6 opacity-40">Cal Clone</p>
    </div>
  );
}