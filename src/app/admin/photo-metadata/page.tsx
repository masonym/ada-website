'use client';

import React, { useState } from 'react';
import { EVENTS } from '@/constants/events';

interface PhotoFile {
  name: string;
  section: string;
  alt: string;
  caption: string;
  people: string;
  tags: string;
  width: number;
  height: number;
  featured: boolean;
}

export default function PhotoMetadataManager() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const photoFiles: PhotoFile[] = [];
    
    Array.from(files).forEach(file => {
      // Extract section from file path or name
      const pathParts = file.webkitRelativePath.split('/');
      const section = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'general';
      
      // Generate default alt text from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const defaultAlt = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      photoFiles.push({
        name: file.name,
        section: section.toLowerCase(),
        alt: `${defaultAlt} - ${section}`,
        caption: '',
        people: '',
        tags: section.toLowerCase(),
        width: 1600,
        height: 1200,
        featured: false,
      });
    });

    setPhotos(photoFiles);
  };

  const updatePhoto = (index: number, field: keyof PhotoFile, value: string | number | boolean) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value };
    setPhotos(updatedPhotos);
  };

  const generateMetadataJson = () => {
    if (!selectedEvent) return;

    const event = EVENTS.find(e => e.eventShorthand === selectedEvent);
    if (!event) return;

    // Group photos by section
    const sections: Record<string, any> = {};
    
    photos.forEach(photo => {
      if (!sections[photo.section]) {
        sections[photo.section] = {
          title: photo.section.split(/[-_]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          layout: photo.section.toLowerCase().includes('speaker') ? 'carousel' : 'masonry',
          photos: {}
        };
      }

      sections[photo.section].photos[photo.name] = {
        alt: photo.alt,
        caption: photo.caption || undefined,
        people: photo.people ? photo.people.split(',').map(p => p.trim()) : undefined,
        tags: photo.tags ? photo.tags.split(',').map(t => t.trim()) : undefined,
        width: photo.width,
        height: photo.height,
        featured: photo.featured || undefined,
      };

      // Remove undefined values
      Object.keys(sections[photo.section].photos[photo.name]).forEach(key => {
        if (sections[photo.section].photos[photo.name][key] === undefined) {
          delete sections[photo.section].photos[photo.name][key];
        }
      });
    });

    const metadata = {
      eventShorthand: selectedEvent,
      title: event.title,
      introduction: `Photo highlights from the ${event.title}`,
      sections,
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent}-metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Natural sort function for filenames with numbers
  const naturalSort = (a: string, b: string): number => {
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.match(regex) || [];
    const bParts = b.match(regex) || [];
    
    const maxLength = Math.max(aParts.length, bParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || '';
      const bPart = bParts[i] || '';
      
      // If both parts are numbers, compare numerically
      if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
        const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
        if (diff !== 0) return diff;
      } else {
        // Compare as strings
        const diff = aPart.localeCompare(bPart);
        if (diff !== 0) return diff;
      }
    }
    
    return 0;
  };

  const groupedPhotos = photos.reduce((acc, photo, index) => {
    if (!acc[photo.section]) {
      acc[photo.section] = [];
    }
    acc[photo.section].push({ ...photo, index });
    return acc;
  }, {} as Record<string, Array<PhotoFile & { index: number }>>);

  // Sort photos within each section using natural sort
  Object.keys(groupedPhotos).forEach(section => {
    groupedPhotos[section].sort((a, b) => naturalSort(a.name, b.name));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Photo Metadata Manager</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Event:</label>
        <select 
          value={selectedEvent} 
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        >
          <option value="">Choose an event...</option>
          {EVENTS.map(event => (
            <option key={event.eventShorthand} value={event.eventShorthand}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Upload Photo Folders:</label>
        <input
          type="file"
          multiple
          webkitdirectory=""
          onChange={handleFileUpload}
          className="border rounded px-3 py-2"
        />
        <p className="text-sm text-gray-600 mt-1">
          Select folders containing your event photos (e.g., Speakers, Sponsors, Exhibitors)
        </p>
      </div>

      {photos.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Photos Found: {photos.length}</h2>
            <button
              onClick={generateMetadataJson}
              disabled={!selectedEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Generate metadata.json
            </button>
          </div>

          {Object.entries(groupedPhotos).map(([section, sectionPhotos]) => (
            <div key={section} className="mb-8 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 capitalize">{section} ({sectionPhotos.length} photos)</h3>
              
              <div className="space-y-4">
                {sectionPhotos.map(photo => (
                  <div key={photo.index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded">
                    <div>
                      <label className="block text-sm font-medium mb-1">Filename:</label>
                      <p className="text-sm text-gray-600">{photo.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Alt Text:</label>
                      <input
                        type="text"
                        value={photo.alt}
                        onChange={(e) => updatePhoto(photo.index, 'alt', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Caption:</label>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updatePhoto(photo.index, 'caption', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Optional caption"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">People (comma-separated):</label>
                      <input
                        type="text"
                        value={photo.people}
                        onChange={(e) => updatePhoto(photo.index, 'people', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="John Smith, Jane Doe"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Select your event from the dropdown</li>
          <li>Upload your photo folders (Speakers, Sponsors, Exhibitors, etc.)</li>
          <li>Review and edit the auto-generated metadata for each photo</li>
          <li>Click "Generate metadata.json" to download the metadata file</li>
          <li>Place the downloaded file at <code>/public/events/[eventShorthand]/metadata.json</code></li>
        </ol>
      </div>
    </div>
  );
}
