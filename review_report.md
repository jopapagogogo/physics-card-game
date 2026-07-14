# 代码审查报告 — 2026-07-14

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。本轮确认 **上次 72 项中 2 项已修复**（NE11 图片引用、M14 冗余 combo），**新增 20 个问题**（严重 4 / 中等 7 / 轻微 9）。JS/CSS 自 07-12 以来零变更，所有遗留代码问题仍然存在。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | 已审查（109卡逐卡 + EFFECT_TYPE 127键验证） |
| js/engine.js | 3042 | ±0 | 已审查（关键路径复查 + 所有遗留确认） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo 逐个验证） |
| js/ai.js | 1595 | ±0 | 已审查（空值安全 + 未用参数 + 硬编码） |
| js/ui.js | 4298 | ±0 | 已审查（XSS + 事件泄漏 + 操作符优先级） |
| js/quiz.js | 6270 | ±0 | 已审查（领域分类 + 重复检测 + 缩写问题扩大化） |
| js/runes.js | 9 | ±0 | 已审查（导出/引用验证） |
| css/game_v2.css | 1297 | ±0 | 已审查（兼容性 + 性能 + 无障碍 + 8个无用keyframes确认） |

---

## 本次新发现问题

### 🔴 严重（4 项）

#### NE41 — ui.js：贝尔窥牌 bellSpied.name 未转义（XSS）（行3544-3545）

```javascript
const name = typeof bellSpied === 'object' ? bellSpied.name : bellSpied;
const h = `<span id="bell-bar" class="bell-clickable" ...>📞窥「${name}」</span>`;
```

`bellSpied` 来自 `this.engine?._bellSpiedCard`，`.name` 直接拼入 innerHTML，未经转义。与 NE06 同类问题的新增点位。

#### NE42 — ui.js：AI 回合多处存在与 NE07 相同的操作符优先级模式（行3300/3305/3310/3317/3328）

```javascript
// 5 处 if 语句均使用相同模式：
if (!this.engine.isGameOver || !this.engine.isGameOver()) { ... }
```

在 `if` 语句中短路求值使结果恰好正确，但这是不可靠的巧合。行3317 使用的是 `&&` 变体：
```javascript
if (this.engine.isGameOver && this.engine.isGameOver()) { ... }
```

NE07（while 循环）与这 5 处 if 语句应统一修复。建议提取 `_isGameActive()` 方法。

#### NE43 — engine.js：processDOT 不检查胜利条件（行2427-2452）

```javascript
processDOT(playerIdx) {
    for (let i = 0; i < player.dotEffects.length; i++) {
        // ...
        player.hp = Math.max(0, player.hp - dmg);  // 可能归零
        dot.turnsRemaining--;
        // 未调用 checkWinCondition()
    }
}
```

多个 DOT 连续触发时从不检查胜利条件。对比 `processBurn`（行2384）和 `processParalysis`（行2408）均有检查。HP 在第一个 DOT 归零后，后续 DOT 仍继续计算。

#### NE44 — game_v2.css：完全缺少 `:focus-visible` 键盘焦点样式（全文）

```css
.btn { outline: none; }  /* 行212：彻底移除焦点环 */
```

全文无任何 `:focus-visible` 或 `:focus` 规则。`.btn` 使用 `outline:none` 移除了焦点视觉线索，键盘导航用户无法判断当前聚焦元素。应改为：
```css
.btn:focus { outline: none; }
.btn:focus-visible { outline: 2px solid var(--frc); outline-offset: 2px; }
```

---

### 🟡 中等（7 项）

#### NE45 — engine.js：`_turnAllSoundBonus` 对所有领域攻击生效，而非仅声系（行968）

```javascript
damage += this._turnAllSoundBonus[attackerIdx];  // 对力/热/电/光系攻击也加伤
```

注释和效果描述为"全体声波+5"，但代码对所有领域的攻击都加伤。若设计意图仅限声系，应添加 `card.domain.includes('声')` 条件。

#### NE46 — engine.js：A11 两处引爆逻辑不一致（行344-363 vs 行1652-1673）

| 调用路径 | 弃牌堆 | 驻场移除 |
|----------|--------|----------|
| `startTurn` 引爆（344行） | `player.discardPile` ✅ | 从 fieldSupports 移除 ✅ |
| `_handleAttack` 引爆（1652行） | `opponent.discardPile` ❌ | 不处理（N23/N24关联） |

