// ============================================================
// 物理卡牌对战 —— 答题题库系统
// 面向初中生，共190道题目，按领域×难度分布
// ============================================================

class QuizSystem {
  constructor() {
    this.currentRoundData = [];
    this.usedQuestionIds = new Set();
    this.questions = this._initQuestions();
  }

  // ----------------------------------------------------------
  // 初始化全部190道题目
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
        answer: 2, knowledge: "弹性势能 Ep=½kx²", relatedCard: "S06"
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
      // 力 领域 — basic (5) Q_F_21 ~ Q_F_25
      // ======================================================
      {
        id: "Q_F_21", domain: "力", difficulty: "basic",
        question: "牛顿第一定律指出，物体不受外力时将保持什么状态？",
        options: ["A. 一定静止", "B. 一定运动", "C. 静止或匀速直线运动", "D. 加速运动"],
        answer: 2, knowledge: "牛顿第一定律", relatedCard: "A02"
      },
      {
        id: "Q_F_22", domain: "力", difficulty: "basic",
        question: "关于定滑轮，下列说法正确的是？",
        options: ["A. 省力", "B. 费力", "C. 不省力也不费力，改变力的方向", "D. 既省力又改变方向"],
        answer: 2, knowledge: "定滑轮", relatedCard: "A04"
      },
      {
        id: "Q_F_23", domain: "力", difficulty: "basic",
        question: "力可以使物体发生形变，也可以改变物体的什么？",
        options: ["A. 质量", "B. 运动状态", "C. 密度", "D. 温度"],
        answer: 1, knowledge: "力的作用效果", relatedCard: "S05"
      },
      {
        id: "Q_F_24", domain: "力", difficulty: "basic",
        question: "以下哪种方法可以增大压强？",
        options: ["A. 增大受力面积", "B. 减小压力", "C. 减小受力面积", "D. 增大接触面粗糙程度"],
        answer: 2, knowledge: "增大压强的方法", relatedCard: "A03"
      },
      {
        id: "Q_F_25", domain: "力", difficulty: "basic",
        question: "下面哪个不是力的三要素之一？",
        options: ["A. 力的大小", "B. 力的方向", "C. 力的作用点", "D. 力的单位"],
        answer: 3, knowledge: "力的三要素", relatedCard: "S05"
      },

      // ======================================================
      // 力 领域 — advanced (7) Q_F_26 ~ Q_F_32
      // ======================================================
      {
        id: "Q_F_26", domain: "力", difficulty: "advanced",
        question: "一个人推静止在水平地面的木箱，没有推动，原因是？",
        options: ["A. 推力小于摩擦力", "B. 推力等于摩擦力", "C. 推力小于重力", "D. 没有摩擦力"],
        answer: 1, knowledge: "二力平衡", relatedCard: "S04"
      },
      {
        id: "Q_F_27", domain: "力", difficulty: "advanced",
        question: "一个物体浸没在水中，重力为8N，浮力为12N，松手后物体会？",
        options: ["A. 下沉", "B. 悬浮", "C. 上浮", "D. 无法判断"],
        answer: 2, knowledge: "物体浮沉条件", relatedCard: "C06"
      },
      {
        id: "Q_F_28", domain: "力", difficulty: "advanced",
        question: "一台机器5s内做功1000J，其功率是多少？",
        options: ["A. 50W", "B. 100W", "C. 200W", "D. 500W"],
        answer: 2, knowledge: "功率 P=W/t", relatedCard: "A08"
      },
      {
        id: "Q_F_29", domain: "力", difficulty: "advanced",
        question: "关于大气压强，下列说法正确的是？",
        options: ["A. 大气压随高度增加而增大", "B. 托里拆利实验测出了大气压的值", "C. 大气压只存在于地球表面", "D. 大气压与天气无关"],
        answer: 1, knowledge: "大气压强", relatedCard: "A03"
      },
      {
        id: "Q_F_30", domain: "力", difficulty: "advanced",
        question: "一个小球从光滑斜面顶端滑下，下列说法正确的是？",
        options: ["A. 动能减小，重力势能增大", "B. 动能增大，重力势能增大", "C. 动能增大，重力势能减小", "D. 机械能增大"],
        answer: 2, knowledge: "动能与势能的转化", relatedCard: "A05"
      },
      {
        id: "Q_F_31", domain: "力", difficulty: "advanced",
        question: "连通器内装有同种液体，当液体不流动时，各容器中的液面总是？",
        options: ["A. 随容器形状不同", "B. 相平的", "C. 左高右低", "D. 中间高两边低"],
        answer: 1, knowledge: "连通器原理", relatedCard: "A03"
      },
      {
        id: "Q_F_32", domain: "力", difficulty: "advanced",
        question: "一个物体在水平面上受到与运动方向相反的10N摩擦力，移动了3m，摩擦力做的功是多少？",
        options: ["A. 0J", "B. 30J", "C. -30J", "D. 3.3J"],
        answer: 2, knowledge: "功的正负", relatedCard: "A08"
      },

