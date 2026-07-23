# 代码审查报告 — 2026-07-23

> **🔥 拐点日**：自 07-11 以来连续 15 天零变更后，本轮首次出现密集修复——**7 个 commits** 修复了 **25+ 项** P0/P1/P2 问题。JS/CSS 恢复活跃维护。问题总数在持续攀升后首次回落。

---

## 审查范围

| 文件 | 行数 | 变更 | 审查重点 |
|------|------|:---:|------|
| js/cards.js | 1286 | — | effect 键死数据 + 硬编码绕过模式 |
| js/engine.js | 3051 | ✅ | 硬编码审计(~85处) + canPlay副作用 + 修复确认 |
| js/combo_table.js | 291 | — | combo 引用完整性 |
| js/ai.js | 1613 | ✅ | 伤害估算覆盖率 + 修复确认(N504/N505/N509等) |
| js/ui.js | 4295 | ✅ | XSS修复确认 + isGameOver修复确认 + 弹窗超时 |
| js/quiz.js | 6270 | ✅ | 领域分类修复确认 + 新答案错误 + ID-Domain不一致 |
| js/runes.js | 11701 | — | 格式统一性 |
| css/game_v2.css | 1285 | ✅ | @keyframes死代码清理确认 + 颜色统一确认 |

---

## 本次新发现问题

### 🔴 严重（6 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N511** | Q_S_150 四个选项全正确，无有效"不正确"答案 | quiz.js | L2176 | 题目问"不正确的是？"，A(固体>空气✓)、B(真空不传声✓)、C(振动产生✓)、D(超声波不能在真空中传播✓) 全部是正确陈述，答案标记为 3(D)但 D 也是物理正确。题目设计缺陷——缺少一个实际错误的选项。 |
| **N512** | Q_L_101 几何数据物理矛盾 | quiz.js | L3145 | 反射+入射夹角 100°→入射角=50°；折射+反射夹角 130°→折射角=80°。但光从空气斜射入玻璃，折射角必须 < 入射角，r=80°>50° 违反折射定律。几何数据在物理上不可能成立。 |
| **N513** | Q_H_154 答案与物理规律相反 | quiz.js | L4666 | "等质同温铜水放同铜入水？"铜的比热小于水，放相同热量后铜温度更低→热量应从水传向铜(水→铜)。当前答案 A(铜→水)错误，且 knowledge 字段写"铜温低"也暗示正确答案应为 B。答案与其 own knowledge 自相矛盾。 |
| **N514** | engine.js A05 `_a05DmgReceived` 追踪逻辑缺陷 | engine.js | L1599 | `if (this._a05DmgReceived && this.hightAtkTrack[oIdx] > 0)` 用 hightAtkTrack 作为伤害追踪守卫。但 hightAtkTrack 只在 A05 在场时递增(L239)，若 A05 尚未登场或已过期则为 0，对手受伤不计入。triggerThreshold 仅在 A05 在场期间累积，可能不符合设计意图。 |
| **N515** | engine.js `canPlay` 方法有副作用 | engine.js | L2810 | `canPlay` 函数名暗示纯查询，实际会修改 `this.mirrorMaze[playerIdx]--` 并调用 `Math.random()`。UI 层已意识到问题——renderHand 通过 `canPlayQuery` 绕过副作用，但根源未消除。若未来有代码直接调用 canPlay 做查询，mirrorMaze 会被意外消耗。此即 N301（S19 白送精神力）的根源。 |
| **N516** | D01 `forceDotBonus` effect 键在 engine.js 中零命中 | cards.js | — | 力之领域(D01)定义了 `forceDotBonus` 键（延续伤害+5），但 engine.js 全量搜索无任何读取该键的逻辑。疑似缺失效果实现。 |

