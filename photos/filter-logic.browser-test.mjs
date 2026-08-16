import {
  filterPhotos,
  getAvailableCountries,
} from './filter-logic.mjs';
import { PHOTOS } from './photos-data.js';

const photos = [
  { id: 'temple-tw', people: ['仁義大仙'], renyiCategories: ['佛堂'], topics: [], country: '臺灣' },
  { id: 'portrait-jp', people: ['仁義大仙'], renyiCategories: ['獨照'], topics: [], country: '日本' },
  { id: 'family-id', people: ['仁義大仙'], renyiCategories: ['家人'], topics: [], country: '印尼' },
  { id: 'elder-tw', people: ['老前人'], renyiCategories: [], topics: [], country: '臺灣' },
  { id: 'predecessor-jp', people: ['前人老'], renyiCategories: [], topics: [], country: '日本' },
  { id: 'calligraphy-id', people: [], renyiCategories: [], topics: ['墨寶'], country: '印尼' },
  { id: 'unknown-place', people: [], renyiCategories: [], topics: [], country: '' },
];

const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function filters({ people = [], renyiCategories = [], topics = [], countries = [] } = {}) {
  return {
    people: new Set(people),
    renyiCategories: new Set(renyiCategories),
    topics: new Set(topics),
    countries: new Set(countries),
  };
}

function ids(result) {
  return result.map((photo) => photo.id);
}

function assertDeepEqual(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`預期 ${JSON.stringify(expected)}，實際 ${JSON.stringify(actual)}`);
  }
}

test('未選條件時保留全部照片', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters())), ids(photos));
});

test('只選仁義大仙時包含所有仁義大仙照片', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters({ people: ['仁義大仙'] }))), [
    'temple-tw', 'portrait-jp', 'family-id',
  ]);
});

test('仁義大仙多個子分類在組內採 OR', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters({ renyiCategories: ['佛堂', '獨照'] }))), [
    'temple-tw', 'portrait-jp',
  ]);
});

test('老前人、前人老與墨寶跨組採 OR', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters({
    people: ['老前人', '前人老'],
    topics: ['墨寶'],
  }))), ['elder-tw', 'predecessor-jp', 'calligraphy-id']);
});

test('多個國家在地區組內採 OR', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters({ countries: ['臺灣', '日本'] }))), [
    'temple-tw', 'portrait-jp', 'elder-tw', 'predecessor-jp',
  ]);
});

test('仁義大仙佛堂與日本跨組採 OR', () => {
  assertDeepEqual(ids(filterPhotos(photos, filters({
    renyiCategories: ['佛堂'],
    countries: ['日本'],
  }))), ['temple-tw', 'portrait-jp', 'predecessor-jp']);
});

test('沒有符合條件時回傳空陣列', () => {
  assertDeepEqual(filterPhotos(photos, filters({ countries: ['不存在地區'] })), []);
});

test('國家清單去重並依 zh-Hant 排序', () => {
  assertDeepEqual(getAvailableCountries(photos), ['日本', '印尼', '臺灣']);
});

test('首批照片資料涵蓋人物、子分類、墨寶與多地區', () => {
  if (PHOTOS.length < 30) throw new Error(`預期至少 30 張首批照片，實際 ${PHOTOS.length} 張`);
  if (new Set(PHOTOS.map((photo) => photo.id)).size !== PHOTOS.length) {
    throw new Error('照片 id 必須唯一');
  }
  if (new Set(PHOTOS.map((photo) => photo.downloadName)).size !== PHOTOS.length) {
    throw new Error('照片下載檔名必須唯一');
  }

  const people = new Set(PHOTOS.flatMap((photo) => photo.people));
  const categories = new Set(PHOTOS.flatMap((photo) => photo.renyiCategories));
  const topics = new Set(PHOTOS.flatMap((photo) => photo.topics));
  const countries = new Set(PHOTOS.map((photo) => photo.country).filter(Boolean));
  assertDeepEqual([...people].sort(), ['仁義大仙', '前人老', '老前人'].sort());
  assertDeepEqual([...categories].sort(), ['佛堂', '家人', '眾道親', '獨照'].sort());
  if (!topics.has('墨寶')) throw new Error('缺少墨寶資料');
  for (const country of ['臺灣', '日本', '泰國', '印尼', '中國大陸']) {
    if (!countries.has(country)) throw new Error(`缺少地區：${country}`);
  }

  for (const photo of PHOTOS) {
    if (!photo.src.startsWith('uploads/archive/')) throw new Error(`圖片路徑錯誤：${photo.src}`);
    for (const field of ['id', 'src', 'downloadName', 'title', 'alt']) {
      if (typeof photo[field] !== 'string' || !photo[field]) {
        throw new Error(`${photo.src} 缺少 ${field}`);
      }
    }
    for (const field of ['people', 'renyiCategories', 'topics']) {
      if (!Array.isArray(photo[field])) throw new Error(`${photo.src} 的 ${field} 不是陣列`);
    }
  }
});

const status = document.querySelector('#test-status');
const output = document.querySelector('#test-output');

try {
  const messages = [];
  for (const { name, callback } of tests) {
    callback();
    messages.push(`PASS ${name}`);
  }
  status.dataset.testStatus = 'passed';
  status.textContent = `${tests.length} 個測試全部通過`;
  output.textContent = messages.join('\n');
} catch (error) {
  status.dataset.testStatus = 'failed';
  status.textContent = '測試失敗';
  output.textContent = error.stack;
  throw error;
}
