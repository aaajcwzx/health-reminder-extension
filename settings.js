// DOM元素
const enableToggle = document.getElementById('enableToggle');
const trainingPlanSelect = document.getElementById('trainingPlanSelect');
const planDescription = document.getElementById('planDescription');
const intervalSelect = document.getElementById('intervalSelect');
const customIntervalGroup = document.getElementById('customIntervalGroup');
const customIntervalInput = document.getElementById('customInterval');
const repsSelect = document.getElementById('repsSelect');
const repsGroup = document.getElementById('repsGroup');
const contractSelect = document.getElementById('contractSelect');
const contractGroup = document.getElementById('contractGroup');
const relaxSelect = document.getElementById('relaxSelect');
const relaxGroup = document.getElementById('relaxGroup');
const startTimeSelect = document.getElementById('startTimeSelect');
const endTimeSelect = document.getElementById('endTimeSelect');
const lunchBreakToggle = document.getElementById('lunchBreakToggle');
const lunchStartSelect = document.getElementById('lunchStartSelect');
const lunchEndSelect = document.getElementById('lunchEndSelect');
const lunchStartGroup = document.getElementById('lunchStartGroup');
const lunchEndGroup = document.getElementById('lunchEndGroup');
const soundToggle = document.getElementById('soundToggle');
const dailyGoalSelect = document.getElementById('dailyGoalSelect');
const breakReminderToggle = document.getElementById('breakReminderToggle');
const privacyToggle = document.getElementById('privacyToggle');
const exportDataBtn = document.getElementById('exportData');
const importDataBtn = document.getElementById('importData');
const clearDataBtn = document.getElementById('clearData');
const importFileInput = document.getElementById('importFile');
const backBtn = document.getElementById('backBtn');

// 初始化：加载保存的设置
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'interval', 'enabled', 'reps', 'contractDuration', 'relaxDuration',
    'startTime', 'endTime', 'lunchBreakEnabled', 'lunchStartTime', 'lunchEndTime',
    'soundEnabled', 'dailyGoal', 'breakReminderEnabled', 'privacyMode', 'trainingPlan'
  ]);

  // 如果enabled未设置，保存默认值true
  if (settings.enabled === undefined) {
    await saveSettings('enabled', true);
    settings.enabled = true;
  }

  enableToggle.checked = settings.enabled ?? true;

  // 训练方案设置
  const trainingPlan = settings.trainingPlan || 'custom';
  trainingPlanSelect.value = trainingPlan;
  updatePlanDescription(trainingPlan);
  updateCustomParametersVisibility(trainingPlan);

  const interval = settings.interval || 45;
  const presetValues = ['30', '45', '60', '90', '120'];

  if (presetValues.includes(String(interval))) {
    intervalSelect.value = interval;
  } else {
    intervalSelect.value = 'custom';
    customIntervalInput.value = interval;
    customIntervalGroup.style.display = 'flex';
  }

  repsSelect.value = settings.reps || 15;
  contractSelect.value = settings.contractDuration || 5;
  relaxSelect.value = settings.relaxDuration || 10;
  startTimeSelect.value = settings.startTime || 9;
  endTimeSelect.value = settings.endTime || 18;

  // 午休免打扰设置
  const lunchBreakEnabled = settings.lunchBreakEnabled ?? false;
  lunchBreakToggle.checked = lunchBreakEnabled;
  lunchStartSelect.value = settings.lunchStartTime || 12;
  lunchEndSelect.value = settings.lunchEndTime || 14;
  lunchStartGroup.style.display = lunchBreakEnabled ? 'flex' : 'none';
  lunchEndGroup.style.display = lunchBreakEnabled ? 'flex' : 'none';

  soundToggle.checked = settings.soundEnabled ?? false;
  dailyGoalSelect.value = settings.dailyGoal || 3;
  breakReminderToggle.checked = settings.breakReminderEnabled ?? false;
  privacyToggle.checked = settings.privacyMode ?? false;
}

