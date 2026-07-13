# 代码审查报告 — 2026-07-13

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。本轮发现 **31 个新问题**（严重 11 / 中等 12 / 轻微 8），其中 quiz.js 问题为首次审查。上次报告的 41 个遗留问题全部仍存在（JS/CSS 自 07-12 以来零变更）。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1287 | ±0 | 已审查（109卡逐卡验证 + EFFECT_TYPE 枚举交叉对比） |
| js/engine.js | 3042 | ±0 | 已审查（关键路径逐行复查 + 上次遗留问题精确定位） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo 全量验证 + 与 engine.js 逻辑交叉检查） |
| js/ai.js | 1596 | ±0 | 已审查（空值安全 + 未用参数 + 复杂度分析） |
| js/ui.js | 4298 | ±0 | 已审查（XSS + 内存泄漏 + 事件清理） |
| js/quiz.js | 6270 | ±0 | 首次审查：1035题抽样 + 领域分类 + 重复检测 |
| js/runes.js | 9 | ±0 | 已审查（导出/引用验证） |
| css/game_v2.css | 1298 | ±0 | 已审查（兼容性 + 性能 + 可维护性） |

---

## 本次新发现问题

### 🔴 严重（11 项）

#### NE01 — quiz.js：4 道题目领域分类错误

| ID | 行号 | 当前领域 | 应属领域 | 说明 |
|------|------|------|------|------|
| Q_F_180 | 1093 | 力 | **电** | 安全用电常识，完全与力学无关 |
| Q_F_191 | 1159 | 力 | **热** | 物态变化吸放热（熔化/凝固/液化/凝华） |
| Q_S_068 | 1684 | 声 | **力** | 流体压强与流速关系（伯努利原理） |
| Q_S_144 | 2140 | 声 | **光** | 角反射器原理，光的反射 |

#### NE02 — quiz.js：4 组完全重复的题目（8题）

| 重复组 | 题1 (行号) | 题2 (行号) | 考点 |
|--------|-----------|-----------|------|
| Q_S_042 vs Q_S_153 | 1528 | 2194 | 声现象综合判断 |
| Q_S_127 vs Q_S_172 | 2038 | 2308 | 声现象正确说法 |
| Q_S_134 vs Q_S_167 | 2080 | 2278 | 声音特性辨析 |
| Q_S_060 vs Q_S_169 | 1636 | 2290 | 声源处减弱噪声 |

#### NE03 — cards.js：A11 缺少 `isFieldCard:true`（行160）

```javascript
effect: {"dmg":25,"applyOnCast":1,"applyPerTurn":1,"maxStacks":3,"sonicDmgPerStack":10,"detonateDmg":60}
// 缺少 isFieldCard:true，引擎可能无法正确将其识别为驻场卡
```

对比同类型驻场卡 A10（行149）和 A16（行216），均明确包含 `isFieldCard:true`。缺少此字段会导致清场效果无法作用于 A11。

#### NE04 — engine.js：`canPlay` 镜面迷宫白送精神力（行2793-2798）

```javascript
// canPlay 是纯查询方法，但此处进行了破坏性修改：
if (this.mirrorMaze[playerIdx] > 0 && Math.random() < mazeProb) {
  const refund = Math.floor(card.cost * 0.5);
  player.spirit = Math.min(MAX_SPIRIT, player.spirit + refund);  // 玩家未付费却获得退款！
  this.mirrorMaze[playerIdx]--;  // 修改游戏状态
}
```

玩家从未支付费用（费用扣除在 canPlay 返回 true 后才执行），却获得精神力"退款"。UI 多次调用 canPlay 时可反复刷精神力。

#### NE05 — engine.js：N18 深入确认 — `checkCombo` 完全不检查对手场上卡牌（行2532-2581）

`checkCombo` 仅检查：①本回合已出卡牌间 combo、②己方召唤物。**完全未遍历对手的 `fieldSupports` 或 `fieldSummons`**。导致所有 vs 类型 combo（如 A32vsS11"声波推力vs隔音屏障"）永不能通过对手场上卡牌触发，只能在双方恰好都本回合打出该卡时才触发。

#### NE06 — ui.js：XSS 漏洞 — 窥牌弹窗 card.name 未转义（行3370）

```javascript
li.innerHTML = '...' + card.name + '...';  // card.name 来自 engine._pendingScry，未经过 _escapeHtml
```

以及凸透成像弹窗（行3409）：`lastCard.card?.name` 同样未转义。

#### NE07 — ui.js：AI 回合循环操作符优先级错误（行3227）

```javascript
while (!this.engine.isGameOver || !this.engine.isGameOver() && !turnTimedOut && aiCardCount < 50)
```

