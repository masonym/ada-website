"use client";

import { useState, useEffect } from "react";
import { Upload, Plus, Check, AlertCircle, Building2, Link as LinkIcon, Layers } from "lucide-react";

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

export default function SponsorAdminPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([]);
  const [existingSponsors, setExistingSponsors] = useState<ExistingSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // new sponsor form
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);

  // existing sponsor form
  const [mode, setMode] = useState<"new" | "existing" | "tier">("new");
  const [selectedExistingSponsorId, setSelectedExistingSponsorId] = useState<string>("");

  // new tier form
  const [newTierEventId, setNewTierEventId] = useState<number | null>(null);
  const [newTierId, setNewTierId] = useState("");
  const [newTierName, setNewTierName] = useState("");
  const [newTierStyle, setNewTierStyle] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/sponsors");
      const data = await res.json();
      setEvents(data.events || []);
      setExistingSponsors(data.sponsors || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleTierToggle(tierId: string) {
    setSelectedTierIds((prev) =>
      prev.includes(tierId)
        ? prev.filter((id) => id !== tierId)
        : [...prev, tierId]
    );
  }

  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !logo || !selectedEventId || selectedTierIds.length === 0) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (website) formData.append("website", website);
      if (description) formData.append("description", description);
      formData.append("logo", logo);
      formData.append("eventId", selectedEventId.toString());
      selectedTierIds.forEach((id) => formData.append("tierIds", id));

      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        // reset form
        setName("");
        setWebsite("");
        setDescription("");
        setLogo(null);
        setLogoPreview(null);
        setSelectedTierIds([]);
        // refresh sponsors list
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create sponsor" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExistingSponsorId || !selectedEventId || selectedTierIds.length === 0) {
      setMessage({ type: "error", text: "Please select a sponsor, event, and at least one tier" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/sponsors/add-existing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: selectedExistingSponsorId,
          eventId: selectedEventId,
          tierIds: selectedTierIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setSelectedExistingSponsorId("");
        setSelectedTierIds([]);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add sponsor" });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  async function handleSubmitTier(e: React.FormEvent) {
    e.preventDefault();
    if (!newTierEventId || !newTierId || !newTierName) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/sponsors/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: newTierEventId,
          tierId: newTierId,
          tierName: newTierName,
          tierStyle: newTierStyle || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setNewTierId("");
        setNewTierName("");
        setNewTierStyle("");
        // refresh to get new tier
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create tier" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sponsor Management</h1>
          <p className="text-gray-600 mt-2">
            Add sponsors and assign them to event tiers in one step
          </p>
        </div>

        {/* mode toggle */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex">
          <button
            onClick={() => setMode("new")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "new"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="inline-block w-4 h-4 mr-1" />
            New Sponsor
          </button>
          <button
            onClick={() => setMode("existing")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "existing"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Building2 className="inline-block w-4 h-4 mr-1" />
            Existing Sponsor
          </button>
          <button
            onClick={() => setMode("tier")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "tier"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Layers className="inline-block w-4 h-4 mr-1" />
            New Tier
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          {mode === "new" && (
            <form onSubmit={handleSubmitNew} className="space-y-6">
              {/* sponsor info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Defense Corp"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Only add this for featured sponsors!"
                />
              </div>

              {/* logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo *
                </label>
                <div className="flex items-start gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {logo ? logo.name : "Click to upload logo"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG, WebP</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <div className="w-32 h-24 border rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* event selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event *
                </label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedTierIds([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event._id} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* tier selection */}
              {selectedEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiers * <span className="text-gray-400 font-normal">(select multiple)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedEvent.tiers.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleTierToggle(tier.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          selectedTierIds.includes(tier.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {selectedTierIds.includes(tier.id) && (
                          <Check className="inline-block w-4 h-4 mr-1" />
                        )}
                        {tier.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creating..." : "Create Sponsor & Add to Event"}
              </button>
            </form>
          )}

          {mode === "existing" && (
            <form onSubmit={handleSubmitExisting} className="space-y-6">
              {/* existing sponsor selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Sponsor *
                </label>
                <select
                  value={selectedExistingSponsorId}
                  onChange={(e) => setSelectedExistingSponsorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a sponsor...</option>
                  {existingSponsors.map((sponsor) => (
                    <option key={sponsor._id} value={sponsor._id}>
                      {sponsor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* event selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event *
                </label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedTierIds([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event._id} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* tier selection */}
              {selectedEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiers * <span className="text-gray-400 font-normal">(select multiple)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedEvent.tiers.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleTierToggle(tier.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          selectedTierIds.includes(tier.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {selectedTierIds.includes(tier.id) && (
                          <Check className="inline-block w-4 h-4 mr-1" />
                        )}
                        {tier.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Adding..." : "Add Sponsor to Event"}
              </button>
            </form>
          )}

          {mode === "tier" && (
            <form onSubmit={handleSubmitTier} className="space-y-6">
              {/* event selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event *
                </label>
                <select
                  value={newTierEventId || ""}
                  onChange={(e) => setNewTierEventId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event._id} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier ID *
                  </label>
                  <input
                    type="text"
                    value={newTierId}
                    onChange={(e) => setNewTierId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="small-business-sponsor"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Lowercase with dashes, e.g., "small-business-sponsor"</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier Name *
                  </label>
                  <input
                    type="text"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Small Business Sponsors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style Classes (optional)
                </label>
                <input
                  type="text"
                  value={newTierStyle}
                  onChange={(e) => setNewTierStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="bg-sb-100 text-slate-900"
                />
                <p className="text-xs text-gray-400 mt-1">Tailwind classes for tier badge styling</p>
              </div>

              <div className="bg-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Common Tier Styles</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><code className="bg-amber-400 text-slate-900 px-1 rounded">bg-amber-400 text-slate-900</code> Gold</div>
                  <div><code className="bg-gray-300 text-slate-900 px-1 rounded">bg-gray-300 text-slate-900</code> Silver</div>
                  <div><code className="bg-amber-700 text-slate-900 px-1 rounded">bg-amber-700 text-slate-900</code> Bronze</div>
                  <div><code className="bg-sky-300 text-slate-900 px-1 rounded">bg-sky-300 text-slate-900</code> Platinum</div>
                  <div><code className="bg-sb-100 text-slate-900 px-1 rounded">bg-sb-100 text-slate-900</code> Small Business</div>
                  <div><code className="bg-navy-800 text-white px-1 rounded">bg-navy-800 text-white</code> Exhibitors</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creating..." : "Create Tier"}
              </button>
            </form>
          )}
        </div>

        {/* quick reference */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Select multiple tiers to add a sponsor to both "Small Business" and "Exhibitors" at once</li>
            <li>Use "Existing Sponsor" mode to add a sponsor that's already in the system to a new event</li>
            <li>Changes appear on the website within a few minutes (CDN cache)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
