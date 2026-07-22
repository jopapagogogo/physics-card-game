# 代码审查报告 — 2026-07-22

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。JS/CSS 自 2026-07-11 以来连续第 **15 天零变更**。本轮纵深审查 focus on quiz.js 领域分类错误 + ai.js 伤害估算遗漏 + engine.js 硬编码模式审计 + ui.js XSS/事件确认。新发现 **10** 个问题（0 严重 / 6 中等 / 4 轻微）。

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | effect 键使用率 + 死数据标记 |
| js/engine.js | 3042 | ±0 | 硬编码 ID 模式审计（50+ 处）+ `\|\|` 零值误伤 |
| js/combo_table.js | 291 | ±0 | combo 引用完整性 + 低频 type |
| js/ai.js | 1595 | ±0 | _estimateAttackDamage 伤害键覆盖 + 召唤物通用化 |
| js/ui.js | 4298 | ±0 | XSS 2 处确认 + isGameOver 11 处确认 + emojiMap 重复 |
| js/quiz.js | 6270 | ±0 | 领域分类错误 3 题新发现 + 答案错误确认 |
| js/runes.js | 9 | ±0 | SVG/PNG 格式不统一 |
| css/game_v2.css | 1297 | ±0 | !important 17 处确认 + @keyframes 死代码确认 + 颜色分裂 |

---

## 本次新发现问题

### 🔴 严重（0 项）

无新增严重问题。上轮 33 项严重问题全部确认仍存在。

### 🟡 中等（6 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N501** | Q_F_191 领域分类错误：物态变化→力学 | quiz.js | L1159-1162 | 题目"下列物态变化中吸收热量的是？"（熔化/凝固/液化/凝华）属于热学核心内容，却标记 `domain: "力"`。物态变化与力学无关，应归入"热"领域。 |
| **N502** | Q_S_144 领域分类错误：角反射器→声学 | quiz.js | L2140-2143 | 题目"夜晚汽车光照射自行车尾灯反射"考查角反射器原理（光学），却标记 `domain: "声"`。题目内容与声学完全无关，应归入"光"领域。 |
| **N503** | Q_E_114 领域分类错误：杠杆→电学 | quiz.js | L5629-5632 | 题目"费力杠杆？"（筷子/起子/钳子/扳手）是力学/简单机械内容，却标记 `domain: "电"`。应归入"力"领域。 |
| **N504** | AI `_estimateAttackDamage` 遗漏 5 个伤害加成键 | ai.js | L1245-1291 | `perSupportBonus`(A04/A20)、`perBurnBonus`(A21/D04/C13)、`perOppFieldCard`(A31)、`perSoundFieldBonus`(A13/D02)、`domainBonus`(A40) 这些 effect 键在 engine.js `calculateDamage`(L895-923) 均已处理，但 ai.js 估算时未读取，导致 AI 系统性低估这些卡牌的伤害。 |
| **N505** | AI 召唤物伤害加成未做通用化处理 | ai.js | L1264-1282 | 仅通过 `s.card.id` 硬编码匹配 C09/C13/C14 处理召唤物加成。engine.js L769-776 已通用化处理 `bonusKeys`（forceDmgBonus/heatDmgBonus/lightDmgBonus/soundDmgBonus/electricDmgBonus），但 ai.js 未做同样处理。新增召唤物需同时改 ai.js，解耦不完整。 |
| **N506** | AI `SpiritBudgetManager` 麻痹扣费过度缓冲 | ai.js | L325-327 | `effectiveSpirit = Math.max(0, spirit - paralysis * PARALYSIS_COST * 2)` — `PARALYSIS_COST` 本身已是麻痹每层额外费（2），再 `* 2` 造成每层麻痹按 4 费缓冲而非 2 费，导致 AI 在实际可用精神力充足时过度保守。 |

