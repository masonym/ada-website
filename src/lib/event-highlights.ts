import { HIGHLIGHTS, findScheduleItem, HighlightItem } from '@/constants/highlights';
import { getEventSpeakersPublic } from '@/lib/sanity';
import { htmlToText } from '@/lib/html';

/**
 * Resolves each highlight's session speakers ahead of render.
 *
 * Two problems solved here.
 *
 * Bundle: EventHighlights is a client component that renders on the homepage. It
 * used to call findScheduleItem() in its click handler, which meant importing
 * constants/highlights - and that module imports SCHEDULES, so all 2,500 lines
 * of every event's agenda shipped to every homepage visitor to populate a modal
 * most of them never open.
 *
 * Correctness: schedule entries carry only a `speakerId`; names, titles and
 * photos live in Sanity. The old client-side resolver was a no-op with a comment
 * claiming "the schedule data should already have the speaker names populated" -
 * it does not, so the highlights modal rendered a list of blank names. Resolving
 * against Sanity here fixes that.
 */
export type HighlightSpeaker = {
  name?: string;
  title?: string;
  affiliation?: string;
  photo?: string;
  sanityImage?: { asset: { _ref: string } };
  speakerId?: string;
};

export type ResolvedHighlight = HighlightItem & {
  speakers: HighlightSpeaker[];
};

/** The raw shape schedule items use for their speaker references. */
type ScheduleSpeakerRef = HighlightSpeaker;

export async function getResolvedHighlights(
  sourceEventId: number
): Promise<ResolvedHighlight[]> {
  const items: HighlightItem[] = HIGHLIGHTS[sourceEventId] || [];
  if (items.length === 0) return [];

  // Speaker details for the source event, keyed by the slug the schedule uses.
  const speakerData = await getEventSpeakersPublic(sourceEventId).catch((error) => {
    console.error(`[highlights] Could not load speakers for event ${sourceEventId}:`, error);
    return null;
  });

  const bySlug = new Map(
    [...(speakerData?.speakers ?? []), ...(speakerData?.keynoteSpeakers ?? [])]
      .filter((speaker) => speaker.speakerSlug)
      .map((speaker) => [speaker.speakerSlug as string, speaker])
  );

  return items.map((highlight) => {
    const day =
      highlight.sessionDayDate || typeof highlight.sessionDayIndex === 'number'
        ? { date: highlight.sessionDayDate, index: highlight.sessionDayIndex }
        : undefined;

    const matched = findScheduleItem(
      sourceEventId,
      highlight.sessionTime,
      highlight.sessionTitle,
      day
    );

    const refs: ScheduleSpeakerRef[] =
      matched && 'speakers' in matched.item && matched.item.speakers
        ? (matched.item.speakers as ScheduleSpeakerRef[])
        : [];

    const speakers = refs.map((ref) => {
      const sanity = ref.speakerId ? bySlug.get(ref.speakerId) : undefined;
      if (!sanity) return ref;

      return {
        ...ref,
        // Any name set directly on the schedule entry is a deliberate override.
        // A Sanity name is authored as HTML; the modal shows it as text.
        name: ref.name?.trim() ? ref.name : htmlToText(sanity.speakerName),
        title: ref.title?.trim() ? ref.title : sanity.speakerPosition,
        affiliation: ref.affiliation?.trim() ? ref.affiliation : sanity.speakerCompany,
        sanityImage: sanity.speakerImage,
      };
    });

    return { ...highlight, speakers };
  });
}
