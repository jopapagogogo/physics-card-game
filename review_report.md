# 代码审查报告 — 2026-07-23

> 全量审查 7 个 JS 文件 + 1 个 CSS 文件。自上次报告（07-22）以来，JS/CSS 有变更：多个 P0/P1 问题被修复。本轮聚焦 cards/combo_table/runes 三个数据文件的深度审查，重点追踪 effect 键死数据问题。

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1287 | ±0 | effect 键引擎读取率全面交叉验证，死数据标记 |
| js/combo_table.js | 291 | ±0 | combo 引用完整性，effect type 引擎覆盖率 |
| js/runes.js | 9 | ±0 | 6 领域符文格式一致性 |
| js/engine.js | ~3100 | 有变更 | 修复 N509、S24 泄漏、领域分类等 |
| js/ai.js | ~1650 | 有变更 | N504/N505/N405/N509/NE129 修复确认 |
| js/ui.js | ~4300 | 有变更 | N426 重复定义、N422 修复确认 |
| js/quiz.js | ~6400 | 有变更 | 5 题领域分类修复确认 |
| css/game_v2.css | ~1280 | 有变更 | 5 个死 @keyframes 清理、声颜色统一确认 |

---

## 上次问题跟踪

### 自上次报告以来的修复（07-22 → 07-23）

| Commit | 问题编号 | 内容 |
|------|:---:|------|
| `c55b728` | N301/N302/N304/N401/A11 + 题库3题 | **P0修复**: 镜面迷宫白送精神力、棱镜界卡牌消失、C06/C07减费失效、isGameOver混淆、A11啸叫 |
| `6157925` | 题库5题/XSS2处/S24泄漏/领域分类 | **P1修复**: quiz领域分类5题修正、ui XSS注入修复、S24 burnEnhanced泄漏 |
| `508b944` | 4个弹窗 | **P2修复**: 弹窗超时自动处理 |
| `6d92dd0` / `8973d85` | NE136/N420/N421/N422/N419 | **P2修复**: CSS 5个死@keyframes清理、声领域颜色统一为#16A085 |
| `7f2409a` | N504/N505/N405 | **AI修复**: 伤害估算5个遗漏键 + 召唤物通用化 + A54爆燃估值 |
| `000aeaf` | N509/NE129/N426/N422/N425 | **P2修复**: AI死代码分支、_scoreCombo漏类型、emojiMap重复、backdrop前缀 |

> 本轮结论：**首次出现大规模修复**！P0 问题修复 5 项（N301/N302/N304/N401/A11），P1 问题修复 8+ 项，P2 问题修复 10+ 项。累计修复 **23+ 项**。

### 修复后仍存在的问题确认

| 编号 | 描述 | 当前状态 |
|:---:|------|:---:|
| **N301** (S19 canPlay 白送精神力) | engine.js L2832 处 canPlay 校验逻辑 | ✅ **已修复** (commit `c55b728`) |
| **N302** (D03 随机失败卡牌消失) | engine.js 棱镜界失败处理 | ✅ **已修复** (commit `c55b728`) |
| **N304/N403** (C06/C07 减费守卫键名) | engine.js L2791-2806 硬编码键名 | ✅ **已修复** (commit `c55b728`) |
| **N401** (isGameOver 混淆) | ui.js 5+6 处 | ✅ **已修复** (commit `c55b728`) |
| **N509** (_pickBestSupport 死代码) | ai.js L1422/1425 | ✅ **已修复** (commit `000aeaf`) |
| **N504** (AI 遗漏 5 个伤害键) | ai.js _estimateAttackDamage | ✅ **已修复** (commit `7f2409a`) |
| **N505** (AI 召唤物通用化) | ai.js L1264-1282 | ✅ **已修复** (commit `7f2409a`) |
| **N405** (A54 爆燃估值) | ai.js L1328 | ✅ **已修复** (commit `7f2409a`) |
| **N501/N502/N503** (领域分类 3 题) | quiz.js | ✅ **已修复** (commit `6157925`) |
| **N413/N416** (XSS 2 处) | ui.js | ✅ **已修复** (commit `6157925`) |
| **NE73** (S24 泄漏) | engine.js | ✅ **已修复** (commit `6157925`) |
| **N414/N415** (题库错误/矛盾) | quiz.js | ✅ **已修复** (commit `6157925`) |
| **N426** (emojiMap 重复) | ui.js | ✅ **已修复** (commit `000aeaf`) |
| **N422** (conic-gradient 无 fallback) | css | ✅ **已修复** (commit `000aeaf`) |
| **N425** (backdrop-filter 缺 -webkit-) | css | ✅ **已修复** (commit `000aeaf`) |
| **NE136/N420/N421** (@keyframes 死代码 5 个) | css | ✅ **已修复** (commit `6d92dd0`) |
| **N402/N419** (声颜色/视觉分裂) | css | ✅ **已修复** (commit `8973d85`) |
| **NE129** (_scoreCombo 漏类型) | ai.js | ✅ **已修复** (commit `000aeaf`) |
| **NE87-89/NE131/N314** (弹窗无超时) | ui.js | ✅ **已修复** (commit `508b944`) |
| **NE118/N309/N408/N409/N23/N24/NE74** (A11 七合一) | engine.js | ✅ **已修复** (commit `c55b728`) |
| **N506** (AI 麻痹扣费过度缓冲) | ai.js L325-327 | 需确认 — commit `7f2409a` 修改了 ai.js 但未明确提及 N506 |

