# 代码审查报告 — 2026-07-15

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件 + 1 个 JSON 文件（runes 相关）。本轮确认 **3 项已修复**（N14 惯性覆盖、NE09 详情弹窗泄漏、NE52 卡片同名），**新增 49 个问题**（严重 5 / 中等 17 / 轻微 27）。JS/CSS 自 07-12 以来连续零变更，所有遗留代码问题仍然存在。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | 已审查（109卡逐卡 + EFFECT_TYPE 127键完整验证） |
| js/engine.js | 3042 | ±0 | 已审查（关键路径 + 胜利条件 + A11/A10/S24 专项复查） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo 逐个验证 + 非标准键格式审查） |
| js/ai.js | 1595 | ±0 | 已审查（空值安全 + 魔法数字 + this 绑定专项） |
| js/ui.js | 4298 | ±0 | 已审查（XSS 专项 + 超时兜底 + 事件泄漏） |
| js/quiz.js | 6270 | ±0 | 已审查（领域分类 + 重复检测 + 缩写抽样） |
| js/runes.js | 9 | ±0 | 已审查（导出/引用 + 格式一致性 + JSON 交叉验证） |
| css/game_v2.css | 1297 | ±0 | 已审查（兼容性 + 性能 + 无障碍 + 动画审计） |
| domain_runes.json | — | ±0 | 交叉验证（runes.js vs JSON 数据源一致性） |

---

## 本次新发现问题

### 🔴 严重（5 项）

#### NE73 — engine.js：S24 被攻击消灭/弹回时 burnEnhanced 状态泄漏（行1533-1537, 2481-2484）

```javascript
// destroyCards (A09/A18/A25) 和 bounceCards (A38/A46) 调用 _releaseOnFieldClear()
// _releaseOnFieldClear 仅处理 S06 和 A05，不处理 S24（温度升高）
// 若 S24 被摧毁，burnEnhanced 标记永不清除，双方永久享受 36/层的灼烧伤害
```

S24 被强制移除时 `burnEnhanced` 标记泄漏。自然过期路径 L2481-2484 有正确清除，但被攻击消灭/弹回路径缺失。影响：双方灼烧伤害永久+36/层。

#### NE74 — engine.js：A11 引爆时不清除 fieldSupports 中的旧实例（行1658-1673）

```javascript
// _handleAttack 中 A11 引爆后，旧 A11 实例(若有)仍留在 attacker.fieldSupports
// turnsRemaining: 999，下次 turnStart 旧实例 applyPerTurn 重新叠加声压
// 导致可重复触发无限引爆循环
```

与 N23/N24 连锁：A11 引爆路径不仅弃牌归属错误和裸 return 崩溃，旧实例也在 fieldSupports 中残留。三合一连锁缺陷需一次性修复。

#### NE84 — ui.js：凸透成像弹窗 XSS（行3409-3411）

```javascript
// _showConvexLensChoice 内 lastCard.card?.name 直接拼接 innerHTML，未转义
const h = `...「${lastCard.card?.name}」...`;
```

与 NE06（窥牌 XSS）和 NE41（贝尔窥牌 XSS）同类问题的新增点位。`card?.name` 来自引擎数据，虽非直接用户输入但攻击面存在。

#### NE85 — ui.js：窥牌弹窗 card.name/card.dmg XSS（行3370）

```javascript
// _showScryModal renderList 内 card.name 和 card.dmg 直接拼入 innerHTML
// 未调用 _escapeHtml()
```

同一弹窗（`#scry-confirm`）在两次绑定中均存在 XSS 风险。NE06 已标记此问题，本轮确认 NE56 重复绑定使问题更严重。

#### NE86 — ui.js：贝尔窥牌 bellSpied.name XSS（行3545-3546）

```javascript
// _renderBuffIndicators 贝尔窥牌区 bellSpied.name 通过 insertAdjacentHTML 注入
// 未转义，与 NE41 是同一位置但本轮确认为独立注入点
```

---

### 🟡 中等（17 项）

#### NE61 — cards.js：sacrificeElectricSupport 未在 EFFECT_TYPE 声明（行967）

S30 短路开关的顶级 effect 键 `sacrificeElectricSupport` 未在 EFFECT_TYPE 中声明。引擎 `_applySpecialEffects` 可能无法按分类读取此键。

#### NE62 — cards.js：soundSupportExtend 未在 EFFECT_TYPE 声明（行1222）

C12 赫兹的顶级 effect 键 `soundSupportExtend` 未在 EFFECT_TYPE 中声明。与 NE61 同为顶级缺失，优先级最高。

