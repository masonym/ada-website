"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock,
  GripVertical,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { EVENTS } from "@/constants/events";

type Speaker = {
  _id: string;
  name: string;
  sortName?: string;
  slug: { current: string };
  position?: string;
  company?: string;
  image?: { asset: { _ref: string } };
};

type ScheduleSpeaker = {
  _key?: string;
  speakerId?: string;
  name?: string;
  title?: string;
  affiliation?: string;
  photo?: string;
  presentation?: string;
  videoId?: string;
  videoStartTime?: number;
  sponsor?: string;
  sponsorStyle?: string;
};

type ScheduleItem = {
  _key?: string;
  time: string;
  title: string;
  location?: string;
  duration?: string;
  description?: string;
  sponsorLogo?: string;
  speakers?: ScheduleSpeaker[];
};

type ScheduleDay = {
  _key?: string;
  date: string;
  items: ScheduleItem[];
};

type EventSchedule = {
  _id: string;
  eventId: number;
  eventSlug: string;
  days: ScheduleDay[];
};

const SELECTED_EVENT_STORAGE_KEY = "adminSchedulesSelectedEventId";

function getSanityImageUrl(ref: string, size = 64) {
  return `https://cdn.sanity.io/images/nc4xlou0/production/${ref
    .replace("image-", "")
    .replace(/-(\w+)$/, ".$1")}?w=${size}&h=${size}&fit=crop`;
}

const emptyItem = (): ScheduleItem => ({
  _key: `item-${Date.now()}-${Math.random()}`,
  time: "",
  title: "",
  location: "",
  duration: "",
  description: "",
  sponsorLogo: "",
  speakers: [],
});

const emptySpeaker = (): ScheduleSpeaker => ({
  _key: `speaker-${Date.now()}-${Math.random()}`,
  speakerId: "",
  name: "",
  title: "",
  affiliation: "",
  photo: "",
  presentation: "",
  videoId: "",
  videoStartTime: undefined,
  sponsor: "",
  sponsorStyle: "",
});

const BADGE_PRESETS = [
  { label: "Conference Moderator", text: "Conference Moderator", style: "bg-red-999" },
  { label: "Panel Moderator", text: "Panel Moderator", style: "bg-sky-300 text-slate-900" },
  { label: "Moderator", text: "Moderator", style: "bg-sky-300 text-slate-900" },
  { label: "Keynote Speaker", text: "Keynote Speaker", style: "bg-sky-300 text-slate-900" },
  { label: "Platinum Sponsor", text: "Platinum Sponsor", style: "bg-sky-300 text-slate-900" },
  { label: "Gold Sponsor", text: "Gold Sponsor", style: "bg-[#ffaf00] text-slate-900" },
  { label: "Silver Sponsor", text: "Silver Sponsor", style: "bg-[#C0C0C0] text-slate-900" },
  { label: "Bronze Sponsor", text: "Bronze Sponsor", style: "bg-[#CD7F32] text-slate-900" },
  { label: "Small Business Sponsor", text: "Small Business Sponsor", style: "bg-sb-100 text-slate-900" },
  { label: "Pre-Recorded Address", text: "Pre-Recorded Address", style: "bg-gray-300 text-slate-900" },
];

// ─── Speaker row inside a session ────────────────────────────────────────────