### 🟢 轻微（4 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N507** | A02 `carryRatio: 0.5` 为死数据 | cards.js | L72 | engine.js L1352 对 A02 硬编码了 0.5 倍率（`card.id === 'A02'` 分支），`effect.carryRatio` 字段从未被通用读取。数据与引擎解耦不完整。 |
| **N508** | A14 `delayedDmg`/`delayTurns` effect 键未被引擎通用读取 | cards.js | L183 | engine.js L1382-1388 通过 `card.id === 'A14'` 硬编码处理延迟伤害，这两个 effect 键虽合法定义但未被引擎 `_calculateRawDamage` 通用解析，增加了"修改数据不生效"的维护风险。 |
| **N509** | AI `_pickBestSupport` 使用非标准 effect 键 | ai.js | L1422/1425 | `card.effect.buffDmg` 和 `card.effect.defense` 在 cards.js 中不存在——辅助卡使用 `nextForceBonus`/`nextAtkBonus`/`nextSoundBonus` 等具体键名。这两处判断永远不会命中，为死代码分支。 |
| **N510** | CSS `transform-origin: !important` 可能阻碍飞行动画精确性 | css | L1096 | `.card-v3.mini:hover` 使用 `transform-origin:center center !important`，若 JS 动态设置飞行动画的 `transform-origin`，会被此规则覆盖，可能导致卡牌飞向错误方向。 |

---

## 上次问题跟踪

### 已修复（0 项）

JS/CSS 自 07-11 以来连续 **15 天零变更**，无可修复项。所有 221 个问题仍在代码中。

### 重点问题逐项确认

#### 🔴 严重（33 项 — 全部确认）

本轮对以下上轮新发现严重问题进行纵深确认：

| 编号 | 描述 | 验证方式 | 结果 |
|:---:|------|------|:---:|
| **N413** | `_showCardDetail` summary/principle XSS（L4205） | 对比 L3992（`_getCardTooltipHTML`）正确使用了 `_escapeHtml()`，L4205 未使用 | **确认** |
| **N416** | `_showScryModal` card.name XSS（L3370） | 检查 L3370：`card.name` 直接拼入 innerHTML，无 `_escapeHtml` | **确认** |
| **N414** | Q_H_171 "固都有熔"答案科学错误 | 选项A"固都有熔"错误——非晶体无固定熔点 | **确认** |
| **N415** | Q_S_196/Q_S_079 跨题答案矛盾 | 同一概念两道题给出相反答案 | **确认** |
| **NE122** | Q_H_171 答案疑似错误 | 同上 N414 | **确认** |
| **NE123** | Q_S_196 无可选项 | 同上 N415 | **确认** |

其余 27 项严重问题（NE116-NE140, N301-N303, N401）均与上轮描述一致，篇幅所限不逐项列出。

#### isGameOver 混淆（N401）— 11 处全面确认

ui.js 中 `isGameOver` 的所有引用点：

| 行号 | 表达式 | 模式 | 状态 |
|:---:|------|:---:|:---:|
| L2680 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确（先检查属性存在再调用） | ⚠️ 冗余 |
| L3033 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确 | ⚠️ 冗余 |
| L3211 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确 | ⚠️ 冗余 |
| **L3227** | `!this.engine.isGameOver \|\| !this.engine.isGameOver()` | **运算符陷阱** | 🔴 |
| L3274 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确 | ⚠️ 冗余 |
| L3283 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确 | ⚠️ 冗余 |
| L3300 | `!this.engine.isGameOver \|\| !this.engine.isGameOver()` | **运算符陷阱** | 🔴 |
| L3305 | `!this.engine.isGameOver \|\| !this.engine.isGameOver()` | **运算符陷阱** | 🔴 |
| L3310 | `!this.engine.isGameOver \|\| !this.engine.isGameOver()` | **运算符陷阱** | 🔴 |
| L3317 | `this.engine.isGameOver && this.engine.isGameOver()` | 正确 | ⚠️ 冗余 |
| L3328 | `!this.engine.isGameOver \|\| !this.engine.isGameOver()` | **运算符陷阱** | 🔴 |

> 结论：5 处运算符陷阱（L3227/3300/3305/3310/3328）、6 处冗余的正确模式。engine.js 中 `isGameOver` 是方法而非属性，ui.js 统一使用 `this.engine.isGameOver && this.engine.isGameOver()` 的双重检查模式说明开发者不确定其类型，根源是 engine.js 的命名混淆了属性与方法。

#### quiz.js 领域分类错误汇总

