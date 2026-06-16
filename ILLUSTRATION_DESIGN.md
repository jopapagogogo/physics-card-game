# 卡牌插画设计文档

> 目的：逐卡明确插画方向 + AI 提示词，用户审核后再批量生成。

---

## C05 · 牛顿 (Isaac Newton)

| 字段 | 值 |
|------|-----|
| 类型 | 召唤 |
| 领域 | 力 |
| 稀有度 | epic |
| 费用 | 22 |
| 效果 | 力系攻击卡额外 +20 伤害 |
| 原理 | F=ma——力越大效果越猛，经典力学的奠基人 |

### 插画理解

牛顿是召唤卡——角色立绘型。画面主角是牛顿本人（17世纪科学家外貌），融合轻微赛博朋克/科幻改造元素（如半透明的公式投影、能量纹路），但不能喧宾夺主掩盖人物本身。核心视觉锚点：漂浮的发光苹果 + 环绕的重力公式。

参考模板 `c05_niudun_cyber.png` 的风格——人物占画面主体，背景暗色氛围，霓虹蓝点缀而非铺满。

### AI 提示词

```
Full body character portrait of Isaac Newton, 17th century scientist, subtle cybernetic augmentations with faint neon blue circuit lines on his coat, a single glowing cyan apple floating above his open palm, holographic gravity equation F=ma orbiting as translucent rings, dark atmospheric background with soft volumetric light, digital art, cinematic rim lighting, high detail, Full-frame artwork, no borders or text.
```

---

## C07 · 欧姆 (Georg Ohm)

| 字段 | 值 |
|------|-----|
| 类型 | 召唤 |
| 领域 | 电 |
| 稀有度 | epic |
| 费用 | 22 |
| 效果 | 电系攻击卡额外 +20 伤害 |
| 原理 | I=U/R——电流越大效果越强 |

### 插画理解

同为召唤卡，角色立绘型。欧姆是19世纪物理学家面貌，辅以电气主题的赛博化细节——指尖的微弱电弧、领口的电路纹理。避免"斯坦李式超级英雄"感，保持科学家气质。核心视觉锚点：手掌间跃动的电火花 + 悬浮的 V=IR 投影。

参考模板 `c07_oumu_cyber.png` 的风格。

### AI 提示词

```
Full body character portrait of Georg Ohm, 19th century physicist, subtle cybernetic details with faint neon purple circuit patterns on his collar, gentle electric sparks dancing between his fingertips, holographic equation V=IR floating beside him as translucent text, dark atmospheric laboratory background, digital art, cinematic rim lighting, high detail, Full-frame artwork, no borders or text.
```

---

## A27 · 闪电劈击

| 字段 | 值 |
|------|-----|
| 类型 | 攻击 |
| 领域 | 电 |
| 稀有度 | rare |
| 费用 | 10 |
| 效果 | 30点伤害；场上电系辅助≥2时：无视20防御 + 额外20伤害 |
| 原理 | 高压击穿——电压足够高时可击穿绝缘层 |

### 插画理解

攻击卡，需要表现的是**闪电本身**——不是带城市背景的风景画。核心是：一道粗壮的紫色/白色闪电从画面顶部劈下，分支电弧四散，强烈的明暗对比。画面应该"有力量感"——闪电不是柔和的，是暴烈的、刺眼的。

跟人物的处理不同：攻击卡画的是**现象**，不是人物。不要加城市天际线、人物剪影等多余元素。纯粹的闪电 + 暴风云 + 强光。

参考模板 `a27_gaoyadianji_cyber.png` 的感受——应该也是纯粹的现象画面。

### AI 提示词

```
A single massive lightning bolt tearing vertically through a pitch-black storm sky, intense white-violet core with neon purple branching tendrils, electric glow illuminating the surrounding storm clouds from within, dramatic high-contrast lighting, digital art, high detail, Full-frame artwork, no borders or text.
```

---

## 关键设计原则总结

| 卡牌类型 | 插画公式 |
|---------|---------|
| **召唤卡**（人物） | "Full body character portrait of [人], subtle cybernetic [领域元素], [标志性物体], dark background, digital art, rim lighting" |
| **攻击卡**（现象） | "[纯粹物理现象], dark background, high contrast, digital art" —— 不加人物、不加城市、不加叙事 |
| **辅助卡** | 待定 |
| **领域卡** | 待定 |

### 通用禁忌

- ❌ 不要在 prompt 里写 "cyberpunk style" 或 "trading card" 或 "illustration"
- ❌ 人物卡不要写场景叙事（"seated beneath a tree" / "standing before a grid"）
- ❌ 现象卡不要加多余背景元素（城市、人物、建筑）
- ✅ 用 "digital art" 替代 "cyberpunk style"
- ✅ 用视觉细节暗示风格而非贴标签
- ✅ 末尾统一加 "Full-frame artwork, no borders or text."
