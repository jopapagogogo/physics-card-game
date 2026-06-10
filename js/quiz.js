// ============================================================
// 物理卡牌对战 —— 答题题库系统
// 面向初中生，共100道题目，按领域×难度分布
// ============================================================

class QuizSystem {
  constructor() {
    this.currentRoundData = [];
    this.usedQuestionIds = new Set();
    this.questions = this._initQuestions();
  }

  // ----------------------------------------------------------
  // 初始化全部100道题目
  // ----------------------------------------------------------
  _initQuestions() {
    return [
      // ======================================================
      // 力 领域 — basic (10) Q_F_01 ~ Q_F_10
      // ======================================================
      {
        id: "Q_F_01", domain: "力", difficulty: "basic",
        question: "一个质量为5kg的物体，受到的重力是多少？（g=10N/kg）",
        options: ["A. 5N", "B. 50N", "C. 500N", "D. 0.5N"],
        answer: 1, knowledge: "重力、G=mg", relatedCard: "A01"
      },
      {
        id: "Q_F_02", domain: "力", difficulty: "basic",
        question: "关于惯性，下列说法正确的是？",
        options: ["A. 速度越大的物体惯性越大", "B. 质量越大的物体惯性越大", "C. 静止的物体没有惯性", "D. 运动物体才有惯性"],
        answer: 1, knowledge: "惯性只与质量有关", relatedCard: "A02"
      },
      {
        id: "Q_F_03", domain: "力", difficulty: "basic",
        question: "一个重200N的人站在地面上，双脚与地面接触面积共0.04m²，他对地面的压强是多少？",
        options: ["A. 500Pa", "B. 5000Pa", "C. 50Pa", "D. 8Pa"],
        answer: 1, knowledge: "压强 P=F/S", relatedCard: "A03"
      },
      {
        id: "Q_F_04", domain: "力", difficulty: "basic",
        question: "一根杠杆动力臂长2m，阻力臂长0.5m，要使杠杆平衡，动力与阻力的关系是？",
        options: ["A. 动力是阻力的4倍", "B. 动力是阻力的1/4", "C. 动力等于阻力", "D. 动力是阻力的2倍"],
        answer: 1, knowledge: "杠杆原理 F₁L₁=F₂L₂", relatedCard: "A04"
      },
      {
        id: "Q_F_05", domain: "力", difficulty: "basic",
        question: "用50N的力水平推动一个物体移动了10m，这个力做了多少功？",
        options: ["A. 5J", "B. 50J", "C. 500J", "D. 5000J"],
        answer: 2, knowledge: "做功 W=Fs", relatedCard: "A08"
      },
      {
        id: "Q_F_06", domain: "力", difficulty: "basic",
        question: "下列哪个因素能使物体的动能增大？",
        options: ["A. 质量不变，速度减小", "B. 速度不变，质量减小", "C. 质量和速度都增大", "D. 减小高度"],
        answer: 2, knowledge: "动能 Ek=½mv²", relatedCard: "A06"
      },
      {
        id: "Q_F_07", domain: "力", difficulty: "basic",
        question: "一个苹果从3m高的树上掉下来，其重力势能的变化是？",
        options: ["A. 增大", "B. 减小", "C. 不变", "D. 先增后减"],
        answer: 1, knowledge: "重力势能 Ep=mgh", relatedCard: "A05"
      },
      {
        id: "Q_F_08", domain: "力", difficulty: "basic",
        question: "影响滑动摩擦力大小的因素是什么？",
        options: ["A. 接触面积和速度", "B. 压力和接触面粗糙程度", "C. 物体质量和速度", "D. 接触面积和压力"],
        answer: 1, knowledge: "摩擦力", relatedCard: "S04"
      },
      {
        id: "Q_F_09", domain: "力", difficulty: "basic",
        question: "两个同方向的力F₁=3N和F₂=4N同时作用在物体上，合力大小是多少？",
        options: ["A. 1N", "B. 7N", "C. 5N", "D. 12N"],
        answer: 1, knowledge: "力的合成（同向相加）", relatedCard: "S05"
      },
      {
        id: "Q_F_10", domain: "力", difficulty: "basic",
        question: "弹簧被拉伸后具有的能量叫做？",
        options: ["A. 动能", "B. 重力势能", "C. 弹性势能", "D. 内能"],
        answer: 2, knowledge: "弹性势能 Ep=½kx²", relatedCard: "S32"
      },

      // ======================================================
      // 力 领域 — advanced (7) Q_F_11 ~ Q_F_17
      // ======================================================
      {
        id: "Q_F_11", domain: "力", difficulty: "advanced",
        question: "一个潜水器从水面下潜到100m深处，它受到的海水压强增大了约多少？（ρ海水≈1×10³kg/m³, g=10N/kg）",
        options: ["A. 10⁶Pa", "B. 10⁵Pa", "C. 10⁴Pa", "D. 10³Pa"],
        answer: 0, knowledge: "液体压强 P=ρgh", relatedCard: "A03"
      },
      {
        id: "Q_F_12", domain: "力", difficulty: "advanced",
        question: "一个体积为0.002m³的金属块完全浸没在水中，受到的浮力是多少？（ρ水=1×10³kg/m³, g=10N/kg）",
        options: ["A. 2N", "B. 20N", "C. 200N", "D. 0.2N"],
        answer: 1, knowledge: "浮力 F浮=ρ液gV排", relatedCard: "C06"
      },
      {
        id: "Q_F_13", domain: "力", difficulty: "advanced",
        question: "使用滑轮组将重1000N的物体提升2m，实际拉力做功2500J，该滑轮组的机械效率是多少？",
        options: ["A. 40%", "B. 60%", "C. 80%", "D. 90%"],
        answer: 2, knowledge: "机械效率 η=W有用/W总", relatedCard: "A08"
      },
      {
        id: "Q_F_14", domain: "力", difficulty: "advanced",
        question: "一台机器在10s内做功2000J，它的功率是多少？",
        options: ["A. 20W", "B. 200W", "C. 2000W", "D. 20000W"],
        answer: 1, knowledge: "功率 P=W/t", relatedCard: "A08"
      },
      {
        id: "Q_F_15", domain: "力", difficulty: "advanced",
        question: "正在行驶的汽车突然刹车，车内的乘客会向前倾，这说明了什么？",
        options: ["A. 力可以改变物体的形状", "B. 物体具有惯性", "C. 物体受到摩擦力作用", "D. 力是维持运动的原因"],
        answer: 1, knowledge: "牛顿第一定律、惯性", relatedCard: "A02"
      },
      {
        id: "Q_F_16", domain: "力", difficulty: "advanced",
        question: "两个相互垂直的力分别为3N和4N，它们的合力大小是多少？",
        options: ["A. 1N", "B. 7N", "C. 5N", "D. 25N"],
        answer: 2, knowledge: "力的合成（勾股定理）", relatedCard: "S05"
      },
      {
        id: "Q_F_17", domain: "力", difficulty: "advanced",
        question: "使用动滑轮提升重物时，下列说法正确的是？",
        options: ["A. 省力但费距离", "B. 费力但省距离", "C. 既不省力也不费距离", "D. 既省力又省距离"],
        answer: 0, knowledge: "滑轮、省力费距离", relatedCard: "A04"
      },

      // ======================================================
      // 力 领域 — challenge (3) Q_F_18 ~ Q_F_20
      // ======================================================
      {
        id: "Q_F_18", domain: "力", difficulty: "challenge",
        question: "一辆大货车和一辆小轿车以相同速度并排行驶，关于惯性下列说法正确的是？",
        options: ["A. 速度相同，惯性也相同", "B. 大货车质量大，惯性大", "C. 小轿车速度快所以惯性小", "D. 并排行驶说明惯性相同"],
        answer: 1, knowledge: "惯性只与质量有关，与速度无关", relatedCard: "A02"
      },
      {
        id: "Q_F_19", domain: "力", difficulty: "challenge",
        question: "一个物体在粗糙水平面上受到5N拉力做匀速直线运动，撤去拉力后物体继续滑行。下列说法正确的是？",
        options: ["A. 匀速时不受摩擦力", "B. 撤去拉力后摩擦力消失", "C. 匀速时拉力等于摩擦力", "D. 撤力后物体立即停止"],
        answer: 2, knowledge: "二力平衡、摩擦力、惯性综合分析", relatedCard: "S04"
      },
      {
        id: "Q_F_20", domain: "力", difficulty: "challenge",
        question: "工人用滑轮组将重800N的货物匀速提升4m，拉力做功4000J，已知滑轮组的机械效率为80%，该滑轮组的动滑轮重约多少？（不计摩擦）",
        options: ["A. 50N", "B. 100N", "C. 200N", "D. 400N"],
        answer: 2, knowledge: "滑轮组机械效率与额外功", relatedCard: "A04"
      },

      // ======================================================
      // 声 领域 — basic (10) Q_S_01 ~ Q_S_10
      // ======================================================
      {
        id: "Q_S_01", domain: "声", difficulty: "basic",
        question: "声音在下列哪种介质中不能传播？",
        options: ["A. 空气", "B. 水", "C. 钢铁", "D. 真空"],
        answer: 3, knowledge: "声音传播需要介质", relatedCard: "A14"
      },
      {
        id: "Q_S_02", domain: "声", difficulty: "basic",
        question: "通常情况下，声音在下列介质中传播速度最快的是？",
        options: ["A. 空气", "B. 水", "C. 钢铁", "D. 真空中"],
        answer: 2, knowledge: "声速：固体>液体>气体", relatedCard: "A14"
      },
      {
        id: "Q_S_03", domain: "声", difficulty: "basic",
        question: "决定声音音调高低的因素是？",
        options: ["A. 振幅", "B. 频率", "C. 传播速度", "D. 传播介质"],
        answer: 1, knowledge: "音调由频率决定", relatedCard: "S08"
      },
      {
        id: "Q_S_04", domain: "声", difficulty: "basic",
        question: "决定声音响度大小的主要因素是？",
        options: ["A. 频率", "B. 振幅", "C. 音色", "D. 声速"],
        answer: 1, knowledge: "响度由振幅决定", relatedCard: "S08"
      },
      {
        id: "Q_S_05", domain: "声", difficulty: "basic",
        question: "我们能分辨不同乐器演奏同一首曲子，主要是因为声音的什么不同？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "音色由发声体材料和结构决定", relatedCard: "S08"
      },
      {
        id: "Q_S_06", domain: "声", difficulty: "basic",
        question: "人对着山崖喊话，1.5s后听到回声，人距山崖约多远？（声速340m/s）",
        options: ["A. 170m", "B. 255m", "C. 340m", "D. 510m"],
        answer: 1, knowledge: "回声 s=vt/2", relatedCard: "A14"
      },
      {
        id: "Q_S_07", domain: "声", difficulty: "basic",
        question: "从环保角度看，以下哪个属于噪声？",
        options: ["A. 课堂上老师讲课", "B. 音乐厅的交响乐", "C. 深夜装修的电钻声", "D. 轻柔的背景音乐"],
        answer: 2, knowledge: "噪声：影响工作学习休息的声音", relatedCard: "S07"
      },
      {
        id: "Q_S_08", domain: "声", difficulty: "basic",
        question: "人耳能听到的声音频率范围大约是？",
        options: ["A. 2Hz~200Hz", "B. 20Hz~20000Hz", "C. 200Hz~2000Hz", "D. 2Hz~200000Hz"],
        answer: 1, knowledge: "人耳听觉范围 20Hz~20000Hz", relatedCard: "S08"
      },
      {
        id: "Q_S_09", domain: "声", difficulty: "basic",
        question: "声音是由物体的什么产生的？",
        options: ["A. 运动", "B. 振动", "C. 碰撞", "D. 摩擦"],
        answer: 1, knowledge: "声音由物体振动产生", relatedCard: "S08"
      },
      {
        id: "Q_S_10", domain: "声", difficulty: "basic",
        question: "宇航员在月球上面对面站着，不借助设备无法直接对话，这是因为？",
        options: ["A. 月球引力太小", "B. 月球温度太低", "C. 月球没有空气", "D. 宇航服太厚"],
        answer: 2, knowledge: "真空不能传声", relatedCard: "A14"
      },

      // ======================================================
      // 声 领域 — advanced (7) Q_S_11 ~ Q_S_17
      // ======================================================
      {
        id: "Q_S_11", domain: "声", difficulty: "advanced",
        question: "一辆救护车鸣笛向你驶来时，你听到的笛声音调变高，这是因为？",
        options: ["A. 声速增大", "B. 多普勒效应", "C. 救护车加快了振动频率", "D. 回声叠加"],
        answer: 1, knowledge: "多普勒效应", relatedCard: "S33"
      },
      {
        id: "Q_S_12", domain: "声", difficulty: "advanced",
        question: "以下哪个不是超声波的应用？",
        options: ["A. 清洗眼镜", "B. B超检查", "C. 声呐测距", "D. 收音机接收信号"],
        answer: 3, knowledge: "超声波应用", relatedCard: "A09"
      },
      {
        id: "Q_S_13", domain: "声", difficulty: "advanced",
        question: "关于次声波的说法，正确的是？",
        options: ["A. 人耳能听到次声波", "B. 次声波频率高于20000Hz", "C. 地震、火山喷发会产生次声波", "D. 次声波不能在水中传播"],
        answer: 2, knowledge: "次声波（频率<20Hz）", relatedCard: "A10"
      },
      {
        id: "Q_S_14", domain: "声", difficulty: "advanced",
        question: "士兵过桥时不能齐步走，是因为齐步走的频率可能与桥的什么接近，引发危险？",
        options: ["A. 固有频率（共振）", "B. 超声波频率", "C. 声速", "D. 回声频率"],
        answer: 0, knowledge: "共振", relatedCard: "S09"
      },
      {
        id: "Q_S_15", domain: "声", difficulty: "advanced",
        question: "声波在管乐器中形成的是什么？",
        options: ["A. 电磁波", "B. 驻波", "C. 横波", "D. 光波"],
        answer: 1, knowledge: "驻波", relatedCard: "A13"
      },
      {
        id: "Q_S_16", domain: "声", difficulty: "advanced",
        question: "以下哪种材料隔音效果最好？",
        options: ["A. 玻璃窗", "B. 木板", "C. 多孔泡沫板", "D. 钢板"],
        answer: 2, knowledge: "隔音、吸音材料", relatedCard: "S10"
      },
      {
        id: "Q_S_17", domain: "声", difficulty: "advanced",
        question: "声呐系统利用什么原理测量海底深度？",
        options: ["A. 光的反射", "B. 声波的反射（回声）", "C. 电磁波传播", "D. 超声波穿透"],
        answer: 1, knowledge: "声呐、回声定位", relatedCard: "A14"
      },

      // ======================================================
      // 声 领域 — challenge (3) Q_S_18 ~ Q_S_20
      // ======================================================
      {
        id: "Q_S_18", domain: "声", difficulty: "challenge",
        question: "一辆汽车以20m/s的速度远离一面山崖行驶，鸣笛后5s听到回声，鸣笛瞬间汽车距山崖多远？（声速340m/s）",
        options: ["A. 850m", "B. 900m", "C. 800m", "D. 750m"],
        answer: 2, knowledge: "回声+相对运动综合分析 (s声+s车=2d)", relatedCard: "A14"
      },
      {
        id: "Q_S_19", domain: "声", difficulty: "challenge",
        question: "当一辆火车鸣笛从你身边驶过时，你听到的笛声变化是？",
        options: ["A. 响度不变，音调不变", "B. 先变高后变低", "C. 先变低后变高", "D. 只变响度不变音调"],
        answer: 1, knowledge: "多普勒效应：靠近时频率升高", relatedCard: "S33"
      },
      {
        id: "Q_S_20", domain: "声", difficulty: "challenge",
        question: "在音乐厅听交响乐，站在不同位置听到的声音大小不同，最能解释这一现象的是？",
        options: ["A. 响度随距离衰减", "B. 不同位置声波干涉不同", "C. 音色在不同位置不同", "D. 以上都是"],
        answer: 3, knowledge: "声波传播、干涉、衰减综合分析", relatedCard: "D02"
      },

      // ======================================================
      // 光 领域 — basic (10) Q_L_01 ~ Q_L_10
      // ======================================================
      {
        id: "Q_L_01", domain: "光", difficulty: "basic",
        question: "影子的形成说明了光具有什么性质？",
        options: ["A. 光的反射", "B. 光的折射", "C. 光沿直线传播", "D. 光的色散"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S35"
      },
      {
        id: "Q_L_02", domain: "光", difficulty: "basic",
        question: "光射到平面镜上，入射角为30°，反射角是多少？",
        options: ["A. 15°", "B. 30°", "C. 60°", "D. 90°"],
        answer: 1, knowledge: "光的反射定律（反射角=入射角）", relatedCard: "S34"
      },
      {
        id: "Q_L_03", domain: "光", difficulty: "basic",
        question: "关于平面镜成像，下列说法正确的是？",
        options: ["A. 成倒立实像", "B. 像与物大小相等", "C. 像比物大", "D. 像距不等于物距"],
        answer: 1, knowledge: "平面镜成像：等大、等距、正立虚像", relatedCard: "S34"
      },
      {
        id: "Q_L_04", domain: "光", difficulty: "basic",
        question: "插入水中的筷子看起来向上弯折，这是因为？",
        options: ["A. 光的反射", "B. 光的直线传播", "C. 光的折射", "D. 光的色散"],
        answer: 2, knowledge: "光的折射", relatedCard: "A46"
      },
      {
        id: "Q_L_05", domain: "光", difficulty: "basic",
        question: "凸透镜对光线有什么作用？",
        options: ["A. 发散作用", "B. 会聚作用", "C. 无作用", "D. 既不汇聚也不发散"],
        answer: 1, knowledge: "凸透镜汇聚光线", relatedCard: "A55"
      },
      {
        id: "Q_L_06", domain: "光", difficulty: "basic",
        question: "凹透镜对光线有什么作用？",
        options: ["A. 发散作用", "B. 会聚作用", "C. 平行射出", "D. 吸收光线"],
        answer: 0, knowledge: "凹透镜发散光线", relatedCard: "S37"
      },
      {
        id: "Q_L_07", domain: "光", difficulty: "basic",
        question: "雨后的彩虹是由于光的什么现象形成的？",
        options: ["A. 反射", "B. 折射和色散", "C. 直线传播", "D. 衍射"],
        answer: 1, knowledge: "光的色散（白光分解为七色光）", relatedCard: "A16"
      },
      {
        id: "Q_L_08", domain: "光", difficulty: "basic",
        question: "光在真空中的传播速度约为？",
        options: ["A. 340m/s", "B. 3×10⁴km/s", "C. 3×10⁵km/s", "D. 3×10⁶km/s"],
        answer: 2, knowledge: "光速 c≈3×10⁸m/s=3×10⁵km/s", relatedCard: "S14"
      },
      {
        id: "Q_L_09", domain: "光", difficulty: "basic",
        question: "日食现象可以用什么原理来解释？",
        options: ["A. 光的折射", "B. 光的反射", "C. 光沿直线传播", "D. 光的色散"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S35"
      },
      {
        id: "Q_L_10", domain: "光", difficulty: "basic",
        question: "以下哪个透镜对光有发散作用？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凸面镜"],
        answer: 1, knowledge: "凹透镜发散", relatedCard: "S37"
      },

      // ======================================================
      // 光 领域 — advanced (7) Q_L_11 ~ Q_L_17
      // ======================================================
      {
        id: "Q_L_11", domain: "光", difficulty: "advanced",
        question: "物体放在凸透镜的2倍焦距处，在光屏上会得到什么样的像？",
        options: ["A. 倒立放大的实像", "B. 倒立缩小的实像", "C. 倒立等大的实像", "D. 正立放大的虚像"],
        answer: 2, knowledge: "凸透镜成像：u=2f时成倒立等大实像", relatedCard: "S37"
      },
      {
        id: "Q_L_12", domain: "光", difficulty: "advanced",
        question: "光纤通信利用了什么原理让光信号在光纤中不断向前传播？",
        options: ["A. 光的折射", "B. 全反射", "C. 光的衍射", "D. 光的色散"],
        answer: 1, knowledge: "全反射", relatedCard: "A19"
      },
      {
        id: "Q_L_13", domain: "光", difficulty: "advanced",
        question: "近视眼应该佩戴什么类型的透镜来矫正？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凸面镜"],
        answer: 1, knowledge: "近视眼用凹透镜矫正", relatedCard: "S37"
      },
      {
        id: "Q_L_14", domain: "光", difficulty: "advanced",
        question: "红外线最显著的性质是什么？",
        options: ["A. 杀菌作用", "B. 热效应", "C. 荧光效应", "D. 电离作用"],
        answer: 1, knowledge: "红外线：热效应强", relatedCard: "A17"
      },
      {
        id: "Q_L_15", domain: "光", difficulty: "advanced",
        question: "紫外线最常用于什么目的？",
        options: ["A. 加热食物", "B. 杀菌消毒", "C. 照明", "D. 测距"],
        answer: 1, knowledge: "紫外线：杀菌消毒", relatedCard: "A18"
      },
      {
        id: "Q_L_16", domain: "光", difficulty: "advanced",
        question: "太阳光通过三棱镜后分解成七色光，这说明？",
        options: ["A. 白光是最纯的光", "B. 白光由多种色光复合而成", "C. 三棱镜改变了光的颜色", "D. 只有七种颜色组成世界"],
        answer: 1, knowledge: "色散、白光是复色光", relatedCard: "A16"
      },
      {
        id: "Q_L_17", domain: "光", difficulty: "advanced",
        question: "一个红色物体在绿光照射下看起来呈什么颜色？",
        options: ["A. 红色", "B. 绿色", "C. 黄色", "D. 黑色"],
        answer: 3, knowledge: "不透明体颜色：只反射同色光", relatedCard: "A16"
      },

      // ======================================================
      // 光 领域 — challenge (3) Q_L_18 ~ Q_L_20
      // ======================================================
      {
        id: "Q_L_18", domain: "光", difficulty: "challenge",
        question: "物体放在凸透镜前15cm处，在光屏上得到放大的实像，已知焦距f=10cm。若将物体移到距透镜25cm处，此时成像情况是？",
        options: ["A. 倒立放大的虚像", "B. 倒立缩小的实像", "C. 正立放大的虚像", "D. 倒立等大的实像"],
        answer: 1, knowledge: "凸透镜成像规律：u>2f时成缩小实像", relatedCard: "S37"
      },
      {
        id: "Q_L_19", domain: "光", difficulty: "challenge",
        question: "江面上看到山的倒影和江底看起来比实际浅，这两种现象分别对应什么光学原理？",
        options: ["A. 都是折射", "B. 都是反射", "C. 倒影是反射、江底变浅是折射", "D. 倒影是折射、江底变浅是反射"],
        answer: 2, knowledge: "反射与折射的区别应用", relatedCard: "A46"
      },
      {
        id: "Q_L_20", domain: "光", difficulty: "challenge",
        question: "显微镜的目镜和物镜分别相当于什么透镜？最终人眼看到的是什么像？",
        options: ["A. 都是凸透镜，最终看到正立虚像", "B. 都是凹透镜，最终看到倒立实像", "C. 目镜凹透镜、物镜凸透镜，看到正立虚像", "D. 都是凸透镜，最终看到倒立虚像"],
        answer: 3, knowledge: "显微镜：物镜成放大实像，目镜成放大虚像", relatedCard: "S37"
      },

      // ======================================================
      // 热 领域 — basic (10) Q_H_01 ~ Q_H_10
      // ======================================================
      {
        id: "Q_H_01", domain: "热", difficulty: "basic",
        question: "物体的冷热程度用什么物理量表示？",
        options: ["A. 热量", "B. 温度", "C. 内能", "D. 比热容"],
        answer: 1, knowledge: "温度表示物体冷热程度", relatedCard: "S19"
      },
      {
        id: "Q_H_02", domain: "热", difficulty: "basic",
        question: "关于温度和热量，下列说法正确的是？",
        options: ["A. 温度高的物体热量多", "B. 温度高的物体一定传递热量给低温物体", "C. 热量是热传递过程中传递的能量", "D. 物体温度升高一定吸收了热量"],
        answer: 2, knowledge: "热量是传递的能量，不是物体含有的", relatedCard: "S19"
      },
      {
        id: "Q_H_03", domain: "热", difficulty: "basic",
        question: "水的比热容较大，这意味着什么？",
        options: ["A. 水容易升温", "B. 水升温或降温较慢", "C. 水总是凉的", "D. 水不能传递热量"],
        answer: 1, knowledge: "比热容大→吸放热时温度变化小", relatedCard: "S17"
      },
      {
        id: "Q_H_04", domain: "热", difficulty: "basic",
        question: "用手摸金属勺子放在热汤中，手会感觉烫，这属于哪种热传递方式？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 三种都有"],
        answer: 0, knowledge: "热传导：热量沿物体传递", relatedCard: "A21"
      },
      {
        id: "Q_H_05", domain: "热", difficulty: "basic",
        question: "烧开水时，锅底的水受热上升，上面的冷水下降，这属于哪种热传递？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 热膨胀"],
        answer: 1, knowledge: "热对流：流体中热传递", relatedCard: "A22"
      },
      {
        id: "Q_H_06", domain: "热", difficulty: "basic",
        question: "太阳的热量传到地球，属于哪种热传递方式？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 热传导和热对流"],
        answer: 2, knowledge: "热辐射不需要介质", relatedCard: "A23"
      },
      {
        id: "Q_H_07", domain: "热", difficulty: "basic",
        question: "冰变成水的过程属于什么变化？需要吸热还是放热？",
        options: ["A. 凝固、放热", "B. 熔化、吸热", "C. 汽化、吸热", "D. 液化、放热"],
        answer: 1, knowledge: "熔化（固态→液态），吸热", relatedCard: "A26"
      },
      {
        id: "Q_H_08", domain: "热", difficulty: "basic",
        question: "晾在室外的湿衣服会干，是因为水发生了什么变化？",
        options: ["A. 熔化", "B. 凝固", "C. 蒸发（汽化）", "D. 液化"],
        answer: 2, knowledge: "蒸发是一种汽化现象", relatedCard: "A25"
      },
      {
        id: "Q_H_09", domain: "热", difficulty: "basic",
        question: "冬天窗户玻璃上出现冰花，属于什么现象？",
        options: ["A. 熔化", "B. 液化", "C. 升华", "D. 凝华"],
        answer: 3, knowledge: "凝华（气态→固态），放热", relatedCard: "A47"
      },
      {
        id: "Q_H_10", domain: "热", difficulty: "basic",
        question: "铁路钢轨之间留有缝隙，这是为了防止？",
        options: ["A. 钢轨生锈", "B. 钢轨热胀冷缩造成损坏", "C. 火车出轨", "D. 雨水积存"],
        answer: 1, knowledge: "热胀冷缩", relatedCard: "A24"
      },

      // ======================================================
      // 热 领域 — advanced (7) Q_H_11 ~ Q_H_17
      // ======================================================
      {
        id: "Q_H_11", domain: "热", difficulty: "advanced",
        question: "2kg的水温度从20℃升高到70℃，需要吸收多少热量？（c水=4.2×10³J/(kg·℃)）",
        options: ["A. 4.2×10⁴J", "B. 4.2×10⁵J", "C. 8.4×10⁴J", "D. 8.4×10⁵J"],
        answer: 1, knowledge: "热量 Q=cmΔt", relatedCard: "S17"
      },
      {
        id: "Q_H_12", domain: "热", difficulty: "advanced",
        question: "0℃的冰熔化成0℃的水，以下说法正确的是？",
        options: ["A. 吸收热量，温度不变", "B. 吸收热量，温度升高", "C. 放出热量，温度不变", "D. 不吸不放，温度不变"],
        answer: 0, knowledge: "熔化吸热，晶体熔化时温度不变", relatedCard: "S20"
      },
      {
        id: "Q_H_13", domain: "热", difficulty: "advanced",
        question: "内燃机的四个冲程中，哪一个是将内能转化为机械能的？",
        options: ["A. 吸气冲程", "B. 压缩冲程", "C. 做功冲程", "D. 排气冲程"],
        answer: 2, knowledge: "热机：做功冲程内能→机械能", relatedCard: "S18"
      },
      {
        id: "Q_H_14", domain: "热", difficulty: "advanced",
        question: "一台热机消耗燃料放出1×10⁶J热量，但只做了2.5×10⁵J的有用功，其效率是多少？",
        options: ["A. 15%", "B. 25%", "C. 35%", "D. 50%"],
        answer: 1, knowledge: "热机效率 η=W有用/Q总", relatedCard: "S18"
      },
      {
        id: "Q_H_15", domain: "热", difficulty: "advanced",
        question: "以下哪种物态变化过程中放热？",
        options: ["A. 熔化", "B. 汽化", "C. 液化", "D. 升华"],
        answer: 2, knowledge: "液化放热（熔化/汽化/升华吸热）", relatedCard: "A26"
      },
      {
        id: "Q_H_16", domain: "热", difficulty: "advanced",
        question: "沸腾和蒸发都是汽化现象，关于它们的区别，正确的是？",
        options: ["A. 都只在液体表面发生", "B. 沸腾在任何温度都能发生", "C. 蒸发只在沸点发生", "D. 沸腾在特定温度发生，蒸发在任何温度都能发生"],
        answer: 3, knowledge: "沸腾需达到沸点，蒸发可在任意温度", relatedCard: "A25"
      },
      {
        id: "Q_H_17", domain: "热", difficulty: "advanced",
        question: "热水瓶的内胆采用双层玻璃并抽成真空，主要目的是？",
        options: ["A. 防止对流和传导", "B. 增强热辐射", "C. 加快散热", "D. 减轻重量"],
        answer: 0, knowledge: "隔热：防止热传导和热对流", relatedCard: "S17"
      },

      // ======================================================
      // 热 领域 — challenge (3) Q_H_18 ~ Q_H_20
      // ======================================================
      {
        id: "Q_H_18", domain: "热", difficulty: "challenge",
        question: "冬天用手摸室外的铁块和木头，感觉铁块更冷，但它们的温度其实是相同的。这是因为？",
        options: ["A. 铁块温度更低", "B. 铁块传热快（导热性好）", "C. 木头的比热容更大", "D. 铁块的颜色更深"],
        answer: 1, knowledge: "热传导速度：金属>非金属", relatedCard: "A21"
      },
      {
        id: "Q_H_19", domain: "热", difficulty: "challenge",
        question: "将-5℃的冰放入0℃的水中（不考虑与外界热交换），下列说法正确的是？",
        options: ["A. 冰会立刻熔化", "B. 水会立刻结冰", "C. 冰的温度先升高到0℃，然后部分水结冰", "D. 冰的温度升高，水的温度不变，最终达到温度平衡"],
        answer: 2, knowledge: "热量传递+凝固放热综合分析", relatedCard: "A26"
      },
      {
        id: "Q_H_20", domain: "热", difficulty: "challenge",
        question: "海边白天吹海风（从海面吹向陆地），夜晚吹陆风（从陆地吹向海面），最能解释这一现象的原因是？",
        options: ["A. 海水比热容比陆地大", "B. 海水密度比空气大", "C. 陆地摩擦力更小", "D. 海平面气压总是更高"],
        answer: 0, knowledge: "比热容与海陆风成因", relatedCard: "S17"
      },

      // ======================================================
      // 电 领域 — basic (10) Q_E_01 ~ Q_E_10
      // ======================================================
      {
        id: "Q_E_01", domain: "电", difficulty: "basic",
        question: "电流的国际单位是什么？",
        options: ["A. 伏特(V)", "B. 安培(A)", "C. 欧姆(Ω)", "D. 瓦特(W)"],
        answer: 1, knowledge: "电流单位：安培", relatedCard: "C07"
      },
      {
        id: "Q_E_02", domain: "电", difficulty: "basic",
        question: "电压的国际单位是什么？",
        options: ["A. 安培(A)", "B. 伏特(V)", "C. 欧姆(Ω)", "D. 焦耳(J)"],
        answer: 1, knowledge: "电压单位：伏特", relatedCard: "S30"
      },
      {
        id: "Q_E_03", domain: "电", difficulty: "basic",
        question: "决定导体电阻大小的因素不包括？",
        options: ["A. 材料", "B. 长度", "C. 横截面积", "D. 两端电压"],
        answer: 3, knowledge: "电阻与材料、长度、横截面积有关", relatedCard: "S23"
      },
      {
        id: "Q_E_04", domain: "电", difficulty: "basic",
        question: "欧姆定律的公式是？",
        options: ["A. P=UI", "B. W=Fs", "C. I=U/R", "D. Q=I²Rt"],
        answer: 2, knowledge: "欧姆定律 I=U/R", relatedCard: "C07"
      },
      {
        id: "Q_E_05", domain: "电", difficulty: "basic",
        question: "两个电阻串联时，通过它们的电流关系是？",
        options: ["A. I₁>I₂", "B. I₁<I₂", "C. I₁=I₂", "D. 无法确定"],
        answer: 2, knowledge: "串联电路电流处处相等", relatedCard: "C07"
      },
      {
        id: "Q_E_06", domain: "电", difficulty: "basic",
        question: "两个电阻并联时，它们两端的电压关系是？",
        options: ["A. U₁>U₂", "B. U₁<U₂", "C. U₁=U₂", "D. 取决于电阻大小"],
        answer: 2, knowledge: "并联电路各支路电压相等", relatedCard: "S31"
      },
      {
        id: "Q_E_07", domain: "电", difficulty: "basic",
        question: "发生短路时，电路中会出现什么情况？",
        options: ["A. 电流为零", "B. 电流非常大", "C. 电压为零", "D. 电阻增大"],
        answer: 1, knowledge: "短路：电流过大，危险", relatedCard: "S27"
      },
      {
        id: "Q_E_08", domain: "电", difficulty: "basic",
        question: "电流表在电路中应该如何连接？",
        options: ["A. 与被测电路并联", "B. 与被测电路串联", "C. 单独接在电源两端", "D. 任意连接"],
        answer: 1, knowledge: "电流表串联使用", relatedCard: "C07"
      },
      {
        id: "Q_E_09", domain: "电", difficulty: "basic",
        question: "电压表在电路中应该如何连接？",
        options: ["A. 与被测电路串联", "B. 与被测电路并联", "C. 单独接在电路中", "D. 任意连接"],
        answer: 1, knowledge: "电压表并联使用", relatedCard: "S30"
      },
      {
        id: "Q_E_10", domain: "电", difficulty: "basic",
        question: "以下哪个属于导体？",
        options: ["A. 橡胶", "B. 塑料", "C. 铜丝", "D. 玻璃"],
        answer: 2, knowledge: "导体与绝缘体", relatedCard: "A27"
      },

      // ======================================================
      // 电 领域 — advanced (7) Q_E_11 ~ Q_E_17
      // ======================================================
      {
        id: "Q_E_11", domain: "电", difficulty: "advanced",
        question: "一个灯泡两端电压为6V，通过电流为0.5A，灯泡的电功率是多少？",
        options: ["A. 3W", "B. 12W", "C. 1.5W", "D. 0.3W"],
        answer: 0, knowledge: "电功率 P=UI", relatedCard: "A49"
      },
      {
        id: "Q_E_12", domain: "电", difficulty: "advanced",
        question: "电流通过导体产生的热量与什么成正比？（焦耳定律）",
        options: ["A. 与电流成正比", "B. 与电流的平方成正比", "C. 与电压成正比", "D. 与电压的平方成正比"],
        answer: 1, knowledge: "焦耳定律 Q=I²Rt", relatedCard: "C08"
      },
      {
        id: "Q_E_13", domain: "电", difficulty: "advanced",
        question: "法拉第发现的现象是？",
        options: ["A. 电流的热效应", "B. 电磁感应", "C. 欧姆定律", "D. 库仑定律"],
        answer: 1, knowledge: "电磁感应（磁生电）", relatedCard: "S24"
      },
      {
        id: "Q_E_14", domain: "电", difficulty: "advanced",
        question: "下列哪种方法不能增强电磁铁的磁性？",
        options: ["A. 增加线圈匝数", "B. 增大电流", "C. 插入铁芯", "D. 减小电压"],
        answer: 3, knowledge: "电磁铁磁性增强方法", relatedCard: "S24"
      },
      {
        id: "Q_E_15", domain: "电", difficulty: "advanced",
        question: "电动机的工作原理是？",
        options: ["A. 电磁感应", "B. 通电导体在磁场中受力", "C. 电流的热效应", "D. 静电感应"],
        answer: 1, knowledge: "电动机：电→机械能", relatedCard: "D05"
      },
      {
        id: "Q_E_16", domain: "电", difficulty: "advanced",
        question: "发电机的工作原理是？",
        options: ["A. 通电导体在磁场中受力", "B. 电磁感应", "C. 电流的热效应", "D. 欧姆定律"],
        answer: 1, knowledge: "发电机：机械能→电能（电磁感应）", relatedCard: "S24"
      },
      {
        id: "Q_E_17", domain: "电", difficulty: "advanced",
        question: "一个电阻R=10Ω，两端电压U=5V，通过它的电流是多少？",
        options: ["A. 2A", "B. 0.5A", "C. 50A", "D. 0.2A"],
        answer: 1, knowledge: "欧姆定律计算 I=U/R=5/10=0.5A", relatedCard: "C07"
      },

      // ======================================================
      // 电 领域 — challenge (3) Q_E_18 ~ Q_E_20
      // ======================================================
      {
        id: "Q_E_18", domain: "电", difficulty: "challenge",
        question: "两个电阻R₁=6Ω和R₂=3Ω并联后，总电阻是多少？",
        options: ["A. 9Ω", "B. 4.5Ω", "C. 2Ω", "D. 1Ω"],
        answer: 2, knowledge: "并联电阻 1/R=1/R₁+1/R₂", relatedCard: "S31"
      },
      {
        id: "Q_E_19", domain: "电", difficulty: "challenge",
        question: "一个标有「220V 100W」的灯泡正常工作时的电阻约为多少？",
        options: ["A. 22Ω", "B. 484Ω", "C. 100Ω", "D. 220Ω"],
        answer: 1, knowledge: "P=U²/R → R=U²/P=220²/100=484Ω", relatedCard: "A49"
      },
      {
        id: "Q_E_20", domain: "电", difficulty: "challenge",
        question: "关于家庭电路，下列说法正确的是？",
        options: ["A. 用电器之间是串联的", "B. 保险丝熔断后可用铜丝代替", "C. 开关应接在用电器和火线之间", "D. 插座的两个孔都接火线"],
        answer: 2, knowledge: "家庭电路安全用电", relatedCard: "S27"
      }
    ];
  }

  // ----------------------------------------------------------
  // 生成一回合的3道题
  // ----------------------------------------------------------
  generateRound(mainDomain, subDomain, lastPlayedCard) {
    let mainPool = this._getPool(mainDomain);
    let subPool = (subDomain && subDomain !== mainDomain) ? this._getPool(subDomain) : [];
    let relatedPool = lastPlayedCard ? this._getRelatedPool(lastPlayedCard) : [];

    // 按难度分组（有助于保证难度多样性）
    const groupByDiff = (pool) => {
      const map = { basic: [], advanced: [], challenge: [] };
      pool.forEach(q => map[q.difficulty].push(q));
      return map;
    };

    const selected = [];

    // 步骤1：如果有关联卡牌的题目，优先选1题
    if (relatedPool.length > 0) {
      const q = this._pickRandom(relatedPool);
      selected.push(q);
      mainPool = mainPool.filter(item => item.id !== q.id);
      subPool = subPool.filter(item => item.id !== q.id);
    }

    // 步骤2：填充剩余位置
    let safety = 0;
    while (selected.length < 3 && safety < 100) {
      safety++;
      const useSub = subPool.length > 0 && Math.random() < 0.25;
      let pool = useSub ? subPool : mainPool;

      // 后备池
      if (pool.length === 0) {
        pool = useSub ? mainPool : subPool;
      }
      if (pool.length === 0) break;

      // 尽量选不同难度的题目
      let difficultyGroups = groupByDiff(pool);
      const pickedIds = new Set(selected.map(q => q.id));
      const availableDiffs = Object.keys(difficultyGroups).filter(
        d => difficultyGroups[d].some(q => !pickedIds.has(q.id))
      );

      let pick = null;
      if (availableDiffs.length > 0) {
        // 优先选未出现过的难度
        const usedDiffs = new Set(selected.map(q => q.difficulty));
        const preferredDiff = availableDiffs.find(d => !usedDiffs.has(d)) || availableDiffs[0];
        const candidates = difficultyGroups[preferredDiff].filter(q => !pickedIds.has(q.id));
        pick = candidates.length > 0 ? this._pickRandom(candidates) : this._pickRandom(pool);
      } else {
        pick = this._pickRandom(pool);
      }

      if (pick && !selected.find(q => q.id === pick.id)) {
        selected.push(pick);
      }

      // 从两个候选池中移除
      mainPool = mainPool.filter(q => q.id !== pick.id);
      subPool = subPool.filter(q => q.id !== pick.id);
    }

    // 后备：如果还不够3题，从全部题库中随机补
    if (selected.length < 3) {
      const allAvail = this.questions.filter(
        q => !selected.find(s => s.id === q.id)
      );
      const shuffled = [...allAvail];
      this._shuffle(shuffled);
      for (const q of shuffled) {
        if (selected.length >= 3) break;
        if (!selected.find(s => s.id === q.id)) {
          selected.push(q);
        }
      }
    }

    this.currentRoundData = selected;
    selected.forEach(q => this.usedQuestionIds.add(q.id));

    return selected.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      difficulty: q.difficulty,
      relatedCard: q.relatedCard
    }));
  }

  // ----------------------------------------------------------
  // 判题
  // ----------------------------------------------------------
  checkAnswer(questionId, answerIndex) {
    const question = this.currentRoundData.find(q => q.id === questionId);
    if (!question) {
      return { correct: false, knowledge: "" };
    }
    return {
      correct: question.answer === answerIndex,
      knowledge: question.knowledge
    };
  }

  // ----------------------------------------------------------
  // 获取答题增益百分比
  // ----------------------------------------------------------
  getQuizBonus(correctCount) {
    if (correctCount >= 3) return 12;
    if (correctCount === 2) return 8;
    if (correctCount === 1) return 5;
    return 0;
  }

  // ----------------------------------------------------------
  // 根据ID获取题目
  // ----------------------------------------------------------
  getQuestionById(id) {
    return this.questions.find(q => q.id === id) || null;
  }

  // ==========================================================
  // 内部辅助方法
  // ==========================================================

  // 获取某领域可用题目池（自动重置已用集合）
  _getPool(domain) {
    let pool = this.questions.filter(
      q => q.domain === domain && !this.usedQuestionIds.has(q.id)
    );
    if (pool.length < 3) {
      for (const q of this.questions) {
        if (q.domain === domain) {
          this.usedQuestionIds.delete(q.id);
        }
      }
      pool = this.questions.filter(q => q.domain === domain);
    }
    return pool;
  }

  // 获取关联某卡牌ID的可用题目
  _getRelatedPool(cardId) {
    return this.questions.filter(
      q => q.relatedCard === cardId && !this.usedQuestionIds.has(q.id)
    );
  }

  // 随机选取数组元素
  _pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Fisher-Yates 洗牌
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

export { QuizSystem };
