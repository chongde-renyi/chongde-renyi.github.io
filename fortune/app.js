import { FORTUNES } from './fortunes.js';
import { drawFortune, tossJiaobei, createConfirmationState, applyJiaobeiResult } from './logic.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const strings = {
  zh: {
    siteTitle: '六十甲子籤',
    siteSubtitle: '靜心 · 誠問 · 三聖筊定籤',
    home: '返回首頁',
    introEyebrow: '六十甲子籤',
    introTitle: '心中默念所求，誠心求一籤',
    introLead: '不必輸入任何問題。請先靜下心來，在心中專注於一件想請示的事，再按下「誠心求籤」。',
    begin: '誠心求籤',
    drawing: '誠心感應中…',
    drawingHint: '請保持心念安定，讓籤筒自然落籤。',
    ritualNote: '一事一問 · 心誠則靈 · 籤意僅供參考',
    confirmEyebrow: '擲筊確認',
    confirmTitle: '已抽得一支籤',
    confirmLead: '請親自點擊「擲筊確認」。連續三個聖筊，此籤才正式成立。',
    toss: '擲筊確認',
    tossAgain: '再擲一次',
    redraw: '此籤未得允，重新求籤',
    sheng: '聖筊',
    xiao: '笑筊',
    yin: '陰筊',
    shengDesc: '一平一凸 · 此次允可',
    xiaoDesc: '兩平面 · 此籤未得確認',
    yinDesc: '兩凸面 · 此籤未得允',
    progress: (n) => `已得 ${n} / 3 個聖筊`,
    confirmed: '三聖筊已成 · 此籤成立',
    resultEyebrow: '本次籤示',
    poem: '原始籤文',
    fullMeaning: '完整籤意',
    reference: '解說參考',
    categoryReading: '各方面參考',
    categoryNote: '請依自己心中所問之事對照',
    again: '重新求籤',
    copy: '複製結果',
    copied: '已複製',
    source: '原始籤文依通行六十甲子籤版本整理；英文意譯與本頁解說為方便理解所編寫。',
    disclaimer: '解籤內容僅供文化體驗、靜心與自我反思參考，不應取代醫療、法律、財務或其他專業判斷。',
    grade: { very_good:'上吉', good:'吉', neutral:'平', caution:'宜慎', difficult:'守待' },
    categories: { career:'事業', finance:'財運', love:'感情', health:'健康', travel:'出行', legal:'訴訟／爭議', family:'家庭', general:'整體' },
    meaningLead: '此籤整體顯示：',
    referenceLead: '可作為此次所問之事的提醒：'
  },
  en: {
    siteTitle: '60 Jiazi Fortune Lots',
    siteSubtitle: 'Quiet mind · Sincere question · Three Sheng Jiao',
    home: 'Back to home',
    introEyebrow: '60 Jiazi Fortune Lots',
    introTitle: 'Hold your question in your heart',
    introLead: 'You do not need to type anything. Settle your mind, focus on one matter, then tap “Draw a Fortune Lot.”',
    begin: 'Draw a Fortune Lot',
    drawing: 'Drawing with sincerity…',
    drawingHint: 'Keep your mind calm and let the lot fall naturally.',
    ritualNote: 'One matter at a time · Sincerity first · For reflection',
    confirmEyebrow: 'Jiaobei Confirmation',
    confirmTitle: 'A lot has been drawn',
    confirmLead: 'Tap “Cast the Jiaobei” yourself each time. The lot is confirmed only after three consecutive Sheng Jiao.',
    toss: 'Cast the Jiaobei',
    tossAgain: 'Cast again',
    redraw: 'Not confirmed — draw another lot',
    sheng: 'Sheng Jiao',
    xiao: 'Laughing Jiao',
    yin: 'Yin Jiao',
    shengDesc: 'One flat, one rounded · accepted this cast',
    xiaoDesc: 'Two flat sides · this lot is not confirmed',
    yinDesc: 'Two rounded sides · this lot is not accepted',
    progress: (n) => `${n} / 3 Sheng Jiao`,
    confirmed: 'Three Sheng Jiao · lot confirmed',
    resultEyebrow: 'Your confirmed lot',
    poem: 'Original Fortune Poem',
    fullMeaning: 'Full Meaning',
    reference: 'Interpretation Reference',
    categoryReading: 'Life-area Reference',
    categoryNote: 'Compare these notes with the question you held in mind',
    again: 'Draw again',
    copy: 'Copy result',
    copied: 'Copied',
    source: 'Traditional text follows a commonly used Taiwanese 60-Jiazi set. English renderings and explanatory notes are editorial aids for understanding.',
    disclaimer: 'For cultural experience and personal reflection only. It is not a substitute for medical, legal, financial, or other professional advice.',
    grade: { very_good:'Highly Favorable', good:'Favorable', neutral:'Balanced', caution:'Proceed Carefully', difficult:'Pause & Protect' },
    categories: { career:'Career', finance:'Finances', love:'Relationships', health:'Health', travel:'Travel', legal:'Legal / Disputes', family:'Family', general:'Overall' },
    meaningLead: 'Overall, this lot suggests: ',
    referenceLead: 'As a practical reference for the matter in your heart: '
  }
};

