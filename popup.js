// 统计数据
let stats = {
  totalSessions: 0,
  todaySessions: 0,
  streak: 0,
  dailyLog: {}
};

// 加载统计数据
async function loadStats() {
  const result = await chrome.storage.sync.get(['stats']);
  const today = new Date().toDateString();

  if (result.stats) {
    stats = result.stats;
    document.getElementById('totalSessions').textContent = stats.totalSessions || 0;
    document.getElementById('todaySessions').textContent = stats.dailyLog?.[today] || 0;
    document.getElementById('streak').textContent = stats.streak || 0;
  } else {
    document.getElementById('totalSessions').textContent = '0';
    document.getElementById('todaySessions').textContent = '0';
    document.getElementById('streak').textContent = '0';
  }
}

// 渲染成就
function renderAchievements() {
  const grid = document.getElementById('achievementGrid');
  grid.innerHTML = '';

  ACHIEVEMENTS.forEach(achievement => {
    const unlocked = achievement.check(stats);
    const div = document.createElement('div');
    div.className = 'achievement' + (unlocked ? ' unlocked' : '');
    div.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    `;
    grid.appendChild(div);
  });
}

// 打开练习窗口
function openExercise() {
  chrome.windows.create({
    url: 'exercise.html',
    type: 'popup',
    width: 500,
    height: 600
  });
}

// 打开设置窗口
function openSettings() {
  chrome.windows.create({
    url: 'settings.html',
    type: 'popup',
    width: 400,
    height: 600
  });
}

// 打开帮助窗口
function openHelp() {
  chrome.windows.create({
    url: 'help.html',
    type: 'popup',
    width: 400,
    height: 600
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  renderAchievements();

  document.getElementById('startNow').addEventListener('click', openExercise);
  document.getElementById('helpBtn').addEventListener('click', openHelp);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
});