      // ======================================================
      // 力 领域 — challenge (3) Q_F_33 ~ Q_F_35
      // ======================================================
      {
        id: "Q_F_33", domain: "力", difficulty: "challenge",
        question: "铁块挂在弹簧测力计下，空气中示数为7.8N，浸没水中示数为6.8N。铁块的浮力和体积分别是？（g=10N/kg, ρ水=1×10³kg/m³）",
        options: ["A. 1N, 1×10⁻⁴m³", "B. 7.8N, 7.8×10⁻⁴m³", "C. 6.8N, 6.8×10⁻⁴m³", "D. 10N, 1×10⁻³m³"],
        answer: 0, knowledge: "称重法+阿基米德原理", relatedCard: "C06"
      },
      {
        id: "Q_F_34", domain: "力", difficulty: "challenge",
        question: "小明用滑轮组提升重物，机械效率为75%。若有用功为600J，总功是多少？",
        options: ["A. 450J", "B. 600J", "C. 800J", "D. 750J"],
        answer: 2, knowledge: "机械效率 η=W有用/W总", relatedCard: "A04"
      },
      {
        id: "Q_F_35", domain: "力", difficulty: "challenge",
        question: "一艘船从河里驶入海里，下列说法正确的是？（ρ海水>ρ河水）",
        options: ["A. 船会上浮一些，浮力不变", "B. 船会下沉一些，浮力不变", "C. 船会上浮一些，浮力变大", "D. 船会下沉一些，浮力变小"],
        answer: 0, knowledge: "浮力=重力，排开液体变化", relatedCard: "C06"
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
        answer: 1, knowledge: "多普勒效应", relatedCard: "S13"
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
        answer: 1, knowledge: "多普勒效应：靠近时频率升高", relatedCard: "S13"
      },
      {
        id: "Q_S_20", domain: "声", difficulty: "challenge",
        question: "一艘船利用声呐探测海底，从发射超声波到接收回声共2s，此处海水深度约为？（海水声速1500m/s）",
        options: ["A. 750m", "B. 1500m", "C. 3000m", "D. 4500m"],
        answer: 1, knowledge: "回声测距：s=vt/2", relatedCard: "A14"
      },

      // ======================================================
      // 声 领域 — basic (5) Q_S_21 ~ Q_S_25
      // ======================================================
      {
        id: "Q_S_21", domain: "声", difficulty: "basic",
        question: "吹笛子时，笛声是由什么振动产生的？",
        options: ["A. 嘴唇振动", "B. 笛子本身振动", "C. 管内空气柱振动", "D. 手指振动"],
        answer: 2, knowledge: "空气柱振动", relatedCard: "A13"
      },
      {
        id: "Q_S_22", domain: "声", difficulty: "basic",
        question: "高速公路两旁安装隔音板，这是从哪个环节减弱噪声？",
        options: ["A. 声源处", "B. 传播过程中", "C. 人耳处", "D. 以上都不是"],
        answer: 1, knowledge: "减弱噪声的途径", relatedCard: "S11"
      },
      {
        id: "Q_S_23", domain: "声", difficulty: "basic",
        question: "关于声波，以下说法正确的是？",
        options: ["A. 声波是横波", "B. 声波是电磁波", "C. 声波是纵波", "D. 声波不需要介质传播"],
        answer: 2, knowledge: "声波是纵波", relatedCard: "A32"
      },
      {
        id: "Q_S_24", domain: "声", difficulty: "basic",
        question: "医生用听诊器听病人的心跳，听诊器的主要作用是？",
        options: ["A. 增大声音的音调", "B. 增大声音的响度", "C. 减小传播速度", "D. 改变声音的音色"],
        answer: 1, knowledge: "听诊器原理", relatedCard: "S12"
      },
      {
        id: "Q_S_25", domain: "声", difficulty: "basic",
        question: "控制噪声是城市环保的重要项目。以下在声源处减弱噪声的是？",
        options: ["A. 在道路两旁植树", "B. 给摩托车安装消声器", "C. 在道路旁安装隔音板", "D. 工人戴防噪声耳罩"],
        answer: 1, knowledge: "声源处减弱噪声", relatedCard: "S07"
      },

