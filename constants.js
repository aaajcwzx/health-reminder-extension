// 共享常量和配置

// 成就定义
const ACHIEVEMENTS = [
  { id: 'first', icon: '🌱', name: '初次尝试', desc: '完成首次练习', check: s => s.totalSessions >= 1 },
  { id: 'week', icon: '📅', name: '坚持7天', desc: '连续7天练习', check: s => s.streak >= 7 },
  { id: 'month', icon: '🏆', name: '满月成就', desc: '连续30天练习', check: s => s.streak >= 30 },
  { id: 'hundred', icon: '💯', name: '百炼成钢', desc: '累计100次练习', check: s => s.totalSessions >= 100 },
  { id: 'daily5', icon: '⭐', name: '勤奋之星', desc: '单日完成5次', check: s => Object.values(s.dailyLog || {}).some(v => v >= 5) },
  { id: 'streak14', icon: '🔥', name: '热情不减', desc: '连续14天练习', check: s => s.streak >= 14 }
];

// 默认设置
const DEFAULT_SETTINGS = {
  interval: 45,
  enabled: true,
  reps: 15,
  contractDuration: 5,
  relaxDuration: 10,
  startTime: 9,
  endTime: 18,
  soundEnabled: false,
  dailyGoal: 3,
  breakReminderEnabled: false,
  privacyMode: false
};

// 验证规则
const VALIDATION_RULES = {
  interval: { min: 1, max: 1440 },
  reps: { min: 1, max: 100 },
  contractDuration: { min: 3, max: 10 },
  relaxDuration: { min: 5, max: 15 },
  startTime: { min: 0, max: 23 },
  endTime: { min: 0, max: 24 },
  dailyGoal: { min: 0, max: 10 },
  fileSize: { max: 100 * 1024 } // 100KB
};
