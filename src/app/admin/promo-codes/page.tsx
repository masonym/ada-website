"use client";

import { useState, useEffect } from "react";
import { EVENTS } from "@/constants/events";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Tag, 
  Percent, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  X,
  Zap
} from "lucide-react";

type SanityPromoCode = {
  _id: string;
  code: string;
  discountPercentage: number;
  eligibleTicketTypes: string[];
  eligibleEventIds: number[];
  expirationDate: string;
  description?: string;
  isActive: boolean;
  autoApply: boolean;
};

const TICKET_TYPES = [
  { id: 'attendee-pass', label: 'Attendee Pass' },
  { id: 'vip-attendee-pass', label: 'VIP Attendee Pass' },
  { id: 'exhibit', label: 'Exhibit' },
  { id: 'platinum-sponsor', label: 'Platinum Sponsor' },
  { id: 'gold-sponsor', label: 'Gold Sponsor' },
  { id: 'silver-sponsor', label: 'Silver Sponsor' },
  { id: 'bronze-sponsor', label: 'Bronze Sponsor' },
  { id: 'vip-networking-reception-sponsor', label: 'VIP Networking Reception Sponsor' },
  { id: 'networking-luncheon-sponsor', label: 'Networking Luncheon Sponsor' },
  { id: 'small-business-sponsor', label: 'Small Business Sponsor' },
  { id: 'small-business-sponsor-without-exhibit-space', label: 'Small Business Sponsor (No Exhibit)' },
  { id: 'additional-exhibitor-attendee-pass', label: 'Additional Exhibitor Attendee Pass' },
  { id: 'additional-sponsor-attendee-pass', label: 'Additional Sponsor Attendee Pass' },
];

const getEventName = (eventId: number): string => {
  const event = EVENTS.find(e => e.id === eventId);
  return event ? event.title : `Event ID: ${eventId}`;
};

const isExpired = (expirationDate: string): boolean => {
  return new Date() > new Date(expirationDate);
};