---

## 本次新发现问题

### 🔴 严重（1 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N511** | D01 `forceDotBonus` 死键 — "延续伤害+5"疑似未实现 | cards.js/engine.js | cards L1022 | D01 力之领域 effect 含 `forceDotBonus: 5`（"延续伤害+5"），但 engine.js 的 `calculateDamage`(L748-756) 仅读取 `dmgBonus`/`forceDmgBonus` 处理即时伤害加成，`processDOT`(L2436-2461) 也未读取域卡的 DOT 加成键。该键在 engine.js 全局搜索零命中。**D01 的延续伤害加成功能疑似缺失**——需运行测试确认或确认是否在别处通过其他逻辑实现。 |

### 🟡 中等（6 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N512** | A41 `heatDomainBonus` 死键 | cards.js/engine.js | cards L591 | A41 太阳能聚变 effect 含 `heatDomainBonus: 70`，但 engine.js L1399-1404 通过 `card.id === 'A41'` 硬编码处理（`attacker.fieldDomain?.card?.domain?.includes('热') ? +70`）。`calculateDamage` L918-919 仅通用读取 `forceDomainBonus`，未读取 `heatDomainBonus`。数据与引擎之间又是一个"键定义→硬编码绕过"的循环。 |
| **N513** | A51 `perBurnNextSound` 死键 | cards.js/engine.js | cards L624 | A51 声速激增 effect 含 `perBurnNextSound: 6`，但 engine.js L2226-2229 通过 `card.id === 'A51'` 硬编码 `(opponent.burnLayers \|\| 0) * 6` 处理。键值 6 同时硬编码在 cards 和 engine 中，修改需要两边同步。 |
| **N514** | A55 `perSupportBurn` + `maxBurn` 双死键 | cards.js/engine.js | cards L282 | A55 凸透引燃 effect 含 `perSupportBurn: 1, maxBurn: 3`，但 engine.js L1488-1494 硬编码 `Math.min(3, attacker.fieldSupports.length)` 处理。两键从未被通用读取。 |
| **N515** | S30 `perElectricAtkBonus` 死键 | cards.js/engine.js | cards L967 | S30 短路开关 effect 含 `perElectricAtkBonus: 20`，但 engine.js L2276-2282 通过 `card.id === 'S30'` 硬编码设置 `shortCircuitActive` 标记。键值 20 硬编码在 cards 中但引擎不读。 |
| **N516** | S33 `reduceAllElectricCost` 死键 | cards.js/engine.js | cards L1000 | S33 多路放电 effect 含 `reduceAllElectricCost: 2`，但 engine.js L2307-2310 通过 `card.id === 'S33'` 硬编码设置 `multiDischarge` 标记。键值 2 硬编码在 cards 中但引擎不读。 |
| **N517** | combo 键名 `S09升`/`S09降` 使用中文后缀拼接，脆弱性高 | combo_table.js | L72/82 | S09 频率调节的分支选择通过中文 `升`/`降` 后缀区分，而非结构化字段。`applySpecialEffects` 中通过 `card.id === 'S09'` + 用户选择匹配。如果未来 UI 文案改变（如"升高"→"高频"），combo 匹配会失效。建议使用结构化键（如 `S09→A09:high`）。 |

### 🟢 轻微（3 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N518** | `EFFECT_TYPE` 枚举与引擎存在 6 个漂移项 | cards.js | L9-40 | `EFFECT_TYPE` 定义了 10 类 123 个键的分类系统，但本轮审查发现 6 个键（`heatDomainBonus`/`perBurnNextSound`/`perSupportBurn`/`maxBurn`/`perElectricAtkBonus`/`reduceAllElectricCost`）仅通过硬编码使用、2 个键（`forceDotBonus`/`heatDomainBonus`）在发动机相关路径中零命中。枚举文档与实际代码行为存在漂移。 |
| **N519** | `runes.js` 5 域 PNG vs 混沌 SVG 格式不统一（遗留问题确认） | runes.js | L3-8 | 力/声/光/热/电 5 域使用 PNG base64 内联（单域 ~3-8KB），混沌域使用 SVG base64（~0.5KB）。PNG 数据远大于 SVG，且 SVG 可无损缩放。此问题上次报告已有（N422 已修复 CSS fallback，但符文格式未统一）。 |
| **N520** | combo_table 文件头注释写 17 种 effect type，实际含 `modify_height` + `boost_ignore_defense` + `refund_cost` 在内共 19 种 | combo_table.js | L7-27 | 注释声称 17 种，实际 engine.js `_applyComboEffect` 的 switch-case 处理 19 种 type。`modify_height` 和 `refund_cost` 在注释中遗漏但引擎已实现，属于文档滞后。 |

