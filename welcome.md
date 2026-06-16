# 物理卡牌对战游戏 — 项目总览

> 这是一款以初中物理五大领域为核心的卡牌对战游戏。玩家通过力/声/光/热/电领域的卡牌进行对战，每回合需回答物理题获得精神力，融合了教育性与竞技性。

## 项目现状

**全部 109 张卡牌已完成，插画、描述、领域符文均就位。**
**Phase 1-5 全部完成。C03 拉普拉斯妖窥牌排序交互已实现。**

## 技术架构

```
物理卡牌游戏/
├── index.html              ← 游戏入口
├── all_cards.html          ← 109张卡牌展示页（静态）
├── PROJECT_STATUS.md       ← 唯一权威进度文档
├── css/game.css            ← 游戏主样式 + 模态框样式
├── js/
│   ├── cards.js            ← 109张卡牌数据（唯一权威源）
│   ├── engine.js           ← 核心引擎（战斗/状态/效果）
│   ├── combo_table.js      ← 35个 combo 查找表
│   ├── ai.js               ← AI 对手逻辑
│   ├── ui.js               ← 界面控制器 + 出牌交互
│   └── quiz.js             ← 物理题库
├── art_samples/
│   ├── card_art/           ← 109+ 张卡牌插画（1024×1536 PNG）
│   ├── complete_card_design.html ← 卡牌UI模板（含CSS+符文）
│   └── chaos_rune.svg      ← 混沌领域符文
├── tests/
│   └── combo.test.js       ← 34个测试用例
├── generate_cards.py       ← 卡牌展示页生成器
├── domain_runes.json       ← 6领域符文base64
└── approved_cards.json     ← 卡牌→插画文件名映射（唯一权威）
```

## 六大领域

| 领域 | 数量 | 颜色 | 关键词 |
|------|------|------|--------|
| 力 Force | 19 | 红 #E74C3C | 力学、运动、能量 |
| 电 Electric | 19 | 紫 #9B59B6 | 电流、电压、磁场 |
| 声 Sound | 20 | 绿 #16A085 | 声波、共振、频率 |
| 光 Light | 24 | 橙 #F39C12 | 光学、透镜、波粒 |
| 热 Heat | 20 | 暖橙 #E67E22 | 热力学、温变、相变 |
| 混沌 Chaos | 7 | 紫 #9333ea | 四神兽 + 相变卡 |

## 卡牌类型

- **攻击卡 (attack)**：造成伤害，部分有驻场/连锁效果
- **辅助卡 (support)**：增益/减益/窥牌/控场
- **召唤卡 (summon)**：科学家+神兽，有被动效果
- **相变卡 (phase)**：改变游戏规则

## 工作规则（铁律）

1. `js/cards.js` 是唯一的卡牌数据权威源
2. 引擎实现效果时，effect 属性名必须直接使用 cards.js 中的字段名
3. `approved_cards.json` 是卡牌→插画的唯一映射，未审核确认不得写入
4. 开工前 `git pull`，收工后 `git add -A && git commit && git push`
5. 插画配对唯一依据是 `approved_cards.json`，不允许根据文件名自动猜测
6. 工作资料分区：Confirmed（approved_cards.json）/ Pending（未审核）/ Deprecated（已淘汰）

## 当前待办

1. **卡组构建器** — 让玩家自由选卡组牌（30张上限，同名卡限1张）
2. **题库扩展** — 从现有少量题目扩充到 200+
3. **UI 优化** — 对战界面高亮、combo 提示动画
4. **平衡性调整** — 基于测试数据调数值

## Git

- 仓库：git@gitee.com:jopapa/physics-card-game.git
- 分支：master
- 本地路径：物理卡牌游戏/
