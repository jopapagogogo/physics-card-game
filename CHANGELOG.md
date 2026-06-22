# 工作日志 — 代码审查与修复

> 日期：2026-06-22  
> 审查范围：全量代码（engine.js / ai.js / cards.js / combo_table.js / quiz.js / runes.js）  
> 审查人：CodeBuddy  

---

## 审查摘要

| 项目 | 数量 |
|------|------|
| 发现问题 | 6 |
| 已修复 | 6 |
| 修改文件 | `js/engine.js`, `js/ai.js` |

---

## 修复详情

### 1. 🔴 概率比较 Bug（严重）

**文件**：`js/engine.js`  
**现象**：C11 惠更斯闪避（20%）和 D03 棱镜界失效（20%）几乎永远不触发。  
**根因**：`Math.random() * 100` 产生 0~100 的随机数，与 `dodgeChance: 0.2` 比较，`0~100 < 0.2` 几乎总是 false。  
**修复**：

```diff
- if (Math.random() * 100 < s.card.effect.dodgeChance)
+ if (Math.random() < s.card.effect.dodgeChance)

- if (Math.random() * 100 < oppDomain.card.effect.opponentFailChance)
+ if (Math.random() < oppDomain.card.effect.opponentFailChance)
```

**影响**：游戏平衡性——惠更斯召唤物和棱镜界领域此前形同虚设。

---

### 2. 🔴 A10 次声震荡 DOT 递增值错误（严重）

**文件**：`js/engine.js` → `processDOT()`  
**现象**：A10 的 DOT 序列为 [15, 25, 35, 45, 55]，实际递增应为 10，但代码中写死为 13。  
**后果**：每回合多造成 3 点伤害，且 S08→A10 combo (+3) 叠加后变为 16，偏离设计意图。  
**修复**：

```diff
- const increment = 13 + this._dotIncrementBoost[playerIdx];
+ const increment = 10 + this._dotIncrementBoost[playerIdx];
```

**验证**：
- 无 combo：递增 10 → 序列 [15, 25, 35, 45, 55] ✅
- S08→A10 combo (+3)：递增 13 → 序列 [15, 28, 41, 54, 67] ✅

---

### 3. 🟡 AI 引擎无效卡牌引用（中等）

**文件**：`js/ai.js`

| 位置 | 问题 | 修复 |
|------|------|------|
| `SUMMON_ELIMINATOR_IDS` | 包含不存在的 `A07` | 移除 |
| `_pickBestSupport` S35 分支 | 引用不存在的 S35 卡牌 | 移除整段无效代码 |
| `getBestAttack` / `_pickBestSupport` | 访问 `card.effect.special`（cards.js 中无此字段） | 改为 `card.description` |

**影响**：S35 分支造成死代码；`special` 字段检查永远为空字符串，导致 AI 低估有特殊效果的卡牌。

---

### 4. 🟡 AI 弃牌手牌上限错误（中等）

**文件**：`js/ai.js` → `_handleDiscard()`  
**现象**：AI 弃牌时手牌上限硬编码为 5，但游戏引擎定义为 7（`MAX_HAND_SIZE`）。  
**后果**：AI 在 hard 难度对手牌超过 5 张时即开始弃牌，损失 2 张手牌容量，降低 AI 策略空间。  
**修复**：

```diff
- const maxSize = 5;
+ const maxSize = 7;  // 对齐 engine.js 中的 MAX_HAND_SIZE
```

---

### 5. 🟡 效果匹配依赖文本解析（中等）

**文件**：`js/engine.js` → `_applySpecialEffects()`  
**现象**：`opponentExtraCost` 效果通过匹配 description 中的「每出卡+」来触发。但 A33 冲击波/A43 活塞压缩的描述为「每张卡精神力消耗+N」，不匹配「每出卡+」。  
**修复**：

1. **扩展文本匹配**：增加「每张卡 + 精神力消耗」模式
2. **添加直接效果处理**（推荐方式）：在 `_handleAttack` 中直接读取 `card.effect.opponentExtraCost`、`card.effect.halveSpiritRecovery`、`card.effect.stealSpirit` 等字段，避免依赖文本解析

**新增代码**：
```javascript
// 直接读取 cards.js 效果数据
if (card.effect.opponentExtraCost) { ... }
if (card.effect.halveSpiritRecovery) { ... }
if (card.effect.stealSpirit) { ... }
```

---

## 数据完整性验证

| 验证项 | 结果 |
|--------|------|
| cards.js 卡牌总数 | 109 ✅ |
| combo_table 引用卡牌存在性 | 53/53 全部有效 ✅ |
| approved_cards.json 引用卡牌存在性 | 109/109 全部有效 ✅ |
| approved_cards 覆盖全部 109 张 | ✅ |

---

## 技术债务（待后续修复）

1. **`_applySpecialEffects` 大量依赖文本解析**：建议全面迁移到基于 `card.effect` 结构化字段的处理方式，提高可靠性。
2. **AI 引擎与游戏引擎常量未共享**：`MAX_HAND_SIZE`、`BURN_BASE_DMG` 等在两个模块中各自定义，存在不一致风险。
3. **调用物 HP 未从 cards.js 读取**：`_handleSummon` 使用 `card.effect.hp`，但 cards.js 中 HP 定义在顶层 `hp` 字段而非 `effect.hp`。
4. **ui.js 未审查**：本次聚焦引擎层，UI 代码（129KB）建议单独审查。
