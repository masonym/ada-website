"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Trash2, RefreshCw } from "lucide-react";

type EventWithTiers = {
  _id: string;
  eventId: number;
  title: string;
  eventName: string;
  tiers: Array<{ id: string; name: string }>;
};

type ExistingSponsor = {
  _id: string;
  name: string;
  slug: { current: string };
};

export default function RemoveSponsorFromEventPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([]);
  const [sponsors, setSponsors] = useState<ExistingSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>("");
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [removeFromAllTiers, setRemoveFromAllTiers] = useState(false);

  const selectedEvent = useMemo(
    () => (typeof selectedEventId === "number" ? events.find(e => e.eventId === selectedEventId) : undefined),
    [events, selectedEventId]
  );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sponsors");
      const data = await res.json();
      setEvents(data.events || []);
      setSponsors(data.sponsors || []);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch events/sponsors" });
    } finally {
      setLoading(false);
    }
  }

  function toggleTier(tierId: string) {
    setSelectedTierIds(prev => (prev.includes(tierId) ? prev.filter(id => id !== tierId) : [...prev, tierId]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (typeof selectedEventId !== "number") {
      setMessage({ type: "error", text: "Please select an event" });
      return;
    }

    if (!selectedSponsorId) {
      setMessage({ type: "error", text: "Please select a sponsor" });
      return;
    }

    if (!removeFromAllTiers && selectedTierIds.length === 0) {
      setMessage({ type: "error", text: "Select at least one tier (or remove from all tiers)" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/sponsors/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: selectedSponsorId,
          eventId: selectedEventId,
          tierIds: removeFromAllTiers ? undefined : selectedTierIds,
          removeFromAllTiers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to remove sponsor" });
        return;
      }

      setMessage({ type: "success", text: data.message || "Removed sponsor" });
      setSelectedTierIds([]);
      setRemoveFromAllTiers(false);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove sponsor" });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    setSelectedTierIds([]);
    setRemoveFromAllTiers(false);
  }, [selectedEventId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sb-100 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Remove Sponsor From Event</h1>
          <p className="text-gray-600 mt-1">Unlink a sponsor from one or more sponsor tiers for a specific event.</p>
          <p className="text-xs text-gray-500 mt-2">
            <Link href="/admin/sponsors" className="underline">Back to Sponsor Admin</Link>
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div className="text-sm">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedEventId}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedEventId(v ? parseInt(v, 10) : "");
              }}
            >
              <option value="">Select event...</option>
              {events.map((e) => (
                <option key={e._id} value={e.eventId}>
                  {e.eventName} (ID {e.eventId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedSponsorId}
              onChange={(e) => setSelectedSponsorId(e.target.value)}
            >
              <option value="">Select sponsor...</option>
              {sponsors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={removeFromAllTiers}
              onChange={(e) => setRemoveFromAllTiers(e.target.checked)}
              className="h-4 w-4"
            />
            Remove from all tiers for this event
          </label>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Tiers</label>
            {selectedEvent && (
              <span className="text-xs text-gray-500">{selectedEvent.tiers.length} tier(s)</span>
            )}
          </div>

          {!selectedEvent ? (
            <div className="text-sm text-gray-500">Select an event to see its tiers.</div>
          ) : removeFromAllTiers ? (
            <div className="text-sm text-gray-500">All tiers will be targeted.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedEvent.tiers.map((tier) => (
                <label
                  key={tier.id}
                  className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${
                    selectedTierIds.includes(tier.id) ? "border-sb-100 bg-sky-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTierIds.includes(tier.id)}
                    onChange={() => toggleTier(tier.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-800">
                    {tier.name} <span className="text-xs text-gray-500">({tier.id})</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors ${
              submitting ? "bg-gray-400" : "bg-red-999 hover:opacity-90"
            }`}
          >
            <Trash2 size={16} />
            {submitting ? "Removing..." : "Remove Sponsor"}
          </button>
        </div>
      </form>
    </div>
  );
}