#### NE75 — engine.js：processBurn 无胜利检查（行2399）

```javascript
processBurn(playerIdx) {
    player.hp = Math.max(0, player.hp - burnDmg);  // HP 可能归零
    // 未调用 checkWinCondition()
}
```

processDOT (NE43) 和 processBurn 均缺少胜利检查，仅 processParalysis (L2420) 有检查。3 条 HP 归零路径中 2 条缺失检查，回合内可能产生不一致副作用。

#### NE76 — engine.js：_ignoreDefBonus 语义与实现不一致（行1002-1007）

```javascript
// calculateDamage 在 damage -= totalDefense 之后再加回 _ignoreDefBonus
// 意味着"无视防御"实现为"额外伤害"而非"减免防御"
// 若 opponent 无防御时仍获得额外伤害，名称产生误导
```

#### NE81 — engine.js：A02 惯性冲锋 _inertiaNextTurn 数据被 startTurn 重置风险（行1350-1360）

A02 的 _handleAttack 分两段（L1357 创建标记 → L1602 消费标记）。若两段之间因异常或条件未到 L1602，`_inertiaNextTurn` 中 `pending: true` 将在下回合 startTurn L315 被重置丢弃。虽 try/catch 保护但语义依赖单函数内状态传递，脆弱。

#### NE87 — ui.js：凸透成像弹窗无超时自动关闭（行3403-3431）

`_showConvexLensChoice()` 仅当用户点击选项时关闭，无定时器自动关闭。用户不操作则游戏永久阻塞。与 NE08（弃牌无超时）同类问题。

#### NE88 — ui.js：频率调节弹窗无超时自动关闭（行3434-3455）

`_showFrequencyChoice()` 无超时保护。用户不选择 S09 的高低频选项时游戏阻塞。

#### NE89 — ui.js：X射线透视弹窗无超时自动关闭（行3494-3515）

`_showDiscardOpponentChoice()` 无超时保护。S30/X射线透视不操作时游戏阻塞。

#### NE92 — quiz.js：新发现 3 处领域分类错误

| ID | 当前领域 | 应属领域 | 说明 |
|------|------|------|------|
| Q_S_144 | 声 | **光** | 自行车尾灯角反射器，光的反射知识点 |
| Q_C_015 | 混沌 | **热** | 冰直接变水蒸气——升华，物态变化 |
| Q_F_180 | 力 | **电** | 安全用电原则，Knowledge: `安全用电` |

加上 NE01 的 2 道（Q_F_191 力→热、Q_E_114 电→力），quiz.js 领域分类错误累计 **5 道**。

#### NE93 — quiz.js：新发现 2 组完全重复题

| 重复组 | 题目 |
|--------|------|
| Q_S_115 vs Q_S_155 | "下列四个句子中高字指音调的是？" |
| Q_S_133 vs Q_S_173 | "下列现象中利用回声的是？" |

加上 NE49 的 4 组，quiz.js 累计 **6 组完全重复题**。注：NE02 标记的 4 组（Q_S_021/Q_S_178 等）本轮验证为非重复，原标记可能按知识关联分类而非真正内容重复。

#### NE94 — quiz.js：声域 11 道同题干题（高度近似）

Q_S_042/045/057/067/076/111/122/139/159/201/203 共用题干"关于声现象下列说法正确的是？"，仅选项不同。光域 4 道、力域 4 道存在同类问题。共计 **47 组同题干冗余**。

#### NE96 — runes.js：与 domain_runes.json 数据不一致（行8）

`domain_runes.json` 中 `chaos` 键已使用 PNG 格式，但 `runes.js` 中 `混沌` 仍为 SVG 格式。两处数据源独立维护，出现 fork。修复成本极低（复制 JSON 中 chaos PNG base64 替换 runes.js L8）。

#### NE102 — game_v2.css：filter:blur() 在动画中使用（性能隐患）

两处动画关键帧包含 `filter:blur()`：
- `comboPopup` (L604/L609): `blur(4px)` → `blur(0)`
- `turnBannerPop` (L708/L709): `blur(8px)` → `blur(0)`

`filter:blur()` 触发 GPU 合成层重建，在动画中频繁变化是已知性能瓶颈。

#### NE103 — game_v2.css：rarity-rainbow hue-rotate(360deg) 无限动画 + 可能死代码（行1139）

```css
@keyframes rarity-rainbow { to { filter: hue-rotate(360deg); } }
```