const categoryProfiles = {
  zh: {
    very_good: {
      career:'適合推進、爭取或定案；把握成熟機會並維持專業品質。', finance:'財務面偏正向，宜重視穩健累積，避免因順利而過度加碼。', love:'關係有和合與穩定發展空間；真誠溝通可讓好局勢更長久。', health:'整體象徵安定，但身體不適仍應依醫療專業處理。', travel:'行程條件較順，可照計畫前進，同時保留基本備案。', legal:'若有爭議，較有機會往清楚、有利或和解方向發展；仍應循正式程序。', family:'家庭與支持系統偏穩定，適合修復關係、共享成果。', general:'整體條件成熟，重點是把好機會轉化為穩定成果。'
    },
    good: {
      career:'可前進，但最好借助合作、資訊與時間成熟度，不必單打獨鬥。', finance:'有改善或收穫機會，仍宜保守評估現金流與風險。', love:'關係可望改善或更明朗，避免催促對方，重視互相理解。', health:'宜維持規律作息與照護；若有症狀，請直接尋求專業醫療。', travel:'可以規劃，但要確認交通、證件與時間緩衝。', legal:'事情可能逐步釐清；保留文件與紀錄，必要時尋求合格專業意見。', family:'適合溝通與互助，家人或熟人可能成為重要支持。', general:'局勢正往較好的方向走，穩健配合時機即可。'
    },
    neutral: {
      career:'先觀察與準備，不必因短期沒有結果就否定方向。', finance:'以守成和資訊蒐集為主，暫不宜把不確定性當成確定收益。', love:'需要時間看清彼此想法，先減少猜測與過度解讀。', health:'此籤不能判斷疾病；維持照護，有疑慮請就醫。', travel:'非不能行，但宜確認目的、成本與必要性後再決定。', legal:'資訊可能仍不足，不宜僅靠直覺判斷權益；重要事項應找專業人士。', family:'保持耐心與穩定，比急著要求所有人立即改變更有效。', general:'目前屬於等待資訊與時機的階段，穩住比躁進重要。'
    },
    caution: {
      career:'可能有變數、條件不對等或方向需修正，先做風險評估再推進。', finance:'避免高風險或情緒性決策，先驗證價值、合約與資金承受力。', love:'關係中可能有誤解或不穩定因素，界線、承諾與期待要說清楚。', health:'不要用籤詩判斷病情；若有持續或明顯不適，請尋求醫療專業。', travel:'宜準備備案，注意天候、交通、保險與取消條件。', legal:'爭議面要特別重視證據、期限與正式程序，必要時諮詢律師或合格專業人士。', family:'舊問題可能再次出現，宜避免情緒化對抗，先處理真正的癥結。', general:'不是完全不可行，但需要修正、等待或加強防護。'
    },
    difficult: {
      career:'現在硬推容易增加成本，優先停損、調整位置或延後重大決定。', finance:'以保全資金為先，避免借貸擴張、追高或無法承受的承諾。', love:'不要用壓力換答案；若關係長期消耗，先保護自己並重新評估。', health:'健康問題應直接交由醫療專業判斷；若症狀急重，應立即尋求當地急救或醫療。', travel:'若非必要可考慮延後；若必須出行，強化安全與替代方案。', legal:'不要自行冒險處理重大法律權益，應保存證據並尋求合格法律專業協助。', family:'先降溫與保護基本關係，避免在衝突最強時做不可逆決定。', general:'此時重點不是硬求成功，而是減少損失、調整方法並等待條件改善。'
    }
  },
  en: {
    very_good: {
      career:'A favorable time to advance, negotiate, or finalize. Use the opportunity while maintaining professional quality.', finance:'Financial conditions look constructive; favor steady accumulation rather than overextending because things feel easy.', love:'There is room for harmony and stable development. Honest communication helps favorable conditions last.', health:'The symbolism is calm and positive, but symptoms or health concerns should still be handled through qualified medical care.', travel:'Plans are relatively favorable. Proceed sensibly and keep a basic backup plan.', legal:'Disputes may move toward clarity, advantage, or settlement, but formal procedures still matter.', family:'Family and support networks look stable; this is a good time to repair ties and share gains.', general:'Conditions are mature. Convert opportunity into something stable and sustainable.'
    },
    good: {
      career:'Progress is possible, especially through cooperation, better information, and proper timing.', finance:'Improvement or gain is possible, but cash flow and risk still deserve conservative review.', love:'The relationship may improve or become clearer. Avoid pressuring the other person and focus on mutual understanding.', health:'Maintain routine care. If you have symptoms or concerns, seek qualified medical advice directly.', travel:'Travel can be planned, with attention to transport, documents, and time buffers.', legal:'The matter may become clearer. Keep records and seek qualified professional advice when needed.', family:'Communication and mutual support are favored; relatives or trusted people may be important allies.', general:'The situation is moving in a better direction. Steady action matched to timing is enough.'
    },
    neutral: {
      career:'Observe and prepare. A lack of immediate results does not automatically mean the direction is wrong.', finance:'Protect what you have and gather information; do not treat uncertain gains as guaranteed income.', love:'More time is needed to understand intentions. Reduce guessing and over-interpretation.', health:'A fortune lot cannot diagnose illness. Maintain appropriate care and seek medical help for concerns.', travel:'Not necessarily unfavorable, but review purpose, cost, and necessity before committing.', legal:'Information may be incomplete. Do not rely on intuition alone for important rights or obligations.', family:'Patience and stability are more useful than demanding immediate change from everyone.', general:'This is a phase for gathering information and waiting for timing. Stability matters more than speed.'
    },
    caution: {
      career:'Expect variables, uneven terms, or the need to revise direction. Assess risk before moving further.', finance:'Avoid high-risk or emotional decisions. Recheck value, contracts, and your ability to absorb loss.', love:'Misunderstanding or instability may be present. Make boundaries, commitments, and expectations explicit.', health:'Do not use divination to assess illness. Persistent or significant symptoms should be evaluated by a qualified clinician.', travel:'Keep alternatives ready and review weather, transport, insurance, and cancellation terms.', legal:'Evidence, deadlines, and formal process matter. Consult a lawyer or qualified professional when appropriate.', family:'Old issues may return. Avoid emotional confrontation and address the real source of tension.', general:'Not impossible, but it calls for correction, patience, and stronger safeguards.'
    },
    difficult: {
      career:'Pushing harder may increase cost. Prioritize loss control, repositioning, or postponing major commitments.', finance:'Protect capital first. Avoid leverage, chasing losses, or commitments you cannot comfortably absorb.', love:'Do not use pressure to force an answer. If the relationship is chronically draining, protect yourself and reassess.', health:'Health concerns belong with qualified medical professionals. Urgent or severe symptoms require prompt local medical care.', travel:'Consider postponing nonessential travel. If travel is necessary, strengthen safety planning and alternatives.', legal:'Do not handle high-stakes legal rights by guesswork. Preserve evidence and obtain qualified legal advice.', family:'Lower the temperature and protect basic relationships before making irreversible decisions.', general:'The priority is not forcing success; it is limiting harm, changing method, and waiting for better conditions.'
    }
  }
};