两处引爆代码行为不一致，且 `_handleAttack` 路径存在弃牌堆归属错误和裸return崩溃。

#### NE47 — engine.js：`clearDebuff` 一次调用清除 3 种 debuff 但日志称"1种"（行2113-2118）

```javascript
if (eff.clearDebuff && card.id !== 'S07') {
    player.burnLayers = Math.max(0, player.burnLayers - 1);
    if (player.paralysis > 0) player.paralysis = Math.max(0, player.paralysis - 1);
    if (player.dotEffects.length > 0) player.dotEffects.shift();
    effects.push({ type: 'clear_debuff', msg: '清除了1种负面状态' });  // 实际是3种
}
```

同时清除灼烧-1、麻痹-1、移除1个DOT，日志却写"1种"。是否应各减一种或只减一种需设计决策。

#### NE48 — quiz.js：新增 2 道领域分类错误

| ID | 当前领域 | 应属领域 | 说明 |
|------|------|------|------|
| Q_E_114 | 电 | **热** | 内能/热量概念题，与电学无关 |
| Q_C_015 | 混沌 | **力** | 力的作用效果，不应归入混沌 |

加上 NE01 的 4 道，quiz.js 领域分类错误累计 **6 道**。

#### NE49 — quiz.js：新增 4 组完全重复题目（声领域集中爆发）

| 重复组 | 考点 | 严重度 |
|--------|------|:---:|
| Q_S_021 vs Q_S_178 | 声音传播条件 | 🟡 |
| Q_S_033 vs Q_S_146 | 音调与频率 | 🟡 |
| Q_S_091 vs Q_S_138 | 噪声控制 | 🟡 |
| Q_S_098 vs Q_S_175 | 声速与介质 | 🟡 |

加上 NE02 的 4 组（其中 1 组变为近似），quiz.js 累计 **7 组完全重复题**。

#### NE50 — quiz.js：电/热领域约 390 题选项过度缩写（较 NE27 范围急剧扩大）

NE27 发现电领域约 80 题缩写。本轮复查确认问题更加严重：

| 领域 | 缩写率 | 示例 |
|------|:---:|------|
| 电 (Q_E_*) | ~97%（194/200题） | "与测串""两压""笔不触"→应为"与待测电路串联""两端电压""试电笔不可触碰" |
| 热 (Q_H_*) | ~98.5%（197/200题） | "做功改？""冰""路晒"→应为"做功改变内能""冰熔化""路面暴晒" |

这近 400 道题对学生来说几乎无法正常阅读。建议优先重写这些题目。

#### NE51 — game_v2.css：8 个未使用 @keyframes 确认 + 持续动画性能消耗（行397/401/926/944/957/968/980/985）

NE23 发现 4 个，本轮确认实际为 **8 个**：

| @keyframes | 行号 | 状态 |
|------------|------|------|
| electricShock | 524 | 无引用 |
| lightFlash | 525-529 | 无引用 |
| turnDim | 725 | 空规则 |
| rarity-rainbow | 1139 | 无引用 |
| cardPlay | 471-475 | 无引用 |
| cardFlyInDown | 545-549 | 无引用 |
| cardFlyInUp | 550-554 | 无引用 |

此外 9 个 `infinite` 持续动画（burnPulse/summonGlow/targetFlash/borderPulse/floatIndicator/pulseBtn/cardReady 等）始终运行，建议对非首屏元素使用 `animation-play-state: paused`。

---

### 🟢 轻微（9 项）

#### NE52 — cards.js：A27 与 S31 同名"高压击穿"（行384/955）

两张不同卡使用完全相同的 name 和 formula，UI 展示时无法区分。建议 S31 改名如"高压击穿·辅助"或"绝缘破坏"。

#### NE53 — cards.js：runes.js 混沌符文为 SVG，其余 5 个为 PNG（格式不统一）（行8）

混沌使用 `data:image/svg+xml;base64`，其余使用 `data:image/png;base64`。渲染时需额外判断 MIME 类型，建议统一为 PNG。

#### NE54 — combo_table.js：S09升/S09降/vs 非标准键值格式未在注释说明（行4-5）

