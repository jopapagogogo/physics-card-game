# 物理卡牌对战游戏 — 项目进度

## 当前阶段

| 阶段 | 内容 | 状态 |
|------|------|:---:|
| Phase 1 | 109 张卡牌生成到 cards.js | ✅ 完成 |
| Phase 2 | Combo 系统重建（30 combo + engine.js 重写） | ✅ 完成 |
| Phase 3 | 可验证 AI 对战测试 | 🔜 下一步 |
| Phase 4 | 剩余 combo 效果 + 召唤/领域被动 + UI 高亮 | ⬜ 待做 |

## Phase 2 核心改动

- `js/combo_table.js`：30 个核心 combo 查找表，21 种效果类型
- `js/engine.js`：
  - `checkCombo()` 完全重写 — 查询 COMBO_TABLE（替代 3 条泛用规则）
  - `playCard()` 存 combo 效果到 `pendingCombo[playerIdx]`
  - `_handleAttack()` 应用 combo 效果（extra_damage/extra_burn/view_hand 等 8 种已实现）
  - 构造函数新增 `_a49NoDestroy`、`_pendingBurnAfterExplode`、`cardForms`
  - `startTurn()` 每回合清理 pendingCombo
- 7 种效果类型推迟到 Phase 4

## 文件结构

```
物理卡牌游戏/
├── index.html
├── PROJECT_STATUS.md   ← 本文件
├── css/game.css
└── js/
    ├── cards.js        ← 109 张卡牌
    ├── combo_table.js  ← 30 个 combo 定义
    ├── engine.js       ← 核心引擎（已重写 checkCombo）
    ├── ai.js           ← AI 逻辑
    ├── ui.js           ← 界面层
    └── quiz.js         ← 答题系统
```

## 下一任务

Phase 3：编写自动化测试脚本，用 AI 对战验证 combo 系统端到端正确性。