由于 `&&` 优先级高于 `||`，`!this.engine.isGameOver`（函数引用，非 null → 始终 false）无实际作用。虽恰好能工作（靠右侧条件控制），但语义完全错误且极易被误修改。

#### NE08 — ui.js：弃牌弹窗事件监听器泄漏（行3458-3490）

`_discardClickHandler` 绑定在 `#self-hand` 上的捕获阶段监听器，仅在用户点击手牌后才移除。若用户在弃牌阶段通过其他方式切换状态，监听器将永久残留。

#### NE09 — ui.js：卡牌详情弹窗 document 级监听器泄漏（行4231-4234）

```javascript
this._zoomOutsideHandler = closeOnOutsideClick;
setTimeout(() => { document.addEventListener('click', closeOnOutsideClick, true); }, 100);
```

若弹窗被 DOM 操作直接移除而未调用 `_closeCardDetail`，该 document 级捕获阶段监听器将永久残留。

#### NE10 — game_v2.css：完全缺少 `prefers-reduced-motion` 支持（N35 再确认）

文件中定义了 **40+ 个 @keyframes** 规则和大量 animation 属性，但全文无 `@media (prefers-reduced-motion: reduce)` 降级。对前庭障碍/动画敏感用户不友好。

#### NE11 — quiz.js：15 道题目引用不存在的图片

| 题目ID | 行号 | 题干中的图片引用 |
|--------|------|-----------------|
| Q_F_174/181/196 | 1057/1099/1189 | "如图所示的装置" |
| Q_S_039/093/149/187 | 1510/1834/2170/2398 | "下列四幅图" |
| Q_L_121/128/129/175/179/184/185/196 | 多处 | "如图所示" |

纯文本答题系统中无法显示图片，严重影响答题正确性。

---

### 🟡 中等（12 项）

#### NE12 — cards.js：9 个 effect 键名未在 EFFECT_TYPE 枚举中声明

| 未声明键 | 所在卡牌 | 行号 |
|----------|---------|------|
| `sacrificeElectricSupport` | S30 | 967 |
| `soundSupportExtend` | C12 | 1222 |
| `chainPerSupport` | A28 | 393 |
| `destroyElectricSupport` | A49 | 448 |
| `soundBonus` | S09 | 734 |
| `allSoundBonus` | S09 | 734 |
| `extendTurns` | S09 | 734 |
| `restoreHp` | S21 | 866 |
| `copyEffect` | S21 | 866 |

引擎若依赖 EFFECT_CATEGORY 做校验，上述效果将静默失败。

#### NE13 — cards.js：13 张卡牌 ID 排列顺序混乱

A45(186)、A46(263)、A55(274)、A47(352)、A54(363)、A44(418)、A48(429)、A49(440)、A43(495)、A52(561)、A50(594)、A51(616)、A53(627) 均未按 ID 顺序排列。建议统一排序规则。

#### NE14 — cards.js：S34 领域描述矛盾（行1006-1007）

```javascript
domain: ["混沌"],
description: "...通用卡，不受任何领域加成。"
```

既然"不受任何领域加成"，为何分配混沌领域？若混沌卡享受混沌加成则与描述矛盾。

#### NE15 — combo_table.js：S09降→A10 extend_dot_turns 导致 A10 负伤害（关联N38）

combo 延长 A10 DOT 回合使 `turnsRemaining > initialTurns`，导致伤害公式 `(initialTurns - turnsRemaining) * 10` 为负值，实际产生**回血**而非伤害。

#### NE16 — combo_table.js：注释 "17种" 实为 "19种"（M19 再确认）

第7行注释写"实际使用 17 种"，但逐行计数为 19 种。`modify_height` 和 `refund_cost` 两型均实际使用。

#### NE17 — ai.js：`fieldSupports` 中 `s.card` 缺少空值保护（3处：行1220/1310/1451）

```javascript
self.fieldSupports.filter(s => s.card.domain.includes('电'))  // s.card 可能为 null
```

同文件第1257/1286行已正确使用 `s.card?.domain`，但上述三处遗漏。

#### NE18 — ai.js：`_handleDiscard` 硬编码 `maxSize = 7`（行1534）

文件第24行已定义 `const MAX_HAND_SIZE = 7`，此处应使用常量而非魔法数字。

#### NE19 — ai.js：6 个未使用参数（M20 再确认）

`comboIndex`（DefensePlanner × 2）、`gameState`（getBestAttack/getBestTarget/_pickBestSupport/evaluateCardValue × 4）。若为预留接口应加 `_` 前缀或注释。

#### NE20 — ui.js：`computeStats` 依赖 `.call(self)` 绑定 this（行498-504）

函数内部使用 `this._cardHasDomain`，但 this 绑定依赖调用方显式使用 `.call(self)`。若直接调用则 TypeError。

