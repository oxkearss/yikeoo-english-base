const params = new URLSearchParams(window.location.search);
const speechId = params.get('id');
const catalog = document.querySelector('#catalog');
const reader = document.querySelector('#reader');
const transcript = document.querySelector('#transcript');
const wordDialog = document.querySelector('#word-dialog');
const wordInfoButton = document.querySelector('#word-info-button');
let selectedWord = '';
let holdTimer;
let held = false;
let pointerStart;
let playbackId = 0;
const sentenceAudio = new Audio();

function makeWordButtons(text) {
  const fragment = document.createDocumentFragment();
  const pattern = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    fragment.append(document.createTextNode(text.slice(end, match.index)));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word';
    button.textContent = match[0];
    button.setAttribute('aria-label', `听 ${match[0]} 的发音，长按查看释义`);
    button.title = '点击听发音，长按查看释义';
    button.dataset.word = match[0];
    fragment.append(button);
    end = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(end)));
  return fragment;
}

function showCatalog() {
  const list = document.querySelector('#speech-list');
  speeches.forEach((speech, index) => {
    const link = document.createElement('a');
    link.className = 'speech-card';
    link.href = `?id=${encodeURIComponent(speech.id)}`;
    const number = document.createElement('span');
    number.className = 'speech-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const content = document.createElement('div');
    content.className = 'speech-card-content';
    const meta = document.createElement('p');
    meta.className = 'speech-meta';
    meta.textContent = `${speech.name}  /  ${speech.year}  ·  ${speech.category}`;
    const title = document.createElement('h3');
    title.textContent = speech.title;
    const english = document.createElement('p');
    english.className = 'speech-english';
    english.textContent = speech.englishTitle;
    const description = document.createElement('p');
    description.className = 'speech-description';
    description.textContent = speech.description;
    content.append(meta, title, english, description);
    const arrow = document.createElement('span');
    arrow.className = 'speech-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(number, content, arrow);
    list.append(link);
  });
}

function showReader(speech) {
  catalog.hidden = true;
  reader.hidden = false;
  document.title = `${speech.name}：${speech.title} · YIKEOO 演讲精听`;
  document.querySelector('#reader-meta').textContent = `${speech.name}  /  ${speech.year}  /  ${speech.category}`;
  document.querySelector('#reader-title').textContent = speech.title;
  document.querySelector('#reader-english-title').textContent = speech.englishTitle;
  document.querySelector('#reading-note').textContent = speech.note;
  document.querySelector('#speech-video').src = `https://www.youtube-nocookie.com/embed/${speech.youtube}${speech.start ? `?start=${speech.start}` : ''}`;
  document.querySelector('#speech-video').title = `${speech.name}演讲原视频`;
  document.querySelector('#video-link').href = `https://www.youtube.com/watch?v=${speech.youtube}${speech.start ? `&t=${speech.start}s` : ''}`;
  const source = document.querySelector('#source-link');
  source.href = speech.source;
  source.textContent = `${speech.sourceLabel} ↗`;
  speech.sentences.forEach(([english, chinese, highlight], index) => {
    const block = document.createElement('article');
    block.className = `sentence${highlight ? ' highlight' : ''}`;
    const en = document.createElement('p');
    en.className = 'sentence-en';
    en.append(makeWordButtons(english));
    const zh = document.createElement('p');
    zh.className = 'sentence-zh';
    zh.textContent = chinese;
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'sentence-play';
    play.dataset.sentence = english;
    play.dataset.audio = `audio/${speech.id}/${index}.mp3`;
    play.textContent = '▶ 听这句';
    play.setAttribute('aria-label', `朗读句子：${english}`);
    block.append(en, zh, play);
    transcript.append(block);
  });
}

function playAudio(src, message) {
  window.speechSynthesis?.cancel();
  const currentPlayback = ++playbackId;
  sentenceAudio.pause();
  sentenceAudio.src = src;
  const status = document.querySelector('#sound-status');
  status.textContent = '正在加载 AI 英语朗读…';
  sentenceAudio.play().then(() => {
    if (currentPlayback === playbackId) status.textContent = message;
  }).catch(() => {
    if (currentPlayback === playbackId) status.textContent = 'AI 朗读暂时无法播放，请检查网络后重试。';
  });
}

