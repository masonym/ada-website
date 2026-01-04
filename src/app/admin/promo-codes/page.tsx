"use client";

import { useState, useEffect } from "react";
import { PROMO_CODES, PromoCode } from "@/lib/promo-codes";
import { EVENTS } from "@/constants/events";
import { Calendar, CheckCircle, XCircle, Tag, Percent, Clock } from "lucide-react";

// Helper function to get event name by ID
const getEventName = (eventId: number): string => {
  const event = EVENTS.find(e => e.id === eventId);
  return event ? event.title : `Event ID: ${eventId}`;
};

// Helper function to check if a promo code is expired
const isExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

// Group promo codes by event
const groupPromoCodesByEvent = (promoCodes: PromoCode[]) => {
  const grouped: { [eventId: string]: PromoCode[] } = {};
  
  promoCodes.forEach(promo => {
    promo.eligibleEventIds.forEach(eventId => {
      const key = eventId.toString();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(promo);
    });
  });
  
  // Remove duplicates within each event
  Object.keys(grouped).forEach(eventId => {
    const uniqueCodes = new Map<string, PromoCode>();
    grouped[eventId].forEach(promo => {
      if (!uniqueCodes.has(promo.code)) {
        uniqueCodes.set(promo.code, promo);
      }
    });
    grouped[eventId] = Array.from(uniqueCodes.values());
  });
  
  return grouped;
};

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPromoCodes(PROMO_CODES);
  }, []);

  // Filter promo codes based on status and search
  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'active':
        return promo.isActive && !isExpired(promo.expirationDate);
      case 'expired':
        return isExpired(promo.expirationDate);
      case 'inactive':
        return !promo.isActive;
      default:
        return true;
    }
  });

  const groupedPromoCodes = groupPromoCodesByEvent(filteredPromoCodes);
  const sortedEventIds = Object.keys(groupedPromoCodes).sort((a, b) => parseInt(b) - parseInt(a));

  const getStatusBadge = (promo: PromoCode) => {
    if (!promo.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
    
    if (isExpired(promo.expirationDate)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Promo Codes</h1>
        <p className="text-gray-600">View all promo codes categorized by event</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Promo Codes
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Codes</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900">{promoCodes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {promoCodes.filter(p => p.isActive && !isExpired(p.expirationDate)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {promoCodes.filter(p => isExpired(p.expirationDate)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {promoCodes.filter(p => !p.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Codes by Event */}
      <div className="space-y-6">
        {sortedEventIds.map(eventId => (
          <div key={eventId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-300 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {getEventName(parseInt(eventId))}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {groupedPromoCodes[eventId].length} promo code{groupedPromoCodes[eventId].length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {groupedPromoCodes[eventId].map(promo => (
                <div key={promo.code} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-mono font-semibold text-gray-900">{promo.code}</h3>
                        {getStatusBadge(promo)}
                        {promo.autoApply && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Auto-Apply
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{promo.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          {promo.discountPercentage}% off
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Expires: {formatDate(promo.expirationDate)}
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          {promo.eligibleTicketTypes.length} ticket type{promo.eligibleTicketTypes.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {promo.eligibleTicketTypes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Eligible Ticket Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {promo.eligibleTicketTypes.map(type => (
                              <span
                                key={type}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredPromoCodes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No promo codes found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No promo codes match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
}