```javascript
// 注释仅描述"此前打出的卡ID→刚才打出的卡ID"
// 实际存在："S09升→A09"（卡ID+后缀）、"A32vsS11"（vs分隔符）
```

注释未覆盖这两种特殊格式。

#### NE55 — combo_table.js：召唤 combo 区域排列无序（行246-281）

排列为 C05→C08→C01→C03→C06→C12→C09，无明确排序逻辑（非按ID、非按领域）。与前面按领域分组的注释风格不一致。

#### NE56 — ui.js：窥牌弹窗 #scry-confirm 按钮重复绑定 click 事件（行3384/3398）

同一个按钮被绑定两次 click 事件，第二个监听器的 `clearTimeout(timeout)` 逻辑应合并到第一个中。

#### NE57 — ui.js：弃牌弹窗无超时兜底关闭（行3458-3491）

`_showDiscardChoice()` 仅当用户点击手牌时移除监听器，无定时器自动关闭。与 `showDiscardScreen()`（有12秒倒计时）形成对比。建议添加 15 秒超时保护。

#### NE58 — engine.js：`_bellSpiedCard` 和 `_scryHandled` 属性问题（行368/388）

- `_bellSpiedCard`：未在构造函数声明，运行时隐式创建
- `_scryHandled`：仅 startTurn 写入，全文件无读取（死代码）

#### NE59 — engine.js：S10 共振蓄能出牌顺序敏感（行2277-2286）

```javascript
if (card.id === 'S10' && eff.soundBonusSpirit) {
    const soundPlayed = this.cardsThisTurn.some(cid => { ... });
    if (soundPlayed) { player.spirit += eff.soundBonusSpirit; }
}
```

若先出 S10 再出声系攻击，bonus 不触发。注释未说明此顺序约束。

#### NE60 — engine.js：领域卡过期未调用 `_releaseOnFieldClear`（行2459-2465）

辅助卡过期会触发 `_releaseOnFieldClear`，但领域卡过期不会。当前领域卡无释放效果，属预留缺陷。

---

## 上次问题跟踪

### 已修复（2 项）✨

| 编号 | 内容 | 说明 |
|:---:|------|------|
| **NE11** | quiz.js 15 道题目引用不存在的图片 | ✅ 已修复 |
| **M14** | S17→A16 combo 冗余 | ✅ 已移除 |

### 仍遗留（70 项）

#### N1-N40 问题状态

| 编号 | 严重度 | 本轮验证 | 位置确认 |
|:---:|:---:|------|------|
| N5 | 🟢 | ❌ 仍遗留 | ui.js:209 color-mix 无 fallback（NE22） |
| N6 | 🟡 | ❌ 仍遗留 | game_v2.css:773 横屏断点依赖 JS 注入 |
| N14 | 🟡 | ❌ 仍遗留 | engine.js:315/581/1605 _inertiaNextTurn 被 endTurn 覆盖 |
| N15 | 🟢 | ❌ 仍遗留 | engine.js:769/1209 bonusKeys 重复定义 |
| N16 | 🟢 | ❌ 仍遗留 | ui.js:103 console.log（NE30） |
| N17 | 🟡 | ❌ 仍遗留 | engine.js:1084/1989 召唤物上限/同名双重检查 |
| N18 | 🔴 | ❌ 仍遗留 | engine.js:2532-2581 checkCombo 缺对手场上检查（NE05） |
| N22 | 🔴 | ❌ 仍遗留 | engine.js:2736 costReduction key 永不匹配（C06/C07） |
| N23 | 🔴 | ❌ 仍遗留 | engine.js:1664 A11 弃牌堆归属错误 |
| N24 | 🔴 | ❌ 仍遗留 | engine.js:1665 A11 裸 return 致 TypeError |
| N25 | 🟡 | ❌ 仍遗留 | engine.js:2016-2018 _handleSummon combo default 占位 |
| N26 | 🟡 | ❌ 仍遗留 | C09/C14 召唤物领域加成在 effects 中缺失 |
| N27 | 🟡 | ❌ 仍遗留 | A16 set_return_to_hand 有 case 无 combo 使用 |
| N28 | 🟡 | ❌ 仍遗留 | _releaseOnFieldClear 驻场移除缺少注释 |
| N29 | 🟡 | ❌ 仍遗留 | game_v2.css 8 个无用 @keyframes（NE23+NE51） |
| N30 | 🟡 | ❌ 仍遗留 | game_v2.css:858 backdrop-filter 无 -webkit- 前缀 |
| N31 | 🟢 | ❌ 仍遗留 | calculateDamage comboBonus 参数死代码 |
| N32 | 🟢 | ❌ 仍遗留 | _isFirstAtkThisTurn 注释误导 |
| N33 | 🟢 | ❌ 仍遗留 | processDOT A10 递增公式边界 |
| N34 | 🟢 | ❌ 仍遗留 | customDeckName 未声明类属性 |
| N35 | 🔴 | ❌ 仍遗留 | game_v2.css 缺少 prefers-reduced-motion（NE10） |
| N36 | 🟡 | ❌ 仍遗留 | !important 17 处 |
| N37 | 🟡 | ❌ 仍遗留 | 硬编码颜色 60+ 处 |
| N38 | 🔴 | ❌ 仍遗留 | A10 DOT 递增公式（NE15 combo 延长后更严重） |
| N39 | 🟡 | ❌ 仍遗留 | C06/C07 召唤物减费（与 N22 同源） |
| N40 | 🟡 | ❌ 仍遗留 | A11 try/catch 掩盖问题 |

