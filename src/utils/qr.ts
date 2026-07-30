// Browser-side QR generation for embedding into PDFs (react-pdf takes data URLs).

import QRCode from 'qrcode';

type QrOptions = {
  /** pixel size of the generated PNG - keep it generous so print stays crisp */
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  /** image drawn in the centre of the code; must be same-origin or CORS-enabled */
  logoSrc?: string;
  /** logo width as a fraction of the code width */
  logoScale?: number;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

export async function generateQrDataUrl(text: string, options: QrOptions = {}): Promise<string> {
  const {
    size = 600,
    margin = 1,
    darkColor = '#000000',
    lightColor = '#ffffff',
    logoSrc,
    logoScale = 0.24,
  } = options;

  const canvas = document.createElement('canvas');

  // level H tolerates ~30% damage, which is what lets us punch a logo into the middle
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: 'H',
    margin,
    width: size,
    color: { dark: darkColor, light: lightColor },
  });

  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const box = Math.round(canvas.width * logoScale);
        const offset = Math.round((canvas.width - box) / 2);
        const pad = Math.round(box * 0.08);
        // clear a plate behind the logo so it doesn't sit on top of dark modules
        ctx.fillStyle = lightColor;
        ctx.fillRect(offset - pad, offset - pad, box + pad * 2, box + pad * 2);
        ctx.drawImage(logo, offset, offset, box, box);
      }
    } catch {
      // a missing logo shouldn't cost us the whole code
    }
  }

  return canvas.toDataURL('image/png');
}