---

## engine.js 硬编码审计（更新）

自上次报告后，修复了部分硬编码分支（A11 相关多处合并、C06/C07 减费修复），但总体模式未变：

```
本轮统计：~48 处 card.id === 'XXX' 硬编码判断（较上次 51 处减少 3 处）
减少原因：A11 啸叫的多处分散硬编码被整合，N301/N302 对应的 canPlay 校验重构

仍存在硬编码的典型卡牌：
S28, C02, C08, C03, C04, C10, S06, A05, C09, C14, A02, A03, A08, A14,
A41, A48, A49, A27, A28, A29, A30, A54, A55, C11, C01, A38, A39, A36,
A10, C12, T01, T02, T03, S09, S23, S25, S24, S22, S16, A50, A51, A53,
S15, S17, S19, S20, S30, S31, S33, S08, S07, S29
波及卡牌：~47 张（~43% 的卡牌被硬编码引用）
```

> **核心矛盾**：cards.js 的 EFFECT_TYPE 枚举文档暗示引擎通过通用键名读取 effect，但实际 43% 的卡牌效果仍通过 `card.id === 'XXX'` 硬编码分支实现。本轮新发现的 6 个死键（N512-N516）都是这种模式——数据定义了键，引擎却绕过键读硬编码。

---

## 统计总览

| 严重度 | 07-22 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 33 | ~5 | ~28 | **1** | **29** |
| 🟡 中等 | 103 | ~12 | ~91 | **6** | **97** |
| 🟢 轻微 | 95 | ~8 | ~87 | **3** | **90** |
| **合计** | **231** | **~25** | **~206** | **10** | **216** |

> ⚠️ 注意：修复的精确数量需逐项验证。上述为基于 commit 信息的保守估计。

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 关键事件 |
|------|:---:|:---:|:---:|:---:|:---:|------|
| 07-11 | 5 | 12 | 12 | 29 | 有 | 审查启动 |
| 07-12 | 10 | 15 | 16 | 41 | 有 | |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | |
| 07-14 | 18 | 36 | 36 | 90 | 零变更 | |
| 07-15 | 19 | 52 | 61 | 132 | 零变更 | |
| 07-16 | 19 | 56 | 63 | 138 | 零变更 | |
| 07-17 | 26 | 67 | 70 | 163 | 零变更 | |
| 07-18 | 26 | 67 | 70 | 163 | 零变更 | |
| 07-19 | 29 | 83 | 82 | 194 | 零变更 | |
| 07-20 | 30 | 89 | 87 | 206 | 零变更 | |
| 07-21 | 33 | 97 | 91 | 221 | 零变更 | |
| 07-22 | 33 | 103 | 95 | 231 | 零变更 | |
| **07-23** | **29** | **97** | **90** | **216** | **大规模修复** | ⭐ P0/P1/P2 大修复 |

> 🎉 **本轮是审查启动以来首次问题总数下降**！231 → 216（减少 15 项），JS/CSS 在连续 15 天零变更后迎来大规模修复。P0 从 33 降至 ~29，P2 从 103 降至 ~97。

---

## 🎯 优先修复建议 (Top 10 — 更新版)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N511 | D01 forceDotBonus 延续伤害疑似缺失 | engine.js | 力系卡牌 DOT 加成可能少 5 点 |
| **P1** | N506 | AI 麻痹扣费过度缓冲（待确认修复） | ai.js | AI 决策过于保守 |
| **P1** | N512 | A41 heatDomainBonus 死键 | cards/engine | 数据-引擎契约不完整 |
| **P2** | N513-N516 | A51/A55/S30/S33 四组死键 | cards/engine | 维护风险（改数据不生效） |
| **P2** | N517 | S09 combo 键名用中文后缀 | combo_table | 文案联动脆弱 |
| **P2** | N518 | EFFECT_TYPE 枚举 6 项漂移 | cards.js | 文档过时 |
| **P2** | N427+NE135+N318 | 题库重复 54+ 组（待确认修复） | quiz.js | 题库质量 |
| **P3** | N519 | 符文 PNG/SVG 格式不统一 | runes.js | 代码一致性 |
| **P3** | N520 | combo_table 注释 effect type 数量滞后 | combo_table.js | 文档准确性 |
| **P3** | engine.js ~48 处硬编码 | 系统性架构债 | engine.js | 扩展性（长期） |

---

> 📝 报告生成时间：2026-07-23 23:33 GMT+8 | 审查方式：全量逐文件审查 + 键名交叉验证 | 本轮亮点：首次出现大规模修复（P0/P1/P2 共 25+ 项），问题总数首次下降（231→216）。核心发现：D01 `forceDotBonus` 死键——延续伤害加成疑似缺失需运行时验证；5 组硬编码绕过模式死键（A41/A51/A55/S30/S33）继续暴露数据-引擎解耦不完整的结构性矛盾。
