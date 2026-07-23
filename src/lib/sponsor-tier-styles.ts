/**
 * Shared parsing for sponsor tier colours.
 *
 * A tier colour can be authored three ways, and both the sponsorship cards
 * (SponsorshipCard) and the sponsor logo tier pills (SponsorLogos) must read
 * all of them identically:
 *   - a bare hex string, e.g. "#ffaf00" (how src/constants/sponsorships.ts stores it)
 *   - Tailwind classes, e.g. "bg-blue-600 text-slate-900" (how Sanity tier styles are stored)
 *   - an arbitrary-value class, e.g. "bg-[#ffaf00] text-white"
 */

const BARE_HEX = /^#[0-9a-fA-F]{3,8}$/;
const ARBITRARY_BG = /bg-\[(#[0-9a-fA-F]{3,8})\]/;
const TEXT_CLASS = /(^|\s)text-\S+/;

export type TierStyleProps = {
    /** Tailwind classes to apply, with any arbitrary-value background removed */
    className: string;
    /** Inline style carrying the hex background, when one was supplied */
    style?: { backgroundColor: string };
    /** Whether the authored colour already specifies a text colour */
    hasTextColour: boolean;
};

/**
 * Turns an authored tier colour into className/style props.
 *
 * @param colour   the authored colour (CMS tier style or constants `colour`)
 * @param fallback used when `colour` is empty
 */
export const getTierStyleProps = (
    colour: string | undefined,
    fallback: string
): TierStyleProps => {
    const value = colour?.trim() || fallback;

    if (BARE_HEX.test(value)) {
        return {
            className: '',
            style: { backgroundColor: value },
            hasTextColour: false,
        };
    }

    const backgroundColor = value.match(ARBITRARY_BG)?.[1];
    const className = backgroundColor
        ? value.replace(ARBITRARY_BG, '').trim()
        : value;

    return {
        className,
        style: backgroundColor ? { backgroundColor } : undefined,
        hasTextColour: TEXT_CLASS.test(className),
    };
};

/**
 * Default tier styling when neither the CMS nor the constants supply one.
 * Matched against the tier name, so it also covers tiers added in the CMS
 * without a style.
 */
export const getDefaultTierStyle = (tierName: string): string => {
    const name = tierName.toLowerCase();
    if (name.includes('small')) return 'bg-sb-100 text-slate-900';
    if (name.includes('gold')) return 'bg-amber-400 text-slate-900';
    if (name.includes('silver')) return 'bg-gray-300 text-slate-900';
    if (name.includes('bronze')) return 'bg-amber-700 text-white';
    if (name.includes('premier')) return 'bg-purple-600 text-white';
    if (name.includes('platinum')) return 'bg-sky-300 text-slate-900';
    if (name.includes('diamond')) return 'bg-blue-500 text-white';
    return 'bg-blue-600 text-white';
};

/**
 * Tier ids in Sanity and sponsorship ids in SPONSORSHIP_TYPES don't always
 * agree on the trailing "-sponsor" (e.g. tier "small-business" vs sponsorship
 * "small-business-sponsor"), so lookups normalise both sides.
 */
export const normaliseTierId = (id: string): string =>
    id.toLowerCase().replace(/-sponsors?$/, '');

/**
 * Looks up a CMS tier style for a sponsorship id, tolerating the "-sponsor"
 * suffix mismatch. Exact matches always win.
 */
export const findTierStyle = (
    tierStyles: Record<string, string> | undefined,
    id: string
): string | undefined => {
    if (!tierStyles) return undefined;
    if (tierStyles[id]) return tierStyles[id];

    const normalised = normaliseTierId(id);
    const match = Object.keys(tierStyles).find(
        (tierId) => normaliseTierId(tierId) === normalised
    );

    return match ? tierStyles[match] : undefined;
};