const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const formatDateForInput = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<SanityPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<SanityPromoCode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState(10);
  const [formTicketTypes, setFormTicketTypes] = useState<string[]>([]);
  const [formEventIds, setFormEventIds] = useState<number[]>([]);
  const [formExpiration, setFormExpiration] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAutoApply, setFormAutoApply] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  async function fetchPromoCodes() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch promo codes' });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormCode('');
    setFormDiscount(10);
    setFormTicketTypes([]);
    setFormEventIds([]);
    setFormExpiration('');
    setFormDescription('');
    setFormIsActive(true);
    setFormAutoApply(false);
  }

  function openCreateModal() {
    resetForm();
    setFormTicketTypes(TICKET_TYPES.slice(0, 11).map(t => t.id));
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    setFormExpiration(oneYear.toISOString().slice(0, 16));
    setShowCreateModal(true);
  }

  function openEditModal(promo: SanityPromoCode) {
    setFormCode(promo.code);
    setFormDiscount(promo.discountPercentage);
    setFormTicketTypes(promo.eligibleTicketTypes);
    setFormEventIds(promo.eligibleEventIds);
    setFormExpiration(formatDateForInput(promo.expirationDate));
    setFormDescription(promo.description || '');
    setFormIsActive(promo.isActive);
    setFormAutoApply(promo.autoApply);
    setEditingPromo(promo);
  }

  async function handleCreate() {
    if (!formCode || !formDiscount || formTicketTypes.length === 0 || formEventIds.length === 0 || !formExpiration) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          code: formCode,
          discountPercentage: formDiscount,
          eligibleTicketTypes: formTicketTypes,
          eligibleEventIds: formEventIds,
          expirationDate: new Date(formExpiration).toISOString(),
          description: formDescription,
          isActive: formIsActive,
          autoApply: formAutoApply,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Promo code created successfully' });
        setShowCreateModal(false);
        resetForm();
        fetchPromoCodes();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to create promo code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create promo code' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingPromo) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          promoCodeId: editingPromo._id,
          updates: {
            discountPercentage: formDiscount,
            eligibleTicketTypes: formTicketTypes,
            eligibleEventIds: formEventIds,
            expirationDate: new Date(formExpiration).toISOString(),
            description: formDescription,
            isActive: formIsActive,
            autoApply: formAutoApply,
          },
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Promo code updated successfully' });
        setEditingPromo(null);
        resetForm();
        fetchPromoCodes();
      } else {
        setMessage({ type: 'error', text: 'Failed to update promo code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update promo code' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(promoId: string, currentActive: boolean) {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', promoCodeId: promoId, isActive: !currentActive }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Promo code ${!currentActive ? 'activated' : 'deactivated'}` });
        fetchPromoCodes();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle promo code' });
    }
  }

  async function handleDelete(promoId: string) {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', promoCodeId: promoId }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Promo code deleted' });
        setDeleteConfirm(null);
        fetchPromoCodes();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete promo code' });
    }
  }

  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    switch (filter) {
      case 'active': return promo.isActive && !isExpired(promo.expirationDate);
      case 'expired': return isExpired(promo.expirationDate);
      case 'inactive': return !promo.isActive;
      default: return true;
    }
  });

  const getStatusBadge = (promo: SanityPromoCode) => {
    if (!promo.isActive) {
      return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</span>);
    }
    if (isExpired(promo.expirationDate)) {
      return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Expired</span>);
    }
    return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</span>);
  };

  const groupedPromoCodes: { [eventId: string]: SanityPromoCode[] } = {};
  filteredPromoCodes.forEach(promo => {
    promo.eligibleEventIds.forEach(eventId => {
      const key = eventId.toString();
      if (!groupedPromoCodes[key]) groupedPromoCodes[key] = [];
      if (!groupedPromoCodes[key].find(p => p._id === promo._id)) groupedPromoCodes[key].push(promo);
    });
  });
  const sortedEventIds = Object.keys(groupedPromoCodes).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Promo Code Management</h1>
              <p className="text-gray-300 mt-2">Create, edit, and manage discount codes</p>
            </div>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-5 h-5" />Create Promo Code
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:w-auto flex items-end">
              <button onClick={fetchPromoCodes} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4 flex items-center"><Tag className="w-8 h-8 text-blue-500" /><div className="ml-3"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{promoCodes.length}</p></div></div>
          <div className="bg-white rounded-xl border p-4 flex items-center"><CheckCircle className="w-8 h-8 text-green-500" /><div className="ml-3"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold">{promoCodes.filter(p => p.isActive && !isExpired(p.expirationDate)).length}</p></div></div>
          <div className="bg-white rounded-xl border p-4 flex items-center"><Clock className="w-8 h-8 text-red-500" /><div className="ml-3"><p className="text-sm text-gray-600">Expired</p><p className="text-2xl font-bold">{promoCodes.filter(p => isExpired(p.expirationDate)).length}</p></div></div>
          <div className="bg-white rounded-xl border p-4 flex items-center"><XCircle className="w-8 h-8 text-gray-500" /><div className="ml-3"><p className="text-sm text-gray-600">Inactive</p><p className="text-2xl font-bold">{promoCodes.filter(p => !p.isActive).length}</p></div></div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border p-12 text-center"><RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" /><p>Loading...</p></div>
        ) : sortedEventIds.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center"><Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">No promo codes</h3><button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 inline mr-2" />Create</button></div>
        ) : (
          <div className="space-y-6">
            {sortedEventIds.map(eventId => (
              <div key={eventId} className="bg-white rounded-xl border overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b"><h2 className="text-lg font-semibold">{getEventName(parseInt(eventId))}</h2><p className="text-sm text-gray-600">{groupedPromoCodes[eventId].length} codes</p></div>
                <div className="divide-y">
                  {groupedPromoCodes[eventId].map(promo => (
                    <div key={promo._id} className="p-6 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-mono font-semibold">{promo.code}</h3>
                          {getStatusBadge(promo)}
                          {promo.autoApply && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Zap className="w-3 h-3 mr-1" />Auto</span>}
                        </div>
                        <p className="text-gray-600 mb-3">{promo.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span><Percent className="w-4 h-4 inline mr-1" />{promo.discountPercentage}%</span>
                          <span><Calendar className="w-4 h-4 inline mr-1" />{formatDate(promo.expirationDate)}</span>
                          <span><Tag className="w-4 h-4 inline mr-1" />{promo.eligibleTicketTypes.length} types</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => openEditModal(promo)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleToggle(promo._id, promo.isActive)} className={`p-2 rounded-lg ${promo.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}>{promo.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        <button onClick={() => setDeleteConfirm(promo._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showCreateModal || editingPromo) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingPromo ? 'Edit' : 'Create'} Promo Code</h2>
              <button onClick={() => { setShowCreateModal(false); setEditingPromo(null); resetForm(); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div><label className="block text-sm font-medium mb-1">Code *</label><input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} disabled={!!editingPromo} className="w-full px-3 py-2 border rounded-lg font-mono uppercase disabled:bg-gray-100" placeholder="SAVE20" /></div>
              <div><label className="block text-sm font-medium mb-1">Discount % *</label><input type="number" min="1" max="100" value={formDiscount} onChange={(e) => setFormDiscount(parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Events *</label><div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">{EVENTS.filter(e => e.id > 0).map(event => (<label key={event.id} className="flex items-center gap-2"><input type="checkbox" checked={formEventIds.includes(event.id)} onChange={(e) => e.target.checked ? setFormEventIds([...formEventIds, event.id]) : setFormEventIds(formEventIds.filter(id => id !== event.id))} className="rounded" /><span className="text-sm">{event.title}</span></label>))}</div></div>
              <div><label className="block text-sm font-medium mb-2">Ticket Types *</label><div className="flex gap-2 mb-2"><button type="button" onClick={() => setFormTicketTypes(TICKET_TYPES.map(t => t.id))} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">All</button><button type="button" onClick={() => setFormTicketTypes([])} className="text-xs px-2 py-1 bg-gray-100 rounded">Clear</button></div><div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">{TICKET_TYPES.map(t => (<label key={t.id} className="flex items-center gap-2"><input type="checkbox" checked={formTicketTypes.includes(t.id)} onChange={(e) => e.target.checked ? setFormTicketTypes([...formTicketTypes, t.id]) : setFormTicketTypes(formTicketTypes.filter(id => id !== t.id))} className="rounded" /><span className="text-sm">{t.label}</span></label>))}</div></div>
              <div><label className="block text-sm font-medium mb-1">Expiration *</label><input type="datetime-local" value={formExpiration} onChange={(e) => setFormExpiration(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="flex gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="rounded" /><span className="text-sm">Active</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={formAutoApply} onChange={(e) => setFormAutoApply(e.target.checked)} className="rounded" /><span className="text-sm">Auto-Apply</span></label></div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); setEditingPromo(null); resetForm(); }} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={editingPromo ? handleUpdate : handleCreate} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{submitting ? 'Saving...' : (editingPromo ? 'Update' : 'Create')}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Promo Code?</h3>
            <p className="text-gray-600 mb-6">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
