"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  User,
  RefreshCw,
  Calendar,
  Star,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

// events list for dropdown (from src/constants/events.tsx)
const EVENTS = [
  { id: 1, slug: "2025-defense-industry-forecast", name: "2025 Defense Industry Forecast" },
  { id: 2, slug: "2025-southeast-defense-procurement-conference", name: "2025 Southeast Defense Procurement Conference" },
  { id: 3, slug: "driving-the-industrialization-of-space", name: "Driving the Industrialization of Space" },
  { id: 4, slug: "2025-navy-marine-corps-procurement-conference", name: "2025 Navy & Marine Corps Procurement Conference" },
  { id: 5, slug: "2026-defense-technology-aerospace-procurement-conference", name: "2026 Defense Technology & Aerospace Procurement Conference" },
  { id: 6, slug: "2026-navy-marine-corps-procurement-conference", name: "2026 Navy & Marine Corps Procurement Conference" },
];

type Speaker = {
  _id: string;
  name: string;
  slug: { current: string };
  image?: {
    asset: {
      _ref: string;
    };
  };
  position?: string;
  company?: string;
  bio?: string;
  isVisible: boolean;
  priority: number;
};

type EventSpeaker = {
  _key: string;
  speakerId: string;
  speakerName: string;
  speakerCompany?: string;
  speakerPosition?: string;
  speakerImage?: { asset: { _ref: string } };
  isVisible: boolean;
  isKeynote: boolean;
  keynoteHeaderText?: string;
  label?: string;
  sortOrder: number;
};

type EventSpeakersDoc = {
  _id: string;
  eventSlug: string;
  eventId: number;
  speakers: EventSpeaker[];
};

