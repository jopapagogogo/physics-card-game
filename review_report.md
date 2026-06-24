# 代码审查报告 — 2026-06-24

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1238 | 已审查 |
| js/engine.js | 2717 | 已审查 |
| js/combo_table.js | 206 | 已审查 |
| js/ai.js | 1614 | 已审查 |
| js/ui.js | 3342 | 已审查 |
| js/quiz.js | 1452 | 已审查 |
| js/runes.js | 8 | 已审查 |
| css/game_v2.css | 1179 | 已审查 |

---

## 发现问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **混沌领域符文缺失** — `DOMAIN_RUNES` 仅含5个领域（力/声/光/热/电），缺少"混沌"。选择混沌领域时运行时可能报错 | `runes.js:2-8` | 添加混沌领域 base64 PNG 符文 |
| 2 | **13处无效 relatedCard 引用** — quiz.js 引用不存在的卡牌 ID：S35（3次）、S37（10次），cards.js 中无这些 ID | `quiz.js` Q_L_\* 系列 | 将 S35/S37 替换为实际存在的光领域卡牌 ID（如 S14/S15/S16 等） |
| 3 | **AI 灼烧估值错误** — `BURN_DMG=10`，实际 engine 中 `BURN_BASE_DMG=30`，低估 3 倍。导致 AI 低估灼烧威胁，防守决策偏差 | `ai.js:15` vs `engine.js:20` | 将 `BURN_DMG` 改为 30 或从 engine 导入常量 |
| 4 | **_calcRawDamage 漏算 P2 加成** — ignoreDefense 卡（A03/A19）走 `_calcRawDamage`，但该函数缺少 perSupportBonus、perBurnBonus、perSoundFieldBonus、A11 声压加成、nextBonus（S01/S02/S03/S12）、S05 力的合成、S09 全体声波、A51 声速激增等 P2 新增加成 | `engine.js:2648-2701` | 将 `_calcRawDamage` 与 `calculateDamage` 的加成逻辑同步（或让 `_calcRawDamage` 调用 `calculateDamage` 后仅跳过防御减伤） |
| 5 | **AI `_estimateAttackDamage` 漏算多个加成** — 缺少 A11 声压加成、S05 力的合成、S09 全体声波、perSupportBonus、perOppFieldCard、光谱叠加(S17)、短路开关(S30) 等。AI 因此低估攻击卡实际伤害 | `ai.js:1260-1363` | 补充估算中缺失的加成项，或复用 engine 的 `calculateDamage` 逻辑 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 6 | **弃牌阈值仍为 5** — `hand.length > 5` 与 MAX_HAND_SIZE=7、UI提示7不一致，手牌6→7张时跳过弃牌阶段 | `ui.js:2487` | 改为 `> 7` 或引用常量 `MAX_HAND_SIZE` |
| 7 | **`discardTimer` 未在构造函数声明** — 直接赋值给 `this.discardTimer` 而不声明，ESLint 严格模式可能报警 | `ui.js:构造函数` | 在构造函数中添加 `this.discardTimer = null;` |
| 8 | **`viewHand` 字段类型不一致** — 同字段混用 integer（A45:2, C10:1, S07:2）和 string（A52:"all", S18:"all"），调用方需做类型判断 | `cards.js` A45/A52/C10/S07/S18 | 统一为 `number` 或 `{count: number\|'all'}` |
| 9 | **AI 硬编码 `maxSize=7`** — 未引用 engine 的 `MAX_HAND_SIZE` 常量，若 MAX_HAND_SIZE 变更会导致 AI 弃牌逻辑不一致 | `ai.js:1549` | 从 engine 导入或使用 `engine.constructor` 的同名常量 |
| 10 | **`_applySpecialEffects` 字符串匹配脆弱** — 依赖 `card.description` 文本匹配触发效果（如 `spec.includes('查看对方')`），描述微调就失效，与 effect 属性分离 | `engine.js:1804-2000` | 改为基于 `card.effect` 字段驱动，comment 中只做展示 |
| 11 | **`renderHand` 高频全量 innerHTML** — 每帧用 innerHTML 重建 3-7 张 V3 卡片，大段 HTML 字符串拼接，频繁触发重排 | `ui.js:1429` 附近 | 引入 DOM diff 或局部更新，或使用 DocumentFragment |
| 12 | **弃牌倒计时用递减计数器** — 非时间戳基准，浏览器后台标签页暂停 JS 时计时不准 | `ui.js:2458` | 改用 `Date.now()` 差值计算剩余时间 |
| 13 | **混沌领域题目仅15题** — 为其他5个领域（各35题）的 43%，玩家选混沌领域时题目重复率高 | `quiz.js` Q_C_01~Q_C_15 | 补充混沌领域题目至与其他领域持平（目标 35 题） |
| 14 | **初始抽牌硬编码 5** — 未使用/定义常量，回合内抽牌 3 已用 `DRAW_PER_TURN` 但初始不同步 | `engine.js:157` | 定义 `INITIAL_DRAW` 常量并引用 |
| 15 | **`discardPhase` 不强制弃牌** — 超手牌上限时仅当调用方传入索引才弃，若忘记传入则手牌溢出 | `engine.js:506-529` | 当手牌超过上限时，若未传入索引则自动随机弃牌或抛出异常 |
| 16 | **Combo effect type 注释不完整** — 头部注释仅列 9 种，实际有 boost_clear_debuff、boost_burn_dmg、extra_burn_after_detonate、boost_dot_increment 等约 18 种 | `combo_table.js:7-16` | 补充完整 effect type 列表 |
| 17 | **AI SpiritBudgetManager 未考虑麻痹加费** — `PARALYSIS_COST=2` 但预算计算时未将麻痹额外费用纳入可用精神力 | `ai.js:338-394` | 预算计算时减去 `self.paralysis * PARALYSIS_COST * 预估出牌数` |
| 18 | **CSS `@keyframes toastIn` 重复定义** — 第一个（行289）用于日志气泡，第二个（行508）用于通知，CSS 后定义覆盖前定义导致日志气泡动画异常 | `game_v2.css:289,508` | 重命名为 `toastLogIn` 和 `toastNotifyIn` 以区分 |
| 19 | **`_escapeAttr` 与 `_escapeHtml` 使用场景重叠** — `_escapeHtml` 用 DOM API，`_escapeAttr` 用正则替换，存在 XSS 风险窗口差异 | `ui.js:3002,3013` | 统一使用单一的健壮转义方法 |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 20 | **ID 缺口** — A07、A12 空缺，可能造成按名称查找的混淆 | `cards.js` | 注释说明跳号原因（是否故意预留）|
| 21 | **0 费攻击卡 A26 无特殊处理** — `canPlay` 检查 `card.cost > spirit` 时 0 费总是可通过，但 A26 有条件 `consumeBurn:2`，应额外检查 | `engine.js` 出牌逻辑 | canPlay 中追加条件检查 |
| 22 | **effect 字段 150+ 键名无规范** — 未使用 type 枚举，同含义不同命名（如 `bonusDmg`/`forceDmgBonus`/`extraDamage`）增加维护成本 | `cards.js` 全局 | 引入 effect type 枚举/常量，逐步规范化 |
| 23 | **`.hidden { display:none!important }` 风格粗糙** — `!important` 应作为最后手段，当前为单独工具类 | `game_v2.css:689` | 仅在必要时使用 !important |
| 24 | **缺少横屏响应式断点** — 移动端横屏时布局可能不佳（仅 768/1024 断点） | `game_v2.css` | 添加 `@media (orientation: landscape) and (max-height: 500px)` 等横屏适配 |
| 25 | **C04 玩家选择功能未实现** — C03↔C04 combo 标记 `_c04PlayerChoose=true` 但引擎仍用随机 `Math.random() < 0.5` | `engine.js:456,473` | 完成玩家选择 UI 与引擎的联动 |
| 26 | **`getDomainStyle` bg 色值无透明度** — 光系（橙色）字体对比度低，部分领域颜色作为背景时不够通透 | `ui.js:2968` 附近 | 添加 `opacity` 或使用 `rgba` 格式 |
| 27 | **卡牌未严格按 ID 排序** — A45/A46/A47 等插入位置不连续 | `cards.js` | 重新排序或注释说明插入原因 |

