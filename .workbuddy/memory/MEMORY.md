# 物理卡牌对战游戏 — 项目记忆

## 仓库
- Gitee：git@gitee.com:jopapa/physics-card-game.git
- 本地路径：物理卡牌游戏/
- SSH 密钥：~/.ssh/id_ed25519_gitee

## 跨设备协作
- 电脑（本地 WorkBuddy）← git push/pull → Gitee ← git push/pull → 项目模式 WorkBuddy
- 进度文件 PROJECT_STATUS.md 是两端 AI 助手的共同语言
- **开工协议（2026-06-17 强化）**：
  1. `git pull`
  2. 读 PROJECT_STATUS.md「⏳ 当前待办」区域
  3. 如果待办为空，不自行推断任务，等待用户指示
  4. 完工后更新本文件 → commit + push
- 教训 2026-06-17：pull 后未仔细读待办区，项目模式完成了 P0/P1/P2 但被我漏看 → 新增开工协议强制检查待办区

## 项目阶段
- Phase 1-5 ✅ 完成
- P0 AI策略 ✅ 完成（ai.js v2.0）
- P1 出牌体验 ✅ 完成
- P2 物理融入 ✅ 完成
- 卡组构建器 ✅ 完成
- 题库 190题 ✅ 完成
- 测试 136个 ✅ 完成

## 自动同步规则
- **开工前自动 `git pull`，完工后自动 `git add -A && git commit -m "描述" && git push`**
- 都不需要等用户提醒，作为肌肉记忆执行
- 先更新 PROJECT_STATUS.md，再 commit + push

## 关键设计决策
- combo 系统采用查找表模式（combo_table.js），按卡牌 ID 精确匹配
- 形态跟踪（如 S08 升/降）通过 player.cardForms 实现
- 7 种 combo 效果类型推迟到 Phase 4

## 卡牌数据铁律
- **js/cards.js 是唯一的卡牌数据权威源**。任何关于卡牌效果、数值、属性的讨论或决策，必须先读该文件原文
- 涉及多张卡时，用脚本从 cards.js 提取数据，禁止凭印象/记忆/脑补描述卡牌效果
- RARITY_CLASSIFICATION.md 通过脚本从 cards.js 自动生成，不得手动编辑
- **引擎实现卡牌效果时，effect 属性名必须直接使用 cards.js 中的字段名**，禁止自行定义别名（如把 `ignoreDefense` 写成 `ignoreDef`、把 `burn` 写成 `burnLayers`）
- 改动 cards.js 后必须检查 engine.js 是否同步对应
- **改动游戏规则后必须同步更新 GAME_RULES.md**

## 游戏规则文档
- `GAME_RULES.md` 是唯一权威的游戏规则来源
- 任何规则变更必须同步更新该文件
- 玩家问规则时，以 GAME_RULES.md 为准，不是代码为准

## 持续改进规则
- 每次发现错误后，必须追问根因，新增一条规则写入本文件来限制自己，防止同类错误再次发生
- 教训记录：
  - 2026-06-12：凭印象脑补科学家卡牌效果 → 新增「卡牌数据铁律」
  - 2026-06-13：引擎和 cards.js 属性名体系不一致，各自为政 → 新增引擎必须读 cards.js 字段名
  - 2026-06-17：项目模式独立实现答题规则，用户不知情 → 新增游戏规则必须用户确认 + GAME_RULES.md
  - 2026-06-23：AI 和用户讨论同一概念（"hover放大后的卡牌"）但指向不同 DOM 元素，反复修改错误目标 → 新增「指代对齐铁律」和「DOM 全量排查铁律」

## 指代对齐铁律（2026-06-23 新增）
- 当用户描述一个视觉问题（如"某张卡比例不对""看起来有重影"），**必须先确认用户指的是哪个 DOM 元素**，不能自行假设
- 确认方式：让用户截图圈出，或在对话中明确"是红色框还是蓝色框""是 mini 卡还是 tooltip"
- **在确认之前，不动代码**

## DOM 全量排查铁律（2026-06-23 新增）
- 涉及视觉效果的问题，先排查**所有可能参与渲染的 CSS 源**：
  1. 外部 CSS 文件（`game.css` / `game_v2.css`）
  2. HTML 内嵌 `<style>`
  3. JS 注入样式（`_injectBattleStyles` 的 `battle-screen-styles`）
  4. 元素 inline style
  5. 旧版 CSS 规则（可能仍生效但被遗忘）