function speak(word) {
  const filename = word.toLowerCase().replace(/’/g, "'");
  playAudio(`audio/words/${encodeURIComponent(filename)}.mp3`, `正在朗读：${word}`);
}

async function openWordDetails(word) {
  selectedWord = word;
  wordInfoButton.hidden = false;
  document.querySelector('#word-dialog-title').textContent = word;
  document.querySelector('#word-phonetic').textContent = '正在查询音标…';
  const detail = document.querySelector('#word-meaning');
  detail.textContent = '正在查询词性和中文释义…';
  if (!wordDialog.open) wordDialog.showModal();
  const query = word.toLowerCase().replace(/’/g, "'");
  const lookup = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('lookup unavailable');
      return await response.json();
    } finally { clearTimeout(timeout); }
  };
  const [dictionary, translation] = await Promise.allSettled([
    lookup(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`),
    lookup(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en%7Czh-CN`)
  ]);
  if (!wordDialog.open || selectedWord !== word) return;
  const entry = dictionary.status === 'fulfilled' && Array.isArray(dictionary.value) ? dictionary.value[0] : null;
  const phonetic = entry?.phonetic || entry?.phonetics?.find((item) => item.text)?.text;
  document.querySelector('#word-phonetic').textContent = phonetic || '暂无音标，可点击下方按钮听发音。';
  const types = [...new Set((entry?.meanings || []).map((item) => item.partOfSpeech))];
  const labels = { noun: '名词', verb: '动词', adjective: '形容词', adverb: '副词', pronoun: '代词', preposition: '介词', conjunction: '连词', interjection: '感叹词', determiner: '限定词', exclamation: '感叹词', numeral: '数词', article: '冠词' };
  const translationText = translation.status === 'fulfilled' && translation.value?.responseStatus === 200 ? translation.value?.responseData?.translatedText : '';
  detail.replaceChildren();
  const pos = document.createElement('p');
  pos.textContent = `词性：${types.length ? types.map((type) => `${labels[type] || type} (${type})`).join('、') : '暂未查到'}`;
  const meaning = document.createElement('p');
  meaning.textContent = `中文参考：${translationText || '暂未查到，请稍后重试'}`;
  detail.append(pos, meaning);
}

transcript.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('button[data-word]');
  if (!button || event.button !== 0) return;
  held = false;
  pointerStart = { x: event.clientX, y: event.clientY };
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => { held = true; openWordDetails(button.dataset.word); }, 550);
});
transcript.addEventListener('pointermove', (event) => {
  if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 12) clearTimeout(holdTimer);
});
for (const type of ['pointerup', 'pointercancel']) transcript.addEventListener(type, () => { clearTimeout(holdTimer); pointerStart = null; });
transcript.addEventListener('contextmenu', (event) => {
  const button = event.target.closest('button[data-word]');
  if (!button) return;
  event.preventDefault();
  clearTimeout(holdTimer);
  held = true;
  openWordDetails(button.dataset.word);
});
transcript.addEventListener('click', (event) => {
  const wordButton = event.target.closest('button[data-word]');
  const sentenceButton = event.target.closest('button[data-sentence]');
  if (wordButton) {
    if (held) { held = false; return; }
    selectedWord = wordButton.dataset.word;
    wordInfoButton.hidden = false;
    wordInfoButton.textContent = `查看 ${selectedWord} 的释义`;
    speak(selectedWord);
  } else if (sentenceButton) {
    playAudio(sentenceButton.dataset.audio, '正在播放 AI 英语朗读');
  }
});
wordInfoButton.addEventListener('click', () => { if (selectedWord) openWordDetails(selectedWord); });
document.querySelector('#close-word-dialog').addEventListener('click', () => wordDialog.close());
document.querySelector('#word-pronounce').addEventListener('click', () => speak(selectedWord));

document.querySelector('#highlights-toggle').addEventListener('click', (event) => {
  const enabled = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(enabled));
  event.currentTarget.textContent = enabled ? '查看全部句子' : '只看经典句';
  transcript.classList.toggle('highlights-only', enabled);
});

if (!speechId) showCatalog();
else {
  const speech = speeches.find((item) => item.id === speechId);
  if (speech) showReader(speech);
  else { catalog.hidden = true; document.querySelector('#not-found').hidden = false; }
}