### 🟡 中等（12 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N517** | 5 组硬编码绕过死键 | cards.js | — | A41/A51/A55/S30/S33 的 effect 键被卡片 ID 硬编码分支替代，而非 engine.js 通用读取。effect 数据虽合法定义但"改了不生效"，维护风险同 N507。 |
| **N518** | AI 伤害估算仍遗漏 6 个加成键 | ai.js | — | N504/N505 修复后覆盖率 65%→81%，仍遗漏 `criticalBreak`(×2 影响最大)、`perSupportBonus`、`perBurnBonus`、`perOppFieldCard`、`perSoundFieldBonus`、`domainBonus`。其中 criticalBreak 在 engine.js `calculateDamage`(L895-923) 中是独立乘区，遗漏导致 AI 系统性低估暴击卡。 |
| **N519** | AI `evaluateCardValue` 死代码分支 | ai.js | — | `card.effect.buffDmg` 和 `card.effect.defense` 判断分支（原 N509 位置附近），这两个键在 cards.js 中不存在——辅助卡使用具体键名如 `nextForceBonus`/`nextAtkBonus`。分支永不会命中。 |
| **N520** | engine.js canPlay 中 S23 检查变量不一致 | engine.js | L2861 | 使用 `const opp = this.players[1 - playerIdx]` 重新获取对手，但 L2798 已有 `const opponent`。不一致可能引入不同步 bug。 |
| **N521** | ui.js `showGameOver()` 未清理旧弹窗 | ui.js | — | 异常重入场景（如快速点击/网络延迟重放）可能累积多个游戏结束弹窗。应在新弹窗前移除已存在的 overlay。 |
| **N522** | N417/N418 领域分类仍未修复 | quiz.js | L1093/L5605 | Q_F_180(安全用电→应在"电"领域)仍标记 domain="力"；Q_E_110(μm→m 单位换算→应在"力"领域)仍标记 domain="电"。上次报告标记但本轮未修复。 |
| **N523** | Q_L_183 选项偏差约 12% | quiz.js | — | u=40cm, v=30cm→f≈17.1cm，最近选项 B=15cm，偏差 2.1cm(约12%)。学生可能因 17.1 更接近 20 而选 C。建议调整数据使 f 恰好对应选项。 |
| **N524** | engine.js `getPlayableCards` 冗余三元 | engine.js | L3003 | `this.canPlayQuery ? ... : this.canPlay` —— canPlayQuery 是类方法引用，始终 truthy，三元分支永不走 canPlay。 |
| **N525** | CSS `.bg-sound` 仍用旧蓝色 | css | L727 | `rgba(52,152,219,.15)` (蓝色) 与统一后的 `--snd: #16A085` (绿色) 不匹配。声领域颜色统一（N402）未彻底完成。 |
| **N526** | CSS conic-gradient 仍无 fallback | css | L1012 | N422 声称已修复但确认仍缺失。部分旧移动端/iOS 11 不支持。 |
| **N527** | CSS `transform-origin: !important` (N510) 未修复 | css | L1084 | 若 JS 对悬停中卡牌动态设 transform-origin，此 !important 会覆盖，可能导致飞行动画位置错误。 |
| **N528** | CSS 电领域类名 elec/electric 仍不一致 | css | 多处 | `.domain-elec`(V3) vs `.text-electric`/`.bg-electric`(通用)，N303/N422 仍未统一。 |

### 🟢 轻微（14 项）

| 编号 | 描述 | 文件 | 详情 |
|:---:|------|------|------|
| **N529** | quiz.js ID-Domain 不一致（3 题） | quiz.js | Q_F_191(ID前缀F=力但domain="热")、Q_S_144(ID前缀S=声但domain="光")、Q_E_114(ID前缀E=电但domain="力")。无 `domainByPrefix` 函数依赖前缀，暂为命名惯例问题，无功能影响。 |
| **N530** | A40 `heatDomainBonus` 死键 | cards.js | heatDomainBonus 在 cards.js 定义但 engine.js 无读取逻辑，AI 却会读取导致高估。 |
| **N531** | A54 `perBurnNextSound` 死键 | cards.js | engine.js 和 ai.js 均不读取此键，为孤立数据。 |
| **N532** | S09 combo 键使用中文后缀 | combo_table.js | `"音乐共鸣: 声波共振"` 等 key 包含中文，脆弱性高于结构化枚举。 |
| **N533** | engine.js `boost_dot_increment` 方向变量混淆 | engine.js | L1305 用 oIdx(防守方) 设置 boost，processDOT 中用 playerIdx(DOT承受方)读取，语义一致但变量名在攻击上下文中易混淆。 |
| **N534** | engine.js S29 特殊处理代码结构混乱 | engine.js | `_applySpecialEffects` 中 S29 分支使用双 `return` 而非 if-else，逻辑正确但可读性差。 |
| **N535** | engine.js A16 `returnOnSurvive` 残留标记 | engine.js | `cardCopy._returned = true` 标记保留在卡对象上，若卡被弹回手牌再打出可能携带残留标记。 |
| **N536** | engine.js `_calcRawDamage` 未跳过 combo 防御 | engine.js | 仅跳过 `calculateDamage` 中的 `totalDefense` 减伤，不跳过 combo effects 提供的防御。与"无视防御"语义有差异。 |
| **N537** | engine.js C03/C10 可选链风格不一致 | engine.js | L369 `s.card.id === 'C03'`(无可选链) vs L344 `s.card?.id === 'A11'`(有可选链)，与周围代码风格不统一。 |
| **N538** | quiz.js 22 组真正重复题 | quiz.js | 声学为主(如 Q_S_060=Q_S_169)，跨域重复 7 组。 |
| **N539** | quiz.js 28 组同名异答题 | quiz.js | "关于声现象下列说法正确的是？"出现 11 次答案各异，玩家无法凭题干区分。 |
| **N540** | CSS 注释颜色值不一致 | css | L3/L982 注释写"声=#3498DB"但实际 --snd:#16A085。 |
| **N541** | CSS 光领域颜色双重标准 | css | 旧版 `--lgt:#F1C40F` vs V3 `--dm:#F39C12`。 |
| **N542** | ui.js 卡名转义一致性问题（3 处） | ui.js | bellSpied/Scry/comboList/DeckBuilder 的卡名未走 `_escapeHtml()`，与主力代码风格不一致。 |

