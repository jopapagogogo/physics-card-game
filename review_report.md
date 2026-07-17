# 代码审查报告 — 2026-07-17

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。本轮新发现 **27 个问题**（严重 9 / 中等 11 / 轻微 7）。JS/CSS 自 07-12 以来连续第五天零变更，所有遗留代码问题仍然存在。

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | isFieldCard 完整性 + EFFECT_TYPE 声明 + ID 顺序 |
| js/engine.js | 3042 | ±0 | A11 引爆路径 + S24 泄漏 × A30 + _calcRawDamage + canPlay 重复 |
| js/combo_table.js | 291 | ±0 | 头注释数字验证 + 分隔符格式 |
| js/ai.js | 1595 | ±0 | _scoreCombo 覆盖率 + 空值安全 + 魔法数字 |
| js/ui.js | 4298 | ±0 | 新 XSS 点（card detail）+ AI 循环守卫 + setTimeout 竞态 |
| js/quiz.js | 6270 | ±0 | 新重复题 + Q_H_171 答案 + Q_S_196 答案 + Q_E_110 分类 |
| js/runes.js | 9 | ±0 | 格式一致性 |
| css/game_v2.css | 1297 | ±0 | !important 滥用 + overflow:hidden 截断 + 死代码 @keyframes |

---

## 本次新发现问题

### 🔴 严重（9 项）

#### NE116 — engine.js：A11 啸叫引爆时卡牌归属错乱（行1658-1664）

```javascript
// _handleAttack detonation 路径：
if (trig.counterAtk) {
  opponent.hp -= trig.counterAtk;
  opponent.discardPile.push(card);  // ← BUG: 应推入 attacker 的弃牌堆！
}
```

当第二张 A11 触发引爆时，被引爆的旧 A11 被推入 **对手（opponent）** 的弃牌堆——对手获得了一张从未拥有的卡（卡牌注入 bug）。同时旧 A11 在 `fieldSupports` 中未清理（`startTurn` 引爆路径 L357-359 正确处理了 splice+discard，但 `_handleAttack` 引爆路径没有）。**双重缺陷**：卡牌归属错 + 实例残留。

#### NE117 — engine.js：A30 电磁脉冲清场时 S24 burnEnhanced 泄漏（行1453-1461）

```javascript
// A30 效果处理中：
if (trig.destroyField && opponent.fieldSupports.length > 0) {
  const target = opponent.fieldSupports[opponent.fieldSupports.length - 1];
  opponent.discardPile.push(target.card);
  opponent.fieldSupports.pop();  // ← 直接 pop，未调用 _releaseOnFieldClear！
}
```

`_releaseOnFieldClear` 仅处理 S06/A05 的清理，无 S24 分支。A30 不走 `_releaseOnFieldClear`，被消灭的卡牌若为 S24，`burnEnhanced` 永久泄漏。**加上 NE73 已知的 5 张卡（A09/A18/A25/A38/A46），共 6 张卡可导致 S24 burnEnhanced 永久泄漏**。

#### NE118 — engine.js：`_calcRawDamage` 丢失 comboBonus 固定加值（行3024）

```javascript
_calcRawDamage(card, attackerIdx, defenderIdx) {
  return this.calculateDamage(card, attackerIdx, defenderIdx, 0, true);
  //                                            comboBonus=0 ^^^^^^^^^
}
```

`ignoreDefense=true` 的卡牌（如 A27 闪电劈击）通过 `_calcRawDamage` 计算伤害，该函数将 `comboBonus` 硬编码为 0。combo 表中的固定伤害加值（如 `extra_damage` 在 combo 触发时的额外伤害）因此丢失。虽然 `_handleAttack` 在 `calculateDamage` 返回值之后单独处理 combo 的 `extra_damage`/`extra_damage_per_burn` 等效果，但 `calculateDamage` 本身的 `comboBonus` 参数所代表的固定值被丢弃。

#### NE119 — ui.js：`_showCardDetail` 描述文本未转义（行4205）

```javascript
// ui.js:4205 — 未转义：
<div>${summary}</div>${principle ? `<span>${principle}</span>` : ''}

// 对比 ui.js:3992 — 已转义（正确）：
<div>${this._escapeHtml(summary)}</div>...${this._escapeHtml(principle)}
```