export default function SpeakerAdminPage() {
  // tab: "database" for speaker database, "events" for event assignments
  const [activeTab, setActiveTab] = useState<"database" | "events">("events");

  // speaker database state
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  // mode: list, new, edit
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [priority, setPriority] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // event speakers state
  const [selectedEventId, setSelectedEventId] = useState<number>(5);
  const [eventSpeakersDoc, setEventSpeakersDoc] = useState<EventSpeakersDoc | null>(null);
  const [loadingEventSpeakers, setLoadingEventSpeakers] = useState(false);
  const [showAddSpeakerModal, setShowAddSpeakerModal] = useState(false);
  const [editingEventSpeaker, setEditingEventSpeaker] = useState<EventSpeaker | null>(null);

  // add speaker form
  const [addSpeakerId, setAddSpeakerId] = useState("");
  const [addIsKeynote, setAddIsKeynote] = useState(false);
  const [addKeynoteHeader, setAddKeynoteHeader] = useState("");
  const [addLabel, setAddLabel] = useState("");

  useEffect(() => {
    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (activeTab === "events" && selectedEventId) {
      fetchEventSpeakers(selectedEventId);
    }
  }, [activeTab, selectedEventId]);

  async function fetchSpeakers() {
    try {
      const res = await fetch("/api/admin/speakers");
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEventSpeakers(eventId: number) {
    setLoadingEventSpeakers(true);
    try {
      const res = await fetch(`/api/admin/event-speakers?eventId=${eventId}`);
      const data = await res.json();
      setEventSpeakersDoc(data.eventSpeakers || null);
    } catch (error) {
      console.error("Error fetching event speakers:", error);
    } finally {
      setLoadingEventSpeakers(false);
    }
  }

  async function handleCreateEventDoc() {
    const event = EVENTS.find((e) => e.id === selectedEventId);
    if (!event) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/event-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-doc",
          eventId: event.id,
          eventSlug: event.slug,
        }),
      });
      if (res.ok) {
        fetchEventSpeakers(selectedEventId);
        setMessage({ type: "success", text: "Event speakers document created" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create event speakers document" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSpeakerToEvent() {
    if (!eventSpeakersDoc || !addSpeakerId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/event-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-speaker",
          docId: eventSpeakersDoc._id,
          speakerId: addSpeakerId,
          isKeynote: addIsKeynote,
          keynoteHeaderText: addKeynoteHeader,
          label: addLabel,
        }),
      });
      if (res.ok) {
        fetchEventSpeakers(selectedEventId);
        setShowAddSpeakerModal(false);
        setAddSpeakerId("");
        setAddIsKeynote(false);
        setAddKeynoteHeader("");
        setAddLabel("");
        setMessage({ type: "success", text: "Speaker added to event" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add speaker" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveSpeakerFromEvent(speakerKey: string) {
    if (!eventSpeakersDoc) return;
    if (!confirm("Remove this speaker from the event?")) return;

    try {
      const res = await fetch("/api/admin/event-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove-speaker",
          docId: eventSpeakersDoc._id,
          speakerKey,
        }),
      });
      if (res.ok) {
        fetchEventSpeakers(selectedEventId);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove speaker" });
    }
  }

  async function handleToggleEventSpeakerVisibility(speakerKey: string, currentVisibility: boolean) {
    if (!eventSpeakersDoc) return;

    try {
      const res = await fetch("/api/admin/event-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-visibility",
          docId: eventSpeakersDoc._id,
          speakerKey,
          isVisible: !currentVisibility,
        }),
      });
      if (res.ok) {
        fetchEventSpeakers(selectedEventId);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to toggle visibility" });
    }
  }

  async function handleUpdateEventSpeaker() {
    if (!eventSpeakersDoc || !editingEventSpeaker) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/event-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-speaker",
          docId: eventSpeakersDoc._id,
          speakerKey: editingEventSpeaker._key,
          isKeynote: editingEventSpeaker.isKeynote,
          keynoteHeaderText: editingEventSpeaker.keynoteHeaderText,
          label: editingEventSpeaker.label,
          sortOrder: editingEventSpeaker.sortOrder,
        }),
      });
      if (res.ok) {
        fetchEventSpeakers(selectedEventId);
        setEditingEventSpeaker(null);
        setMessage({ type: "success", text: "Speaker updated" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update speaker" });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setPosition("");
    setCompany("");
    setBio("");
    setPriority(0);
    setImage(null);
    setImagePreview(null);
    setEditingSpeaker(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function startEdit(speaker: Speaker) {
    setEditingSpeaker(speaker);
    setName(speaker.name);
    setPosition(speaker.position || "");
    setCompany(speaker.company || "");
    setBio(speaker.bio || "");
    setPriority(speaker.priority || 0);
    setImage(null);
    setImagePreview(null);
    setMode("edit");
  }

  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("action", "create");
      formData.append("name", name);
      formData.append("position", position);
      formData.append("company", company);
      formData.append("bio", bio);
      formData.append("priority", priority.toString());
      if (image) formData.append("image", image);

      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        resetForm();
        setMode("list");
        fetchSpeakers();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create speaker" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSpeaker) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // update details
      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          speakerId: editingSpeaker._id,
          name,
          position,
          company,
          bio,
          priority,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        setSubmitting(false);
        return;
      }

      // update image if provided
      if (image) {
        const formData = new FormData();
        formData.append("action", "update-image");
        formData.append("speakerId", editingSpeaker._id);
        formData.append("image", image);

        const imgRes = await fetch("/api/admin/speakers", {
          method: "POST",
          body: formData,
        });

        if (!imgRes.ok) {
          const imgData = await imgRes.json();
          setMessage({ type: "error", text: imgData.error });
          setSubmitting(false);
          return;
        }
      }

      setMessage({ type: "success", text: "Speaker updated successfully" });
      resetForm();
      setMode("list");
      fetchSpeakers();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update speaker" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleVisibility(speaker: Speaker) {
    try {
      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-visibility",
          speakerId: speaker._id,
          isVisible: !speaker.isVisible,
        }),
      });

      if (res.ok) {
        fetchSpeakers();
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  }

  async function handleDelete(speaker: Speaker) {
    if (!confirm(`Are you sure you want to delete "${speaker.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          speakerId: speaker._id,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Speaker deleted" });
        fetchSpeakers();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete speaker" });
    }
  }

  // filter speakers
  const filteredSpeakers = speakers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = showHidden || s.isVisible;
    return matchesSearch && matchesVisibility;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // helper to get sanity image URL
  function getSanityImageUrl(ref: string) {
    return `https://cdn.sanity.io/images/nc4xlou0/production/${ref
      .replace("image-", "")
      .replace("-webp", ".webp")
      .replace("-jpg", ".jpg")
      .replace("-png", ".png")}`;
  }

  // get speakers not yet in event
  const availableSpeakers = speakers.filter(
    (s) => !eventSpeakersDoc?.speakers.some((es) => es.speakerId === s._id)
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Speaker Management</h1>
          <p className="text-gray-600 mt-1">Manage speaker database and event assignments</p>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "events"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Event Speakers
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "database"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Speaker Database ({speakers.length})
          </button>
        </div>

        {/* message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* EVENT SPEAKERS TAB */}
        {activeTab === "events" && (
          <div>
            {/* event selector */}
            <div className="mb-6 flex gap-4 items-center">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {EVENTS.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => fetchEventSpeakers(selectedEventId)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loadingEventSpeakers ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingEventSpeakers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : !eventSpeakersDoc ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No speakers configured for this event yet.</p>
                <button
                  onClick={handleCreateEventDoc}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Initialize Event Speakers"}
                </button>
              </div>
            ) : (
              <>
                {/* header with add button */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">
                    {eventSpeakersDoc.speakers.length} speakers •{" "}
                    {eventSpeakersDoc.speakers.filter((s) => s.isVisible).length} visible •{" "}
                    {eventSpeakersDoc.speakers.filter((s) => s.isKeynote).length} keynotes
                  </p>
                  <button
                    onClick={() => setShowAddSpeakerModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Speaker to Event
                  </button>
                </div>

                {/* keynote speakers section */}
                {eventSpeakersDoc.speakers.filter((s) => s.isKeynote).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Keynote Speakers
                    </h3>
                    <div className="grid gap-3">
                      {eventSpeakersDoc.speakers
                        .filter((s) => s.isKeynote)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((speaker) => (
                          <div
                            key={speaker._key}
                            className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${
                              !speaker.isVisible ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {speaker.speakerImage?.asset?._ref ? (
                                  <Image
                                    src={getSanityImageUrl(speaker.speakerImage.asset._ref)}
                                    alt={speaker.speakerName}
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                    unoptimized
                                  />
                                ) : (
                                  <User className="w-8 h-8 text-gray-400 m-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold">{speaker.speakerName}</div>
                                <div className="text-sm text-yellow-700">{speaker.keynoteHeaderText}</div>
                                {speaker.label && (
                                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{speaker.label}</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingEventSpeaker({ ...speaker })}
                                  className="p-2 text-gray-500 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleEventSpeakerVisibility(speaker._key, speaker.isVisible)}
                                  className={`p-2 ${speaker.isVisible ? "text-yellow-600" : "text-green-600"}`}
                                  title={speaker.isVisible ? "Hide" : "Show"}
                                >
                                  {speaker.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleRemoveSpeakerFromEvent(speaker._key)}
                                  className="p-2 text-red-500 hover:text-red-700"
                                  title="Remove"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* regular speakers */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Speakers</h3>
                  <div className="grid gap-2">
                    {eventSpeakersDoc.speakers
                      .filter((s) => !s.isKeynote)
                      .sort((a, b) => a.speakerName.localeCompare(b.speakerName))
                      .map((speaker) => (
                        <div
                          key={speaker._key}
                          className={`bg-white border rounded-lg p-3 flex items-center gap-3 ${
                            !speaker.isVisible ? "opacity-50 border-gray-300" : "border-gray-200"
                          }`}
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {speaker.speakerImage?.asset?._ref ? (
                              <Image
                                src={getSanityImageUrl(speaker.speakerImage.asset._ref)}
                                alt={speaker.speakerName}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                                unoptimized
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-400 m-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{speaker.speakerName}</div>
                            <div className="text-sm text-gray-500 truncate">
                              {speaker.speakerPosition} {speaker.speakerCompany && `• ${speaker.speakerCompany}`}
                            </div>
                            {speaker.label && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{speaker.label}</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingEventSpeaker({ ...speaker })}
                              className="p-2 text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleEventSpeakerVisibility(speaker._key, speaker.isVisible)}
                              className={`p-2 ${speaker.isVisible ? "text-yellow-500" : "text-green-500"}`}
                              title={speaker.isVisible ? "Hide" : "Show"}
                            >
                              {speaker.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRemoveSpeakerFromEvent(speaker._key)}
                              className="p-2 text-gray-400 hover:text-red-600"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {eventSpeakersDoc.speakers.filter((s) => !s.isKeynote).length === 0 && (
                    <p className="text-center py-8 text-gray-500">No regular speakers added yet</p>
                  )}
                </div>
              </>
            )}

            {/* Add Speaker Modal */}
            {showAddSpeakerModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add Speaker to Event</h3>
                    <button onClick={() => setShowAddSpeakerModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                      <select
                        value={addSpeakerId}
                        onChange={(e) => setAddSpeakerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a speaker...</option>
                        {availableSpeakers.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} {s.company && `(${s.company})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="addIsKeynote"
                        checked={addIsKeynote}
                        onChange={(e) => setAddIsKeynote(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="addIsKeynote" className="text-sm">Keynote Speaker</label>
                    </div>

                    {addIsKeynote && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keynote Header</label>
                        <input
                          type="text"
                          value={addKeynoteHeader}
                          onChange={(e) => setAddKeynoteHeader(e.target.value)}
                          placeholder="e.g., Congressional Keynote Speaker"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
                      <input
                        type="text"
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                        placeholder="e.g., Pre-Recorded Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleAddSpeakerToEvent}
                        disabled={!addSpeakerId || submitting}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? "Adding..." : "Add Speaker"}
                      </button>
                      <button
                        onClick={() => setShowAddSpeakerModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Event Speaker Modal */}
            {editingEventSpeaker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Speaker Settings</h3>
                    <button onClick={() => setEditingEventSpeaker(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {editingEventSpeaker.speakerImage?.asset?._ref ? (
                          <Image
                            src={getSanityImageUrl(editingEventSpeaker.speakerImage.asset._ref)}
                            alt={editingEventSpeaker.speakerName}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400 m-3" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{editingEventSpeaker.speakerName}</div>
                        <div className="text-sm text-gray-500">{editingEventSpeaker.speakerCompany}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editIsKeynote"
                        checked={editingEventSpeaker.isKeynote}
                        onChange={(e) =>
                          setEditingEventSpeaker({ ...editingEventSpeaker, isKeynote: e.target.checked })
                        }
                        className="rounded"
                      />
                      <label htmlFor="editIsKeynote" className="text-sm">Keynote Speaker</label>
                    </div>

                    {editingEventSpeaker.isKeynote && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Keynote Header</label>
                          <input
                            type="text"
                            value={editingEventSpeaker.keynoteHeaderText || ""}
                            onChange={(e) =>
                              setEditingEventSpeaker({ ...editingEventSpeaker, keynoteHeaderText: e.target.value })
                            }
                            placeholder="e.g., Congressional Keynote Speaker"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                          <input
                            type="number"
                            value={editingEventSpeaker.sortOrder}
                            onChange={(e) =>
                              setEditingEventSpeaker({ ...editingEventSpeaker, sortOrder: parseInt(e.target.value) || 0 })
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
                      <input
                        type="text"
                        value={editingEventSpeaker.label || ""}
                        onChange={(e) =>
                          setEditingEventSpeaker({ ...editingEventSpeaker, label: e.target.value })
                        }
                        placeholder="e.g., Pre-Recorded Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleUpdateEventSpeaker}
                        disabled={submitting}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditingEventSpeaker(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPEAKER DATABASE TAB */}
        {activeTab === "database" && (
          <>
            {/* header */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {speakers.length} speakers total • {speakers.filter((s) => s.isVisible).length} visible
              </p>
              {mode === "list" && (
                <button
                  onClick={() => {
                    resetForm();
                    setMode("new");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Speaker
                </button>
              )}
              {mode !== "list" && (
                <button
                  onClick={() => {
                    resetForm();
                    setMode("list");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back to List
                </button>
              )}
            </div>

            {/* list mode */}
            {mode === "list" && (
              <>
                {/* search and filters */}
                <div className="mb-6 flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="rounded"
                />
                Show hidden
              </label>
              <button
                onClick={fetchSpeakers}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* speakers grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSpeakers.map((speaker) => (
                <div
                  key={speaker._id}
                  className={`bg-white rounded-lg shadow-sm p-4 border ${
                    !speaker.isVisible ? "opacity-60 border-gray-300" : "border-transparent"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {speaker.image?.asset?._ref ? (
                        <Image
                          src={`https://cdn.sanity.io/images/nc4xlou0/production/${speaker.image.asset._ref
                            .replace("image-", "")
                            .replace("-webp", ".webp")
                            .replace("-jpg", ".jpg")
                            .replace("-png", ".png")}`}
                          alt={speaker.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{speaker.name}</h3>
                      {speaker.position && (
                        <p className="text-sm text-gray-600 truncate">{speaker.position}</p>
                      )}
                      {speaker.company && (
                        <p className="text-sm text-gray-500 truncate">{speaker.company}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => startEdit(speaker)}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(speaker)}
                      className={`px-3 py-1.5 text-sm rounded flex items-center justify-center gap-1 ${
                        speaker.isVisible
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={speaker.isVisible ? "Hide" : "Show"}
                    >
                      {speaker.isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleDelete(speaker)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSpeakers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? "No speakers match your search" : "No speakers found"}
              </div>
            )}
          </>
        )}

            {/* new/edit form */}
            {(mode === "new" || mode === "edit") && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">
                  {mode === "new" ? "Add New Speaker" : `Edit: ${editingSpeaker?.name}`}
                </h2>

                <form onSubmit={mode === "new" ? handleSubmitNew : handleSubmitEdit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                    <div className="flex items-start gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {image ? image.name : "Click to upload photo"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imagePreview && (
                        <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-100">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Director of Operations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Department of Defense"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biography (HTML supported)</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Speaker biography..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Use &lt;br/&gt; for line breaks, &lt;b&gt; for bold</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority (higher = first)</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (mode === "new" ? "Creating..." : "Saving...") : (mode === "new" ? "Create Speaker" : "Save Changes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { resetForm(); setMode("list"); }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