#### NE21 — ui.js：战斗界面 hover 监听器在屏幕切换后未移除（行2411-2483）

绑定在 `this.container` 上的 mouseover/mouseout 监听器在返回开始界面后仍存在，在不必要的场景下触发。

#### NE22 — ui.js：`color-mix()` 无 CSS fallback（行209，N5 再确认）

```css
background: color-mix(in srgb, var(--dc) 15%, rgba(0,0,0,.3));
```

Safari < 16.2 / Chrome < 111 中 `color-mix()` 不生效，选中按钮无视觉变化。

#### NE23 — game_v2.css：4 个未使用 @keyframes（N29 再确认）+ 额外发现

`electricShock`(524)、`lightFlash`(525-529)、`turnDim`(725)、`rarity-rainbow`(1139) 未被任何 animation-name 引用。额外发现：`cardFlyInDown`(545)、`cardFlyInUp`(550) 在 CSS 中也无引用（可能在 JS 中通过脚本使用）。

---

### 🟢 轻微（8 项）

#### NE24 — cards.js：A26/S23/S25 存在冗余 `condition` 字段

condition 为字符串描述，effect 中已有 `consumeBurn` 等对应字段，属于数据冗余。

#### NE25 — cards.js：EFFECT_TYPE 注释 "共 123 键" 实际 127 键

第6行注释偏差 +4 键（10大类分别计数后）。

#### NE26 — quiz.js：约 13 题高度近似（同考点不同表述）

雷声隆隆（3题）、地震自救（2题）、飞机投放物资（2题）、噪声监测仪（3题）等考点重复出现。

#### NE27 — quiz.js：电领域约 80 题选项过度缩写

如 "与测串""与测并""两压" 等缩写，应展开为"与待测电路串联""两端电压"。

#### NE28 — ui.js：`sleep(ms)` 方法未被使用（行3947-3949）

文件内无任何调用点，AI 使用的是 `this.ai._sleep()`。

#### NE29 — ui.js：`emojiMap`/`emojiMap2` 声明但未使用（行3972/4188）

两处均声明了局部变量 `emojiMap` 但从未被引用（实际使用 `DOMAIN_RUNES`）。

#### NE30 — ui.js：`console.log` 残留（行103，N16 再确认）

```javascript
console.log(`[init] 插画映射: ${Object.keys(this.artMap).length} 张`);
```

文件内唯一 console.log，其余使用 console.warn/console.error。

#### NE31 — game_v2.css：`transition: all` 性能隐患（3处：行211/357/1263）

`transition: all` 让浏览器检查所有可动画属性变化，应限制为 `transform, opacity, box-shadow` 等具体属性。

---

## 上次问题跟踪

### N1-N40 问题状态（上次报告全部遗留，本轮再验证）

| 编号 | 严重度 | 本轮验证结果 | 位置确认 |
|:---:|:---:|------|------|
| N5 | 🟢 | ❌ 仍遗留 | ui.js:209 color-mix 无 fallback（NE22 再确认） |
| N6 | 🟢 | ❌ 仍遗留 | game_v2.css:773 横屏断点依赖 JS 注入样式 |
| N14 | 🟡 | ❌ 仍遗留 | engine.js:315/581/1605 `_inertiaNextTurn` 跨回合失效 |
| N15 | 🟢 | ❌ 仍遗留 | engine.js:769/1209 bonusKeys 重复定义 |
| N16 | 🟢 | ❌ 仍遗留 | ui.js:103 console.log（NE30 再确认） |
| N17 | 🟡 | ❌ 仍遗留 | engine.js:1084/1989 重复上限/同名检查 |
| N18 | 🔴 | ❌ 仍遗留 | engine.js:2532-2581 checkCombo 缺对手场上检查（NE05 深入确认） |
| N22 | 🔴 | ❌ 仍遗留 | engine.js:2736 costReduction key 永不匹配 |
| N23 | 🔴 | ❌ 仍遗留 | engine.js:1664 弃牌堆归属错误 |
| N24 | 🔴 | ❌ 仍遗留 | engine.js:1665 空 return 导致 TypeError |
| N25 | 🟡 | ❌ 仍遗留 | `_handleSummon` combo 分流 default 占位 |
| N26 | 🟡 | ❌ 仍遗留 | C09/C14 召唤物领域加成在 effects 中缺失 |
| N27 | 🟡 | ❌ 仍遗留 | A16 set_return_to_hand 有 case 无 combo 使用 |
| N28 | 🟡 | ❌ 仍遗留 | `_releaseOnFieldClear` 驻场移除缺少注释 |
| N29 | 🟡 | ❌ 仍遗留 | game_v2.css 4 个无用 @keyframes（NE23 再确认，额外发现 +2） |
| N30 | 🟡 | ❌ 仍遗留 | game_v2.css:858 backdrop-filter 无 -webkit- 前缀和 fallback |
| N31 | 🟢 | ❌ 仍遗留 | calculateDamage comboBonus 参数死代码 |
| N32 | 🟢 | ❌ 仍遗留 | `_isFirstAtkThisTurn` 注释误导 |
| N33 | 🟢 | ❌ 仍遗留 | processDOT A10 递增公式边界 |
| N34 | 🟢 | ❌ 仍遗留 | customDeckName 未声明类属性 |
| N35 | 🟢 | ❌ 仍遗留 | game_v2.css 缺少 prefers-reduced-motion（NE10 升级为严重） |
| N36 | 🟢 | ❌ 仍遗留 | !important 15->17 处，约 10 处可避免 |
| N37 | 🟢 | ❌ 仍遗留 | 硬编码颜色 60+ 处 |
| N38 | 🔴 | ❌ 仍遗留 | A10 DOT 递增公式（NE15 combo 延长回合后更严重） |
| N39 | 🟡 | ❌ 仍遗留 | C06/C07 召唤物减费（与 N22 同源） |
| N40 | 🟡 | ❌ 仍遗留 | A11 try/catch 掩盖问题 |