`filter:hue-rotate()` 计算密集且该 @keyframes 在 CSS 中无选择器引用（依赖 JS 注入）。若 JS 未使用则既是死代码又是性能隐患。

#### NE104 — game_v2.css：无限 infinite 动画达 12 个（持续 GPU 消耗）

cardReady、quizTimerBlink、badgePulse、discardPulse(×2)、burnPulse、burnGlow、pulseBtn、targetFlash、borderPulse、summonGlow(×2) 共 12 个无限动画。对战场景下最多同时运行 8-10 个，持续消耗 GPU/CPU。

---

### 🟢 轻微（27 项）

#### NE63-NE70 — cards.js：8 个复合子键未在 EFFECT_TYPE 声明

| 编号 | 键名 | 所属卡 | 嵌套路径 |
|------|------|--------|----------|
| NE63 | `chainPerSupport` | A28 | triggerElectric1 |
| NE64 | `bonusDmg` | A27/A29/A30 | triggerElectric1/2 |
| NE65 | `destroyElectricSupport` | A49 | triggerElectric3 |
| NE66 | `soundBonus` | S09 | choice.high |
| NE67 | `allSoundBonus` | S09 | choice.low |
| NE68 | `extendTurns` | S09 | choice.low |
| NE69 | `restoreHp` | S21 | convexLens.realImage |
| NE70 | `copyEffect` | S21 | convexLens.virtualImage |

取决于引擎是否对复合键做递归 EFFECT_TYPE 查找。若注释"严格按此分类读取"属实，建议补声明或添加复合键白名单。

#### NE71 — cards.js：perElectricCard 分类错误（行17）

S28 电磁感应的 `perElectricCard: 2` 效果为"每打出1张电系卡，获得2点精神力"。这是资源获取而非攻击加成，却列在 `ATK_BONUS` 分类中。应移至 `RESOURCE`。

#### NE72 — cards.js：S28 perElectricCard 可能因分类错误异常

若引擎按 EFFECT_TYPE 分类做领域限定（如力系 ATK_BONUS 不生效于资源类 key），S28 精神力获取可能异常。

#### NE77 — engine.js：canPlay/canPlayQuery 约80%代码重复（行2777-2908）

两方法逻辑高度重合。新增检查条件需同时修改两处，易遗漏。

#### NE78 — engine.js：_calcRawDamage 性能浪费（行3024-3026）

`calculateDamage(card, attackerIdx, defenderIdx, 0, true)` 传递 `skipDefense=true`，但 calculateDamage L971-L1000 仍完整计算了 totalDefense（遍历辅助卡），仅在 L1002 丢弃结果。应提前短路。

#### NE79 — engine.js：_handleSupport 防御与 buff 同名校验不一致（行1747-1774）

defense 查重同时检查 `card.id` 和 `defense.domain`，buffDmg 查重仅检查 `card.id`。不同 ID 的 support 卡提供相同 domain 的 defense 时，前者识别为同名刷新，后者仍新增。

#### NE80 — engine.js：DOT 应用三路径代码重复（行1609-1635）

dotDmg/dot/dotSequence 三路径代码重复，格式统一但维护成本高。

#### NE82 — combo_table.js：非标准键值格式从 2 种增至 5 种仍未文档化（行4-5）

```javascript
// 注释仅描述"此前打出的卡ID→刚才打出的卡ID"，实际存在5种格式：
// "S09升→A09"（后缀）、"A32vsS11"（vs分隔符）及 3 种新格式
```

#### NE83 — combo_table.js：召唤 combo 区域内部排列无序（行246-281）

排列无明确逻辑（非按ID、非按领域），与按领域分组的注释风格不一致。

#### NE90 — ui.js：hover tooltip 监听器在容器替换后残留（行2406-2484）

`showStartScreen()` 替换 innerHTML 后，mouseover/mouseout 监听器仍绑定在 container 元素上。虽无运行时错误但属资源泄漏。

#### NE91 — ui.js：showComboList 缺少防御性转义（行3606-3610）

`item.parsed.from/to/effect` 来自 COMBO_TABLE 的 `_parseComboMsg` 拆分结果，直接拼入 innerHTML。数据源为静态常量，风险极低但缺少防御性措施。

#### NE95 — quiz.js：Q_H_128 知识表述不严谨

选项 A"牛—惯性"应为伽利略提出惯性概念（牛顿贡献是定律而非概念提出），C"奥—电磁感应"应为"电流磁效应"（电磁感应是法拉第）。

