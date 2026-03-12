// src/app/dashboard/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Plus,
  Search,
  Clock,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";

interface EventType {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
  isActive: boolean;
  userId: number;
  bufferTime?: number;
  customQuestions?: string[];
}

interface FormState {
  title: string;
  description: string;
  duration: string;
  slug: string;
  customQuestions: string[];
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  duration: "30",
  slug: "",
  customQuestions: [],
};

export default function EventTypesPage() {
  const { user } = useAuth();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EventType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchEventTypes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/event-types");
      const data = await res.json();
      setEventTypes(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const slugify = (v: string) =>
    v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (et: EventType) => {
    setEditTarget(et);
    setForm({
      title: et.title,
      description: et.description || "",
      duration: String(et.duration),
      slug: et.slug,
      customQuestions: et.customQuestions ?? [],
    });
    setMenuOpen(null);
    setShowModal(true);
  };

  const handleTitleChange = (v: string) => {
    setForm((f) => ({
      ...f,
      title: v,
      ...(editTarget ? {} : { slug: slugify(v) }),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.duration) return;
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        duration: parseInt(form.duration, 10),
        slug: form.slug,
        customQuestions: form.customQuestions.filter((q) => q.trim()),
      };

      const res = editTarget
        ? await apiFetch(`/api/event-types/${editTarget.id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiFetch("/api/event-types", {
            method: "POST",
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Something went wrong");
        return;
      }

      setShowModal(false);
      fetchEventTypes();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (et: EventType) => {
    setEventTypes((prev) =>
      prev.map((e) => (e.id === et.id ? { ...e, isActive: !e.isActive } : e))
    );
    await apiFetch(`/api/event-types/${et.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...et, isActive: !et.isActive }),
    });
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/event-types/${id}`, { method: "DELETE" });
    setDeleteId(null);
    setMenuOpen(null);
    fetchEventTypes();
  };

  const copyLink = (et: EventType) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/${user?.username}/${et.slug}`
    );
    setCopied(et.id);
    setTimeout(() => setCopied(null), 2000);
    setMenuOpen(null);
  };

  const filtered = eventTypes.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // Added pb-24 to account for mobile bottom navigation and floating actions
    <div className="min-h-full pb-32 sm:pb-0 bg-black sm:bg-transparent">
      
      {/* ── HEADER (Responsive) ── */}
      <div className="flex items-start justify-between px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-xl font-semibold text-white">Event types</h1>
          <p className="text-sm text-[#666] mt-0.5 hidden sm:block">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        {/* Top actions hidden on mobile (< 640px) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#444] w-44 transition-colors"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-white text-black px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <Plus size={15} /> New
          </button>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="px-4 sm:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-[#555]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
              <CalendarIcon size={20} className="text-[#555]" />
            </div>
            <p className="text-[#888] text-sm">No event types yet</p>
            <button onClick={openCreate} className="mt-3 text-sm text-white underline underline-offset-2">
              Create your first event type
            </button>
          </div>
        ) : (
          <div className="border-y sm:border border-[#1f1f1f] sm:border-[#2a2a2a] sm:rounded-xl overflow-hidden -mx-4 sm:mx-0">
            {filtered.map((et, i) => (
              <div
                key={et.id}
                className={`flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-[#161616] transition-colors group ${
                  i !== 0 ? "border-t border-[#1f1f1f]" : ""
                }`}
              >
                {/* Left side details */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] sm:text-sm font-medium text-white truncate">
                      {et.title}
                    </span>
                    {/* Slug hidden on mobile */}
                    <span className="hidden sm:inline text-sm text-[#555] truncate">
                      /{user?.username}/{et.slug}
                    </span>
                    {!et.isActive && (
                      <span className="text-xs text-[#555] bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-0.5 rounded-full whitespace-nowrap">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 sm:mt-1.5">
                    <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-xs px-2.5 py-0.5 rounded-full">
                      <Clock size={11} />
                      {et.duration}m
                    </div>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  {/* Desktop Actions (Hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(et)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        et.isActive ? "bg-white" : "bg-[#333]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ease-in-out ${
                          et.isActive ? "left-[18px] bg-black" : "left-0.5 bg-[#888]"
                        }`}
                      />
                    </button>

                    <a
                      href={`/${user?.username}/${et.slug}`} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <button
                      onClick={() => copyLink(et)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors"
                    >
                      {copied === et.id ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
                    </button>
                  </div>

                  {/* Always show the 'More' menu */}
                  <div className="relative" ref={menuOpen === et.id ? menuRef : null}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === et.id ? null : et.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg sm:border sm:border-[#2a2a2a] text-[#888] sm:text-[#666] hover:text-white hover:bg-[#222] sm:hover:border-[#444] transition-colors"
                    >
                      <MoreHorizontal size={18} className="sm:w-[14px] sm:h-[14px]" />
                    </button>

                    {menuOpen === et.id && (
                      <div className="absolute right-0 top-10 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-40 py-1 overflow-hidden">
                        <button onClick={() => openEdit(et)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => copyLink(et)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors">
                          <Link2 size={13} /> Copy link
                        </button>
                        <div className="border-t border-[#2a2a2a] my-1" />
                        <button onClick={() => { setDeleteId(et.id); setMenuOpen(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-[#252525] transition-colors">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE FLOATING ACTIONS (Hidden on desktop) ── */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 p-4 flex gap-3 items-center z-30">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-full pl-10 pr-4 py-3 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#444]"
          />
        </div>
        <button onClick={openCreate} className="w-[46px] h-[46px] rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <Plus size={22} />
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION (Hidden on desktop) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111] border-t border-[#1f1f1f] flex items-center justify-around px-2 z-40">
        <button className="flex flex-col items-center gap-1.5 text-white">
          <Link2 size={20} />
          <span className="text-[10px] font-medium">Event types</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-[#666] hover:text-[#aaa]">
          <CalendarIcon size={20} />
          <span className="text-[10px] font-medium">Bookings</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-[#666] hover:text-[#aaa]">
          <Clock size={20} />
          <span className="text-[10px] font-medium">Availability</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-[#666] hover:text-[#aaa]">
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* ── MODALS (Edit & Delete remain unchanged) ── */}
      {/* ... [Keep your existing showModal and deleteId modal code here] ... */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
              <h2 className="text-base font-semibold text-white">{editTarget ? "Edit event type" : "Add new event type"}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors">
                <X size={15} />
              </button>
            </div>
            {/* Modal Form Content */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Title *</label>
                <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. 30 Min Meeting" className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="A short description of your event" rows={3} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Duration (mins) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} min={5} step={5} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#555] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">URL Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="my-meeting" className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors" />
                </div>
              </div>
              {form.slug && (
                <p className="text-xs text-[#555] bg-[#161616] border border-[#222] rounded-lg px-3 py-2">
                  🔗 {window?.location?.origin}/{user?.username}/<span className="text-[#888]">{form.slug}</span>
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#1f1f1f]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.slug} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 size={13} className="animate-spin" />}
                {editTarget ? "Save changes" : "Create event type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">Delete event type</h3>
            <p className="text-sm text-[#888] mb-5">Are you sure? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}