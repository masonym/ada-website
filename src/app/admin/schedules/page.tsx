"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, Check, ChevronDown, ChevronUp, Plus, RefreshCw, Save, Trash2, User } from "lucide-react";
import { EVENTS } from "@/constants/events";

type Speaker = {
  _id: string;
  name: string;
  sortName?: string;
  slug: { current: string };
  position?: string;
  company?: string;
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

const emptyItem = (): ScheduleItem => ({
  _key: `item-${Date.now()}`,
  time: "",
  title: "",
  location: "",
  duration: "",
  description: "",
  sponsorLogo: "",
  speakers: [],
});

const emptySpeaker = (): ScheduleSpeaker => ({
  _key: `speaker-${Date.now()}`,
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

export default function ScheduleAdminPage() {
  const [selectedEventId, setSelectedEventId] = useState<number>(EVENTS[0]?.id || 1);
  const [hasLoadedSelectedEvent, setHasLoadedSelectedEvent] = useState(false);
  const [schedule, setSchedule] = useState<EventSchedule | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const selectedEvent = useMemo(() => EVENTS.find((event) => event.id === selectedEventId), [selectedEventId]);

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
      setSchedule(data.eventSchedule || null);
      setExpandedDays({});
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load schedule" });
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

      if (!res.ok) throw new Error("Failed to create schedule");
      await fetchSchedule(selectedEvent.id);
      setMessage({ type: "success", text: "Schedule created" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create schedule" });
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

      if (!res.ok) throw new Error("Failed to save schedule");
      await fetchSchedule(schedule.eventId);
      setMessage({ type: "success", text: "Schedule saved" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save schedule" });
    } finally {
      setSubmitting(false);
    }
  }

  function updateDay(dayIndex: number, updates: Partial<ScheduleDay>) {
    setSchedule((current) => current ? {
      ...current,
      days: current.days.map((day, index) => index === dayIndex ? { ...day, ...updates } : day),
    } : current);
  }

  function updateItem(dayIndex: number, itemIndex: number, updates: Partial<ScheduleItem>) {
    setSchedule((current) => current ? {
      ...current,
      days: current.days.map((day, dIndex) => dIndex === dayIndex ? {
        ...day,
        items: day.items.map((item, iIndex) => iIndex === itemIndex ? { ...item, ...updates } : item),
      } : day),
    } : current);
  }

  function updateSpeaker(dayIndex: number, itemIndex: number, speakerIndex: number, updates: Partial<ScheduleSpeaker>) {
    setSchedule((current) => current ? {
      ...current,
      days: current.days.map((day, dIndex) => dIndex === dayIndex ? {
        ...day,
        items: day.items.map((item, iIndex) => iIndex === itemIndex ? {
          ...item,
          speakers: (item.speakers || []).map((speaker, sIndex) => sIndex === speakerIndex ? { ...speaker, ...updates } : speaker),
        } : item),
      } : day),
    } : current);
  }

  function addDay() {
    setSchedule((current) => current ? {
      ...current,
      days: [...current.days, { _key: `day-${Date.now()}`, date: "", items: [] }],
    } : current);
  }

  function removeDay(dayIndex: number) {
    setSchedule((current) => current ? { ...current, days: current.days.filter((_, index) => index !== dayIndex) } : current);
  }

  function addItem(dayIndex: number) {
    setSchedule((current) => current ? {
      ...current,
      days: current.days.map((day, index) => index === dayIndex ? { ...day, items: [...day.items, emptyItem()] } : day),
    } : current);
  }

  function removeItem(dayIndex: number, itemIndex: number) {
    setSchedule((current) => current ? {
      ...current,
      days: current.days.map((day, index) => index === dayIndex ? { ...day, items: day.items.filter((_, iIndex) => iIndex !== itemIndex) } : day),
    } : current);
  }

  function addSpeaker(dayIndex: number, itemIndex: number) {
    const speaker = emptySpeaker();
    updateItem(dayIndex, itemIndex, { speakers: [...(schedule?.days[dayIndex].items[itemIndex].speakers || []), speaker] });
  }

  function removeSpeaker(dayIndex: number, itemIndex: number, speakerIndex: number) {
    updateItem(dayIndex, itemIndex, {
      speakers: (schedule?.days[dayIndex].items[itemIndex].speakers || []).filter((_, index) => index !== speakerIndex),
    });
  }

  return (
    <div className="min-h-screen bg-gray-10 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy-800">Schedule Admin</h1>
            <p className="mt-1 text-gray-600">Create and edit Sanity-powered event agendas.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(parseInt(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900"
            >
              {EVENTS.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <button onClick={() => fetchSchedule(selectedEventId)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-20">
              <RefreshCw size={18} /> Refresh
            </button>
            {schedule && (
              <button onClick={handleSave} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-white hover:bg-navy-500 disabled:opacity-60">
                <Save size={18} /> {submitting ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">Loading schedule...</div>
        ) : !schedule ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <Calendar className="mx-auto mb-4 text-navy-800" size={48} />
            <h2 className="text-2xl font-bold text-navy-800">No schedule exists for this event</h2>
            <p className="mt-2 text-gray-600">Create a Sanity schedule document, then add days and sessions.</p>
            <button onClick={handleCreateSchedule} disabled={submitting} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-999 px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60">
              <Plus size={18} /> Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={addDay} className="inline-flex items-center gap-2 rounded-lg bg-sb-100 px-4 py-2 font-semibold text-white hover:opacity-90">
                <Plus size={18} /> Add Day
              </button>
            </div>

            {schedule.days.map((day, dayIndex) => {
              const dayKey = day._key || `${dayIndex}`;
              const isExpanded = expandedDays[dayKey] ?? true;

              return (
                <div key={dayKey} className="rounded-xl bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-gray-20 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <button onClick={() => setExpandedDays((current) => ({ ...current, [dayKey]: !isExpanded }))} className="rounded-lg p-2 hover:bg-gray-20">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <input
                        value={day.date}
                        onChange={(event) => updateDay(dayIndex, { date: event.target.value })}
                        placeholder="Day label, e.g. November 14, 2026"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg font-semibold text-navy-800"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => addItem(dayIndex)} className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-3 py-2 text-white hover:bg-navy-500">
                        <Plus size={16} /> Session
                      </button>
                      <button onClick={() => removeDay(dayIndex)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 p-4">
                      {day.items.map((item, itemIndex) => (
                        <div key={item._key || itemIndex} className="rounded-lg border border-gray-20 bg-gray-10 p-4">
                          <div className="grid gap-3 md:grid-cols-4">
                            <input value={item.time} onChange={(event) => updateItem(dayIndex, itemIndex, { time: event.target.value })} placeholder="Time" className="rounded-lg border border-gray-300 px-3 py-2" />
                            <input value={item.title} onChange={(event) => updateItem(dayIndex, itemIndex, { title: event.target.value })} placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                            <input value={item.duration || ""} onChange={(event) => updateItem(dayIndex, itemIndex, { duration: event.target.value })} placeholder="Duration" className="rounded-lg border border-gray-300 px-3 py-2" />
                            <input value={item.location || ""} onChange={(event) => updateItem(dayIndex, itemIndex, { location: event.target.value })} placeholder="Location" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                            <input value={item.sponsorLogo || ""} onChange={(event) => updateItem(dayIndex, itemIndex, { sponsorLogo: event.target.value })} placeholder="Sponsor logo CDN path" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                            <textarea value={item.description || ""} onChange={(event) => updateItem(dayIndex, itemIndex, { description: event.target.value })} placeholder="Description (HTML supported)" className="min-h-24 rounded-lg border border-gray-300 px-3 py-2 md:col-span-4" />
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-navy-800">Speakers</h3>
                              <div className="flex gap-2">
                                <button onClick={() => addSpeaker(dayIndex, itemIndex)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white">
                                  <User size={16} /> Add Speaker
                                </button>
                                <button onClick={() => removeItem(dayIndex, itemIndex)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {(item.speakers || []).map((speaker, speakerIndex) => (
                              <div key={speaker._key || speakerIndex} className="rounded-lg border border-gray-30 bg-white p-3">
                                <div className="grid gap-3 md:grid-cols-4">
                                  <select value={speaker.speakerId || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { speakerId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2">
                                    <option value="">Custom/manual speaker</option>
                                    {speakers.map((option) => (
                                      <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                  </select>
                                  <input value={speaker.name || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { name: event.target.value })} placeholder="Manual name" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.affiliation || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { affiliation: event.target.value })} placeholder="Manual affiliation" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.title || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { title: event.target.value })} placeholder="Manual title" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                                  <input value={speaker.photo || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { photo: event.target.value })} placeholder="Legacy photo filename" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.presentation || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { presentation: event.target.value })} placeholder="Presentation filename" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.videoId || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { videoId: event.target.value })} placeholder="YouTube video ID" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.videoStartTime ?? ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { videoStartTime: event.target.value ? parseInt(event.target.value) : undefined })} placeholder="Video start seconds" type="number" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.sponsor || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { sponsor: event.target.value })} placeholder="Speaker badge text" className="rounded-lg border border-gray-300 px-3 py-2" />
                                  <input value={speaker.sponsorStyle || ""} onChange={(event) => updateSpeaker(dayIndex, itemIndex, speakerIndex, { sponsorStyle: event.target.value })} placeholder="Speaker badge Tailwind classes" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                                  <button onClick={() => removeSpeaker(dayIndex, itemIndex, speakerIndex)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50">
                                    <Trash2 size={16} /> Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