#### NE97 — runes.js：混沌回退 emoji 死代码（ui.js:1810/3974/4190）

三处 `(d === '混沌' ? '🌌' : '⚛')` 回退分支在 runes.js 已提供混沌值后永不触发（无害但误导）。

#### NE98 — runes.js：无格式 MIME 兼容性注释

5 张 PNG + 1 张 SVG 混存，文件头部无注释说明格式差异或统一计划。

#### NE99 — runes.js：键名风格与 domain_runes.json 不一致

`runes.js` 使用中文键名（力/声/光/热/电/混沌），`domain_runes.json` 使用英文键名（force/sound/light/heat/electric/chaos），跨文件存在键名歧义风险。

#### NE100 — game_v2.css：inset 无兼容回退（L62/234/399/448/559）

`inset` 属性多处使用，无 `top/right/bottom/left` 回退。旧版 Safari/iOS 需 `-webkit-` 或传统四值写法。

#### NE101 — game_v2.css：@keyframes turnDim 完全空体 + 死代码（行725）

```css
@keyframes turnDim {}
```

空函数体，CSS 中无任何选择器引用。相邻 `.turn-overlay` 已设为 `display:none` 并标注"保留兼容"——两者均为死代码。

#### NE105 — game_v2.css：will-change 完全缺失（全文）

全文件 0 处使用 `will-change`。高频变换元素（如 `.card-v3.mini:hover` 同时改变 `transform` + `box-shadow`）未获得合成层提示。

#### NE106 — game_v2.css：多处于体低于 WCAG 12px 可读性阈值

| 行号 | 字体 | 选择器 |
|------|------|--------|
| L9 | 8px | `.summon-stats` |
| L73 | 9px | 多处 |
| L1091 | 0.55em | `.v3-desc-box` |
| L1154 | 9px | `.skin-anime::after` |
| L1194 | 7px | `.skin-badge` |

对青少年目标用户中视力较弱者不友好。

#### NE107 — game_v2.css：transition:all 精确统计 9 处

L211/L261/L303/L357/L913/L1222/L1250/L1263/L1281。`transition:all` 让浏览器追踪所有可过渡属性，性能浪费。应改为指定实际变化的属性。

#### NE108 — game_v2.css：横屏断点类名完全依赖外部 JS 注入（行773-788）

`.abc-row`、`.d-zone`、`.divider-row` 在本 CSS 中完全未定义。若 JS 注入失败或时序异常，横屏样式静默失效——这是"孤儿依赖"。

#### NE109 — game_v2.css：conic-gradient 缺少降级方案（行1024）

卡牌费用图标金属环使用 `conic-gradient()`，无 `background` 降级。旧浏览器上直接不渲染。

---

## 上次问题跟踪

### 已修复（3 项）✨

| 编号 | 内容 | 说明 |
|:---:|------|------|
| **N14** | engine.js _inertiaNextTurn 被 endTurn 覆盖 | ✅ endTurn 已不重置此标记 |
| **NE09** | ui.js 卡牌详情弹窗 document 级监听器泄漏 | ✅ _closeCardDetail 正确清理 |
| **NE52** | cards.js A27 与 S31 同名"高压击穿" | ✅ A27 已更名为"闪电劈击" |

注：NE11（quiz 图片引用）和 M14（S17→A16 combo 冗余）在上次报告已确认为之前修复，本轮不再重新计入。

### 仍遗留（87 项）

#### 🔴 严重（14 项）

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| N18/NE05 | ❌ | checkCombo 不检查对手场上卡牌 |
| N22/N39 | ❌ | C06/C07 减费 key 不匹配，效果完全失效 |
| N23 | ❌ | A11 弃牌堆归属错误 |
| N24 | ❌ | A11 裸 return 致 TypeError |
| N38/NE15 | ❌ | A10 DOT 递增公式被 combo 延长回合破坏 |
| N40 | ❌ | A11 try/catch 掩盖 N23/N24 |
| NE03 | ❌ | A11 缺少 isFieldCard:true |
| NE04 | ❌ | canPlay 镜面迷宫白送精神力 |
| NE05 | ❌ | 同 N18 |
| NE10/N35 | ❌ | 缺少 prefers-reduced-motion |
| NE41 | ❌ | 凸透成像 XSS（本轮 NE84 同源新增） |
| NE43 | ❌ | processDOT 不检查胜利条件 |
| NE44 | ❌ | 完全缺少 :focus-visible 焦点样式 |
| NE50 | ❌ | 电/热领域约 390 题过度缩写 |