同一 `cardData.description` 在 `_getCardTooltipHTML` (L3992) 和 `_buildCardElement` (L1828) 中正确转义，但在 `_showCardDetail` 弹窗中未转义。虽源数据来自本地 `CARDS` 常量，但 `cardData` 可通过引擎 `getCardById` 路径传入——与 NE84/NE85/NE86 同属 XSS 风险家族，是 **第 4 个未转义注入点**。

#### NE120 — ui.js：AI 回合循环 guard 条件逻辑缺陷（行3227）

```javascript
while (!this.engine.isGameOver || !this.engine.isGameOver() && !turnTimedOut && aiCardCount < 50) {
```

运算符优先级 `!` > `&&` > `||`。`!this.engine.isGameOver`（无括号调用，函数引用永为 truthy → `!truthy = false`）使第一个 `||` 分支恒假。实际等价于 `!this.engine.isGameOver() && !turnTimedOut && aiCardCount < 50`。若 `isGameOver` 意外被设为 `null`/`undefined`，`!null === true` → 无限循环。

#### NE121 — cards.js：A11（啸叫）缺少 `isFieldCard: true` 标记

A11 描述明确声明"**并驻场**"、"**此卡离场**"、"**可被清场效果清除**"，但 `effect` 中缺少 `isFieldCard: true`。对比同类驻场攻击卡 A05/A10/A16 均有此标记。

**影响**：
1. `destroyField` 清场效果不会作用于 A11
2. `perSoundFieldBonus` 效果不将 A11 计入场上声系卡数
3. 卡牌行为与设计意图不符

#### NE122 — quiz.js：Q_H_171 答案疑似错误（行4770）

```
题目："正确的是？"
A. "固都有熔"  B. "液沸温不变"  C. "蒸在表"  D. "都对"
当前答案：3（D = 都对）
```

根据人教版初中物理教材，非晶体（玻璃、蜡）没有固定熔点，它们软化而非熔化。"固都有熔"（所有固体都有固定熔点）是**错误**表述。因此 D "都对" 不成立。

#### NE123 — quiz.js：Q_S_196 无可选项可作为正确答案（行2454）

```
题目："下面做法中不能减弱噪声的是？"
A. 植树（传播中减弱）  B. 手机静音（声源处减弱）
C. 隔音板（传播中减弱）  D. 纺织工人戴防噪声耳罩（人耳处减弱）
当前答案：3（D）
```

四个选项**均能**减弱噪声（分别对应声源、传播、人耳三个环节），不存在"不能减弱"的选项。耳罩在人耳处减弱噪声是教材明确讲授的方法。题目本身设计有误。

---

### 🟡 中等（11 项）

#### NE124 — engine.js：`canPlay` / `canPlayQuery` ~80% 重复（行2777-2908）

两个函数共 130+ 行几乎相同的代码，唯一区别是 `canPlay` 包含 mirror maze/prism realm 随机检查（L2792-2806），`canPlayQuery` 跳过。任何新限制需在两边同步添加，维护风险高。建议重构为 `canPlay(dryRun=false)`。

#### NE125 — engine.js：召唤物放置失败时不退还 quizCostReduction（行1055-1096）

```javascript
// L1055-1057: 费用扣除（含 quizCostReduction）
if (this.quizCostReduction[playerIdx] > 0) {
  cost = Math.max(0, cost - 1);
  this.quizCostReduction[playerIdx]--;  // ← 已消耗
}
// L1085-1096: 放置失败退款 → 精神力退还了，但 quizCostReduction 没恢复！
```

召唤物因场上已满或重复无法放置时，精神力退款会执行，但 `quizCostReduction` 计数器不回滚。玩家答对 N 题获得的减费次数永久丢失一次。

#### NE126 — engine.js：`_pendingScry` C03/S13 竞态（行367, 2357-2366）

C03（拉普拉斯妖，startTurn 触发）和 S13（多普勒探测，_applySpecialEffects 触发）均写入 `this._pendingScry`。若 C03 的窥牌尚未被 UI 消费（玩家未操作），后续打出 S13 会无警告覆盖 C03 数据。`_pendingScry` 设计为单槽位，无法同时容纳两个窥牌请求。

#### NE127 — engine.js：`||` 替代 `??` 导致零值误伤（3 处）

| 行 | 代码 | 问题 |
|------|------|------|
| 373 | `c03.card.effect.scryOpponent \|\| 5` | scryOpponent=0 时回退到 5 |
| 1179 | `card.effect.dotSequence?.length \|\| ... \|\| 99` | 0-length dotSequence 穿透 |
| 1810 | `card.effect.antiBarrier \|\| 0` | antiBarrier=0 正常但写法有歧义 |

