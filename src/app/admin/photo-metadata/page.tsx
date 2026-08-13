'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EVENTS } from '@/constants/events';

/**
 * Photo Metadata Manager.
 *
 * Captioning a few hundred event photos is the slow part of shipping a recap, so
 * this page is built around three things the old version lacked: you can see the
 * photo you are describing, you can label a run of photos in one action, and the
 * captions and names are click targets drawn from the event's own schedule rather
 * than free text you retype.
 */

type Layout = 'grid' | 'masonry' | 'carousel' | 'featured';

const LAYOUTS: Layout[] = ['masonry', 'grid', 'carousel', 'featured'];

interface PhotoDraft {
  /** Stable across section renames: original folder + filename. */
  id: string;
  folder: string;
  name: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  /** Once the alt text is hand-edited we stop deriving it from the caption. */
  altTouched: boolean;
  caption: string;
  people: string[];
  tags: string[];
  featured: boolean;
}

interface SectionDraft {
  folder: string;
  /** Must match the folder name on S3 - that is what the recap builder keys on. */
  key: string;
  title: string;
  layout: Layout;
}

/** The subset of a photo we persist as a draft and restore by filename. */
type PhotoLabels = Pick<
  PhotoDraft,
  'alt' | 'altTouched' | 'caption' | 'people' | 'tags' | 'featured'
>;

interface Draft {
  sections: SectionDraft[];
  labels: Record<string, PhotoLabels>;
  introduction: string;
}

interface ScheduleSession {
  title: string;
  speakers: string[];
}

interface EventOrganization {
  name: string;
}

/** Which list of click-to-apply captions the panel is showing. */
type CaptionSource = 'sessions' | 'organizations';

/** Section keys whose photos are captioned with a company rather than a session. */
const ORGANIZATION_SECTION_PATTERN = /sponsor|exhibit/i;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const draftKey = (eventShorthand: string) => `photo-metadata-draft:${eventShorthand}`;

/** Speaker names come out of Sanity carrying markup like <br/>, which is not a name. */
function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function naturalSort(a: string, b: string): number {
  const regex = /(\d+)|(\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';

    if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
      const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
      if (diff !== 0) return diff;
    } else {
      const diff = aPart.localeCompare(bPart);
      if (diff !== 0) return diff;
    }
  }

  return 0;
}

/** "2026 AFSFPC - Sponsors & Exhibitors" -> { key: "sponsors-exhibitors", title: "Sponsors & Exhibitors" } */
function deriveSection(folder: string): { key: string; title: string } {
  const parts = folder.split(' - ');
  const title = (parts.length > 1 ? parts[parts.length - 1] : folder).trim();
  const key = title
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return { key: key || 'general', title };
}

function defaultLayout(key: string): Layout {
  return key.includes('featured') ? 'featured' : 'masonry';
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

function toWebp(filename: string): string {
  return `${stripExtension(filename)}.webp`;
}

/**
 * Reads real pixel dimensions off the decoded image. The old version wrote a
 * hardcoded 1600x1200 for every photo, which the masonry and grid sections use to
 * compute aspect ratio - so every portrait shot was laid out at the wrong shape.
 */
function readDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1600, height: 1200 });
    img.src = url;
  });
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

/** The shared value across a selection, or undefined when they disagree. */
function commonValue<T>(photos: PhotoDraft[], get: (photo: PhotoDraft) => T): T | undefined {
  if (photos.length === 0) return undefined;
  const first = get(photos[0]);
  const encoded = JSON.stringify(first);
  return photos.every(photo => JSON.stringify(get(photo)) === encoded) ? first : undefined;
}

function deriveAlt(photo: PhotoDraft, sectionTitle: string, eventTitle: string): string {
  const subject = photo.people.length > 0 ? photo.people.join(', ') : '';
  if (photo.caption && subject) return `${subject} - ${photo.caption}`;
  if (photo.caption) return photo.caption;
  if (subject) return `${subject} at the ${eventTitle}`;
  return `${sectionTitle} at the ${eventTitle}`;
}