#### M9-M23 中等历史遗留

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| M9 | ❌ 仍遗留 | S08 extraCost Math.max 覆盖而非累加 |
| M11 | ❌ 仍遗留 | A11 啸叫引爆逻辑（两处路径不一致，NE46 新确认） |
| M13 | ❌ 仍遗留 | 镜面迷宫概率索引方向（功能性OK，但模式可改进） |
| M15 | ❌ 仍遗留 | S07→A14 / C10→A14 语义不明 |
| M16 | ❌ 仍遗留 | A25→A26 msg 表述误导 |
| M17 | ❌ 仍遗留 | S01→A05 perHeight vs heightBonus 字段命名不一致 |
| M19 | ❌ 仍遗留 | combo_table.js 注释"17种"实际 19 种（NE16） |

#### 本次审查的 NE 系列遗留

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| NE01 | ❌ 仍遗留 | quiz.js 4 道领域分类错误 + 新发现 2 道（NE48） |
| NE02 | ⚠️ 部分变化 | 4 组重复：3 组仍完全重复，1 组变为近似 + 新发现 4 组（NE49） |
| NE03 | ❌ 仍遗留 | A11 缺少 isFieldCard:true |
| NE04 | ❌ 仍遗留 | canPlay 镜面迷宫白送精神力 |
| NE05 | ❌ 仍遗留 | checkCombo 不检查对手场上卡牌 |
| NE06 | ❌ 仍遗留 | 窥牌/凸透成像 XSS + 新发现贝尔窥牌 XSS（NE41） |
| NE07 | ❌ 仍遗留 | AI 回合循环操作符优先级 + 新发现 5 处同类问题（NE42） |
| NE08 | ❌ 仍遗留 | 弃牌弹窗事件监听器泄漏 + 无超时兜底（NE57） |
| NE09 | ❌ 仍遗留 | 卡牌详情弹窗 document 级监听器泄漏 |
| NE10 | ❌ 仍遗留 | 缺少 prefers-reduced-motion（N35） |
| NE12 | ❌ 仍遗留 | 9 个 effect 键名未在 EFFECT_TYPE 声明 |
| NE13 | ❌ 仍遗留 | 13 张卡牌 ID 排列顺序混乱 |
| NE14 | ❌ 仍遗留 | S34 领域描述矛盾 |
| NE15 | ❌ 仍遗留 | S09 降→A10 extend_dot_turns 导致伤害越界 |
| NE16 | ❌ 仍遗留 | combo 注释"17种"实际 19 种（M19） |
| NE17 | ❌ 仍遗留 | ai.js fieldSupports s.card 空值保护缺失 |
| NE18 | ❌ 仍遗留 | ai.js _handleDiscard 硬编码 maxSize=7 |
| NE19 | ❌ 仍遗留 | ai.js 6 个未使用参数 |
| NE20 | ❌ 仍遗留 | computeStats 依赖 .call(self) 绑定 this |
| NE21 | ❌ 仍遗留 | 战斗界面 hover 监听器在屏幕切换后未移除 |
| NE22 | ❌ 仍遗留 | color-mix() 无 CSS fallback（N5） |
| NE23 | ❌ 仍遗留 | 无用 @keyframes（从 4 个扩大到 8 个，NE51） |
| NE24 | ❌ 仍遗留 | A26/S23/S25 冗余 condition 字段 |
| NE25 | ❌ 仍遗留 | EFFECT_TYPE 注释"共 123 键"实际 127 键 |
| NE26 | ❌ 仍遗留 | quiz.js 约 13 题高度近似（扩大至 44 组） |
| NE27 | ❌ 仍遗留 | 电领域约 80 题过度缩写（扩大至 ~390 题，NE50） |
| NE28 | ❌ 仍遗留 | ui.js sleep(ms) 未被使用 |
| NE29 | ❌ 仍遗留 | emojiMap/emojiMap2 声明但未使用 |
| NE30 | ❌ 仍遗留 | console.log 残留（N16） |
| NE31 | ❌ 仍遗留 | transition:all 性能隐患（从 3 处扩大到 9 处） |

