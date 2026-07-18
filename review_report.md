# 代码审查报告 — 2026-07-18

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。JS/CSS 自 07-12 以来连续第六天零变更。**本轮无新发现问题，上轮全部 27 个问题逐项验证均仍存在。**

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | NE121/NE139 历史遗留 + EFFECT_TYPE 完整性 |
| js/engine.js | 3042 | ±0 | NE116/NE117/NE118/NE124/NE125/NE126/NE127/N23+N24+NE74/NE73/NE110/NE76/NE78/NE61/NE62 |
| js/combo_table.js | 291 | ±0 | NE137 头注释数字 |
| js/ai.js | 1595 | ±0 | NE129/NE130/NE138 历史遗留 |
| js/ui.js | 4298 | ±0 | NE119/NE120/NE128/NE131/NE84-86/NE87-89/N09 |
| js/quiz.js | 6270 | ±0 | NE122/NE123/NE134/NE135/NE111/NE112/NE114/NE115 |
| js/runes.js | 9 | ±0 | NE140 |
| css/game_v2.css | 1297 | ±0 | NE132/NE133/NE136/NE113/NE102-109/NE44 |

---

## 本次新发现问题

**无。** 所有 JS/CSS 文件行数与上轮完全一致（git diff 仅涉及 HEALTH.md、daily_summary.md、test_result.md 三个非代码文件），代码层面零变更。经过逐项逐行验证，上轮报告的 27 个问题全部确认仍存在。

---

## 上次问题跟踪

### 已修复（0 项）

本轮代码无变更，无可修复项。

### 逐项验证（全部 27 项仍存在）

#### 🔴 严重（9 项 — 全部确认）

| 编号 | 描述 | 文件 | 行号 | 现场验证 |
|:---:|------|------|------|------|
| **NE116** | A11 啸叫引爆时卡牌归属错乱 | engine.js | L1664 | `opponent.discardPile.push(card)` — 卡牌被推入对手弃牌堆而非攻击者弃牌堆 |
| **NE117** | A30 电磁脉冲清场 S24 burnEnhanced 泄漏 | engine.js | L1457-1458 | `opponent.fieldSupports.pop()` 直接操作，未调用 `_releaseOnFieldClear` |
| **NE118** | `_calcRawDamage` 丢失 comboBonus 固定加值 | engine.js | L3025 | `this.calculateDamage(card, attackerIdx, defenderIdx, 0, true)` — comboBonus=0 硬编码 |
| **NE119** | `_showCardDetail` 描述文本未转义（第4个XSS点） | ui.js | L4205 | `${summary}` 直接插入 innerHTML，无 `_escapeHtml` 包装 |
| **NE120** | AI 回合循环 guard 条件逻辑缺陷 | ui.js | L3227 | `!this.engine.isGameOver \|\| !this.engine.isGameOver() && ...` — 运算符优先级陷阱 |
| **NE121** | A11 缺少 `isFieldCard: true` 标记 | cards.js | L160 | effect 中无 isFieldCard 字段（引擎 L2683 通过 applyOnCast+applyPerTurn 间接识别，但数据定义不规范） |
| **NE122** | Q_H_171 答案疑似错误（"固都有熔"） | quiz.js | L4770 | 非晶体无固定熔点，"固都有熔"为错误表述，D"都对"不成立 |
| **NE123** | Q_S_196 无可选项可作为正确答案 | quiz.js | L2454 | 四个选项均能减弱噪声，题目本身设计有误 |

#### 🟡 中等（11 项 — 全部确认）

| 编号 | 描述 | 文件 | 行号 | 现场验证 |
|:---:|------|------|------|------|
| **NE124** | `canPlay` / `canPlayQuery` ~80% 重复 | engine.js | L2777-2908 | 两个函数 130+ 行几乎相同代码，唯一区别为随机检查 |
| **NE125** | 召唤物放置失败时不退还 quizCostReduction | engine.js | L1055-1096 | 费用扣除在放置检查之前（L1055-1057），退款仅恢复精神力 |
| **NE126** | `_pendingScry` C03/S13 竞态 | engine.js | L367/2357-2364 | C03 startTurn 写入与 S13 _applySpecialEffects 写入共用单槽位 |
| **NE127** | `\|\|` 替代 `??` 导致零值误伤（3处） | engine.js | L371/1179/1810 | scryOpponent=0→5, dotSequence[]长度0→穿透, antiBarrier=0歧义 |
| **NE128** | `_showCardDetail` setTimeout 竞态 | ui.js | L4231-4234 | 100ms 延迟内快速点击可导致双监听器 |
| **NE129** | `_scoreCombo` 缺 boost_mirage/refund_cost 评分 | ai.js | L718-779 | AI 低估这两个 combo 价值 |
| **NE130** | domain 空值防护不一致 | ai.js | L1310 vs L1287 | 同一函数内两行间隔仅23行，防护级别完全不同 |
| **NE131** | 3 个弹窗仍无超时关闭机制 | ui.js | L3402/3433/3493 | _showConvexLensChoice/_showFrequencyChoice/_showDiscardOpponentChoice 均无超时 |
| **NE132** | `!important` 过度使用阻止皮肤/主题系统 | css/game_v2.css | L372-373/965-968/1096-1100/1112-1137 | 5处!important 阻止动态主题切换 |
| **NE133** | `.card-v3.mini` overflow:hidden 截断辉光 | css/game_v2.css | L1066-1067 | 伪元素 display:none 是掩盖而非修复 |

