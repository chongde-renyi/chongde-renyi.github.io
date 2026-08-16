export function chooseDownloadFormat({
  userAgent = '',
  maxTouchPoints = 0,
  innerWidth = 0,
} = {}) {
  const explicitMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const touchNarrow = maxTouchPoints > 0 && innerWidth <= 900;
  return explicitMobile || touchNarrow ? 'png' : 'pdf';
}

export function buildDownloadFilename(name, format) {
  const safeName = String(name).replace(/[\\/:*?"<>|]+/g, '-').trim();
  return `慈語-${safeName}.${format}`;
}

export function calculatePdfPageSize(canvasWidth, canvasHeight, pageWidth = 640) {
  const height = Math.round(pageWidth * canvasHeight / canvasWidth);
  return {
    width: pageWidth,
    height,
    orientation: height >= pageWidth ? 'portrait' : 'landscape',
  };
}

export function getCardExportOptions(format) {
  return {
    scale: 3,
    canvasMimeType: 'image/png',
    pdfImageFormat: format === 'pdf' ? 'PNG' : null,
  };
}

export async function waitForImageReady(image) {
  if (!image.complete) {
    await new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', () => reject(new Error('Portrait image failed to load')), { once: true });
    });
  }
  if (!image.naturalWidth) throw new Error('Portrait image failed to load');
  if (typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      if (!image.naturalWidth) throw new Error('Portrait image failed to decode');
    }
  }
}