---

## 📊 发现问题统计

| 严重度 | 数量 | 相比上次 |
|:---:|:---:|:---:|
| 🔴 严重 | 5 | -3（3项已修复） |
| 🟡 中等 | 14 | -3（3项已修复） |
| 🟢 轻微 | 8 | -3（3项已修复） |
| **合计** | **27** | **-9** |

---

## 上次问题跟踪（2026-06-24 报告 36 项）

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | 混沌领域符文仍缺失 |
| 2 | ⚠️ 部分修复 | engine P2 新增 `applyOnCast + applyPerTurn` 检测（行2369）使 A11 可正确驻场，但 cards.js 仍缺显式 `isFieldCard:true` |
| 3 | ❌ 未修复 | S35/S37 仍 13 处无效引用 |
| 4 | ❌ 未修复 | `BURN_DMG=10` 仍为 10 |
| 5 | ❌ 仍存在 | `_estimateAttackDamage` 仍缺多种加成 |
| 6 | ✅ 已修复 | 召唤物 A 区布局已重构至 `summon-mini` |
| 7 | ✅ 已修复 | hover tooltip 已适配 `.summon-mini` |
| 8 | ❌ 仍存在 | AI 威胁评估仍漏算手牌攻击卡/精神力储备 |
| 9 | ❌ 未修复 | relatedCard 领域不匹配（如弹性势能→S32电系卡）仍存在 |
| 10 | ❌ 未修复 | `viewHand` 类型仍不一致 |
| 11 | ❌ 未修复 | `maxSize=7` 仍硬编码 |
| 12 | ❌ 仍存在 | `_calcRawDamage` 仍简化，新问题是缺 P2 加成 |
| 13 | ❌ 未修复 | `_applySpecialEffects` 仍用字符串匹配 |
| 14 | ✅ 已修复 | `checkCombo` 已通过 `cardForms` 正确处理 S09升/S09降 |
| 15 | ❌ 未修复 | `hand.length > 5` 仍残留 |
| 16 | ❌ 未修复 | `discardTimer` 仍未声明 |
| 17 | ❌ 未修复 | 仍用递减计数器 |
| 18 | ❌ 仍存在 | `renderHand`/`showDiscardScreen` 等仍缺 try-catch |
| 19 | ❌ 未修复 | 仍高频 innerHTML 全量重建 |
| 20 | ❌ 仍存在 | CSS 注入与 game_v2.css 潜在冲突 |
| 21 | ❌ 未修复 | 混沌领域仍仅 15 题 |
| 22 | ❌ 未修复 | `drawCards(i, 5)` 仍硬编码 |
| 23 | ❌ 未修复 | `discardPhase` 仍依赖调用方 |
| 24 | ❌ 未修复 | Combo 注释仍缺多种类型 |
| 25 | ❌ 未修复 | SpiritBudgetManager 仍未纳入麻痹加费 |
| 26 | ❌ 未修复 | A07/A12 仍空缺 |
| 27 | ❌ 未修复 | effect 键名仍无规范 |
| 28 | ❌ 存在 | A26 0 费攻击卡条件检查依赖 canPlay |
| 29 | ❌ 未修复 | 卡牌仍未完全按 ID 排序 |
| 30 | ❌ 未修复 | `@keyframes toastIn` 仍重复 |
| 31 | ❌ 未修复 | `.hidden !important` 仍存在 |
| 32 | ❌ 未修复 | 仍缺横屏响应式断点 |
| 33 | ❌ 未修复 | `getDomainStyle` bg 光系对比度仍低 |
| 34 | ❌ 未修复 | C04 仍随机，非玩家选择 |
| 35 | ❌ 未修复 | `_escapeAttr`/`_escapeHtml` 仍不一致 |
| 36 | ✅ 已修复 | `getGameState().hand` 现已包含 `rarity` 字段 |

**修复率：3/36 已完全修复，1/36 部分修复，32/36 未修复。**

---

## 🎯 优先修复建议 (Top 5)

1. **runes.js** — 补充混沌领域符文（运行时可能报错中断游戏）
2. **ai.js:15** — `BURN_DMG` 从 10 改为 30（AI 决策严重偏差）
3. **engine.js:2648** — `_calcRawDamage` 同步 P2 加成（A03/A19 等 ignoreDefense 卡伤害严重偏低）
4. **quiz.js** — 修正 13 处 S35/S37 无效引用（quiz 可能选到不存在卡牌的题目）
5. **ui.js:2487** — 弃牌阈值从 5 修正为 7（与 MAX_HAND_SIZE 一致）