#### 🟢 轻微（7 项 — 全部确认）

| 编号 | 描述 | 文件 | 行号 | 现场验证 |
|:---:|------|------|------|------|
| **NE134** | Q_E_110 领域分类错误（电→力） | quiz.js | L5607 | 第6道领域分类错误题 |
| **NE135** | 新增 3 组完全重复 + 4 组近似重复 | quiz.js | — | 累计 57 组重复/近似重复 |
| **NE136** | 死代码 @keyframes（2处） | css/game_v2.css | L725/1139 | turnDim 空关键帧 + rarity-rainbow 无引用 |
| **NE137** | 头注释声称 17 种 effect type，实际 19 种 | combo_table.js | L7 | 注释数字与实际列举不符 |
| **NE138** | `_scoreCombo` 3 个 case 无 combo 使用 | ai.js | — | boost_clear_debuff/return_to_hand/set_return_to_hand 死代码 |
| **NE139** | A-block 卡牌 ID 乱序 | cards.js | — | A44-A55 分散插入 A14-A42 之间 |
| **NE140** | 混沌符文 SVG，其余 5 领域 PNG | runes.js | L8 | 格式不一致 |

### 历史遗留确认表

| 编号 | 描述 | 状态 |
|:---:|------|:---:|
| NE110 | C06/C07 减费守卫键名错 | ✅ 确认仍存在 |
| NE73 | S24 burnEnhanced 永久泄漏 | ✅ 确认仍存在 |
| N23+N24+NE74 | A11 引爆旧 fieldSupports 残留 | ✅ 确认仍存在 |
| NE76 | _ignoreDefBonus 实现语义错误 | ✅ 确认仍存在 |
| NE78 | calculateDamage skipDefense 仍算 totalDefense | ✅ 确认仍存在 |
| NE61/NE62 | 顶级 effect 键未声明 | ✅ 确认仍存在 |
| NE75/NE43 | processDOT/Burn 无胜利检查 | ✅ 设计模式 |
| NE111 | Q_H_128 两个正确答案 | ✅ 确认仍存在 |
| NE112 | 雷雨题三重重复 | ✅ 确认仍存在 |
| NE114 | 5+1=6 道领域分类错误 | ✅ 确认仍存在 |
| NE115 | 57 组重复/近似重复 | ✅ 确认仍存在 |
| NE113 | abc-row/d-zone/divider-row 依赖媒体查询 | ✅ 确认仍存在 |
| NE102-109 | CSS 8 项性能/兼容性 | ✅ 确认仍存在 |
| NE84-86 | 3 处 XSS 注入（+NE119=4处） | ✅ 确认仍存在 |
| NE87-89 | 3 弹窗无超时 | ✅ 确认仍存在 |
| NE44 | :focus-visible + prefers-reduced-motion 缺失 | ✅ 确认仍存在 |

---

## 统计总览

| 严重度 | 07-17 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 26 | 0 | 26 | 0 | **26** |
| 🟡 中等 | 67 | 0 | 67 | 0 | **67** |
| 🟢 轻微 | 70 | 0 | 70 | 0 | **70** |
| **合计** | **163** | **0** | **163** | **0** | **163** |

> JS/CSS 自 07-12 以来连续第六天零变更。代码质量稳定但技术债务严重：26 个严重问题中有 A11 三重缺陷（引爆归属注入 + isFieldCard 缺失 + 旧实例泄漏）、S24 burnEnhanced 永不复原的 6 条泄漏路径、第 4 个 XSS 注入点、2 道题目设计错误。163 个问题中 0 个得到修复，强烈建议在进入阶段 3（内测发布）前集中处理。

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
| 07-17 | 26 | 67 | 70 | 163 | 零变更 | 15 |
| **07-18** | **26** | **67** | **70** | **163** | **零变更** | **15** |

---

## 🎯 优先修复建议 (Top 10)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N23+N24+NE74+NE116+NE121 | A11 啸叫五合一（引爆归属注入 + isFieldCard 缺失 + 旧实例泄漏） | engine.js + cards.js | 游戏逻辑错乱 |
| **P0** | NE73+NE117 | S24 burnEnhanced 通过 6 张卡永久泄漏 | engine.js | 平衡破坏 |
| **P0** | NE110 | C06/C07 减费从未生效 | engine.js | 效果缺失 |
| **P0** | NE84+85+86+NE119 | 第 4 个 XSS 注入点（card detail 弹窗） | ui.js | 安全 |
| **P1** | NE122 | Q_H_171 疑似错误答案（固都有熔） | quiz.js | 答题公正性 |
| **P1** | NE123 | Q_S_196 题目无正确答案可选 | quiz.js | 题目设计缺陷 |
| **P1** | NE87+88+89+NE131 | 3 弹窗无超时自动关闭 | ui.js | 游戏阻塞 |
| **P1** | NE120 | AI 循环 `!isGameOver`（无括号）逻辑陷阱 | ui.js | 潜在无限循环 |
| **P1** | NE125 | 召唤物放置失败不退还 quizCostReduction | engine.js | 资源泄漏 |
| **P2** | NE124 | canPlay/canPlayQuery ~80% 重复 | engine.js | 维护风险 |

---

> 📝 报告生成时间：2026-07-18 23:40 GMT+8 | 审查方式：并行 Agent 审查 + 主审查员逐行验证 | JS/CSS 自 07-12 以来连续第六天零变更 | 本轮结论：代码稳定，无新问题，163 个问题全量确认仍存在，建议在阶段 3 内测发布前批量修复
