// 运动状态管理
let exerciseState = {
  isRunning: false,
  isPaused: false,
  currentPhase: 'ready', // ready, contract, relax, rest
  currentCount: 0,
  totalCount: 15,
  timeLeft: 5,
  totalProgress: 0,
  soundEnabled: false,
  privacyMode: false
};

// 阶段配置
let phases = {
  contract: { duration: 5, label: '保持' },
  relax: { duration: 10, label: '放松休息' },
  rest: { duration: 3, label: '准备下一次' }
};

// 加载用户设置
async function loadExerciseSettings() {
  const settings = await chrome.storage.sync.get([
    'reps', 'contractDuration', 'relaxDuration', 'soundEnabled', 'privacyMode'
  ]);

  exerciseState.totalCount = settings.reps || 15;
  phases.contract.duration = settings.contractDuration || 5;
  phases.relax.duration = settings.relaxDuration || 10;
  exerciseState.soundEnabled = settings.soundEnabled ?? false;
  exerciseState.privacyMode = settings.privacyMode ?? false;

  // 更新初始显示
  counterEl.textContent = `第 0 / ${exerciseState.totalCount} 次`;

  // 应用隐私模式
  if (exerciseState.privacyMode) {
    document.body.classList.add('privacy-mode');
  }
}

// 页面加载时初始化设置
loadExerciseSettings();

// DOM元素
const timerEl = document.getElementById('timer');
const phaseEl = document.getElementById('phase');
const counterEl = document.getElementById('counter');
const instructionEl = document.getElementById('instruction');
const progressBar = document.getElementById('progressBar');
const currentProgress = document.getElementById('currentProgress');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const skipBtn = document.getElementById('skipBtn');
const closeBtn = document.getElementById('closeBtn');
const exerciseView = document.getElementById('exerciseView');
const completionView = document.getElementById('completionView');
const restartBtn = document.getElementById('restartBtn');
const doneBtn = document.getElementById('doneBtn');

let timer = null;

// 开始练习
startBtn.addEventListener('click', () => {
  if (!exerciseState.isRunning) {
    startExercise();
  }
});

// 暂停/继续
pauseBtn.addEventListener('click', () => {
  if (exerciseState.isPaused) {
    resumeExercise();
  } else {
    pauseExercise();
  }
});

// 跳过当前次
skipBtn.addEventListener('click', () => {
  if (exerciseState.isRunning && !exerciseState.isPaused) {
    skipCurrent();
  }
});

// 关闭窗口
closeBtn.addEventListener('click', () => {
  if (exerciseState.isRunning && !exerciseState.isPaused) {
    if (confirm('练习进行中，确定要退出吗？')) {
      window.close();
    }
  } else {
    window.close();
  }
});

// 重新开始
restartBtn.addEventListener('click', () => {
  resetExercise();
  completionView.classList.remove('show');
  exerciseView.style.display = 'block';
  startExercise();
});

// 完成并关闭
doneBtn.addEventListener('click', () => {
  window.close();
});

// 开始运动
function startExercise() {
  exerciseState.isRunning = true;
  exerciseState.isPaused = false;
  exerciseState.currentPhase = 'contract';
  exerciseState.currentCount = 1;
  exerciseState.timeLeft = phases.contract.duration;

  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  skipBtn.classList.remove('hidden');

  updateDisplay();
  runTimer();
}

// 暂停练习
function pauseExercise() {
  exerciseState.isPaused = true;
  clearInterval(timer);
  pauseBtn.textContent = '继续';
  phaseEl.textContent = '⏸ 已暂停';
}

// 继续练习
function resumeExercise() {
  exerciseState.isPaused = false;
  pauseBtn.textContent = '暂停';
  updateDisplay();
  runTimer();
}

// 跳过当前次
function skipCurrent() {
  if (exerciseState.currentCount < exerciseState.totalCount) {
    exerciseState.currentCount++;
    exerciseState.currentPhase = 'contract';
    exerciseState.timeLeft = phases.contract.duration;
    updateDisplay();
  } else {
    completeExercise();
  }
}

// 运行计时器
function runTimer() {
  timer = setInterval(() => {
    exerciseState.timeLeft--;

    if (exerciseState.timeLeft <= 0) {
      nextPhase();
    }

    updateDisplay();
  }, 1000);
}

// 切换到下一个阶段
function nextPhase() {
  const { currentPhase, currentCount, totalCount } = exerciseState;

  if (currentPhase === 'contract') {
    // 收缩 -> 放松
    exerciseState.currentPhase = 'relax';
    exerciseState.timeLeft = phases.relax.duration;
    playPhaseSound('relax');
  } else if (currentPhase === 'relax') {
    // 放松 -> 准备下一次 或 完成
    if (currentCount < totalCount) {
      exerciseState.currentPhase = 'rest';
      exerciseState.timeLeft = phases.rest.duration;
      playPhaseSound('rest');
    } else {
      // 完成所有练习
      completeExercise();
      return;
    }
  } else if (currentPhase === 'rest') {
    // 准备 -> 收缩（下一组）
    exerciseState.currentCount++;
    exerciseState.currentPhase = 'contract';
    exerciseState.timeLeft = phases.contract.duration;
    playPhaseSound('contract');
  }
}