export default function PhotoMetadataManager() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [introduction, setIntroduction] = useState('');
  const [outputWebp, setOutputWebp] = useState(true);
  const [showUnlabelledOnly, setShowUnlabelledOnly] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [status, setStatus] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<EventOrganization[]>([]);
  const [organizationsWarning, setOrganizationsWarning] = useState('');
  const [activeSession, setActiveSession] = useState<string | null>(null);
  /** null follows the section being labelled; setting it pins the panel. */
  const [pinnedSource, setPinnedSource] = useState<CaptionSource | null>(null);
  const [captionFilter, setCaptionFilter] = useState('');

  const objectUrlsRef = useRef<string[]>([]);
  const metadataInputRef = useRef<HTMLInputElement>(null);
  // Filenames contain spaces, so they cannot be DOM ids - keep nodes in a map.
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());

  const event = useMemo(
    () => EVENTS.find(e => e.eventShorthand === selectedEvent),
    [selectedEvent]
  );

  // Photos in the order they are labelled: section order, then natural filename order.
  const orderedPhotos = useMemo(() => {
    const sectionRank = new Map(sections.map((section, index) => [section.folder, index]));
    return [...photos].sort((a, b) => {
      const rankDiff =
        (sectionRank.get(a.folder) ?? 0) - (sectionRank.get(b.folder) ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return naturalSort(a.name, b.name);
    });
  }, [photos, sections]);

  const photosById = useMemo(
    () => new Map(orderedPhotos.map(photo => [photo.id, photo])),
    [orderedPhotos]
  );

  const selectedPhotos = useMemo(
    () => selectedIds.map(id => photosById.get(id)).filter((p): p is PhotoDraft => !!p),
    [selectedIds, photosById]
  );

  const activePhoto = activeId ? photosById.get(activeId) ?? null : null;

  const isLabelled = useCallback(
    (photo: PhotoDraft) => photo.caption.trim() !== '' || photo.people.length > 0,
    []
  );

  const labelledCount = useMemo(
    () => orderedPhotos.filter(isLabelled).length,
    [orderedPhotos, isLabelled]
  );

  // --- Autocomplete sources ----------------------------------------------------

  useEffect(() => {
    if (!event) {
      setSessions([]);
      setSpeakers([]);
      setOrganizations([]);
      setOrganizationsWarning('');
      return;
    }

    let cancelled = false;

    const loadSuggestions = async () => {
      try {
        const [scheduleRes, speakersRes, organizationsRes] = await Promise.all([
          fetch(`/api/admin/event-schedules?eventId=${event.id}`),
          fetch(`/api/event-speakers-public?eventId=${event.id}`),
          fetch(`/api/admin/event-organizations?eventId=${event.id}`),
        ]);

        if (cancelled) return;

        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          const days = data?.eventSchedule?.days ?? [];
          const collected: ScheduleSession[] = [];
          const seen = new Set<string>();

          for (const day of days) {
            for (const item of day?.items ?? []) {
              const title = stripHtml(item?.title ?? '');
              if (!title || seen.has(title)) continue;
              seen.add(title);
              collected.push({
                title,
                speakers: (item?.speakers ?? [])
                  .map((s: { name?: string }) => stripHtml(s?.name ?? ''))
                  .filter((name: string) => name.length > 0),
              });
            }
          }
          setSessions(collected);
        }

        if (speakersRes.ok) {
          const data = await speakersRes.json();
          const names = (data?.speakers ?? [])
            .map((s: { speakerName?: string }) => stripHtml(s?.speakerName ?? ''))
            .filter((name: string) => name.length > 0);
          setSpeakers(Array.from(new Set<string>(names)).sort());
        }

        if (organizationsRes.ok) {
          const data = await organizationsRes.json();
          setOrganizations(data?.organizations ?? []);
          setOrganizationsWarning(data?.warning ?? '');
        } else {
          setOrganizations([]);
          setOrganizationsWarning('Could not load the sponsor and exhibitor list.');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load caption/name suggestions:', error);
        }
      }
    };

    loadSuggestions();
    return () => {
      cancelled = true;
    };
  }, [event]);

  /** Speakers on the currently picked session float to the top of the name list. */
  const sessionSpeakers = useMemo(() => {
    if (!activeSession) return [];
    return sessions.find(s => s.title === activeSession)?.speakers ?? [];
  }, [activeSession, sessions]);

  const otherSpeakers = useMemo(
    () => speakers.filter(name => !sessionSpeakers.includes(name)),
    [speakers, sessionSpeakers]
  );

  // --- Draft persistence -------------------------------------------------------

  const saveDraft = useCallback(() => {
    if (!selectedEvent || photos.length === 0) return;

    const labels: Record<string, PhotoLabels> = {};
    for (const photo of photos) {
      labels[photo.id] = {
        alt: photo.alt,
        altTouched: photo.altTouched,
        caption: photo.caption,
        people: photo.people,
        tags: photo.tags,
        featured: photo.featured,
      };
    }

    const draft: Draft = { sections, labels, introduction };
    try {
      window.localStorage.setItem(draftKey(selectedEvent), JSON.stringify(draft));
    } catch (error) {
      console.error('Could not save draft to localStorage:', error);
    }
  }, [selectedEvent, photos, sections, introduction]);

  useEffect(() => {
    const timer = window.setTimeout(saveDraft, 500);
    return () => window.clearTimeout(timer);
  }, [saveDraft]);

  const readDraft = useCallback((eventShorthand: string): Draft | null => {
    try {
      const raw = window.localStorage.getItem(draftKey(eventShorthand));
      return raw ? (JSON.parse(raw) as Draft) : null;
    } catch {
      return null;
    }
  }, []);

  // --- Loading photos ----------------------------------------------------------

  const handleFolderUpload = async (uploadEvent: React.ChangeEvent<HTMLInputElement>) => {
    const files = uploadEvent.target.files;
    if (!files || files.length === 0) return;

    setIsLoadingPhotos(true);
    setStatus('Reading photos...');

    // Mutate in place rather than reassigning - the unmount cleanup holds this array.
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current.length = 0;

    const imageFiles = Array.from(files).filter(file =>
      IMAGE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    const draft = selectedEvent ? readDraft(selectedEvent) : null;
    const draftSections = new Map((draft?.sections ?? []).map(s => [s.folder, s]));

    const nextSections: SectionDraft[] = [];
    const seenFolders = new Set<string>();

    const staged = imageFiles.map(file => {
      const pathParts = (file.webkitRelativePath || file.name).split('/');
      const folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'general';

      if (!seenFolders.has(folder)) {
        seenFolders.add(folder);
        const existing = draftSections.get(folder);
        const derived = deriveSection(folder);
        nextSections.push(
          existing ?? {
            folder,
            key: derived.key,
            title: derived.title,
            layout: defaultLayout(derived.key),
          }
        );
      }

      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      return { file, folder, url };
    });

    const dimensions = await mapWithConcurrency(staged, 6, async item =>
      readDimensions(item.url)
    );

    const nextPhotos: PhotoDraft[] = staged.map((item, index) => {
      const id = `${item.folder}/${item.file.name}`;
      const saved = draft?.labels?.[id];
      const section = nextSections.find(s => s.folder === item.folder);

      return {
        id,
        folder: item.folder,
        name: item.file.name,
        url: item.url,
        width: dimensions[index].width,
        height: dimensions[index].height,
        alt: saved?.alt ?? '',
        altTouched: saved?.altTouched ?? false,
        caption: saved?.caption ?? '',
        people: saved?.people ?? [],
        tags: saved?.tags ?? (section ? [section.key] : []),
        featured: saved?.featured ?? false,
      };
    });

    setSections(nextSections);
    setPhotos(nextPhotos);
    if (draft?.introduction) setIntroduction(draft.introduction);

    const first = [...nextPhotos].sort((a, b) => naturalSort(a.name, b.name))[0];
    setActiveId(first?.id ?? null);
    setSelectedIds(first ? [first.id] : []);
    setIsLoadingPhotos(false);

    const restored = draft ? nextPhotos.filter(p => draft.labels?.[p.id]).length : 0;
    setStatus(
      restored > 0
        ? `Loaded ${nextPhotos.length} photos across ${nextSections.length} sections - restored labels for ${restored}.`
        : `Loaded ${nextPhotos.length} photos across ${nextSections.length} sections.`
    );
  };

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // --- Editing -----------------------------------------------------------------

  const updateSelected = useCallback(
    (patch: Partial<PhotoDraft>) => {
      const targets = new Set(selectedIds);
      if (targets.size === 0) return;

      setPhotos(current =>
        current.map(photo => {
          if (!targets.has(photo.id)) return photo;
          const next = { ...photo, ...patch };
          if (!next.altTouched) {
            const section = sections.find(s => s.folder === photo.folder);
            next.alt = deriveAlt(next, section?.title ?? '', event?.title ?? '');
          }
          return next;
        })
      );
    },
    [selectedIds, sections, event]
  );

  const selectSingle = useCallback((id: string) => {
    setActiveId(id);
    setSelectedIds([id]);
  }, []);

  /** Shift-click and Shift+arrow extend from the anchor - runs of one speaker are common. */
  const extendSelection = useCallback(
    (id: string) => {
      if (!activeId) {
        selectSingle(id);
        return;
      }
      const from = orderedPhotos.findIndex(p => p.id === activeId);
      const to = orderedPhotos.findIndex(p => p.id === id);
      if (from === -1 || to === -1) return;
      const [start, end] = from <= to ? [from, to] : [to, from];
      setSelectedIds(orderedPhotos.slice(start, end + 1).map(p => p.id));
    },
    [activeId, orderedPhotos, selectSingle]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(existing => existing !== id) : [...current, id]
    );
    setActiveId(id);
  }, []);

  const handleThumbnailClick = (photoEvent: React.MouseEvent, id: string) => {
    if (photoEvent.shiftKey) extendSelection(id);
    else if (photoEvent.metaKey || photoEvent.ctrlKey) toggleSelection(id);
    else selectSingle(id);
  };

  const step = useCallback(
    (delta: number, extend: boolean) => {
      if (orderedPhotos.length === 0) return;
      const anchorId = extend ? selectedIds[selectedIds.length - 1] : activeId;
      const currentIndex = orderedPhotos.findIndex(p => p.id === anchorId);
      const nextIndex = Math.min(
        Math.max((currentIndex === -1 ? 0 : currentIndex) + delta, 0),
        orderedPhotos.length - 1
      );
      const next = orderedPhotos[nextIndex];
      if (extend) extendSelection(next.id);
      else selectSingle(next.id);
    },
    [orderedPhotos, selectedIds, activeId, extendSelection, selectSingle]
  );

  /** Copy the previous photo's labels forward - the fastest path through a burst. */
  const dittoFromPrevious = useCallback(() => {
    if (selectedIds.length === 0) return;
    const firstIndex = orderedPhotos.findIndex(p => p.id === selectedIds[0]);
    if (firstIndex <= 0) return;
    const source = orderedPhotos[firstIndex - 1];
    updateSelected({
      caption: source.caption,
      people: [...source.people],
      tags: [...source.tags],
    });
    setActiveSession(source.caption || null);
  }, [selectedIds, orderedPhotos, updateSelected]);

  const jumpToNextUnlabelled = useCallback(() => {
    const startIndex = activeId ? orderedPhotos.findIndex(p => p.id === activeId) : -1;
    const next =
      orderedPhotos.slice(startIndex + 1).find(p => !isLabelled(p)) ??
      orderedPhotos.find(p => !isLabelled(p));
    if (next) selectSingle(next.id);
  }, [activeId, orderedPhotos, isLabelled, selectSingle]);

  useEffect(() => {
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      const target = keyEvent.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const modified = keyEvent.metaKey || keyEvent.ctrlKey;

      if (modified && keyEvent.key.toLowerCase() === 'd') {
        keyEvent.preventDefault();
        dittoFromPrevious();
        return;
      }

      if (keyEvent.key !== 'ArrowLeft' && keyEvent.key !== 'ArrowRight') return;
      // Inside a field, bare arrows move the caret - only take over when modified.
      if (typing && !modified) return;

      keyEvent.preventDefault();
      step(keyEvent.key === 'ArrowRight' ? 1 : -1, keyEvent.shiftKey);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, dittoFromPrevious]);

  // Keep the active thumbnail in view as you arrow through.
  useEffect(() => {
    if (!activeId) return;
    thumbnailRefs.current.get(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const togglePerson = (name: string) => {
    const current = commonValue(selectedPhotos, p => p.people) ?? [];
    const next = current.includes(name)
      ? current.filter(person => person !== name)
      : [...current, name];
    updateSelected({ people: next });
  };

  const applyCaption = (title: string) => {
    updateSelected({ caption: title });
    setActiveSession(title);
  };

  /** Sponsor and exhibitor shots are captioned with the company and carry no people. */
  const applyOrganization = (name: string) => {
    updateSelected({ caption: name });
    setActiveSession(null);
  };

  const updateSection = (folder: string, patch: Partial<SectionDraft>) => {
    setSections(current =>
      current.map(section => (section.folder === folder ? { ...section, ...patch } : section))
    );
  };

  // --- Import / export ---------------------------------------------------------

  const buildMetadata = useCallback(() => {
    const output: Record<string, unknown> = {};

    for (const section of sections) {
      const sectionPhotos = orderedPhotos.filter(photo => photo.folder === section.folder);
      if (sectionPhotos.length === 0) continue;

      const photoMap: Record<string, Record<string, unknown>> = {};
      for (const photo of sectionPhotos) {
        const entry: Record<string, unknown> = {
          alt: photo.alt || deriveAlt(photo, section.title, event?.title ?? ''),
          width: photo.width,
          height: photo.height,
        };
        if (photo.caption.trim()) entry.caption = photo.caption.trim();
        if (photo.people.length > 0) entry.people = photo.people;
        if (photo.tags.length > 0) entry.tags = photo.tags;
        if (photo.featured) entry.featured = true;

        photoMap[outputWebp ? toWebp(photo.name) : photo.name] = entry;
      }

      output[section.key] = {
        title: section.title,
        layout: section.layout,
        photos: photoMap,
      };
    }

    return {
      eventShorthand: selectedEvent,
      title: event?.title ?? '',
      introduction: introduction || `Photo highlights from the ${event?.title ?? ''}`,
      sections: output,
    };
  }, [sections, orderedPhotos, outputWebp, selectedEvent, event, introduction]);

  const downloadMetadata = () => {
    if (!selectedEvent) return;
    const blob = new Blob([JSON.stringify(buildMetadata(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'metadata.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setStatus('Downloaded metadata.json - drop it in public/events/' + selectedEvent + '/');
  };

  const copyMetadata = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildMetadata(), null, 2));
      setStatus('Copied metadata JSON to clipboard.');
    } catch {
      setStatus('Could not copy - use Download instead.');
    }
  };

  /** Resume from a metadata.json already on disk. Matches on filename sans extension. */
  const handleMetadataImport = async (importEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = importEvent.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const importedSections = parsed?.sections ?? {};
      const byBasename = new Map<string, Record<string, unknown>>();

      for (const section of Object.values(importedSections) as Array<{
        photos?: Record<string, Record<string, unknown>>;
      }>) {
        for (const [filename, meta] of Object.entries(section.photos ?? {})) {
          byBasename.set(stripExtension(filename), meta);
        }
      }

      let matched = 0;
      setPhotos(current =>
        current.map(photo => {
          const meta = byBasename.get(stripExtension(photo.name));
          if (!meta) return photo;
          matched++;
          return {
            ...photo,
            alt: typeof meta.alt === 'string' ? meta.alt : photo.alt,
            altTouched: typeof meta.alt === 'string',
            caption: typeof meta.caption === 'string' ? meta.caption : '',
            people: Array.isArray(meta.people) ? (meta.people as string[]) : [],
            tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : photo.tags,
            featured: meta.featured === true,
          };
        })
      );

      if (typeof parsed?.introduction === 'string') setIntroduction(parsed.introduction);
      setStatus(`Imported metadata for ${matched} of ${photos.length} photos.`);
    } catch (error) {
      console.error('Could not parse metadata.json:', error);
      setStatus('That file did not parse as metadata JSON.');
    }

    importEvent.target.value = '';
  };

  // --- Rendering ---------------------------------------------------------------

  const captionValue = commonValue(selectedPhotos, p => p.caption);
  const peopleValue = commonValue(selectedPhotos, p => p.people);
  const tagsValue = commonValue(selectedPhotos, p => p.tags);
  const altValue = commonValue(selectedPhotos, p => p.alt);
  const featuredValue = commonValue(selectedPhotos, p => p.featured);
  const isMixed = selectedPhotos.length > 1;

  // Sponsor/exhibitor sections get captioned with a company, everything else with
  // a session. Follow the section being labelled, but let the pin override it so a
  // differently-named section is never stuck on the wrong list.
  const activeSectionKey = activePhoto
    ? sections.find(section => section.folder === activePhoto.folder)?.key ?? ''
    : '';
  const captionSource: CaptionSource =
    pinnedSource ??
    (ORGANIZATION_SECTION_PATTERN.test(activeSectionKey) ? 'organizations' : 'sessions');

  const filterText = captionFilter.trim().toLowerCase();
  const matchesFilter = (value: string) => value.toLowerCase().includes(filterText);
  const filteredSessions = sessions.filter(session => matchesFilter(session.title));
  const filteredOrganizations = organizations.filter(organization =>
    matchesFilter(organization.name)
  );

  const visibleSections = sections
    .map(section => ({
      section,
      items: orderedPhotos.filter(
        photo =>
          photo.folder === section.folder && (!showUnlabelledOnly || !isLabelled(photo))
      ),
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event</label>
          <select
            value={selectedEvent}
            onChange={e => {
              // Drop loaded photos so the autosaved draft never lands on the wrong event.
              objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
              objectUrlsRef.current.length = 0;
              setPhotos([]);
              setSections([]);
              setSelectedIds([]);
              setActiveId(null);
              setIntroduction('');
              setStatus('');
              setSelectedEvent(e.target.value);
            }}
            className="border rounded px-3 py-2 w-72"
          >
            <option value="">Choose an event...</option>
            {EVENTS.map(item => (
              <option key={item.eventShorthand} value={item.eventShorthand}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Photo folder (pick the parent - all subfolders load at once)
          </label>
          <input
            type="file"
            multiple
            {...({ webkitdirectory: '' } as Record<string, string>)}
            onChange={handleFolderUpload}
            disabled={!selectedEvent}
            className="border rounded px-3 py-2 disabled:opacity-50"
          />
        </div>

        <button
          onClick={() => metadataInputRef.current?.click()}
          disabled={photos.length === 0}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Import existing metadata.json
        </button>
        <input
          ref={metadataInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleMetadataImport}
          className="hidden"
        />

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={outputWebp}
              onChange={e => setOutputWebp(e.target.checked)}
            />
            Write .webp filenames
          </label>
          <button
            onClick={copyMetadata}
            disabled={photos.length === 0 || !selectedEvent}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Copy JSON
          </button>
          <button
            onClick={downloadMetadata}
            disabled={photos.length === 0 || !selectedEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Download metadata.json
          </button>
        </div>
      </div>

      {(status || isLoadingPhotos) && (
        <p className="mb-4 text-sm text-gray-600">
          {isLoadingPhotos ? 'Reading photos and measuring dimensions...' : status}
        </p>
      )}

      {photos.length === 0 ? (
        <div className="border rounded-lg p-8 text-sm text-gray-600 bg-gray-50">
          <p className="font-medium text-gray-800 mb-2">How this works</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Pick the event, then pick the parent picture folder - every subfolder becomes a section in one pass.</li>
            <li>Click a photo, then click a session title and the people in it. Shift-click to label a whole run at once.</li>
            <li>Download metadata.json into <code>public/events/[shorthand]/</code>.</li>
          </ol>
          <p className="mt-3">
            Work is saved to this browser as you go, so closing the tab does not lose it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Thumbnails */}
          <div className="border rounded-lg flex flex-col max-h-[calc(100vh-220px)]">
            <div className="p-3 border-b space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {labelledCount} / {orderedPhotos.length} labelled
                </span>
                <button
                  onClick={jumpToNextUnlabelled}
                  className="text-blue-600 hover:underline"
                >
                  Next unlabelled
                </button>
              </div>
              <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${orderedPhotos.length ? (labelledCount / orderedPhotos.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showUnlabelledOnly}
                  onChange={e => setShowUnlabelledOnly(e.target.checked)}
                />
                Show unlabelled only
              </label>
            </div>

            <div className="overflow-y-auto p-3 space-y-4">
              {visibleSections.map(({ section, items }) => (
                <div key={section.folder}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    {section.title} ({items.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map(photo => {
                      const selected = selectedIds.includes(photo.id);
                      return (
                        <button
                          key={photo.id}
                          ref={node => {
                            if (node) thumbnailRefs.current.set(photo.id, node);
                            else thumbnailRefs.current.delete(photo.id);
                          }}
                          onClick={e => handleThumbnailClick(e, photo.id)}
                          title={photo.name}
                          className={`relative aspect-square overflow-hidden rounded border-2 ${
                            selected ? 'border-blue-600' : 'border-transparent'
                          } ${photo.id === activeId ? 'ring-2 ring-blue-300' : ''}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {isLabelled(photo) && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                          )}
                          {photo.featured && (
                            <span className="absolute bottom-1 left-1 text-[10px] px-1 rounded bg-yellow-400 text-black font-semibold">
                              ★
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 bg-gray-50 flex flex-col">
                {activePhoto ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePhoto.url}
                      alt={activePhoto.alt}
                      className="w-full max-h-[420px] object-contain rounded bg-white"
                    />
                    <p className="mt-2 text-xs text-gray-600 break-all">
                      {activePhoto.name} - {activePhoto.width}x{activePhoto.height}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Select a photo.</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {isMixed
                      ? `Editing ${selectedPhotos.length} photos`
                      : activePhoto?.name ?? 'No selection'}
                  </p>
                  <button
                    onClick={dittoFromPrevious}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Copy from previous (Ctrl+D)
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Caption</label>
                  <input
                    type="text"
                    value={captionValue ?? ''}
                    placeholder={isMixed && captionValue === undefined ? 'Multiple values' : 'Session title'}
                    onChange={e => updateSelected({ caption: e.target.value })}
                    disabled={selectedPhotos.length === 0}
                    className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    People {peopleValue && peopleValue.length > 0 && `(${peopleValue.length})`}
                  </label>
                  <input
                    type="text"
                    value={peopleValue ? peopleValue.join(', ') : ''}
                    placeholder={
                      isMixed && peopleValue === undefined ? 'Multiple values' : 'Click a name below, or type'
                    }
                    onChange={e =>
                      updateSelected({
                        people: e.target.value
                          .split(',')
                          .map(name => name.trim())
                          .filter(Boolean),
                      })
                    }
                    disabled={selectedPhotos.length === 0}
                    className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    <input
                      type="text"
                      value={tagsValue ? tagsValue.join(', ') : ''}
                      placeholder={isMixed && tagsValue === undefined ? 'Multiple' : 'tags'}
                      onChange={e =>
                        updateSelected({
                          tags: e.target.value
                            .split(',')
                            .map(tag => tag.trim())
                            .filter(Boolean),
                        })
                      }
                      disabled={selectedPhotos.length === 0}
                      className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={featuredValue ?? false}
                        ref={node => {
                          if (node) node.indeterminate = isMixed && featuredValue === undefined;
                        }}
                        onChange={e => updateSelected({ featured: e.target.checked })}
                        disabled={selectedPhotos.length === 0}
                      />
                      Featured
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Alt text{' '}
                    <span className="font-normal text-gray-500">
                      (auto-written from caption and names until you edit it)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={altValue ?? ''}
                    placeholder={isMixed && altValue === undefined ? 'Multiple values' : ''}
                    onChange={e => updateSelected({ alt: e.target.value, altTouched: true })}
                    disabled={selectedPhotos.length === 0}
                    className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Arrows move between photos (Ctrl/Cmd+arrow works while typing) - Shift+arrow
                  or shift-click selects a run - Ctrl/Cmd+D copies the previous photo&apos;s labels.
                </p>
              </div>
            </div>

            {/* Click-to-apply values from the event's own schedule */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <SourceTab
                    label="Sessions"
                    count={sessions.length}
                    active={captionSource === 'sessions'}
                    onClick={() => setPinnedSource('sessions')}
                  />
                  <SourceTab
                    label="Sponsors & Exhibitors"
                    count={organizations.length}
                    active={captionSource === 'organizations'}
                    onClick={() => setPinnedSource('organizations')}
                  />
                  {pinnedSource && (
                    <button
                      onClick={() => setPinnedSource(null)}
                      className="ml-auto text-xs text-blue-600 hover:underline"
                      title="Go back to following the section being labelled"
                    >
                      Auto
                    </button>
                  )}
                </div>

                <input
                  value={captionFilter}
                  onChange={e => setCaptionFilter(e.target.value)}
                  placeholder="Filter..."
                  className="w-full border rounded px-2 py-1 text-sm mb-2"
                />

                {captionSource === 'sessions' ? (
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {sessions.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No schedule found for this event.
                      </p>
                    )}
                    {filteredSessions.map(session => (
                      <CaptionOption
                        key={session.title}
                        label={session.title}
                        active={captionValue === session.title}
                        disabled={selectedPhotos.length === 0}
                        onClick={() => applyCaption(session.title)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {organizationsWarning && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1">
                        {organizationsWarning}
                      </p>
                    )}
                    {organizations.length === 0 && !organizationsWarning && (
                      <p className="text-sm text-gray-500">
                        No sponsors or exhibitors found for this event.
                      </p>
                    )}
                    {filteredOrganizations.map(organization => (
                      <CaptionOption
                        key={organization.name}
                        label={organization.name}
                        active={captionValue === organization.name}
                        disabled={selectedPhotos.length === 0}
                        onClick={() => applyOrganization(organization.name)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">
                  People {speakers.length === 0 && <span className="font-normal text-gray-500">- no speakers found for this event</span>}
                </p>
                <div className="max-h-52 overflow-y-auto space-y-2">
                  {sessionSpeakers.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        In this session
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sessionSpeakers.map(name => (
                          <PersonChip
                            key={name}
                            name={name}
                            active={(peopleValue ?? []).includes(name)}
                            disabled={selectedPhotos.length === 0}
                            onClick={() => togglePerson(name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {otherSpeakers.map(name => (
                      <PersonChip
                        key={name}
                        name={name}
                        active={(peopleValue ?? []).includes(name)}
                        disabled={selectedPhotos.length === 0}
                        onClick={() => togglePerson(name)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section + recap settings */}
            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Sections</p>
              <p className="text-xs text-gray-500 mb-3">
                The key must match the folder name you upload to S3 under{' '}
                <code>events/{selectedEvent || '[shorthand]'}/photos/</code>.
              </p>
              <div className="space-y-2">
                {sections.map(section => (
                  <div key={section.folder} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-4 text-xs text-gray-600 truncate" title={section.folder}>
                      {section.folder}
                    </span>
                    <input
                      value={section.key}
                      onChange={e => updateSection(section.folder, { key: e.target.value })}
                      className="col-span-3 border rounded px-2 py-1 text-sm font-mono"
                    />
                    <input
                      value={section.title}
                      onChange={e => updateSection(section.folder, { title: e.target.value })}
                      className="col-span-3 border rounded px-2 py-1 text-sm"
                    />
                    <select
                      value={section.layout}
                      onChange={e =>
                        updateSection(section.folder, { layout: e.target.value as Layout })
                      }
                      className="col-span-2 border rounded px-2 py-1 text-sm"
                    >
                      {LAYOUTS.map(layout => (
                        <option key={layout} value={layout}>
                          {layout}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <label className="block text-sm font-medium mt-4 mb-1">Introduction</label>
              <input
                value={introduction}
                onChange={e => setIntroduction(e.target.value)}
                placeholder={`Photo highlights from the ${event?.title ?? ''}`}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-2 py-1 rounded border ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label} <span className={active ? 'text-blue-100' : 'text-gray-500'}>({count})</span>
    </button>
  );
}

function CaptionOption({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50 ${
        active ? 'bg-blue-100 font-medium' : ''
      }`}
    >
      {label}
    </button>
  );
}

function PersonChip({
  name,
  active,
  disabled,
  onClick,
}: {
  name: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm px-2 py-1 rounded border disabled:opacity-50 ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white hover:bg-blue-50 border-gray-300'
      }`}
    >
      {name}
    </button>
  );
}
