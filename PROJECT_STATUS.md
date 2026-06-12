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
| Phase 4 | 剩余 combo 效果 + 召唤/领域被动 + UI 高亮 | ✅ 完成 |

## Phase 4 核心改动

- **7 种剩余 combo 效果全部实现**：
  - `modify_height` (S01→A05)：A05 重力势能每层伤害 40→55
  - `boost_dot_increment` (S09→A45, 被 S09→A10 消耗)：A10 DOT 递增 13→16
  - `boost_mirror_maze` (S13→S34)：镜面迷宫失败概率 35%→65%
  - `boost_burn_cap` (S12→A55)：灼烧上限 10→15 层
  - `boost_clear_debuff` (S37→A20)：清除己方 DOT 效果
  - `boost_burn_dmg` (S19→A54)：A54 爆燃每层 48→65
  - `boost_ignore_defense` (S31→A49)：追加 30 点无视防御伤害
- **召唤被动**：C01(芝诺龟)/C02(麦克斯韦妖)/C04(薛定谔猫) 已实现，新增 C05(牛顿)力系+20伤害，C03(拉普拉斯妖)需UI配合推迟
- **领域被动**：通过卡牌设计体现，引擎层已有完整支持

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
  - `startTurn()` 每回合清理 pendingCombo 及 combo 临时状态

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

## Phase 5：赛博朋克卡牌艺术图批量生成 ✅ 完成

- **80 张卡牌赛博朋克风格艺术图**已生成，全部 1024×1536，暗色背景，中文脚注水印
- 存储位置：`art_samples/card_art/`
- 覆盖五大领域（力/声/光/热/电）的攻击卡、咒语卡、角色卡、领域卡
- 分 7 个批次并行生成：
  1. FORCE 领域 10 张（A03/A04/A05/A06/A08/A32/A43/S01/S02/S03）
  2. SOUND 领域 10 张（A09/A10/A13/A14/A45/S08/S10/S12/S13/D02）
  3. HEAT+ELEC 12 张（A21/A22/A23/A24/A25/A47/S22/S23/S24/A27/A28/A29）
  4. LIGHT+ELEC 12 张（A15/A16/A17/A18/A19/A20/A30/A44/A48/A49/S28/S29）
  5. BATCH5 12 张（C12/C13/C14/A31/A33/A34/A35/A36/A37/A40/S04/S05）
  6. BATCH6 12 张（S06/S07/S09/S11/S14/S15/S16/S17/S18/S20/S25/S26）
  7. BATCH7 12 张（C09/A46/A50/A52/S19/S21/S27/S30/S31/S32/S33/D01）

## 下一任务

全部 4 个 Phase 完成。后续可做：卡组构建器(Deck Builder)、题库扩展、UI 优化、平衡性调整。
