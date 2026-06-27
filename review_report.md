# 代码审查报告 — 2026-06-27

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1286 | 已审查 |
| js/engine.js | 2643 | 已审查 |
| js/combo_table.js | 221 | 已审查 |
| js/ai.js | 1637 | 已审查 |
| js/ui.js | 3525+ | 已审查 |
| js/quiz.js | 1452 | 已审查 |
| js/runes.js | 9 | 已审查 |
| css/game_v2.css | 1297 | 已审查 |
| css/game.css | 1182 | 已审查 |

---

## 发现新问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **game.css 中 `@keyframes toastIn` 重复定义且语义冲突** — `log-toast`（底部气泡日志）用 `translateX` 动画，`.toast`（顶部通知）用 `translateX + translateY`。后者定义覆盖前者，导致日志气泡动画行为不确定 | `game.css:290,509` | 将日志气泡动画改名为 `@keyframes logToastIn`（game_v2.css 已正确命名，game.css 遗漏） |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 2 | **engine.js S09 频率调节模式决策嵌入引擎层** — `_handleSupport` 中硬编码「有 A10 则选 low，否则选 high」的 AI 启发式逻辑，引擎本应仅处理已确定的模式 | `engine.js:1589-1610` | 将模式决策上移到调用方（UI/传入参数），引擎只负责执行选定模式 |
| 3 | **game_v2.css `.card-v3.mini.playable` 无效 `!important`** — 三阶级联（class + class + class）已足够高特异性，`!important` 仅增加未来覆盖难度 | `game_v2.css:1037` | 移除 `!important`，信任级联优先级 |
| 4 | **`card-v3:hover` 缺设备限制** — 与 `card-v3.mini:hover` 不同，完整尺寸卡片的 hover 未包在 `@media (hover:hover) and (pointer:fine)` 内 | `game_v2.css:1184-1188` | 移入媒体查询，避免移动端触摸黏滞 |
| 5 | **game.css 与 game_v2.css 的 `.game-container` 宽度策略分裂** — V1 有 `max-width:480px`（移动居中），V2 有 `width:100%`（P3 横屏全宽）。两个 CSS 文件同时加载时 `body` 元素可能被两种策略同时影响 | `game.css:29`, `game_v2.css:29` | 明确哪个 CSS 文件是当前权威版本，废弃另一个或通过 JS 动态选择加载 |
| 6 | **`_handleSummon` 中召唤物 HP 读取 `card.effect.hp` 而非 `card.hp`** — cards.js 中召唤物的 hp 在顶层 `card.hp`（如 C01: hp=360），effect 对象中无 `hp` 字段。导致召唤物 HP 回退到硬编码默认 200 | `engine.js:1747-1748` | 改为 `card.hp \|\| card.effect.hp \|\| 200` |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 7 | **`@keyframes rarity-rainbow` 在 game_v2.css 两处定义** — 第 1053 行和 1141 行各定义一次（V3 mini 稀有度段和全尺寸段各一份）。虽不冲突但冗余 | `game_v2.css:1053,1141` | 合并为一个 |
| 8 | **game.css 的 `@keyframes toastIn/toastOut` 与 game_v2.css 日志气泡动画重复** — V1 通知 toast 和 V2 日志气泡共用同名 keyframes | `game.css:509-516`, `game_v2.css:290-297` | 统一或完全分离 |
| 9 | **`_cardHasDomain` 对字符串 domain 用 `Array.isArray` 守卫** — 正确但 defensive，cards.js 中所有 domain 确为数组 | `ui.js:781-785` | 当前正确，暂无需修改 |

---

## 📊 问题统计

| 严重度 | 数量 | 相比上次 (2026-06-26) |
|:---:|:---:|:---:|
| 🔴 严重 | 1 | **首次发现** |
| 🟡 中等 | 5 | **首次发现** |
| 🟢 轻微 | 3 | **首次发现** |
| **本次新增合计** | **9** | — |

---

## 上次问题跟踪（2026-06-26 报告，46 项未修复 / 1 项部分改善）

> ⚠️ **Git 日志显示自 6/26 以来仅有 `5b2f5de 项目状态快照 2026-06-27` 一次提交，无任何代码修复。所有 45 项未修复问题维持原样。**

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | C04 仍用 `Math.random()`，`_c04PlayerChoose` 标记设置后从未读取 |
| 2 | ❌ 未修复 | canPlay 镜面迷宫副作用仍在 |
| 3 | ⚠️ 部分改善 | abc-row/d-zone/divider-row 类名引用有效，但 `max-height:500px` 仍过窄 |
| 4-46 | ❌ 未修复 | 全部 42 项未修复（详见 6/26 报告） |

**累计修复率：0/46 完全修复，1/46 部分改善。第七周无任何代码修复。**

---

## 🎯 本次优先修复建议 (Top 5)

1. **engine.js:1747-1748** — 召唤物 HP 读取字段错误：`card.effect.hp` 不存在，实际在 `card.hp`（C01~C14 均有此字段），导致所有召唤物 HP 回退到硬编码 200，严重偏离设计值（C01=360, C02=270, C03=240 等）
2. **game.css:290,509** — `@keyframes toastIn` 重复定义冲突：日志气泡与通知 toast 共用同名 keyframes，后者覆盖前者，导致战斗日志动画行为不确定
3. **engine.js:1589-1610** — S09 频率调节引擎层混入 AI 启发式：引擎应只执行已确定的模式，不应自行决策
4. **game.css vs game_v2.css 分裂** — 两个 CSS 文件同时存在且 `.game-container` 宽度策略矛盾，需明确权威版本
5. **game_v2.css:1184-1188** — 完整 V3 卡片 hover 缺设备限制，移动端触摸黏滞

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 所有卡牌数据统一从此读取 |
| effect 属性名直接使用 cards.js 字段名 | ⚠️ | 引擎多数遵守，但 `card.effect.hp`（应为 `card.hp`）违规 |
| approved_cards.json 为唯一定插图映射 | ✅ | UI 通过 `_loadCardArt()` 正确加载 |
| serve.cjs 启动服务 | ✅ | 存在 |
| git tag 标记版本 | ⚠️ | 最近无 tag（上次 report 时也无） |
| 收工 git add/commit/push | ⚠️ | 仅有一次状态快照提交，无实际代码变更 |

---

> 📝 报告生成时间：2026-06-27 12:30 GMT+8 | 审查工具：手动逐行审查 + 模式搜索 + Git diff