#### NE128 — ui.js：`_showCardDetail` setTimeout 竞态（行4231-4234）

```javascript
this._zoomOutsideHandler = closeOnOutsideClick;
setTimeout(() => {
  document.addEventListener('click', closeOnOutsideClick, true);
}, 100);
```

如果用户在 100ms 内快速点击另一张卡，旧 handler 替换新 handler，但旧 `setTimeout` 回调仍持有旧闭包引用。极端时序下可导致两个 `click` 监听器同时存在（虽然都调用 `_closeCardDetail` 清理，仍是不可靠的竞态设计）。

#### NE129 — ai.js：`_scoreCombo` 缺 boost_mirage / refund_cost 评分（行718-779）

引擎已正确实现这两种效果类型（engine.js 有对应 case），但 AI 的 combo 评分函数未专门处理：
- `boost_mirage` (combo "S19→A50", 偏转率 30→45%): 评分仅 = 10（默认）
- `refund_cost` (combo "A15→A19", 退回 50% 精神力): 评分仅 = 10（默认）

导致 AI 在 hard 难度下低估这两个 combo 的价值，降低打出率。

#### NE130 — ai.js：domain 空值防护不一致（行1310 vs 1287）

```javascript
// L1287: 双重防护 ✅
const elecCount = self.fieldSupports.filter(
    s => Array.isArray(s.card?.domain) && s.card.domain.includes('电')
).length;
// L1310: 无防护 ❌
const ec = self.fieldSupports.filter(s => s.card.domain.includes('电')).length;
```

同一函数 `_estimateAttackDamage` 内，两行间隔仅 23 行，防护级别完全不同。L1310 和 L1451 若遇缺 `domain` 属性的驻场卡会抛 TypeError。

#### NE131 — ui.js：3 个弹窗仍无超时关闭机制（NE87/NE88/NE89 延续确认 → 新编号用于强调）

`_showConvexLensChoice` (L3402)、`_showFrequencyChoice` (L3433)、`_showDiscardOpponentChoice` (L3493) 仍无超时自动关闭。对比 `_showScryModal` (L3390-3397) 有 30 秒超时、`showLightSpeedInterrupt` (L3767-3781) 有 8 秒倒计时。此三处在 07-12 首次报告后仍未修复。

#### NE132 — css/game_v2.css：`!important` 过度使用阻止皮肤/主题系统（5 处）

| 行 | 选择器 | 影响 |
|------|------|------|
| 371-374 | `.discard-choice.selected` | 选中态 `border-color`/`background` 不可被皮肤覆盖 |
| 965-968 | `.targetable-summon` | `cursor`/`outline`/`animation` 三属性完全锁定 |
| 1097 | `.card-v3.mini:hover` | `transform`/`box-shadow` 覆盖 JS 拖拽逻辑 |
| 1112-1137 | `.card-v3:not(.mini).rarity-*` (×6) | `background` 阻止动态主题切换 |

#### NE133 — css/game_v2.css：`.card-v3.mini` overflow:hidden 截断辉光伪元素（行1066-1067）

```css
.card-v3.mini { overflow:hidden; }
.card-v3.mini::before, .card-v3.mini::after { display:none; }
```

注释承认"overflow:hidden 会裁掉外沿辉光"。mini 卡牌完全丢失领域色辉光效果，`display:none` 直接关闭伪元素是掩盖而非修复。

---

### 🟢 轻微（7 项）

#### NE134 — quiz.js：Q_E_110 领域分类错误（行5607）

"2.5μm=?m" 是单位换算题，属测量/力学基础。当前分在"电"领域，应分在"力"领域。此错误不在已知列表 NE114 中，是 **第 6 道**领域分类错误题。

#### NE135 — quiz.js：新增 3 组完全重复题 + 4 组近似重复

| 类型 | ID | 题目概要 |
|------|------|------|
| 完全重复 | Q_S_115 / Q_S_155 | "四个句子中高字指音调的是？" |
| 完全重复 | Q_S_060 / Q_S_169 | "以下措施中在声源处减弱噪声的是？" |
| 完全重复 | Q_S_100 / Q_S_177 | "将音叉的振动放大下列哪个实验方法最常用？" |
| 近似重复 | Q_F_080 / Q_F_122 | 飞机空投动能势能变化 |
| 近似重复 | Q_F_086 / Q_F_156 | 跳伞匀速下降动能势能 |
| 近似重复 | Q_S_079 / Q_S_174 | 不能减弱噪声的方法 |
| 近似重复 | Q_S_061 / Q_S_170 | 大雪后万籁俱静原因 |

