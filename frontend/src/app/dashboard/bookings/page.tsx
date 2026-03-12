// src/app/dashboard/bookings/page.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Video,
  CalendarDays,
} from "lucide-react";

type FilterType = "upcoming" | "past" | "cancelled";

interface Booking {
  id: number;
  bookerName: string;
  bookerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  note: string | null;
  eventTitle: string;
  eventDuration: number;
  eventTypeId: number;
  eventSlug: string;
  meetLink: string | null;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
  { label: "Cancelled", value: "cancelled" },
];

const ROWS_OPTIONS = [5, 10, 20];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DAYS_S = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS_ = [
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function BookingsPage() {
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rsDate, setRsDate] = useState("");
  const [rsSlot, setRsSlot] = useState<string | null>(null);
  const [rsSlots, setRsSlots] = useState<{time: string, available: boolean}[]>([]);
  const [rsSlotsLoading, setRsSlotsLoading] = useState(false);
  const [rsMonth, setRsMonth] = useState(new Date().getMonth());
  const [rsYear, setRsYear] = useState(new Date().getFullYear());
  const [rsAvailableDays, setRsAvailableDays] = useState<Set<number> | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showRowsMenu, setShowRowsMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/bookings?filter=${filter}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setPage(1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openReschedule = (booking: Booking) => {
    setRescheduleId(booking.id);
    setRsDate(booking.date);
    setRsSlot(booking.startTime);
    const d = new Date(booking.date + "T00:00:00");
    setRsMonth(d.getMonth());
    setRsYear(d.getFullYear());
    setMenuOpen(null);
  };

  useEffect(() => {
    if (!rescheduleId) return;
    const b = bookings.find((x) => x.id === rescheduleId);
    if (!b || !user?.username) return;

    const monthStr = `${rsYear}-${String(rsMonth + 1).padStart(2, "0")}`;
    setRsAvailableDays(null);

    window
      .fetch(`${API_BASE}/api/public/${user.username}/${b.eventSlug}/available-days?month=${monthStr}`)
      .then((r) => r.json())
      .then((data) => setRsAvailableDays(new Set(data.availableDays || [])))
      .catch(() => setRsAvailableDays(new Set()));
  }, [rescheduleId, rsMonth, rsYear, bookings, user?.username]);

  useEffect(() => {
    if (!rescheduleId || !rsDate) return;
    const b = bookings.find((x) => x.id === rescheduleId);
    if (!b || !user?.username) return;

    setRsSlotsLoading(true);
    window
      .fetch(`${API_BASE}/api/public/${user.username}/${b.eventSlug}/slots?date=${rsDate}`)
      .then((r) => r.json())
      .then((data) => setRsSlots(data.slots || []))
      .catch(() => setRsSlots([]))
      .finally(() => setRsSlotsLoading(false));
  }, [rescheduleId, rsDate, bookings, user?.username]);

  const submitReschedule = async () => {
    if (!rescheduleId || !rsDate || !rsSlot) return;
    setRescheduling(true);
    try {
      const res = await apiFetch(`/api/bookings/${rescheduleId}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({ date: rsDate, startTime: rsSlot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reschedule");
      setRescheduleId(null);
      setToast("A meeting has been rescheduled and an email has been sent successfully.");
      fetchBookings();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reschedule";
      alert(message);
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/bookings/${cancelId}/cancel`, { method: "PATCH" });
      setCancelId(null);
      setToast("A meeting has been cancelled and an email has been sent successfully.");
      fetchBookings();
    } finally {
      setCancelling(false);
    }
  };

  const allRows = bookings;
  const totalRows = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pagedBookings = allRows.slice(start, end);
  const pagedGrouped = pagedBookings.reduce<Record<string, Booking[]>>((acc, b) => {
    if (!acc[b.date]) acc[b.date] = [];
    acc[b.date].push(b);
    return acc;
  }, {});

  return (
    <div className="min-h-full">
      <div className="px-5 sm:px-8 pt-8 pb-5 border-b border-[#1f1f1f]">
        <h1 className="text-xl font-semibold text-white">Bookings</h1>
        <p className="text-sm text-[#666] mt-0.5">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-5 sm:px-8 py-4 border-b border-[#1f1f1f]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? "bg-[#1f1f1f] text-white font-medium border border-[#333]"
                : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-8 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={20} className="animate-spin text-[#555]" />
          </div>
        ) : totalRows === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📅</span>
            </div>
            <p className="text-[#888] text-sm">No {filter} bookings found</p>
          </div>
        ) : (
          <div className="border border-[#2a2a2a] rounded-xl overflow-hidden">
            {Object.entries(pagedGrouped).map(([date, items], gi) => (
              <div key={date}>
                <div className="px-5 py-2.5 bg-[#0f0f0f] border-b border-[#1f1f1f]">
                  <span className="text-xs font-semibold text-[#555] uppercase tracking-widest">
                    {gi === 0 && filter === "upcoming" ? "NEXT" : formatDate(date)}
                  </span>
                </div>

                {items.map((booking, i) => (
                  <div
                    key={booking.id}
                    className={`flex flex-col sm:flex-row items-start justify-between px-5 py-5 hover:bg-[#161616] transition-colors gap-4 sm:gap-0 ${
                      i !== 0 || gi !== 0 ? "border-t border-[#1a1a1a]" : ""
                    }`}
                  >
                    <div className="w-full sm:w-40 shrink-0">
                      <p className="text-sm font-medium text-white">{formatDate(booking.date)}</p>
                      <p className="text-sm text-[#666] mt-0.5">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0 sm:px-4 w-full">
                      <p className="text-sm font-medium text-white break-words">
                        {booking.eventTitle} between <span className="font-semibold">{user?.name}</span> and{" "}
                        <span className="font-semibold">{booking.bookerName}</span>
                      </p>
                      {booking.note && <p className="text-sm text-[#888] mt-0.5">&quot;{booking.note}&quot;</p>}
                      <p className="text-sm text-[#666] mt-0.5">You and {booking.bookerName}</p>
                      <p className="text-xs text-[#555] mt-1">{booking.bookerEmail}</p>

                      {booking.meetLink && booking.status !== "cancelled" && filter !== "past" && (
                        <div className="mt-2">
                          <a
                            href={booking.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-md"
                          >
                            <Video size={12} /> Join Meeting
                          </a>
                        </div>
                      )}

                      {booking.status === "cancelled" && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                            Cancelled
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.status !== "cancelled" && (
                      <div className="relative shrink-0 w-full sm:w-auto mt-2 sm:mt-0" ref={menuOpen === booking.id ? menuRef : null}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === booking.id ? null : booking.id)}
                          className="w-full sm:w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors"
                        >
                          <MoreHorizontal size={14} className="hidden sm:block" />
                          <span className="sm:hidden text-xs">Manage</span>
                        </button>

                        {menuOpen === booking.id && (
                          <div className="absolute right-0 sm:right-0 top-10 sm:top-10 left-0 sm:left-auto z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl sm:w-44 py-1">
                            <button
                              onClick={() => openReschedule(booking)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors"
                            >
                              <CalendarDays size={13} />
                              Reschedule
                            </button>

                            <button
                              onClick={() => {
                                setCancelId(booking.id);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-[#252525] transition-colors"
                            >
                              <X size={13} />
                              Cancel booking
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-5 py-3.5 border-t border-[#1f1f1f] bg-[#0f0f0f]">
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowRowsMenu(!showRowsMenu)}
                  className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white hover:border-[#444] transition-colors"
                >
                  {rowsPerPage}
                  <ChevronDown size={12} />
                </button>
                {showRowsMenu && (
                  <div className="absolute bottom-10 left-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-24 py-1 z-50">
                    {ROWS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRowsPerPage(r);
                          setPage(1);
                          setShowRowsMenu(false);
                        }}
                        className={`w-full px-3.5 py-2 text-sm text-left transition-colors hover:bg-[#252525] ${
                          rowsPerPage === r ? "text-white" : "text-[#888]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-[#555] sm:ml-2 sm:mr-auto pl-2 hidden sm:block">rows per page</div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                <span className="text-sm text-[#666]">
                  {start + 1}–{Math.min(end, totalRows)} of {totalRows}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {rescheduleId && (() => {
        const booking = bookings.find((b) => b.id === rescheduleId);
        if (!booking) return null;

        const daysInMonth = new Date(rsYear, rsMonth + 1, 0).getDate();
        const firstDay = new Date(rsYear, rsMonth, 1).getDay();
        const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        while (cells.length % 7 !== 0) cells.push(null);

        const isPast = (day: number) => {
          const d = new Date(rsYear, rsMonth, day);
          d.setHours(0, 0, 0, 0);
          const t = new Date();
          t.setHours(0, 0, 0, 0);
          return d < t;
        };

        const dateToStr = (day: number) =>
          `${rsYear}-${String(rsMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRescheduleId(null)} />
            <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-3xl mx-4 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Reschedule booking</h3>
                <button
                  onClick={() => setRescheduleId(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-5 border-r border-[#1f1f1f]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm text-white font-medium">{MONTHS_[rsMonth]} {rsYear}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          rsMonth === 0 ? (setRsMonth(11), setRsYear((y) => y - 1)) : setRsMonth((m) => m - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#777] hover:text-white hover:border-[#444]"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={() =>
                          rsMonth === 11 ? (setRsMonth(0), setRsYear((y) => y + 1)) : setRsMonth((m) => m + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#777] hover:text-white hover:border-[#444]"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS_S.map((d) => (
                      <div key={d} className="text-center text-[10px] font-semibold text-[#666]">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, idx) => {
                      if (!day) return <div key={`e-${idx}`} />;
                      const past = isPast(day);
                      const unavail = rsAvailableDays !== null && !past && !rsAvailableDays.has(day);
                      const disabled = past || unavail;
                      const dStr = dateToStr(day);
                      const sel = rsDate === dStr;

                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => {
                            setRsDate(dStr);
                            setRsSlot(null);
                          }}
                          className={`h-9 rounded-md text-xs font-medium ${
                            sel
                              ? "bg-white text-black"
                              : disabled
                                ? "text-[#444] cursor-not-allowed"
                                : "text-white hover:bg-[#1f1f1f]"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-[#888] mb-3">Pick a new time</p>
                  {rsSlotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={18} className="animate-spin text-[#666]" />
                    </div>
                  ) : rsSlots.length === 0 ? (
                    <p className="text-sm text-[#666]">No slots available.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {rsSlots.map((slotObj) => (
                        <button
                          key={slotObj.time}
                          onClick={() => slotObj.available && setRsSlot(slotObj.time)}
                          disabled={!slotObj.available}
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                            rsSlot === slotObj.time
                              ? "border-white text-white"
                              : slotObj.available
                                ? "border-[#2a2a2a] text-[#bbb] hover:border-[#444] cursor-pointer"
                                : "border-[#1e1e1e] text-[#555] cursor-not-allowed bg-[#111]"
                          }`}
                        >
                          {formatTime(slotObj.time)}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      onClick={() => setRescheduleId(null)}
                      className="px-4 py-2 text-sm text-[#888] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitReschedule}
                      disabled={!rsDate || !rsSlot || rescheduling}
                      className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                    >
                      {rescheduling && <Loader2 size={13} className="animate-spin" />}
                      Confirm reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCancelId(null)} />
          <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">Cancel booking</h3>
            <p className="text-sm text-[#888] mb-5">
              Are you sure you want to cancel this booking? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCancelId(null)}
                className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelling && <Loader2 size={13} className="animate-spin" />}
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222] border border-[#333] text-white px-5 py-3 rounded-lg shadow-xl shadow-black/50 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-[#888] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