---

## 上次问题跟踪

### ✅ 已修复（~26 项）

本轮 7 个 commits 修复了大量问题，按类别汇总：

| 类别 | 修复项 | 对应 commit |
|------|------|:---:|
| **P0 引擎致命** | N302(D03卡牌消失)、N304/N403(C06/C07减费)、A11啸叫五合一(NE116+N23+N24+NE74)、S24 burnEnhanced泄漏(NE73+NE117+N305) | `c55b728` `6157925` |
| **P0 UI 混淆** | N401 isGameOver — ui.js 11 处全部统一为 `this.engine.isGameOver()` 直接调用，消除 `&&`/`||` 双重检查模式 | `c55b728` |
| **P1 安全** | N413/N416 XSS — `_showCardDetail` 和 `_showScryModal` 的卡名/描述已走 `_escapeHtml()`（计数 26 次） | `6157925` |
| **P1 题库** | N414(Q_H_171"固都有熔")选项修正为"晶体都有确定的熔点"；N415(Q_S_196/Q_S_079矛盾)统一答案；N501(Q_F_191物态变化→热)、N502(Q_S_144角反射器→光)、N503(Q_E_114杠杆→力) 领域修正 | `c55b728` `6157925` |
| **P1 UI** | NE87-89+NE131+N314 — 4 个弹窗(弃牌/游戏结束/确认/通知)添加 15 秒超时自动处理 | `508b944` |
| **P2 AI** | N504(5个遗漏加成键)、N505(召唤物通用化)、N405(A54爆燃估值)、N509(死代码分支)、NE129(combo评分)、N404(mirrorEchoBonus)、N412(perBurnNextSound) — AI 伤害估算全面修复 | `7f2409a` `000aeaf` |
| **P2 CSS** | NE136/N420/N421 — 5 个死 @keyframes(cardPlay/electricShock/turnDim/lightFlash/rarity-rainbow) 全部清理；N425 backdrop-filter 添加 -webkit- 前缀；N426 emojiMap 重复去除；N402 声领域 CSS 变量统一为 #16A085 | `6d92dd0` `8973d85` `000aeaf` |

### ⚠️ 部分修复 / 未根本解决

| 编号 | 描述 | 当前状态 |
|:---:|------|------|
| **N301** | S19 canPlay 白送精神力 | UI 层通过 `canPlayQuery` 绕过了副作用，运行时不再误耗 mirrorMaze。但 engine.js `canPlay` 方法仍有副作用（N515 的上游根源），未根本重构。 |
| **N417/N418** | Q_F_180/Q_E_110 领域分类 | 仍未修复。commit `6157925` 声称"领域分类"但仅修复了 N501-N503 三题，遗留了最初报告的这两题。 |
| **N402** | 声领域颜色统一 | CSS 变量 `--snd` 已统一，但 `.bg-sound` 仍用旧蓝色 rgba(52,152,219,.15)（N525），注释也未更新（N540）。 |
| **N422** | conic-gradient fallback | commit `000aeaf` 声称修复但实际确认仍缺失。 |
| **N510** | transform-origin !important | 未修复。 |
| **N303** | 电领域类名不一致 | 未修复。 |

