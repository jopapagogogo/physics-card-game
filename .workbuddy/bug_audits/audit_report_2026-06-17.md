# 物理卡牌对战游戏 — Bug 审计报告

> 审查日期：2026-06-17 | 审查范围：engine.js / ai.js / ui.js / quiz.js
> 仅审查，不修改。按严重程度排序。

---

## CRITICAL — 3 个（游戏崩溃/挂起）

### 1. quiz.js:1080 — 题库数组语法错误（整个题库不可用）
```js
  }, // Q_E_20 结束
  { // ← 缺少逗号！应改为 },
  id: 'Q_E_21',
```
Q_E_20 对象闭合后缺少逗号分隔符，导致数组字面量解析失败，**整个题库 100+ 题全部无法加载**。

### 2. ui.js:3049 — `_showCardDetail` 弹窗变量名错误
```js
if (dialog && dialog.contains(e.target)) // dialog 未定义，应为 overlay
```
变量 `dialog` 从未声明，点击卡牌弹窗内任意位置都会关闭弹窗，**卡牌详情完全无法交互**。

### 3. ui.js:2456-2493 — 拉普拉斯妖窥牌弹窗无超时
`_showScryModal()` 返回 Promise，仅通过拖拽+确认按钮 resolve。若玩家打开弹窗后不做任何操作（或 UI 渲染失败看不到弹窗），**游戏永久挂起**，无任何超时机制。

---

## HIGH — 7 个（功能完全失效/错误）

### 4. engine.js:1228 — 芝诺龟(C01) + 海市蜃楼(A50) 交互 bug
```js
this.mirageFirstAtk[attackerIdx] = true; // 在 C01 半伤处理块内，无论 C01 是否存在都执行
// 紧接着 A50 偏转检查：
if (!this.mirageFirstAtk[attackerIdx]) { ... } // 条件永远为 false
```
`mirageFirstAtk` 标记在 C01 处理完后无条件设为 true，导致 A50 海市蜃楼的 30% 偏转效果**永不会触发**。

### 5. engine.js:762 — A53 镜面回声加成永远不会触发
```js
const echoEffect = attacker.fieldSupports?.find(f => f.type === 'mirror_echo');
// f 的结构是 {card, turnsRemaining}，不存在 type 属性。应为 f.card.type
```
`fieldSupports` 数组元素的 `type` 在 `card` 子对象上，直接读 `f.type` 永远是 `undefined`，**A53 的 +10 声/光伤害加成永远不会生效**。

### 6. engine.js:1805/1997 — parseInt(undefined) 导致 NaN 传播
```js
opponent.extraCost = parseInt(match[1]); // match 可能为 null，parseInt(null[1]) → NaN
```
正则匹配失败时 `match` 为 null，`parseInt(undefined)` 返回 `NaN`。后续所有费用计算（`cost + extraCost`）全部变成 NaN，**整个出牌结算系统崩溃**。

### 7. ai.js:1338 — A08 伤害预估公式混用双方 HP
```js
const lostHp = self.maxHp - opp.hp; // self 的 maxHp 与 opp 的 hp 混用
```
AI 计算 A08 做功打击伤害时，用 AI 自身的最大血量减去对手当前血量，**语义完全错误**。应使用同一方的 HP 差值。

### 8. ai.js:1090 — domain 类型假设错误
```js
c.domain.some(d => d === self.domain.main || d === self.domain.sub)
```
C01-C04 神兽卡的 `domain` 是字符串（如 "力学神兽"）而非数组，调用 `.some()` 会抛出 **TypeError**，导致 AI 在评估这类卡牌时崩溃。

### 9. ui.js:284/291/844 — DOM 元素无 null 检查
```js
document.getElementById('btn-deck-builder').addEventListener(...) // 无 ?. 或 null 检查
```
若 DOM 中缺少对应元素，直接抛出 TypeError。应使用可选链 `?.addEventListener`。

### 10. ui.js:1496 — 结束回合无防重入守卫
```js
btnEnd.addEventListener('click', () => this.endPlayerTurn()) // 按钮未 disable，phase 未校验
```
快速双击结束回合按钮可**多次触发** `endPlayerTurn()`，导致状态错乱、重复出牌。

---

## MEDIUM — 10 个（潜在崩溃/数据错误）

### 11. engine.js:783 — 辅助卡 effect 可能为 undefined
`s.card.effect.soundDefense` 当某张辅助卡无 `effect` 字段时抛出 TypeError，应使用 `s.card.effect?.soundDefense`。

### 12. engine.js:468 — C04 薛定谔猫标记残留
`_c04PlayerChoose` 标记在 C04 被消灭后不会被重置，`startTurn` 中也未清理，可能导致 combo 处理使用过期状态。

### 13. engine.js:698/1294 — parseInt 未指定 radix
多处 `parseInt(val)` 未指定第二参数 `10`，在老旧 JS 环境下以 0 开头的字符串可能被解析为八进制。

### 14. engine.js:903 — _reduceElectricTarget 引用比较问题
`card === eTgt.cardRef` 使用严格引用比较。若卡牌对象在流程中被重新创建/克隆，引用不匹配导致费用减免失效。

### 15. ai.js:1268 — dCard.effect.bonusDmg 空值保护缺失
领域卡 `effect` 可能为 undefined，直接读 `dCard.effect.bonusDmg` 抛出 TypeError。多处类似（L1272/L1281/L1282/L1300 等）。

### 16. ai.js:1033 — 链式 combo 逻辑死路
```js
const prevCard = remainingHand.find(c => c.id === best.prevId)
```
`prevCard` 已在上一步打出，无法在 remainingHand 中找到，链式 combo 检测到但从未实际执行。

### 17. ai.js:1288/1291 — paralysis/burnLayers 可能为 undefined
`opp.paralysis * 2` 和 `opp.burnLayers * 3` 未做空值保护，undefined 参与运算产生 NaN。

### 18. quiz.js:1388 — 答案类型不匹配
```js
correct: question.answer === answerIndex
```
`question.answer` 是数字，`answerIndex` 来自 DOM 可能是字符串，"1" !== 1 导致**答对也判错**。

### 19. ui.js:2263 — discardTimer 未清理
`showDiscardScreen` 开头未 `clearInterval` 已有定时器，异常重入导致旧定时器泄漏。

### 20. ui.js:2473 — Scry 弹窗 card.name 未转义
卡牌名称直接拼接进 innerHTML，未调用 `_escapeHtml`。若未来卡牌名含 `<` 等特殊字符会破坏 DOM 结构。

---

## LOW — 5 个（非致命但影响质量）

| # | 文件 | 行 | 问题 |
|---|------|----|------|
| 21 | engine.js | 912 | `cardsThisTurn` 在异常路径下可能不清理 |
| 22 | ai.js | 1595 | `queryCombo` 返回值未使用（死代码） |
| 23 | ai.js | 1180 | shuffle 用 sort 实现不均匀 |
| 24 | ui.js | 418 | 伤害为 0 时 `c.effect?.dmg \|\| ''` 显示为空 |
| 25 | ui.js | 2893 | `temperature_rise` case 重复出现两次（死代码） |

---

## 统计

| 严重度 | 数量 | 影响 |
|--------|------|------|
| CRITICAL | 3 | 游戏崩溃/挂起/题库全坏 |
| HIGH | 7 | 核心功能完全失效 |
| MEDIUM | 10 | 特定场景崩溃或数据错误 |
| LOW | 5 | 代码质量/边界情况 |
| **总计** | **25** | |