本轮新增 3 题 + 确认上轮 2 题 = 共 **5 题**领域分类错误：

| 编号 | 题号 | 当前领域 | 正确领域 | 内容 |
|:---:|------|:---:|:---:|------|
| N417 | Q_F_180 | 力 | 电 | 安全用电 |
| N418 | Q_E_110 | 电 | 力 | μm→m 单位换算 |
| **N501** | Q_F_191 | 力 | 热 | 物态变化（熔化吸热） |
| **N502** | Q_S_144 | 声 | 光 | 角反射器（光反射） |
| **N503** | Q_E_114 | 电 | 力 | 费力杠杆 |

#### engine.js 硬编码 `card.id === 'XXX'` 审计

本轮对 engine.js 中所有硬编码卡牌 ID 进行统计：

```
总计：51 处 card.id === 'XXX' 硬编码判断
分布：S28(2), C02(2), C08(1), C03(1), C10(1), C04(1),
       S06(1), A05(1), C09(1), C14(1), A02(1), A03(1),
       A08(1), A14(1), A41(1), A48(1), A49(1), A27(1),
       A28(1), A29(1), A30(1), A54(1), A55(1), C11(1),
       C01(1), A38(1), A36(2), A11(2), A39(1), S09(1),
       A10(1), C12(1), T01(1), T02(1), T03(1), S23(1),
       S25(1), S24(1), S22(1), S16(2), A50(1), A51(1),
       A53(1)
波及卡牌：42 张（39% 的卡牌被硬编码引用）
```

> 这些硬编码是上轮 NE118/N309/N408/N409 的底层原因——并非仅 3-4 处，而是系统性模式。每次新增卡牌效果都可能需要同步修改 engine.js 的硬编码分支。

#### 🟡 中等 / 🟢 轻微 — 抽样确认

上轮 97 中等 + 91 轻微 = 188 项。本轮抽样确认 20 项（约 11%），全部仍存在。代表性确认：

| 编号 | 描述 | 确认 |
|:---:|------|:---:|
| N304/N403 | C06/C07 减费守卫键名错 | ✅ engine.js L2791-2806 |
| N301 | S19 canPlay 白送精神力 | ✅ engine.js L2791-2798 |
| N302 | D03 随机失败卡牌消失 | ✅ engine.js L2800-2806 |
| NE73 | S24 burnEnhanced 永久泄漏 | ✅ engine.js L1457-1458 |
| NE124/N407 | canPlay/canPlayQuery 80% 重复 | ✅ |
| NE129 | _scoreCombo 缺 boost_mirage/refund_cost | ✅ ai.js L718-779 |
| N404 | AI mirrorEchoBonus 未追踪 | ✅ ai.js L1339-1341 |
| N405 | A54 爆燃估值偏低(48→应为50) | ✅ ai.js L1328 |
| N412 | perBurnNextSound 未追踪 | ✅ ai.js L1331-1332 |
| NE132 | !important 17 处 | ✅ 精确位置已列出 |
| NE136/N420/N421 | @keyframes 死代码 5 个 | ✅ cardPlay/electricShock/turnDim/lightFlash/rarity-rainbow |
| N402 | 声领域颜色双重标准 | ✅ L1011 vs L1105 |
| N303 | 电领域类名不一致 | ✅ domain-elec vs domain-electric |
| N422 | conic-gradient 无 fallback | ✅ L1024 |
| N425 | backdrop-filter 缺 -webkit- | ✅ L858 |
| N426 | emojiMap 重复定义 | ✅ L3972/4188 |
| N427 | 题库领域内重复 ~94 题 | ✅ |

> 其余 168 项因代码零变更，与上轮状态一致。

---

## 统计总览

