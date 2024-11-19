// PhotoLightbox.tsx
import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { PhotoItem } from './types';

interface PhotoLightboxProps {
  photos: PhotoItem[];
  initialIndex: number;
  onClose: () => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photos, initialIndex, onClose }) => {
  const slides = photos.map(photo => ({
    src: photo.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
  }));

  return (
    <Lightbox
      open={true}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Thumbnails, Zoom]}
      carousel={{
        finite: false,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
      }}
      thumbnails={{
        position: "bottom",
        width: 120,
        height: 80,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, .9)" },
      }}
    />
  );
};

export default PhotoLightbox;