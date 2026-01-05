'use client'

import { useState } from 'react'
import { Download, Copy, Eye } from 'lucide-react'

const EventLaunchForm = () => {
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    // Event Overview
    eventName: '',
    targetLaunchDate: '',
    eventTitle: '',
    eventShorthand: '',
    displayDate: '',
    startDateTime: '',
    endDateTime: '',
    eventStatus: 'draft',
    password: '',
    shortDescription: '',
    detailedOverview: '',
    
    // Featured Topics
    featuredTopicsTitle: '',
    featuredTopicsSubtitle: '',
    
    // Audience
    targetAudience: '',
    whatToExpect: '',
    
    // Testimonials
    useTestimonialsFromAnotherEvent: false,
    eventToBorrowFrom: '',
    testimonials: [
      {
        name: '',
        title: '',
        company: '',
        quote: '',
        type: 'text',
        videoIdOrUrl: ''
      }
    ],
    
    // Venue
    venueName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    googleMapsPlaceId: '',
    venuePhotoUploaded: false,
    heroEventImageUploaded: false,
    directionsNeeded: '',
    
    // Parking
    parkingOptions: [
      {
        title: '',
        details: '',
        reservationLink: ''
      }
    ],
    parkingBoxText: '',
    parkingBoxImagePlaceholder: '',
    
    // Hotel
    groupRateAvailable: false,
    hotelName: '',
    hotelAddress: '',
    hotelPhone: '',
    groupRate: '',
    rateDates: '',
    cutOffDate: '',
    reservationLink: '',
    hotelPhotoUploaded: false,
    
    // Special Events
    vipNetworkingReception: false,
    vipDate: '',
    vipTime: '',
    vipLocation: '',
    vipDescription: '',
    matchmakingSessions: false,
    matchmakingSignUpDate: '',
    matchmakingSignUpTime: '',
    matchmakingSessionDuration: '',
    matchmakingSlotsPerHost: '',
    matchmakingSessionTimes: '',
    
    // Registration Types
    registrationTypes: [
      {
        title: '',
        price: '',
        earlyBirdPrice: '',
        earlyBirdDeadline: '',
        perks: ['', '', '', ''],
        maxQuantityPerOrder: '',
        buttonText: ''
      }
    ],
    
    // Government/Military Registration
    govMilTitle: '',
    govMilType: 'complimentary',
    govMilPrice: '',
    govMilPerks: ['', '', ''],
    govMilAvailabilityInfo: '',
    
    // Add-ons
    addOns: [
      {
        title: '',
        price: '',
        description: '',
        requiresCode: false,
        accessCode: ''
      }
    ],
    
    // Registration Notes
    registrationNotes: '',
    sponsorshipNotes: '',
    exhibitorNotes: '',
    faqNotes: ''
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionValue = prev[section as keyof typeof prev]
      
      // Only spread if the section value is an object (not array)
      if (sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)) {
        return {
          ...prev,
          [section]: {
            ...(sectionValue as Record<string, any>),
            [field]: value
          }
        }
      } else if (Array.isArray(sectionValue)) {
        // Handle array updates differently if needed
        return {
          ...prev,
          [section]: sectionValue.map((item, index) => 
            index === parseInt(field) ? value : item
          )
        }
      } else {
        // For primitive values, just set the value directly
        return {
          ...prev,
          [section]: value
        }
      }
    })
  }

  const handleCopyToClipboard = () => {
    const jsonString = JSON.stringify(formData, null, 2)
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('Form data copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    })
  }

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(formData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'event-launch-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderPreview = () => {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Event Launch Preview</h1>
          <pre className="bg-white p-6 rounded-lg shadow overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Event Launch Form</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Copy className="w-4 h-4" />
              Copy JSON
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
          </div>
        </div>

        {showPreview ? (
          renderPreview()
        ) : (
          <form className="space-y-8">
            {/* Event Overview */}
            <section className="bg-gray-2 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">📋 Event Overview</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Name</label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Launch Date</label>
                  <input
                    type="date"
                    value={formData.targetLaunchDate}
                    onChange={(e) => handleInputChange('targetLaunchDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Event Shorthand/Acronym</label>
                  <input
                    type="text"
                    value={formData.eventShorthand}
                    onChange={(e) => handleInputChange('eventShorthand', e.target.value)}
                    placeholder="e.g., 2025SDPC"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Date</label>
                  <input
                    type="text"
                    value={formData.displayDate}
                    onChange={(e) => handleInputChange('displayDate', e.target.value)}
                    placeholder="e.g., March 11-12, 2025"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => handleInputChange('startDateTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => handleInputChange('endDateTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Status</label>
                <select
                  value={formData.eventStatus}
                  onChange={(e) => handleInputChange('eventStatus', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for event listings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Detailed Overview</label>
                <textarea
                  value={formData.detailedOverview}
                  onChange={(e) => handleInputChange('detailedOverview', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full event description including purpose, target audience, and key topics"
                />
              </div>
            </section>

            {/* Venue & Location */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">📍 Venue & Location</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => handleInputChange('venueName', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Google Maps Place ID</label>
                <input
                  type="text"
                  value={formData.googleMapsPlaceId}
                  onChange={(e) => handleInputChange('googleMapsPlaceId', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Directions Needed</label>
                <textarea
                  value={formData.directionsNeeded}
                  onChange={(e) => handleInputChange('directionsNeeded', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What directions do we need?"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="venuePhoto"
                    checked={formData.venuePhotoUploaded}
                    onChange={(e) => handleInputChange('venuePhotoUploaded', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="venuePhoto" className="text-sm font-medium">Venue Photo Uploaded</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="heroEventImage"
                    checked={formData.heroEventImageUploaded}
                    onChange={(e) => handleInputChange('heroEventImageUploaded', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="heroEventImage" className="text-sm font-medium">Hero Event Image Uploaded</label>
                </div>
              </div>
            </section>

            {/* Registration Types */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">💳 Registration Types</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Attendee Registration</label>
                <textarea
                  value={formData.registrationNotes || ''}
                  onChange={(e) => handleInputChange('registrationNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note if any differences from previous. If any early bird discounts are to be applied, add them here as well as the expiring date."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sponsorship Opportunities</label>
                <textarea
                  value={formData.sponsorshipNotes || ''}
                  onChange={(e) => handleInputChange('sponsorshipNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note if any differences from previous. If any early bird discounts are to be applied, add them here as well as the expiring date."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exhibitor Opportunities</label>
                <textarea
                  value={formData.exhibitorNotes || ''}
                  onChange={(e) => handleInputChange('exhibitorNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note if any differences from previous. If any early bird discounts are to be applied, add them here as well as the expiring date."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Frequently Asked Questions</label>
                <textarea
                  value={formData.faqNotes || ''}
                  onChange={(e) => handleInputChange('faqNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note if any differences from previous."
                />
              </div>
            </section>

            {/* Special Events */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">🎉 Special Events</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vipReception"
                    checked={formData.vipNetworkingReception}
                    onChange={(e) => handleInputChange('vipNetworkingReception', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="vipReception" className="text-sm font-medium">VIP Networking Reception</label>
                </div>
                
                {formData.vipNetworkingReception && (
                  <div className="ml-6 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                          type="date"
                          value={formData.vipDate}
                          onChange={(e) => handleInputChange('vipDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <input
                          type="time"
                          value={formData.vipTime}
                          onChange={(e) => handleInputChange('vipTime', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.vipLocation}
                          onChange={(e) => handleInputChange('vipLocation', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={formData.vipDescription}
                        onChange={(e) => handleInputChange('vipDescription', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="matchmaking"
                    checked={formData.matchmakingSessions}
                    onChange={(e) => handleInputChange('matchmakingSessions', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="matchmaking" className="text-sm font-medium">Matchmaking Sessions</label>
                </div>
                
                {formData.matchmakingSessions && (
                  <div className="ml-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Sign-up Date</label>
                        <input
                          type="date"
                          value={formData.matchmakingSignUpDate}
                          onChange={(e) => handleInputChange('matchmakingSignUpDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sign-up Time</label>
                        <input
                          type="time"
                          value={formData.matchmakingSignUpTime}
                          onChange={(e) => handleInputChange('matchmakingSignUpTime', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Session Duration</label>
                        <input
                          type="text"
                          value={formData.matchmakingSessionDuration}
                          onChange={(e) => handleInputChange('matchmakingSessionDuration', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Slots per Host</label>
                        <input
                          type="number"
                          value={formData.matchmakingSlotsPerHost}
                          onChange={(e) => handleInputChange('matchmakingSlotsPerHost', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session Times</label>
                      <textarea
                        value={formData.matchmakingSessionTimes}
                        onChange={(e) => handleInputChange('matchmakingSessionTimes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </form>
        )}
      </div>
    </div>
  )
}

export default EventLaunchForm
