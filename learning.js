const lessonSection = document.querySelector('#lesson');
const lessonContent = document.querySelector('#lesson-content');
const lessonSteps = [
  { label: '第 1 步 · 认识新单词', title: '先认识这 4 个词', body: '先看单词和音标，跟着自己读一遍。不用急着背，先熟悉它们。', type: 'words' },
  { label: '第 2 步 · 看懂句子', title: '用英语介绍自己', body: '英语里可以这样说自己的名字。先读完整句子，再试着自己跟读。', type: 'sentence' },
  { label: '第 3 步 · 小测验', title: '选出正确答案', body: '做对或做错都没关系，这一步是帮你记得更牢。', type: 'quiz' },
  { label: '第 4 步 · 今天完成', title: '第一步，已经迈出来了。', body: '今天学会了问候和介绍名字。明天继续学 “I am…” 和简单的身份表达。', type: 'finish' }
];
const wordList = [
  ['hello', '你好；喂', '/həˈloʊ/'],
  ['my', '我的', '/maɪ/'],
  ['name', '名字', '/neɪm/'],
  ['is', '是', '/ɪz/']
];
let step = 0;
let quizIndex = 0;
let quizCorrect = 0;
let answered = false;

function say(text) {
  document.querySelector('#lesson-feedback').textContent = `发音音频还在准备中：${text}`;
}

function renderStep() {
  const current = lessonSteps[step];
  document.querySelector('#lesson-step-label').textContent = current.label;
  document.querySelector('#lesson-progress-fill').style.width = `${((step + 1) / lessonSteps.length) * 100}%`;
  document.querySelector('#lesson-back').hidden = step === 0;
  document.querySelector('#lesson-next').textContent = step === lessonSteps.length - 1 ? '完成今日学习 ✓' : '继续 →';
  document.querySelector('#lesson-feedback').textContent = '';
  answered = false;
  let inner = `<h3>${current.title}</h3><p class="step-description">${current.body}</p>`;

  if (current.type === 'words') {
    inner += `<div class="word-grid">${wordList.map(([word, meaning, phonetic]) => `<article class="word-card"><button class="sound-button" data-say="${word}" aria-label="播放 ${word} 发音">🔊</button><strong>${word}</strong><span class="phonetic">${phonetic}</span><span class="word-meaning">${meaning}</span></article>`).join('')}</div><p class="example-line">例句：<button class="inline-sound" data-say="Hello! My name is Ke.">🔊 播放整句</button></p>`;
  } else if (current.type === 'sentence') {
    inner += `<div class="sentence-card"><button class="sound-button" data-say="Hello! My name is Ke.">🔊</button><p class="english-sentence">Hello! My name is <span>Ke</span>.</p><p class="translation">你好！我叫 Ke。</p><div class="sentence-breakdown"><span><b>My name</b><small>我的名字</small></span><i>+</i><span><b>is</b><small>是 / 叫做</small></span><i>+</i><span><b>Ke</b><small>你的名字</small></span></div></div><p class="tip-box">💡 <b>My name is …</b> 是“我的名字是……”。日常介绍自己时，也常说 <b>I'm …</b>。</p>`;
  } else if (current.type === 'quiz') {
    const questions = [
      { q: '“Hello” 是什么意思？', options: ['谢谢', '你好', '再见'], answer: 1 },
      { q: '哪句话是在介绍自己的名字？', options: ['My name is Ke.', 'Good night.', 'See you!'], answer: 0 }
    ];
    const q = questions[quizIndex];
    inner += `<div class="quiz-card"><div class="quiz-count">QUESTION ${quizIndex + 1} / ${questions.length}</div><p class="quiz-question">${q.q}</p><div class="quiz-options">${q.options.map((option, i) => `<button class="quiz-option" data-option="${i}">${option}</button>`).join('')}</div></div>`;
  } else {
    inner += `<div class="finish-card"><span class="finish-star">✦</span><p>你完成了今天的 8 分钟英语练习</p><div class="finish-stats"><span>4 个新词</span><span>1 个实用句型</span><span>2 道小测题</span></div></div>`;
  }
  lessonContent.innerHTML = inner;
  lessonContent.querySelectorAll('[data-say]').forEach(button => button.addEventListener('click', () => say(button.dataset.say)));
  lessonContent.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click', () => checkAnswer(button)));
}

function checkAnswer(button) {
  if (answered) return;
  answered = true;
  const questions = [
    { answer: 1, correct: '没错，Hello 就是“你好”，也可以用来打招呼。' },
    { answer: 0, correct: '对，My name is… 可以用来介绍自己的名字。' }
  ];
  const question = questions[quizIndex];
  const right = Number(button.dataset.option) === question.answer;
  button.classList.add(right ? 'correct' : 'incorrect');
  if (right) quizCorrect++;
  if (!right) lessonContent.querySelector(`[data-option="${question.answer}"]`).classList.add('correct');
  document.querySelector('#lesson-feedback').textContent = right ? question.correct : `正确答案已标出。${question.correct}`;
  document.querySelector('#lesson-next').textContent = quizIndex === 0 ? '下一题 →' : '看学习结果 →';
}

document.querySelectorAll('[data-start-lesson]').forEach(button => button.addEventListener('click', () => {
  lessonSection.hidden = false;
  lessonSection.dataset.completed = 'false';
  step = 0;
  quizIndex = 0;
  quizCorrect = 0;
  renderStep();
  lessonSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelector('.close-lesson').addEventListener('click', () => { lessonSection.hidden = true; });
document.querySelector('#lesson-back').addEventListener('click', () => { if (step > 0) { step--; renderStep(); } });
document.querySelector('#lesson-next').addEventListener('click', () => {
  if (lessonSteps[step].type === 'quiz') {
    if (!answered) { document.querySelector('#lesson-feedback').textContent = '先选一个答案再继续哦。'; return; }
    if (quizIndex === 0) { quizIndex++; renderStep(); return; }
    step++;
    renderStep();
    return;
  }
  if (lessonSteps[step].type === 'finish') {
    if (lessonSection.dataset.completed === 'true') {
      lessonSection.hidden = true;
      return;
    }
    const today = new Date().toLocaleDateString('en-CA');
    const previous = localStorage.getItem('yikeoo-last-study-day');
    let streak = Number(localStorage.getItem('yikeoo-study-streak') || 0);
    if (previous !== today) {
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
      streak = previous === yesterday ? streak + 1 : 1;
      localStorage.setItem('yikeoo-last-study-day', today);
      localStorage.setItem('yikeoo-study-streak', streak);
    }
    localStorage.setItem('yikeoo-day-1-done', 'yes');
    lessonSection.dataset.completed = 'true';
    updateProgress();
    document.querySelector('#lesson-feedback').textContent = `今天完成！当前连续学习 ${streak} 天。学习记录保存在这台设备上。`;
    document.querySelector('#lesson-next').textContent = '完成并收起';
    return;
  }
  if (step < lessonSteps.length - 1) { step++; renderStep(); }
});

function updateProgress() {
  const completed = localStorage.getItem('yikeoo-day-1-done') === 'yes' ? 1 : 0;
  document.querySelector('#progress-text').textContent = `${completed} / 30 天`;
  document.querySelector('#overall-progress').style.width = `${(completed / 30) * 100}%`;
  if (completed) document.querySelector('.today-label').innerHTML = '<span class="live-dot"></span> TODAY COMPLETE';
}
updateProgress();