function SpeakerRow({
  speaker,
  speakerIndex,
  allSpeakers,
  onChange,
  onRemove,
}: {
  speaker: ScheduleSpeaker;
  speakerIndex: number;
  allSpeakers: Speaker[];
  onChange: (updates: Partial<ScheduleSpeaker>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const linked = allSpeakers.find((s) => s._id === speaker.speakerId);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-3 p-3">
        {/* Speaker avatar */}
        <div className="flex-shrink-0">
          {linked?.image?.asset?._ref ? (
            <Image
              src={getSanityImageUrl(linked.image.asset._ref, 48)}
              alt={linked.name}
              width={40}
              height={40}
              className="rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <User size={18} />
            </div>
          )}
        </div>

        {/* Speaker picker */}
        <div className="min-w-0 flex-1">
          <select
            value={speaker.speakerId || ""}
            onChange={(e) => onChange({ speakerId: e.target.value })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
          >
            <option value="">Manual / custom speaker</option>
            {allSpeakers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}{s.company ? ` — ${s.company}` : ""}
              </option>
            ))}
          </select>
          {linked && (
            <p className="mt-0.5 text-xs text-gray-500">
              {linked.position}{linked.company ? `, ${linked.company}` : ""}
            </p>
          )}
        </div>

        {/* Badge indicator (collapsed) */}
        {speaker.sponsor && (
          <span className={`hidden sm:inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 text-xs font-medium ${speaker.sponsorStyle || "bg-gray-200 text-gray-700"}`}>
            {speaker.sponsor}
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Edit details"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={() => { if (window.confirm('Remove this speaker from the session?')) onRemove(); }}
            className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Remove speaker"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {speaker.speakerId ? "Overrides / extras" : "Manual speaker details"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={speaker.name || ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Name override"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              value={speaker.affiliation || ""}
              onChange={(e) => onChange({ affiliation: e.target.value })}
              placeholder="Affiliation override"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              value={speaker.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Title override"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm sm:col-span-2"
            />
            <input
              value={speaker.photo || ""}
              onChange={(e) => onChange({ photo: e.target.value })}
              placeholder="Legacy photo filename"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              value={speaker.presentation || ""}
              onChange={(e) => onChange({ presentation: e.target.value })}
              placeholder="Presentation filename"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              value={speaker.videoId || ""}
              onChange={(e) => onChange({ videoId: e.target.value })}
              placeholder="YouTube video ID"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              value={speaker.videoStartTime ?? ""}
              onChange={(e) => onChange({ videoStartTime: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Video start (seconds)"
              type="number"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            {/* Badge editor */}
            <div className="sm:col-span-2 rounded-md border border-gray-200 bg-gray-50 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">Speaker Badge</span>
                {speaker.sponsor ? (
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${speaker.sponsorStyle || "bg-gray-200 text-gray-700"}`}>
                    {speaker.sponsor}
                  </span>
                ) : (
                  <span className="text-xs italic text-gray-400">None</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={BADGE_PRESETS.find((p) => p.text === speaker.sponsor)?.text || ""}
                  onChange={(e) => {
                    const preset = BADGE_PRESETS.find((p) => p.text === e.target.value);
                    if (preset) onChange({ sponsor: preset.text, sponsorStyle: preset.style });
                  }}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
                >
                  <option value="">— Apply preset —</option>
                  {BADGE_PRESETS.map((p) => (
                    <option key={p.text} value={p.text}>{p.label}</option>
                  ))}
                </select>
                {speaker.sponsor && (
                  <button
                    type="button"
                    onClick={() => onChange({ sponsor: "", sponsorStyle: "" })}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                    title="Clear badge"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={speaker.sponsor || ""}
                  onChange={(e) => onChange({ sponsor: e.target.value })}
                  placeholder="Custom badge text"
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                />
                <input
                  value={speaker.sponsorStyle || ""}
                  onChange={(e) => onChange({ sponsorStyle: e.target.value })}
                  placeholder="Custom Tailwind classes"
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({
  item,
  itemIndex,
  dayIndex,
  totalItems,
  allSpeakers,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddSpeaker,
  onUpdateSpeaker,
  onRemoveSpeaker,
}: {
  item: ScheduleItem;
  itemIndex: number;
  dayIndex: number;
  totalItems: number;
  allSpeakers: Speaker[];
  onUpdate: (updates: Partial<ScheduleItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSpeaker: () => void;
  onUpdateSpeaker: (speakerIndex: number, updates: Partial<ScheduleSpeaker>) => void;
  onRemoveSpeaker: (speakerIndex: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const speakerCount = item.speakers?.length ?? 0;
  const linkedSpeakerPhotos = (item.speakers || [])
    .map((s) => allSpeakers.find((sp) => sp._id === s.speakerId))
    .filter(Boolean) as Speaker[];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Session header — always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical size={16} className="flex-shrink-0 text-gray-300" />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="flex-shrink-0 font-mono text-sm font-semibold text-sb-100 w-24">
              {item.time || <span className="text-gray-300">No time</span>}
            </span>
            <span className="truncate text-sm font-medium text-navy-800">
              {item.title || <span className="text-gray-400 font-normal">Untitled session</span>}
            </span>
          </div>

          {/* Meta badges */}
          <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
            {item.location && (
              <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                <MapPin size={11} /> {item.location}
              </span>
            )}
            {item.duration && (
              <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                <Clock size={11} /> {item.duration}
              </span>
            )}
            {speakerCount > 0 && (
              <div className="flex -space-x-1.5">
                {linkedSpeakerPhotos.slice(0, 3).map((sp) =>
                  sp.image?.asset?._ref ? (
                    <Image
                      key={sp._id}
                      src={getSanityImageUrl(sp.image.asset._ref, 32)}
                      alt={sp.name}
                      width={22}
                      height={22}
                      className="rounded-full ring-1 ring-white object-cover"
                      title={sp.name}
                    />
                  ) : (
                    <div
                      key={sp._id}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-gray-200 ring-1 ring-white text-gray-400"
                    >
                      <User size={11} />
                    </div>
                  )
                )}
                {speakerCount > linkedSpeakerPhotos.length && (
                  <span className="flex h-[22px] items-center rounded-full bg-gray-100 px-1.5 text-xs text-gray-500 ring-1 ring-white">
                    +{speakerCount - linkedSpeakerPhotos.length}
                  </span>
                )}
              </div>
            )}
          </div>

          {expanded ? (
            <ChevronUp size={16} className="flex-shrink-0 text-gray-400" />
          ) : (
            <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />
          )}
        </button>

        {/* Row actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={itemIndex === 0}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={itemIndex === totalItems - 1}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => { if (window.confirm(`Delete session "${item.title || 'Untitled session'}"?`)) onRemove(); }}
            className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Delete session"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          {/* Core fields */}
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Time</label>
              <input
                value={item.time}
                onChange={(e) => onUpdate({ time: e.target.value })}
                placeholder="9:00 AM"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-gray-500">Title</label>
              <input
                value={item.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Session title"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Location</label>
              <input
                value={item.location || ""}
                onChange={(e) => onUpdate({ location: e.target.value })}
                placeholder="Room / hall"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Duration</label>
              <input
                value={item.duration || ""}
                onChange={(e) => onUpdate({ duration: e.target.value })}
                placeholder="45 min"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Sponsor logo CDN</label>
              <input
                value={item.sponsorLogo || ""}
                onChange={(e) => onUpdate({ sponsorLogo: e.target.value })}
                placeholder="path/to/logo.png"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">Description (HTML supported)</label>
              <textarea
                value={item.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Optional description…"
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Speakers section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Speakers {speakerCount > 0 && `(${speakerCount})`}
              </span>
              <button
                type="button"
                onClick={onAddSpeaker}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                <Plus size={13} /> Add speaker
              </button>
            </div>
            <div className="space-y-2">
              {(item.speakers || []).map((speaker, speakerIndex) => (
                <SpeakerRow
                  key={speaker._key || speakerIndex}
                  speaker={speaker}
                  speakerIndex={speakerIndex}
                  allSpeakers={allSpeakers}
                  onChange={(updates) => onUpdateSpeaker(speakerIndex, updates)}
                  onRemove={() => onRemoveSpeaker(speakerIndex)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insert button between sessions ──────────────────────────────────────────

function InsertSessionButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative flex items-center py-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`h-px flex-1 transition-colors ${hovered ? "bg-sb-100" : "bg-transparent"}`} />
      <button
        type="button"
        onClick={onClick}
        className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all ${
          hovered
            ? "border-sb-100 bg-sb-100 text-white shadow"
            : "border-dashed border-gray-300 bg-white text-gray-400 hover:border-sb-100 hover:text-sb-100"
        }`}
      >
        <span className="flex items-center gap-1">
          <Plus size={11} /> Insert session
        </span>
      </button>
      <div className={`h-px flex-1 transition-colors ${hovered ? "bg-sb-100" : "bg-transparent"}`} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScheduleAdminPage() {
  const [selectedEventId, setSelectedEventId] = useState<number>(EVENTS[0]?.id || 1);
  const [hasLoadedSelectedEvent, setHasLoadedSelectedEvent] = useState(false);
  const [schedule, setSchedule] = useState<EventSchedule | null>(null);
  const [savedSchedule, setSavedSchedule] = useState<EventSchedule | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedEvent = useMemo(() => EVENTS.find((event) => event.id === selectedEventId), [selectedEventId]);
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(schedule) !== JSON.stringify(savedSchedule),
    [schedule, savedSchedule]
  );

  useEffect(() => {
    fetchSpeakers();
    const storedEventId = window.localStorage.getItem(SELECTED_EVENT_STORAGE_KEY);
    const parsedEventId = storedEventId ? parseInt(storedEventId, 10) : NaN;
    if (EVENTS.some((event) => event.id === parsedEventId)) {
      setSelectedEventId(parsedEventId);
    }
    setHasLoadedSelectedEvent(true);
  }, []);

  useEffect(() => {
    if (hasLoadedSelectedEvent) {
      window.localStorage.setItem(SELECTED_EVENT_STORAGE_KEY, selectedEventId.toString());
      fetchSchedule(selectedEventId);
    }
  }, [hasLoadedSelectedEvent, selectedEventId]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 4000);
  }

  async function fetchSpeakers() {
    try {
      const res = await fetch("/api/admin/speakers");
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  }

  async function fetchSchedule(eventId: number) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/event-schedules?eventId=${eventId}`);
      const data = await res.json();
      const fetched = data.eventSchedule || null;
      setSchedule(fetched);
      setSavedSchedule(fetched);
      setExpandedDays({});
    } catch {
      showMessage("error", "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSchedule() {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/event-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-doc", eventId: selectedEvent.id, eventSlug: selectedEvent.slug }),
      });
      if (!res.ok) throw new Error();
      await fetchSchedule(selectedEvent.id);
      showMessage("success", "Schedule created");
    } catch {
      showMessage("error", "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    if (!schedule) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/event-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-schedule", scheduleId: schedule._id, days: schedule.days }),
      });
      if (!res.ok) throw new Error();
      setSavedSchedule(schedule);
      showMessage("success", "Schedule saved successfully");
    } catch {
      showMessage("error", "Failed to save schedule");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Mutation helpers ────────────────────────────────────────────────────────

  function updateDay(dayIndex: number, updates: Partial<ScheduleDay>) {
    setSchedule((cur) => cur ? { ...cur, days: cur.days.map((d, i) => i === dayIndex ? { ...d, ...updates } : d) } : cur);
  }

  function updateItem(dayIndex: number, itemIndex: number, updates: Partial<ScheduleItem>) {
    setSchedule((cur) => cur ? {
      ...cur,
      days: cur.days.map((d, di) => di === dayIndex ? {
        ...d,
        items: d.items.map((it, ii) => ii === itemIndex ? { ...it, ...updates } : it),
      } : d),
    } : cur);
  }

  function updateSpeaker(dayIndex: number, itemIndex: number, speakerIndex: number, updates: Partial<ScheduleSpeaker>) {
    setSchedule((cur) => cur ? {
      ...cur,
      days: cur.days.map((d, di) => di === dayIndex ? {
        ...d,
        items: d.items.map((it, ii) => ii === itemIndex ? {
          ...it,
          speakers: (it.speakers || []).map((sp, si) => si === speakerIndex ? { ...sp, ...updates } : sp),
        } : it),
      } : d),
    } : cur);
  }

  function addDay() {
    setSchedule((cur) => cur ? {
      ...cur,
      days: [...cur.days, { _key: `day-${Date.now()}`, date: "", items: [] }],
    } : cur);
  }

  function removeDay(dayIndex: number) {
    setSchedule((cur) => cur ? { ...cur, days: cur.days.filter((_, i) => i !== dayIndex) } : cur);
  }

  function insertItem(dayIndex: number, afterIndex: number) {
    setSchedule((cur) => {
      if (!cur) return cur;
      const newItems = [...cur.days[dayIndex].items];
      newItems.splice(afterIndex + 1, 0, emptyItem());
      return { ...cur, days: cur.days.map((d, i) => i === dayIndex ? { ...d, items: newItems } : d) };
    });
  }

  function addItem(dayIndex: number) {
    setSchedule((cur) => cur ? {
      ...cur,
      days: cur.days.map((d, i) => i === dayIndex ? { ...d, items: [...d.items, emptyItem()] } : d),
    } : cur);
  }

  function removeItem(dayIndex: number, itemIndex: number) {
    setSchedule((cur) => cur ? {
      ...cur,
      days: cur.days.map((d, i) => i === dayIndex ? { ...d, items: d.items.filter((_, ii) => ii !== itemIndex) } : d),
    } : cur);
  }

  function moveItem(dayIndex: number, itemIndex: number, direction: "up" | "down") {
    setSchedule((cur) => {
      if (!cur) return cur;
      const items = [...cur.days[dayIndex].items];
      const targetIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return cur;
      [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];
      return { ...cur, days: cur.days.map((d, i) => i === dayIndex ? { ...d, items } : d) };
    });
  }

  function addSpeaker(dayIndex: number, itemIndex: number) {
    const sp = emptySpeaker();
    updateItem(dayIndex, itemIndex, {
      speakers: [...(schedule?.days[dayIndex].items[itemIndex].speakers || []), sp],
    });
  }

  function removeSpeaker(dayIndex: number, itemIndex: number, speakerIndex: number) {
    updateItem(dayIndex, itemIndex, {
      speakers: (schedule?.days[dayIndex].items[itemIndex].speakers || []).filter((_, i) => i !== speakerIndex),
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-10 pb-24">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-800">Schedule Admin</h1>
            <p className="text-sm text-gray-500">Create and edit event agendas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {EVENTS.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <button
              onClick={() => fetchSchedule(selectedEventId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-6 space-y-5">
        {/* Inline message */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Body */}
        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            Loading schedule…
          </div>
        ) : !schedule ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <Calendar className="mx-auto mb-3 text-navy-800" size={40} />
            <h2 className="text-xl font-bold text-navy-800">No schedule for this event</h2>
            <p className="mt-1 text-sm text-gray-500">Create a Sanity schedule document, then add days and sessions.</p>
            <button
              onClick={handleCreateSchedule}
              disabled={submitting}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-999 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <Plus size={16} /> Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button
                onClick={addDay}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sb-100 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                <Plus size={16} /> Add Day
              </button>
            </div>

            {schedule.days.map((day, dayIndex) => {
              const dayKey = day._key || `${dayIndex}`;
              const isExpanded = expandedDays[dayKey] ?? true;

              return (
                <div key={dayKey} className="rounded-xl bg-white shadow-sm">
                  {/* Day header */}
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                    <button
                      onClick={() => setExpandedDays((cur) => ({ ...cur, [dayKey]: !isExpanded }))}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <input
                      value={day.date}
                      onChange={(e) => updateDay(dayIndex, { date: e.target.value })}
                      placeholder="Day label, e.g. November 14, 2026"
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-navy-800"
                    />
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {day.items.length} session{day.items.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => { if (window.confirm(`Delete day "${day.date || 'Untitled day'}" and all its sessions?`)) removeDay(dayIndex); }}
                      className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete day"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Day sessions */}
                  {isExpanded && (
                    <div className="p-3 space-y-0">
                      {day.items.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                          No sessions yet.{" "}
                          <button
                            onClick={() => addItem(dayIndex)}
                            className="text-sb-100 hover:underline"
                          >
                            Add the first one
                          </button>
                        </div>
                      ) : (
                        <>
                          {day.items.map((item, itemIndex) => (
                            <div key={item._key || itemIndex}>
                              <SessionCard
                                item={item}
                                itemIndex={itemIndex}
                                dayIndex={dayIndex}
                                totalItems={day.items.length}
                                allSpeakers={speakers}
                                onUpdate={(updates) => updateItem(dayIndex, itemIndex, updates)}
                                onRemove={() => removeItem(dayIndex, itemIndex)}
                                onMoveUp={() => moveItem(dayIndex, itemIndex, "up")}
                                onMoveDown={() => moveItem(dayIndex, itemIndex, "down")}
                                onAddSpeaker={() => addSpeaker(dayIndex, itemIndex)}
                                onUpdateSpeaker={(si, updates) => updateSpeaker(dayIndex, itemIndex, si, updates)}
                                onRemoveSpeaker={(si) => removeSpeaker(dayIndex, itemIndex, si)}
                              />
                              <InsertSessionButton onClick={() => insertItem(dayIndex, itemIndex)} />
                            </div>
                          ))}
                        </>
                      )}
                      <button
                        onClick={() => addItem(dayIndex)}
                        className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-400 hover:border-navy-800 hover:text-navy-800"
                      >
                        <Plus size={13} /> Add session at end
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {schedule && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <span className={`text-sm ${hasUnsavedChanges ? "font-medium text-amber-600" : "text-gray-400"}`}>
              {hasUnsavedChanges ? "You have unsaved changes" : "All changes saved"}
            </span>
            <button
              onClick={handleSave}
              disabled={submitting || !hasUnsavedChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-500 disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? "Saving…" : "Save Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
