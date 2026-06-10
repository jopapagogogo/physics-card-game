# 物理卡牌对战游戏 — 项目进度

> ⚠️ **给 AI 助手的指令**：
> - **开工第一步**：`git pull` 拉取最新代码和本文件。
> - 本文档是唯一权威的项目计划。代码中可能存在未完成的功能痕迹，不在当前范围内，请忽略。
> - **完工最后一步**：更新本文件 → `git add -A && git commit -m "描述" && git push`。全部不需要等用户提醒。

## 当前阶段

| 阶段 | 内容 | 状态 |
|------|------|:---:|
| Phase 1 | 109 张卡牌生成到 cards.js | ✅ 完成 |
| Phase 2 | Combo 系统重建（35 combo + engine.js 重写） | ✅ 完成 |
| Phase 3 | 可验证 AI 对战测试 | ✅ 完成 |
| Phase 4 | 剩余 combo 效果 + 召唤/领域被动 + UI 高亮 | ⬜ 待做 |

## Phase 3 核心改动

- 新增 `tests/combo.test.js`：34 个测试用例，覆盖 combo 检测、效果应用、AI 对战、大规模模拟
- 新增 `package.json`：vitest 测试框架配置
- 修复 `js/engine.js` 中 3 个 bug：
  1. **combo 检测时序 bug**：`checkCombo()` 原在卡牌效果处理之后执行，导致攻击卡无法读取 pendingCombo。修复为在效果处理前执行
  2. **combo 键格式 bug**：`checkCombo()` 只支持 `→` 分隔符，不支持 `↔`（召唤对冲）和 `vs`（跨领域对抗）。修复为三种格式均支持，`→` 方向敏感，`↔` 和 `vs` 方向不敏感
  3. **召唤物 combo 缺失**：`_handleSummon()` 未处理 pendingCombo 效果（如 C03↔C04 的 modify_flag）。修复为支持召唤物 combo 效果
- 50 局 AI 对战模拟：0 崩溃，combo 触发率 96-100%

## Phase 2 核心改动

- `js/combo_table.js`：35 个核心 combo 查找表，21 种效果类型
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
├── package.json        ← vitest 测试配置
├── css/game.css
├── js/
│   ├── cards.js        ← 109 张卡牌
│   ├── combo_table.js  ← 35 个 combo 定义
│   ├── engine.js       ← 核心引擎（已重写 checkCombo）
│   ├── ai.js           ← AI 逻辑
│   ├── ui.js           ← 界面层
│   └── quiz.js         ← 答题系统
└── tests/
    └── combo.test.js   ← Phase 3 测试套件（34 用例）
```

## 下一任务

Phase 4：实现剩余 7 种 combo 效果类型 + 召唤/领域被动 + UI 高亮。