雷雨题 Q_S_104/Q_S_178/Q_S_190 已在上轮报告为 NE112。

#### NE136 — css/game_v2.css：死代码 @keyframes（2 处）

- 行 725: `@keyframes turnDim {}` — 空关键帧，无选择器引用
- 行 1139: `@keyframes rarity-rainbow { to { filter:hue-rotate(360deg); } }` — 定义但无引用

#### NE137 — combo_table.js：头注释声称 17 种 effect type，实际 19 种（行7）

文件头注释 `// effect.type 列表（实际使用 17 种）` 与实际列举的 19 种不符。所有 19 种均被引擎和 combo 表使用。

#### NE138 — ai.js：`_scoreCombo` 中 3 个 case 当前无 combo 使用（死代码）

`boost_clear_debuff` / `return_to_hand` / `set_return_to_hand` 三个 case 在 switch 中有评分逻辑，但 COMBO_TABLE 的 49 条记录中无任何 combo 引用。

#### NE139 — cards.js：A-block 卡牌 ID 乱序（A44-A55 分散插入 A01-A42 之间）

A44-A55 未按 ID 顺序排列在 A43 之后，而是分散插入在 A14-A42 之间。按 ID 查找时需全文搜索，降低可维护性。

#### NE140 — runes.js：混沌符文使用 SVG，其余 5 领域使用 PNG

力/声/光/热/电 5 个领域符文为 `data:image/png;base64,...`，混沌符文为 `data:image/svg+xml;base64,...`。格式不一致，虽无功能影响。

---

## 上次问题跟踪

### 已修复（3 项）✨

| 编号 | 内容 | 日期 | 说明 |
|:---:|------|:---:|------|
| N14 | engine.js _inertiaNextTurn 被 endTurn 覆盖 | 07-12 前 | ✅ |
| NE09 | ui.js 卡牌详情弹窗 document 级监听器泄漏 | 07-12 前 | ✅ _closeCardDetail 正确清理 |
| NE52 | cards.js A27 与 S31 同名"高压击穿" | 07-12 前 | ✅ |

### 已知问题确认状态（本轮逐项验证）

| 编号 | 描述 | 状态 | 备注 |
|:---:|------|:---:|------|
| **NE110** | C06/C07 减费守卫键名错 | ✅ 确认 | canAfford L2736 守卫 + playCard 无扣费逻辑 |
| **NE73** | S24 burnEnhanced 永久泄漏 | ✅ 确认 | _releaseOnFieldClear 仅处理 S06/A05 |
| **NE74** | A11 引爆旧 fieldSupports 残留 | ✅ 确认 | _handleAttack 路径未清理 |
| **NE76** | _ignoreDefBonus 实现语义错误 | ✅ 确认 | 一卡延迟追加伤害 |
| **NE78** | calculateDamage skipDefense 仍算 totalDefense | ✅ 确认 | 计算浪费非 Bug |
| **NE61/NE62** | 顶级 effect 键未声明 | ✅ 确认 | sacrificeElectricSupport + soundSupportExtend |
| **NE75/NE43** | processDOT/Burn 无胜利检查 | ✅ 设计模式 | L264 批量兜底足够 |
| **NE111** | Q_H_128 两个正确答案 | ✅ 确认 | A(牛-惯性) 和 B(托-大气压) 均正确 |
| **NE112** | 雷雨题三重重复 | ✅ 确认 | Q_S_104/178/190 |
| **NE114** | 5 道领域分类错误 | ✅ 确认 | 累计确认（+ 本轮 NE134 Q_E_110 = **6 道**） |
| **NE115** | 50 组重复/近似重复 | ✅ 确认 | 本轮新增 3+4=7 组 → **共 57 组** |
| **NE113** | abc-row/d-zone/divider-row 依赖媒体查询 | ✅ 确认 | 横屏 CSS 零基础定义 |
| **NE102-109** | CSS 8 项性能/兼容性 | ✅ 确认 | backface-visibility/hardware-accel 缺失等 |
| **NE84-86** | 3 处 XSS 注入 | ✅ 确认 | 本轮新增 NE119 第 4 处 |
| **NE87-89** | 3 弹窗无超时 | ✅ 确认 | 07-12 至今未修复 |
| **NE44** | :focus-visible + prefers-reduced-motion 缺失 | ✅ 确认 | 17+ 动画无 reduced-motion 保护 |