let lang = localStorage.getItem('fortune-lang') || 'zh';
let currentFortune = null;
let lastFortuneId = null;
let confirmation = createConfirmationState();
let isTossing = false;
let isDrawing = false;

function t() { return strings[lang]; }

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#${id}`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  document.body.dataset.lang = lang;
  $('#lang-toggle').textContent = lang === 'zh' ? 'EN' : '中文';
  $('[data-i18n="siteTitle"]').textContent = t().siteTitle;
  $('[data-i18n="siteSubtitle"]').textContent = t().siteSubtitle;
  $('[data-i18n="home"]').textContent = `← ${t().home}`;
  $('[data-i18n="introEyebrow"]').textContent = t().introEyebrow;
  $('[data-i18n="introTitle"]').textContent = t().introTitle;
  $('[data-i18n="introLead"]').textContent = t().introLead;
  $('[data-i18n="begin"]').textContent = isDrawing ? t().drawing : t().begin;
  $('[data-i18n="drawingHint"]').textContent = t().drawingHint;
  $('[data-i18n="ritualNote"]').textContent = t().ritualNote;
  $('[data-i18n="confirmEyebrow"]').textContent = t().confirmEyebrow;
  $('[data-i18n="confirmTitle"]').textContent = t().confirmTitle;
  $('[data-i18n="confirmLead"]').textContent = t().confirmLead;
  $('#toss-btn').textContent = confirmation.shengCount ? t().tossAgain : t().toss;
  $('[data-i18n="resultEyebrow"]').textContent = t().resultEyebrow;
  $('[data-i18n="poem"]').textContent = t().poem;
  $('[data-i18n="fullMeaning"]').textContent = t().fullMeaning;
  $('[data-i18n="reference"]').textContent = t().reference;
  $('[data-i18n="categoryReading"]').textContent = t().categoryReading;
  $('[data-i18n="categoryNote"]').textContent = t().categoryNote;
  $('#again-btn').textContent = t().again;
  $('#copy-btn').textContent = t().copy;
  $('#source-note').textContent = t().source;
  $('#disclaimer').textContent = t().disclaimer;

  if (currentFortune) {
    renderConfirmHeader();
    renderJiaobeiStatus();
    if ($('#result').classList.contains('active')) renderResult();
  }
}

