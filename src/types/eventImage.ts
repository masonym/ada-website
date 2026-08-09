/**
 * Shape of a processed event photo.
 *
 * Lives in its own module so client components can import the type without
 * pulling in `utils/imageUtils`, which is server-only (it reads AWS creds).
 */
export type EventImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  highlighted?: boolean;
};
