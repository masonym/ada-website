"use client";

import { useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { EVENTS } from "@/constants/events";
import {
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
  getExhibitorsForEvent,
} from "@/lib/registration-adapters";
import { AlertTriangle, CheckCircle, Mail, Search, Send } from "lucide-react";

type LookedUpOrder = {
  orderId: string;
  eventId: string;
  eventTitle: string;
  createdAt?: string;
  purchaser: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  tickets: Array<{
    ticketId: string;
    ticketName: string;
    quantity: number;
    attendees: Array<{ name: string; email: string }>;
  }>;
};

type Feedback = { text: string; type: "success" | "error" | "info" };

const emptyContact = {
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  company: "",
  phone: "",
};

export default function ResendConfirmationPage() {
  const [orderId, setOrderId] = useState("");

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [order, setOrder] = useState<LookedUpOrder | null>(null);
  // Set once a lookup returns nothing, which unlocks the manual event/ticket
  // pickers for comped and $0 registrations.
  const [manualMode, setManualMode] = useState(false);

  const [manualEventId, setManualEventId] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  const [contact, setContact] = useState(emptyContact);
  const [copyEventsInbox, setCopyEventsInbox] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Admins who logged in before the session cookie existed - or whose cookie has
  // aged out - still pass the localStorage gate, so surface a re-login prompt.
  const [needsRelogin, setNeedsRelogin] = useState(false);

  const manualTicketOptions = useMemo(() => {
    if (!manualEventId) return [];
    return [
      ...getRegistrationsForEvent(manualEventId),
      ...getSponsorshipsForEvent(manualEventId),
      ...getExhibitorsForEvent(manualEventId),
    ];
  }, [manualEventId]);

  const resetResult = () => {
    setOrder(null);
    setManualMode(false);
    setManualEventId("");
    setSelectedTicketIds([]);
  };

  const toggleTicket = (ticketId: string) => {
    setSelectedTicketIds((current) =>
      current.includes(ticketId)
        ? current.filter((id) => id !== ticketId)
        : [...current, ticketId],
    );
  };

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setFeedback({ text: "Order ID is required", type: "error" });
      return;
    }

    setIsLookingUp(true);
    setFeedback(null);
    setNeedsRelogin(false);
    resetResult();

    try {
      const response = await fetch(
        `/api/admin/resend-confirmation?orderId=${encodeURIComponent(orderId.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setNeedsRelogin(response.status === 401);
        setFeedback({ text: data.error || "Lookup failed", type: "error" });
        return;
      }

      if (!data.found) {
        setManualMode(true);
        setFeedback({ text: data.message, type: "info" });
        return;
      }

      setOrder(data.order);
      setSelectedTicketIds(
        data.order.tickets.map((t: { ticketId: string }) => t.ticketId),
      );
    } catch (error) {
      setFeedback({
        text: "Lookup failed - check the console for details",
        type: "error",
      });
      console.error("Lookup error:", error);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();

    if (!contact.firstName || !contact.lastName || !contact.email) {
      setFeedback({
        text: "First name, last name and email are required",
        type: "error",
      });
      return;
    }
    if (selectedTicketIds.length === 0) {
      setFeedback({ text: "Select at least one ticket type", type: "error" });
      return;
    }
    if (manualMode && !manualEventId) {
      setFeedback({ text: "Select an event", type: "error" });
      return;
    }

    const confirmed = window.confirm(
      `Send the ${order?.eventTitle ?? EVENTS.find((ev) => ev.id.toString() === manualEventId)?.title ?? "event"} confirmation to ${contact.email}?`,
    );
    if (!confirmed) return;

    setIsSending(true);
    setFeedback(null);
    setNeedsRelogin(false);

    try {
      const response = await fetch("/api/admin/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          ...contact,
          eventId: manualMode ? manualEventId : undefined,
          ticketIds: selectedTicketIds,
          copyEventsInbox,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setNeedsRelogin(response.status === 401);
        setFeedback({ text: data.error || "Send failed", type: "error" });
        return;
      }

      setFeedback({
        text: `Confirmation sent to ${data.sentTo}${data.copySent ? " (copy sent to events@)" : ""}`,
        type: "success",
      });
      setContact(emptyContact);
    } catch (error) {
      setFeedback({
        text: "Send failed - check the console for details",
        type: "error",
      });
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const readyToSend = Boolean(order) || manualMode;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Resend Confirmation</h1>
              <p className="text-gray-300 mt-1">
                Send a registration confirmation to a new contact, e.g. when the
                attendee on an order has changed. No pricing or receipt is
                included.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Step 1: find the order */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            1. Find the order
          </h2>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This page sends live email to real inboxes. Double-check the
              address before sending - there is no undo.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label
                htmlFor="orderId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order ID
              </label>
              <div className="flex gap-2">
                <input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="pi_3Ab... or ORDER-1234567890-123"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLookingUp}
                  className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 ${
                    isLookingUp
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {isLookingUp ? "Looking up..." : "Look up"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The Stripe payment intent ID for paid orders. Comped orders are
                not stored - look them up and you will get the manual form
                instead.
              </p>
            </div>
          </form>
        </section>

        {feedback && (
          <div
            className={`p-4 rounded-md flex items-start gap-3 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800"
                : feedback.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span>
              {feedback.text}
              {needsRelogin && (
                <>
                  {" "}
                  <Link
                    href={`/admin/login?returnUrl=${encodeURIComponent("/admin/resend-confirmation")}`}
                    className="underline font-medium"
                  >
                    Log in again
                  </Link>
                </>
              )}
            </span>
          </div>
        )}

        {/* Step 2: confirm what is being sent */}
        {order && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">2. Order found</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5">
              <div>
                <dt className="text-gray-500">Event</dt>
                <dd className="text-gray-900 font-medium">
                  {order.eventTitle}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Purchased</dt>
                <dd className="text-gray-900">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Billing contact</dt>
                <dd className="text-gray-900">
                  {order.purchaser.firstName} {order.purchaser.lastName} (
                  {order.purchaser.email})
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Company</dt>
                <dd className="text-gray-900">
                  {order.purchaser.company || "-"}
                </dd>
              </div>
            </dl>

            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Ticket types to base the email on
            </h3>
            <div className="space-y-2">
              {order.tickets.map((ticket) => (
                <label
                  key={ticket.ticketId}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedTicketIds.includes(ticket.ticketId)}
                    onChange={() => toggleTicket(ticket.ticketId)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-gray-900">
                      {ticket.ticketName}
                    </span>
                    <span className="text-gray-500"> x{ticket.quantity}</span>
                    {ticket.attendees.length > 0 && (
                      <span className="block text-gray-500 mt-1">
                        Original attendees:{" "}
                        {ticket.attendees
                          .map((a) => `${a.name} <${a.email}>`)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The email template is chosen from the highest tier selected
              (sponsor &gt; exhibitor &gt; VIP &gt; gov/mil &gt; standard).
            </p>
          </section>
        )}

        {/* Manual fallback for orders that were never stored */}
        {manualMode && (
          <section className="bg-white rounded-xl border border-amber-300 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">
              2. Manual entry
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This order is not in storage, so pick the event and ticket type by
              hand. The order ID you typed is still printed on the email.
            </p>

            <div className="mb-4">
              <label
                htmlFor="event"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event
              </label>
              <select
                id="event"
                value={manualEventId}
                onChange={(e) => {
                  setManualEventId(e.target.value);
                  setSelectedTicketIds([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an event</option>
                {EVENTS.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {manualEventId && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ticket type
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {manualTicketOptions.map((ticket) => (
                    <label
                      key={ticket.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTicketIds.includes(ticket.id)}
                        onChange={() => toggleTicket(ticket.id)}
                      />
                      <span className="text-sm">
                        <span className="font-medium text-gray-900">
                          {ticket.title}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {ticket.category}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 3: the new contact */}
        {readyToSend && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">3. New contact</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    ["firstName", "First name", true],
                    ["lastName", "Last name", true],
                    ["email", "Email", true],
                    ["jobTitle", "Job title", false],
                    ["company", "Company", false],
                    ["phone", "Phone", false],
                  ] as const
                ).map(([field, label, required]) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {label}
                      {!required && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          (optional)
                        </span>
                      )}
                    </label>
                    <input
                      id={field}
                      type={field === "email" ? "email" : "text"}
                      value={contact[field]}
                      onChange={(e) =>
                        setContact({ ...contact, [field]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={required}
                    />
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={copyEventsInbox}
                  onChange={(e) => setCopyEventsInbox(e.target.checked)}
                />
                Also send a copy to events@americandefensealliance.org
              </label>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  This sends one email to the address above only. The original
                  attendees are not contacted, and nothing in Stripe, Google
                  Sheets or the database is changed - update the registration
                  sheet separately if the swap needs to be on record.
                </p>
                <button
                  type="submit"
                  disabled={isSending}
                  className={`px-6 py-3 rounded-md text-white font-medium flex items-center gap-2 ${
                    isSending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "Sending..." : "Send confirmation"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
