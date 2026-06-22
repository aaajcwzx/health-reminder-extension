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
  privacyMode: false,
  trainingPlan: 'custom'
};

// 训练方案预设
const TRAINING_PLANS = {
  custom: {
    name: '自定义',
    description: '自由配置参数',
    dailyGoal: 3,
    sessions: [
      { reps: 15, contractDuration: 5, relaxDuration: 10 }
    ]
  },
  beginner: {
    name: '初级入门',
    description: '适合新手，建立基础',
    dailyGoal: 2,
    sessions: [
      { reps: 10, contractDuration: 3, relaxDuration: 3, label: '第1组 - 快速' },
      { reps: 10, contractDuration: 3, relaxDuration: 3, label: '第2组 - 快速' }
    ]
  },
  intermediate: {
    name: '进阶提升',
    description: '快慢结合，提升耐力',
    dailyGoal: 3,
    sessions: [
      { reps: 10, contractDuration: 3, relaxDuration: 3, label: '第1组 - 快速' },
      { reps: 10, contractDuration: 5, relaxDuration: 10, label: '第2组 - 慢速' },
      { reps: 5, contractDuration: 10, relaxDuration: 10, label: '第3组 - 保持' }
    ]
  },
  advanced: {
    name: '高级强化',
    description: '多层次训练，全面强化',
    dailyGoal: 4,
    sessions: [
      { reps: 15, contractDuration: 2, relaxDuration: 2, label: '第1组 - 快速' },
      { reps: 10, contractDuration: 5, relaxDuration: 5, label: '第2组 - 中速' },
      { reps: 8, contractDuration: 8, relaxDuration: 10, label: '第3组 - 慢速' },
      { reps: 5, contractDuration: 10, relaxDuration: 15, label: '第4组 - 保持' }
    ]
  }
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
