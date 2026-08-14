export function chooseDownloadFormat({ userAgent = '', viewportWidth = 1200, maxTouchPoints = 0 } = {}) {
  const ua = String(userAgent);
  const explicitMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const touchNarrow = Number(maxTouchPoints) > 0 && Number(viewportWidth) <= 900;
  return explicitMobile || touchNarrow ? 'png' : 'pdf';
}