      // ======================================================
      // 声 领域 — advanced (7) Q_S_26 ~ Q_S_32
      // ======================================================
      {
        id: "Q_S_26", domain: "声", difficulty: "advanced",
        question: "蝙蝠发出超声波探测猎物，这利用了声音的什么特性？",
        options: ["A. 声音能传递能量", "B. 声音能传递信息", "C. 声音需要介质", "D. 声音传播速度快"],
        answer: 1, knowledge: "声能传递信息", relatedCard: "A45"
      },
      {
        id: "Q_S_27", domain: "声", difficulty: "advanced",
        question: "人能分辨不同人的说话声，这是因为每个人的声音有什么不同？",
        options: ["A. 音调不同", "B. 响度不同", "C. 音色不同", "D. 频率不同"],
        answer: 2, knowledge: "音色是发声体特征", relatedCard: "A45"
      },
      {
        id: "Q_S_28", domain: "声", difficulty: "advanced",
        question: "大礼堂墙壁上有凹凸不平的结构，这是为了？",
        options: ["A. 增强回声", "B. 减弱回声（吸音）", "C. 改变音调", "D. 提高音色"],
        answer: 1, knowledge: "吸音与回声", relatedCard: "S11"
      },
      {
        id: "Q_S_29", domain: "声", difficulty: "advanced",
        question: "下列关于声音传播的说法，错误的是？",
        options: ["A. 声音不能在真空中传播", "B. 一般来说声音在不同介质中的传播快慢关系是，固体>液体>气体", "C. 声音传播需要介质", "D. 空气中声速约为340m/h"],
        answer: 3, knowledge: "声速单位辨析（m/s vs m/h）", relatedCard: "A51"
      },
      {
        id: "Q_S_30", domain: "声", difficulty: "advanced",
        question: "关于双耳效应，下列说法正确的是？",
        options: ["A. 双耳效应说明两只耳朵听到的声音更大", "B. 利用声音到达两耳的时间差和强度差定位", "C. 双耳效应可以提高音调", "D. 双耳效应需要特殊设备"],
        answer: 1, knowledge: "双耳效应", relatedCard: "A45"
      },
      {
        id: "Q_S_31", domain: "声", difficulty: "advanced",
        question: "用超声波清洗眼镜，这利用了声音的什么？",
        options: ["A. 声音能传递信息", "B. 声音能传递能量", "C. 超声波频率高", "D. 超声波传播快"],
        answer: 1, knowledge: "声能传递能量", relatedCard: "A09"
      },
      {
        id: "Q_S_32", domain: "声", difficulty: "advanced",
        question: "以下哪种方式不能增大鼓声的响度？",
        options: ["A. 用力敲鼓", "B. 在鼓面上放砂子", "C. 离鼓更近", "D. 将鼓放在空旷场地"],
        answer: 1, knowledge: "响度与振幅", relatedCard: "S08"
      },

      // ======================================================
      // 声 领域 — challenge (3) Q_S_33 ~ Q_S_35
      // ======================================================
      {
        id: "Q_S_33", domain: "声", difficulty: "challenge",
        question: "声音在空气中的传播速度在哪个条件下最快？",
        options: ["A. 0℃", "B. 15℃", "C. 30℃", "D. -10℃"],
        answer: 2, knowledge: "声速与温度 v=331+0.6t", relatedCard: "A51"
      },
      {
        id: "Q_S_34", domain: "声", difficulty: "challenge",
        question: "潜艇向海底发射声波，4s后收到回声。海水声速约1500m/s，海底深度约为？",
        options: ["A. 1500m", "B. 3000m", "C. 6000m", "D. 750m"],
        answer: 1, knowledge: "声呐测距 d=vt/2", relatedCard: "A14"
      },
      {
        id: "Q_S_35", domain: "声", difficulty: "challenge",
        question: "声音从声源发出，在空气中传播过程中，下列说法正确的是？",
        options: ["A. 声音的音调越来越低", "B. 声音的响度越来越小", "C. 声音的传播速度越来越小", "D. 声音的频率越来越低"],
        answer: 1, knowledge: "声波传播中响度衰减", relatedCard: "D02"
      },
      // ======================================================
      // 光 领域 — basic (10) Q_L_01 ~ Q_L_10
      // ======================================================
      {
        id: "Q_L_01", domain: "光", difficulty: "basic",
        question: "影子的形成说明了光具有什么性质？",
        options: ["A. 光的反射", "B. 光的折射", "C. 光沿直线传播", "D. 光的色散"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_02", domain: "光", difficulty: "basic",
        question: "光射到平面镜上，入射角为30°，反射角是多少？",
        options: ["A. 15°", "B. 30°", "C. 60°", "D. 90°"],
        answer: 1, knowledge: "光的反射定律（反射角=入射角）", relatedCard: "S16"
      },
      {
        id: "Q_L_03", domain: "光", difficulty: "basic",
        question: "关于平面镜成像，下列说法正确的是？",
        options: ["A. 成倒立实像", "B. 像与物大小相等", "C. 像比物大", "D. 像距不等于物距"],
        answer: 1, knowledge: "平面镜成像：等大、等距、正立虚像", relatedCard: "S16"
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
        answer: 0, knowledge: "凹透镜发散光线", relatedCard: "S16"
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
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_10", domain: "光", difficulty: "basic",
        question: "以下哪个透镜对光有发散作用？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凸面镜"],
        answer: 1, knowledge: "凹透镜发散", relatedCard: "S16"
      },