#### L1-L20 轻微历史遗留

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| L5 | ❌ 仍遗留 | maxHp 默认值不一致 |
| L6 | ❌ 仍遗留 | 多处 null 安全检查缺失（NE17 关联） |
| L14-L20 | ❌ 仍遗留 | 卡组下拉/变量/类名/可访问性等 |

---

## 统计总览

| 严重度 | 07-13 遗留 | 07-14 已修复 | 07-14 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 15 | 1 (NE11) | 14 | 4 | **18** |
| 🟡 中等 | 30 | 1 (M14) | 29 | 7 | **36** |
| 🟢 轻微 | 27 | 0 | 27 | 9 | **36** |
| **合计** | **72** | **2** | **70** | **20** | **90** |

> 注：JS/CSS 自 07-12 以来连续零变更。两项修复（NE11 图片引用删除、M14 冗余 combo 移除）发生在更早的 commit 中，上次审查时未正确识别。quiz.js 问题范围扩大化（重复题 4→7 组，近似题 13→44 组，缩写题 80→390 道）。

---

## 🎯 优先修复建议 (Top 10)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N23+N24+N40 | A11 啸叫引爆三合一（弃牌堆归属+空return崩溃+try/catch掩盖） | engine.js | 游戏崩溃 |
| **P0** | NE04 | canPlay 镜面迷宫白送精神力 | engine.js | 游戏平衡破坏 |
| **P0** | NE06+NE41 | 窥牌/凸透成像/贝尔窥牌 共 3 处 XSS | ui.js | 安全 |
| **P0** | NE50 | 电/热领域约 390 题过度缩写，学生无法阅读 | quiz.js | 题库可用性 |
| **P0** | NE44 | 完全缺少 :focus-visible 键盘焦点样式 | game_v2.css | 无障碍 |
| **P1** | N22+N39 | C06/C07 减费从未生效（costReduction key 不匹配） | engine.js | 卡牌效果缺失 |
| **P1** | NE03 | A11 缺少 isFieldCard:true → 清场免疫 | cards.js | 驻场识别失效 |
| **P1** | N38+NE15 | A10 DOT 递增公式被 combo 延长回合破坏 | engine.js + combo_table.js | 伤害计算错误 |
| **P1** | NE07+NE42 | AI 操作符优先级（while×1 + if×5） | ui.js | AI 逻辑风险 |
| **P1** | NE10 | 缺少 prefers-reduced-motion 支持 | game_v2.css | 无障碍 |

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 已修复(累计) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| 07-11 | 5 | 12 | 12 | 29 | 有 | — |
| 07-12 | 10 | 15 | 16 | 41 | 有 | 10 |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | 10 |
| **07-14** | **18** | **36** | **36** | **90** | **零变更** | **12** |

> 问题总数上升主要因为 quiz.js 缩写问题的范围扩大化（从 80 题重评估为 390 题），以及 CSS 审查深度的提升（从 4 个无用 keyframes 确认为 8 个，transition:all 从 3 处确认为 9 处）。

---

> 📝 报告生成时间：2026-07-14 23:55 GMT+8 | 审查方式：7 个 Agent 并行审查 8 个文件 + 交叉验证历史遗留 + quiz.js 深度复查 | JS/CSS 自 07-12 以来连续零变更 | 上次 72 项中 2 项已修复（NE11/M14）+ 本轮新增 20 项