#### 🟡 中等（36 项）

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| N6 | ❌ | game_v2.css 横屏断点依赖 JS 注入 |
| N17 | ❌ | 召唤物上限/同名双重检查(死代码) |
| N22/N39 | ❌ | C06/C07 减费（同 🔴 区） |
| N25 | ❌ | _handleSummon combo default 占位 |
| N26 | ❌ | C09/C14 召唤物加成 effects 缺失通知 |
| N27 | ❌ | A16 set_return_to_hand 有 case 无使用 |
| N28 | ❌ | _releaseOnFieldClear 注释缺失 + S24 泄漏(NE73) |
| N29 | ❌ | 无用 @keyframes（NE23+NE101） |
| N30 | ❌ | backdrop-filter 无 -webkit- 前缀 |
| N36 | ❌ | !important 17 处 |
| N37 | ❌ | 硬编码颜色 60+ 处 |
| N38 | ❌ | 同 🔴 区 |
| M9 | ❌ | S08 extraCost Math.max 覆盖而非累加 |
| M11 | ❌ | A11 啸叫引爆逻辑（N23/N24/NE74 三合一） |
| M15 | ❌ | S07→A14 语义不明（需设计确认） |
| M16 | ❌ | A25→A26 msg 表述误导 |
| M17 | ❌ | S01→A05 perHeight vs heightBonus 命名不一致 |
| M19/NE16 | ❌ | combo 注释"17种"实际 19 种 |
| NE01 | ❌ | quiz.js 4 道领域分类错误 → 本轮确认为 2 道 |
| NE02 | ⚠️ 部分 | 4 组重复可能误报（本轮验证为非重复） |
| NE06 | ❌ | 窥牌 XSS（本轮 NE85 同源） |
| NE07/NE42 | ❌ | AI 回合循环/if 操作符优先级 |
| NE08/NE57 | ❌ | 弃牌弹窗无超时 + 事件泄漏 |
| NE12 | ❌ | 9 个 effect 键未声明（本轮 NE61-NE70 扩大至 10+8） |
| NE14 | ❌ | S34 领域描述矛盾 |
| NE15 | ❌ | 同 N38 |
| NE18 | ❌ | ai.js _handleDiscard 硬编码 maxSize=7 |
| NE19 | ❌ | ai.js 6 个未使用参数 |
| NE20 | ❌ | ai.js computeStats 依赖 .call(self) |
| NE22/N5 | ❌ | color-mix 无 fallback |
| NE23/NE51 | ❌ | 无用 @keyframes（确认 8+1 个） |
| NE45 | ❌ | _turnAllSoundBonus 对所有领域攻击生效 |
| NE46 | ❌ | A11 两处引爆逻辑不一致 |
| NE47 | ❌ | clearDebuff 一次清除 3 种但日志称"1种" |
| NE48 | ❌ | quiz.js 2 道领域分类错误 |
| NE49 | ❌ | quiz.js 4 组重复题（本轮确认） |

#### 🟢 轻微（37 项）

| 编号 | 本轮验证 | 说明 |
|:---:|:---:|------|
| N15 | ❌ | bonusKeys 重复定义 |
| N16/NE30 | ❌ | console.log 残留 |
| N31 | ❌ | calculateDamage comboBonus 参数死代码 |
| N32 | ❌ | _isFirstAtkThisTurn 注释误导 |
| N33 | ❌ | processDOT A10 递增公式边界 |
| N34 | ❌ | customDeckName 未声明类属性 |
| L5 | ❌ | maxHp 默认值不一致 |
| L6 | ❌ | 多处 null 安全检查缺失 |
| L14-L20 | ❌ | 卡组下拉/变量/类名/可访问性等 |
| NE13 | ❌ | 13 张卡牌 ID 排列顺序混乱 |
| NE17 | ❌ | ai.js fieldSupports s.card 空值保护缺失 |
| NE21 | ❌ | 战斗 hover 监听器屏幕切换未移除 |
| NE24 | ❌ | A26/S23/S25 冗余 condition 字段 |
| NE25 | ❌ | EFFECT_TYPE 注释"123"实际"127" |
| NE26 | ❌ | quiz.js 约 13 题高度近似 → 44 组 |
| NE27 | ❌ | 电领域约 80 题缩写 → 190 题（NE50 关联） |
| NE28 | ❌ | ui.js sleep(ms) 未被使用 |
| NE29 | ❌ | emojiMap/emojiMap2 声明未使用 |
| NE30 | ❌ | 同 N16 |
| NE31 | ❌ | transition:all 性能隐患 → 确认为 9 处（NE107） |
| NE53 | ❌ | runes.js 混沌 SVG 格式不统一 |
| NE54 | ❌ | combo 非标准键格式未注释 |
| NE55 | ❌ | 召唤 combo 区域排列无序 |
| NE56 | ❌ | #scry-confirm 按钮重复绑定 |
| NE58 | ❌ | _bellSpiedCard 未声明 + _scryHandled 死代码 |
| NE59 | ❌ | S10 共振蓄能出牌顺序敏感 |
| NE60 | ⚪ | 领域卡过期按设计不需 _releaseOnFieldClear |