- 用 `grep -rn "关键词" css/ js/` 全量搜索，不遗漏任何源

## 去黑话沟通铁律（2026-06-23 新增）
- 对用户描述问题时，**禁用或解释所有技术黑话**。以下是常见替换：

| 黑话 | 应该说的 |
|------|---------|
| tooltip | "鼠标悬停时弹出的详情卡" |
| hover | "鼠标放上去的时候" |
| wrapper | "外层容器" |
| ::before / 伪元素 | "CSS 生成的装饰层"（必须解释） |
| box-shadow | "发光阴影效果" |
| DOM 元素 | "页面上的那个卡片/区域" |

- **如果用户用了一个你不太确定的描述**（如"看起来像两张牌叠加"），追问具体位置——"是上半部分还是下半部分？是左边还是右边？"——而不是猜
- 这条是 2026-06-23 花了一个下午才发现的根本沟通问题

## 卡牌生成流程（生成任何展示页/HTML卡牌时必须遵循）

### 1. 数据源
- 从 `js/cards.js` 取卡牌数据（ID、名称、类型、领域、费用、效果描述、公式、稀有度）
- 效果描述用 `cards.js` 原文，禁止人肉缩写

### 2. 模板 CSS
- 从 `art_samples/complete_card_design.html` 提取完整 `<style>` 块
- 追加 `.card-desc-box{height:90px;overflow:hidden}` 固定描述区高度
- 不要自己手写简化版 CSS

### 3. 卡牌尺寸规范
- 宽度：`380px`（`min-width:380px;max-width:380px`）
- art-frame 高度：`340px`（固定）
- card-desc-box 高度：`90px`（固定 + overflow:hidden）
- 高宽比约 1:1.43，对齐万智牌/炉石标准
- **不要在 `.card` 上设 `overflow:hidden`**——会裁掉 `::before` 稀有度边框

### 4. AI 插画生成铁律
- 提示词只描述角色/场景本身，**不加**以下任何词：`card`、`card game`、`illustration`、`frame`、`border`、`trading card`、`portrait orientation`
- 提示词格式：`[角色/场景描述], [风格], dark background.`
- 生成后处理：crop 底部 4%，resize 宽度 364px，JPEG quality 82

### 5. HTML 结构
- 每张卡的 DOM 必须与模板一致：`card-set > card > header(cost-gem + title-bar + domain-rune) + type-ribbon + art-frame(4 corners) + ornate-divider + card-stats + card-desc-box(card-desc + card-principle)`
- 领域符文从模板中提取已有 base64，不重新生成
- 稀有度边框由 CSS 的 `.card.mythic/legendary/epic/rare/common::before` 自动生效

### 6. 验证
- 检查文件大小：嵌入 12 张插画后约 700~900KB 为正常
- 所有卡宽高一致、插画无边框、描述无截断

## 工作资料分区铁律（2026-06-16 新增）

**根因：** 之前由于未区分「已确认」和「待确认」的插画资料，导致在配对 prev 卡牌时大量使用了错误版本的插画，需要重做。项目越大，资料混乱的代价越高。

### 三级分区制度
1. **Confirmed（已确认）**：通过审核的最终版本
   - 位置：`approved_cards.json` 中的文件映射为唯一权威记录
   - 不得修改、不得替换、不得覆盖
   - 生成任何展示页时只取此来源

2. **Pending（待确认）**：生成完毕但未经审核的版本
   - 位置：`art_samples/card_art/` 中的未映射文件
   - 审核通过后移入 Confirmed，审核不通过则移入 Deprecated

3. **Deprecated（已淘汰）**：审核未通过或已被替代的版本
   - 位置：`art_samples/card_art/` 中不再需要的文件
   - 相关子项目全部跑通确认后，可整批清理
   - 清理前需用户明确确认

### 执行规则
- **写入 approved_cards.json 前必须经用户审核确认**，不允许自动写入
- **提取插画配对的唯一依据是 approved_cards.json**，不允许根据文件名或关键词自行猜测
- **当需要从历史中找回已确认的配对时**，优先查找早期 batch 审核 HTML 文件（如 batch3.html ~ batch8.html）
- **被用户 reject 的插画**必须移到 Deprecated 或直接删除，避免污染后续配对
- **每次生成新的展示页后**，验证插画数量与 approved_cards.json 中的确认数量一致