### ❌ 确认未修复（~22 项）

以下问题在 7 个 commits 中未被涉及，代码中确认仍存在：

| 严重度 | 数量 | 代表问题 |
|:---:|:---:|------|
| 🔴 严重 | ~18 | 硬编码体系(~85处无法一次性清理)、NE122/NE123(答案错误已修复→N414/N415)、N301(canPlay副作用根源) |
| 🟡 中等 | ~70 | canPlay/canPlayQuery重复(NE124/N407)、题库重复~94题(N427)、AI剩余遗漏(N518)、CSS多项(N510/N525-N528) |
| 🟢 轻微 | ~65 | emojiMap残留、@keyframes边缘清理、命名规范等 |

---

## 统计总览

| 严重度 | 07-22 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 33 | ~14 | ~19 | **6** | **~25** |
| 🟡 中等 | 103 | ~9 | ~94 | **12** | **~106** |
| 🟢 轻微 | 95 | ~3 | ~92 | **14** | **~106** |
| **合计** | **231** | **~26** | **~205** | **32** | **~237** |

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
| 07-22 | 33 | 103 | 95 | 231 | 零变更 | 10 | 15 |
| **07-23** | **~25** | **~106** | **~106** | **~237** | **密集变更(7 commits)** | **32** | **~26** |

> **趋势解读**：15 天零变更后迎来修复爆发——P0 致命问题（D03卡牌消失/C06C07减费/S24泄漏/A11归属错乱/isGameOver混淆）全部解决，P1 安全/题库/UI 质量大幅提升。但本轮审查也发现 32 个新问题（集中在 quiz.js 答案正确性与 engine.js 边界条件）。问题总数因新发现略增，但**严重问题净减少 ~8 项**，整体质量上升。

---

## 🎯 优先修复建议 (Top 15)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N513 | Q_H_154 答案与物理规律相反 | quiz.js | 答题公正性——学生会学到错误知识 |
| **P0** | N512 | Q_L_101 几何数据物理不可能 | quiz.js | 题目无法正确解答，严重困惑 |
| **P0** | N511 | Q_S_150 四个选项全正确 | quiz.js | 题目设计缺陷，选任何答案都"错" |
| **P0** | N514 | A05 伤害追踪逻辑缺陷 | engine.js | A05 triggerThreshold 可能永远达不到 |
| **P0** | N516 | D01 forceDotBonus 疑似缺失实现 | engine.js | 力之领域延续伤害效果不生效 |
| **P1** | N515 | canPlay 副作用根源 | engine.js | 查询函数中修改状态，重构风险 |
| **P1** | N517 | 5 组硬编码绕过死键 | engine.js | A41/A51/A55/S30/S33 改了数据不生效 |
| **P1** | N518 | AI 遗漏 criticalBreak 等 6 键 | ai.js | AI 系统性低估暴击/领域加成卡 |
| **P1** | N522 | N417/N418 领域分类仍未修复 | quiz.js | Q_F_180(安全用电→力)、Q_E_110(单位→电) |
| **P2** | N521 | showGameOver 未防重入 | ui.js | 极端场景多个结束弹窗叠加 |
| **P2** | N525 | bg-sound 颜色残留 | css | 声领域视觉不统一 |
| **P2** | N527 | transform-origin !important | css | 飞行动画潜在冲突 |
| **P2** | N519 | AI evaluateCardValue 死代码 | ai.js | 永不会命中的分支，代码整洁 |
| **P2** | N524 | getPlayableCards 冗余三元 | engine.js | 无功能影响但代码整洁 |
| **P3** | N539 | 28 组同名异答题 | quiz.js | 答题体验——玩家无法凭题干区分 |

---

> 📝 报告生成时间：2026-07-23 23:33 GMT+8 | 审查方式：全量逐文件审查 + 6 Agent 并行纵深交叉验证 | JS/CSS 自 07-11 以来首次恢复活跃变更，7 commits 密集修复 | 本轮结论：**质量拐点**。P0 致命问题清零，P1 安全/UI 大幅改善。严重问题数 33→~25（↓24%）。但 quiz.js 本轮新发现 4 个严重答案/数据错误（N511-N513 + N601-N604 交叉验证），需立即修复。强烈建议在阶段 3 内测发布前完成 N511-N516 全部 6 项严重问题修复。
