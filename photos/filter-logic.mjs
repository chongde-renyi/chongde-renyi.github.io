export function matchesPhoto(photo, filters) {
  const hasSelection = filters.people.size > 0
    || filters.renyiCategories.size > 0
    || filters.topics.size > 0
    || filters.countries.size > 0;

  if (!hasSelection) return true;

  const renyiSelected = filters.people.has('仁義大仙')
    || filters.renyiCategories.size > 0;
  const renyiMatch = renyiSelected
    && photo.people.includes('仁義大仙')
    && (filters.renyiCategories.size === 0
      || photo.renyiCategories.some((category) => filters.renyiCategories.has(category)));
  const otherPeopleMatch = photo.people.some(
    (person) => person !== '仁義大仙' && filters.people.has(person),
  );
  const topicMatch = photo.topics.some((topic) => filters.topics.has(topic));
  const countryMatch = filters.countries.has(photo.country);

  return renyiMatch || otherPeopleMatch || topicMatch || countryMatch;
}

export function filterPhotos(photos, filters) {
  return photos.filter((photo) => matchesPhoto(photo, filters));
}

export function getAvailableCountries(photos) {
  return [...new Set(photos.map((photo) => photo.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}