// 更新方案描述
function updatePlanDescription(planKey) {
  const plan = TRAINING_PLANS[planKey];
  if (planKey === 'custom') {
    planDescription.classList.remove('show');
    return;
  }

  let html = `<strong>${plan.name}</strong> - ${plan.description}<br>每日目标：${plan.dailyGoal}组<ul>`;
  plan.sessions.forEach((session, index) => {
    html += `<li>${session.label}: ${session.reps}次 (${session.contractDuration}秒收缩 + ${session.relaxDuration}秒放松)</li>`;
  });
  html += '</ul>';

  planDescription.innerHTML = html;
  planDescription.classList.add('show');
}

// 更新自定义参数显隐
function updateCustomParametersVisibility(planKey) {
  const isCustom = planKey === 'custom';
  repsGroup.style.display = isCustom ? 'flex' : 'none';
  contractGroup.style.display = isCustom ? 'flex' : 'none';
  relaxGroup.style.display = isCustom ? 'flex' : 'none';
}

// 保存设置
async function saveSettings(key, value) {
  await chrome.storage.sync.set({ [key]: value });
}

// 显示反馈信息
function showFeedback(message) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback-toast';
  feedback.textContent = message;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.classList.add('hiding');
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// 启用/禁用提醒
enableToggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await saveSettings('enabled', enabled);

  chrome.runtime.sendMessage({
    action: 'toggleEnabled',
    enabled: enabled
  });

  showFeedback(enabled ? '提醒已启用 ✓' : '提醒已关闭');
});

// 训练方案切换
trainingPlanSelect.addEventListener('change', async (e) => {
  const planKey = e.target.value;
  const plan = TRAINING_PLANS[planKey];

  await saveSettings('trainingPlan', planKey);

  if (planKey !== 'custom') {
    // 预设方案：保存每日目标
    await saveSettings('dailyGoal', plan.dailyGoal);
    dailyGoalSelect.value = plan.dailyGoal;
  }

  updatePlanDescription(planKey);
  updateCustomParametersVisibility(planKey);
  showFeedback(`已切换到${plan.name} ✓`);
});

// 修改提醒间隔
intervalSelect.addEventListener('change', async (e) => {
  const value = e.target.value;

  if (value === 'custom') {
    customIntervalGroup.style.display = 'flex';
    customIntervalInput.focus();
  } else {
    customIntervalGroup.style.display = 'none';
    const interval = parseInt(value);
    await saveSettings('interval', interval);

    if (enableToggle.checked) {
      chrome.runtime.sendMessage({
        action: 'updateInterval',
        interval: interval
      });
    }

    showFeedback(`提醒间隔已设置为${interval}分钟 ✓`);
  }
});

// 自定义间隔输入
customIntervalInput.addEventListener('change', async (e) => {
  const interval = parseInt(e.target.value);

  if (interval < VALIDATION_RULES.interval.min || interval > VALIDATION_RULES.interval.max) {
    showFeedback(`间隔范围：${VALIDATION_RULES.interval.min}-${VALIDATION_RULES.interval.max}分钟`);
    return;
  }

  await saveSettings('interval', interval);

  if (enableToggle.checked) {
    chrome.runtime.sendMessage({
      action: 'updateInterval',
      interval: interval
    });
  }

  showFeedback(`提醒间隔已设置为${interval}分钟 ✓`);
});

// 练习参数设置
repsSelect.addEventListener('change', async (e) => {
  await saveSettings('reps', parseInt(e.target.value));
  showFeedback('练习次数已更新 ✓');
});

contractSelect.addEventListener('change', async (e) => {
  await saveSettings('contractDuration', parseInt(e.target.value));
  showFeedback('收缩时长已更新 ✓');
});

relaxSelect.addEventListener('change', async (e) => {
  await saveSettings('relaxDuration', parseInt(e.target.value));
  showFeedback('放松时长已更新 ✓');
});