| 严重度 | 07-21 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 33 | 0 | 33 | **0** | **33** |
| 🟡 中等 | 97 | 0 | 97 | **6** | **103** |
| 🟢 轻微 | 91 | 0 | 91 | **4** | **95** |
| **合计** | **221** | **0** | **221** | **10** | **231** |

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 新发现 | 已修复 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 07-11 | 5 | 12 | 12 | 29 | 有 | — | — |
| 07-12 | 10 | 15 | 16 | 41 | 有 | 12 | 10 |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | 31 | 10 |
| 07-14 | 18 | 36 | 36 | 90 | 零变更 | 18 | 12 |
| 07-15 | 19 | 52 | 61 | 132 | 零变更 | 42 | 15 |
| 07-16 | 19 | 56 | 63 | 138 | 零变更 | 6 | 15 |
| 07-17 | 26 | 67 | 70 | 163 | 零变更 | 25 | 15 |
| 07-18 | 26 | 67 | 70 | 163 | 零变更 | 0 | 15 |
| 07-19 | 29 | 83 | 82 | 194 | 零变更 | 31 | 15 |
| 07-20 | 30 | 89 | 87 | 206 | 零变更 | 12 | 15 |
| 07-21 | 33 | 97 | 91 | 221 | 零变更 | 15 | 15 |
| **07-22** | **33** | **103** | **95** | **231** | **零变更** | **10** | **15** |

> JS/CSS 自 07-11 以来连续 **15 天**零变更。本轮重点：quiz.js 领域分类错误新增 3 题（Q_F_191 物态变化→力、Q_S_144 角反射器→声、Q_E_114 杠杆→电），累计 5 题。ai.js 伤害估算发现 5 个遗漏的 effect 键 + 召唤物通用化缺失 + 麻痹过度缓冲。engine.js 硬编码审计确认 51 处 `card.id === 'XXX'` 判断。问题总数 **231**。

---

## 🎯 优先修复建议 (Top 15)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N301 | 镜面迷宫(S19) canPlay 白送精神力 | engine.js | 可被无限利用刷精神力 |
| **P0** | N302 | 棱镜界(D03)随机失败卡牌消失 | engine.js | 卡牌永久丢失 |
| **P0** | N304/N403 | C06/C07 减费完全失效 | engine.js | 两张领域卡效果缺失 |
| **P0** | NE116+N23+N24+NE74 | A11 啸叫五合一缺陷 | engine.js | 卡牌归属错乱+幽灵驻场 |
| **P0** | N401 | isGameOver 混淆 5+6 处 | ui.js | 未来重构极易引入短路bug |
| **P1** | NE73+NE117+N305 | S24 burnEnhanced 7 条泄漏路径 | engine.js | 灼烧伤害数值错误 |
| **P1** | NE119+N413+N416+NE84-86 | **6 处** XSS 注入点 | ui.js | 安全风险 |
| **P1** | N303+N402+N419 | 电领域类名 + 声领域色值 + V3尺寸分裂 | css | 视觉一致性 |
| **P1** | NE122/NE123+N414+N415+N501+N502+N503 | 题库答案错误 + 跨题矛盾 + 5 题领域分类错误 | quiz.js | 答题公正性 |
| **P1** | NE87-89+NE131+N314 | 4 个弹窗无超时 | ui.js | 游戏阻塞 |
| **P2** | NE124+N407 | canPlay/canPlayQuery 80% 重复 | engine.js | 维护风险 |
| **P2** | N404+N405+N412+N504+N505+N506 | AI 伤害估算 6 项遗漏 + 召唤物通用化 + 麻痹过度缓冲 | ai.js | AI 决策质量 |
| **P2** | NE135+N318+N423+N427 | 题库重复 54+ 组 + 跨领域答案矛盾 | quiz.js | 题库质量 |
| **P2** | NE136+N420+N421 | CSS @keyframes 死代码 5 个 | css | 代码整洁 |
| **P3** | engine.js 51 处硬编码 + cards.js 死数据 | 系统性的硬编码卡牌 ID | engine/cards | 架构扩展性 |

---

> 📝 报告生成时间：2026-07-22 23:33 GMT+8 | 审查方式：全量逐文件审查 + 4 Agent 纵深交叉验证 + manual 关键区域确认 | JS/CSS 自 07-11 以来连续 15 天零变更 | 本轮结论：代码持续零变更，债务持续累积——221→231 个问题。新增 6 中等（quiz.js 领域分类错误 3 题 + ai.js 伤害估算遗漏 3 项）、4 轻微。强烈建议在阶段 3 内测发布前集中修复 P0/P1 问题——当前 P0+P1 累计 **20 项**。