function renderConfirmHeader() {
  if (!currentFortune) return;
  $('#drawn-number').textContent = lang === 'zh'
    ? `第 ${String(currentFortune.id).padStart(2,'0')} 籤 · ${currentFortune.ganzhi}`
    : `Lot ${String(currentFortune.id).padStart(2,'0')} · ${currentFortune.ganzhi}`;
}

function resetShaker() {
  const shaker = $('#fortune-shaker');
  shaker.classList.remove('is-shaking', 'lot-rising');
  $('#selected-stick').textContent = '';
  $('#draw-status').classList.remove('visible');
  $('#begin-btn').disabled = false;
  isDrawing = false;
  $('[data-i18n="begin"]').textContent = t().begin;
}

function beginDraw() {
  if (isDrawing) return;
  isDrawing = true;
  confirmation = createConfirmationState();
  resetJiaobeiVisual();
  currentFortune = drawFortune(FORTUNES, Math.random, lastFortuneId);
  lastFortuneId = currentFortune.id;

  const shaker = $('#fortune-shaker');
  const button = $('#begin-btn');
  button.disabled = true;
  button.textContent = t().drawing;
  $('#selected-stick').textContent = lang === 'zh' ? `第${currentFortune.id}籤` : `#${currentFortune.id}`;
  $('#draw-status').classList.add('visible');
  shaker.classList.remove('lot-rising');
  void shaker.offsetWidth;
  shaker.classList.add('is-shaking');

  setTimeout(() => shaker.classList.add('lot-rising'), 1050);
  setTimeout(() => {
    renderConfirmHeader();
    renderJiaobeiStatus();
    shaker.classList.remove('is-shaking', 'lot-rising');
    isDrawing = false;
    button.disabled = false;
    button.textContent = t().begin;
    showScreen('confirm');
  }, 2200);
}

function resetJiaobeiVisual() {
  $('#jiaobei-left').className = 'jiao-piece left';
  $('#jiaobei-right').className = 'jiao-piece right';
  $('#jiaobei-result').textContent = '';
  $('#jiaobei-desc').textContent = '';
  $('#redraw-btn').hidden = true;
  $('#toss-btn').hidden = false;
  $('#toss-btn').disabled = false;
}

function renderJiaobeiStatus(lastResult = null) {
  const dots = $$('#sheng-progress span');
  dots.forEach((dot, i) => dot.classList.toggle('done', i < confirmation.shengCount));
  $('#progress-text').textContent = confirmation.confirmed ? t().confirmed : t().progress(confirmation.shengCount);
  $('#toss-btn').textContent = confirmation.shengCount ? t().tossAgain : t().toss;

  if (lastResult) {
    $('#jiaobei-result').textContent = t()[lastResult];
    $('#jiaobei-desc').textContent = t()[`${lastResult}Desc`];
  }

  if (confirmation.failed) {
    $('#toss-btn').hidden = true;
    $('#redraw-btn').hidden = false;
    $('#redraw-btn').textContent = t().redraw;
  }

  if (confirmation.confirmed) {
    $('#toss-btn').hidden = true;
    setTimeout(() => {
      renderResult();
      showScreen('result');
    }, 900);
  }
}

