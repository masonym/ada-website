"use client";

import { useState, useEffect } from "react";
import { Plus, Check, AlertCircle, Trash2, Edit2, Users, X, Save } from "lucide-react";

type Sponsor = {
  _id: string;
  name: string;
  slug: { current: string };
};

type MatchmakingSponsorEntry = {
  _key: string;
  sponsor: { _type: string; _ref: string };
  note?: string;
};

type MatchmakingDoc = {
  _id: string;
  eventSlug: string;
  title?: string;
  description?: string;
  sponsors: MatchmakingSponsorEntry[];
};

type EventSlug = {
  slug: string;
  title: string;
};

export default function MatchmakingSponsorsAdminPage() {
  const [matchmakingDocs, setMatchmakingDocs] = useState<MatchmakingDoc[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [eventSlugs, setEventSlugs] = useState<EventSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // selected event for viewing/editing
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // create new doc form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventSlug, setNewEventSlug] = useState("");
  const [newTitle, setNewTitle] = useState("Companies Participating in Matchmaking Sessions");
  const [newDescription, setNewDescription] = useState("");

  // add sponsor form
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [addSponsorId, setAddSponsorId] = useState("");
  const [addSponsorNote, setAddSponsorNote] = useState("");

  // edit metadata
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // edit note
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/matchmaking-sponsors");
      const data = await res.json();
      setMatchmakingDocs(data.matchmakingDocs || []);
      setSponsors(data.sponsors || []);
      setEventSlugs(data.eventSlugs || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newEventSlug) {
      setMessage({ type: "error", text: "Please select an event" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-doc",
          eventSlug: newEventSlug,
          title: newTitle,
          description: newDescription,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setShowCreateForm(false);
        setNewEventSlug("");
        setNewTitle("Companies Participating in Matchmaking Sessions");
        setNewDescription("");
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create document" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSponsor(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDocId || !addSponsorId) {
      setMessage({ type: "error", text: "Please select a sponsor" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-sponsor",
          docId: selectedDocId,
          sponsorId: addSponsorId,
          note: addSponsorNote || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setShowAddSponsor(false);
        setAddSponsorId("");
        setAddSponsorNote("");
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add sponsor" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDocId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-metadata",
          docId: selectedDocId,
          title: editTitle,
          description: editDescription,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setEditingMetadata(false);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update metadata" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateNote(sponsorKey: string) {
    if (!selectedDocId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-note",
          docId: selectedDocId,
          sponsorKey,
          note: editNoteValue,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setEditingNoteKey(null);
        setEditNoteValue("");
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update note" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveSponsor(sponsorKey: string) {
    if (!selectedDocId) return;
    if (!confirm("Are you sure you want to remove this sponsor from matchmaking?")) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove-sponsor",
          docId: selectedDocId,
          sponsorKey,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove sponsor" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteDoc() {
    if (!selectedDocId) return;
    if (!confirm("Are you sure you want to delete this entire matchmaking document? This cannot be undone.")) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/matchmaking-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-doc",
          docId: selectedDocId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setSelectedDocId(null);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete document" });
    } finally {
      setSubmitting(false);
    }
  }

  function getSponsorName(sponsorRef: string): string {
    const sponsor = sponsors.find((s) => s._id === sponsorRef);
    return sponsor?.name || "Unknown Sponsor";
  }

  function getEventTitle(slug: string): string {
    const event = eventSlugs.find((e) => e.slug === slug);
    return event?.title || slug;
  }

  const selectedDoc = matchmakingDocs.find((d) => d._id === selectedDocId);

  // filter out events that already have matchmaking docs
  const availableEventSlugs = eventSlugs.filter(
    (e) => !matchmakingDocs.some((d) => d.eventSlug === e.slug)
  );

  // filter out sponsors already in the selected doc
  const availableSponsors = selectedDoc
    ? sponsors.filter(
        (s) => !selectedDoc.sponsors?.some((ms) => ms.sponsor._ref === s._id)
      )
    : sponsors;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Matchmaking Sponsors</h1>
          <p className="text-gray-600 mt-2">
            Manage sponsors participating in matchmaking sessions for each event
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left panel - event list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Events</h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Add new event"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {matchmakingDocs.length === 0 ? (
                <p className="text-gray-500 text-sm">No matchmaking events configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {matchmakingDocs.map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => {
                        setSelectedDocId(doc._id);
                        setEditingMetadata(false);
                        setShowAddSponsor(false);
                      }}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedDocId === doc._id
                          ? "bg-blue-100 border-blue-300 border"
                          : "bg-gray-10 hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {getEventTitle(doc.eventSlug)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        {doc.sponsors?.length || 0} sponsors
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* right panel - event details */}
          <div className="lg:col-span-2">
            {showCreateForm ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Create Matchmaking Document</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateDoc} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event *
                    </label>
                    <select
                      value={newEventSlug}
                      onChange={(e) => setNewEventSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select an event...</option>
                      {availableEventSlugs.map((e) => (
                        <option key={e.slug} value={e.slug}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Document"}
                  </button>
                </form>
              </div>
            ) : selectedDoc ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {editingMetadata ? (
                      <form onSubmit={handleUpdateMetadata} className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg font-semibold"
                          placeholder="Title"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Description"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMetadata(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold">{selectedDoc.title || "Untitled"}</h2>
                        <p className="text-sm text-gray-500 mt-1">{selectedDoc.eventSlug}</p>
                        {selectedDoc.description && (
                          <p className="text-sm text-gray-600 mt-2">{selectedDoc.description}</p>
                        )}
                      </>
                    )}
                  </div>
                  {!editingMetadata && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMetadata(true);
                          setEditTitle(selectedDoc.title || "");
                          setEditDescription(selectedDoc.description || "");
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Edit metadata"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteDoc}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* sponsors list */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Sponsors ({selectedDoc.sponsors?.length || 0})</h3>
                    <button
                      onClick={() => setShowAddSponsor(true)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Sponsor
                    </button>
                  </div>

                  {showAddSponsor && (
                    <form onSubmit={handleAddSponsor} className="mb-4 p-4 bg-gray-10 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sponsor *
                          </label>
                          <select
                            value={addSponsorId}
                            onChange={(e) => setAddSponsorId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            required
                          >
                            <option value="">Select a sponsor...</option>
                            {availableSponsors.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note (optional)
                          </label>
                          <input
                            type="text"
                            value={addSponsorNote}
                            onChange={(e) => setAddSponsorNote(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="e.g., Participating on Tuesday only"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitting ? "Adding..." : "Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSponsor(false);
                            setAddSponsorId("");
                            setAddSponsorNote("");
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {!selectedDoc.sponsors || selectedDoc.sponsors.length === 0 ? (
                    <p className="text-gray-500 text-sm">No sponsors added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDoc.sponsors.map((entry, index) => (
                        <div
                          key={entry._key}
                          className="flex items-center justify-between p-3 bg-gray-10 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                              <span className="font-medium">{getSponsorName(entry.sponsor._ref)}</span>
                            </div>
                            {editingNoteKey === entry._key ? (
                              <div className="flex items-center gap-2 mt-2 ml-6">
                                <input
                                  type="text"
                                  value={editNoteValue}
                                  onChange={(e) => setEditNoteValue(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Add a note..."
                                />
                                <button
                                  onClick={() => handleUpdateNote(entry._key)}
                                  disabled={submitting}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteKey(null);
                                    setEditNoteValue("");
                                  }}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : entry.note ? (
                              <p className="text-sm text-gray-500 ml-6 mt-1 italic">{entry.note}</p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingNoteKey(entry._key);
                                setEditNoteValue(entry.note || "");
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit note"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveSponsor(entry._key)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove sponsor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select an event from the list to manage its matchmaking sponsors</p>
                <p className="text-sm mt-2">or click the + button to create a new one</p>
              </div>
            )}
          </div>
        </div>

        {/* quick tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Create a matchmaking document for each event that has matchmaking sessions</li>
            <li>Add notes to sponsors for special conditions (e.g., "Participating on Tuesday only")</li>
            <li>Changes appear on the website within a few minutes (CDN cache)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
