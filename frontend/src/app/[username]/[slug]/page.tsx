"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  Calendar as CalendarIcon,
  UserPlus,
} from "lucide-react";

interface EventType {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
  customQuestions?: string[];
}

interface HostUser {
  name: string;
  username: string;
  timezone: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getEndTime(startTime: string, durationMinutes: number) {
  const [h, m] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatTime12(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function PublicBookingPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const router = useRouter();

  const [host, setHost] = useState<HostUser | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [slots, setSlots] = useState<{time: string, available: boolean}[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("12");
  const [availableDays, setAvailableDays] = useState<Set<number> | null>(null);
  const [hostTimezone, setHostTimezone] = useState<string>("UTC");
  const [visitorTimezone, setVisitorTimezone] = useState<string>(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
  );
  const [showTzPicker, setShowTzPicker] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await window.fetch(`${API_URL}/api/public/${username}/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setHost(data.user);
        setEventType(data.eventType);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [username, slug]);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await window.fetch(
          `${API_URL}/api/public/${username}/${slug}/slots?date=${selectedDate}&tz=${encodeURIComponent(visitorTimezone)}`
        );
        const data = await res.json();
        setSlots(data.slots || []);
        if (data.hostTimezone) setHostTimezone(data.hostTimezone);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, username, slug, visitorTimezone]);

  useEffect(() => {
    if (!eventType) return;
    setAvailableDays(null);
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    window
      .fetch(`${API_URL}/api/public/${username}/${slug}/available-days?month=${monthStr}`)
      .then((r) => r.json())
      .then((data) => setAvailableDays(new Set(data.availableDays || [])))
      .catch(() => setAvailableDays(new Set()));
  }, [currentMonth, currentYear, username, slug, eventType]);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const toDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isSelected = (day: number) => toDateStr(day) === selectedDate;

  const handleDayClick = (day: number) => {
    if (isPast(day) || (availableDays !== null && !availableDays.has(day))) return;
    setSelectedDate(toDateStr(day));
    setSelectedSlot(null);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const calendarCells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setBooking(true);
    setBookingError("");

    try {
      const res = await window.fetch(`${API_URL}/api/public/${username}/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookerName: name,
          bookerEmail: email,
          date: selectedDate,
          startTime: selectedSlot,
          note: note || undefined,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      router.push(
        `/${username}/${slug}/confirmed?name=${encodeURIComponent(name)}&date=${selectedDate}&time=${selectedSlot}&event=${encodeURIComponent(eventType?.title || "")}&duration=${eventType?.duration}&meet=${encodeURIComponent(data?.meetLink || "")}`
      );
    } catch (error: unknown) {
      setBookingError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white" />
      </div>
    );
  }

  if (notFound || !host || !eventType) {
    return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">Page not found</div>;
  }

  const initials = host.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const formatFn = (t: string) => {
    if (!t) return "";
    // Convert host-timezone time string to visitor's timezone
    try {
      // construct a fake date in host tz for today's date context
      const refDate = selectedDate || new Date().toISOString().slice(0, 10);
      const hostDt = new Date(`${refDate}T${t}:00`);
      const converted = hostDt.toLocaleTimeString("en-US", {
        timeZone: visitorTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: timeFormat === "12",
      });
      return converted;
    } catch {
      return timeFormat === "12" ? formatTime12(t) : t;
    }
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;
  const fullFormattedDate = selectedDateObj
    ? selectedDateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const shortFormattedDay = selectedDateObj
    ? `${DAYS_SHORT[selectedDateObj.getDay()][0] + DAYS_SHORT[selectedDateObj.getDay()].slice(1).toLowerCase()} ${selectedDateObj.getDate()}`
    : "";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-10">
      <div className="bg-[#111111] border border-[#262626] rounded-xl flex overflow-hidden shadow-2xl max-w-max mx-auto">
        <div className="w-[280px] border-r border-[#262626] p-6 flex flex-col">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white mb-4">
            {initials}
          </div>
          <p className="text-[#a1a1a1] font-medium text-sm">{host.name}</p>
          <h1 className="text-[28px] font-bold text-white leading-tight mt-1 mb-6">{eventType.title}</h1>

          <div className="space-y-4 text-sm font-medium text-[#a1a1a1]">
            {selectedSlot && selectedDateObj ? (
              <div className="flex items-start gap-3 text-white">
                <CalendarIcon size={18} className="text-[#a1a1a1]" />
                <div>
                  <div>{fullFormattedDate}</div>
                  <div className="text-[#a1a1a1] mt-0.5">
                    {formatFn(selectedSlot)} – {formatFn(getEndTime(selectedSlot, eventType.duration))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Clock size={18} />
              {eventType.duration}m
            </div>
            <div className="flex items-center gap-3">
              <Video size={18} />
              Cal Video
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Globe size={18} />
                <span className="text-white">{visitorTimezone}</span>
              </div>
              <button
                onClick={() => setShowTzPicker((v) => !v)}
                className="ml-7 text-xs text-[#666] hover:text-[#aaa] underline underline-offset-2 text-left"
              >
                Change timezone
              </button>
              {showTzPicker && (
                <select
                  value={visitorTimezone}
                  onChange={(e) => { setVisitorTimezone(e.target.value); setShowTzPicker(false); }}
                  className="ml-7 mt-1 bg-[#1a1a1a] border border-[#333] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  {[
                    "UTC",
                    "Asia/Kolkata",
                    "Asia/Dubai",
                    "Asia/Singapore",
                    "Asia/Tokyo",
                    "Europe/London",
                    "Europe/Paris",
                    "Europe/Berlin",
                    "America/New_York",
                    "America/Chicago",
                    "America/Denver",
                    "America/Los_Angeles",
                    "Australia/Sydney",
                  ].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {!selectedSlot ? (
          <>
            <div className="p-6 w-[360px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">
                  {MONTHS[currentMonth]} <span className="text-[#666] font-normal">{currentYear}</span>
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="text-[#888] hover:bg-[#222] p-1 rounded-md transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextMonth} className="text-[#888] hover:bg-[#222] p-1 rounded-md transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-2 mb-2">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center text-[11px] font-bold text-[#888]">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                {calendarCells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const past = isPast(day);
                  const isToday =
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();
                  const unavail = availableDays !== null && !past && !availableDays.has(day);
                  const disabled = past || unavail;
                  const sel = isSelected(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      disabled={disabled}
                      className={`relative h-10 w-full rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
                        sel
                          ? "bg-white text-black"
                          : disabled
                            ? "text-[#444] cursor-not-allowed"
                            : isToday
                              ? "text-white hover:bg-[#222]"
                              : "text-[#eaeaea] hover:bg-[#222] bg-[#1a1a1a]"
                      }`}
                    >
                      {day}
                      {isToday && !sel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#888]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="w-[280px] border-l border-[#262626] p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">{shortFormattedDay}</span>
                  <div className="flex bg-transparent border border-[#333] rounded-md p-0.5">
                    <button
                      onClick={() => setTimeFormat("12")}
                      className={`px-2 py-1 text-xs rounded-sm font-medium ${
                        timeFormat === "12" ? "bg-[#333] text-white" : "text-[#888]"
                      }`}
                    >
                      12h
                    </button>
                    <button
                      onClick={() => setTimeFormat("24")}
                      className={`px-2 py-1 text-xs rounded-sm font-medium ${
                        timeFormat === "24" ? "bg-[#333] text-white" : "text-[#888]"
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {!selectedDate || selectedSlot ? null : slotsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={18} className="animate-spin text-[#888]" />
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-[#888] text-sm text-center">No slots available.</p>
                  ) : (
                    slots.map((slotObj) => (
                      <button
                        key={slotObj.time}
                        onClick={() => slotObj.available && setSelectedSlot(slotObj.time)}
                        disabled={!slotObj.available}
                        className={`w-full py-3 px-4 rounded-md border text-center text-sm font-medium transition-colors ${
                          slotObj.available 
                            ? "border-[#333] text-white hover:border-white cursor-pointer" 
                            : "border-[#1e1e1e] text-[#555] cursor-not-allowed bg-[#111]"
                        }`}
                      >
                        {formatFn(slotObj.time)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-[480px] p-8 flex flex-col">
              <form onSubmit={handleBook} className="space-y-5">
                {bookingError && <div className="text-red-400 text-sm">{bookingError}</div>}

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">Your name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Player"
                    className="w-full bg-transparent border border-[#333] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#666]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">Email address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maxplayer2211@gmail.com"
                    className="w-full bg-transparent border border-[#333] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#666]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">Additional notes</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Please share anything that will help prepare for our meeting."
                    rows={3}
                    className="w-full bg-transparent border border-[#333] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#666] resize-none"
                  />
                </div>

                {(eventType.customQuestions || []).map((question, idx) => (
                  <div key={`${question}-${idx}`}>
                    <label className="block text-[13px] font-medium text-white mb-2">{question}</label>
                    <input
                      value={answers[question] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question]: e.target.value,
                        }))
                      }
                      placeholder="Your answer"
                      className="w-full bg-transparent border border-[#333] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#666]"
                    />
                  </div>
                ))}

               

               
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="px-5 py-2.5 text-sm font-medium text-white hover:bg-[#222] rounded-md transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={booking}
                    className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    {booking && <Loader2 size={14} className="animate-spin" />}
                    Confirm
                  </button>
                </div>
              </form>
          </div>
        )}
      </div>

      <div className="mt-8 text-white font-bold text-xl tracking-tight">Cal Clone</div>
    </div>
  );
}