---

## 统计总览

| 严重度 | 07-14 遗留 | 07-15 已修复 | 07-15 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 18 | 0 | 14 | 5 | **19** |
| 🟡 中等 | 36 | 1 (NE52) | 35 | 17 | **52** |
| 🟢 轻微 | 36 | 2 (N14, NE09) | 34 | 27 | **61** |
| **合计** | **90** | **3** | **83** | **49** | **132** |

> 注：JS/CSS 自 07-12 以来连续零变更。3 项修复（N14/NE09/NE52）发生在更早的 commit 中，本轮审查首次正确识别。新增 49 项主要来自 EFFECT_TYPE 声明完整性（12 项）、XSS 新点位（3 项）、胜利条件遗漏（1 项）、S24 状态泄漏（1 项）、A11 连锁缺陷（1 项）、UI 超时缺失（3 项）、CSS 性能/兼容性（10 项）、runes 数据不一致（4 项）、quiz 分类/重复（5 项）等。值得注意的是 07-14 报告 90 项中的 7 项已调整（NE02 误报、M13 按设计、NE60 按设计、NE52 已修复、N14 已修复、NE09 已修复）。

---

## 🎯 优先修复建议 (Top 10)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N23+N24+NE74 | A11 啸叫引爆三合一 + 旧实例泄漏（弃牌归属+空return+残留） | engine.js | 游戏崩溃 |
| **P0** | NE73 | S24 被消灭时 burnEnhanced 永久泄漏 | engine.js | 平衡破坏 |
| **P0** | NE06+NE41+NE84+NE85+NE86 | 窥牌/凸透/贝尔共 5 处 XSS | ui.js | 安全 |
| **P0** | NE50 | 电/热领域约 390 题过度缩写 | quiz.js | 题库可用性 |
| **P0** | NE44 | 完全缺少 :focus-visible + prefers-reduced-motion | game_v2.css | 无障碍 |
| **P1** | N22+N39 | C06/C07 减费从未生效 | engine.js | 效果缺失 |
| **P1** | NE03 | A11 缺少 isFieldCard:true | cards.js | 驻场识别失效 |
| **P1** | NE61+NE62 | sacrificeElectricSupport/soundSupportExtend 未声明 | cards.js | 效果读取失败 |
| **P1** | NE43+NE75 | processDOT/processBurn 无胜利检查（3 条路径中 2 条缺失） | engine.js | 回合不一致 |
| **P1** | NE87+NE88+NE89 | 3 个弹窗无超时自动关闭 | ui.js | 游戏阻塞 |

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 已修复(累计) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| 07-11 | 5 | 12 | 12 | 29 | 有 | — |
| 07-12 | 10 | 15 | 16 | 41 | 有 | 10 |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | 10 |
| 07-14 | 18 | 36 | 36 | 90 | 零变更 | 12 |
| **07-15** | **19** | **52** | **61** | **132** | **零变更** | **15** |

> 问题总数上升主要因为本轮审查引入了 EFFECT_TYPE 声明完整性审查（新增 10 个未声明键）、runes.js 与 JSON 交叉验证（4 项）、CSS 性能/兼容性深度审计（10 项）、以及 XSS/超时兜底专项扫描（8 项）。累计 15 项修复中有 3 项为本轮首次正确识别。核心风险仍集中在 A11 三合一缺陷（N23+N24+NE74）、S24 状态泄漏（NE73）和 C06/C07 减费失效（N22）三项。

---

> 📝 报告生成时间：2026-07-15 23:50 GMT+8 | 审查方式：8 个 Agent 并行审查 9 个文件 + EFFECT_TYPE 交叉验证 + runes.js/JSON 数据源一致性检查 | JS/CSS 自 07-12 以来连续零变更 | 上次 90 项中 3 项修正确认 + 本轮新增 49 项