// 工作时段设置
startTimeSelect.addEventListener('change', async (e) => {
  await saveSettings('startTime', parseInt(e.target.value));
  showFeedback('工作时段已更新 ✓');
});

endTimeSelect.addEventListener('change', async (e) => {
  await saveSettings('endTime', parseInt(e.target.value));
  showFeedback('工作时段已更新 ✓');
});

// 午休免打扰开关
lunchBreakToggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await saveSettings('lunchBreakEnabled', enabled);
  lunchStartGroup.style.display = enabled ? 'flex' : 'none';
  lunchEndGroup.style.display = enabled ? 'flex' : 'none';
  showFeedback(enabled ? '午休免打扰已启用 ✓' : '午休免打扰已关闭');
});

// 午休时段设置
lunchStartSelect.addEventListener('change', async (e) => {
  await saveSettings('lunchStartTime', parseInt(e.target.value));
  showFeedback('午休时段已更新 ✓');
});

lunchEndSelect.addEventListener('change', async (e) => {
  await saveSettings('lunchEndTime', parseInt(e.target.value));
  showFeedback('午休时段已更新 ✓');
});

// 音效开关
soundToggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await saveSettings('soundEnabled', enabled);
  showFeedback(enabled ? '音效已启用 ✓' : '音效已关闭');
});

// 每日目标设置
dailyGoalSelect.addEventListener('change', async (e) => {
  await saveSettings('dailyGoal', parseInt(e.target.value));
  showFeedback('每日目标已更新 ✓');
});

// 休息提醒开关
breakReminderToggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await saveSettings('breakReminderEnabled', enabled);

  chrome.runtime.sendMessage({
    action: 'toggleBreakReminder',
    enabled: enabled
  });

  showFeedback(enabled ? '休息提醒已启用 ✓' : '休息提醒已关闭');
});

// 隐私模式开关
privacyToggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await saveSettings('privacyMode', enabled);
  showFeedback(enabled ? '隐私模式已启用 ✓' : '隐私模式已关闭');
});

// 数据导出
exportDataBtn.addEventListener('click', async () => {
  const allData = await chrome.storage.sync.get(null);
  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `刚刚好-数据备份-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showFeedback('数据已导出 ✓');
});

// 数据导入
importDataBtn.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 限制文件大小
  if (file.size > VALIDATION_RULES.fileSize.max) {
    alert(`导入失败：文件过大（最大${VALIDATION_RULES.fileSize.max / 1024}KB）`);
    importFileInput.value = '';
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // 验证数据结构
    if (typeof data !== 'object' || data === null) {
      alert('导入失败：数据格式无效');
      importFileInput.value = '';
      return;
    }

    // 验证关键字段类型
    const rules = VALIDATION_RULES;
    if (data.interval !== undefined && (typeof data.interval !== 'number' || data.interval < rules.interval.min || data.interval > rules.interval.max)) {
      alert('导入失败：提醒间隔数据无效');
      importFileInput.value = '';
      return;
    }

    if (data.reps !== undefined && (typeof data.reps !== 'number' || data.reps < rules.reps.min || data.reps > rules.reps.max)) {
      alert('导入失败：练习次数数据无效');
      importFileInput.value = '';
      return;
    }

    if (confirm('导入数据会覆盖当前所有数据，确定继续吗？')) {
      await chrome.storage.sync.clear();
      await chrome.storage.sync.set(data);
      showFeedback('数据已导入 ✓');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (err) {
    alert('导入失败：文件格式错误');
  }
  importFileInput.value = '';
});

// 清空数据
clearDataBtn.addEventListener('click', async () => {
  if (confirm('确定要清空所有统计数据吗？此操作不可恢复！')) {
    if (confirm('再次确认：真的要清空吗？')) {
      await chrome.storage.sync.remove('stats');
      showFeedback('统计数据已清空 ✓');
      setTimeout(() => window.close(), 1000);
    }
  }
});

// 返回按钮
backBtn.addEventListener('click', () => {
  window.close();
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', loadSettings);