      // ======================================================
      // 光 领域 — advanced (7) Q_L_11 ~ Q_L_17
      // ======================================================
      {
        id: "Q_L_11", domain: "光", difficulty: "advanced",
        question: "物体放在凸透镜的2倍焦距处，在光屏上会得到什么样的像？",
        options: ["A. 倒立放大的实像", "B. 倒立缩小的实像", "C. 倒立等大的实像", "D. 正立放大的虚像"],
        answer: 2, knowledge: "凸透镜成像：u=2f时成倒立等大实像", relatedCard: "S16"
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
        answer: 1, knowledge: "近视眼用凹透镜矫正", relatedCard: "S16"
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
        answer: 1, knowledge: "凸透镜成像规律：u>2f时成缩小实像", relatedCard: "S16"
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
        answer: 3, knowledge: "显微镜：物镜成放大实像，目镜成放大虚像", relatedCard: "S16"
      },

      // ======================================================
      // 光 领域 — basic (5) Q_L_21 ~ Q_L_25
      // ======================================================
      {
        id: "Q_L_21", domain: "光", difficulty: "basic",
        question: "下列物体中属于光源的是？",
        options: ["A. 月亮", "B. 镜子", "C. 点燃的蜡烛", "D. 钻石"],
        answer: 2, knowledge: "光源定义", relatedCard: "S14"
      },
      {
        id: "Q_L_22", domain: "光", difficulty: "basic",
        question: "一束光从空气斜射入水中，折射角和入射角的关系是？",
        options: ["A. 折射角>入射角", "B. 折射角<入射角", "C. 折射角=入射角", "D. 无法确定"],
        answer: 1, knowledge: "折射角<入射角（空气入水）", relatedCard: "A46"
      },
      {
        id: "Q_L_23", domain: "光", difficulty: "basic",
        question: "潜望镜利用了什么光学原理？",
        options: ["A. 光的折射", "B. 光的直线传播", "C. 光的反射（平面镜）", "D. 光的色散"],
        answer: 2, knowledge: "平面镜反射", relatedCard: "S16"
      },
      {
        id: "Q_L_24", domain: "光", difficulty: "basic",
        question: "我们能从不同方向看到不发光的物体，这是因为光在物体表面发生了？",
        options: ["A. 镜面反射", "B. 漫反射", "C. 全反射", "D. 折射"],
        answer: 1, knowledge: "漫反射", relatedCard: "S14"
      },
      {
        id: "Q_L_25", domain: "光", difficulty: "basic",
        question: "太阳光通过三棱镜后分解成七种色光，这叫什么现象？",
        options: ["A. 反射", "B. 折射", "C. 色散", "D. 衍射"],
        answer: 2, knowledge: "光的色散", relatedCard: "A16"
      },

      // ======================================================
      // 光 领域 — advanced (7) Q_L_26 ~ Q_L_32
      // ======================================================
      {
        id: "Q_L_26", domain: "光", difficulty: "advanced",
        question: "近视眼的晶状体太厚，成像在视网膜的什么位置？",
        options: ["A. 视网膜上", "B. 视网膜前", "C. 视网膜后", "D. 视神经上"],
        answer: 1, knowledge: "近视眼成像原理", relatedCard: "S16"
      },
      {
        id: "Q_L_27", domain: "光", difficulty: "advanced",
        question: "关于光的反射定律，下列说法正确的是？",
        options: ["A. 入射角随反射角变化", "B. 光垂直入射时反射角为90°", "C. 反射光线、入射光线、法线在同一平面", "D. 反射光线不一定在入射光线和法线决定的平面内"],
        answer: 2, knowledge: "反射定律三线共面", relatedCard: "S16"
      },
      {
        id: "Q_L_28", domain: "光", difficulty: "advanced",
        question: "放电影时，银幕上的像是？",
        options: ["A. 正立放大的实像", "B. 倒立放大的实像", "C. 正立缩小的虚像", "D. 倒立缩小的虚像"],
        answer: 1, knowledge: "投影仪成像", relatedCard: "S16"
      },
      {
        id: "Q_L_29", domain: "光", difficulty: "advanced",
        question: "凸透镜的焦距为10cm，当物体距透镜15cm时，所成的像是？",
        options: ["A. 倒立缩小的实像", "B. 倒立放大的实像", "C. 正立放大的虚像", "D. 倒立等大的实像"],
        answer: 1, knowledge: "f<u<2f 倒立放大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_30", domain: "光", difficulty: "advanced",
        question: "望远镜的物镜相当于什么光学元件？",
        options: ["A. 平面镜", "B. 凸透镜", "C. 凹透镜", "D. 凸面镜"],
        answer: 1, knowledge: "望远镜物镜", relatedCard: "C09"
      },
      {
        id: "Q_L_31", domain: "光", difficulty: "advanced",
        question: "红外线在生活中的应用不包括？",
        options: ["A. 遥控器", "B. 夜视仪", "C. 验钞机", "D. 红外测温"],
        answer: 2, knowledge: "验钞机=紫外线", relatedCard: "A17"
      },
      {
        id: "Q_L_32", domain: "光", difficulty: "advanced",
        question: "一束平行光经过凸透镜后会？",
        options: ["A. 发散", "B. 会聚于焦点", "C. 继续平行射出", "D. 变成散射光"],
        answer: 1, knowledge: "凸透镜焦点", relatedCard: "A55"
      },

