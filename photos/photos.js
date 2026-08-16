import { PHOTOS } from './photos-data.js';
import { filterPhotos, getAvailableCountries } from './filter-logic.mjs';

const filterForm = document.querySelector('#photo-filters');
const countryFilters = document.querySelector('#country-filters');
const photoFeed = document.querySelector('#photo-feed');
const photoCount = document.querySelector('#photo-count');
const emptyState = document.querySelector('#empty-state');
const clearButton = document.querySelector('#clear-filters');
const emptyClearButton = document.querySelector('#empty-clear-filters');

function checkedValues(name) {
  return new Set(
    [...filterForm.querySelectorAll(`input[name="${name}"]:checked`)]
      .map((input) => input.value),
  );
}

export function readFilters() {
  return {
    people: checkedValues('people'),
    renyiCategories: checkedValues('renyiCategories'),
    topics: checkedValues('topics'),
    countries: checkedValues('countries'),
  };
}

function hasSelections(filters) {
  return Object.values(filters).some((values) => values.size > 0);
}

function createTag(text) {
  const item = document.createElement('li');
  item.textContent = text;
  return item;
}

function createPhotoCard(photo) {
  const article = document.createElement('article');
  article.className = 'photo-card';

  const imageWrap = document.createElement('figure');
  imageWrap.className = 'photo-image-wrap';
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  const errorMessage = document.createElement('div');
  errorMessage.className = 'image-error';
  errorMessage.textContent = '圖片暫時無法載入';
  errorMessage.hidden = true;
  image.addEventListener('error', () => {
    image.hidden = true;
    errorMessage.hidden = false;
  });
  imageWrap.append(image, errorMessage);

  const copy = document.createElement('div');
  copy.className = 'photo-copy';
  const title = document.createElement('h3');
  title.textContent = photo.title;
  const date = document.createElement('p');
  date.className = 'photo-date';
  date.textContent = photo.date || '日期未詳';
  const description = document.createElement('p');
  description.className = 'photo-description';
  description.textContent = photo.description || '珍貴照片典藏。';

  const tags = document.createElement('ul');
  tags.className = 'tag-list';
  const location = [photo.country, photo.city].filter(Boolean).join(' · ');
  [...photo.people, ...photo.renyiCategories, ...photo.topics, location]
    .filter(Boolean)
    .forEach((tag) => tags.append(createTag(tag)));

  const download = document.createElement('a');
  download.className = 'download-button';
  download.href = photo.src;
  download.download = photo.downloadName;
  download.textContent = '下載照片';
  download.setAttribute('aria-label', `下載照片：${photo.title}`);

  copy.append(title, date, description, tags, download);
  article.append(imageWrap, copy);
  return article;
}

export function renderPhotos(photos) {
  const fragment = document.createDocumentFragment();
  photos.forEach((photo) => fragment.append(createPhotoCard(photo)));
  photoFeed.replaceChildren(fragment);
  photoCount.textContent = `共 ${photos.length} 張照片`;
  const isEmpty = photos.length === 0;
  photoFeed.hidden = isEmpty;
  emptyState.hidden = !isEmpty;
}

export function renderCountries(countries) {
  const fragment = document.createDocumentFragment();
  countries.forEach((country) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'countries';
    input.value = country;
    label.append(input, ` ${country}`);
    fragment.append(label);
  });
  countryFilters.replaceChildren(fragment);
}

function updateGallery() {
  const filters = readFilters();
  clearButton.disabled = !hasSelections(filters);
  renderPhotos(filterPhotos(PHOTOS, filters));
}

export function clearFilters() {
  filterForm.reset();
  updateGallery();
}

renderCountries(getAvailableCountries(PHOTOS));
filterForm.addEventListener('change', updateGallery);
clearButton.addEventListener('click', clearFilters);
emptyClearButton.addEventListener('click', clearFilters);

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
});

updateGallery();
