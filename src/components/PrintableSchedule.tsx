'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import SchedulePDF, { ScheduleDay, PDFOptions } from './SchedulePDF';
import { Event } from '@/types/events';
import { EventSpeakerPublic } from '@/lib/sanity';

type PrintableScheduleProps = {
  schedule: ScheduleDay[];
  event: Event;
  sanitySpeakers?: EventSpeakerPublic[] | null;
};

const defaultOptions: PDFOptions = {
  showSpeakers: true,
  showLocations: true,
  showDescriptions: true,
  showSpeakerPhotos: true,
  showSponsorBadges: true,
  columnLayout: 'single',
  selectedDays: [],
  pageSize: 'LETTER',
  orientation: 'portrait',
};

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({
  schedule,
  event,
  sanitySpeakers,
}) => {
  const [options, setOptions] = useState<PDFOptions>({
    ...defaultOptions,
    selectedDays: schedule.map((_, idx) => idx),
  });
  const [showPreview, setShowPreview] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImagePosition, setCustomImagePosition] = useState<'header' | 'footer' | 'between-days'>('header');
  const [customImageHeight, setCustomImageHeight] = useState(60);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // build sanity speaker lookup map
  const sanitySpeakerMap = useMemo(() => {
    const map = new Map<string, EventSpeakerPublic>();
    if (sanitySpeakers) {
      sanitySpeakers.forEach(s => {
        if (s.speakerSlug) map.set(s.speakerSlug, s);
      });
    }
    return map;
  }, [sanitySpeakers]);

  const updateOption = <K extends keyof PDFOptions>(key: K, value: PDFOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (dayIndex: number) => {
    setOptions(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayIndex)
        ? prev.selectedDays.filter(d => d !== dayIndex)
        : [...prev.selectedDays, dayIndex].sort((a, b) => a - b),
    }));
  };

  const addCustomImage = () => {
    if (!customImageUrl.trim()) return;
    const newImage = {
      position: customImagePosition,
      url: customImageUrl.trim(),
      height: customImageHeight,
    };
    setOptions(prev => ({
      ...prev,
      customImages: [...(prev.customImages || []), newImage],
    }));
    setCustomImageUrl('');
  };

  const removeCustomImage = (index: number) => {
    setOptions(prev => ({
      ...prev,
      customImages: prev.customImages?.filter((_, idx) => idx !== index),
    }));
  };

  const pdfDocument = (
    <SchedulePDF
      schedule={schedule}
      eventTitle={event.title}
      eventDate={event.date}
      eventLocation={event.venueName}
      options={options}
      sanitySpeakerMap={sanitySpeakerMap}
    />
  );

  const fileName = `${event.eventShorthand}-schedule.pdf`;

  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-navy-800 mb-6">Printable Schedule Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* options panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* content options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Content Options</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showSpeakers}
                  onChange={e => updateOption('showSpeakers', e.target.checked)}
                  className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100"
                />
                <span className="text-gray-700">Show Speakers</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showSpeakerPhotos}
                  onChange={e => updateOption('showSpeakerPhotos', e.target.checked)}
                  disabled={!options.showSpeakers}
                  className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100 disabled:opacity-50"
                />
                <span className={`${!options.showSpeakers ? 'text-gray-400' : 'text-gray-700'}`}>
                  Show Speaker Photos
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showSponsorBadges}
                  onChange={e => updateOption('showSponsorBadges', e.target.checked)}
                  disabled={!options.showSpeakers}
                  className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100 disabled:opacity-50"
                />
                <span className={`${!options.showSpeakers ? 'text-gray-400' : 'text-gray-700'}`}>
                  Show Sponsor Badges
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showLocations}
                  onChange={e => updateOption('showLocations', e.target.checked)}
                  className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100"
                />
                <span className="text-gray-700">Show Locations</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showDescriptions}
                  onChange={e => updateOption('showDescriptions', e.target.checked)}
                  className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100"
                />
                <span className="text-gray-700">Show Descriptions</span>
              </label>
            </div>
          </div>

          {/* layout options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Layout Options</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Column Layout</label>
                <select
                  value={options.columnLayout}
                  onChange={e => updateOption('columnLayout', e.target.value as 'single' | 'two')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                >
                  <option value="single">Single Column</option>
                  <option value="two">Two Columns</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select
                  value={options.pageSize}
                  onChange={e => updateOption('pageSize', e.target.value as 'LETTER' | 'A4')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                >
                  <option value="LETTER">Letter (8.5" x 11")</option>
                  <option value="A4">A4 (210mm x 297mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                <select
                  value={options.orientation}
                  onChange={e => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* day selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Select Days</h2>

            <div className="space-y-2">
              {schedule.map((day, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.selectedDays.includes(idx)}
                    onChange={() => toggleDay(idx)}
                    className="w-4 h-4 text-sb-100 rounded focus:ring-sb-100"
                  />
                  <span className="text-gray-700">{day.date}</span>
                </label>
              ))}
            </div>
          </div>

          {/* custom title/subtitle */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Custom Title</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={options.customTitle || ''}
                  onChange={e => updateOption('customTitle', e.target.value || undefined)}
                  placeholder={event.title}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle (optional)</label>
                <input
                  type="text"
                  value={options.customSubtitle || ''}
                  onChange={e => updateOption('customSubtitle', e.target.value || undefined)}
                  placeholder={event.date}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                />
              </div>
            </div>
          </div>

          {/* custom images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Custom Images</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={customImagePosition}
                    onChange={e => setCustomImagePosition(e.target.value as 'header' | 'footer' | 'between-days')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                  >
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="between-days">Between Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={customImageHeight}
                    onChange={e => setCustomImageHeight(Number(e.target.value))}
                    min={20}
                    max={200}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sb-100 focus:border-sb-100"
                  />
                </div>
              </div>

              <button
                onClick={addCustomImage}
                disabled={!customImageUrl.trim()}
                className="w-full bg-sb-100 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Image
              </button>

              {options.customImages && options.customImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Added Images:</p>
                  {options.customImages.map((img, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                      <span className="truncate flex-1">{img.position}: {img.url.slice(0, 30)}...</span>
                      <button
                        onClick={() => removeCustomImage(idx)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* preview and download panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-800">Preview & Download</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>

                <PDFDownloadLink
                  document={pdfDocument}
                  fileName={fileName}
                  className="bg-navy-800 text-white py-2 px-4 rounded-md hover:bg-navy-500 transition-colors inline-flex items-center gap-2"
                >
                  {({ loading }) => (loading ? 'Generating...' : '⬇ Download PDF')}
                </PDFDownloadLink>
              </div>
            </div>

            {options.selectedDays.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-4">
                Please select at least one day to include in the PDF.
              </div>
            )}

            {showPreview && options.selectedDays.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '700px' }}>
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                  {pdfDocument}
                </PDFViewer>
              </div>
            )}

            {!showPreview && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-gray-500">Click "Show Preview" to see the PDF preview</p>
                <p className="text-gray-400 text-sm mt-2">Or download directly using the button above</p>
              </div>
            )}

            {/* print button using BlobProvider */}
            <div className="mt-4 flex justify-end">
              <BlobProvider document={pdfDocument}>
                {({ url, loading }) => (
                  <button
                    onClick={() => {
                      if (url) {
                        const printWindow = window.open(url);
                        if (printWindow) {
                          printWindow.onload = () => {
                            printWindow.print();
                          };
                        }
                      }
                    }}
                    disabled={loading || options.selectedDays.length === 0}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    {loading ? 'Preparing...' : '🖨 Print PDF'}
                  </button>
                )}
              </BlobProvider>
            </div>
          </div>

          {/* quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-navy-800">
                {options.selectedDays.length}
              </div>
              <div className="text-sm text-gray-500">Days Selected</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-navy-800">
                {schedule
                  .filter((_, idx) => options.selectedDays.includes(idx))
                  .reduce((acc, day) => acc + day.items.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Schedule Items</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-navy-800">
                {schedule
                  .filter((_, idx) => options.selectedDays.includes(idx))
                  .reduce((acc, day) => acc + day.items.reduce((a, item) => a + (item.speakers?.length || 0), 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Speakers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableSchedule;