// 更新显示
function updateDisplay() {
  const { currentPhase, currentCount, totalCount, timeLeft } = exerciseState;

  // 更新计时器
  timerEl.textContent = timeLeft;

  // 更新阶段文字（使用隐私友好的描述）
  if (currentPhase === 'contract') {
    phaseEl.textContent = exerciseState.privacyMode ? '保持' : '保持';
    instructionEl.textContent = exerciseState.privacyMode ? '保持当前状态' : '收紧保持，感受肌肉的收缩';
  } else if (currentPhase === 'relax') {
    phaseEl.textContent = '放松休息';
    instructionEl.textContent = exerciseState.privacyMode ? '放松休息' : '完全放松，自然呼吸，休息一会';
  } else if (currentPhase === 'rest') {
    phaseEl.textContent = '准备下一次';
    instructionEl.textContent = exerciseState.privacyMode ? '准备下一次' : '调整呼吸，准备进行下一次';
  }

  // 更新计数
  counterEl.textContent = `第 ${currentCount} / ${totalCount} 次`;

  // 更新总进度条
  const progress = (currentCount / totalCount) * 100;
  progressBar.style.width = `${progress}%`;

  // 更新当前次进度条
  const phaseDuration = phases[currentPhase]?.duration || 5;
  const currentPhaseProgress = ((phaseDuration - timeLeft) / phaseDuration) * 100;
  currentProgress.style.width = `${currentPhaseProgress}%`;
}

// 完成练习
async function completeExercise() {
  clearInterval(timer);
  exerciseState.isRunning = false;

  // 保存统计数据
  await saveExerciseStats();

  // 更新完成页面文字（隐私友好）
  const completionText = document.getElementById('completionText');
  completionText.innerHTML = '已完成一组锻炼<br>坚持练习，保持健康';

  // 显示完成界面
  exerciseView.style.display = 'none';
  completionView.classList.add('show');

  // 播放完成音效（可选）
  playCompletionSound();
}

// 保存练习统计
async function saveExerciseStats() {
  const today = new Date().toDateString();
  const stats = await chrome.storage.sync.get(['stats']) || {};
  const currentStats = stats.stats || {
    totalSessions: 0,
    lastDate: null,
    streak: 0,
    dailyLog: {}
  };

  // 更新总次数
  currentStats.totalSessions++;

  // 更新每日记录
  if (!currentStats.dailyLog[today]) {
    currentStats.dailyLog[today] = 0;
  }
  currentStats.dailyLog[today]++;

  // 更新连续打卡
  if (currentStats.lastDate) {
    const lastDate = new Date(currentStats.lastDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStats.streak++;
    } else if (diffDays > 1) {
      currentStats.streak = 1;
    }
  } else {
    currentStats.streak = 1;
  }

  currentStats.lastDate = today;

  await chrome.storage.sync.set({ stats: currentStats });

  // 检查每日目标
  await checkDailyGoal(currentStats.dailyLog[today]);

  // 检查新成就
  await checkNewAchievements(currentStats);
}

// 检查新解锁的成就
async function checkNewAchievements(stats) {
  const unlockedAch = ACHIEVEMENTS.find(ach => ach.check(stats));
  if (unlockedAch) {
    setTimeout(() => {
      alert(`${unlockedAch.icon} 恭喜解锁成就：${unlockedAch.name}！`);
    }, 800);
  }
}

// 检查每日目标
async function checkDailyGoal(todaySessions) {
  const { dailyGoal } = await chrome.storage.sync.get('dailyGoal');
  const goal = dailyGoal || 3;

  if (goal > 0 && todaySessions === goal) {
    // 完成每日目标，显示祝贺
    setTimeout(() => {
      if (confirm(`🎉 恭喜完成今日目标（${goal}组）！\n\n要继续练习吗？`)) {
        resetExercise();
        completionView.classList.remove('show');
        exerciseView.style.display = 'block';
        startExercise();
      }
    }, 500);
  }
}

// 重置状态
function resetExercise() {
  clearInterval(timer);
  exerciseState = {
    isRunning: false,
    isPaused: false,
    currentPhase: 'ready',
    currentCount: 0,
    totalCount: 15,
    timeLeft: 5,
    totalProgress: 0
  };

  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  skipBtn.classList.add('hidden');
  pauseBtn.textContent = '暂停';

  phaseEl.textContent = '准备开始';
  instructionEl.textContent = '点击"开始练习"按钮，跟随提示完成锻炼';
  counterEl.textContent = `第 0 / ${exerciseState.totalCount} 次`;
  timerEl.textContent = '5';
  progressBar.style.width = '0%';
}

// 播放阶段切换音效
function playPhaseSound(phase) {
  if (!exerciseState.soundEnabled) return;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 不同阶段不同音调
    const frequencies = {
      contract: 600,
      relax: 400,
      rest: 500
    };

    oscillator.frequency.value = frequencies[phase] || 500;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.log('音效播放失败:', e);
  }
}

// 播放完成音效
function playCompletionSound() {
  if (!exerciseState.soundEnabled) return;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // 播放两个音符
    [800, 1000].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = audioContext.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (e) {
    console.log('音效播放失败:', e);
  }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // Space: 开始/暂停
  if (e.code === 'Space') {
    e.preventDefault();
    if (!exerciseState.isRunning) {
      startExercise();
    } else if (exerciseState.isPaused) {
      resumeExercise();
    } else {
      pauseExercise();
    }
  }

  // Escape: 关闭
  if (e.code === 'Escape') {
    e.preventDefault();
    if (exerciseState.isRunning && !exerciseState.isPaused) {
      if (confirm('练习进行中，确定要退出吗？')) {
        window.close();
      }
    } else {
      window.close();
    }
  }

  // S: 跳过
  if (e.code === 'KeyS' && exerciseState.isRunning && !exerciseState.isPaused) {
    e.preventDefault();
    skipCurrent();
  }

  // H: 快速最小化
  if (e.code === 'KeyH') {
    e.preventDefault();
    window.blur();
  }
});

// 窗口关闭时清理timer
window.addEventListener('beforeunload', () => {
  if (timer) {
    clearInterval(timer);
  }
});
