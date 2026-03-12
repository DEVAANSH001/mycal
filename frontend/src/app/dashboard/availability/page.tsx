// src/app/dashboard/availability/page.tsx
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2, Check } from "lucide-react";

const DAYS = [
  { label: "Sunday", value: 7 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
];

// Generate time options in 30min increments
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  dayOfWeek: number;
  enabled: boolean;
  slots: TimeSlot[];
}

interface DateOverride {
  id: number;
  date: string;
  isBlocked: boolean;
  startTime: string | null;
  endTime: string | null;
}

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      enabled: d.value >= 1 && d.value <= 5, // Mon–Fri default
      slots: [{ startTime: "09:00", endTime: "17:00" }],
    }))
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [bufferTime, setBufferTime] = useState(0);
  const [initialBufferTime, setInitialBufferTime] = useState(0);

  const [initialSchedule, setInitialSchedule] = useState<DaySchedule[]>([]);
  const [initialTimezone, setInitialTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [ovDate, setOvDate] = useState("");
  const [ovBlocked, setOvBlocked] = useState(true);
  const [ovStart, setOvStart] = useState("09:00");
  const [ovEnd, setOvEnd] = useState("17:00");
  const [ovSaving, setOvSaving] = useState(false);
  const [bufferSaving, setBufferSaving] = useState(false);
  const [bufferSaved, setBufferSaved] = useState(false);

  /* ── fetch existing availability ─────────────────── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiFetch("/api/availability");
        const data = await res.json();

        const ovRes = await apiFetch("/api/availability/overrides");
        const ovData = await ovRes.json();
        setOverrides(Array.isArray(ovData) ? ovData : []);

        // Fetch global buffer time
        const bufRes = await apiFetch("/api/availability/buffer-time");
        const bufData = await bufRes.json();
        const bt = bufData.bufferTime ?? 0;
        setBufferTime(bt);
        setInitialBufferTime(bt);

        if (Array.isArray(data) && data.length > 0) {
          // merge fetched data into schedule
          const newSchedule = schedule.map((slot) => {
            const foundSlots = data.filter((d: any) => d.dayOfWeek === slot.dayOfWeek);

            if (foundSlots.length > 0) {
              // Sort slots by start time
              foundSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
              return {
                ...slot,
                enabled: true,
                slots: foundSlots.map((f: any) => ({ startTime: f.startTime, endTime: f.endTime }))
              };
            }
            return { ...slot, enabled: false, slots: [{ startTime: "09:00", endTime: "17:00" }] };
          });

          setSchedule(newSchedule);
          setInitialSchedule(JSON.parse(JSON.stringify(newSchedule)));

          const tz = data[0].timezone || "Asia/Kolkata";
          setTimezone(tz);
          setInitialTimezone(tz);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  /* ── handlers ────────────────────────────────────── */
  const toggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const updateTime = (
    dayOfWeek: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== dayOfWeek) return s;
        const newSlots = [...s.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
        return { ...s, slots: newSlots };
      })
    );
  };

  const addSlot = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== dayOfWeek) return s;
        return {
          ...s,
          slots: [...s.slots, { startTime: "09:00", endTime: "17:00" }],
        };
      })
    );
  };

  const removeSlot = (dayOfWeek: number, slotIndex: number) => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== dayOfWeek) return s;
        return {
          ...s,
          slots: s.slots.filter((_, i) => i !== slotIndex),
        };
      })
    );
  };

  const hasChanges =
    JSON.stringify(schedule) !== JSON.stringify(initialSchedule) ||
    timezone !== initialTimezone ||
    bufferTime !== initialBufferTime;

  /* ── save ─────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const enabledSlots = schedule
        .filter((s) => s.enabled)
        .flatMap((s) =>
          s.slots.map((slot) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );

      const res = await apiFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ availability: enabledSlots, timezone }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaved(true);
      setInitialSchedule(JSON.parse(JSON.stringify(schedule)));
      setInitialTimezone(timezone);
      setInitialBufferTime(bufferTime);

      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleBufferSave = async () => {
    setBufferSaving(true);
    try {
      const res = await apiFetch("/api/availability/buffer-time", {
        method: "POST",
        body: JSON.stringify({ bufferTime }),
      });
      if (!res.ok) throw new Error("Failed");
      setInitialBufferTime(bufferTime);
      setBufferSaved(true);
      setTimeout(() => setBufferSaved(false), 2500);
    } catch { /* silent */ }
    finally { setBufferSaving(false); }
  };

  const addOverride = async () => {
    if (!ovDate) return;
    setOvSaving(true);
    try {
      const res = await apiFetch("/api/availability/overrides", {
        method: "POST",
        body: JSON.stringify({
          date: ovDate,
          isBlocked: ovBlocked,
          startTime: ovBlocked ? null : ovStart,
          endTime: ovBlocked ? null : ovEnd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setOverrides((prev) => {
        const filtered = prev.filter((o) => o.date !== data.date);
        return [...filtered, data].sort((a, b) => a.date.localeCompare(b.date));
      });
      setOvDate("");
    } catch {
      alert("Failed to save override");
    } finally {
      setOvSaving(false);
    }
  };

  const removeOverride = async (id: number) => {
    await apiFetch(`/api/availability/overrides/${id}`, { method: "DELETE" });
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 size={20} className="animate-spin text-[#555]" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Top Navigation & Header */}
      <div className="px-5 sm:px-8 pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              Working hours
            </h1>

          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:bg-[#222] disabled:text-[#666]"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : saved ? (
              <Check size={13} className="text-green-600" />
            ) : null}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-4 sm:flex gap-8 max-w-6xl mx-auto">

        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Weekly schedule */}
          <div className="bg-transparent border border-[#2a2a2a] rounded-xl overflow-hidden p-2 sm:p-5">
            {DAYS.map((day, i) => {
              const slot = schedule.find((s) => s.dayOfWeek === day.value)!;
              return (
                <div
                  key={day.value}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-[#1a1a1a]" : ""
                    } ${slot.enabled ? "" : "opacity-50"}`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDay(day.value)}
                      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${slot.enabled ? "bg-white" : "bg-[#333]"
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${slot.enabled
                            ? "left-[18px] bg-black"
                            : "left-0.5 bg-[#888]"
                          }`}
                      />
                    </button>

                    {/* Day label */}
                    <span className="text-sm text-white w-24 flex-shrink-0 font-medium">
                      {day.label}
                    </span>
                  </div>

                  {slot.enabled ? (
                    <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto">
                      {slot.slots.map((timeSlot, slotIndex) => (
                        <div key={slotIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <select
                              value={timeSlot.startTime}
                              onChange={(e) =>
                                updateTime(day.value, slotIndex, "startTime", e.target.value)
                              }
                              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#555] transition-colors appearance-none cursor-pointer flex-1 sm:flex-none"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {formatTime(t)}
                                </option>
                              ))}
                            </select>

                            <span className="text-[#555] text-sm">—</span>

                            <select
                              value={timeSlot.endTime}
                              onChange={(e) =>
                                updateTime(day.value, slotIndex, "endTime", e.target.value)
                              }
                              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#555] transition-colors appearance-none cursor-pointer flex-1 sm:flex-none"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {formatTime(t)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            {slotIndex === 0 ? (
                              <button
                                onClick={() => addSlot(day.value)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                                title="Add timeslot"
                              >
                                <span className="text-xl leading-none">+</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => removeSlot(day.value, slotIndex)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Remove timeslot"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-[#555] flex-1 mt-2 sm:mt-0 ml-[52px] sm:ml-0">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-transparent border border-[#2a2a2a] rounded-xl p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-2">
                Date overrides
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </p>
              <p className="text-xs text-[#666] mt-0.5">Block specific dates or set custom hours</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="date"
                value={ovDate}
                onChange={(e) => setOvDate(e.target.value)}
                className="md:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
              />
              <select
                value={ovBlocked ? "blocked" : "hours"}
                onChange={(e) => setOvBlocked(e.target.value === "blocked")}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="blocked">Blocked</option>
                <option value="hours">Custom hours</option>
              </select>
              <button
                onClick={addOverride}
                disabled={ovSaving || !ovDate}
                className="bg-white text-black rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {ovSaving ? "Saving..." : "Add override"}
              </button>
            </div>

            {!ovBlocked && (
              <div className="grid grid-cols-2 gap-2">
                <select value={ovStart} onChange={(e) => setOvStart(e.target.value)} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
                <select value={ovEnd} onChange={(e) => setOvEnd(e.target.value)} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              {overrides.length === 0 ? (
                <p className="text-xs text-[#666]">No overrides yet</p>
              ) : (
                overrides
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((o) => (
                    <div key={o.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#161616] border border-[#222] rounded-lg px-3 py-2 gap-2 sm:gap-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-white font-medium">{o.date}</span>
                        <span className="text-[#666] text-xs">·</span>
                        <span className="text-sm text-[#888]">{o.isBlocked ? "Blocked" : `${o.startTime} – ${o.endTime}`}</span>
                      </div>
                      <button onClick={() => removeOverride(o.id)} className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 px-2.5 py-1 rounded w-full sm:w-auto text-center">Remove</button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full sm:w-[320px] shrink-0 mt-8 sm:mt-0 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timezone
            </label>
            <div className="relative border border-[#2a2a2a] rounded-lg">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-transparent p-2.5 pr-10 text-sm text-white focus:outline-none appearance-none cursor-pointer"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-[#111]">{tz}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#888]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          {/* Buffer time */}
          <div className="border border-[#2a2a2a] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-white">Buffer time</p>
              <p className="text-xs text-[#666] mt-0.5">Add padding before and after each meeting</p>
            </div>
            <div className="relative border border-[#2a2a2a] rounded-lg">
              <select
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                className="w-full bg-transparent p-2.5 pr-10 text-sm text-white focus:outline-none appearance-none cursor-pointer"
              >
                <option value={0} className="bg-[#111]">No buffer</option>
                <option value={5} className="bg-[#111]">5 minutes</option>
                <option value={10} className="bg-[#111]">10 minutes</option>
                <option value={15} className="bg-[#111]">15 minutes</option>
                <option value={30} className="bg-[#111]">30 minutes</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#888]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <button
              onClick={handleBufferSave}
              disabled={bufferSaving || bufferTime === initialBufferTime}
              className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              {bufferSaving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : bufferSaved ? (
                <Check size={13} className="text-green-600" />
              ) : null}
              {bufferSaved ? "Saved!" : "Apply to all events"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}