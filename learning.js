const lessonSection = document.querySelector('#lesson');
const lessonContent = document.querySelector('#lesson-content');
const lessonSteps = [
  { label: '第 1 步 · 音标和口型', title: '先学会看发音提示', body: '今天不需要背完整张音标表。先看音标、摆口型，再把声音放进熟悉的词里。', type: 'pronunciation' },
  { label: '第 2 步 · 认识新单词', title: '先认识这 4 个词', body: '先看单词、音标和重音位置，再把口型练习用到问候里。', type: 'words' },
  { label: '第 3 步 · 看懂句子', title: '用英语介绍自己', body: '先看完整句子的轻重节奏，再试着自己慢慢读一遍。', type: 'sentence' },
  { label: '第 4 步 · 小测验', title: '选出正确答案', body: '做对或做错都没关系，这一步是帮你记得更牢。', type: 'quiz' },
  { label: '第 5 步 · 今天完成', title: '第一步，已经迈出来了。', body: '今天认识了音标、重音和问候句。明天继续学手机和电脑里常见的英文界面词。', type: 'finish' }
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

function showPronunciationHint(text) {
  document.querySelector('#lesson-feedback').textContent = text;
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

  if (current.type === 'pronunciation') {
    inner += `<div class="pronunciation-practice"><article><span class="phonetic-big">/iː/</span><h4>长音：嘴角微笑，声音拉长</h4><p>试着读 sheep /ʃiːp/，听起来像一个完整、拉长的元音。</p></article><article><span class="phonetic-big">/ɪ/</span><h4>短音：嘴巴放松，快速收住</h4><p>试着读 ship /ʃɪp/。和 sheep 对照，注意时长和口型。</p></article><article><span class="phonetic-big">/θ/</span><h4>舌尖轻放齿间，再送气</h4><p>读 think 时让气流通过舌尖和牙齿之间，不要发成“思”。</p></article><article><span class="phonetic-big">/ð/</span><h4>口型相同，加上声带振动</h4><p>读 this 时保持舌位，轻触喉咙感受振动。先慢读，再放进整词。</p></article></div><p class="tip-box">💡 看见 /ˈ/，它后面的音节要更突出。比如 hello /həˈloʊ/：前面轻读 /hə/，重读 /loʊ/。现在试着跟读三遍：慢读、正常速度、放进句子。</p>`;
  } else if (current.type === 'words') {
    inner += `<div class="word-grid">${wordList.map(([word, meaning, phonetic]) => `<article class="word-card"><button class="sound-button" data-say="${word}" aria-label="查看 ${word} 的发音提示">口型提示</button><strong>${word}</strong><span class="phonetic">${phonetic}</span><span class="word-meaning">${meaning}</span></article>`).join('')}</div><p class="example-line">整句节奏：<button class="inline-sound" data-say="Hello! My name is Ke.">查看重音提示</button></p>`;
  } else if (current.type === 'sentence') {
    inner += `<div class="sentence-card"><button class="sound-button" data-say="sentence">重音提示</button><p class="english-sentence">Hello! My name is <span>Ke</span>.</p><p class="translation">你好！我叫 Ke。</p><div class="sentence-breakdown"><span><b>HEL-lo</b><small>问候，第一拍稍重</small></span><i>·</i><span><b>my NAME</b><small>重音落在 name</small></span><i>·</i><span><b>is KE</b><small>姓名清楚说出</small></span></div></div><p class="tip-box">💡 <b>My name is …</b> 是“我的名字是……”。日常介绍自己时，也常说 <b>I'm …</b>。跟读时先慢慢分组，再连起来说。</p>`;
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
  lessonContent.querySelectorAll('[data-say]').forEach(button => button.addEventListener('click', () => {
    const hints = {
      hello: 'hello /həˈloʊ/：/h/ 轻轻送气；/ə/ 放松、轻读；/ˈloʊ/ 是重音，嘴唇由圆到略展开。',
      my: 'my /maɪ/：从开口的 /a/ 滑向 /ɪ/，合成一个音节，不要拆成两个音。',
      name: 'name /neɪm/：/eɪ/ 从稍开的口型滑向微笑口型，最后闭唇收在 /m/。',
      is: 'is /ɪz/：短促读 /ɪ/，结尾 /z/ 要有声带振动；手指轻触喉咙可以感觉到。',
      sentence: '整句按意群读：HEL-lo | my NAME | is KE。先慢读，熟悉后再连成自然语流。'
    };
    showPronunciationHint(hints[button.dataset.say] || '先看音标、摆好口型，再慢慢读出来。');
  }));
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
