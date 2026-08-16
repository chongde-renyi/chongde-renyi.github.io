function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function isFamilyPhoto(photo) {
  return photo.renyiCategories.includes('家人');
}

export function isInkPhoto(photo) {
  return photo.topics.includes('墨寶');
}

export function buildPreviewSet(photos, count = 4, random = Math.random) {
  const eligible = photos.filter((photo) => !isFamilyPhoto(photo));
  const ink = shuffled(eligible.filter(isInkPhoto), random);
  const regular = shuffled(eligible.filter((photo) => !isInkPhoto(photo)), random);
  const preview = [];
  if (ink.length > 0 && count > 0) preview.push(ink[0]);
  preview.push(...regular.slice(0, Math.max(0, count - preview.length)));
  return shuffled(preview, random);
}

export function replacementForSlot(photos, current, slotIndex, random = Math.random) {
  const currentPhoto = current[slotIndex];
  if (!currentPhoto) return null;
  const requireInk = isInkPhoto(currentPhoto);
  const currentIds = new Set(current.map((photo) => photo.id));
  const candidates = photos.filter((photo) => (
    !isFamilyPhoto(photo)
    && isInkPhoto(photo) === requireInk
    && !currentIds.has(photo.id)
  ));
  if (candidates.length === 0) return currentPhoto;
  return candidates[Math.floor(random() * candidates.length)];
}