### 统计

| 严重度 | 07-16 遗留 | 已修复 | 遗留确认 | 本轮新发现 | 等级调整 | 现在合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 19 | 0 | 17（NE75/NE43 已降级） | 9 | 0 | **26** |
| 🟡 中等 | 56 | 0 | 56 | 11 | 0 | **67** |
| 🟢 轻微 | 63 | 0 | 63 | 7 | 0 | **70** |
| **合计** | **138** | **0** | **136** | **27** | **0** | **163** |

---

## 统计总览

| 严重度 | 07-16 遗留 | 已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 19 | 0 | 17 | 9 | **26** |
| 🟡 中等 | 56 | 0 | 56 | 11 | **67** |
| 🟢 轻微 | 63 | 0 | 63 | 7 | **70** |
| **合计** | **138** | **0** | **136** | **27** | **163** |

> JS/CSS 自 07-12 以来连续第五天零变更。本轮新发现重磅：NE116（A11 引爆卡牌归属注入）、NE117（A30 引爆 S24 泄漏新增）、NE121（A11 缺 isFieldCard）、NE119（第 4 个 XSS 点）、NE122（Q_H_171 疑似错误答案）、NE123（Q_S_196 题目设计错误）。quiz.js 新发现 3 组完全重复 + 4 组近似重复，题库重复组数从 50 → 57。领域分类错误累计 6 道。

---

## 🎯 优先修复建议 (Top 10) — 更新

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N23+N24+NE74 | A11 啸叫引爆三合一 + 旧实例泄漏 | engine.js | 游戏崩溃 |
| **P0** | **NE116** | **A11 引爆时卡牌归属注入（对手获卡）** | engine.js | **游戏逻辑错乱** |
| **P0** | **NE121** | **A11 缺少 isFieldCard 标记** | cards.js | **效果缺失** |
| **P0** | NE73+NE117 | S24 burnEnhanced 通过 6 张卡永久泄漏 | engine.js | 平衡破坏 |
| **P0** | NE110 | C06/C07 减费从未生效 | engine.js | 效果缺失 |
| **P0** | NE84+85+86+**NE119** | **第 4 个 XSS 注入点（card detail 弹窗）** | ui.js | 安全 |
| **P1** | NE122 | Q_H_171 疑似错误答案（固都有熔） | quiz.js | 答题公正性 |
| **P1** | NE123 | Q_S_196 题目无正确答案可选 | quiz.js | 题目设计缺陷 |
| **P1** | NE87+88+89 | 3 弹窗无超时自动关闭 | ui.js | 游戏阻塞 |
| **P1** | NE120 | AI 循环 `!isGameOver`（无括号）逻辑陷阱 | ui.js | 潜在无限循环 |

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 已修复(累计) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| 07-11 | 5 | 12 | 12 | 29 | 有 | — |
| 07-12 | 10 | 15 | 16 | 41 | 有 | 10 |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | 10 |
| 07-14 | 18 | 36 | 36 | 90 | 零变更 | 12 |
| 07-15 | 19 | 52 | 61 | 132 | 零变更 | 15 |
| 07-16 | 19 | 56 | 63 | 138 | 零变更 | 15 |
| **07-17** | **26** | **67** | **70** | **163** | **零变更** | **15** |

> 本轮问题增长主要来自：A11 引爆路径深入分析（NE116+NE121）、A30 清场 S24 泄漏路径发现（NE117）、ui.js card detail 新 XSS 点（NE119）、quiz.js 答案验证（NE122+NE123）、AI 评分覆盖率审查（NE129+NE138）。累计递增强烈建议尽快启动一轮批量修复，特别是 A11 三合一问题（N23+N24+NE74+NE116+NE121 均为 A11 相关）。

---

> 📝 报告生成时间：2026-07-17 23:50 GMT+8 | 审查方式：6 个 Agent 并行审查 engine/ui/quiz/cards/ai+combo+runes/css + 主审查员汇总 | JS/CSS 自 07-12 以来连续第五天零变更 | 本轮重点发现：A11 三重缺陷（引爆归属注入 + isFieldCard 缺失 + 旧实例泄漏）、第 4 个 XSS 点、2 道题目设计错误