function toss() {
  if (isTossing || confirmation.confirmed || confirmation.failed) return;
  isTossing = true;
  const left = $('#jiaobei-left');
  const right = $('#jiaobei-right');
  left.classList.add('tossing');
  right.classList.add('tossing');
  $('#toss-btn').disabled = true;
  $('#jiaobei-result').textContent = '';
  $('#jiaobei-desc').textContent = '';

  setTimeout(() => {
    const result = tossJiaobei();
    left.className = `jiao-piece left face-${result.left}`;
    right.className = `jiao-piece right face-${result.right}`;
    confirmation = applyJiaobeiResult(confirmation, result.outcome);
    renderJiaobeiStatus(result.outcome);
    $('#toss-btn').disabled = false;
    isTossing = false;
  }, 900);
}

function gradeClass(grade) {
  return `grade-${grade.replace('_','-')}`;
}

function fullMeaningText(fortune) {
  const summary = lang === 'zh' ? fortune.summaryZh : fortune.summaryEn;
  const advice = lang === 'zh' ? fortune.adviceZh : fortune.adviceEn;
  return `${t().meaningLead}${summary} ${advice}`;
}

function referenceText(fortune) {
  const profile = categoryProfiles[lang][fortune.grade];
  const specific = lang === 'zh' ? fortune.adviceZh : fortune.adviceEn;
  return `${t().referenceLead}${specific} ${profile.general}`;
}

function renderResult() {
  if (!currentFortune) return;
  const isZh = lang === 'zh';
  $('#result-number').textContent = isZh
    ? `第 ${String(currentFortune.id).padStart(2,'0')} 籤`
    : `Lot ${String(currentFortune.id).padStart(2,'0')}`;
  $('#result-ganzhi').textContent = currentFortune.ganzhi;
  const badge = $('#grade-badge');
  badge.textContent = t().grade[currentFortune.grade];
  badge.className = `grade-badge ${gradeClass(currentFortune.grade)}`;

  const poem = isZh ? currentFortune.poemZh : currentFortune.poemEn;
  $('#poem-lines').innerHTML = poem.map(line => `<p>${line}</p>`).join('');
  $('#meaning-text').textContent = fullMeaningText(currentFortune);
  $('#reference-text').textContent = referenceText(currentFortune);

  const profile = categoryProfiles[lang][currentFortune.grade];
  const order = ['career','finance','love','health','travel','legal','family'];
  $('#category-grid').innerHTML = order.map(key => `
    <article class="reading-card">
      <h4>${t().categories[key]}</h4>
      <p>${profile[key]}</p>
    </article>`).join('');
}

function buildCopyText() {
  const isZh = lang === 'zh';
  const poem = (isZh ? currentFortune.poemZh : currentFortune.poemEn).join('\n');
  const number = isZh ? `第 ${currentFortune.id} 籤 · ${currentFortune.ganzhi}` : `Lot ${currentFortune.id} · ${currentFortune.ganzhi}`;
  return `${t().siteTitle}
${number}
${t().grade[currentFortune.grade]}

${t().poem}
${poem}

${t().fullMeaning}
${fullMeaningText(currentFortune)}

${t().reference}
${referenceText(currentFortune)}

${t().disclaimer}`;
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(buildCopyText());
    const btn = $('#copy-btn');
    const original = t().copy;
    btn.textContent = t().copied;
    setTimeout(() => btn.textContent = original, 1400);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = buildCopyText();
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

$('#lang-toggle').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('fortune-lang', lang);
  applyLanguage();
});
$('#begin-btn').addEventListener('click', beginDraw);
$('#toss-btn').addEventListener('click', toss);
$('#redraw-btn').addEventListener('click', () => {
  showScreen('intro');
  resetShaker();
  setTimeout(beginDraw, 250);
});
$('#again-btn').addEventListener('click', () => {
  currentFortune = null;
  confirmation = createConfirmationState();
  resetJiaobeiVisual();
  resetShaker();
  showScreen('intro');
});
$('#copy-btn').addEventListener('click', copyResult);

applyLanguage();
resetShaker();
showScreen('intro');