      // ======================================================
      // 光 领域 — challenge (3) Q_L_33 ~ Q_L_35
      // ======================================================
      {
        id: "Q_L_33", domain: "光", difficulty: "challenge",
        question: "物体在凸透镜前20cm处，在光屏上得到清晰等大的像，该凸透镜的焦距为？",
        options: ["A. 20cm", "B. 10cm", "C. 40cm", "D. 5cm"],
        answer: 1, knowledge: "u=2f成等大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_34", domain: "光", difficulty: "challenge",
        question: "光从空气射向玻璃，入射角增大时折射角会？",
        options: ["A. 也增大", "B. 减小", "C. 不变", "D. 先增后减"],
        answer: 0, knowledge: "折射角随入射角增大", relatedCard: "A46"
      },
      {
        id: "Q_L_35", domain: "光", difficulty: "challenge",
        question: "显微镜观察微小物体时，第一次放大是由什么完成的？",
        options: ["A. 目镜", "B. 物镜", "C. 反光镜", "D. 聚光镜"],
        answer: 1, knowledge: "显微镜物镜成放大实像", relatedCard: "S16"
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
      // 热 领域 — basic (5) Q_H_21 ~ Q_H_25
      // ======================================================
      {
        id: "Q_H_21", domain: "热", difficulty: "basic",
        question: "下列物质中，比热容最大的是？",
        options: ["A. 沙子", "B. 铁", "C. 水", "D. 酒精"],
        answer: 2, knowledge: "水的比热容大", relatedCard: "S22"
      },
      {
        id: "Q_H_22", domain: "热", difficulty: "basic",
        question: "改变物体内能的方式有？",
        options: ["A. 只有做功", "B. 只有热传递", "C. 做功和热传递", "D. 只有摩擦"],
        answer: 2, knowledge: "改变内能的方式", relatedCard: "S19"
      },
      {
        id: "Q_H_23", domain: "热", difficulty: "basic",
        question: "下列现象中，属于升华的是？",
        options: ["A. 夏天冰棒冒「白气」", "B. 冬天玻璃上出现冰花", "C. 樟脑丸变小消失", "D. 清晨草叶上有露珠"],
        answer: 2, knowledge: "升华（固态→气态）", relatedCard: "A47"
      },
      {
        id: "Q_H_24", domain: "热", difficulty: "basic",
        question: "物体吸收热量后，温度一定会升高吗？",
        options: ["A. 一定会", "B. 一定不会", "C. 晶体熔化时吸热但温度不变", "D. 只有液体如此"],
        answer: 2, knowledge: "晶体熔化吸热温度不变", relatedCard: "S25"
      },
      {
        id: "Q_H_25", domain: "热", difficulty: "basic",
        question: "冬天用热水袋取暖，主要利用了水的什么特性？",
        options: ["A. 密度大", "B. 比热容大", "C. 沸点高", "D. 透明度好"],
        answer: 1, knowledge: "水比热容大的应用", relatedCard: "S22"
      },

      // ======================================================
      // 热 领域 — advanced (7) Q_H_26 ~ Q_H_32
      // ======================================================
      {
        id: "Q_H_26", domain: "热", difficulty: "advanced",
        question: "质量为2kg的水，温度从30℃升高到50℃，吸收的热量是多少？（c水=4.2×10³J/(kg·℃)）",
        options: ["A. 8.4×10⁴J", "B. 1.68×10⁵J", "C. 4.2×10⁵J", "D. 2.1×10⁵J"],
        answer: 1, knowledge: "Q=cmΔt", relatedCard: "S22"
      },
      {
        id: "Q_H_27", domain: "热", difficulty: "advanced",
        question: "关于汽化的两种方式，下列说法正确的是？",
        options: ["A. 蒸发和沸腾都只在液体表面发生", "B. 蒸发吸热，沸腾放热", "C. 蒸发在任何温度都能发生", "D. 沸腾不需要达到沸点"],
        answer: 2, knowledge: "蒸发可在任意温度发生", relatedCard: "A25"
      },
      {
        id: "Q_H_28", domain: "热", difficulty: "advanced",
        question: "内燃机工作循环中，压缩冲程的能量转化是？",
        options: ["A. 内能→机械能", "B. 机械能→内能", "C. 化学能→内能", "D. 内能→化学能"],
        answer: 1, knowledge: "压缩冲程 机械能→内能", relatedCard: "S23"
      },
      {
        id: "Q_H_29", domain: "热", difficulty: "advanced",
        question: "把一杯80℃的热水放在20℃的房间里，水温变化趋势是？",
        options: ["A. 立刻降至20℃", "B. 逐渐冷却到接近室温", "C. 永远不变", "D. 先冷却再升温"],
        answer: 1, knowledge: "热传递与温度", relatedCard: "A21"
      },
      {
        id: "Q_H_30", domain: "热", difficulty: "advanced",
        question: "以下哪种物态变化过程吸热？",
        options: ["A. 凝固", "B. 液化", "C. 凝华", "D. 升华"],
        answer: 3, knowledge: "升华吸热", relatedCard: "A47"
      },
      {
        id: "Q_H_31", domain: "热", difficulty: "advanced",
        question: "常看到的「白气」，关于它的说法正确的是？",
        options: ["A. 是水蒸气", "B. 是水蒸气液化的小水滴", "C. 是空气", "D. 是干冰"],
        answer: 1, knowledge: "「白气」=液化小水滴", relatedCard: "A25"
      },
      {
        id: "Q_H_32", domain: "热", difficulty: "advanced",
        question: "关于热机效率 η=W有用/Q总，下列说法正确的是？",
        options: ["A. 热机效率可以等于100%", "B. 热机效率总是小于1", "C. 热机效率取决于燃料种类", "D. 做功冲程效率最高"],
        answer: 1, knowledge: "热机效率<1（能量损耗）", relatedCard: "S23"
      },

      // ======================================================
      // 热 领域 — challenge (3) Q_H_33 ~ Q_H_35
      // ======================================================
      {
        id: "Q_H_33", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的水和煤油，吸收相同热量后，温度升高较多的是？（c水>c煤油）",
        options: ["A. 水", "B. 煤油", "C. 两者相同", "D. 无法确定"],
        answer: 1, knowledge: "Δt=Q/(cm) c小者Δt大", relatedCard: "S22"
      },
      {
        id: "Q_H_34", domain: "热", difficulty: "challenge",
        question: "关于热量、温度、内能的关系，下列说法正确的是？",
        options: ["A. 物体温度越高，含有的热量越多", "B. 热量总从内能大的物体传向内能小的物体", "C. 物体温度升高，内能一定增大", "D. 物体吸收热量，温度一定升高"],
        answer: 2, knowledge: "温度升高内能一定增大", relatedCard: "S19"
      },
      {
        id: "Q_H_35", domain: "热", difficulty: "challenge",
        question: "一杯热水自然冷却过程中，关于它的温度变化，下列说法正确的是？",
        options: ["A. 一直不变", "B. 降到室温后不再变化", "C. 降到0℃后不变", "D. 降到低于室温后回升"],
        answer: 1, knowledge: "热平衡：温度最终相等", relatedCard: "A21"
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
      },
      // ======================================================
      // 电 领域 — basic (5) Q_E_21 ~ Q_E_25
      // ======================================================
      {
        id: "Q_E_21", domain: "电", difficulty: "basic",
        question: "我国家庭电路的电压是多少？",
        options: ["A. 36V", "B. 110V", "C. 220V", "D. 380V"],
        answer: 2, knowledge: "家庭电压220V", relatedCard: "S27"
      },
      {
        id: "Q_E_22", domain: "电", difficulty: "basic",
        question: "下列哪种做法符合安全用电原则？",
        options: ["A. 用湿手触碰开关", "B. 在高压线下放风筝", "C. 发现有人触电先切断电源", "D. 用铜丝代替保险丝"],
        answer: 2, knowledge: "安全用电", relatedCard: "S27"
      },
      {
        id: "Q_E_23", domain: "电", difficulty: "basic",
        question: "测电笔（试电笔）是用来检测什么的？",
        options: ["A. 电流大小", "B. 电压大小", "C. 物体是否带电或区分火线零线", "D. 电阻大小"],
        answer: 2, knowledge: "测电笔用途", relatedCard: "S30"
      },
      {
        id: "Q_E_24", domain: "电", difficulty: "basic",
        question: "下列各组物质中，通常情况下都属于绝缘体的是？",
        options: ["A. 人体、大地、铜", "B. 橡胶、塑料、玻璃", "C. 盐水、石墨、铝", "D. 铁、铜、铝"],
        answer: 1, knowledge: "绝缘体", relatedCard: "A27"
      },
      {
        id: "Q_E_25", domain: "电", difficulty: "basic",
        question: "灯泡上标有「220V 40W」字样，其额定电压和额定功率分别是？",
        options: ["A. 220V 40W", "B. 220A 40V", "C. 40V 220W", "D. 220W 40V"],
        answer: 0, knowledge: "额定电压和额定功率", relatedCard: "A49"
      },

      // ======================================================
      // 电 领域 — advanced (7) Q_E_26 ~ Q_E_32
      // ======================================================
      {
        id: "Q_E_26", domain: "电", difficulty: "advanced",
        question: "一个电阻为10Ω的用电器，两端电压为6V，其功率是多少？",
        options: ["A. 0.6W", "B. 3.6W", "C. 60W", "D. 1.67W"],
        answer: 1, knowledge: "P=U²/R", relatedCard: "A49"
      },
      {
        id: "Q_E_27", domain: "电", difficulty: "advanced",
        question: "下列现象中，属于电磁感应的是？",
        options: ["A. 通电导线使磁针偏转", "B. 闭合电路部分导体在磁场中运动产生电流", "C. 电流通过灯丝发光", "D. 磁铁吸引铁钉"],
        answer: 1, knowledge: "电磁感应（磁生电）", relatedCard: "S28"
      },
      {
        id: "Q_E_28", domain: "电", difficulty: "advanced",
        question: "两个电阻串联时，总电阻与分电阻的关系是？",
        options: ["A. R总=R₁+R₂", "B. R总=(R₁×R₂)/(R₁+R₂)", "C. R总<R₁", "D. R总<R₂"],
        answer: 0, knowledge: "串联 R总=R₁+R₂", relatedCard: "C07"
      },
      {
        id: "Q_E_29", domain: "电", difficulty: "advanced",
        question: "关于安全电压，以下说法正确的是？",
        options: ["A. 低于36V的电压绝对安全", "B. 潮湿环境下安全电压更低", "C. 任何低于220V的电压都安全", "D. 安全电压与人体电阻无关"],
        answer: 1, knowledge: "安全电压与环境有关", relatedCard: "S27"
      },
      {
        id: "Q_E_30", domain: "电", difficulty: "advanced",
        question: "关于磁感线，下列说法正确的是？",
        options: ["A. 磁感线是真实存在的曲线", "B. 磁体外部磁感线从N极指向S极", "C. 磁感线可以相交", "D. 磁感线从S极出发"],
        answer: 1, knowledge: "磁感线方向 N→S", relatedCard: "D05"
      },
      {
        id: "Q_E_31", domain: "电", difficulty: "advanced",
        question: "下列装置中，利用电磁感应原理工作的是？",
        options: ["A. 电风扇", "B. 发电机", "C. 电热水器", "D. 电磁起重机"],
        answer: 1, knowledge: "发电机=电磁感应", relatedCard: "S28"
      },
      {
        id: "Q_E_32", domain: "电", difficulty: "advanced",
        question: "一根电阻丝对折后接入电路，其电阻将？",
        options: ["A. 增大", "B. 减小", "C. 不变", "D. 无法确定"],
        answer: 1, knowledge: "长度减半横截面加倍", relatedCard: "S27"
      },

      // ======================================================
      // 电 领域 — challenge (3) Q_E_33 ~ Q_E_35
      // ======================================================
      {
        id: "Q_E_33", domain: "电", difficulty: "challenge",
        question: "两个电阻R₁=6Ω、R₂=12Ω并联后接到6V电源上，流过R₁的电流是多少？",
        options: ["A. 0.5A", "B. 1A", "C. 2A", "D. 0.33A"],
        answer: 1, knowledge: "并联电压相等 I₁=U/R₁", relatedCard: "S31"
      },
      {
        id: "Q_E_34", domain: "电", difficulty: "challenge",
        question: "一度电（1kW·h）可供「220V 40W」的灯泡正常工作多长时间？",
        options: ["A. 10h", "B. 20h", "C. 25h", "D. 40h"],
        answer: 2, knowledge: "t=W/P=1000/40=25h", relatedCard: "A49"
      },
      {
        id: "Q_E_35", domain: "电", difficulty: "challenge",
        question: "关于磁场和电流的关系，下列说法错误的是？",
        options: ["A. 奥斯特发现电流周围存在磁场", "B. 通电螺线管外部磁场与条形磁铁相似", "C. 改变电流方向不会改变磁场方向", "D. 通电导体在磁场中会受到力的作用"],
        answer: 2, knowledge: "电流方向决定磁场方向", relatedCard: "D05"
      },
      // ======================================================
      // 混沌 领域 — basic (5) Q_C_01 ~ Q_C_05
      // ======================================================
      {
        id: "Q_C_01", domain: "混沌", difficulty: "basic",
        question: "芝诺悖论中「阿基里斯追不上乌龟」的本质矛盾在于？",
        options: ["A. 阿基里斯跑得比乌龟慢", "B. 将无限分割的过程等同于无限的时间", "C. 乌龟可以瞬移", "D. 阿基里斯中途放弃"],
        answer: 1, knowledge: "芝诺悖论与极限", relatedCard: "C01"
      },
      {
        id: "Q_C_02", domain: "混沌", difficulty: "basic",
        question: "薛定谔的猫思想实验中，猫在打开盒子前处于什么状态？",
        options: ["A. 一定是活的", "B. 一定是死的", "C. 既是活的又是死的（叠加态）", "D. 猫已经逃走了"],
        answer: 2, knowledge: "量子叠加态", relatedCard: "C04"
      },
      {
        id: "Q_C_03", domain: "混沌", difficulty: "basic",
        question: "能量守恒定律表明能量可以？",
        options: ["A. 凭空产生", "B. 凭空消失", "C. 从一种形式转化为另一种形式", "D. 总量不断减少"],
        answer: 2, knowledge: "能量守恒", relatedCard: "T01"
      },
      {
        id: "Q_C_04", domain: "混沌", difficulty: "basic",
        question: "麦克斯韦妖的设想中，小妖通过什么方式「违反」热力学第二定律？",
        options: ["A. 创造能量", "B. 区分快慢分子减少熵", "C. 降低温度", "D. 增加压强"],
        answer: 1, knowledge: "麦克斯韦妖与熵", relatedCard: "C02"
      },
      {
        id: "Q_C_05", domain: "混沌", difficulty: "basic",
        question: "相变是指物质在什么之间的转变？",
        options: ["A. 不同状态（固态、液态、气态等）", "B. 不同颜色", "C. 不同质量", "D. 不同速度"],
        answer: 0, knowledge: "相变：物质状态变化", relatedCard: "T02"
      },

      // ======================================================
      // 混沌 领域 — advanced (7) Q_C_06 ~ Q_C_12
      // ======================================================
      {
        id: "Q_C_06", domain: "混沌", difficulty: "advanced",
        question: "拉普拉斯妖的核心思想是：如果知道宇宙中所有粒子的位置和动量，就可以？",
        options: ["A. 创造新宇宙", "B. 预测未来一切", "C. 改变物理定律", "D. 使时间倒流"],
        answer: 1, knowledge: "决定论与拉普拉斯妖", relatedCard: "C03"
      },
      {
        id: "Q_C_07", domain: "混沌", difficulty: "advanced",
        question: "熵增加原理告诉我们，在孤立系统中，熵总是？",
        options: ["A. 减小", "B. 不变", "C. 增加或不变（不可逆）", "D. 先减小后增加"],
        answer: 2, knowledge: "熵增原理", relatedCard: "T03"
      },
      {
        id: "Q_C_08", domain: "混沌", difficulty: "advanced",
        question: "为什么芝诺悖论在现实中不成立？",
        options: ["A. 阿基里斯实际跑得更快", "B. 无穷级数之和可以是有限的", "C. 乌龟会累", "D. 阿基里斯有超能力"],
        answer: 1, knowledge: "无穷级数之和有限", relatedCard: "C01"
      },
      {
        id: "Q_C_09", domain: "混沌", difficulty: "advanced",
        question: "「临界点」是指物质在什么条件下的特殊状态？",
        options: ["A. 液态和气态无法区分的状态", "B. 绝对零度", "C. 最高温度", "D. 最大压强"],
        answer: 0, knowledge: "临界态：气液不分", relatedCard: "T02"
      },
      {
        id: "Q_C_10", domain: "混沌", difficulty: "advanced",
        question: "量子力学中，「观测」对量子态有什么影响？",
        options: ["A. 没有影响", "B. 使量子态坍缩为确定态", "C. 使量子态更不确定", "D. 创造新量子"],
        answer: 1, knowledge: "观测导致波函数坍缩", relatedCard: "C04"
      },
      {
        id: "Q_C_11", domain: "混沌", difficulty: "advanced",
        question: "麦克斯韦妖悖论最终被什么理论破解？",
        options: ["A. 牛顿力学", "B. 信息论（信息与熵的关系）", "C. 相对论", "D. 光学"],
        answer: 1, knowledge: "信息熵与热力学熵", relatedCard: "C02"
      },
      {
        id: "Q_C_12", domain: "混沌", difficulty: "advanced",
        question: "冰直接变成水蒸气跳过液态，这个过程叫做？",
        options: ["A. 熔化", "B. 凝固", "C. 升华", "D. 凝华"],
        answer: 2, knowledge: "升华：固态→气态", relatedCard: "A47"
      },

      // ======================================================
      // 混沌 领域 — challenge (3) Q_C_13 ~ Q_C_15
      // ======================================================
      {
        id: "Q_C_13", domain: "混沌", difficulty: "challenge",
        question: "量子叠加态与经典物理的最大区别是？",
        options: ["A. 量子叠加可同时处于多个状态，测量后才确定", "B. 量子叠加总是一个确定的状态", "C. 经典物理没有叠加概念", "D. 两者完全相同"],
        answer: 0, knowledge: "量子叠加 vs 经典确定", relatedCard: "C04"
      },
      {
        id: "Q_C_14", domain: "混沌", difficulty: "challenge",
        question: "熵逆转在现实物理中可能实现吗？为什么？",
        options: ["A. 可以，只要能量足够", "B. 不可以，违反热力学第二定律", "C. 可以，在微观尺度", "D. 不可以，违反牛顿定律"],
        answer: 1, knowledge: "熵逆转违反热力学第二定律", relatedCard: "T03"
      },
      {
        id: "Q_C_15", domain: "混沌", difficulty: "challenge",
        question: "关于决定论（拉普拉斯妖）与量子力学的关系，下列说法正确的是？",
        options: ["A. 量子力学的概率性支持决定论", "B. 量子力学的不确定性原理挑战了决定论", "C. 两者没有关系", "D. 相对论证明了决定论"],
        answer: 1, knowledge: "量子不确定性vs决定论", relatedCard: "C03"
      },
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
      correct: question.answer === Number(answerIndex),
      knowledge: question.knowledge
    };
  }

  // ----------------------------------------------------------
  // 获取答题增益百分比
  // ----------------------------------------------------------
  getQuizBonus(correctCount) {
    if (correctCount >= 3) return 0.12;
    if (correctCount === 2) return 0.08;
    if (correctCount === 1) return 0.05;
    return 0.0;
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