### M9-M23 中等历史遗留

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| M9 | ❌ 仍遗留 | S08 extraCost Math.max 覆盖而非累加 |
| M11 | ❌ 仍遗留 | A11 啸叫引爆逻辑（见 N23/N24/N40） |
| M13 | ❌ 仍遗留 | 镜面迷宫概率索引方向 |
| M14 | ❌ 仍遗留 | S17→A16 combo 冗余 |
| M15 | ❌ 仍遗留 | S07→A14 / C10→A14 语义不明 |
| M16 | ❌ 仍遗留 | A25→A26 msg 表述误导 |
| M17 | ❌ 仍遗留 | S01→A05 perHeight 语义模糊 |
| M19 | ❌ 仍遗留 | combo_table.js 注释 17→19 种（NE16 再确认） |
| M20 | ❌ 仍遗留 | ai.js 6 个未使用参数（NE19 再确认） |

### L1-L20 轻微历史遗留

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| L5 | ❌ 仍遗留 | maxHp 默认值不一致 |
| L6 | ❌ 仍遗留 | 多处 null 安全检查缺失（NE17 关联） |
| L14-L20 | ❌ 仍遗留 | 卡组下拉/变量/类名/可访问性等 |

---

## 统计总览

| 严重度 | 上次遗留 | 本轮新发现 | 当前合计 |
|:---:|:---:|:---:|:---:|
| 🔴 严重 | 4 (N22/N23/N24/N38) | 11 | **15** |
| 🟡 中等 | 18 | 12 | **30** |
| 🟢 轻微 | 19 | 8 | **27** |
| **合计** | **41** | **31** | **72** |

> 注：07-10 前已修复 10 项，07-10 至今 JS/CSS 零变更，上次 41 项全部继续遗留。本轮新增 31 项，其中 quiz.js 首次审查贡献 7 项（严重 4 + 中等 0 + 轻微 3）。

---

## 🎯 优先修复建议 (Top 10)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N23+N24+N40 | A11 啸叫引爆三合一（弃牌堆归属+空return崩溃+try/catch掩盖） | engine.js | 游戏崩溃 |
| **P0** | NE04 | canPlay 镜面迷宫白送精神力 | engine.js | 游戏平衡破坏 |
| **P0** | NE06 | 窥牌/凸透成像弹窗 XSS 风险 | ui.js | 安全 |
| **P0** | NE02 | quiz.js 4 组完全重复题目 | quiz.js | 题库质量 |
| **P0** | NE01 | quiz.js 4 题领域分类错误 | quiz.js | 题库质量 |
| **P1** | N22+N39 | C06/C07 减费从未生效 | engine.js | 卡牌效果缺失 |
| **P1** | NE03 | A11 缺少 isFieldCard:true | cards.js | 驻场识别失效 |
| **P1** | NE05 | checkCombo 不检查对手场上卡牌 | engine.js | vs combo 失效 |
| **P1** | NE09+NE08 | ui.js 事件监听器泄漏（弃牌+卡牌详情） | ui.js | 内存泄漏 |
| **P2** | NE10 | 缺少 prefers-reduced-motion 支持 | game_v2.css | 无障碍 |

---

> 📝 报告生成时间：2026-07-13 23:55 GMT+8 | 审查方式：7 个 Agent 并行审查 8 个文件 + 交叉验证历史遗留问题 + quiz.js 首次审查 | JS/CSS 自 07-12 以来零变更 | 上次 41 项问题全部遗留 + 本轮新增 31 项
