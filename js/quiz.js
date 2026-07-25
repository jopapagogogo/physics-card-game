// ============================================================
// 物理卡牌对战 —— 答题题库系统 (基于人教版初中物理教材)
// 共1035道概念题，按领域×难度分布
// ============================================================

class QuizSystem {
  constructor() {
    this.currentRoundData = [];
    this.usedQuestionIds = new Set();
    this.questions = this._initQuestions();
  }

  _initQuestions() {
    return [
      // ==================================================
      // 力 领域
      // ==================================================
      {
        id: "Q_F_001", domain: "力", difficulty: "basic",
        question: "国际单位制中，长度的基本单位是？",
        options: ["A. 厘米", "B. 米", "C. 千米", "D. 分米"],
        answer: 1, knowledge: "长度的国际单位", relatedCard: "A01"
      },
      {
        id: "Q_F_002", domain: "力", difficulty: "basic",
        question: "测量长度最常用的工具是？",
        options: ["A. 量筒", "B. 天平", "C. 刻度尺", "D. 温度计"],
        answer: 2, knowledge: "长度测量工具", relatedCard: "A01"
      },
      {
        id: "Q_F_003", domain: "力", difficulty: "basic",
        question: "国际单位制中，时间的基本单位是？",
        options: ["A. 小时", "B. 分钟", "C. 秒", "D. 天"],
        answer: 2, knowledge: "时间单位", relatedCard: "A02"
      },
      {
        id: "Q_F_004", domain: "力", difficulty: "basic",
        question: "判断物体是运动还是静止需要选择？",
        options: ["A. 参照物", "B. 测量工具", "C. 坐标系", "D. 单位"],
        answer: 0, knowledge: "参照物", relatedCard: "A02"
      },
      {
        id: "Q_F_005", domain: "力", difficulty: "basic",
        question: "小明坐在行驶的公交车上，发现路边的树在向后退，他选的参照物是？",
        options: ["A. 地面", "B. 公交车", "C. 路边房子", "D. 路灯"],
        answer: 1, knowledge: "参照物的选择", relatedCard: "A02"
      },
      {
        id: "Q_F_006", domain: "力", difficulty: "basic",
        question: "描述物体运动快慢的物理量是？",
        options: ["A. 时间", "B. 路程", "C. 速度", "D. 加速度"],
        answer: 2, knowledge: "速度定义", relatedCard: "A06"
      },
      {
        id: "Q_F_007", domain: "力", difficulty: "basic",
        question: "速度的国际单位是？",
        options: ["A. km/h", "B. m/s", "C. cm/s", "D. m/min"],
        answer: 1, knowledge: "速度单位", relatedCard: "A06"
      },
      {
        id: "Q_F_008", domain: "力", difficulty: "basic",
        question: "物体沿直线运动速度大小保持不变的运动叫做？",
        options: ["A. 变速直线运动", "B. 曲线运动", "C. 匀速直线运动", "D. 加速运动"],
        answer: 2, knowledge: "匀速直线运动", relatedCard: "A02"
      },
      {
        id: "Q_F_009", domain: "力", difficulty: "basic",
        question: "下列哪个属于机械运动？",
        options: ["A. 铁钉生锈", "B. 种子发芽", "C. 汽车行驶", "D. 冰雪融化"],
        answer: 2, knowledge: "机械运动定义", relatedCard: "A02"
      },
      {
        id: "Q_F_010", domain: "力", difficulty: "basic",
        question: "使用刻度尺测量长度时，视线应？",
        options: ["A. 斜视", "B. 与尺面垂直", "C. 从上方看", "D. 任意方向"],
        answer: 1, knowledge: "刻度尺使用", relatedCard: "A01"
      },
      {
        id: "Q_F_011", domain: "力", difficulty: "basic",
        question: "测量时需要估读到分度值的？",
        options: ["A. 上一位", "B. 下一位", "C. 同一位", "D. 不需要估读"],
        answer: 1, knowledge: "估读", relatedCard: "A01"
      },
      {
        id: "Q_F_012", domain: "力", difficulty: "basic",
        question: "地球同步卫星绕地球转动时，以地球为参照物，卫星是？",
        options: ["A. 运动的", "B. 静止的", "C. 有时运动有时静止", "D. 无法判断"],
        answer: 1, knowledge: "相对静止", relatedCard: "A02"
      },
      {
        id: "Q_F_013", domain: "力", difficulty: "basic",
        question: "力是物体对物体的什么？",
        options: ["A. 接触", "B. 吸引", "C. 作用", "D. 排斥"],
        answer: 2, knowledge: "力的定义", relatedCard: "S05"
      },
      {
        id: "Q_F_014", domain: "力", difficulty: "basic",
        question: "力的国际单位是什么？",
        options: ["A. 千克", "B. 牛顿", "C. 帕斯卡", "D. 焦耳"],
        answer: 1, knowledge: "力的单位", relatedCard: "A01"
      },
      {
        id: "Q_F_015", domain: "力", difficulty: "basic",
        question: "力的三要素不包括？",
        options: ["A. 力的大小", "B. 力的方向", "C. 力的作用点", "D. 力的单位"],
        answer: 3, knowledge: "力的三要素", relatedCard: "S05"
      },
      {
        id: "Q_F_016", domain: "力", difficulty: "basic",
        question: "力的作用效果不包括？",
        options: ["A. 改变物体形状", "B. 改变物体运动状态", "C. 改变物体质量", "D. 使物体速度变化"],
        answer: 2, knowledge: "力的作用效果", relatedCard: "S05"
      },
      {
        id: "Q_F_017", domain: "力", difficulty: "basic",
        question: "用手拍桌子手感到疼，这是因为？",
        options: ["A. 桌子对手没有力", "B. 力的作用是相互的", "C. 手的力大于桌子的力", "D. 桌子比手硬"],
        answer: 1, knowledge: "相互作用力", relatedCard: "S05"
      },
      {
        id: "Q_F_018", domain: "力", difficulty: "basic",
        question: "物体由于发生弹性形变而产生的力叫做？",
        options: ["A. 重力", "B. 摩擦力", "C. 弹力", "D. 浮力"],
        answer: 2, knowledge: "弹力定义", relatedCard: "S06"
      },
      {
        id: "Q_F_019", domain: "力", difficulty: "basic",
        question: "测量力的工具是？",
        options: ["A. 天平", "B. 量筒", "C. 刻度尺", "D. 弹簧测力计"],
        answer: 3, knowledge: "测力计", relatedCard: "S06"
      },
      {
        id: "Q_F_020", domain: "力", difficulty: "basic",
        question: "在弹性限度内弹簧的伸长量与所受拉力成什么关系？",
        options: ["A. 反比", "B. 正比", "C. 平方关系", "D. 无关"],
        answer: 1, knowledge: "胡克定律", relatedCard: "S06"
      },
      {
        id: "Q_F_021", domain: "力", difficulty: "basic",
        question: "由于地球吸引而使物体受到的力叫做？",
        options: ["A. 弹力", "B. 摩擦力", "C. 重力", "D. 支持力"],
        answer: 2, knowledge: "重力定义", relatedCard: "A01"
      },
      {
        id: "Q_F_022", domain: "力", difficulty: "basic",
        question: "重力的方向总是？",
        options: ["A. 垂直于地面", "B. 竖直向下", "C. 指向地心", "D. 水平方向"],
        answer: 1, knowledge: "重力方向", relatedCard: "A01"
      },
      {
        id: "Q_F_023", domain: "力", difficulty: "basic",
        question: "建筑工人常用什么来检查墙体是否竖直？",
        options: ["A. 刻度尺", "B. 水平仪", "C. 重垂线", "D. 量角器"],
        answer: 2, knowledge: "重力方向应用", relatedCard: "A01"
      },
      {
        id: "Q_F_024", domain: "力", difficulty: "basic",
        question: "物体所受重力的等效作用点叫做？",
        options: ["A. 几何中心", "B. 重心", "C. 最重点", "D. 表面中心"],
        answer: 1, knowledge: "重心", relatedCard: "A01"
      },
      {
        id: "Q_F_025", domain: "力", difficulty: "basic",
        question: "太空中宇航员的质量和地球上相比？",
        options: ["A. 变大", "B. 变小", "C. 不变", "D. 为零"],
        answer: 2, knowledge: "质量不变", relatedCard: "S01"
      },
      {
        id: "Q_F_026", domain: "力", difficulty: "basic",
        question: "牛顿第一定律也称为？",
        options: ["A. 万有引力定律", "B. 惯性定律", "C. 加速度定律", "D. 反作用定律"],
        answer: 1, knowledge: "牛顿第一定律", relatedCard: "A02"
      },
      {
        id: "Q_F_027", domain: "力", difficulty: "basic",
        question: "一切物体都有保持原来运动状态不变的性质叫做？",
        options: ["A. 弹性", "B. 惯性", "C. 重力", "D. 摩擦力"],
        answer: 1, knowledge: "惯性定义", relatedCard: "A02"
      },
      {
        id: "Q_F_028", domain: "力", difficulty: "basic",
        question: "关于惯性，下列说法正确的是？",
        options: ["A. 速度越大惯性越大", "B. 质量越大惯性越大", "C. 静止物体没有惯性", "D. 运动物体才有惯性"],
        answer: 1, knowledge: "惯性只与质量有关", relatedCard: "A02"
      },
      {
        id: "Q_F_029", domain: "力", difficulty: "basic",
        question: "行驶中汽车突然刹车，乘客向前倾说明了？",
        options: ["A. 力改变形状", "B. 物体具有惯性", "C. 摩擦力作用", "D. 力维持运动"],
        answer: 1, knowledge: "惯性现象", relatedCard: "A02"
      },
      {
        id: "Q_F_030", domain: "力", difficulty: "basic",
        question: "物体在两个力作用下保持静止或匀速直线运动，这两个力是？",
        options: ["A. 合力", "B. 平衡力", "C. 反作用力", "D. 重力"],
        answer: 1, knowledge: "二力平衡", relatedCard: "S04"
      },
      {
        id: "Q_F_031", domain: "力", difficulty: "basic",
        question: "二力平衡的条件不包括？",
        options: ["A. 大小相等", "B. 方向相同", "C. 作用在同一直线", "D. 作用在同一物体"],
        answer: 1, knowledge: "二力平衡条件", relatedCard: "S04"
      },
      {
        id: "Q_F_032", domain: "力", difficulty: "basic",
        question: "两个相互接触的物体发生相对运动时在接触面上产生的阻碍力叫？",
        options: ["A. 弹力", "B. 重力", "C. 摩擦力", "D. 浮力"],
        answer: 2, knowledge: "摩擦力定义", relatedCard: "S04"
      },
      {
        id: "Q_F_033", domain: "力", difficulty: "basic",
        question: "影响滑动摩擦力大小的因素是？",
        options: ["A. 接触面积和速度", "B. 压力和接触面粗糙程度", "C. 物体质量", "D. 物体形状"],
        answer: 1, knowledge: "摩擦力影响因素", relatedCard: "S04"
      },
      {
        id: "Q_F_034", domain: "力", difficulty: "basic",
        question: "下列哪种方法可以减小摩擦力？",
        options: ["A. 增大压力", "B. 使接触面更粗糙", "C. 加润滑油", "D. 增大接触面积"],
        answer: 2, knowledge: "减小摩擦", relatedCard: "S04"
      },
      {
        id: "Q_F_035", domain: "力", difficulty: "basic",
        question: "体操运动员上场前在手上涂镁粉，目的是？",
        options: ["A. 减小摩擦力", "B. 增大摩擦力", "C. 美观", "D. 消毒"],
        answer: 1, knowledge: "增大摩擦", relatedCard: "S04"
      },
      {
        id: "Q_F_036", domain: "力", difficulty: "basic",
        question: "物体所受压力与受力面积之比叫做？",
        options: ["A. 密度", "B. 压强", "C. 重力", "D. 摩擦力"],
        answer: 1, knowledge: "压强定义", relatedCard: "A03"
      },
      {
        id: "Q_F_037", domain: "力", difficulty: "basic",
        question: "压强的国际单位是？",
        options: ["A. 牛顿", "B. 帕斯卡", "C. 焦耳", "D. 瓦特"],
        answer: 1, knowledge: "压强单位", relatedCard: "A03"
      },
      {
        id: "Q_F_038", domain: "力", difficulty: "basic",
        question: "减小受力面积可以？",
        options: ["A. 减小压强", "B. 增大压强", "C. 不改变压强", "D. 减小压力"],
        answer: 1, knowledge: "增大压强", relatedCard: "A03"
      },
      {
        id: "Q_F_039", domain: "力", difficulty: "basic",
        question: "书包带做得比较宽，目的是？",
        options: ["A. 减小压强", "B. 增大压强", "C. 美观", "D. 减轻重量"],
        answer: 0, knowledge: "减小压强", relatedCard: "A03"
      },
      {
        id: "Q_F_040", domain: "力", difficulty: "basic",
        question: "菜刀的刀刃磨得很薄，目的是？",
        options: ["A. 减小压力", "B. 增大压强", "C. 减小压强", "D. 省力"],
        answer: 1, knowledge: "增大压强", relatedCard: "A03"
      },
      {
        id: "Q_F_041", domain: "力", difficulty: "basic",
        question: "液体内部压强随深度增加而？",
        options: ["A. 减小", "B. 不变", "C. 增大", "D. 先增后减"],
        answer: 2, knowledge: "液体压强与深度", relatedCard: "A03"
      },
      {
        id: "Q_F_042", domain: "力", difficulty: "basic",
        question: "连通器内同种液体静止时各容器液面？",
        options: ["A. 随容器形状不同", "B. 相平", "C. 左高右低", "D. 中间高两边低"],
        answer: 1, knowledge: "连通器原理", relatedCard: "A03"
      },
      {
        id: "Q_F_043", domain: "力", difficulty: "basic",
        question: "下列利用了连通器原理的是？",
        options: ["A. 吸管", "B. 茶壶", "C. 注射器", "D. 弹簧"],
        answer: 1, knowledge: "连通器应用", relatedCard: "A03"
      },
      {
        id: "Q_F_044", domain: "力", difficulty: "basic",
        question: "大气压强随海拔高度增加而？",
        options: ["A. 增大", "B. 减小", "C. 不变", "D. 先减后增"],
        answer: 1, knowledge: "大气压与高度", relatedCard: "A03"
      },
      {
        id: "Q_F_045", domain: "力", difficulty: "basic",
        question: "首先测出大气压值的科学家是？",
        options: ["A. 牛顿", "B. 伽利略", "C. 托里拆利", "D. 阿基米德"],
        answer: 2, knowledge: "托里拆利实验", relatedCard: "A03"
      },
      {
        id: "Q_F_046", domain: "力", difficulty: "basic",
        question: "用吸管喝饮料饮料上升是因为？",
        options: ["A. 吸力", "B. 大气压的作用", "C. 重力", "D. 饮料自己上升"],
        answer: 1, knowledge: "大气压应用", relatedCard: "A03"
      },
      {
        id: "Q_F_047", domain: "力", difficulty: "basic",
        question: "火车站台设有安全线是因为列车驶过时？",
        options: ["A. 靠近处空气流速大压强小", "B. 靠近处空气流速小压强大", "C. 列车有磁力", "D. 列车声音大"],
        answer: 0, knowledge: "流体压强与流速", relatedCard: "A03"
      },
      {
        id: "Q_F_048", domain: "力", difficulty: "basic",
        question: "飞机升力利用了什么原理？",
        options: ["A. 大气压", "B. 流体压强与流速关系", "C. 浮力", "D. 反冲力"],
        answer: 1, knowledge: "飞机升力", relatedCard: "A03"
      },
      {
        id: "Q_F_049", domain: "力", difficulty: "basic",
        question: "浸在液体中的物体受到的向上托的力叫做？",
        options: ["A. 重力", "B. 浮力", "C. 弹力", "D. 摩擦力"],
        answer: 1, knowledge: "浮力定义", relatedCard: "C06"
      },
      {
        id: "Q_F_050", domain: "力", difficulty: "basic",
        question: "浮力的方向总是？",
        options: ["A. 水平方向", "B. 竖直向下", "C. 竖直向上", "D. 与运动方向相同"],
        answer: 2, knowledge: "浮力方向", relatedCard: "C06"
      },
      {
        id: "Q_F_051", domain: "力", difficulty: "basic",
        question: "阿基米德原理指出浸在液体中的物体所受浮力等于？",
        options: ["A. 物体重力", "B. 物体排开液体的重力", "C. 液体总重力", "D. 物体体积"],
        answer: 1, knowledge: "阿基米德原理", relatedCard: "C06"
      },
      {
        id: "Q_F_052", domain: "力", difficulty: "basic",
        question: "物体在液体中的浮沉取决于？",
        options: ["A. 物体质量", "B. 浮力与重力的大小关系", "C. 液体温度", "D. 物体颜色"],
        answer: 1, knowledge: "浮沉条件", relatedCard: "C06"
      },
      {
        id: "Q_F_053", domain: "力", difficulty: "basic",
        question: "重力大于浮力时物体将？",
        options: ["A. 上浮", "B. 悬浮", "C. 下沉", "D. 漂浮"],
        answer: 2, knowledge: "下沉", relatedCard: "C06"
      },
      {
        id: "Q_F_054", domain: "力", difficulty: "basic",
        question: "轮船从河里驶入海里将会？",
        options: ["A. 下沉一些", "B. 浮起一些", "C. 不变", "D. 先沉后浮"],
        answer: 1, knowledge: "浮力不变海水密度大", relatedCard: "C06"
      },
      {
        id: "Q_F_055", domain: "力", difficulty: "basic",
        question: "潜水艇是靠改变什么来实现上浮下潜的？",
        options: ["A. 体积", "B. 自身重力", "C. 形状", "D. 速度"],
        answer: 1, knowledge: "潜水艇原理", relatedCard: "C06"
      },
      {
        id: "Q_F_056", domain: "力", difficulty: "basic",
        question: "物理学中力和物体在力的方向上移动的距离的乘积叫做？",
        options: ["A. 功率", "B. 功", "C. 能量", "D. 冲量"],
        answer: 1, knowledge: "功的定义", relatedCard: "A08"
      },
      {
        id: "Q_F_057", domain: "力", difficulty: "basic",
        question: "以下情况中力对物体做功的是？",
        options: ["A. 用力推车但车没动", "B. 举重运动员举着杠铃不动", "C. 人提着水桶沿水平路面走", "D. 起重机将货物向上吊起"],
        answer: 3, knowledge: "判断是否做功", relatedCard: "A08"
      },
      {
        id: "Q_F_058", domain: "力", difficulty: "basic",
        question: "功的国际单位是？",
        options: ["A. 牛顿", "B. 帕斯卡", "C. 焦耳", "D. 瓦特"],
        answer: 2, knowledge: "功的单位", relatedCard: "A08"
      },
      {
        id: "Q_F_059", domain: "力", difficulty: "basic",
        question: "表示做功快慢的物理量是？",
        options: ["A. 功", "B. 功率", "C. 效率", "D. 能量"],
        answer: 1, knowledge: "功率定义", relatedCard: "A08"
      },
      {
        id: "Q_F_060", domain: "力", difficulty: "basic",
        question: "功率的国际单位是？",
        options: ["A. 焦耳", "B. 牛顿", "C. 瓦特", "D. 帕斯卡"],
        answer: 2, knowledge: "功率单位", relatedCard: "A08"
      },
      {
        id: "Q_F_061", domain: "力", difficulty: "basic",
        question: "物体由于运动而具有的能叫做？",
        options: ["A. 重力势能", "B. 弹性势能", "C. 动能", "D. 内能"],
        answer: 2, knowledge: "动能定义", relatedCard: "A06"
      },
      {
        id: "Q_F_062", domain: "力", difficulty: "basic",
        question: "影响动能大小的因素是？",
        options: ["A. 质量和高度", "B. 质量和速度", "C. 高度和速度", "D. 质量和形状"],
        answer: 1, knowledge: "动能因素", relatedCard: "A06"
      },
      {
        id: "Q_F_063", domain: "力", difficulty: "basic",
        question: "物体由于被举高而具有的能叫做？",
        options: ["A. 动能", "B. 重力势能", "C. 弹性势能", "D. 内能"],
        answer: 1, knowledge: "重力势能", relatedCard: "A05"
      },
      {
        id: "Q_F_064", domain: "力", difficulty: "basic",
        question: "物体由于发生弹性形变而具有的能叫做？",
        options: ["A. 动能", "B. 重力势能", "C. 弹性势能", "D. 内能"],
        answer: 2, knowledge: "弹性势能", relatedCard: "S06"
      },
      {
        id: "Q_F_065", domain: "力", difficulty: "basic",
        question: "骑自行车下坡时速度越来越快，这是因为？",
        options: ["A. 动能转化为重力势能", "B. 重力势能转化为动能", "C. 机械能增加", "D. 摩擦力减小"],
        answer: 1, knowledge: "动能势能转化", relatedCard: "A05"
      },
      {
        id: "Q_F_066", domain: "力", difficulty: "basic",
        question: "机械能包括？",
        options: ["A. 只有动能", "B. 只有势能", "C. 动能和势能", "D. 内能和动能"],
        answer: 2, knowledge: "机械能组成", relatedCard: "A05"
      },
      {
        id: "Q_F_067", domain: "力", difficulty: "basic",
        question: "一根硬棒在力的作用下能绕着固定点转动，叫做？",
        options: ["A. 滑轮", "B. 斜面", "C. 杠杆", "D. 轮轴"],
        answer: 2, knowledge: "杠杆定义", relatedCard: "A04"
      },
      {
        id: "Q_F_068", domain: "力", difficulty: "basic",
        question: "杠杆绕着转动的固定点叫做？",
        options: ["A. 动力点", "B. 阻力点", "C. 支点", "D. 重心"],
        answer: 2, knowledge: "支点", relatedCard: "A04"
      },
      {
        id: "Q_F_069", domain: "力", difficulty: "basic",
        question: "关于定滑轮的特点下列说法正确的是？",
        options: ["A. 省力", "B. 费力", "C. 不省力但改变力的方向", "D. 既省力又改变方向"],
        answer: 2, knowledge: "定滑轮", relatedCard: "A04"
      },
      {
        id: "Q_F_070", domain: "力", difficulty: "basic",
        question: "关于动滑轮的特点下列说法正确的是？",
        options: ["A. 省力但费距离", "B. 费力但省距离", "C. 不省力也不费距离", "D. 既省力又省距离"],
        answer: 0, knowledge: "动滑轮", relatedCard: "A04"
      },
      {
        id: "Q_F_071", domain: "力", difficulty: "basic",
        question: "下列工具中属于省力杠杆的是？",
        options: ["A. 镊子", "B. 钓鱼竿", "C. 开瓶器", "D. 筷子"],
        answer: 2, knowledge: "省力杠杆", relatedCard: "A04"
      },
      {
        id: "Q_F_072", domain: "力", difficulty: "basic",
        question: "下列工具中属于费力杠杆的是？",
        options: ["A. 羊角锤", "B. 筷子", "C. 扳手", "D. 钢丝钳"],
        answer: 1, knowledge: "费力杠杆", relatedCard: "A04"
      },
      {
        id: "Q_F_073", domain: "力", difficulty: "basic",
        question: "使用任何机械都不能省？",
        options: ["A. 力", "B. 距离", "C. 功", "D. 时间"],
        answer: 2, knowledge: "功的原理", relatedCard: "A08"
      },
      {
        id: "Q_F_074", domain: "力", difficulty: "advanced",
        question: "关于误差和错误的说法正确的是？",
        options: ["A. 误差就是错误", "B. 误差可以避免", "C. 错误可避免误差不能避免", "D. 误差和错误都可避免"],
        answer: 2, knowledge: "误差与错误", relatedCard: "A01"
      },
      {
        id: "Q_F_075", domain: "力", difficulty: "advanced",
        question: "坐在火车上的人看到窗外树木向西运动，火车运动方向是？",
        options: ["A. 一定向东", "B. 一定向西", "C. 可能向东也可能向西", "D. 一定静止"],
        answer: 0, knowledge: "运动相对性", relatedCard: "A02"
      },
      {
        id: "Q_F_076", domain: "力", difficulty: "advanced",
        question: "下列对力的认识错误的是？",
        options: ["A. 力不能脱离物体而存在", "B. 不接触的两个物体也可以产生力", "C. 一个物体也能产生力", "D. 力的作用是相互的"],
        answer: 2, knowledge: "力的概念辨析", relatedCard: "S05"
      },
      {
        id: "Q_F_077", domain: "力", difficulty: "advanced",
        question: "书放在水平桌面上书对桌面的压力和桌面对书的支持力是一对？",
        options: ["A. 平衡力", "B. 作用力与反作用力", "C. 都不是", "D. 无法确定"],
        answer: 1, knowledge: "相互作用力", relatedCard: "S05"
      },
      {
        id: "Q_F_078", domain: "力", difficulty: "advanced",
        question: "关于二力平衡和作用力反作用力下列说法正确的是？",
        options: ["A. 两者是一样的", "B. 平衡力作用在同一物体上反作用力在不同物体上", "C. 反作用力作用在同一物体上", "D. 平衡力一定是同种性质的力"],
        answer: 1, knowledge: "平衡力与反作用力区别", relatedCard: "S04"
      },
      {
        id: "Q_F_079", domain: "力", difficulty: "advanced",
        question: "摩擦力总是阻碍物体运动，这种说法对吗？",
        options: ["A. 对", "B. 不对摩擦力也可以作为动力", "C. 不对摩擦力不阻碍运动", "D. 对但有时可以忽略"],
        answer: 1, knowledge: "摩擦力双重性", relatedCard: "S04"
      },
      {
        id: "Q_F_080", domain: "力", difficulty: "advanced",
        question: "飞机投放救灾物资过程中(匀速飞行)飞机的？",
        options: ["A. 动能不变势能不变", "B. 动能减小势能减小", "C. 动能增大势能减小", "D. 动能减小势能增大"],
        answer: 1, knowledge: "质量减小", relatedCard: "A06"
      },
      {
        id: "Q_F_081", domain: "力", difficulty: "advanced",
        question: "下列关于惯性的说法正确的是？",
        options: ["A. 物体运动速度越大惯性越大", "B. 物体静止时没有惯性", "C. 一切物体在任何情况下都有惯性", "D. 物体受力时惯性会改变"],
        answer: 2, knowledge: "惯性是固有属性", relatedCard: "A02"
      },
      {
        id: "Q_F_082", domain: "力", difficulty: "advanced",
        question: "关于压力与重力的关系下列说法正确的是？",
        options: ["A. 压力一定等于重力", "B. 压力就是重力", "C. 压力不一定等于重力", "D. 压力方向总是竖直向下"],
        answer: 2, knowledge: "压力与重力区别", relatedCard: "A03"
      },
      {
        id: "Q_F_083", domain: "力", difficulty: "advanced",
        question: "以下现象不能说明大气压存在的是？",
        options: ["A. 堵上茶壶盖小孔水不容易倒出", "B. 用吸管吸饮料", "C. 用抽水机把水从低处抽到高处", "D. 船闸使船顺利通过"],
        answer: 3, knowledge: "船闸=连通器", relatedCard: "A03"
      },
      {
        id: "Q_F_084", domain: "力", difficulty: "advanced",
        question: "关于浮力的说法错误的是？",
        options: ["A. 浮力方向竖直向上", "B. 浮力大小等于排开液体重力", "C. 沉底的物体不受浮力", "D. 浮力产生原因是压力差"],
        answer: 2, knowledge: "沉底物体也受浮力", relatedCard: "C06"
      },
      {
        id: "Q_F_085", domain: "力", difficulty: "advanced",
        question: "下列说法正确的是？",
        options: ["A. 做功多的机械功率一定大", "B. 功率大的机械做功一定快", "C. 做功时间短的机械功率一定大", "D. 功率小的机械一定不做功"],
        answer: 1, knowledge: "功率概念", relatedCard: "A08"
      },
      {
        id: "Q_F_086", domain: "力", difficulty: "advanced",
        question: "从空中匀速降落的跳伞运动员，他的？",
        options: ["A. 动能增大势能减小", "B. 动能不变势能减小", "C. 动能减小势能减小", "D. 动能增大势能不变"],
        answer: 1, knowledge: "匀速时动能不变", relatedCard: "A06"
      },
      {
        id: "Q_F_087", domain: "力", difficulty: "advanced",
        question: "使用下列哪种机械可以省力？",
        options: ["A. 定滑轮", "B. 动滑轮", "C. 等臂杠杆", "D. 天平"],
        answer: 1, knowledge: "动滑轮省力", relatedCard: "A04"
      },
      {
        id: "Q_F_088", domain: "力", difficulty: "advanced",
        question: "关于机械效率的说法中正确的是？",
        options: ["A. 机械效率可以等于100%", "B. 机械效率总小于1", "C. 省力的机械效率高", "D. 功率大的机械效率高"],
        answer: 1, knowledge: "机械效率<1", relatedCard: "A04"
      },
      {
        id: "Q_F_089", domain: "力", difficulty: "advanced",
        question: "以下说法正确的是？",
        options: ["A. 使用机械都可以省力", "B. 使用机械都可以省功", "C. 使用机械都不能省功", "D. 使用机械有时可以省功"],
        answer: 2, knowledge: "功的原理", relatedCard: "A08"
      },
      {
        id: "Q_F_090", domain: "力", difficulty: "advanced",
        question: "在水平路面上匀速行驶的汽车下列说法正确的是？",
        options: ["A. 重力做了功", "B. 支持力做了功", "C. 牵引力做了功", "D. 没有力做功"],
        answer: 2, knowledge: "判断做功", relatedCard: "A08"
      },
      {
        id: "Q_F_091", domain: "力", difficulty: "advanced",
        question: "用弹簧测力计拉着木块在水平面上匀速运动弹簧测力计示数为3N则摩擦力为？",
        options: ["A. 10N", "B. 7N", "C. 3N", "D. 0N"],
        answer: 2, knowledge: "匀速时F=f", relatedCard: "S04"
      },
      {
        id: "Q_F_092", domain: "力", difficulty: "advanced",
        question: "小明用水平力推箱子但没有推动，这是因为？",
        options: ["A. 推力小于地面对箱子的摩擦力", "B. 推力等于地面对箱子的摩擦力", "C. 箱子太重了", "D. 小明力气不够大"],
        answer: 1, knowledge: "二力平衡", relatedCard: "S04"
      },
      {
        id: "Q_F_093", domain: "力", difficulty: "advanced",
        question: "下列哪种现象与大气压无关？",
        options: ["A. 钢笔吸墨水", "B. 茶壶盖上的小孔", "C. 利用吸管喝饮料", "D. 用吸尘器除尘"],
        answer: 3, knowledge: "吸尘器利用气流", relatedCard: "A03"
      },
      {
        id: "Q_F_094", domain: "力", difficulty: "advanced",
        question: "将鸡蛋放入水中会下沉，向水中加盐后鸡蛋逐渐上浮这是因为？",
        options: ["A. 鸡蛋变轻了", "B. 盐水密度大浮力大", "C. 鸡蛋体积变小", "D. 盐水温度高"],
        answer: 1, knowledge: "加盐增大密度", relatedCard: "C06"
      },
      {
        id: "Q_F_095", domain: "力", difficulty: "advanced",
        question: "关于做功下列说法正确的是？",
        options: ["A. 只要有力作用就一定做了功", "B. 只要物体移动了就一定做了功", "C. 有力作用在物体上且物体在力的方向上移动了距离力才做功", "D. 有力有距离就一定做功"],
        answer: 2, knowledge: "做功条件", relatedCard: "A08"
      },
      {
        id: "Q_F_096", domain: "力", difficulty: "advanced",
        question: "被拉开的弓具有什么能？",
        options: ["A. 动能", "B. 重力势能", "C. 弹性势能", "D. 内能"],
        answer: 2, knowledge: "弹性势能", relatedCard: "S06"
      },
      {
        id: "Q_F_097", domain: "力", difficulty: "advanced",
        question: "小船顺流而下，相对于什么来说小船是运动的？",
        options: ["A. 船上的船夫", "B. 河岸", "C. 河水", "D. 船上的货物"],
        answer: 1, knowledge: "运动相对性", relatedCard: "A02"
      },
      {
        id: "Q_F_098", domain: "力", difficulty: "advanced",
        question: "鸡蛋碰石头鸡蛋破而石头完好，鸡蛋对石头的作用力和石头对鸡蛋的作用力？",
        options: ["A. 前者大", "B. 后者大", "C. 一样大", "D. 无法比较"],
        answer: 2, knowledge: "相互作用力相等", relatedCard: "S05"
      },
      {
        id: "Q_F_099", domain: "力", difficulty: "advanced",
        question: "下列哪种方法可以增大压强？",
        options: ["A. 铁轨铺在枕木上", "B. 书包带加宽", "C. 图钉尖做得很尖", "D. 载重汽车多装轮子"],
        answer: 2, knowledge: "减小受力面积", relatedCard: "A03"
      },
      {
        id: "Q_F_100", domain: "力", difficulty: "advanced",
        question: "关于参照物的选择下列说法正确的是？",
        options: ["A. 只能选静止的物体", "B. 只能选运动的物体", "C. 不能选研究对象本身", "D. 必须选地面"],
        answer: 2, knowledge: "参照物选择", relatedCard: "A02"
      },
      {
        id: "Q_F_101", domain: "力", difficulty: "advanced",
        question: "用绳子系水桶从井中提水手受到向下的拉力，施力物体是？",
        options: ["A. 水桶", "B. 绳子", "C. 地球", "D. 手"],
        answer: 1, knowledge: "施力物体分析", relatedCard: "S05"
      },
      {
        id: "Q_F_102", domain: "力", difficulty: "advanced",
        question: "关于功率和机械效率，下列说法正确的是？",
        options: ["A. 功率大的机械效率一定高", "B. 效率高的机械功率一定大", "C. 功率和效率没有必然联系", "D. 做相同的功效率高的功率大"],
        answer: 2, knowledge: "功率效率无关", relatedCard: "A08"
      },
      {
        id: "Q_F_103", domain: "力", difficulty: "advanced",
        question: "篮球从高处落下每次反弹高度比上一次低，因为？",
        options: ["A. 每次都有能量损失", "B. 篮球质量越来越小", "C. 空气阻力越来越大", "D. 地球引力变小"],
        answer: 0, knowledge: "机械能不守恒", relatedCard: "A06"
      },
      {
        id: "Q_F_104", domain: "力", difficulty: "advanced",
        question: "下列情境中人对物体做了功的是？",
        options: ["A. 背着书包在水平路面行走", "B. 用力推汽车但没推动", "C. 把一桶水从一楼提到三楼", "D. 举着哑铃停留在空中"],
        answer: 2, knowledge: "做功判断", relatedCard: "A08"
      },
      {
        id: "Q_F_105", domain: "力", difficulty: "advanced",
        question: "推土机安装宽大履带是为了？",
        options: ["A. 增大压强", "B. 减小压强", "C. 增大摩擦", "D. 减小摩擦"],
        answer: 1, knowledge: "减小压强", relatedCard: "A03"
      },
      {
        id: "Q_F_106", domain: "力", difficulty: "advanced",
        question: "关于力下列说法正确的是？",
        options: ["A. 只有一个物体也能产生力", "B. 两个物体不接触就一定没有力", "C. 力的作用效果与力的大小方向作用点有关", "D. 力的大小相同作用效果一定相同"],
        answer: 2, knowledge: "力的三要素", relatedCard: "S05"
      },
      {
        id: "Q_F_107", domain: "力", difficulty: "advanced",
        question: "足球比赛中用头顶球使球的方向改变说明力可以？",
        options: ["A. 改变物体形状", "B. 改变物体运动状态", "C. 使物体发生形变", "D. 使物体质量改变"],
        answer: 1, knowledge: "力改变运动状态", relatedCard: "S05"
      },
      {
        id: "Q_F_108", domain: "力", difficulty: "advanced",
        question: "用50N的力水平拉木箱前进2m，拉力做功？",
        options: ["A. 0J", "B. 25J", "C. 100J", "D. 50J"],
        answer: 2, knowledge: "W=Fs", relatedCard: "A08"
      },
      {
        id: "Q_F_109", domain: "力", difficulty: "advanced",
        question: "下列哪种方法不能减小压强？",
        options: ["A. 增大受力面积", "B. 减小压力", "C. 用更锋利的刀", "D. 用宽大的底座"],
        answer: 2, knowledge: "C是增大压强", relatedCard: "A03"
      },
      {
        id: "Q_F_110", domain: "力", difficulty: "advanced",
        question: "杆秤是一种什么类型的杠杆？",
        options: ["A. 省力杠杆", "B. 费力杠杆", "C. 等臂杠杆", "D. 不是杠杆"],
        answer: 0, knowledge: "杆秤=省力杠杆", relatedCard: "A04"
      },
      {
        id: "Q_F_111", domain: "力", difficulty: "advanced",
        question: "用手拍打衣服可以去掉灰尘利用了？",
        options: ["A. 灰尘有惯性", "B. 衣服有惯性", "C. 手有惯性", "D. 灰尘受重力"],
        answer: 0, knowledge: "惯性应用", relatedCard: "A02"
      },
      {
        id: "Q_F_112", domain: "力", difficulty: "advanced",
        question: "使用简易气压计从一楼走到五楼玻璃管中水柱会？",
        options: ["A. 上升", "B. 下降", "C. 不变", "D. 先升后降"],
        answer: 0, knowledge: "大气压随高度减小", relatedCard: "A03"
      },
      {
        id: "Q_F_113", domain: "力", difficulty: "advanced",
        question: "下列实例中为了减小压强的是？",
        options: ["A. 注射器针头做得很尖", "B. 压路机碾子质量很大", "C. 载重汽车装有很多车轮", "D. 冰刀做得很薄"],
        answer: 2, knowledge: "增大受力面积", relatedCard: "A03"
      },
      {
        id: "Q_F_114", domain: "力", difficulty: "advanced",
        question: "同一艘轮船从河里开到海里，浮力的变化是？",
        options: ["A. 变大", "B. 变小", "C. 不变", "D. 无法确定"],
        answer: 2, knowledge: "浮力始终=重力", relatedCard: "C06"
      },
      {
        id: "Q_F_115", domain: "力", difficulty: "advanced",
        question: "在光滑斜面上滑下的小球，下列说法正确的是？",
        options: ["A. 动能增大重力势能减小机械能不变", "B. 动能增大重力势能减小机械能减小", "C. 动能不变重力势能减小", "D. 动能减小重力势能增大"],
        answer: 0, knowledge: "光滑=机械能守恒", relatedCard: "A05"
      },
      {
        id: "Q_F_116", domain: "力", difficulty: "advanced",
        question: "关于力与运动的关系下列说法正确的是？",
        options: ["A. 物体受力就会运动", "B. 物体不受力就会停止", "C. 力是改变运动状态的原因", "D. 力是维持运动的原因"],
        answer: 2, knowledge: "力与运动关系", relatedCard: "A02"
      },
      {
        id: "Q_F_117", domain: "力", difficulty: "advanced",
        question: "铅球被推出后在空中继续飞行这是因为？",
        options: ["A. 手对铅球有力的作用", "B. 铅球受到向前的力", "C. 铅球具有惯性", "D. 铅球受重力"],
        answer: 2, knowledge: "惯性", relatedCard: "A02"
      },
      {
        id: "Q_F_118", domain: "力", difficulty: "advanced",
        question: "小明用刻度尺测出物体长度为172.5mm，最接近这个数值的是？",
        options: ["A. 物理课本厚度", "B. 一支铅笔长度", "C. 黑板长度", "D. 饮水杯高度"],
        answer: 3, knowledge: "长度估测", relatedCard: "A01"
      },
      {
        id: "Q_F_119", domain: "力", difficulty: "advanced",
        question: "钢丝钳是常用工具，下列有关钢丝钳说法错误的是？",
        options: ["A. 钳口很薄是为了增大压强", "B. 钳柄上的花纹是为了增大摩擦", "C. 钢丝钳是省力杠杆", "D. 钢丝钳是费力杠杆"],
        answer: 3, knowledge: "钢丝钳=省力杠杆", relatedCard: "A04"
      },
      {
        id: "Q_F_120", domain: "力", difficulty: "advanced",
        question: "关于重力的方向下列说法正确的是？",
        options: ["A. 竖直向下", "B. 垂直向下", "C. 指向地心", "D. 总是垂直于水平面"],
        answer: 0, knowledge: "重力方向", relatedCard: "A01"
      },
      {
        id: "Q_F_121", domain: "力", difficulty: "advanced",
        question: "下列做法能增大摩擦力的是？",
        options: ["A. 在自行车转轴处加润滑油", "B. 行李箱下安装轮子", "C. 百米赛跑穿钉鞋", "D. 气垫船形成气垫"],
        answer: 2, knowledge: "增大摩擦", relatedCard: "S04"
      },
      {
        id: "Q_F_122", domain: "力", difficulty: "advanced",
        question: "沿水平方向匀速飞行的飞机空投救灾物资的过程中飞机？",
        options: ["A. 动能不变势能不变", "B. 动能减小势能减小", "C. 动能增大势能减小", "D. 动能减小势能增大"],
        answer: 1, knowledge: "质量减小", relatedCard: "A06"
      },
      {
        id: "Q_F_123", domain: "力", difficulty: "advanced",
        question: "小明用100N的力踢足球，球在地面上滚动了20m后停下。小明踢球的力对球做的功？",
        options: ["A. 2000J", "B. 0J", "C. 条件不足无法确定", "D. 200J"],
        answer: 2, knowledge: "球滚动时没有力作用", relatedCard: "A08"
      },
      {
        id: "Q_F_124", domain: "力", difficulty: "advanced",
        question: "茶杯放在水平桌面上，下列属于平衡力的是？",
        options: ["A. 杯的重力和杯对桌的压力", "B. 杯的重力和桌对杯的支持力", "C. 杯对桌的压力和桌对杯的支持力", "D. 杯的重力和桌的重力"],
        answer: 1, knowledge: "平衡力判断", relatedCard: "S04"
      },
      {
        id: "Q_F_125", domain: "力", difficulty: "challenge",
        question: "一辆大货车和一辆小轿车以相同速度并排行驶，关于惯性下列说法正确的是？",
        options: ["A. 速度相同惯性也相同", "B. 大货车质量大惯性大", "C. 小轿车速度快惯性小", "D. 并排行驶说明惯性相同"],
        answer: 1, knowledge: "惯性只与质量有关", relatedCard: "A02"
      },
      {
        id: "Q_F_126", domain: "力", difficulty: "challenge",
        question: "物体在平衡力作用下以下说法正确的是？",
        options: ["A. 一定处于静止状态", "B. 一定处于匀速直线运动状态", "C. 一定保持静止或匀速直线运动状态", "D. 运动状态一定会改变"],
        answer: 2, knowledge: "平衡力下运动状态不变", relatedCard: "S04"
      },
      {
        id: "Q_F_127", domain: "力", difficulty: "challenge",
        question: "关于浮力的说法正确的是？",
        options: ["A. 物体浸没在水中越深受的浮力越大", "B. 重10N的物体放入盛满水的容器中溢出5N的水则物体受到的浮力为5N", "C. 密度大的物体浮力一定大", "D. 重力相等的铁块和铝块浸没在水中铁块浮力大"],
        answer: 1, knowledge: "阿基米德原理", relatedCard: "C06"
      },
      {
        id: "Q_F_128", domain: "力", difficulty: "challenge",
        question: "一个人先后用同样大小的力沿水平方向拉木箱分别在光滑和粗糙两种不同的水平面上前进相同距离比较两次做的功？",
        options: ["A. 粗糙面上做功多", "B. 光滑面上做功多", "C. 两次做功一样多", "D. 无法比较"],
        answer: 2, knowledge: "W=Fs条件相同", relatedCard: "A08"
      },
      {
        id: "Q_F_129", domain: "力", difficulty: "challenge",
        question: "关于机械效率的叙述中正确的是？",
        options: ["A. 越省力的机械效率越高", "B. 有用功越多效率越高", "C. 额外功越少效率越高", "D. 做功越快效率越高"],
        answer: 2, knowledge: "效率=有用功/总功", relatedCard: "A08"
      },
      {
        id: "Q_F_130", domain: "力", difficulty: "challenge",
        question: "下列说法正确的是？",
        options: ["A. 相互接触的物体间一定有弹力", "B. 产生弹力的物体一定发生了弹性形变", "C. 只有弹簧才能产生弹力", "D. 弹力的大小与形变程度无关"],
        answer: 1, knowledge: "弹力产生条件", relatedCard: "S06"
      },
      {
        id: "Q_F_131", domain: "力", difficulty: "challenge",
        question: "把一小球放入盛满酒精的杯中沉入杯底溢出8g酒精；放入盛满水的杯中小球漂浮。下列判断正确的是？",
        options: ["A. 小球质量一定等于8g", "B. 小球质量一定大于8g", "C. 无法判断", "D. 小球质量一定小于8g"],
        answer: 1, knowledge: "漂浮时浮力=重力", relatedCard: "C06"
      },
      {
        id: "Q_F_132", domain: "力", difficulty: "challenge",
        question: "将质量分布均匀的杠杆从中点支起在两侧各挂不同数量钩码使杠杆平衡。下列说法正确的是？",
        options: ["A. 杠杆平衡时两侧钩码重力一定相等", "B. 杠杆平衡时两侧力臂一定相等", "C. 杠杆平衡时动力×动力臂=阻力×阻力臂", "D. 杠杆一定在水平位置平衡"],
        answer: 2, knowledge: "杠杆平衡条件", relatedCard: "A04"
      },
      {
        id: "Q_F_133", domain: "力", difficulty: "challenge",
        question: "甲、乙两车同时同地向东做匀速直线运动甲的速度大于乙，以乙车为参照物甲车向什么方向运动？",
        options: ["A. 东", "B. 西", "C. 静止", "D. 无法确定"],
        answer: 0, knowledge: "相对运动", relatedCard: "A02"
      },
      {
        id: "Q_F_134", domain: "力", difficulty: "challenge",
        question: "跳水运动员从跳板起跳后上升至最高点这一过程中？",
        options: ["A. 动能转化为重力势能", "B. 重力势能转化为动能", "C. 动能和势能都增大", "D. 动能和势能都减小"],
        answer: 0, knowledge: "上升时动能→势能", relatedCard: "A05"
      },
      {
        id: "Q_F_135", domain: "力", difficulty: "challenge",
        question: "用滑轮组匀速提升重物时提高滑轮组机械效率的方法有？",
        options: ["A. 减小提升高度", "B. 增大提升速度", "C. 减小动滑轮重力", "D. 减小重物重力"],
        answer: 2, knowledge: "减小额外功", relatedCard: "A04"
      },
      {
        id: "Q_F_136", domain: "力", difficulty: "challenge",
        question: "下列速度中最大的是？",
        options: ["A. 750m/min", "B. 15m/s", "C. 36km/h", "D. 1250cm/s"],
        answer: 1, knowledge: "速度大小比较", relatedCard: "A06"
      },
      {
        id: "Q_F_137", domain: "力", difficulty: "challenge",
        question: "小明用弹簧测力计吊金属块，空气中重力为5N，一半体积浸入水中时示数为4N，浮力为？",
        options: ["A. 5N", "B. 4N", "C. 1N", "D. 9N"],
        answer: 2, knowledge: "称重法", relatedCard: "C06"
      },
      {
        id: "Q_F_138", domain: "力", difficulty: "challenge",
        question: "一木块重10N在2N的水平拉力作用下沿水平桌面做匀速直线运动，摩擦力为？",
        options: ["A. 10N", "B. 8N", "C. 2N", "D. 0N"],
        answer: 2, knowledge: "匀速时F=f", relatedCard: "S04"
      },
      {
        id: "Q_F_139", domain: "力", difficulty: "challenge",
        question: "某一弹簧不挂物体时长12cm受2N的拉力时长14cm，受6N拉力时长度是多少？(弹性限度内)",
        options: ["A. 16cm", "B. 18cm", "C. 20cm", "D. 22cm"],
        answer: 1, knowledge: "伸长量与拉力成正比", relatedCard: "S06"
      },
      {
        id: "Q_F_140", domain: "力", difficulty: "challenge",
        question: "下列说法中正确的是？",
        options: ["A. 使用任何机械都可以省力", "B. 使用任何机械都可以省功", "C. 做的有用功越多机械效率越高", "D. 做相同的总功额外功越少机械效率越高"],
        answer: 3, knowledge: "机械效率概念", relatedCard: "A08"
      },
      {
        id: "Q_F_141", domain: "力", difficulty: "challenge",
        question: "关于功率和机械效率，下列说法正确的是？",
        options: ["A. 机械做功越快机械效率就越高", "B. 机械效率高的机械做功一定快", "C. 功率和效率是两个不同的概念", "D. 以上都不对"],
        answer: 2, knowledge: "功率效率无关", relatedCard: "A08"
      },
      {
        id: "Q_F_142", domain: "力", difficulty: "basic",
        question: "使用托盘天平时物体应放在？",
        options: ["A. 左盘", "B. 右盘", "C. 随意", "D. 中间"],
        answer: 0, knowledge: "天平使用", relatedCard: "A01"
      },
      {
        id: "Q_F_143", domain: "力", difficulty: "basic",
        question: "下列哪个单位不是力的单位？",
        options: ["A. 牛顿", "B. 千克", "C. N", "D. 牛"],
        answer: 1, knowledge: "力的单位", relatedCard: "S05"
      },
      {
        id: "Q_F_144", domain: "力", difficulty: "basic",
        question: "用手拉弹簧弹簧伸长，说明？",
        options: ["A. 力只能改变运动状态", "B. 力可以改变物体形状", "C. 力没有作用效果", "D. 力不能改变形状"],
        answer: 1, knowledge: "力的效果", relatedCard: "S06"
      },
      {
        id: "Q_F_145", domain: "力", difficulty: "basic",
        question: "两个小朋友坐在跷跷板上恰好水平平衡则？",
        options: ["A. 两人所受重力一定相等", "B. 两人距支点距离一定相等", "C. 两人重力与力臂的乘积相等", "D. 一定有个更重的"],
        answer: 2, knowledge: "杠杆平衡", relatedCard: "A04"
      },
      {
        id: "Q_F_146", domain: "力", difficulty: "basic",
        question: "两个鸡蛋的重力大约是多少？",
        options: ["A. 0.1N", "B. 1N", "C. 10N", "D. 100N"],
        answer: 1, knowledge: "重力估测", relatedCard: "A01"
      },
      {
        id: "Q_F_147", domain: "力", difficulty: "basic",
        question: "拉弓射箭弓被拉弯说明力可以改变物体的？",
        options: ["A. 形状", "B. 运动状态", "C. 质量", "D. 体积"],
        answer: 0, knowledge: "力的作用效果", relatedCard: "S06"
      },
      {
        id: "Q_F_148", domain: "力", difficulty: "basic",
        question: "箭被射出后能继续飞行是因为箭具有？",
        options: ["A. 推力", "B. 惯性", "C. 重力", "D. 弹性"],
        answer: 1, knowledge: "惯性", relatedCard: "A02"
      },
      {
        id: "Q_F_149", domain: "力", difficulty: "basic",
        question: "列车进站时关闭发动机后还能继续前进一段距离这是因为列车具有？",
        options: ["A. 动能", "B. 惯性", "C. 推力", "D. 弹性势能"],
        answer: 1, knowledge: "惯性", relatedCard: "A02"
      },
      {
        id: "Q_F_150", domain: "力", difficulty: "basic",
        question: "力的作用效果一是改变物体形状二是改变物体？",
        options: ["A. 质量", "B. 运动状态", "C. 密度", "D. 温度"],
        answer: 1, knowledge: "力的作用效果", relatedCard: "S05"
      },
      {
        id: "Q_F_151", domain: "力", difficulty: "basic",
        question: "下列物体中受到的重力最接近500N的是？",
        options: ["A. 一个鸡蛋", "B. 一只鸡", "C. 一个中学生", "D. 一头牛"],
        answer: 2, knowledge: "重力估测", relatedCard: "A01"
      },
      {
        id: "Q_F_152", domain: "力", difficulty: "basic",
        question: "下列哪个不是用滚动代替滑动来减小摩擦的？",
        options: ["A. 滚珠轴承", "B. 行李箱下的轮子", "C. 气垫船", "D. 自行车刹车"],
        answer: 3, knowledge: "D是增大摩擦", relatedCard: "S04"
      },
      {
        id: "Q_F_153", domain: "力", difficulty: "basic",
        question: "下列哪种现象不能说明物体具有惯性？",
        options: ["A. 跑步的人被石头绊倒向前摔", "B. 熟了的苹果从树上掉下来", "C. 锤头松了把锤柄在地上撞几下", "D. 跳远运动员起跳前要助跑"],
        answer: 1, knowledge: "苹果掉落=重力", relatedCard: "A02"
      },
      {
        id: "Q_F_154", domain: "力", difficulty: "basic",
        question: "三峡船闸是世界上最大的人造连通器。以下哪个不属于连通器？",
        options: ["A. 茶壶", "B. 锅炉水位计", "C. 注射器", "D. 乳牛自动喂水器"],
        answer: 2, knowledge: "注射器利用大气压", relatedCard: "A03"
      },
      {
        id: "Q_F_155", domain: "力", difficulty: "basic",
        question: "历史上最早测出大气压强值的实验是？",
        options: ["A. 马德堡半球实验", "B. 托里拆利实验", "C. 伽利略斜面实验", "D. 阿基米德实验"],
        answer: 1, knowledge: "托里拆利", relatedCard: "A03"
      },
      {
        id: "Q_F_156", domain: "力", difficulty: "basic",
        question: "跳伞运动员在空中匀速下降的过程中？",
        options: ["A. 动能增大势能减小", "B. 动能不变势能减小", "C. 动能减小势能增大", "D. 动能不变势能不变"],
        answer: 1, knowledge: "匀速时动能不变", relatedCard: "A06"
      },
      {
        id: "Q_F_157", domain: "力", difficulty: "basic",
        question: "向上抛的石块上升过程中速度越来越小因为？",
        options: ["A. 没有受到力的作用", "B. 动能转化为重力势能", "C. 重力越来越大", "D. 空气阻力大于重力"],
        answer: 1, knowledge: "动能转势能", relatedCard: "A05"
      },
      {
        id: "Q_F_158", domain: "力", difficulty: "basic",
        question: "汽车上坡时往往要减档降速这是为了？",
        options: ["A. 增大惯性", "B. 增大牵引力", "C. 减小阻力", "D. 省油"],
        answer: 1, knowledge: "P=Fv减速增大牵引力", relatedCard: "A08"
      },
      {
        id: "Q_F_159", domain: "力", difficulty: "basic",
        question: "一个物体在平衡力作用下它的运动状态？",
        options: ["A. 一定改变", "B. 一定不改变", "C. 可能改变", "D. 先改变后不变"],
        answer: 1, knowledge: "平衡力=状态不变", relatedCard: "S04"
      },
      {
        id: "Q_F_160", domain: "力", difficulty: "basic",
        question: "下列措施中，属于增大有益摩擦的是？",
        options: ["A. 给自行车轴加润滑油", "B. 机器的转动部分装滚动轴承", "C. 在冰冻的路面上撒煤渣", "D. 气垫船利用压缩空气使船体与水脱离"],
        answer: 2, knowledge: "撒煤渣增大摩擦", relatedCard: "S04"
      },
      {
        id: "Q_F_161", domain: "力", difficulty: "basic",
        question: "关于物体的惯性下面说法正确的是？",
        options: ["A. 运动的物体有惯性静止的没有", "B. 一切物体在任何情况下都有惯性", "C. 速度大的物体惯性大", "D. 受力时惯性消失"],
        answer: 1, knowledge: "惯性是物体属性", relatedCard: "A02"
      },
      {
        id: "Q_F_162", domain: "力", difficulty: "basic",
        question: "一个瓶子最多能装500g水，它最多能装多少酒精？(酒精密度0.8g/cm³)",
        options: ["A. 400g", "B. 500g", "C. 625g", "D. 800g"],
        answer: 0, knowledge: "体积不变质量=密度×体积", relatedCard: "A03"
      },
      {
        id: "Q_F_163", domain: "力", difficulty: "basic",
        question: "水银气压计是利用什么原理制成的？",
        options: ["A. 液体压强", "B. 连通器", "C. 大气压强", "D. 气体压强"],
        answer: 2, knowledge: "水银气压计", relatedCard: "A03"
      },
      {
        id: "Q_F_164", domain: "力", difficulty: "basic",
        question: "一般成人的质量大约是？",
        options: ["A. 6kg", "B. 60kg", "C. 600kg", "D. 0.6kg"],
        answer: 1, knowledge: "质量估测", relatedCard: "A01"
      },
      {
        id: "Q_F_165", domain: "力", difficulty: "basic",
        question: "关于误差下列说法中正确的是？",
        options: ["A. 误差是测量方法不正确造成的", "B. 只要仪器精密就可以消除误差", "C. 误差只能减小不能消除", "D. 以上都不对"],
        answer: 2, knowledge: "误差不能消除", relatedCard: "A01"
      },
      {
        id: "Q_F_166", domain: "力", difficulty: "basic",
        question: "小明跑50m用了8s他的平均速度是？",
        options: ["A. 6.25m/s", "B. 4m/s", "C. 5m/s", "D. 7m/s"],
        answer: 0, knowledge: "v=s/t", relatedCard: "A06"
      },
      {
        id: "Q_F_167", domain: "力", difficulty: "basic",
        question: "实验中常用测量时间的工具是？",
        options: ["A. 刻度尺", "B. 天平", "C. 停表", "D. 弹簧测力计"],
        answer: 2, knowledge: "时间测量", relatedCard: "A01"
      },
      {
        id: "Q_F_168", domain: "力", difficulty: "basic",
        question: "下列关于力的说法正确的是？",
        options: ["A. 磁铁吸引铁钉时铁钉不受力", "B. 物体间力的作用是相互的", "C. 力只能改变物体的形状", "D. 力只能改变运动状态"],
        answer: 1, knowledge: "力的相互性", relatedCard: "S05"
      },
      {
        id: "Q_F_169", domain: "力", difficulty: "basic",
        question: "游泳时手和脚向后划水人就向前进，使人前进的力的施力物体是？",
        options: ["A. 手和脚", "B. 水", "C. 地球", "D. 空气"],
        answer: 1, knowledge: "作用力反作用力", relatedCard: "S05"
      },
      {
        id: "Q_F_170", domain: "力", difficulty: "basic",
        question: "重力约为3N的物体可能是？",
        options: ["A. 一个鸡蛋", "B. 一个苹果", "C. 物理课本", "D. 一个中学生"],
        answer: 1, knowledge: "300g≈3N", relatedCard: "A01"
      },
      {
        id: "Q_F_171", domain: "力", difficulty: "basic",
        question: "在水平桌面上放着两个体积相同的木球和铁球下列叙述中正确的是？",
        options: ["A. 两者重力一样大", "B. 铁球重力大", "C. 木球质量大", "D. 铁球是空心的"],
        answer: 1, knowledge: "铁密度大", relatedCard: "A01"
      },
      {
        id: "Q_F_172", domain: "力", difficulty: "basic",
        question: "一人用200N的力沿水平方向推着重600N的箱子在水平地板上匀速前进箱受到的摩擦力是？",
        options: ["A. 200N", "B. 400N", "C. 600N", "D. 800N"],
        answer: 0, knowledge: "匀速时F=f", relatedCard: "S04"
      },
      {
        id: "Q_F_173", domain: "力", difficulty: "basic",
        question: "下列做法中为了减小摩擦的是？",
        options: ["A. 体操运动员上杠前在手上涂镁粉", "B. 鞋底刻有凹凸不平的花纹", "C. 向自行车的轴承中加润滑油", "D. 冬天雪后往雪地上撒炉灰渣"],
        answer: 2, knowledge: "加润滑油", relatedCard: "S04"
      },
      {
        id: "Q_F_174", domain: "力", difficulty: "basic",
        question: "如图所示的装置不是利用连通器原理工作的是？",
        options: ["A. 茶壶", "B. 锅炉水位计", "C. 注射器", "D. 乳牛自动喂水器"],
        answer: 2, knowledge: "注射器=大气压", relatedCard: "A03"
      },
      {
        id: "Q_F_175", domain: "力", difficulty: "basic",
        question: "双手挤压空矿泉水瓶瓶子变形说明力可以使物体发生？",
        options: ["A. 形变", "B. 运动", "C. 加速", "D. 减速"],
        answer: 0, knowledge: "力改变形状", relatedCard: "S05"
      },
      {
        id: "Q_F_176", domain: "力", difficulty: "basic",
        question: "用手推开弹簧门门打开说明力可以？",
        options: ["A. 改变物体形状", "B. 改变物体运动状态", "C. 以上两者都有", "D. 什么都不能改变"],
        answer: 1, knowledge: "力改变运动状态", relatedCard: "S05"
      },
      {
        id: "Q_F_177", domain: "力", difficulty: "advanced",
        question: "托里拆利实验中玻璃管倾斜时管内外水银面的高度差？",
        options: ["A. 变大", "B. 变小", "C. 不变", "D. 无法确定"],
        answer: 2, knowledge: "高度差不变", relatedCard: "A03"
      },
      {
        id: "Q_F_178", domain: "力", difficulty: "advanced",
        question: "关于惯性下列叙述正确的是？",
        options: ["A. 物体只有静止或匀速直线运动时才有惯性", "B. 物体运动速度越大惯性越大", "C. 一切物体在任何情况下都有惯性", "D. 宇航员在太空中没有惯性"],
        answer: 2, knowledge: "惯性是属性", relatedCard: "A02"
      },
      {
        id: "Q_F_179", domain: "力", difficulty: "advanced",
        question: "小明推木箱但没有推动，此时摩擦力与推力的关系是？",
        options: ["A. 摩擦力大于推力", "B. 摩擦力等于推力", "C. 摩擦力小于推力", "D. 没有摩擦力"],
        answer: 1, knowledge: "静止=平衡力", relatedCard: "S04"
      },
      {
        id: "Q_F_180", domain: "力", difficulty: "advanced",
        question: "下列说法中符合安全原则的是？",
        options: ["A. 雷雨天在大树下避雨", "B. 用手指触碰插座的插孔", "C. 用湿抹布擦发光的灯泡", "D. 洗衣机要用三孔插座"],
        answer: 3, knowledge: "安全用电", relatedCard: "S05"
      },
      {
        id: "Q_F_181", domain: "力", difficulty: "advanced",
        question: "如图所示的用具中属于费力杠杆的是？",
        options: ["A. 食品夹", "B. 瓶盖起子", "C. 钳子", "D. 核桃夹"],
        answer: 0, knowledge: "食品夹=费力杠杆", relatedCard: "A04"
      },
      {
        id: "Q_F_182", domain: "力", difficulty: "advanced",
        question: "下列哪位科学家通过斜面实验得出力不是维持运动的原因？",
        options: ["A. 牛顿", "B. 伽利略", "C. 笛卡尔", "D. 亚里士多德"],
        answer: 1, knowledge: "伽利略斜面实验", relatedCard: "A02"
      },
      {
        id: "Q_F_183", domain: "力", difficulty: "advanced",
        question: "下列说法中不正确的是？",
        options: ["A. 1kg=9.8N", "B. 物体的质量不随位置改变", "C. 重力大小与质量成正比", "D. g=9.8N/kg表示1kg物体受重力9.8N"],
        answer: 0, knowledge: "kg≠N单位不同", relatedCard: "A01"
      },
      {
        id: "Q_F_184", domain: "力", difficulty: "challenge",
        question: "下列情况中物体的质量会发生变化的是？",
        options: ["A. 一杯水结成冰", "B. 将一块铁锉成零件", "C. 宇航员从地球到月球", "D. 将物体从一楼搬到三楼"],
        answer: 1, knowledge: "锉削去掉物质", relatedCard: "A01"
      },
      {
        id: "Q_F_185", domain: "力", difficulty: "challenge",
        question: "下列说法中正确的是？",
        options: ["A. 人推墙的力和墙对人的力二力平衡", "B. 物体不受力就一定静止", "C. 物体在平衡力作用下运动状态不变", "D. 力是维持物体运动的原因"],
        answer: 2, knowledge: "平衡力=状态不变", relatedCard: "S04"
      },
      {
        id: "Q_F_186", domain: "力", difficulty: "challenge",
        question: "在研究牛顿第一定律的实验中每次让小车从同一斜面的同一高度滑下目的是？",
        options: ["A. 让小车到达水平面时具有相同的速度", "B. 让小车到达水平面时受到相同的阻力", "C. 让小车在水平面上运动不同的距离", "D. 让小车在斜面上运动不同的时间"],
        answer: 0, knowledge: "控制变量", relatedCard: "A02"
      },
      {
        id: "Q_F_187", domain: "力", difficulty: "challenge",
        question: "甲、乙两同学进行百米赛跑甲到终点时乙落后10m。若甲从起跑线后退10m且两人同时起跑则？",
        options: ["A. 甲先到", "B. 乙先到", "C. 同时到", "D. 无法判断"],
        answer: 0, knowledge: "相对速度", relatedCard: "A06"
      },
      {
        id: "Q_F_188", domain: "力", difficulty: "advanced",
        question: "关于测量下列说法正确的是？",
        options: ["A. 测量时误差是不可避免的", "B. 误差就是错误", "C. 选择精密仪器改进实验方法可以避免误差", "D. 多测几次取平均值可以消除误差"],
        answer: 0, knowledge: "误差不可避免", relatedCard: "A01"
      },
      {
        id: "Q_F_189", domain: "力", difficulty: "challenge",
        question: "下列哪个不是利用大气压工作的？",
        options: ["A. 高压锅", "B. 吸盘挂钩", "C. 抽水机", "D. 注射器吸取药液"],
        answer: 0, knowledge: "高压锅利用增大气压", relatedCard: "A03"
      },
      {
        id: "Q_F_190", domain: "力", difficulty: "advanced",
        question: "对于匀速直线运动的速度公式v=s/t，下列说法正确的是？",
        options: ["A. v越大s越长", "B. v越大t越少", "C. v与s成正比与t成反比", "D. v由s/t决定但与s和t无关"],
        answer: 3, knowledge: "速度概念理解", relatedCard: "A06"
      },
      {
        id: "Q_F_191", domain: "热", difficulty: "challenge",
        question: "下列物态变化中吸收热量的是？",
        options: ["A. 熔化", "B. 凝固", "C. 液化", "D. 凝华"],
        answer: 0, knowledge: "熔化吸热", relatedCard: "A26"
      },
      {
        id: "Q_F_192", domain: "力", difficulty: "basic",
        question: "用弹簧测力计测量力的大小前要调零这是因为？",
        options: ["A. 每个测力计刻度都不同", "B. 弹簧有自重可能影响读数", "C. 测力计容易坏", "D. 为了美观"],
        answer: 1, knowledge: "调零", relatedCard: "S06"
      },
      {
        id: "Q_F_193", domain: "力", difficulty: "basic",
        question: "下列说法中正确的是？",
        options: ["A. 施力物体同时也是受力物体", "B. 不接触的物体一定没有力的作用", "C. 马拉车时马只施力不受力", "D. 发生力的作用时只有一个物体受力"],
        answer: 0, knowledge: "力的相互性", relatedCard: "S05"
      },
      {
        id: "Q_F_194", domain: "力", difficulty: "basic",
        question: "起重机吊着重物匀速上升的过程中重物的？",
        options: ["A. 动能增大", "B. 重力势能增大", "C. 动能和重力势能都增大", "D. 机械能减小"],
        answer: 1, knowledge: "势能变化", relatedCard: "A05"
      },
      {
        id: "Q_F_195", domain: "力", difficulty: "basic",
        question: "下列说法中正确的是？",
        options: ["A. 向上抛出的小球运动状态发生了变化是因为抛力作用", "B. 力是改变物体运动状态的原因", "C. 彼此不接触的物体间不可能有力的作用", "D. 人造地球卫星绕地球运转时处于平衡状态"],
        answer: 1, knowledge: "力改变运动状态", relatedCard: "A02"
      },
      {
        id: "Q_F_196", domain: "力", difficulty: "basic",
        question: "用如图所示的滑轮组提升重物已知动滑轮的重力不可忽略则下列说法正确的是？",
        options: ["A. 一定省力", "B. 一定费力", "C. 可能省力可能费力", "D. 无法判断"],
        answer: 0, knowledge: "滑轮组省力", relatedCard: "A04"
      },
      {
        id: "Q_F_197", domain: "力", difficulty: "advanced",
        question: "某人用50N的力将重30N的铅球掷出7m远，人对铅球做的功为？",
        options: ["A. 350J", "B. 210J", "C. 条件不足无法确定", "D. 0J"],
        answer: 2, knowledge: "力作用距离不确定", relatedCard: "A08"
      },
      {
        id: "Q_F_198", domain: "力", difficulty: "challenge",
        question: "关于力的概念下列说法中错误的是？",
        options: ["A. 力是物体对物体的作用", "B. 物体受力的同时也一定在施力", "C. 只有相互接触的物体才能产生力的作用", "D. 只有一个物体不能产生力"],
        answer: 2, knowledge: "不接触也可有力", relatedCard: "S05"
      },
      {
        id: "Q_F_199", domain: "力", difficulty: "advanced",
        question: "下列物体的重力最接近20N的是？",
        options: ["A. 一本物理课本", "B. 一瓶500ml矿泉水", "C. 一只鸡", "D. 一头大象"],
        answer: 2, knowledge: "2kg≈20N", relatedCard: "A01"
      },
      {
        id: "Q_F_200", domain: "力", difficulty: "basic",
        question: "一只鸡蛋的重力大约是？",
        options: ["A. 0.05N", "B. 0.5N", "C. 5N", "D. 50N"],
        answer: 1, knowledge: "鸡蛋约50g=0.5N", relatedCard: "A01"
      },
      {
        id: "Q_F_201", domain: "力", difficulty: "basic",
        question: "关于重力的概念下列说法正确的是？",
        options: ["A. 一个物体的重力与它的质量无关", "B. 只有与地面接触的物体才受到重力", "C. 重力的方向总是竖直向下", "D. 物体的重心一定在物体上"],
        answer: 2, knowledge: "重力方向竖直向下", relatedCard: "A01"
      },
      {
        id: "Q_F_202", domain: "力", difficulty: "basic",
        question: "行驶中的公交车突然刹车时乘客会向前倾下列解释正确的是？",
        options: ["A. 乘客上身受到向前的力", "B. 乘客上身具有惯性", "C. 乘客下身的摩擦力太小", "D. 乘客失去重力"],
        answer: 1, knowledge: "惯性", relatedCard: "A02"
      },
      {
        id: "Q_F_203", domain: "力", difficulty: "advanced",
        question: "一只苹果的质量约为140g体积为1.8×10⁻⁴m³将其浸没在水中时受到的浮力约为？(g=10N/kg)",
        options: ["A. 0.18N", "B. 1.8N", "C. 18N", "D. 0.14N"],
        answer: 1, knowledge: "F浮=ρ水gV排", relatedCard: "C06"
      },
      {
        id: "Q_F_204", domain: "力", difficulty: "challenge",
        question: "把重5N体积为6×10⁻⁴m³的物体投入水中若不计水的阻力当物体静止时下列说法正确的是？(g=10N/kg)",
        options: ["A. 物体漂浮", "B. 物体悬浮", "C. 物体沉底", "D. 无法判断"],
        answer: 0, knowledge: "密度<水=漂浮", relatedCard: "C06"
      },
      {
        id: "Q_F_205", domain: "力", difficulty: "challenge",
        question: "关于功率和效率下列说法正确的是？",
        options: ["A. 做功快的机械效率一定高", "B. 效率高的机械一定省力", "C. 做相同的功效率高的功率可能小", "D. 效率越高做功越快"],
        answer: 2, knowledge: "功率和效率无关", relatedCard: "A08"
      },
      {
        id: "Q_F_206", domain: "力", difficulty: "basic",
        question: "力的三要素是指？",
        options: ["A. 大小方向作用点", "B. 大小方向单位", "C. 大小作用点单位", "D. 方向作用点单位"],
        answer: 0, knowledge: "力的三要素", relatedCard: "S05"
      },
      {
        id: "Q_F_207", domain: "力", difficulty: "basic",
        question: "以下利用大气压工作的是？",
        options: ["A. 密度计", "B. 高压锅", "C. 拔火罐", "D. 液压机"],
        answer: 2, knowledge: "拔火罐=大气压", relatedCard: "A03"
      },
      {
        id: "Q_F_208", domain: "力", difficulty: "basic",
        question: "下列设备没有利用连通器原理的是？",
        options: ["A. 茶壶", "B. 船闸", "C. 液压千斤顶", "D. 洗手池下水的回水弯管"],
        answer: 2, knowledge: "液压机=帕斯卡原理", relatedCard: "A03"
      },
      {
        id: "Q_F_209", domain: "力", difficulty: "advanced",
        question: "甲乙两物体速度之比为2:1路程之比为3:1则时间之比为？",
        options: ["A. 2:3", "B. 3:2", "C. 1:6", "D. 6:1"],
        answer: 1, knowledge: "t=s/v", relatedCard: "A06"
      },
      {
        id: "Q_F_210", domain: "力", difficulty: "advanced",
        question: "下列估测的数据中最接近事实的是？",
        options: ["A. 教室门的高度约为200cm", "B. 人正常步行的速度约5m/s", "C. 一个鸡蛋的质量约500g", "D. 中学生正常体温约42°C"],
        answer: 0, knowledge: "常识估测", relatedCard: "A01"
      },
      // ==================================================
      // 声 领域
      // ==================================================
      {
        id: "Q_S_001", domain: "声", difficulty: "basic",
        question: "声音是由物体的什么产生的？",
        options: ["A. 运动", "B. 振动", "C. 碰撞", "D. 摩擦"],
        answer: 1, knowledge: "声音由振动产生", relatedCard: "S08"
      },
      {
        id: "Q_S_002", domain: "声", difficulty: "basic",
        question: "声音的传播需要什么？",
        options: ["A. 不需要任何东西", "B. 介质", "C. 只需要空气", "D. 只需要固体"],
        answer: 1, knowledge: "传声需要介质", relatedCard: "A14"
      },
      {
        id: "Q_S_003", domain: "声", difficulty: "basic",
        question: "声音在下列哪种介质中不能传播？",
        options: ["A. 空气", "B. 水", "C. 钢铁", "D. 真空"],
        answer: 3, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_004", domain: "声", difficulty: "basic",
        question: "通常情况下声音在哪种介质中传播最快？",
        options: ["A. 空气", "B. 水", "C. 钢铁", "D. 真空中"],
        answer: 2, knowledge: "固体声速最大", relatedCard: "A14"
      },
      {
        id: "Q_S_005", domain: "声", difficulty: "basic",
        question: "声音在15°C的空气中的传播速度约为？",
        options: ["A. 340m/s", "B. 3400m/s", "C. 34m/s", "D. 3.4m/s"],
        answer: 0, knowledge: "声速", relatedCard: "A14"
      },
      {
        id: "Q_S_006", domain: "声", difficulty: "basic",
        question: "宇航员在月球上面对面也无法直接对话这是因为？",
        options: ["A. 月球引力太小", "B. 月球温度太低", "C. 月球没有空气", "D. 宇航服太厚"],
        answer: 2, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_007", domain: "声", difficulty: "basic",
        question: "决定声音音调高低的因素是？",
        options: ["A. 振幅", "B. 频率", "C. 传播速度", "D. 介质"],
        answer: 1, knowledge: "音调由频率决定", relatedCard: "S08"
      },
      {
        id: "Q_S_008", domain: "声", difficulty: "basic",
        question: "决定声音响度大小的主要因素是？",
        options: ["A. 频率", "B. 振幅", "C. 音色", "D. 声速"],
        answer: 1, knowledge: "响度由振幅决定", relatedCard: "S08"
      },
      {
        id: "Q_S_009", domain: "声", difficulty: "basic",
        question: "我们能分辨不同乐器演奏同一曲子主要因为什么不同？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "音色区别", relatedCard: "S08"
      },
      {
        id: "Q_S_010", domain: "声", difficulty: "basic",
        question: "人耳能听到的声音频率范围约是？",
        options: ["A. 2-200Hz", "B. 20-20000Hz", "C. 200-2000Hz", "D. 2-200000Hz"],
        answer: 1, knowledge: "听觉范围", relatedCard: "S08"
      },
      {
        id: "Q_S_011", domain: "声", difficulty: "basic",
        question: "频率高于20000Hz的声波叫？",
        options: ["A. 次声波", "B. 超声波", "C. 可听声", "D. 噪声"],
        answer: 1, knowledge: "超声波", relatedCard: "A09"
      },
      {
        id: "Q_S_012", domain: "声", difficulty: "basic",
        question: "频率低于20Hz的声波叫？",
        options: ["A. 超声波", "B. 次声波", "C. 可听声", "D. 噪音"],
        answer: 1, knowledge: "次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_013", domain: "声", difficulty: "basic",
        question: "男低音和女高音的主要区别在于？",
        options: ["A. 响度不同", "B. 音色不同", "C. 音调不同", "D. 传播速度不同"],
        answer: 2, knowledge: "音调高低", relatedCard: "S08"
      },
      {
        id: "Q_S_014", domain: "声", difficulty: "basic",
        question: "震耳欲聋形容的是声音的？",
        options: ["A. 音调高", "B. 响度大", "C. 音色美", "D. 频率高"],
        answer: 1, knowledge: "响度", relatedCard: "S08"
      },
      {
        id: "Q_S_015", domain: "声", difficulty: "basic",
        question: "闻其声知其人是根据声音的？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "音色", relatedCard: "A45"
      },
      {
        id: "Q_S_016", domain: "声", difficulty: "basic",
        question: "从环保角度看以下哪个属于噪声？",
        options: ["A. 课堂上老师讲课", "B. 音乐厅的交响乐", "C. 深夜装修的电钻声", "D. 轻柔的背景音乐"],
        answer: 2, knowledge: "噪声定义", relatedCard: "S07"
      },
      {
        id: "Q_S_017", domain: "声", difficulty: "basic",
        question: "减弱噪声的途径不包括？",
        options: ["A. 声源处减弱", "B. 传播过程中减弱", "C. 人耳处减弱", "D. 增大声源频率"],
        answer: 3, knowledge: "减弱噪声途径", relatedCard: "S07"
      },
      {
        id: "Q_S_018", domain: "声", difficulty: "basic",
        question: "高速公路两旁安装隔音板是从哪个环节减弱噪声？",
        options: ["A. 声源处", "B. 传播过程中", "C. 人耳处", "D. 以上都不是"],
        answer: 1, knowledge: "传播过程中", relatedCard: "S11"
      },
      {
        id: "Q_S_019", domain: "声", difficulty: "basic",
        question: "蝙蝠发出超声波探测猎物利用了声音能够？",
        options: ["A. 传递能量", "B. 传递信息", "C. 发光", "D. 发热"],
        answer: 1, knowledge: "声传递信息", relatedCard: "A45"
      },
      {
        id: "Q_S_020", domain: "声", difficulty: "basic",
        question: "用超声波清洗眼镜利用了声音能够？",
        options: ["A. 传递信息", "B. 传递能量", "C. 发光", "D. 反射"],
        answer: 1, knowledge: "声传递能量", relatedCard: "A09"
      },
      {
        id: "Q_S_021", domain: "声", difficulty: "basic",
        question: "下列不是超声波应用的是？",
        options: ["A. 声呐测距", "B. B超检查", "C. 超声波清洗", "D. 收音机接收信号"],
        answer: 3, knowledge: "收音机=电磁波", relatedCard: "A09"
      },
      {
        id: "Q_S_022", domain: "声", difficulty: "basic",
        question: "关于次声波的说法正确的是？",
        options: ["A. 人耳能听到次声波", "B. 频率高于20000Hz", "C. 地震火山会产生次声波", "D. 不能在水中传播"],
        answer: 2, knowledge: "次声波来源", relatedCard: "A10"
      },
      {
        id: "Q_S_023", domain: "声", difficulty: "basic",
        question: "声呐系统利用什么原理测量海底深度？",
        options: ["A. 光的反射", "B. 声波的反射", "C. 电磁波传播", "D. 超声波穿透"],
        answer: 1, knowledge: "声呐原理", relatedCard: "A14"
      },
      {
        id: "Q_S_024", domain: "声", difficulty: "basic",
        question: "医生用听诊器听心跳听诊器的主要作用是？",
        options: ["A. 增大音调", "B. 增大响度", "C. 减小传播速度", "D. 改变音色"],
        answer: 1, knowledge: "听诊器原理", relatedCard: "S12"
      },
      {
        id: "Q_S_025", domain: "声", difficulty: "basic",
        question: "B超检查身体是利用了？",
        options: ["A. 超声波", "B. 次声波", "C. 可听声", "D. 电磁波"],
        answer: 0, knowledge: "B超=超声波", relatedCard: "A09"
      },
      {
        id: "Q_S_026", domain: "声", difficulty: "basic",
        question: "吹笛子时笛声是由什么振动产生的？",
        options: ["A. 嘴唇", "B. 笛子本身", "C. 管内空气柱", "D. 手指"],
        answer: 2, knowledge: "空气柱振动", relatedCard: "A13"
      },
      {
        id: "Q_S_027", domain: "声", difficulty: "basic",
        question: "二胡是靠什么振动发声的？",
        options: ["A. 琴弦", "B. 琴筒", "C. 琴弓", "D. 琴杆"],
        answer: 0, knowledge: "琴弦振动", relatedCard: "S08"
      },
      {
        id: "Q_S_028", domain: "声", difficulty: "basic",
        question: "关于声波以下说法正确的是？",
        options: ["A. 声波是横波", "B. 声波是电磁波", "C. 声波是纵波", "D. 声波不需要介质"],
        answer: 2, knowledge: "声波是纵波", relatedCard: "A32"
      },
      {
        id: "Q_S_029", domain: "声", difficulty: "basic",
        question: "同一根琴弦拧得越紧弹拨时发出的声音音调越？",
        options: ["A. 低", "B. 高", "C. 不变", "D. 不确定"],
        answer: 1, knowledge: "弦紧音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_030", domain: "声", difficulty: "basic",
        question: "用大小不同的力敲同一面鼓鼓声的不同在于？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 1, knowledge: "力大响度大", relatedCard: "S08"
      },
      {
        id: "Q_S_031", domain: "声", difficulty: "basic",
        question: "不敢高声语恐惊天上人中的高指的是？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 1, knowledge: "诗句中=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_032", domain: "声", difficulty: "basic",
        question: "下列哪种材料隔音效果最好？",
        options: ["A. 玻璃", "B. 木板", "C. 多孔泡沫", "D. 钢板"],
        answer: 2, knowledge: "多孔材料吸音", relatedCard: "S11"
      },
      {
        id: "Q_S_033", domain: "声", difficulty: "basic",
        question: "鼓声是由什么振动产生的？",
        options: ["A. 鼓槌", "B. 鼓面", "C. 空气", "D. 鼓架"],
        answer: 1, knowledge: "鼓面振动", relatedCard: "S08"
      },
      {
        id: "Q_S_034", domain: "声", difficulty: "basic",
        question: "钓鱼时不能大声喧哗因为鱼听到人声会被吓跑这说明？",
        options: ["A. 只有空气能传播声音", "B. 空气和水都能传播声音", "C. 声音在水中速度比空气中快", "D. 声音在任何条件下都能传播"],
        answer: 1, knowledge: "水也能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_035", domain: "声", difficulty: "basic",
        question: "关于回声下列说法正确的是？",
        options: ["A. 回声总是加强原声", "B. 回声比原声晚0.1s以上才能分辨", "C. 回声音调比原声高", "D. 回声响度比原声大"],
        answer: 1, knowledge: "回声分辨条件", relatedCard: "A14"
      },
      {
        id: "Q_S_036", domain: "声", difficulty: "basic",
        question: "低声细语中的低指的是声音的？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 1, knowledge: "响度", relatedCard: "S08"
      },
      {
        id: "Q_S_037", domain: "声", difficulty: "basic",
        question: "牛叫声和蚊子叫声相比较正确的是？",
        options: ["A. 牛叫声音调高响度大", "B. 蚊子叫声音调高响度小", "C. 牛叫声音调低响度小", "D. 蚊子叫声音调低响度小"],
        answer: 1, knowledge: "蚊子频率高", relatedCard: "S08"
      },
      {
        id: "Q_S_038", domain: "声", difficulty: "basic",
        question: "手掌按住正在发声的鼓面鼓声消失了原因是？",
        options: ["A. 不能传播声音", "B. 吸收了声波", "C. 把声音反射回去了", "D. 使鼓面停止了振动"],
        answer: 3, knowledge: "振动停止声音也停", relatedCard: "S08"
      },
      {
        id: "Q_S_039", domain: "声", difficulty: "basic",
        question: "对于下列四幅图说法正确的是？",
        options: ["A. 小明敲鼓时用力越大的鼓声的音调越高", "B. 广口瓶中的空气越稀薄人听到的响声越大", "C. 纸板划得越慢齿疏的梳子音调越低", "D. 安装噪声监测仪可以根治噪声污染"],
        answer: 2, knowledge: "划得慢频率低", relatedCard: "S08"
      },
      {
        id: "Q_S_040", domain: "声", difficulty: "basic",
        question: "声音在固体液体中比在空气中传播得？",
        options: ["A. 快", "B. 慢", "C. 一样快", "D. 无法比较"],
        answer: 0, knowledge: "固体液体声速大", relatedCard: "A14"
      },
      {
        id: "Q_S_041", domain: "声", difficulty: "basic",
        question: "声音的三个特性是？",
        options: ["A. 音调响度音色", "B. 频率振幅音色", "C. 音调响度频率", "D. 频率振幅响度"],
        answer: 0, knowledge: "声音三特性", relatedCard: "S08"
      },
      {
        id: "Q_S_042", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音是由物体振动产生的", "B. 声音在真空中传播最快", "C. 低声细语是指音调低", "D. 物体振动停止声音立即消失"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_043", domain: "声", difficulty: "basic",
        question: "下列关于声音的说法正确的是？",
        options: ["A. 如果听到的声音足够大发声体不振动也能听到声音", "B. 声音在真空中传播得最快", "C. 物体振动的频率越高声音的音调越高", "D. 声音在各种介质中传播速度相同"],
        answer: 2, knowledge: "频率高音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_044", domain: "声", difficulty: "basic",
        question: "下面关于超声波或超声波的利用的说法中不正确的是？",
        options: ["A. 蝙蝠能发出超声波", "B. 超声波的传播不需要介质", "C. 可以利用超声波的反射探测海洋深度", "D. 可以利用B超检查身体"],
        answer: 1, knowledge: "超声波也需要介质", relatedCard: "A09"
      },
      {
        id: "Q_S_045", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音在真空中传播最快", "B. 正在发声的物体都在振动", "C. 发声体振动越快声音传播越快", "D. 公路旁隔音墙在声源处减弱噪声"],
        answer: 1, knowledge: "振动发声", relatedCard: "S08"
      },
      {
        id: "Q_S_046", domain: "声", difficulty: "basic",
        question: "喇叭里响起我和你心连心的歌声，小明说是刘欢在演唱。他判断的依据是？",
        options: ["A. 音调不同", "B. 响度不同", "C. 音色不同", "D. 声速不同"],
        answer: 2, knowledge: "音色", relatedCard: "A45"
      },
      {
        id: "Q_S_047", domain: "声", difficulty: "basic",
        question: "电子琴能模仿各种乐器发出的声音在技术上面要解决的关键是能模仿各种乐器发出的？",
        options: ["A. 音调", "B. 音色", "C. 响度", "D. 频率"],
        answer: 1, knowledge: "音色", relatedCard: "A45"
      },
      {
        id: "Q_S_048", domain: "声", difficulty: "basic",
        question: "一根长约10m的铁管管内注满了水在管的一端敲击一下在另一端可听到几次响声？",
        options: ["A. 1次", "B. 2次", "C. 3次", "D. 4次"],
        answer: 2, knowledge: "铁/水/空气各一次", relatedCard: "A14"
      },
      {
        id: "Q_S_049", domain: "声", difficulty: "basic",
        question: "发生灾难时被困在建筑物废墟中的人向外界求救的一种好方法是敲击铁制的管道这种方法利用了？",
        options: ["A. 铁管能传声", "B. 铁管能传热", "C. 铁管能导电", "D. 铁管通风"],
        answer: 0, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_050", domain: "声", difficulty: "basic",
        question: "音乐会上男低音歌手正在放声高唱为他轻声伴唱的是女高音歌手。下列说法正确的是？",
        options: ["A. 男低音音调高响度大", "B. 男低音音调低响度大", "C. 女高音音调高响度大", "D. 女高音音调低响度大"],
        answer: 1, knowledge: "男低音=低音调+大响度", relatedCard: "S08"
      },
      {
        id: "Q_S_051", domain: "声", difficulty: "advanced",
        question: "向暖水瓶灌开水时可以通过听声音判断水是否快满了因为？",
        options: ["A. 水位升高音调变高", "B. 水位升高响度变大", "C. 水位升高音色改变", "D. 水位升高音调变低"],
        answer: 0, knowledge: "空气柱变短频率增大", relatedCard: "S08"
      },
      {
        id: "Q_S_052", domain: "声", difficulty: "advanced",
        question: "关于双耳效应下列说法正确的是？",
        options: ["A. 双耳效应说明两只耳朵听到的声音更大", "B. 利用声音到达两耳的时间差和强度差定位", "C. 双耳效应可以提高音调", "D. 双耳效应需要特殊设备"],
        answer: 1, knowledge: "双耳效应", relatedCard: "A45"
      },
      {
        id: "Q_S_053", domain: "声", difficulty: "advanced",
        question: "大礼堂墙壁上有很多小孔这是为了？",
        options: ["A. 增强回声", "B. 减弱回声", "C. 改变音调", "D. 提高音色"],
        answer: 1, knowledge: "吸音", relatedCard: "S11"
      },
      {
        id: "Q_S_054", domain: "声", difficulty: "advanced",
        question: "下列关于声音传播的说法错误的是？",
        options: ["A. 声音不能在真空中传播", "B. 声音在不同介质中快慢一般固体>液体>气体", "C. 声音传播需要介质", "D. 空气中声速约为340m/h"],
        answer: 3, knowledge: "声速单位辨析", relatedCard: "A51"
      },
      {
        id: "Q_S_055", domain: "声", difficulty: "advanced",
        question: "不带花蜜的蜜蜂飞行时翅膀每秒约振动440次，带花蜜的约300次，不带花蜜的嗡嗡声？",
        options: ["A. 音调高", "B. 音调低", "C. 响度大", "D. 响度小"],
        answer: 0, knowledge: "频率高音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_056", domain: "声", difficulty: "advanced",
        question: "在门窗关闭的空教室里说话会感到声音比在室外响亮原因是？",
        options: ["A. 教室里的空气振动", "B. 教室里的回声与原声叠加", "C. 教室里的空气温度高", "D. 教室里的空气湿度大"],
        answer: 1, knowledge: "回声叠加", relatedCard: "A14"
      },
      {
        id: "Q_S_057", domain: "声", difficulty: "advanced",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音在真空中传播最快", "B. 外科医生利用超声波除去人体结石是利用了声能传递能量", "C. 利用次声波可以监测台风和地震", "D. 以上都对"],
        answer: 1, knowledge: "超声波碎石=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_058", domain: "声", difficulty: "advanced",
        question: "下列哪一种动物对次声波最敏感？",
        options: ["A. 蝙蝠", "B. 海豚", "C. 大象", "D. 狗"],
        answer: 2, knowledge: "大象用次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_059", domain: "声", difficulty: "advanced",
        question: "把闹钟放在玻璃罩里用抽气机逐渐抽出空气听到的铃声逐渐变小这个实验说明？",
        options: ["A. 声音能在真空中传播", "B. 声音的传播需要介质", "C. 铃的振动越来越小", "D. 声音的音调越来越低"],
        answer: 1, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_060", domain: "声", difficulty: "advanced",
        question: "以下措施中在声源处减弱噪声的是？",
        options: ["A. 在道路两旁植树", "B. 给机器加隔音罩", "C. 戴上防噪声耳罩", "D. 在道路旁安装隔音板"],
        answer: 1, knowledge: "声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_061", domain: "声", difficulty: "advanced",
        question: "一场大雪过后人们会感到外面万籁俱静原因可能是？",
        options: ["A. 大雪后噪声被反射", "B. 大雪蓬松多孔对噪声有吸收作用", "C. 车辆减少", "D. 气温低声速变慢"],
        answer: 1, knowledge: "雪多孔吸音", relatedCard: "S11"
      },
      {
        id: "Q_S_062", domain: "声", difficulty: "advanced",
        question: "声音从声源发出在空气中传播过程中下列说法正确的是？",
        options: ["A. 音调越来越低", "B. 响度越来越小", "C. 传播速度越来越小", "D. 频率越来越低"],
        answer: 1, knowledge: "传播中响度衰减", relatedCard: "D02"
      },
      {
        id: "Q_S_063", domain: "声", difficulty: "advanced",
        question: "拉二胡时不断地用手指控制琴弦是为了？",
        options: ["A. 使二胡发出不同的音调", "B. 获得更好的音色", "C. 获得更大的响度", "D. 阻止琴弦振动"],
        answer: 0, knowledge: "改变音调", relatedCard: "S08"
      },
      {
        id: "Q_S_064", domain: "声", difficulty: "advanced",
        question: "下列关于声音的说法不正确的是？",
        options: ["A. 隔墙有耳说明固体也能传声", "B. 震耳欲聋主要说明声音的音调高", "C. 闻其声知其人根据音色来判断", "D. 用超声波清洗说明声波能传递能量"],
        answer: 1, knowledge: "震耳欲聋=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_065", domain: "声", difficulty: "advanced",
        question: "以下控制噪声的措施中属于在传播过程中减弱的是？",
        options: ["A. 建筑工地噪声大要限时", "B. 市区内种草植树", "C. 戴上防噪声耳塞", "D. 市区内汽车禁止鸣笛"],
        answer: 1, knowledge: "植树=传播中", relatedCard: "S11"
      },
      {
        id: "Q_S_066", domain: "声", difficulty: "advanced",
        question: "声音在均匀空气里传播的过程中？",
        options: ["A. 声速逐渐减小", "B. 频率逐渐减小", "C. 振幅逐渐减小", "D. 声速频率振幅都不变"],
        answer: 2, knowledge: "振幅减小", relatedCard: "D02"
      },
      {
        id: "Q_S_067", domain: "声", difficulty: "advanced",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 物体振动得越快发出音调越低", "B. 外科医生利用超声波除去人体结石利用了声能传递能量", "C. 声音在真空中比空气中传播快", "D. 以上都不对"],
        answer: 1, knowledge: "声传递能量", relatedCard: "A09"
      },
      {
        id: "Q_S_068", domain: "声", difficulty: "advanced",
        question: "火车站站台上标有一条安全线乘客必须站在安全线之外候车以避免发生危险。这是因为？",
        options: ["A. 火车速度大惯性大", "B. 火车附近空气流速大压强小", "C. 火车声音太大", "D. 火车有强大磁场"],
        answer: 1, knowledge: "流体压强", relatedCard: "A14"
      },
      {
        id: "Q_S_069", domain: "声", difficulty: "advanced",
        question: "声波在管乐器中形成的是什么？",
        options: ["A. 电磁波", "B. 驻波", "C. 横波", "D. 光波"],
        answer: 1, knowledge: "驻波", relatedCard: "A13"
      },
      {
        id: "Q_S_070", domain: "声", difficulty: "advanced",
        question: "城市里部分道路设计成下凹形式，在控制噪声方面的作用是？",
        options: ["A. 防止车辆产生噪声", "B. 在声源处减弱噪声", "C. 在人耳处减弱噪声", "D. 在传播过程中减弱噪声"],
        answer: 3, knowledge: "传播中减弱", relatedCard: "S11"
      },
      {
        id: "Q_S_071", domain: "声", difficulty: "advanced",
        question: "拿硬纸片让它快一些从一木梳子上划过再让它从同一木梳子上慢一点划过则两次所发出的声音？",
        options: ["A. 响度不同", "B. 音调不同", "C. 音色不同", "D. 前三者都不同"],
        answer: 1, knowledge: "快划音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_072", domain: "声", difficulty: "advanced",
        question: "助听器的工作原理是？",
        options: ["A. 增大声音的响度", "B. 提高声音的音调", "C. 改变声音的音色", "D. 加快声音的速度"],
        answer: 0, knowledge: "助听器=增大响度", relatedCard: "S12"
      },
      {
        id: "Q_S_073", domain: "声", difficulty: "advanced",
        question: "吉他演奏前需要调整琴弦的松紧这样做的目的是调节琴弦发声时的？",
        options: ["A. 振幅", "B. 响度", "C. 音调", "D. 音色"],
        answer: 2, knowledge: "弦松紧=音调", relatedCard: "S08"
      },
      {
        id: "Q_S_074", domain: "声", difficulty: "advanced",
        question: "以下措施不能减弱噪声的是？",
        options: ["A. 摩托车安装消声器", "B. 机场人员佩戴有耳机的头盔", "C. 街头设置噪声监测仪", "D. 在公路两旁种植树木"],
        answer: 2, knowledge: "监测仪不减弱", relatedCard: "S07"
      },
      {
        id: "Q_S_075", domain: "声", difficulty: "advanced",
        question: "以下几个实验现象中能说明声音产生原因的是？",
        options: ["A. 放在玻璃钟罩内的闹钟发声抽去空气后铃声减小", "B. 正在发声的收音机密封后放入水中仍能听到", "C. 拉小提琴时琴弦松紧不同发出声音不同", "D. 拨动吉他琴弦时放在弦上的纸片会被弹开"],
        answer: 3, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_076", domain: "声", difficulty: "advanced",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 只要物体振动人就一定能听到声音", "B. 地震火山喷发都伴有次声波产生", "C. 声音在固体中一定比液体中快", "D. 安装噪声监测仪可以减弱噪声"],
        answer: 1, knowledge: "灾害产生次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_077", domain: "声", difficulty: "advanced",
        question: "关于声音的利用下列说法不正确的是？",
        options: ["A. 中医望闻问切中闻是利用声音传递信息", "B. 火山爆发地震会产生超声波", "C. 外科利用超声波除去结石是利用声音传递能量", "D. 大象通过次声波进行交流"],
        answer: 1, knowledge: "地震=次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_078", domain: "声", difficulty: "advanced",
        question: "关于声现象的描述下列说法正确的是？",
        options: ["A. 声音在真空中传播速度最快", "B. 只要物体振动我们就能听到声音", "C. 声音能够传递信息和能量", "D. 物体振动频率越高发出声音响度越大"],
        answer: 2, knowledge: "声传递信息和能量", relatedCard: "A14"
      },
      {
        id: "Q_S_079", domain: "声", difficulty: "advanced",
        question: "以下哪种方法不能减弱噪声？",
        options: ["A. 将噪声大工厂建在远离居民区的地方", "B. 在马路和住宅间设立屏障或植树造林", "C. 戴防噪声耳罩", "D. 打开门窗通风"],
        answer: 3, knowledge: "开门窗不减弱噪声", relatedCard: "S07"
      },
      {
        id: "Q_S_080", domain: "声", difficulty: "advanced",
        question: "超声波和次声波都是人耳听不到的声音。以下正确的是？",
        options: ["A. 超声波的频率低于20Hz", "B. 次声波的频率高于20000Hz", "C. 超声波可以在真空中传播", "D. 次声波可以传递信息"],
        answer: 3, knowledge: "次声波传递信息", relatedCard: "A10"
      },
      {
        id: "Q_S_081", domain: "声", difficulty: "advanced",
        question: "一种声纹锁只要主人说出暗语就能打开。声纹锁辨别声音主要依据？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 声速"],
        answer: 2, knowledge: "声纹=音色", relatedCard: "A45"
      },
      {
        id: "Q_S_082", domain: "声", difficulty: "advanced",
        question: "下列关于声音的说法正确的是？",
        options: ["A. 物体不振动可能也会发出声音", "B. 声音在空气和水中的传播速度不同", "C. 减少噪声的唯一方法是不让物体发出噪声", "D. 公共场所不要大声喧哗是要求说话音调低一些"],
        answer: 1, knowledge: "不同介质速度不同", relatedCard: "A14"
      },
      {
        id: "Q_S_083", domain: "声", difficulty: "advanced",
        question: "人们常用放声高歌这个词语来形容声音的？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 传播远"],
        answer: 1, knowledge: "响度大", relatedCard: "S08"
      },
      {
        id: "Q_S_084", domain: "声", difficulty: "advanced",
        question: "北京天坛的回音壁是利用了声音的什么原理？",
        options: ["A. 折射", "B. 反射", "C. 衍射", "D. 色散"],
        answer: 1, knowledge: "回音壁=反射", relatedCard: "A14"
      },
      {
        id: "Q_S_085", domain: "声", difficulty: "advanced",
        question: "在操场上上体育课时体育老师发出的口令近处学生听到了远处没听清主要原因是？",
        options: ["A. 远处学生听到的声音响度小", "B. 老师发出的声音音色不好", "C. 老师发出的声音频率低", "D. 远处学生听到的声音振动幅度大"],
        answer: 0, knowledge: "距离远响度小", relatedCard: "D02"
      },
      {
        id: "Q_S_086", domain: "声", difficulty: "advanced",
        question: "利用声呐探测海底深度利用了什么原理？",
        options: ["A. 声音可以传递信息", "B. 声音可以传递能量", "C. 声音的速度很大", "D. 声音在水中传播最快"],
        answer: 0, knowledge: "声呐=信息", relatedCard: "A14"
      },
      {
        id: "Q_S_087", domain: "声", difficulty: "advanced",
        question: "有一种电动牙刷能发出超声波直达牙刷棕毛刷不到的地方这样刷牙既干净又舒服。下列说法正确的是？",
        options: ["A. 超声波不能在空气中传播", "B. 超声波不是由物体振动产生的", "C. 超声波的音调很低所以人听不到", "D. 超声波能传递能量"],
        answer: 3, knowledge: "超声波传递能量", relatedCard: "A09"
      },
      {
        id: "Q_S_088", domain: "声", difficulty: "advanced",
        question: "1994年彗星撞击木星人们没有听到撞击声音最合理的解释是？",
        options: ["A. 撞击声音太小", "B. 被其他声音淹没", "C. 声音不能在真空中传播", "D. 撞击没有产生振动"],
        answer: 2, knowledge: "真空中不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_089", domain: "声", difficulty: "advanced",
        question: "下列不能说明声音具有能量的是？",
        options: ["A. 声波能粉碎人体内的结石", "B. 美妙的歌声能使人心情愉快", "C. 利用超声波清洗眼镜", "D. 音箱前蜡烛火焰随着音乐跳动"],
        answer: 1, knowledge: "心情愉快不是能量", relatedCard: "A09"
      },
      {
        id: "Q_S_090", domain: "声", difficulty: "advanced",
        question: "下列现象中不是利用声波传递信息的是？",
        options: ["A. 有经验的养蜂人听飞行声判断是否采了蜜", "B. 利用超声波粉碎人体内的结石", "C. 利用声呐探测海底深度", "D. 蝙蝠利用超声波确定目标"],
        answer: 1, knowledge: "粉碎结石=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_091", domain: "声", difficulty: "advanced",
        question: "关于声现象下列说法不正确的是？",
        options: ["A. 声音借助介质以波的形式传播", "B. 利用超声波清洗钟表说明声音可以传递信息", "C. 高声大叫中的高实际是指响度大", "D. 设置隔音板是为了在传播过程中减弱噪声"],
        answer: 1, knowledge: "清洗=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_092", domain: "声", difficulty: "advanced",
        question: "发生地震后被埋在废墟下缺乏正确的自救保护措施是丧生主要原因。若你被埋在废墟下最有效的措施是？",
        options: ["A. 大声呼救", "B. 静等救援人员来救", "C. 用硬物敲击预制板或墙壁", "D. 见缝隙就钻"],
        answer: 2, knowledge: "固体传声效果好", relatedCard: "A14"
      },
      {
        id: "Q_S_093", domain: "声", difficulty: "advanced",
        question: "对于下列四幅图说法正确的是？",
        options: ["A. 用力越大鼓声的音调越高", "B. 广口瓶中的空气越稀薄人听到的响声越大", "C. 纸板划得越快齿密的梳子音调越高", "D. 安装噪声监测仪可以根治噪声"],
        answer: 2, knowledge: "划得快频率高", relatedCard: "S08"
      },
      {
        id: "Q_S_094", domain: "声", difficulty: "advanced",
        question: "下列不能减弱噪声的是？",
        options: ["A. 摩托车安装消声器", "B. 机场人员佩戴有耳机的头盔", "C. 城市道路旁安装隔音板", "D. 在主要街道安装噪声监测装置"],
        answer: 3, knowledge: "监测不减弱", relatedCard: "S07"
      },
      {
        id: "Q_S_095", domain: "声", difficulty: "advanced",
        question: "1999年土耳其大地震后被埋在废墟下的人最有效的自救措施是？",
        options: ["A. 大声呼救", "B. 静等救援", "C. 用硬物敲击预制板或墙壁", "D. 见缝就钻"],
        answer: 2, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_096", domain: "声", difficulty: "advanced",
        question: "使用MP3时调节音量按钮是为了改变声音的？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 1, knowledge: "音量=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_097", domain: "声", difficulty: "advanced",
        question: "我们能听到蚊子飞行的声音却听不到蝴蝶飞行的声音因为蚊子飞行时翅膀？",
        options: ["A. 振幅大", "B. 频率高", "C. 响度大", "D. 音色好"],
        answer: 1, knowledge: "频率在听觉范围", relatedCard: "S08"
      },
      {
        id: "Q_S_098", domain: "声", difficulty: "advanced",
        question: "安静的傍晚狗竖起耳朵警觉地谛听这是因为？",
        options: ["A. 狗听到远处人们手机的对话", "B. 狗听到火星发出的声音", "C. 狗听到人无法听到的某些频率的声音", "D. 狗听到无线电波"],
        answer: 2, knowledge: "狗的听觉范围更广", relatedCard: "A10"
      },
      {
        id: "Q_S_099", domain: "声", difficulty: "advanced",
        question: "以下关于声音的说法不正确的是？",
        options: ["A. 公共场所不要大声喧哗是要求人们响度放低", "B. 用超声波清洗眼镜说明声音可以传递能量", "C. 声音在任何介质中的传播速度都是340m/s", "D. 中考禁鸣是在声源处控制噪声"],
        answer: 2, knowledge: "不同介质声速不同", relatedCard: "A14"
      },
      {
        id: "Q_S_100", domain: "声", difficulty: "advanced",
        question: "将音叉的振动放大下列哪个实验方法最常用？",
        options: ["A. 将音叉放入水中", "B. 用更大的力敲击音叉", "C. 将音叉做得更大", "D. 敲击音叉后用放大镜观察"],
        answer: 0, knowledge: "放大振动", relatedCard: "S08"
      },
      {
        id: "Q_S_101", domain: "声", difficulty: "challenge",
        question: "一辆救护车鸣笛向你驶来你听到的笛声音调变高这是因为？",
        options: ["A. 声速增大", "B. 多普勒效应", "C. 救护车振动频率加快", "D. 回声叠加"],
        answer: 1, knowledge: "多普勒效应", relatedCard: "S13"
      },
      {
        id: "Q_S_102", domain: "声", difficulty: "challenge",
        question: "当一辆火车鸣笛从你身边驶过时你听到的笛声变化是？",
        options: ["A. 响度不变音调不变", "B. 音调先变高后变低", "C. 音调先变低后变高", "D. 只变响度不变音调"],
        answer: 1, knowledge: "多普勒效应", relatedCard: "S13"
      },
      {
        id: "Q_S_103", domain: "声", difficulty: "challenge",
        question: "士兵过桥时不能齐步走是因为齐步走频率可能引发？",
        options: ["A. 共振", "B. 超声", "C. 回声", "D. 次声"],
        answer: 0, knowledge: "共振", relatedCard: "S09"
      },
      {
        id: "Q_S_104", domain: "声", difficulty: "challenge",
        question: "在雷雨来临前电光一闪即逝但雷声却隆隆不断这是因为？",
        options: ["A. 雷声经过多次反射", "B. 一个接一个的雷声", "C. 双耳效应", "D. 闪电比雷声快"],
        answer: 0, knowledge: "雷声多次反射", relatedCard: "A14"
      },
      {
        id: "Q_S_105", domain: "声", difficulty: "challenge",
        question: "下列操作中能改变声音音调的是？",
        options: ["A. 用不同力度敲击同一音叉", "B. 敲击装有不同水量的瓶子", "C. 用力敲鼓", "D. 调节收音机的音量旋钮"],
        answer: 1, knowledge: "水量改变空气柱长度", relatedCard: "S08"
      },
      {
        id: "Q_S_106", domain: "声", difficulty: "challenge",
        question: "下列事实中应用了次声波的是？",
        options: ["A. 用声呐测海底深度", "B. 蝙蝠确定目标方向", "C. 海豚判断物体位置", "D. 用仪器监听海啸台风"],
        answer: 3, knowledge: "海啸=次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_107", domain: "声", difficulty: "challenge",
        question: "声音在空气中的传播速度在哪个条件下最快？",
        options: ["A. 0°C", "B. 15°C", "C. 30°C", "D. -10°C"],
        answer: 2, knowledge: "声速与温度", relatedCard: "A51"
      },
      {
        id: "Q_S_108", domain: "声", difficulty: "challenge",
        question: "下列关于声现象的说法正确的是？",
        options: ["A. 女高音中的高是指声音的音调高", "B. 金嗓子是指声音的音色好", "C. 隔墙有耳说明固体能传声", "D. 以上都对"],
        answer: 3, knowledge: "综合判断", relatedCard: "A14"
      },
      {
        id: "Q_S_109", domain: "声", difficulty: "challenge",
        question: "不带花蜜的蜜蜂飞行时翅膀每秒振动约440次带花蜜的约300次。养蜂人根据什么判断蜜蜂是否采了蜜？",
        options: ["A. 响度", "B. 音调", "C. 音色", "D. 传播速度"],
        answer: 1, knowledge: "频率不同音调不同", relatedCard: "S08"
      },
      {
        id: "Q_S_110", domain: "声", difficulty: "challenge",
        question: "下列关于骨传导的说法正确的是？",
        options: ["A. 骨传导是指声音通过骨头传播到听觉神经", "B. 贝多芬晚年用木棍听钢琴是利用了骨传导", "C. 骨传导不需要空气作为介质", "D. 以上都对"],
        answer: 3, knowledge: "骨传导", relatedCard: "A14"
      },
      {
        id: "Q_S_111", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音可以在真空中传播", "B. 声音可以在空气中传播", "C. 声音速度比光速快", "D. 声音在各种介质中速度相同"],
        answer: 1, knowledge: "声音需要介质", relatedCard: "A14"
      },
      {
        id: "Q_S_112", domain: "声", difficulty: "basic",
        question: "下列关于声现象的说法中正确的是？",
        options: ["A. 声音是由物体的振动产生的", "B. 声音在真空中传播速度最大", "C. 物体振动得越快声音的传播速度越大", "D. 公路旁安装隔音墙是为了在声源处减弱噪声"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_113", domain: "声", difficulty: "basic",
        question: "在公共场所轻声说话而不高声喧哗，这里轻声和高声是指声音的？",
        options: ["A. 响度", "B. 音调", "C. 音色", "D. 频率"],
        answer: 0, knowledge: "响度", relatedCard: "S08"
      },
      {
        id: "Q_S_114", domain: "声", difficulty: "basic",
        question: "下列有关声音的说法错误的是？",
        options: ["A. 声音在固体中传播速度一般大于在液体中", "B. 声音的传播需要介质", "C. 声音在真空中也能传播", "D. 真空不能传播声音"],
        answer: 2, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_115", domain: "声", difficulty: "basic",
        question: "下列四个句子中高字指音调的是？",
        options: ["A. 这首歌调太高我唱不上去", "B. 引吭高歌", "C. 她是女高音歌唱家", "D. 请勿高声喧哗"],
        answer: 0, knowledge: "A=音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_116", domain: "声", difficulty: "basic",
        question: "以下属于在声源处控制噪声的是？",
        options: ["A. 在公路两侧植树", "B. 安装隔音墙", "C. 给机器加装隔音罩", "D. 戴防噪声耳罩"],
        answer: 2, knowledge: "隔音罩=声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_117", domain: "声", difficulty: "basic",
        question: "下列事例中不能说明声音能传递信息的是？",
        options: ["A. 医生用听诊器检查心肺", "B. 超声波清洁器清洗眼镜", "C. 铁路工人用铁锤敲击钢轨检查螺栓", "D. 回音壁"],
        answer: 1, knowledge: "清洗=能量", relatedCard: "A45"
      },
      {
        id: "Q_S_118", domain: "声", difficulty: "basic",
        question: "下列措施中在传播过程中减弱噪声的是？",
        options: ["A. 在市区内禁止机动车鸣笛", "B. 在汽车的排气管上加消声器", "C. 在街道两旁植树造林", "D. 在主要街道安装噪声监测装置"],
        answer: 2, knowledge: "植树造林=传播中", relatedCard: "S11"
      },
      {
        id: "Q_S_119", domain: "声", difficulty: "basic",
        question: "下列关于声现象的说法中不正确的是？",
        options: ["A. 声音可以在真空中传播", "B. 声音在15°C空气中是340m/s", "C. 回音壁和耳廓都利用声音反射", "D. 外科医生利用超声振动除去结石说明声音能传递能量"],
        answer: 0, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_120", domain: "声", difficulty: "basic",
        question: "下列关于声音的说法中不正确的是？",
        options: ["A. 声音是由物体振动产生的", "B. 震耳欲聋说明声音的音调高", "C. 声音在真空中不能传播", "D. 超声波的频率高于20000Hz"],
        answer: 1, knowledge: "震耳欲聋=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_121", domain: "声", difficulty: "basic",
        question: "以下不能减弱噪声的是？",
        options: ["A. 摩托车上安装消声器", "B. 机场工作人员佩戴有耳罩的头盔", "C. 街头设置噪声监测仪", "D. 高架道路两侧建起透明板墙"],
        answer: 2, knowledge: "监测仪不减弱", relatedCard: "S07"
      },
      {
        id: "Q_S_122", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音在不同介质中的传播速度相同", "B. 人说话是靠舌头振动发声的", "C. 只要物体在振动人耳就能听到声音", "D. 一切发声的物体都在振动"],
        answer: 3, knowledge: "振动发声", relatedCard: "S08"
      },
      {
        id: "Q_S_123", domain: "声", difficulty: "basic",
        question: "先轻敲一个大钟再用力敲这个大钟两次听到大钟发出的声音？",
        options: ["A. 音调不同", "B. 响度不同", "C. 音色不同", "D. 三者都不同"],
        answer: 1, knowledge: "力大响度大", relatedCard: "S08"
      },
      {
        id: "Q_S_124", domain: "声", difficulty: "basic",
        question: "铁路工人检查车轮时用锤子敲击车轮通过声音判断有无损伤这是根据？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "完好与损坏音色不同", relatedCard: "S08"
      },
      {
        id: "Q_S_125", domain: "声", difficulty: "basic",
        question: "下列措施属于在传播过程中阻断噪声的是？",
        options: ["A. 摩托车安装消声器", "B. 纺织工人戴防噪声耳罩", "C. 城市道路旁安装隔音板", "D. 放鞭炮时用手捂住耳朵"],
        answer: 2, knowledge: "隔音板=传播中", relatedCard: "S11"
      },
      {
        id: "Q_S_126", domain: "声", difficulty: "basic",
        question: "下列关于声现象的说法中正确的是？",
        options: ["A. 声音在空气中的传播速度是3×10⁸m/s", "B. 人是靠音调区分不同乐器发出的声音", "C. 人歌唱时歌声是由声带振动发出的", "D. 禁止鸣喇叭属于阻断噪声传播"],
        answer: 2, knowledge: "声带振动", relatedCard: "S08"
      },
      {
        id: "Q_S_127", domain: "声", difficulty: "basic",
        question: "关于声现象下面说法中正确的是？",
        options: ["A. 声音是由物体的振动产生的", "B. 声音的传播不需要介质", "C. 声速等于光速", "D. 声音在各种介质中速度相同"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_128", domain: "声", difficulty: "basic",
        question: "关于声音下列说法正确的是？",
        options: ["A. 振动停止后声音立即消失", "B. 声音在空气中速度保持340m/s不变", "C. 低声细语指的是声音的响度小", "D. 只要物体振动我们就能听到声音"],
        answer: 2, knowledge: "低声细语=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_129", domain: "声", difficulty: "basic",
        question: "日常用语中的高有时指音调有时指响度。下列高指响度的是？",
        options: ["A. 男高音", "B. 高声喧哗", "C. 女高音", "D. 音调太高唱不上去"],
        answer: 1, knowledge: "高声喧哗=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_130", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法错误的是？",
        options: ["A. 诗句不敢高声语恐惊天上人中的高是指声音的音调高", "B. 两名宇航员在太空中不能直接对话是因为真空不能传声", "C. 发出较强声音的喇叭能使烛焰跳舞说明声音具有能量", "D. 听不同乐器弹奏同一首歌曲能分辨出乐器是利用了音色不同"],
        answer: 0, knowledge: "诗句中=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_131", domain: "声", difficulty: "basic",
        question: "摩托车上安装消声器是在什么环节减弱噪声？",
        options: ["A. 声源处", "B. 传播过程中", "C. 人耳处", "D. 以上都不是"],
        answer: 0, knowledge: "声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_132", domain: "声", difficulty: "basic",
        question: "工厂用的防噪声耳罩是在什么环节减弱噪声？",
        options: ["A. 声源处", "B. 传播过程中", "C. 人耳处", "D. 以上都不是"],
        answer: 2, knowledge: "人耳处", relatedCard: "S07"
      },
      {
        id: "Q_S_133", domain: "声", difficulty: "basic",
        question: "下列现象中利用回声的是？",
        options: ["A. 渔民利用声呐探测鱼群", "B. 雷雨天时先看到闪电后听到雷声", "C. 录音棚内墙壁上装有吸音材料", "D. 医生用听诊器检查病情"],
        answer: 0, knowledge: "声呐=回声", relatedCard: "A14"
      },
      {
        id: "Q_S_134", domain: "声", difficulty: "basic",
        question: "关于声音下列说法中正确的是？",
        options: ["A. 物体的振幅越大发出声音的音调越高", "B. 声音在真空中传播的速度是3×10⁸m/s", "C. 街头安装的噪声监测仪可以减弱噪声", "D. 超声波次声波是人耳听不到的声音"],
        answer: 3, knowledge: "超声波次声波听不到", relatedCard: "A09"
      },
      {
        id: "Q_S_135", domain: "声", difficulty: "basic",
        question: "人耳能听到声音的条件是？",
        options: ["A. 有发声体", "B. 有介质", "C. 频率在20-20000Hz内", "D. 以上三个条件缺一不可"],
        answer: 3, knowledge: "听声三条件", relatedCard: "S08"
      },
      {
        id: "Q_S_136", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法错误的是？",
        options: ["A. 一切正在发声的物体都在振动", "B. 声音在真空中传播的速度最大", "C. 声音在固体中传播速度一般大于液体", "D. 不同声音在同一均匀介质中传播速度相同"],
        answer: 1, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_137", domain: "声", difficulty: "basic",
        question: "下面的几种情况中不能利用声音来传播信息的是？",
        options: ["A. 用超声波清洗眼镜", "B. 隆隆的雷声预示大雨", "C. 医生用听诊器检查身体", "D. 有经验工人通过机器转动声判断故障"],
        answer: 0, knowledge: "清洗=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_138", domain: "声", difficulty: "basic",
        question: "以下不属于超声波应用的是？",
        options: ["A. 金属探伤", "B. 医用B超诊断", "C. 倒车雷达", "D. 地震预报"],
        answer: 3, knowledge: "地震=次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_139", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音可以在固体中传播", "B. 声音传播速度与温度无关", "C. 声音在真空中传播最快", "D. 只要物体振动我们就能听到声音"],
        answer: 0, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_140", domain: "声", difficulty: "basic",
        question: "将鼓响的鼓面用手一按响声立即就消失了下列原因中正确的是？",
        options: ["A. 声波传到鼓内去了", "B. 鼓面停止了振动", "C. 鼓的振动变快了", "D. 以上都不对"],
        answer: 1, knowledge: "振动停止", relatedCard: "S08"
      },
      {
        id: "Q_S_141", domain: "声", difficulty: "basic",
        question: "蛇没有耳朵但我们知道它却是用头贴地的方式来收集声音这是为什么？",
        options: ["A. 头贴地能防止其他动物的攻击", "B. 固体传声效果好", "C. 空气中的声音只能传到地面上", "D. 蛇的头贴地时能听到超声波"],
        answer: 1, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_142", domain: "声", difficulty: "advanced",
        question: "百米赛跑时终点计时员应看到发令枪冒烟时开始计时而不是听到枪声时开始计时。这是因为？",
        options: ["A. 看烟比听声更清楚", "B. 光速远大于声速可以减少计时误差", "C. 枪声太响影响计时", "D. 发令枪可能不响"],
        answer: 1, knowledge: "光速>声速", relatedCard: "A14"
      },
      {
        id: "Q_S_143", domain: "声", difficulty: "advanced",
        question: "下列关于声现象的说法正确的是？",
        options: ["A. 只要物体振动就一定能听到声音", "B. 声音在真空中传播最快", "C. 声音的传播速度与介质的种类有关", "D. 声音在空气中的传播速度一定是340m/s"],
        answer: 2, knowledge: "声速与介质有关", relatedCard: "A14"
      },
      {
        id: "Q_S_144", domain: "光", difficulty: "advanced",
        question: "夜晚当汽车发出的光照射到自行车尾灯上时司机看到尾灯反射的光就能及时避让。以下说法正确的是？",
        options: ["A. 自行车尾灯是光源", "B. 这是利用声音反射", "C. 尾灯是角反射器能按原方向反射光", "D. 以上都不对"],
        answer: 2, knowledge: "角反射器", relatedCard: "A14"
      },
      {
        id: "Q_S_145", domain: "声", difficulty: "advanced",
        question: "下列控制噪声的措施中，属于防止噪声产生的是？",
        options: ["A. 关闭房间的门窗", "B. 会场内把手机调到无声状态", "C. 高速公路房屋装隔音窗", "D. 机场跑道工作人员使用防噪声耳罩"],
        answer: 1, knowledge: "手机静音=声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_146", domain: "声", difficulty: "challenge",
        question: "关于声现象下列说法中不正确的是？",
        options: ["A. 声音可以在真空中传播", "B. 声音在15°C空气中是340m/s", "C. 回音壁利用声音反射原理", "D. 外科医生利用超声振动除去结石说明声音能传递能量"],
        answer: 0, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_147", domain: "声", difficulty: "challenge",
        question: "下列关于声现象的说法中错误的是？",
        options: ["A. 诗句中的高是指声音的音调高", "B. 两名宇航员在太空中不能直接对话", "C. 发出较强声音的喇叭能使烛焰跳舞", "D. 听不同乐器弹奏能分辨出乐器是利用了音色不同"],
        answer: 0, knowledge: "诗句中=响度(需看上下文)", relatedCard: "S08"
      },
      {
        id: "Q_S_148", domain: "声", difficulty: "challenge",
        question: "下列关于声现象的说法正确的是？",
        options: ["A. 超声波不是由物体振动产生的", "B. 高速公路两旁的隔音板可以防止噪声的产生", "C. 声音在真空中传播速度最快", "D. 声音能传递信息也能传递能量"],
        answer: 3, knowledge: "声传递信息和能量", relatedCard: "A14"
      },
      {
        id: "Q_S_149", domain: "声", difficulty: "challenge",
        question: "下列是探究声现象的四种实验情景下列说法正确的是？",
        options: ["A. 甲实验说明声音的传播需要介质", "B. 乙实验说明钢尺振动的频率越高响度越大", "C. 丙实验说明音叉的振幅越大音调越高", "D. 丁实验说明声波不能传递能量"],
        answer: 0, knowledge: "抽气实验", relatedCard: "A14"
      },
      {
        id: "Q_S_150", domain: "声", difficulty: "challenge",
        question: "关于声现象下列说法中不正确的是？",
        options: ["A. 声音在固体中的传播速度一般比在空气中快", "B. 声音在真空中不能传播", "C. 所有的声音都是由于振动产生的", "D. 超声波不可以在真空中传播"],
        answer: 3, knowledge: "超声波也需要介质", relatedCard: "A09"
      },
      {
        id: "Q_S_151", domain: "声", difficulty: "basic",
        question: "音乐会上不同的乐器演奏同一首乐曲我们也能分辨出不同乐器发出的声音，这主要是依据？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "音色", relatedCard: "S08"
      },
      {
        id: "Q_S_152", domain: "声", difficulty: "basic",
        question: "发生地震时会产生次声波关于次声波下列说法正确的是？",
        options: ["A. 次声波可以在真空中传播", "B. 次声波的频率高于20000Hz", "C. 次声波的传播速度比超声波慢", "D. 某些动物可以听到次声波"],
        answer: 3, knowledge: "动物能听次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_153", domain: "声", difficulty: "basic",
        question: "下列关于声音的说法正确的是？",
        options: ["A. 声音是由物体振动产生的", "B. 声音在真空中传播速度最大", "C. 低声细语是指声音的音调低", "D. 物体振动停止声音立即消失"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_154", domain: "声", difficulty: "basic",
        question: "下列有关声音的说法错误的是？",
        options: ["A. 声音在固体中传播速度一般大于在液体中", "B. 声音的传播需要介质", "C. 声音在真空中也能传播", "D. 真空不能传播声音"],
        answer: 2, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_155", domain: "声", difficulty: "basic",
        question: "下列四个句子中高字指音调的是？",
        options: ["A. 这首歌调太高我唱不上去", "B. 引吭高歌", "C. 她是女高音歌唱家", "D. 请勿高声喧哗"],
        answer: 0, knowledge: "调高=音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_156", domain: "声", difficulty: "basic",
        question: "电话里能分辨出是谁在说话主要是依据声音的？",
        options: ["A. 响度", "B. 音调", "C. 音色", "D. 频率"],
        answer: 2, knowledge: "音色识人", relatedCard: "A45"
      },
      {
        id: "Q_S_157", domain: "声", difficulty: "advanced",
        question: "不带花蜜的蜜蜂飞行时翅膀每秒约振动440次带花蜜的约300次。不带花蜜的嗡嗡声比带花蜜的？",
        options: ["A. 音调高", "B. 音调低", "C. 响度大", "D. 响度小"],
        answer: 0, knowledge: "频率高音调高", relatedCard: "S08"
      },
      {
        id: "Q_S_158", domain: "声", difficulty: "advanced",
        question: "下列有关声音的说法正确的是？",
        options: ["A. 只要物体振动人就一定能听到声音", "B. 地震火山喷发等自然现象都伴有次声波的产生", "C. 声音在固体中传播速度一定比液体中快", "D. 安装噪声监测仪可以减弱噪声"],
        answer: 1, knowledge: "自然灾害产生次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_159", domain: "声", difficulty: "advanced",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 声音在真空中传播的速度是340m/s", "B. 中考期间学校路段禁止鸣喇叭是在传播过程中减弱噪声", "C. 用超声波粉碎人体内的结石说明超声波具有能量", "D. 发声体的振动频率越高响度越大"],
        answer: 2, knowledge: "超声波粉碎=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_160", domain: "声", difficulty: "challenge",
        question: "关于声音的利用下列说法不正确的是？",
        options: ["A. 中医望闻问切中闻是利用声音传递信息", "B. 火山爆发地震会产生超声波", "C. 外科利用超声波除去结石是利用声音传递能量", "D. 大象通过次声波进行交流"],
        answer: 1, knowledge: "地震=次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_161", domain: "声", difficulty: "challenge",
        question: "关于声现象的描述下列说法正确的是？",
        options: ["A. 声音在真空中传播的速度最快", "B. 只要物体振动我们就一定能听到声音", "C. 声音能够传递信息和能量", "D. 物体振动的频率越高发出声音的响度越大"],
        answer: 2, knowledge: "声能传递信息和能量", relatedCard: "A14"
      },
      {
        id: "Q_S_162", domain: "声", difficulty: "basic",
        question: "下面关于声现象的配对中错误的是？",
        options: ["A. 闻其声知其人——发声体不同音色不同", "B. 长啸一声山鸣谷应——次声波传播很远", "C. 隔墙有耳——固体也能传声", "D. 用超声波清洗眼镜——声波可以传播能量"],
        answer: 1, knowledge: "山谷回声不是次声波", relatedCard: "A14"
      },
      {
        id: "Q_S_163", domain: "声", difficulty: "basic",
        question: "下列现象中不能说明声音的产生的是？",
        options: ["A. 正在发声的音叉将乒乓球弹开", "B. 人在岸上大声说话也能把水中的鱼吓跑", "C. 敲鼓时鼓面放些碎纸屑纸屑会跳起来", "D. 喇叭发声时纸盆上的小纸屑在上下跳动"],
        answer: 1, knowledge: "声音传播不是产生", relatedCard: "S08"
      },
      {
        id: "Q_S_164", domain: "声", difficulty: "basic",
        question: "小明把耳朵贴在长铁管的一端小芳在另一端敲击铁管小明先后听到两次响声。对此下列说法正确的是？",
        options: ["A. 两次声音是回声", "B. 先听到从空气传来的声音", "C. 先听到由铁管传来的声音", "D. 后听到由铁管传来的声音"],
        answer: 2, knowledge: "铁管传声快", relatedCard: "A14"
      },
      {
        id: "Q_S_165", domain: "声", difficulty: "basic",
        question: "以下关于声音的说法正确的是？",
        options: ["A. 声音不可以在真空中传播", "B. 声音在真空中传播最快", "C. 声音在固体中传播一定比在液体中快", "D. 声音在空气中一定比在水中快"],
        answer: 0, knowledge: "真空不能传声", relatedCard: "A14"
      },
      {
        id: "Q_S_166", domain: "声", difficulty: "basic",
        question: "工人师傅检查机器运转情况时常常把金属杆的一端靠在机器外壳上另一端接触耳朵，这是为了？",
        options: ["A. 听得更清楚因为固体传声效果好", "B. 防止噪声", "C. 防止触电", "D. 习惯动作"],
        answer: 0, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_167", domain: "声", difficulty: "basic",
        question: "关于声音下列说法中正确的是？",
        options: ["A. 物体振幅越大发出声音的音调越高", "B. 声音在真空中传播速度是3×10⁸m/s", "C. 街头安装的噪声监测仪可以减弱噪声", "D. 超声波次声波是人耳听不到的声音"],
        answer: 3, knowledge: "超声波次声波听不到", relatedCard: "A09"
      },
      {
        id: "Q_S_168", domain: "声", difficulty: "advanced",
        question: "以下几个实验现象能说明声音产生原因的是？",
        options: ["A. 放在玻璃钟罩内的闹钟发声抽去空气后铃声减小", "B. 把正在发声的收音机密封后放入水中仍能听到", "C. 拉小提琴时琴弦松紧程度不同发出声音不同", "D. 拨动吉他琴弦时琴弦看上去好像在振动"],
        answer: 3, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_169", domain: "声", difficulty: "advanced",
        question: "以下措施中在声源处减弱噪声的是？",
        options: ["A. 在道路两旁植树", "B. 给机器加隔音罩", "C. 戴上防噪声耳罩", "D. 在道路旁安装隔音板"],
        answer: 1, knowledge: "声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_170", domain: "声", difficulty: "advanced",
        question: "一场大雪过后人们会感到外面万籁俱静，原因你认为正确的是？",
        options: ["A. 大雪后大地银装素裹噪声被反射", "B. 大雪蓬松且多孔对噪声有吸收作用", "C. 大雪后行驶车辆减少", "D. 大雪后气温较低声速变慢"],
        answer: 1, knowledge: "雪多孔吸音", relatedCard: "S11"
      },
      {
        id: "Q_S_171", domain: "声", difficulty: "challenge",
        question: "下列关于声现象的说法正确的是？",
        options: ["A. 声音是由物体的振动产生的", "B. 声音在15°C的真空中传播速度为340m/s", "C. 不敢高声语恐惊天上人中的高是指音调高", "D. 动听的音乐肯定不是噪声"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_172", domain: "声", difficulty: "basic",
        question: "关于声现象下面说法中正确的是？",
        options: ["A. 声音是由物体的振动产生的", "B. 声音的传播不需要介质", "C. 声速等于光速", "D. 声音在各种介质中的速度相同"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_173", domain: "声", difficulty: "basic",
        question: "下列现象中利用回声的是？",
        options: ["A. 渔民利用声呐探测鱼群", "B. 雷雨天时先看到闪电后听到雷声", "C. 录音棚内墙壁上装有吸音材料", "D. 医生用听诊器检查病情"],
        answer: 0, knowledge: "声呐=回声", relatedCard: "A14"
      },
      {
        id: "Q_S_174", domain: "声", difficulty: "basic",
        question: "下列哪种方法不能减弱噪声？",
        options: ["A. 将噪声大工厂建在远离居民区", "B. 在马路和住宅间设屏障或植树", "C. 戴防噪声耳罩", "D. 打开门窗通风"],
        answer: 3, knowledge: "开门窗不减弱噪声", relatedCard: "S07"
      },
      {
        id: "Q_S_175", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法中正确的是？",
        options: ["A. 声音在真空中传播得最快", "B. 正在发声的物体都在振动", "C. 发声体振动越快声音传播越快", "D. 公路旁安装隔音墙是为了在声源处减弱噪声"],
        answer: 1, knowledge: "振动发声", relatedCard: "S08"
      },
      {
        id: "Q_S_176", domain: "声", difficulty: "basic",
        question: "超声波和次声波都是人耳听不到的声音。以下关于它们的说法正确的是？",
        options: ["A. 超声波的频率低于20Hz", "B. 次声波的频率高于20000Hz", "C. 超声波可以在真空中传播", "D. 次声波可以传递信息"],
        answer: 3, knowledge: "次声波传递信息", relatedCard: "A10"
      },
      {
        id: "Q_S_177", domain: "声", difficulty: "basic",
        question: "将音叉的振动放大下列哪个实验方法最常用？",
        options: ["A. 将音叉放入水中", "B. 用更大的力敲击音叉", "C. 将音叉做得更大", "D. 敲击音叉后用放大镜观察"],
        answer: 0, knowledge: "放大振动", relatedCard: "S08"
      },
      {
        id: "Q_S_178", domain: "声", difficulty: "basic",
        question: "在雷雨来临之前电光一闪即逝但雷声却隆隆不断这是为什么？",
        options: ["A. 雷一个接一个打", "B. 双耳效应", "C. 雷声经过地面山岳和云层多次反射", "D. 闪电的速度比雷声快"],
        answer: 2, knowledge: "雷声多次反射", relatedCard: "A14"
      },
      {
        id: "Q_S_179", domain: "声", difficulty: "basic",
        question: "先轻敲一个大钟再用力敲同一个大钟两次听到的声音？",
        options: ["A. 音调不同", "B. 响度不同", "C. 音色不同", "D. 以上三者都不同"],
        answer: 1, knowledge: "力大响度大", relatedCard: "S08"
      },
      {
        id: "Q_S_180", domain: "声", difficulty: "basic",
        question: "下列措施中属于在人耳处减弱噪声的是？",
        options: ["A. 机动车在市内禁止鸣笛", "B. 学校附近禁止汽车鸣笛", "C. 在嘈杂的环境中戴上耳塞", "D. 在马路和住宅间植树造林"],
        answer: 2, knowledge: "人耳处", relatedCard: "S07"
      },
      {
        id: "Q_S_181", domain: "声", difficulty: "basic",
        question: "关于声速下列说法正确的是？",
        options: ["A. 声音在真空中传播的速度最大", "B. 声音在固体中传播速度一定大于液体", "C. 15°C时空气中的声速是340m/s", "D. 声音在同种均匀介质中的传播速度会变化"],
        answer: 2, knowledge: "15°C声速", relatedCard: "A14"
      },
      {
        id: "Q_S_182", domain: "声", difficulty: "basic",
        question: "下列现象说明声能够传递能量的是？",
        options: ["A. 利用声呐探测鱼群", "B. 医生通过听诊器给病人诊病", "C. 利用超声波清洗精密机械", "D. 蝙蝠靠超声波探测飞行中的障碍物"],
        answer: 2, knowledge: "清洗=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_183", domain: "声", difficulty: "advanced",
        question: "我们学过的许多成语包含了声现象，如隔墙有耳说明什么可以传播声音？",
        options: ["A. 真空", "B. 只有空气", "C. 固体", "D. 只有液体"],
        answer: 2, knowledge: "固体传声", relatedCard: "A14"
      },
      {
        id: "Q_S_184", domain: "声", difficulty: "advanced",
        question: "2008年汶川大地震广播里传来人民的生命高于一切的亲切话语我们能清楚地辨别出这是温家宝总理的声音这应用了声音的？",
        options: ["A. 响度", "B. 音调", "C. 音色", "D. 振幅"],
        answer: 2, knowledge: "音色", relatedCard: "A45"
      },
      {
        id: "Q_S_185", domain: "声", difficulty: "advanced",
        question: "关于声音的传播下列说法正确的是？",
        options: ["A. 声音只能在空气中传播", "B. 声音在固体中比在空气中慢", "C. 声音在真空中传播速度最快", "D. 声音传播需要介质真空不能传声"],
        answer: 3, knowledge: "声音需要介质", relatedCard: "A14"
      },
      {
        id: "Q_S_186", domain: "声", difficulty: "advanced",
        question: "以下不是利用声传递信息的是？",
        options: ["A. 利用声呐探测海底深度", "B. 医生用B超检查身体", "C. 超声波雾化器", "D. 蝙蝠靠超声波确定目标"],
        answer: 2, knowledge: "雾化器=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_187", domain: "声", difficulty: "challenge",
        question: "如图所示将发声的音叉与面颊接触有麻麻的感觉。此事实说明？",
        options: ["A. 发声的物体在振动", "B. 声音通过固体传播", "C. 声音传播不需要时间", "D. 声音是以波的形式传播"],
        answer: 0, knowledge: "振动证明", relatedCard: "S08"
      },
      {
        id: "Q_S_188", domain: "声", difficulty: "challenge",
        question: "在非洲干旱炎热的草原上万籁俱寂一群大象慢慢地向前走小象在母亲旁边听话地跟着。这群象突然停下来领头象扬起鼻子站在最前面。下列叙述正确的是？",
        options: ["A. 大象是利用超声波进行交流的", "B. 大象能听到很远的地方传来的次声波", "C. 大象是利用电磁波交流的", "D. 大象之间的交流不需要介质"],
        answer: 1, knowledge: "大象=次声波", relatedCard: "A10"
      },
      {
        id: "Q_S_189", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法错误的是？",
        options: ["A. 诗句不敢高声语恐惊天上人中的高是指声音的音调高", "B. 两名宇航员在太空中不能直接对话是因为真空不能传声", "C. 发出较强声音的喇叭能使烛焰跳舞说明声音具有能量", "D. 听不同乐器弹奏能分辨出所用乐器是利用音色不同"],
        answer: 0, knowledge: "诗句中=响度", relatedCard: "S08"
      },
      {
        id: "Q_S_190", domain: "声", difficulty: "basic",
        question: "在雷雨来临之前电光一闪即逝但雷声却隆隆不断，这是因为？",
        options: ["A. 雷声经过了地面山岳云层的多次反射", "B. 一个接一个的雷声", "C. 双耳效应", "D. 闪电比雷声快"],
        answer: 0, knowledge: "雷声多次反射", relatedCard: "A14"
      },
      {
        id: "Q_S_191", domain: "声", difficulty: "basic",
        question: "以下关于超声波的说法正确的是？",
        options: ["A. 超声波可以在真空中传播", "B. 超声波的频率低于20Hz", "C. 超声波可以用来清洗钟表等精密机械", "D. 人耳可以听到超声波"],
        answer: 2, knowledge: "超声波清洗", relatedCard: "A09"
      },
      {
        id: "Q_S_192", domain: "声", difficulty: "basic",
        question: "老师讲课时所用扩音器的作用是？",
        options: ["A. 改变音调", "B. 改变音色", "C. 增大响度", "D. 减小响度"],
        answer: 2, knowledge: "增大响度", relatedCard: "S08"
      },
      {
        id: "Q_S_193", domain: "声", difficulty: "basic",
        question: "正在拉二胡的同学不断用手指去控制琴弦这样做的目的是？",
        options: ["A. 使二胡发出不同的音调", "B. 为了获得更好的音色", "C. 为了获得更大的响度", "D. 阻止琴弦振动发声"],
        answer: 0, knowledge: "改变音调", relatedCard: "S08"
      },
      {
        id: "Q_S_194", domain: "声", difficulty: "basic",
        question: "声音在传播过程中下列说法正确的是？",
        options: ["A. 音调会逐渐改变", "B. 响度会逐渐改变", "C. 音色会逐渐改变", "D. 三者都不变"],
        answer: 1, knowledge: "传播中只有响度变", relatedCard: "D02"
      },
      {
        id: "Q_S_195", domain: "声", difficulty: "advanced",
        question: "医用B超机是利用超声波来诊断病情的，但人耳听不到它的声音，这是因为？",
        options: ["A. 声音的响度太小", "B. 声音的频率低于人耳能听到的范围", "C. 声音的响度太大", "D. 声音的频率高于人耳能听到的范围"],
        answer: 3, knowledge: "超声波频率高", relatedCard: "A09"
      },
      {
        id: "Q_S_196", domain: "声", difficulty: "advanced",
        question: "下面做法中不能减弱噪声的是？",
        options: ["A. 在教室周围植树", "B. 休息时将手机调成静音模式", "C. 在公路旁安装隔音板", "D. 打开门窗通风"],
        answer: 3, knowledge: "开门窗不能减弱噪声", relatedCard: "S07"
      },
      {
        id: "Q_S_197", domain: "声", difficulty: "basic",
        question: "下列控制噪声的措施中，属于在声源处减弱噪声的是？",
        options: ["A. 晚上休息时关闭房间的门窗", "B. 在道路旁植树造林", "C. 公共场所禁止喧哗", "D. 机场工作人员佩戴有耳机的头盔"],
        answer: 2, knowledge: "禁止喧哗=声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_198", domain: "声", difficulty: "basic",
        question: "下列说法正确的是？",
        options: ["A. 人耳听不到的声音一定是超声波", "B. 声音在各种介质中的传播速度是一样的", "C. 太空中宇航员可以通过无线电进行交流", "D. 只要物体振动我们就能听到声音"],
        answer: 2, knowledge: "太空=无线电", relatedCard: "A14"
      },
      {
        id: "Q_S_199", domain: "声", difficulty: "basic",
        question: "交通噪声是城市噪声的主要来源之一下列做法中不能减少交通噪声的是？",
        options: ["A. 在交通要道两旁植树造林", "B. 汽车排气管上安装消声器", "C. 在公路旁设置噪声监测仪", "D. 在公路两旁安装隔音板"],
        answer: 2, knowledge: "监测仪不减弱噪声", relatedCard: "S07"
      },
      {
        id: "Q_S_200", domain: "声", difficulty: "basic",
        question: "甲同学将耳朵贴在一根长铁管的一端乙同学在另一端敲一下铁管甲听到的情况是？",
        options: ["A. 响了一下从铁管传来的", "B. 响了一下从空气传来的", "C. 响了两下先听到铁管传来的", "D. 响了两下先听到空气中传来的"],
        answer: 2, knowledge: "铁管声速快", relatedCard: "A14"
      },
      {
        id: "Q_S_201", domain: "声", difficulty: "basic",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 超声波不是由物体振动产生的", "B. 高速公路两旁的隔音板可以防止噪声的产生", "C. 声音在真空中传播速度最快", "D. 声音能传递信息也能传递能量"],
        answer: 3, knowledge: "声传递信息和能量", relatedCard: "A14"
      },
      {
        id: "Q_S_202", domain: "声", difficulty: "advanced",
        question: "关于声音下列说法不正确的是？",
        options: ["A. 公共场所不要大声喧哗是要求人们说话响度放低些", "B. 用超声波清洗眼镜说明声音可以传递能量", "C. 声音在任何介质中的传播速度都是340m/s", "D. 中考期间考场附近禁止鸣笛是在声源处控制噪声"],
        answer: 2, knowledge: "不同介质声速不同", relatedCard: "A14"
      },
      {
        id: "Q_S_203", domain: "声", difficulty: "challenge",
        question: "关于声现象下列说法正确的是？",
        options: ["A. 一切发声的物体都在振动", "B. 声音在真空中比在空气中传播得快", "C. 声音的音调越高传播得越快", "D. 声音的传播速度与温度无关"],
        answer: 0, knowledge: "振动产生声", relatedCard: "S08"
      },
      {
        id: "Q_S_204", domain: "声", difficulty: "basic",
        question: "关于声的知识下列说法错误的是？",
        options: ["A. 声音借助介质以波的形式传播", "B. 利用超声波清洗钟表说明声音可以传递信息", "C. 高声大叫中的高实际是指响度大", "D. 在城市道路旁设置隔音板是为了在传播过程中减弱噪声"],
        answer: 1, knowledge: "清洗=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_205", domain: "声", difficulty: "basic",
        question: "下列控制噪声的措施中属于防止噪声产生的是？",
        options: ["A. 关闭房间的门窗", "B. 会场内把手机调到无声状态", "C. 高速公路旁的房屋装隔音窗", "D. 机场跑道工作人员使用防噪声耳罩"],
        answer: 1, knowledge: "手机静音=声源处", relatedCard: "S07"
      },
      {
        id: "Q_S_206", domain: "声", difficulty: "basic",
        question: "在操场上上体育课时体育老师发出的口令近了的学生听到了而远一点的学生没有听清楚主要原因是？",
        options: ["A. 远处的学生听到的声音响度小", "B. 老师发出的声音音色不好", "C. 老师发出的声音频率低", "D. 远处的学生听到的声音振动幅度大"],
        answer: 0, knowledge: "距离远响度小", relatedCard: "D02"
      },
      {
        id: "Q_S_207", domain: "声", difficulty: "advanced",
        question: "下列现象中不是利用声波传递信息的是？",
        options: ["A. 有经验的养蜂人听飞行声音判断蜜蜂是否采了蜜", "B. 利用超声波粉碎人体内的结石", "C. 利用声呐探测海底深度", "D. 蝙蝠利用超声波确定目标位置"],
        answer: 1, knowledge: "粉碎结石=能量", relatedCard: "A09"
      },
      {
        id: "Q_S_208", domain: "声", difficulty: "advanced",
        question: "有一种专门存放贵重物品的银行当人们存放了自己的贵重物品后要用仪器记录下自己的手纹眼纹声纹等。这里的声纹主要记录的是人说话的？",
        options: ["A. 音调", "B. 响度", "C. 音色", "D. 三者都有"],
        answer: 2, knowledge: "声纹=音色", relatedCard: "A45"
      },
      {
        id: "Q_S_209", domain: "声", difficulty: "basic",
        question: "声音在下列介质中传播速度最小的是？",
        options: ["A. 空气", "B. 水", "C. 钢铁", "D. 玻璃"],
        answer: 0, knowledge: "空气中声速最小", relatedCard: "A14"
      },
      {
        id: "Q_S_210", domain: "声", difficulty: "basic",
        question: "为了探究声音的响度与振幅的关系小明设计实验。下列能完成目的的是？",
        options: ["A. 把罩内的空气抽去一些后闹钟铃声明显变小", "B. 用力吹一根细管并不断剪短声音变高", "C. 用大小不同的力敲击同一音叉观察乒乓球被弹开的幅度", "D. 把正在发声的收音机密封后放入水中仍能听到"],
        answer: 2, knowledge: "力大振幅大", relatedCard: "S08"
      },
      // ==================================================
      // 光 领域
      // ==================================================
      {
        id: "Q_L_001", domain: "光", difficulty: "basic",
        question: "下列物体中属于光源的是？",
        options: ["A. 月亮", "B. 镜子", "C. 太阳", "D. 钻石"],
        answer: 2, knowledge: "光源定义", relatedCard: "S14"
      },
      {
        id: "Q_L_002", domain: "光", difficulty: "basic",
        question: "光在同种均匀介质中沿什么传播？",
        options: ["A. 曲线", "B. 直线", "C. 折线", "D. 任意方向"],
        answer: 1, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_003", domain: "光", difficulty: "basic",
        question: "影子的形成说明了光具有什么性质？",
        options: ["A. 反射", "B. 折射", "C. 直线传播", "D. 色散"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_004", domain: "光", difficulty: "basic",
        question: "光在真空中的传播速度约为？",
        options: ["A. 3×10⁴km/s", "B. 3×10⁵km/s", "C. 3×10⁶km/s", "D. 340m/s"],
        answer: 1, knowledge: "光速", relatedCard: "S14"
      },
      {
        id: "Q_L_005", domain: "光", difficulty: "basic",
        question: "光年是表示什么的单位？",
        options: ["A. 时间", "B. 速度", "C. 长度", "D. 质量"],
        answer: 2, knowledge: "光年是距离单位", relatedCard: "S14"
      },
      {
        id: "Q_L_006", domain: "光", difficulty: "basic",
        question: "日食现象可以用什么原理来解释？",
        options: ["A. 光的折射", "B. 光的反射", "C. 光沿直线传播", "D. 光的色散"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_007", domain: "光", difficulty: "basic",
        question: "反射角与入射角的关系是？",
        options: ["A. 反射角大于入射角", "B. 反射角小于入射角", "C. 反射角等于入射角", "D. 没有固定关系"],
        answer: 2, knowledge: "反射定律", relatedCard: "S16"
      },
      {
        id: "Q_L_008", domain: "光", difficulty: "basic",
        question: "关于平面镜成像下列说法正确的是？",
        options: ["A. 成倒立实像", "B. 像与物大小相等", "C. 像比物大", "D. 像距不等于物距"],
        answer: 1, knowledge: "平面镜成像特点", relatedCard: "S16"
      },
      {
        id: "Q_L_009", domain: "光", difficulty: "basic",
        question: "插入水中的筷子看起来向上弯折这是因为？",
        options: ["A. 光的反射", "B. 光的直线传播", "C. 光的折射", "D. 光的色散"],
        answer: 2, knowledge: "光的折射", relatedCard: "A46"
      },
      {
        id: "Q_L_010", domain: "光", difficulty: "basic",
        question: "一束光从空气斜射入水中折射角比入射角？",
        options: ["A. 大", "B. 小", "C. 相等", "D. 无法确定"],
        answer: 1, knowledge: "空气入水折射角小", relatedCard: "A46"
      },
      {
        id: "Q_L_011", domain: "光", difficulty: "basic",
        question: "凸透镜对光线有什么作用？",
        options: ["A. 发散", "B. 会聚", "C. 无作用", "D. 既不汇聚也不发散"],
        answer: 1, knowledge: "凸透镜汇聚", relatedCard: "A55"
      },
      {
        id: "Q_L_012", domain: "光", difficulty: "basic",
        question: "凹透镜对光线有什么作用？",
        options: ["A. 发散", "B. 会聚", "C. 平行射出", "D. 吸收光线"],
        answer: 0, knowledge: "凹透镜发散", relatedCard: "S16"
      },
      {
        id: "Q_L_013", domain: "光", difficulty: "basic",
        question: "雨后的彩虹是由于光的什么现象形成的？",
        options: ["A. 反射", "B. 折射和色散", "C. 直线传播", "D. 衍射"],
        answer: 1, knowledge: "光的色散", relatedCard: "A16"
      },
      {
        id: "Q_L_014", domain: "光", difficulty: "basic",
        question: "白色太阳光通过三棱镜后可分解为？",
        options: ["A. 三色光", "B. 五色光", "C. 七色光", "D. 九色光"],
        answer: 2, knowledge: "七色光", relatedCard: "A16"
      },
      {
        id: "Q_L_015", domain: "光", difficulty: "basic",
        question: "物体的颜色由什么决定？",
        options: ["A. 物体发出的光", "B. 物体反射的色光", "C. 物体的形状", "D. 物体的大小"],
        answer: 1, knowledge: "不透明体颜色", relatedCard: "A16"
      },
      {
        id: "Q_L_016", domain: "光", difficulty: "basic",
        question: "红外线最显著的性质是什么？",
        options: ["A. 杀菌作用", "B. 热效应", "C. 荧光效应", "D. 电离作用"],
        answer: 1, knowledge: "红外线热效应", relatedCard: "A17"
      },
      {
        id: "Q_L_017", domain: "光", difficulty: "basic",
        question: "紫外线最常用于什么目的？",
        options: ["A. 加热食物", "B. 杀菌消毒", "C. 照明", "D. 测距"],
        answer: 1, knowledge: "紫外线杀菌", relatedCard: "A18"
      },
      {
        id: "Q_L_018", domain: "光", difficulty: "basic",
        question: "我们能从不同方向看到不发光的物体是因为？",
        options: ["A. 镜面反射", "B. 漫反射", "C. 全反射", "D. 折射"],
        answer: 1, knowledge: "漫反射", relatedCard: "S14"
      },
      {
        id: "Q_L_019", domain: "光", difficulty: "basic",
        question: "潜望镜利用了什么光学原理？",
        options: ["A. 光的折射", "B. 光的反射", "C. 光的直线传播", "D. 光的色散"],
        answer: 1, knowledge: "平面镜反射", relatedCard: "S16"
      },
      {
        id: "Q_L_020", domain: "光", difficulty: "basic",
        question: "近视眼应该佩戴什么透镜来矫正？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凸面镜"],
        answer: 1, knowledge: "凹透镜矫正近视", relatedCard: "S16"
      },
      {
        id: "Q_L_021", domain: "光", difficulty: "basic",
        question: "远视眼（老花眼）应该佩戴什么透镜？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凹面镜"],
        answer: 0, knowledge: "凸透镜矫正远视", relatedCard: "S16"
      },
      {
        id: "Q_L_022", domain: "光", difficulty: "basic",
        question: "照相机镜头相当于一个什么透镜？",
        options: ["A. 平面镜", "B. 凸透镜", "C. 凹透镜", "D. 凸面镜"],
        answer: 1, knowledge: "凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_023", domain: "光", difficulty: "basic",
        question: "放大镜是一个什么透镜？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凹面镜"],
        answer: 0, knowledge: "凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_024", domain: "光", difficulty: "basic",
        question: "电影银幕用粗糙的白布做成这是为了？",
        options: ["A. 发生镜面反射", "B. 发生漫反射", "C. 增强光的折射", "D. 发生全反射"],
        answer: 1, knowledge: "漫反射", relatedCard: "S16"
      },
      {
        id: "Q_L_025", domain: "光", difficulty: "basic",
        question: "下列光现象中属于光的折射的是？",
        options: ["A. 水中倒影", "B. 立竿见影", "C. 海市蜃楼", "D. 手影游戏"],
        answer: 2, knowledge: "海市蜃楼=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_026", domain: "光", difficulty: "basic",
        question: "光从水中斜射入空气中时折射角比入射角？",
        options: ["A. 大", "B. 小", "C. 相等", "D. 不确定"],
        answer: 0, knowledge: "水中入空气折射角大", relatedCard: "A46"
      },
      {
        id: "Q_L_027", domain: "光", difficulty: "basic",
        question: "小孔成像成的是？",
        options: ["A. 倒立的虚像", "B. 倒立的实像", "C. 正立的虚像", "D. 正立的实像"],
        answer: 1, knowledge: "倒立实像", relatedCard: "S16"
      },
      {
        id: "Q_L_028", domain: "光", difficulty: "basic",
        question: "下列现象中不能用光的直线传播解释的是？",
        options: ["A. 日食月食", "B. 小孔成像", "C. 影子的形成", "D. 先看到闪电后听到雷声"],
        answer: 3, knowledge: "光速大于声速", relatedCard: "S16"
      },
      {
        id: "Q_L_029", domain: "光", difficulty: "basic",
        question: "一个人站在平面镜前当他走近平面镜时？",
        options: ["A. 像变大距离变大", "B. 像变大距离变小", "C. 像不变距离变小", "D. 像不变距离不变"],
        answer: 2, knowledge: "像大小不变", relatedCard: "S16"
      },
      {
        id: "Q_L_030", domain: "光", difficulty: "basic",
        question: "彩色电视机画面的颜色是由哪三种色光混合而成的？",
        options: ["A. 红黄蓝", "B. 红绿蓝", "C. 品红黄青", "D. 红橙绿"],
        answer: 1, knowledge: "光三原色", relatedCard: "A16"
      },
      {
        id: "Q_L_031", domain: "光", difficulty: "basic",
        question: "验钞机发出的光能使钞票上的荧光物质发光这种光属于？",
        options: ["A. 红外线", "B. 紫外线", "C. 可见光", "D. 激光"],
        answer: 1, knowledge: "紫外线", relatedCard: "A18"
      },
      {
        id: "Q_L_032", domain: "光", difficulty: "basic",
        question: "下列关于光现象的说法中正确的是？",
        options: ["A. 月亮是一个巨大的光源", "B. 光在真空中速度是340m/s", "C. 影子的形成是由于光的直线传播", "D. 漫反射不遵守光的反射定律"],
        answer: 2, knowledge: "影子=直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_033", domain: "光", difficulty: "basic",
        question: "以下光现象中属于光的反射的是？",
        options: ["A. 插入水中的筷子变弯", "B. 看到水中游动的鱼", "C. 湖水中倒映着美丽的白塔", "D. 雨后天空中出现彩虹"],
        answer: 2, knowledge: "倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_034", domain: "光", difficulty: "basic",
        question: "关于光的传播下列说法中正确的是？",
        options: ["A. 光在真空中不能传播", "B. 光在同种均匀介质中沿直线传播", "C. 光总是沿直线传播", "D. 光只有在真空中才沿直线传播"],
        answer: 1, knowledge: "同种均匀介质", relatedCard: "S16"
      },
      {
        id: "Q_L_035", domain: "光", difficulty: "basic",
        question: "在森林里决不允许随地丢弃透明饮料瓶这是因为雨水进入后相当于什么透镜可能引起火灾？",
        options: ["A. 凹透镜", "B. 凸透镜", "C. 平面镜", "D. 凹面镜"],
        answer: 1, knowledge: "凸透镜聚光", relatedCard: "A55"
      },
      {
        id: "Q_L_036", domain: "光", difficulty: "advanced",
        question: "关于光的反射定律下列说法正确的是？",
        options: ["A. 入射角随反射角变化", "B. 光垂直入射时反射角为90°", "C. 反射光线入射光线法线在同一平面", "D. 反射光线不一定在三线共面"],
        answer: 2, knowledge: "三线共面", relatedCard: "S16"
      },
      {
        id: "Q_L_037", domain: "光", difficulty: "advanced",
        question: "物体放在凸透镜的2倍焦距处光屏上会得到？",
        options: ["A. 倒立放大实像", "B. 倒立缩小实像", "C. 倒立等大实像", "D. 正立放大虚像"],
        answer: 2, knowledge: "u=2f等大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_038", domain: "光", difficulty: "advanced",
        question: "物体放在凸透镜焦距以内会得到？",
        options: ["A. 倒立放大实像", "B. 倒立缩小实像", "C. 倒立等大实像", "D. 正立放大虚像"],
        answer: 3, knowledge: "u<f虚像", relatedCard: "S16"
      },
      {
        id: "Q_L_039", domain: "光", difficulty: "advanced",
        question: "近视眼的晶状体太厚成像在视网膜的？",
        options: ["A. 上面", "B. 前面", "C. 后面", "D. 中心"],
        answer: 1, knowledge: "视网膜前", relatedCard: "S16"
      },
      {
        id: "Q_L_040", domain: "光", difficulty: "advanced",
        question: "光纤通信利用了什么原理？",
        options: ["A. 光的折射", "B. 全反射", "C. 光的衍射", "D. 光的色散"],
        answer: 1, knowledge: "全反射", relatedCard: "A19"
      },
      {
        id: "Q_L_041", domain: "光", difficulty: "advanced",
        question: "红外线在生活中的应用不包括？",
        options: ["A. 遥控器", "B. 夜视仪", "C. 验钞机", "D. 红外测温"],
        answer: 2, knowledge: "验钞机=紫外线", relatedCard: "A17"
      },
      {
        id: "Q_L_042", domain: "光", difficulty: "advanced",
        question: "放电影时银幕上的像是？",
        options: ["A. 正立放大实像", "B. 倒立放大实像", "C. 正立缩小虚像", "D. 倒立缩小虚像"],
        answer: 1, knowledge: "投影仪成倒立放大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_043", domain: "光", difficulty: "advanced",
        question: "用放大镜观察物体时物体应放在？",
        options: ["A. 2倍焦距以外", "B. 焦距以内", "C. 焦点上", "D. 2倍焦距处"],
        answer: 1, knowledge: "u<f", relatedCard: "S16"
      },
      {
        id: "Q_L_044", domain: "光", difficulty: "advanced",
        question: "医生检查耳道时头上戴的额镜是？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 凹面镜", "D. 凸面镜"],
        answer: 2, knowledge: "凹面镜聚光", relatedCard: "S16"
      },
      {
        id: "Q_L_045", domain: "光", difficulty: "advanced",
        question: "汽车驾驶室外的观后镜使用的是？",
        options: ["A. 平面镜", "B. 凸面镜", "C. 凹面镜", "D. 凸透镜"],
        answer: 1, knowledge: "凸面镜扩大视野", relatedCard: "S16"
      },
      {
        id: "Q_L_046", domain: "光", difficulty: "advanced",
        question: "太阳灶是利用什么镜制成的？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 凹面镜", "D. 凸面镜"],
        answer: 2, knowledge: "凹面镜聚光", relatedCard: "S16"
      },
      {
        id: "Q_L_047", domain: "光", difficulty: "advanced",
        question: "关于光的色散下列说法正确的是？",
        options: ["A. 白光是最纯的光", "B. 白光由多种色光复合而成", "C. 三棱镜改变了光的颜色", "D. 以上都不对"],
        answer: 1, knowledge: "白光是复色光", relatedCard: "A16"
      },
      {
        id: "Q_L_048", domain: "光", difficulty: "advanced",
        question: "显微镜的物镜和目镜分别是什么透镜？",
        options: ["A. 目凸物凹", "B. 目凹物凸", "C. 都是凸透镜", "D. 都是凹透镜"],
        answer: 2, knowledge: "都是凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_049", domain: "光", difficulty: "advanced",
        question: "望远镜的物镜相当于什么光学元件？",
        options: ["A. 平面镜", "B. 凸透镜", "C. 凹透镜", "D. 凸面镜"],
        answer: 1, knowledge: "凸透镜", relatedCard: "C09"
      },
      {
        id: "Q_L_050", domain: "光", difficulty: "advanced",
        question: "关于实像和虚像下面说法正确的是？",
        options: ["A. 虚像是幻觉没有光线进入人眼", "B. 实像能用光屏接收虚像不能", "C. 平面镜成虚像凸透镜成实像", "D. 实像都是折射形成的"],
        answer: 1, knowledge: "实像光屏", relatedCard: "S16"
      },
      {
        id: "Q_L_051", domain: "光", difficulty: "advanced",
        question: "红色的物体在绿光照射下看起来呈什么颜色？",
        options: ["A. 红色", "B. 绿色", "C. 黄色", "D. 黑色"],
        answer: 3, knowledge: "只反射同色光", relatedCard: "A16"
      },
      {
        id: "Q_L_052", domain: "光", difficulty: "advanced",
        question: "下列说法不正确的是？",
        options: ["A. 光年是距离单位", "B. 光在同种均匀介质中沿直线传播", "C. 光在真空中的速度为3×10⁵km/s", "D. 雨后的彩虹是光的反射现象"],
        answer: 3, knowledge: "彩虹=折射色散", relatedCard: "A16"
      },
      {
        id: "Q_L_053", domain: "光", difficulty: "advanced",
        question: "下列关于光现象的说法中错误的是？",
        options: ["A. 光在真空中传播得最快", "B. 光在同种均匀介质中沿直线传播", "C. 漫反射不遵守光的反射定律", "D. 平面镜可以改变光的传播方向"],
        answer: 2, knowledge: "漫反射也遵守", relatedCard: "S16"
      },
      {
        id: "Q_L_054", domain: "光", difficulty: "challenge",
        question: "物体在凸透镜前20cm处在光屏上得到清晰等大的像该凸透镜焦距为？",
        options: ["A. 20cm", "B. 10cm", "C. 40cm", "D. 5cm"],
        answer: 1, knowledge: "u=2f=20cm", relatedCard: "S16"
      },
      {
        id: "Q_L_055", domain: "光", difficulty: "challenge",
        question: "江面上看到山的倒影和江底看起来比实际浅分别对应什么光学原理？",
        options: ["A. 都是折射", "B. 都是反射", "C. 倒影是反射江底变浅是折射", "D. 倒影是折射江底变浅是反射"],
        answer: 2, knowledge: "反射+折射", relatedCard: "A46"
      },
      {
        id: "Q_L_056", domain: "光", difficulty: "challenge",
        question: "下列说法不正确的是？",
        options: ["A. 镜面反射遵从反射定律", "B. 漫反射不遵从反射定律", "C. 平行光束经平面镜反射后仍是平行光束", "D. 漫反射中平行光束反射后不再是平行光束"],
        answer: 1, knowledge: "漫反射也遵从", relatedCard: "S16"
      },
      {
        id: "Q_L_057", domain: "光", difficulty: "challenge",
        question: "小明用照相机先拍全身照再想拍半身照他应该？",
        options: ["A. 靠近同学同时镜头向前伸", "B. 远离同学同时镜头向后缩", "C. 靠近同学同时镜头向后缩", "D. 远离同学同时镜头向前伸"],
        answer: 0, knowledge: "移近增大像", relatedCard: "S16"
      },
      {
        id: "Q_L_058", domain: "光", difficulty: "basic",
        question: "如果你在一平面镜中看到另一个同学的眼睛那么该同学也一定能通过这平面镜看到你的眼睛这是因为？",
        options: ["A. 光的漫反射", "B. 光的镜面反射", "C. 反射现象中光路可逆", "D. 光的折射"],
        answer: 2, knowledge: "光路可逆", relatedCard: "S16"
      },
      {
        id: "Q_L_059", domain: "光", difficulty: "basic",
        question: "小汽车的挡风玻璃不竖直安装的主要原因是为了？",
        options: ["A. 造型美观", "B. 减少噪音干扰", "C. 增大采光面积", "D. 排除因平面镜成像造成的不安全因素"],
        answer: 3, knowledge: "避免成像干扰", relatedCard: "S16"
      },
      {
        id: "Q_L_060", domain: "光", difficulty: "basic",
        question: "太阳光通过一个很小的方形小孔照射到孔后的光屏上出现光斑其形状是？",
        options: ["A. 长方形", "B. 正方形", "C. 圆形", "D. 三角形"],
        answer: 2, knowledge: "小孔成像=圆形", relatedCard: "S16"
      },
      {
        id: "Q_L_061", domain: "光", difficulty: "basic",
        question: "下列叙述中的影与由于光的反射而形成的是？",
        options: ["A. 形影不离", "B. 毕业合影", "C. 立竿见影", "D. 水中倒影"],
        answer: 3, knowledge: "水中倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_062", domain: "光", difficulty: "basic",
        question: "下列现象中由于光的折射形成的是？",
        options: ["A. 水中的倒影", "B. 平面镜成像", "C. 雨后彩虹", "D. 小孔成像"],
        answer: 2, knowledge: "彩虹=折射色散", relatedCard: "A16"
      },
      {
        id: "Q_L_063", domain: "光", difficulty: "basic",
        question: "下列光学现象与规律不相符的是？",
        options: ["A. 小孔成像——光的直线传播", "B. 海市蜃楼——光的折射", "C. 湖光镜月——光的反射", "D. 人面桃花相映红——光的折射"],
        answer: 3, knowledge: "桃花红=反射", relatedCard: "A16"
      },
      {
        id: "Q_L_064", domain: "光", difficulty: "basic",
        question: "透镜在我们的生活中应用广泛下列说法正确的是？",
        options: ["A. 近视眼镜利用凸透镜会聚作用", "B. 照相时被照者应站在镜头二倍焦距以内", "C. 投影仪在屏幕上成正立放大虚像", "D. 借助放大镜看地图时距离应小于一倍焦距"],
        answer: 3, knowledge: "放大镜u<f", relatedCard: "S16"
      },
      {
        id: "Q_L_065", domain: "光", difficulty: "basic",
        question: "下列属于光的色散现象的是？",
        options: ["A. 雨后天空中的彩虹", "B. 水中的月亮", "C. 黑板反光", "D. 小孔成像"],
        answer: 0, knowledge: "彩虹=色散", relatedCard: "A16"
      },
      {
        id: "Q_L_066", domain: "光", difficulty: "basic",
        question: "下列关于光的说法中正确的是？",
        options: ["A. 光不能在水中传播", "B. 光总是沿直线传播", "C. 光在同种均匀介质中沿直线传播", "D. 光在玻璃中不沿直线传播"],
        answer: 2, knowledge: "同种均匀", relatedCard: "S16"
      },
      {
        id: "Q_L_067", domain: "光", difficulty: "basic",
        question: "下列关于紫外线的应用不正确的是？",
        options: ["A. 使荧光物质发光", "B. 杀菌消毒", "C. 帮助人体合成维生素D", "D. 加热物体"],
        answer: 3, knowledge: "紫外线不主要用于加热", relatedCard: "A18"
      },
      {
        id: "Q_L_068", domain: "光", difficulty: "basic",
        question: "过度晒太阳会使皮肤粗糙甚至引起皮肤癌这是由于太阳光中含有？",
        options: ["A. 红外线", "B. 紫外线", "C. 可见光", "D. 以上都有"],
        answer: 1, knowledge: "紫外线伤害", relatedCard: "A18"
      },
      {
        id: "Q_L_069", domain: "光", difficulty: "basic",
        question: "下列光学仪器中能得到放大实像的是？",
        options: ["A. 放大镜", "B. 潜望镜", "C. 幻灯机", "D. 照相机"],
        answer: 2, knowledge: "幻灯机放大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_070", domain: "光", difficulty: "advanced",
        question: "一束平行光正对凸透镜照射在离透镜10cm处光屏上得到一个亮点那么当物体在透镜前25cm处时可以得到？",
        options: ["A. 倒立缩小实像", "B. 倒立放大实像", "C. 正立放大虚像", "D. 无法判断"],
        answer: 0, knowledge: "f=10u=25>2f", relatedCard: "S16"
      },
      {
        id: "Q_L_071", domain: "光", difficulty: "advanced",
        question: "凸透镜的焦距为10cm物体距透镜15cm时所成的像是？",
        options: ["A. 倒立缩小实像", "B. 倒立放大实像", "C. 正立放大虚像", "D. 倒立等大实像"],
        answer: 1, knowledge: "f<u<2f", relatedCard: "S16"
      },
      {
        id: "Q_L_072", domain: "光", difficulty: "advanced",
        question: "一束光线垂直射到平面镜上若把平面镜转过15°则反射光线与入射光线的夹角为？",
        options: ["A. 15°", "B. 30°", "C. 45°", "D. 60°"],
        answer: 1, knowledge: "入射角变为15°", relatedCard: "S16"
      },
      {
        id: "Q_L_073", domain: "光", difficulty: "challenge",
        question: "当光从空气斜射到玻璃表面时以下可以较全面反映光传播路径的是？",
        options: ["A. 只发生反射", "B. 只发生折射", "C. 同时发生反射和折射", "D. 既不反射也不折射"],
        answer: 2, knowledge: "同时反射和折射", relatedCard: "A46"
      },
      {
        id: "Q_L_074", domain: "光", difficulty: "challenge",
        question: "在没有任何其他光照的情况下绿光照在穿白上衣红裙子的演员身上观众看到她？",
        options: ["A. 全身呈绿色", "B. 上衣绿色裙子不变", "C. 上衣绿色裙子黑色", "D. 上衣白色裙子红色"],
        answer: 2, knowledge: "绿照白=绿绿照红=黑", relatedCard: "A16"
      },
      {
        id: "Q_L_075", domain: "光", difficulty: "basic",
        question: "下列说法中正确的是？",
        options: ["A. 萤火虫是光源", "B. 月亮是光源", "C. 钻石是光源", "D. 镜子是光源"],
        answer: 0, knowledge: "萤火虫=光源", relatedCard: "S14"
      },
      {
        id: "Q_L_076", domain: "光", difficulty: "basic",
        question: "下列现象中属于光的折射现象的是？",
        options: ["A. 水中倒影", "B. 放大镜看地图", "C. 湖中倒影", "D. 阳光下树的影子"],
        answer: 1, knowledge: "放大镜=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_077", domain: "光", difficulty: "basic",
        question: "平静的湖面上倒映着美丽的白塔，倒映的白塔是？",
        options: ["A. 倒立的影子", "B. 倒立的实像", "C. 倒立的虚像", "D. 正立的虚像"],
        answer: 3, knowledge: "正立虚像", relatedCard: "S16"
      },
      {
        id: "Q_L_078", domain: "光", difficulty: "basic",
        question: "池水看起来比实际的浅这是因为？",
        options: ["A. 光的反射", "B. 光的折射", "C. 光沿直线传播", "D. 光的色散"],
        answer: 1, knowledge: "折射", relatedCard: "A46"
      },
      {
        id: "Q_L_079", domain: "光", difficulty: "basic",
        question: "秋高气爽的夜晚星光闪烁不定主要因为？",
        options: ["A. 星星在运动", "B. 地球绕太阳公转", "C. 地球自转", "D. 大气密度变化星光折射"],
        answer: 3, knowledge: "大气折射", relatedCard: "A46"
      },
      {
        id: "Q_L_080", domain: "光", difficulty: "basic",
        question: "关于光现象以下说法正确的是？",
        options: ["A. 树荫下圆形光斑是太阳的虚像", "B. 看到池水变浅是由于光的折射", "C. 月亮是天然光源", "D. 光年是时间单位"],
        answer: 1, knowledge: "池水变浅=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_081", domain: "光", difficulty: "basic",
        question: "下列现象中属于光的直线传播的是？",
        options: ["A. 水中倒影", "B. 海市蜃楼", "C. 立竿见影", "D. 雨后彩虹"],
        answer: 2, knowledge: "立竿见影", relatedCard: "S16"
      },
      {
        id: "Q_L_082", domain: "光", difficulty: "basic",
        question: "夜晚某同学在放学回家途中从一路灯正下方远离时他看到自己影子的长度？",
        options: ["A. 变长", "B. 变短", "C. 不变", "D. 变化无规律"],
        answer: 0, knowledge: "远离光源影子变长", relatedCard: "S16"
      },
      {
        id: "Q_L_083", domain: "光", difficulty: "basic",
        question: "下列现象中属于光的反射现象的是？",
        options: ["A. 看到插入水中筷子向上弯折", "B. 平静水面上清楚地映出岸上的景物", "C. 看到湖水深度比实际浅", "D. 透过玻璃砖看到钢笔错位"],
        answer: 1, knowledge: "倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_084", domain: "光", difficulty: "basic",
        question: "一棵树在阳光照射下它的影子从早晨到晚上的变化是？",
        options: ["A. 先变长后变短", "B. 先变短后变长", "C. 逐渐变长", "D. 逐渐变短"],
        answer: 1, knowledge: "中午最短", relatedCard: "S16"
      },
      {
        id: "Q_L_085", domain: "光", difficulty: "basic",
        question: "小猫在平静的池塘边欣赏自己在水中的像下列正确的是？",
        options: ["A. 正立虚像", "B. 倒立实像", "C. 正立实像", "D. 倒立虚像"],
        answer: 0, knowledge: "水中像=正立虚像", relatedCard: "S16"
      },
      {
        id: "Q_L_086", domain: "光", difficulty: "basic",
        question: "下列不是光源的物体是？",
        options: ["A. 太阳", "B. 月亮", "C. 萤火虫", "D. 点亮的电灯"],
        answer: 1, knowledge: "月亮反射", relatedCard: "S14"
      },
      {
        id: "Q_L_087", domain: "光", difficulty: "basic",
        question: "关于平面镜成像下列说法正确的是？",
        options: ["A. 比平面镜大的物体不能在镜中形成完整像", "B. 不在正前方的物体不能在镜中成像", "C. 平面镜后方放东西会遮挡镜内虚像", "D. 平面镜所成像与物体总是等大的"],
        answer: 3, knowledge: "等大", relatedCard: "S16"
      },
      {
        id: "Q_L_088", domain: "光", difficulty: "basic",
        question: "关于光的折射下列说法正确的是？",
        options: ["A. 光从空气射入水中传播方向一定改变", "B. 光从空气垂直射入水中时传播方向不变", "C. 折射角一定小于入射角", "D. 折射角一定大于入射角"],
        answer: 1, knowledge: "垂直入射不变", relatedCard: "A46"
      },
      {
        id: "Q_L_089", domain: "光", difficulty: "basic",
        question: "下面四个例子中不能说明光是沿直线传播的是？",
        options: ["A. 看不见不透明物体后面的东西", "B. 射击时的瞄准", "C. 我们能从不同方向看到不发光的东西", "D. 阳光下身体的影子"],
        answer: 2, knowledge: "漫反射", relatedCard: "S16"
      },
      {
        id: "Q_L_090", domain: "光", difficulty: "basic",
        question: "一个人站在平面镜前当他向平面镜走近时他在镜中的像？",
        options: ["A. 变大", "B. 变小", "C. 不变", "D. 无法确定"],
        answer: 2, knowledge: "像大小不变", relatedCard: "S16"
      },
      {
        id: "Q_L_091", domain: "光", difficulty: "basic",
        question: "下列成语能说明光反射的是？",
        options: ["A. 镜花水月", "B. 坐井观天", "C. 海市蜃楼", "D. 立竿见影"],
        answer: 0, knowledge: "镜花水月=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_092", domain: "光", difficulty: "basic",
        question: "下列说法中不正确的是？",
        options: ["A. 光线垂直照射在平面镜上入射角是90°", "B. 漫反射也遵守反射定律", "C. 反射光线与入射光线夹角100°则入射角50°", "D. 太阳光传到地球约500s则距离约1.5×10⁸km"],
        answer: 0, knowledge: "垂直入射角=0°", relatedCard: "S16"
      },
      {
        id: "Q_L_093", domain: "光", difficulty: "advanced",
        question: "关于四种光学仪器成像情况以下说法正确的是？",
        options: ["A. 放大镜成正立放大实像", "B. 照相机成正立缩小实像", "C. 潜望镜成正立等大虚像", "D. 幻灯机成正立放大实像"],
        answer: 2, knowledge: "潜望镜=平面镜", relatedCard: "S16"
      },
      {
        id: "Q_L_094", domain: "光", difficulty: "advanced",
        question: "用照相机拍照时被拍摄景物到镜头的距离？",
        options: ["A. 小于焦距", "B. 大于2倍焦距", "C. 在1倍和2倍焦距之间", "D. 以上都不对"],
        answer: 1, knowledge: "照相机u>2f", relatedCard: "S16"
      },
      {
        id: "Q_L_095", domain: "光", difficulty: "advanced",
        question: "以下光学元件中对光有发散作用的是？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 凸面镜"],
        answer: 1, knowledge: "凹透镜发散", relatedCard: "S16"
      },
      {
        id: "Q_L_096", domain: "光", difficulty: "advanced",
        question: "一束光线从空气斜射入水中如果入射角逐渐增大则折射角？",
        options: ["A. 逐渐减小总大于入射角", "B. 逐渐增大总小于入射角", "C. 逐渐增大总大于入射角", "D. 逐渐减小总小于入射角"],
        answer: 1, knowledge: "折射角<入射角", relatedCard: "A46"
      },
      {
        id: "Q_L_097", domain: "光", difficulty: "advanced",
        question: "下列现象中属于光的折射现象的是？",
        options: ["A. 太阳光穿过树叶间隙在地面形成圆形光斑", "B. 人在河边看见白云在水中飘动", "C. 人在河边看见水中的鱼在游动", "D. 斜插入水中筷子在水下部分向上弯折"],
        answer: 3, knowledge: "筷子弯折=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_098", domain: "光", difficulty: "advanced",
        question: "人眼能看到物体是因为？",
        options: ["A. 物体一定是光源", "B. 人眼发出的光射到物体上", "C. 物体发出或反射的光进入眼睛", "D. 物体和眼睛在同一直线上"],
        answer: 2, knowledge: "看到物体的条件", relatedCard: "S14"
      },
      {
        id: "Q_L_099", domain: "光", difficulty: "advanced",
        question: "下列关于光现象的说法中正确的是？",
        options: ["A. 在光的反射中入射角等于反射角", "B. 光在真空中的速度是3×10⁸km/s", "C. 漫反射不遵守光的反射定律", "D. 光在均匀介质中沿直线传播"],
        answer: 3, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_100", domain: "光", difficulty: "advanced",
        question: "下列光学器件中利用凸透镜成缩小实像的是？",
        options: ["A. 放大镜", "B. 照相机", "C. 幻灯机", "D. 潜望镜"],
        answer: 1, knowledge: "照相机", relatedCard: "S16"
      },
      {
        id: "Q_L_101", domain: "光", difficulty: "challenge",
        question: "一束光从空气斜射入玻璃中时反射光线与入射光线夹角为100°折射光线与反射光线夹角为130°则折射角为？",
        options: ["A. 20°", "B. 30°", "C. 40°", "D. 50°"],
        answer: 0, knowledge: "折射角分析", relatedCard: "A46"
      },
      {
        id: "Q_L_102", domain: "光", difficulty: "challenge",
        question: "关于光学器材或现象下列说法正确的是？",
        options: ["A. 潜望镜利用了光的折射", "B. 照相机成倒立缩小的虚像", "C. 平面镜成像像距与物距相等", "D. 显微镜的物镜成放大的虚像"],
        answer: 2, knowledge: "像距=物距", relatedCard: "S16"
      },
      {
        id: "Q_L_103", domain: "光", difficulty: "challenge",
        question: "把一滴水滴在玻璃板上下面放置看不清的小物体这时水滴相当于一个？",
        options: ["A. 平面镜", "B. 凸面镜", "C. 凸透镜", "D. 凹透镜"],
        answer: 2, knowledge: "水滴=凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_104", domain: "光", difficulty: "challenge",
        question: "在研究凸透镜成像的实验中在屏上得到了烛焰的像恰有一小虫飞落在透镜中间部分那么在屏上所成的像？",
        options: ["A. 变成了小虫的像", "B. 像的中间没有了", "C. 大小不变亮度比原来暗", "D. 大小和亮度与原来一样"],
        answer: 2, knowledge: "遮挡部分透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_105", domain: "光", difficulty: "basic",
        question: "晚上在桌上铺一张白纸把一块小平面镜平放在白纸上让手电筒光正对平面镜照射从侧面看去？",
        options: ["A. 镜子比较亮", "B. 白纸比较亮", "C. 一样亮", "D. 以上都不对"],
        answer: 1, knowledge: "白纸漫反射", relatedCard: "S16"
      },
      {
        id: "Q_L_106", domain: "光", difficulty: "basic",
        question: "下列说法正确的是？",
        options: ["A. 实像和虚像都能用光屏承接", "B. 虚像不能用光屏承接", "C. 只有虚像能用眼睛看到", "D. 实像不能用眼睛看到"],
        answer: 1, knowledge: "虚像特点", relatedCard: "S16"
      },
      {
        id: "Q_L_107", domain: "光", difficulty: "basic",
        question: "光从空气斜射向水面时入射角为30°反射光线与折射光线恰好垂直则折射角为？",
        options: ["A. 30°", "B. 60°", "C. 45°", "D. 90°"],
        answer: 1, knowledge: "反射角30折射角=90-30=60", relatedCard: "A46"
      },
      {
        id: "Q_L_108", domain: "光", difficulty: "basic",
        question: "下列描述的现象属于光的折射的是？",
        options: ["A. 日偏食", "B. 渔叉叉鱼", "C. 湖边夜景", "D. 汽车观后镜"],
        answer: 1, knowledge: "叉鱼=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_109", domain: "光", difficulty: "basic",
        question: "下列关于实像和虚像的说法正确的是？",
        options: ["A. 实像能用光屏接收虚像不能", "B. 虚像是人的幻觉没有光线进入人眼", "C. 平面镜成虚像凸透镜一定成实像", "D. 实像一定是折射形成的"],
        answer: 0, knowledge: "实像光屏", relatedCard: "S16"
      },
      {
        id: "Q_L_110", domain: "光", difficulty: "basic",
        question: "夜间行车时公路两旁的警示牌上有一层反光膜它的作用是？",
        options: ["A. 发出警示光", "B. 利用光的反射", "C. 利用光的折射", "D. 吸收光线"],
        answer: 1, knowledge: "反光膜=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_111", domain: "光", difficulty: "advanced",
        question: "测绘人员绘制地图时需从飞机上向地面拍照若照相机镜头焦距为50mm则所成清晰像与镜头的距离？",
        options: ["A. 等于50mm", "B. 略大于50mm", "C. 略小于50mm", "D. 等于100mm"],
        answer: 1, knowledge: "略大于焦距", relatedCard: "S16"
      },
      {
        id: "Q_L_112", domain: "光", difficulty: "advanced",
        question: "小明从平面镜中看到电子钟的像此时的实际时间约为？",
        options: ["A. 21:10左右", "B. 10:21左右", "C. 10:51左右", "D. 12:01左右"],
        answer: 1, knowledge: "平面镜成像左右对称", relatedCard: "S16"
      },
      {
        id: "Q_L_113", domain: "光", difficulty: "advanced",
        question: "下列现象中由于光的直线传播形成的是？",
        options: ["A. 插入水中铅笔弯折", "B. 水中山的倒影", "C. 屏幕上的手影", "D. 瓶子在平面镜中的像"],
        answer: 2, knowledge: "手影=直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_114", domain: "光", difficulty: "advanced",
        question: "下列情景中属于光的反射的是？",
        options: ["A. 手影", "B. 水中倒影", "C. 铅笔弯折", "D. 小孔成像"],
        answer: 1, knowledge: "倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_115", domain: "光", difficulty: "advanced",
        question: "下列现象中可以用光的折射解释的是？",
        options: ["A. 在湖边看到水中树木的倒影", "B. 在电影院看到银幕上的画面", "C. 站在河边看到水中的鱼", "D. 在阳光下看到自己的影子"],
        answer: 2, knowledge: "看鱼=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_116", domain: "光", difficulty: "challenge",
        question: "小明同学在做凸透镜成像实验时在光屏上得到烛焰缩小的像然后他把燃烧的蜡烛和光屏互换位置这时光屏上？",
        options: ["A. 成倒立缩小的像", "B. 成倒立放大的像", "C. 成正立放大的像", "D. 不能成像"],
        answer: 1, knowledge: "互换后倒立放大", relatedCard: "S16"
      },
      {
        id: "Q_L_117", domain: "光", difficulty: "challenge",
        question: "某同学做凸透镜成像实验当光屏到凸透镜距离为14cm时在光屏上得到物体清晰缩小的像则凸透镜焦距可能是？",
        options: ["A. 6cm", "B. 10cm", "C. 14cm", "D. 20cm"],
        answer: 1, knowledge: "缩小像v<2f推得f范围", relatedCard: "S16"
      },
      {
        id: "Q_L_118", domain: "光", difficulty: "challenge",
        question: "在探究凸透镜成像规律的实验中当凸透镜光屏和烛焰满足一定关系时光屏上能成一个清晰的像则？",
        options: ["A. 所成像一定是正立缩小的实像", "B. 所成像一定是倒立放大的实像", "C. 把光屏和蜡烛位置互换光屏上仍能得到清晰的像", "D. 利用这一原理制成的是投影仪"],
        answer: 2, knowledge: "互换可成像", relatedCard: "S16"
      },
      {
        id: "Q_L_119", domain: "光", difficulty: "challenge",
        question: "凸透镜成实像时一定是？",
        options: ["A. 正立的放大的", "B. 倒立的缩小的", "C. 倒立的", "D. 正立的"],
        answer: 2, knowledge: "实像一定倒立", relatedCard: "S16"
      },
      {
        id: "Q_L_120", domain: "光", difficulty: "challenge",
        question: "利用凸透镜使物体成放大的像这个像？",
        options: ["A. 一定是实像", "B. 一定是虚像", "C. 可能是实像也可能是虚像", "D. 无法判断"],
        answer: 2, knowledge: "放大像虚实都可能", relatedCard: "S16"
      },
      {
        id: "Q_L_121", domain: "光", difficulty: "basic",
        question: "小明的爷爷是老花眼小明的妈妈是近视眼他们的两副眼镜都放在报纸上如图所示现在爷爷要看书让小明把眼镜递给他小明应该拿图中的？",
        options: ["A. 甲（凸透镜）", "B. 乙（凹透镜）", "C. 随便拿", "D. 无法确定"],
        answer: 0, knowledge: "老花=凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_122", domain: "光", difficulty: "basic",
        question: "下列关于光现象的说法正确的是？",
        options: ["A. 雨过天晴天空会出现彩虹它是由光的反射形成的", "B. 你站在岸边看到水中鱼的位置并不是实际位置", "C. 平面镜成像时像与物体大小不相等", "D. 近视眼需配戴凸透镜矫正"],
        answer: 1, knowledge: "水中鱼=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_123", domain: "光", difficulty: "basic",
        question: "光射到下列物体表面时会发生反射其中属于镜面反射的是？",
        options: ["A. 粗糙的木板", "B. 平静的水面", "C. 白色的墙壁", "D. 课本"],
        answer: 1, knowledge: "平静水面=镜面", relatedCard: "S16"
      },
      {
        id: "Q_L_124", domain: "光", difficulty: "basic",
        question: "下列光现象中不可以用光的直线传播解释的是？",
        options: ["A. 日食月食", "B. 影子", "C. 小孔成像", "D. 平面镜成像"],
        answer: 3, knowledge: "平面镜=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_125", domain: "光", difficulty: "basic",
        question: "小明拿着一个直径比较大的放大镜伸直手臂观看远处的物体可以看到物体的像下面说法中正确的是？",
        options: ["A. 像一定是虚像", "B. 像一定是倒立的", "C. 像一定是放大的", "D. 像可能是缩小的"],
        answer: 3, knowledge: "远处=缩小像", relatedCard: "S16"
      },
      {
        id: "Q_L_126", domain: "光", difficulty: "basic",
        question: "下列有关红外线的说法中不正确的是？",
        options: ["A. 红外线具有热效应", "B. 红外线可以在真空中传播", "C. 红外线不能引起视觉", "D. 红外线能使荧光物质发光"],
        answer: 3, knowledge: "荧光=紫外线", relatedCard: "A17"
      },
      {
        id: "Q_L_127", domain: "光", difficulty: "basic",
        question: "在透明玻璃杯的杯底放一枚硬币再放一些水，把杯子端到眼睛的高度再慢慢下移当杯子下移到某一位置时可以看到杯中有大小两枚硬币。下列说法中正确的是？",
        options: ["A. 大硬币是光折射形成的", "B. 小硬币是光折射形成的", "C. 小硬币比实际位置高", "D. 两枚硬币都是虚像"],
        answer: 0, knowledge: "大硬币=折射虚像", relatedCard: "A46"
      },
      {
        id: "Q_L_128", domain: "光", difficulty: "basic",
        question: "如图所示是几种光学器材的示意图其中对光起发散作用的是？",
        options: ["A. 凸透镜", "B. 凹透镜", "C. 平面镜", "D. 三棱镜"],
        answer: 1, knowledge: "凹透镜发散", relatedCard: "S16"
      },
      {
        id: "Q_L_129", domain: "光", difficulty: "advanced",
        question: "在探究凸透镜成像规律的实验中当烛焰凸透镜光屏处于如图所示位置时恰能在光屏上得到一个清晰的像。利用这种成像原理可以制成？",
        options: ["A. 照相机", "B. 幻灯机", "C. 放大镜", "D. 潜望镜"],
        answer: 0, knowledge: "u>2f=照相机", relatedCard: "S16"
      },
      {
        id: "Q_L_130", domain: "光", difficulty: "advanced",
        question: "某校新建成一个喷水池在池底中央安装一只射灯池内无水时射灯发出一束光照在池壁上在S点形成亮斑。现往池内注水水面升至a位置时人看到亮斑位置在P点；如果水面升至b位置时人看到亮斑在Q点则？",
        options: ["A. P在S下方Q在S上方", "B. P在S上方Q在S下方", "C. P在S上方Q在S上方", "D. P在S下方Q在S下方"],
        answer: 0, knowledge: "折射光路", relatedCard: "A46"
      },
      {
        id: "Q_L_131", domain: "光", difficulty: "advanced",
        question: "夜晚当汽车灯光照射到自行车尾灯上时司机看到尾灯反射的光就能及时避让。尾灯结构利用了？",
        options: ["A. 凸透镜会聚", "B. 角反射器原方向反射", "C. 凹透镜发散", "D. 平面镜一次反射"],
        answer: 1, knowledge: "角反射器", relatedCard: "S16"
      },
      {
        id: "Q_L_132", domain: "光", difficulty: "advanced",
        question: "下列说法正确的是？",
        options: ["A. 白光和红光通过三棱镜都能发生色散", "B. 白光通过三棱镜分解成七色光说明白光是复合光", "C. 蓝光照在红纸上红纸呈蓝色", "D. 只有弧光灯发出的光才是单色光"],
        answer: 1, knowledge: "白光是复合光", relatedCard: "A16"
      },
      {
        id: "Q_L_133", domain: "光", difficulty: "advanced",
        question: "一束平行光正对凸透镜照射时在离透镜15cm处的光屏上得到一个亮点那么当物体位于透镜前35cm处时在透镜另一侧可得到？",
        options: ["A. 倒立缩小实像", "B. 倒立放大实像", "C. 正立放大虚像", "D. 正立缩小虚像"],
        answer: 0, knowledge: "f=15u=35>2f", relatedCard: "S16"
      },
      {
        id: "Q_L_134", domain: "光", difficulty: "challenge",
        question: "在探究凸透镜成像规律实验中移动物体到某位置时能在光屏上成清晰缩小的像则下列能成立的是？①如果将物体靠近凸透镜仍要在光屏上得到清晰的像光屏必须远离凸透镜；②换焦距更小的透镜所成的像比之前小；③将物体和光屏互换位置光屏上仍能成清晰的像。",
        options: ["A. ①③", "B. ①②③", "C. ②③", "D. ①"],
        answer: 1, knowledge: "分析题", relatedCard: "S16"
      },
      {
        id: "Q_L_135", domain: "光", difficulty: "basic",
        question: "下列说法中正确的是？",
        options: ["A. 光线总是沿直线传播", "B. 光的传播速度是3×10⁵km/s", "C. 萤火虫是光源", "D. 以上都正确"],
        answer: 2, knowledge: "萤火虫=光源", relatedCard: "S14"
      },
      {
        id: "Q_L_136", domain: "光", difficulty: "basic",
        question: "检查视力时要求眼睛与视力表的距离为5m。若视力表挂在竖直墙上则人应站在距平面镜的距离为？",
        options: ["A. 5m", "B. 2.5m", "C. 1.5m", "D. 无法确定"],
        answer: 1, knowledge: "镜子像距", relatedCard: "S16"
      },
      {
        id: "Q_L_137", domain: "光", difficulty: "basic",
        question: "关于反射下列说法正确的是？",
        options: ["A. 只有镜面反射才遵守反射定律", "B. 只有漫反射才遵守反射定律", "C. 镜面反射和漫反射都遵守反射定律", "D. 都不遵守反射定律"],
        answer: 2, knowledge: "都遵守", relatedCard: "S16"
      },
      {
        id: "Q_L_138", domain: "光", difficulty: "basic",
        question: "平面镜成像的原理是？",
        options: ["A. 光的直线传播", "B. 光的反射", "C. 光的折射", "D. 光的色散"],
        answer: 1, knowledge: "反射", relatedCard: "S16"
      },
      {
        id: "Q_L_139", domain: "光", difficulty: "basic",
        question: "太阳光与水平面成24°要使反射光线沿水平方向传播平面镜与水平面夹角可能是？",
        options: ["A. 24°", "B. 12°", "C. 66°", "D. 78°"],
        answer: 1, knowledge: "反射角分析", relatedCard: "S16"
      },
      {
        id: "Q_L_140", domain: "光", difficulty: "advanced",
        question: "以下属于光的反射现象的是？",
        options: ["A. 看到插入水中筷子弯折", "B. 看到湖中树的倒影", "C. 小孔成像", "D. 阳光下树的影子"],
        answer: 1, knowledge: "倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_141", domain: "光", difficulty: "advanced",
        question: "平面镜所成像的大小取决于？",
        options: ["A. 镜面的大小", "B. 物体的大小", "C. 物体与镜面的距离", "D. 平面镜放置的角度"],
        answer: 1, knowledge: "像大小=物大小", relatedCard: "S16"
      },
      {
        id: "Q_L_142", domain: "光", difficulty: "advanced",
        question: "晚上小明在桌面上铺一张白纸把一块小平面镜平放在白纸上让手电筒的光正对平面镜和白纸照射从侧面看去？",
        options: ["A. 镜子比较亮镜面反射", "B. 镜子比较暗镜面反射", "C. 白纸比较亮镜面反射", "D. 白纸比较暗漫反射"],
        answer: 1, knowledge: "侧面看镜子暗", relatedCard: "S16"
      },
      {
        id: "Q_L_143", domain: "光", difficulty: "challenge",
        question: "一束光从空气斜射入玻璃中入射角为40°折射角为25°。如果入射角增大到50°则折射角？",
        options: ["A. 大于25°小于50°", "B. 等于50°", "C. 大于50°", "D. 无法确定"],
        answer: 0, knowledge: "折射角随入射角增大", relatedCard: "A46"
      },
      {
        id: "Q_L_144", domain: "光", difficulty: "challenge",
        question: "太阳光垂直照射到一个很小的正方形小孔上则在地面上产生的光斑形状是？",
        options: ["A. 正方形", "B. 圆形", "C. 长方形", "D. 三角形"],
        answer: 1, knowledge: "小孔成像=圆形", relatedCard: "S16"
      },
      {
        id: "Q_L_145", domain: "光", difficulty: "basic",
        question: "下列关于光现象的说法中正确的是？",
        options: ["A. 光只有在真空中才沿直线传播", "B. 光在空气中一定沿直线传播", "C. 光在同一种均匀介质中沿直线传播", "D. 光总是沿直线传播"],
        answer: 2, knowledge: "同种均匀介质", relatedCard: "S16"
      },
      {
        id: "Q_L_146", domain: "光", difficulty: "basic",
        question: "下列哪一项不是光的折射现象？",
        options: ["A. 池水变浅", "B. 海市蜃楼", "C. 彩虹", "D. 水中倒影"],
        answer: 3, knowledge: "倒影=反射", relatedCard: "A46"
      },
      {
        id: "Q_L_147", domain: "光", difficulty: "basic",
        question: "光从水中斜射入空气中时以下描述正确的是？",
        options: ["A. 折射角小于入射角", "B. 折射光线靠近法线", "C. 折射光线远离法线", "D. 光不发生折射"],
        answer: 2, knowledge: "水入空气远离法线", relatedCard: "A46"
      },
      {
        id: "Q_L_148", domain: "光", difficulty: "basic",
        question: "用照相机拍摄集体照时人站好后发现有些人没有进入画面这时应采取的措施是？",
        options: ["A. 照相机离人远一些镜头前伸", "B. 照相机离人远一些镜头后缩", "C. 照相机离人近一些镜头前伸", "D. 照相机离人近一些镜头后缩"],
        answer: 1, knowledge: "离远缩小像", relatedCard: "S16"
      },
      {
        id: "Q_L_149", domain: "光", difficulty: "advanced",
        question: "凸透镜的焦距为10cm当物体从距透镜30cm处向距透镜15cm处移动的过程中所成的像？",
        options: ["A. 始终是放大的", "B. 始终是缩小的", "C. 先缩小后放大", "D. 先放大后缩小"],
        answer: 2, knowledge: "30→20缩小20→15放大", relatedCard: "S16"
      },
      {
        id: "Q_L_150", domain: "光", difficulty: "advanced",
        question: "下列关于光现象的说法不正确的是？",
        options: ["A. 光年是天文学上常用的长度单位", "B. 光在真空中传播速度为3×10⁸m/s", "C. 小孔成像成的是倒立的实像", "D. 漫反射不遵循光的反射定律"],
        answer: 3, knowledge: "漫反射也遵循", relatedCard: "S16"
      },
      {
        id: "Q_L_151", domain: "光", difficulty: "basic",
        question: "在暗室中绿光照射到红纸上我们看到纸的颜色是？",
        options: ["A. 绿色", "B. 红色", "C. 黄色", "D. 黑色"],
        answer: 3, knowledge: "红纸不反射绿光", relatedCard: "A16"
      },
      {
        id: "Q_L_152", domain: "光", difficulty: "basic",
        question: "下列现象中由于光的反射形成的是？",
        options: ["A. 小孔成像", "B. 水中倒影", "C. 雨后彩虹", "D. 海市蜃楼"],
        answer: 1, knowledge: "水中倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_153", domain: "光", difficulty: "basic",
        question: "关于光的色散现象下列说法正确的是？",
        options: ["A. 只有白光才能发生色散", "B. 色散是光被分解为单色光的现象", "C. 色散是光的反射造成的", "D. 红光也能发生色散"],
        answer: 1, knowledge: "色散定义", relatedCard: "A16"
      },
      {
        id: "Q_L_154", domain: "光", difficulty: "basic",
        question: "光在下列哪种介质中传播速度最大？",
        options: ["A. 真空", "B. 空气", "C. 水", "D. 玻璃"],
        answer: 0, knowledge: "真空中光速最大", relatedCard: "S14"
      },
      {
        id: "Q_L_155", domain: "光", difficulty: "basic",
        question: "小明在平面镜中看到墙上时钟的像是7:25则实际时间是？",
        options: ["A. 7:25", "B. 4:35", "C. 5:35", "D. 7:35"],
        answer: 1, knowledge: "镜面对称", relatedCard: "S16"
      },
      {
        id: "Q_L_156", domain: "光", difficulty: "advanced",
        question: "把一块玻璃砖放在书上透过玻璃砖看书上的字则？",
        options: ["A. 看到的是字的实像", "B. 看到的是字的虚像位置比实际高", "C. 看到的是字的虚像位置比实际低", "D. 看到的字没有变化"],
        answer: 1, knowledge: "玻璃砖折射", relatedCard: "A46"
      },
      {
        id: "Q_L_157", domain: "光", difficulty: "advanced",
        question: "以下关于光的三原色的说法正确的是？",
        options: ["A. 红黄蓝", "B. 红绿蓝", "C. 红黄绿", "D. 黄绿蓝"],
        answer: 1, knowledge: "RGB", relatedCard: "A16"
      },
      {
        id: "Q_L_158", domain: "光", difficulty: "advanced",
        question: "颜料的三原色是？",
        options: ["A. 红绿蓝", "B. 红黄蓝", "C. 品红黄青", "D. 红橙黄"],
        answer: 2, knowledge: "CMY", relatedCard: "A16"
      },
      {
        id: "Q_L_159", domain: "光", difficulty: "advanced",
        question: "一束白光通过三棱镜后在白色光屏上形成彩色光带下列说法正确的是？",
        options: ["A. 这个现象叫光的反射", "B. 彩色光带中最上面是紫光", "C. 这个现象叫光的色散", "D. 这个现象说明白光是单色光"],
        answer: 2, knowledge: "色散", relatedCard: "A16"
      },
      {
        id: "Q_L_160", domain: "光", difficulty: "basic",
        question: "使用投影仪时要在屏幕上得到正立的像投影片应？",
        options: ["A. 正立放置", "B. 倒立放置", "C. 随意放置", "D. 水平放置"],
        answer: 1, knowledge: "投影仪倒立放", relatedCard: "S16"
      },
      {
        id: "Q_L_161", domain: "光", difficulty: "basic",
        question: "下列说法正确的是？",
        options: ["A. 光年是时间单位", "B. 漫反射不遵循反射定律", "C. 光在同种均匀介质中沿直线传播", "D. 小孔成像说明光不是沿直线传播"],
        answer: 2, knowledge: "光沿直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_162", domain: "光", difficulty: "basic",
        question: "图中小孔成的是？",
        options: ["A. 倒立的虚像", "B. 正立的虚像", "C. 倒立的实像", "D. 正立的实像"],
        answer: 2, knowledge: "倒立实像", relatedCard: "S16"
      },
      {
        id: "Q_L_163", domain: "光", difficulty: "basic",
        question: "下列现象中由于光的直线传播形成的是？",
        options: ["A. 平静水面上山的倒影", "B. 放映电影时的画面", "C. 树荫下的圆形光斑", "D. 插入水中筷子弯折"],
        answer: 2, knowledge: "树荫光斑=小孔成像", relatedCard: "S16"
      },
      {
        id: "Q_L_164", domain: "光", difficulty: "basic",
        question: "下列现象中属于光的色散的是？",
        options: ["A. 雨后天空出现彩虹", "B. 池水看起来变浅", "C. 看到水中游动的鱼", "D. 阳光下树的影子"],
        answer: 0, knowledge: "彩虹=色散", relatedCard: "A16"
      },
      {
        id: "Q_L_165", domain: "光", difficulty: "basic",
        question: "关于光现象以下说法错误的是？",
        options: ["A. 阳光经过树林形成光斑属于光的直线传播", "B. 我们能看到不发光的物体是因为物体反射的光进入了眼睛", "C. 平面镜所成的像能用光屏接收", "D. 凸透镜对光有会聚作用"],
        answer: 2, knowledge: "虚像不能光屏", relatedCard: "S16"
      },
      {
        id: "Q_L_166", domain: "光", difficulty: "basic",
        question: "下列现象中由于光的折射形成的是？",
        options: ["A. 平静水面中的倒影", "B. 放大镜看到的放大的字", "C. 阳光下树的影子", "D. 穿衣镜中的像"],
        answer: 1, knowledge: "放大镜=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_167", domain: "光", difficulty: "advanced",
        question: "下列光路图中哪个是远视眼的成像光路和矫正？",
        options: ["A. 成像在视网膜前用凸透镜", "B. 成像在视网膜后用凸透镜", "C. 成像在视网膜前用凹透镜", "D. 成像在视网膜后用凹透镜"],
        answer: 1, knowledge: "远视=后移=凸透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_168", domain: "光", difficulty: "advanced",
        question: "把物体放到凸透镜前16cm处可以得到放大的像则该凸透镜的焦距可能是？",
        options: ["A. 4cm", "B. 8cm", "C. 12cm", "D. 20cm"],
        answer: 3, knowledge: "放大像u<f或f<u<2f", relatedCard: "S16"
      },
      {
        id: "Q_L_169", domain: "光", difficulty: "advanced",
        question: "某同学在做凸透镜成像实验中，将点燃的蜡烛放在凸透镜前某处，在透镜另一侧的光屏上得到烛焰清晰放大的像，然后把燃烧的蜡烛和光屏互换位置，这时光屏上？",
        options: ["A. 成倒立缩小的像", "B. 成倒立放大的像", "C. 成正立放大的像", "D. 不能成像"],
        answer: 0, knowledge: "互换后缩小像", relatedCard: "S16"
      },
      {
        id: "Q_L_170", domain: "光", difficulty: "basic",
        question: "下列关于光现象的说法中错误的是？",
        options: ["A. 太阳光通过三棱镜后会分解为彩色光带", "B. 近视眼需要佩戴凹透镜矫正", "C. 漫反射不遵守光的反射定律", "D. 平面镜成像像是正立的虚像"],
        answer: 2, knowledge: "漫反射遵守", relatedCard: "S16"
      },
      {
        id: "Q_L_171", domain: "光", difficulty: "basic",
        question: "下列家用电器中利用红外线工作的是？",
        options: ["A. 验钞机", "B. 电视机遥控器", "C. 灭菌灯", "D. 节能灯"],
        answer: 1, knowledge: "遥控=红外线", relatedCard: "A17"
      },
      {
        id: "Q_L_172", domain: "光", difficulty: "basic",
        question: "某同学从平面镜中看到自己的像当他靠近平面镜时他在平面镜中的像？",
        options: ["A. 变大", "B. 变小", "C. 不变", "D. 先大后小"],
        answer: 2, knowledge: "像大小不变", relatedCard: "S16"
      },
      {
        id: "Q_L_173", domain: "光", difficulty: "basic",
        question: "雨后天晴的夜晚为了不踩到地上的积水下面判断正确的是？",
        options: ["A. 迎着月光走地上发亮处是水", "B. 迎着月光走地上暗处是水", "C. 背着月光走亮处是水", "D. 无法判断"],
        answer: 0, knowledge: "水面镜面反射", relatedCard: "S16"
      },
      {
        id: "Q_L_174", domain: "光", difficulty: "basic",
        question: "下列关于光现象的说法中正确的是？",
        options: ["A. 小孔成像的光屏上出现的是倒立的虚像", "B. 在平面镜中看到自己的像是由光的反射形成的虚像", "C. 水中鱼的像是由光的折射形成的实像", "D. 凸透镜成像中实像都是倒立的虚像都是正立的"],
        answer: 3, knowledge: "凸透镜实倒虚正", relatedCard: "S16"
      },
      {
        id: "Q_L_175", domain: "光", difficulty: "advanced",
        question: "如图所示的四种现象中属于光的折射现象的是？",
        options: ["A. 水中倒影", "B. 灯光下的手影", "C. 池水看起来变浅", "D. 平面镜中的像"],
        answer: 2, knowledge: "池水变浅=折射", relatedCard: "A46"
      },
      {
        id: "Q_L_176", domain: "光", difficulty: "advanced",
        question: "凸透镜的焦距为12cm当物体距透镜20cm时所成的像是？",
        options: ["A. 倒立缩小实像", "B. 倒立放大实像", "C. 正立放大虚像", "D. 倒立等大实像"],
        answer: 1, knowledge: "f=12u=20f<u<2f", relatedCard: "S16"
      },
      {
        id: "Q_L_177", domain: "光", difficulty: "challenge",
        question: "在探究凸透镜成像规律实验中当光屏上出现蜡烛清晰的像时如果用遮光板挡住透镜的上半部分观察光屏上像的变化情况是？",
        options: ["A. 像的上半部分消失", "B. 像的下半部分消失", "C. 像仍然是完整的但亮度变暗", "D. 像完全消失"],
        answer: 2, knowledge: "遮挡部分透镜", relatedCard: "S16"
      },
      {
        id: "Q_L_178", domain: "光", difficulty: "basic",
        question: "鱼儿在清澈的水中游动可以看得很清楚。然而沿着你看见鱼的方向去叉它却叉不到。有经验的渔民都知道只有瞄准鱼的下方才能把鱼叉到。这是因为？",
        options: ["A. 发生了镜面反射", "B. 发生了漫反射", "C. 发生了光的折射", "D. 发生了光的色散"],
        answer: 2, knowledge: "折射", relatedCard: "A46"
      },
      {
        id: "Q_L_179", domain: "光", difficulty: "basic",
        question: "潜入水中工作的潜水员看见岸上树梢位置变高了。下图四幅光路图中能正确说明产生这一现象的是？",
        options: ["A. 光从空气斜射入水", "B. 光从水斜射入空气", "C. 光的反射", "D. 光的直线传播"],
        answer: 1, knowledge: "水中看岸上=水入空气", relatedCard: "A46"
      },
      {
        id: "Q_L_180", domain: "光", difficulty: "basic",
        question: "下列有关光现象的解释正确的是？",
        options: ["A. 通过放大镜看到物体放大的虚像", "B. 雨后彩虹是光的反射现象", "C. 小孔成像是光的折射现象", "D. 看到水中的鱼是实像"],
        answer: 0, knowledge: "放大镜=虚像", relatedCard: "S16"
      },
      {
        id: "Q_L_181", domain: "光", difficulty: "advanced",
        question: "望远镜物镜的作用是使远处的物体在焦点附近成实像，这个像是？",
        options: ["A. 倒立放大的", "B. 倒立缩小的", "C. 正立放大的", "D. 正立缩小的"],
        answer: 1, knowledge: "望远镜物镜成缩小实像", relatedCard: "C09"
      },
      {
        id: "Q_L_182", domain: "光", difficulty: "advanced",
        question: "显微镜的物镜成的是什么像？",
        options: ["A. 正立放大的虚像", "B. 倒立放大的实像", "C. 倒立缩小的实像", "D. 正立等大的虚像"],
        answer: 1, knowledge: "显微镜物镜成放大实像", relatedCard: "S16"
      },
      {
        id: "Q_L_183", domain: "光", difficulty: "challenge",
        question: "将物体放在距凸透镜40cm处，在透镜另一侧距透镜30cm处的光屏上得到一个清晰的像，则此凸透镜的焦距可能是？",
        options: ["A. 10cm", "B. 15cm", "C. 20cm", "D. 25cm"],
        answer: 1, knowledge: "1/f=1/u+1/v≈1/17.1", relatedCard: "S16"
      },
      {
        id: "Q_L_184", domain: "光", difficulty: "challenge",
        question: "小明同学在光具座上做研究凸透镜成像的实验。当烛焰透镜及光屏位置如图所示时恰能在光屏上得到一个清晰的像。由此判断他所用凸透镜的焦距？",
        options: ["A. 一定大于20cm", "B. 一定小于8cm", "C. 一定在10cm到16cm之间", "D. 一定在8cm到10cm之间"],
        answer: 3, knowledge: "u=20v=16", relatedCard: "S16"
      },
      {
        id: "Q_L_185", domain: "光", difficulty: "basic",
        question: "如图所示的四种现象中由于光的直线传播形成的是？",
        options: ["A. 镜中花", "B. 水中桥", "C. 林中影", "D. 缸中鱼"],
        answer: 2, knowledge: "林中影=直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_186", domain: "光", difficulty: "basic",
        question: "下列现象中由于光的反射形成的是？",
        options: ["A. 日食", "B. 水中倒影", "C. 小孔成像", "D. 折断的筷子"],
        answer: 1, knowledge: "水中倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_187", domain: "光", difficulty: "basic",
        question: "下列光现象与物理知识的对应关系不正确的是？",
        options: ["A. 水中倒影——平面镜成像", "B. 潭清疑水浅——光的折射", "C. 树荫下的光斑——光的反射", "D. 雨后彩虹——光的色散"],
        answer: 2, knowledge: "树荫光斑=直线传播", relatedCard: "S16"
      },
      {
        id: "Q_L_188", domain: "光", difficulty: "basic",
        question: "春天到了小明和同学去春游，在阳光下小明看到自己在地上的影子他们想到可以用影子长度来粗略计算时间。这是因为？",
        options: ["A. 光沿直线传播", "B. 光的反射", "C. 光的折射", "D. 光的色散"],
        answer: 0, knowledge: "影子长度变化", relatedCard: "S16"
      },
      {
        id: "Q_L_189", domain: "光", difficulty: "advanced",
        question: "室内游泳池上方悬挂着的灯在水的折射作用下从游泳池外面看起来的位置与实际位置相比？",
        options: ["A. 变高了", "B. 变低了", "C. 没有变化", "D. 无法确定"],
        answer: 0, knowledge: "看水中物体变浅/高", relatedCard: "A46"
      },
      {
        id: "Q_L_190", domain: "光", difficulty: "advanced",
        question: "以下光现象的形成原理与其他三个不同的是？",
        options: ["A. 湖面倒影", "B. 水中筷子变弯", "C. 海市蜃楼", "D. 雨后彩虹"],
        answer: 0, knowledge: "倒影=反射其他=折射", relatedCard: "S16"
      },
      {
        id: "Q_L_191", domain: "光", difficulty: "basic",
        question: "一束光从空气斜射入水面时一部分光被反射回空气中另一部分光进入水中。这个现象说明？",
        options: ["A. 光在同种介质中沿直线传播", "B. 光在两种介质的分界面上同时发生反射和折射", "C. 光在水中不沿直线传播", "D. 反射光和折射光的传播方向相同"],
        answer: 1, knowledge: "同时反射折射", relatedCard: "A46"
      },
      {
        id: "Q_L_192", domain: "光", difficulty: "basic",
        question: "当光从空气射向水面时会发生的现象是？",
        options: ["A. 只有反射", "B. 只有折射", "C. 同时发生反射和折射", "D. 既不反射也不折射"],
        answer: 2, knowledge: "同时反射折射", relatedCard: "A46"
      },
      {
        id: "Q_L_193", domain: "光", difficulty: "basic",
        question: "池水看起来比实际浅是因为？",
        options: ["A. 光的反射", "B. 光沿直线传播", "C. 光的折射", "D. 光的色散"],
        answer: 2, knowledge: "折射", relatedCard: "A46"
      },
      {
        id: "Q_L_194", domain: "光", difficulty: "basic",
        question: "一束激光从空气斜射入水中入射角为45°则折射角？",
        options: ["A. 等于45°", "B. 大于45°", "C. 小于45°", "D. 等于90°"],
        answer: 2, knowledge: "空气入水折射角小", relatedCard: "A46"
      },
      {
        id: "Q_L_195", domain: "光", difficulty: "basic",
        question: "下列现象中与光的折射无关的是？",
        options: ["A. 海市蜃楼", "B. 池水看起来较浅", "C. 水中倒影", "D. 水中的筷子弯折"],
        answer: 2, knowledge: "倒影=反射", relatedCard: "S16"
      },
      {
        id: "Q_L_196", domain: "光", difficulty: "basic",
        question: "如图甲所示是某同学在平面镜中看到的钟表的像则此时的实际时间是？",
        options: ["A. 3:40", "B. 4:20", "C. 8:20", "D. 7:20"],
        answer: 1, knowledge: "对称", relatedCard: "S16"
      },
      {
        id: "Q_L_197", domain: "光", difficulty: "basic",
        question: "清澈平静的湖面上空一只小燕子正向下俯冲捕食。在小燕子向下俯冲的过程中它在湖水的像相对于湖面的变化是？",
        options: ["A. 像变大", "B. 像变小", "C. 像大小不变", "D. 无法确定"],
        answer: 2, knowledge: "像大小不变", relatedCard: "S16"
      },
      {
        id: "Q_L_198", domain: "光", difficulty: "basic",
        question: "关于光现象以下说法正确的是？",
        options: ["A. 光在真空中不能传播", "B. 光年是时间单位", "C. 光在玻璃中的传播速度小于在真空中的速度", "D. 光在任何介质中都沿直线传播"],
        answer: 2, knowledge: "介质中光速更慢", relatedCard: "S14"
      },
      {
        id: "Q_L_199", domain: "光", difficulty: "basic",
        question: "小明在课外用易拉罐做成小孔成像实验装置。如果易拉罐底部有一个很小的三角形小孔则他在半透明纸上看到的像是？",
        options: ["A. 三角形光斑", "B. 圆形光斑", "C. 蜡烛的倒立像", "D. 蜡烛的正立像"],
        answer: 2, knowledge: "小孔成像", relatedCard: "S16"
      },
      {
        id: "Q_L_200", domain: "光", difficulty: "basic",
        question: "夜晚我们在池边可看到岸边路灯倒映在水中这是光的什么造成的？",
        options: ["A. 直线传播", "B. 反射", "C. 折射", "D. 色散"],
        answer: 1, knowledge: "水中倒影=反射", relatedCard: "S16"
      },
      // ==================================================
      // 热 领域
      // ==================================================
      {
        id: "Q_H_001", domain: "热", difficulty: "basic",
        question: "物体的冷热程度用什么物理量表示？",
        options: ["A. 热量", "B. 温度", "C. 内能", "D. 比热容"],
        answer: 1, knowledge: "温度定义", relatedCard: "S19"
      },
      {
        id: "Q_H_002", domain: "热", difficulty: "basic",
        question: "常用温度计是根据什么原理制成的？",
        options: ["A. 热胀冷缩", "B. 热传递", "C. 热辐射", "D. 热传导"],
        answer: 0, knowledge: "温度计原理", relatedCard: "A24"
      },
      {
        id: "Q_H_003", domain: "热", difficulty: "basic",
        question: "冰水混合物的温度规定为？",
        options: ["A. 0°C", "B. 100°C", "C. -273°C", "D. 37°C"],
        answer: 0, knowledge: "冰水混合物", relatedCard: "S19"
      },
      {
        id: "Q_H_004", domain: "热", difficulty: "basic",
        question: "标准大气压下沸水的温度是？",
        options: ["A. 0°C", "B. 100°C", "C. 90°C", "D. 110°C"],
        answer: 1, knowledge: "沸水温度", relatedCard: "S19"
      },
      {
        id: "Q_H_005", domain: "热", difficulty: "basic",
        question: "体温计的量程通常是？",
        options: ["A. 0-100°C", "B. 35-42°C", "C. -10-110°C", "D. 30-50°C"],
        answer: 1, knowledge: "体温计量程", relatedCard: "S19"
      },
      {
        id: "Q_H_006", domain: "热", difficulty: "basic",
        question: "物质从固态变成液态的过程叫做？",
        options: ["A. 凝固", "B. 熔化", "C. 汽化", "D. 液化"],
        answer: 1, knowledge: "熔化", relatedCard: "A26"
      },
      {
        id: "Q_H_007", domain: "热", difficulty: "basic",
        question: "物质从液态变成固态的过程叫做？",
        options: ["A. 熔化", "B. 凝固", "C. 汽化", "D. 液化"],
        answer: 1, knowledge: "凝固", relatedCard: "A26"
      },
      {
        id: "Q_H_008", domain: "热", difficulty: "basic",
        question: "晶体和非晶体熔化时的区别？",
        options: ["A. 温度不同", "B. 晶体有固定熔点", "C. 时间不同", "D. 吸热不同"],
        answer: 1, knowledge: "晶体熔点", relatedCard: "S20"
      },
      {
        id: "Q_H_009", domain: "热", difficulty: "basic",
        question: "冰变成水吸热还是放热？",
        options: ["A. 吸热", "B. 放热", "C. 不吸不放", "D. 不确定"],
        answer: 0, knowledge: "熔化吸热", relatedCard: "A26"
      },
      {
        id: "Q_H_010", domain: "热", difficulty: "basic",
        question: "水变成冰吸热还是放热？",
        options: ["A. 吸热", "B. 放热", "C. 不吸不放", "D. 不确定"],
        answer: 1, knowledge: "凝固放热", relatedCard: "A26"
      },
      {
        id: "Q_H_011", domain: "热", difficulty: "basic",
        question: "物质从液态变成气态的过程？",
        options: ["A. 熔化", "B. 凝固", "C. 汽化", "D. 液化"],
        answer: 2, knowledge: "汽化", relatedCard: "A25"
      },
      {
        id: "Q_H_012", domain: "热", difficulty: "basic",
        question: "物质从气态变成液态的过程？",
        options: ["A. 熔化", "B. 凝固", "C. 汽化", "D. 液化"],
        answer: 3, knowledge: "液化", relatedCard: "A25"
      },
      {
        id: "Q_H_013", domain: "热", difficulty: "basic",
        question: "晾在室外的湿衣服干是因为？",
        options: ["A. 熔化", "B. 凝固", "C. 蒸发", "D. 液化"],
        answer: 2, knowledge: "蒸发", relatedCard: "A25"
      },
      {
        id: "Q_H_014", domain: "热", difficulty: "basic",
        question: "沸腾在什么温度下发生？",
        options: ["A. 任意温度", "B. 沸点", "C. 熔点", "D. 室温"],
        answer: 1, knowledge: "沸点", relatedCard: "A25"
      },
      {
        id: "Q_H_015", domain: "热", difficulty: "basic",
        question: "蒸发和沸腾的共同点？",
        options: ["A. 都是熔化", "B. 都是凝固", "C. 都是汽化", "D. 都是液化"],
        answer: 2, knowledge: "都是汽化", relatedCard: "A25"
      },
      {
        id: "Q_H_016", domain: "热", difficulty: "basic",
        question: "蒸发发生在液体的？",
        options: ["A. 表面", "B. 内部", "C. 表内同时", "D. 底部"],
        answer: 0, knowledge: "表面", relatedCard: "A25"
      },
      {
        id: "Q_H_017", domain: "热", difficulty: "basic",
        question: "沸腾发生在液体的？",
        options: ["A. 只在表面", "B. 表面和内部同时", "C. 只在内部", "D. 液面以上"],
        answer: 1, knowledge: "表内同时", relatedCard: "A25"
      },
      {
        id: "Q_H_018", domain: "热", difficulty: "basic",
        question: "哪个不影响蒸发快慢？",
        options: ["A. 温度", "B. 表面积", "C. 空气流速", "D. 液体体积"],
        answer: 3, knowledge: "蒸发因素", relatedCard: "A25"
      },
      {
        id: "Q_H_019", domain: "热", difficulty: "basic",
        question: "夏天吹风扇凉快因为？",
        options: ["A. 降低室温", "B. 加快汗蒸发", "C. 吹冷风", "D. 产生冷气"],
        answer: 1, knowledge: "蒸发", relatedCard: "A25"
      },
      {
        id: "Q_H_020", domain: "热", difficulty: "basic",
        question: "固→气直接转化叫？",
        options: ["A. 熔化", "B. 汽化", "C. 升华", "D. 凝华"],
        answer: 2, knowledge: "升华", relatedCard: "A47"
      },
      {
        id: "Q_H_021", domain: "热", difficulty: "basic",
        question: "气→固直接转化叫？",
        options: ["A. 汽化", "B. 液化", "C. 升华", "D. 凝华"],
        answer: 3, knowledge: "凝华", relatedCard: "A47"
      },
      {
        id: "Q_H_022", domain: "热", difficulty: "basic",
        question: "樟脑丸变小消失属于？",
        options: ["A. 熔化", "B. 汽化", "C. 升华", "D. 液化"],
        answer: 2, knowledge: "升华", relatedCard: "A47"
      },
      {
        id: "Q_H_023", domain: "热", difficulty: "basic",
        question: "冬天玻璃上冰花属于？",
        options: ["A. 熔化", "B. 液化", "C. 升华", "D. 凝华"],
        answer: 3, knowledge: "凝华", relatedCard: "A47"
      },
      {
        id: "Q_H_024", domain: "热", difficulty: "basic",
        question: "以下过程吸热的是？",
        options: ["A. 凝固", "B. 液化", "C. 凝华", "D. 熔化"],
        answer: 3, knowledge: "熔化吸热", relatedCard: "A26"
      },
      {
        id: "Q_H_025", domain: "热", difficulty: "basic",
        question: "以下过程放热的是？",
        options: ["A. 熔化", "B. 汽化", "C. 液化", "D. 升华"],
        answer: 2, knowledge: "液化放热", relatedCard: "A25"
      },
      {
        id: "Q_H_026", domain: "热", difficulty: "basic",
        question: "关于热量正确的是？",
        options: ["A. 温度高热量多", "B. 热量是热传递中传递的能量", "C. 升温一定吸了热", "D. 高温定传低温"],
        answer: 1, knowledge: "热量定义", relatedCard: "S19"
      },
      {
        id: "Q_H_027", domain: "热", difficulty: "basic",
        question: "水比热容大意味着？",
        options: ["A. 容易升温", "B. 升温降温慢", "C. 总是凉的", "D. 不能传热"],
        answer: 1, knowledge: "比热容大", relatedCard: "S17"
      },
      {
        id: "Q_H_028", domain: "热", difficulty: "basic",
        question: "金属勺放热汤中手烫属于？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 三种都有"],
        answer: 0, knowledge: "热传导", relatedCard: "A21"
      },
      {
        id: "Q_H_029", domain: "热", difficulty: "basic",
        question: "烧开水上下循环属于？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 热膨胀"],
        answer: 1, knowledge: "热对流", relatedCard: "A22"
      },
      {
        id: "Q_H_030", domain: "热", difficulty: "basic",
        question: "太阳热传到地球属于？",
        options: ["A. 热传导", "B. 热对流", "C. 热辐射", "D. 传导对流"],
        answer: 2, knowledge: "热辐射", relatedCard: "A23"
      },
      {
        id: "Q_H_031", domain: "热", difficulty: "basic",
        question: "改变内能的方式？",
        options: ["A. 只有做功", "B. 只有热传递", "C. 做功和热传递", "D. 只有摩擦"],
        answer: 2, knowledge: "两种方式", relatedCard: "S19"
      },
      {
        id: "Q_H_032", domain: "热", difficulty: "basic",
        question: "比热容最大的是？",
        options: ["A. 沙子", "B. 铁", "C. 水", "D. 酒精"],
        answer: 2, knowledge: "水", relatedCard: "S22"
      },
      {
        id: "Q_H_033", domain: "热", difficulty: "basic",
        question: "热水袋取暖利用水？",
        options: ["A. 密度大", "B. 比热容大", "C. 沸点高", "D. 透明好"],
        answer: 1, knowledge: "比热容大", relatedCard: "S22"
      },
      {
        id: "Q_H_034", domain: "热", difficulty: "basic",
        question: "内燃机哪个冲程内→机？",
        options: ["A. 吸气", "B. 压缩", "C. 做功", "D. 排气"],
        answer: 2, knowledge: "做功冲程", relatedCard: "S18"
      },
      {
        id: "Q_H_035", domain: "热", difficulty: "basic",
        question: "压缩冲程能量转化？",
        options: ["A. 内→机", "B. 机→内", "C. 化→内", "D. 内→化"],
        answer: 1, knowledge: "机→内", relatedCard: "S23"
      },
      {
        id: "Q_H_036", domain: "热", difficulty: "basic",
        question: "能量守恒定律表明？",
        options: ["A. 凭空产生", "B. 凭空消失", "C. 转化或转移", "D. 总量不断减"],
        answer: 2, knowledge: "守恒", relatedCard: "T01"
      },
      {
        id: "Q_H_037", domain: "热", difficulty: "basic",
        question: "物体吸热温度一定升？",
        options: ["A. 一定", "B. 一定不", "C. 晶体熔时温不升", "D. 只有液体"],
        answer: 2, knowledge: "晶体熔化", relatedCard: "S25"
      },
      {
        id: "Q_H_038", domain: "热", difficulty: "basic",
        question: "0°C冰熔成0°C水？",
        options: ["A. 吸热升温", "B. 吸热不升温", "C. 放热不升温", "D. 不吸不放"],
        answer: 1, knowledge: "熔化不升温", relatedCard: "S20"
      },
      {
        id: "Q_H_039", domain: "热", difficulty: "basic",
        question: "热机效率表达式？",
        options: ["A. 有用功/总功", "B. 总功/有用功", "C. 功率/时间", "D. 功/时间"],
        answer: 0, knowledge: "效率", relatedCard: "S23"
      },
      {
        id: "Q_H_040", domain: "热", difficulty: "basic",
        question: "不属于扩散的是？",
        options: ["A. 炒菜满屋香", "B. 糖入水变甜", "C. 扫地灰飞扬", "D. 堆煤墙变黑"],
        answer: 2, knowledge: "灰尘非扩散", relatedCard: "S19"
      },
      {
        id: "Q_H_041", domain: "热", difficulty: "advanced",
        question: "热量温度内能关系正确的是？",
        options: ["A. 温度高含热多", "B. 热从大内传小内", "C. 升温内能定增", "D. 吸热温定升"],
        answer: 2, knowledge: "升温内增", relatedCard: "S19"
      },
      {
        id: "Q_H_042", domain: "热", difficulty: "advanced",
        question: "下列放热的是？",
        options: ["A. 熔化", "B. 汽化", "C. 液化", "D. 升华"],
        answer: 2, knowledge: "液化放热", relatedCard: "A26"
      },
      {
        id: "Q_H_043", domain: "热", difficulty: "advanced",
        question: "关于蒸发沸腾正确的是？",
        options: ["A. 都只在液面", "B. 蒸吸沸放", "C. 蒸任意温", "D. 沸不需沸点"],
        answer: 2, knowledge: "蒸发任意温度", relatedCard: "A25"
      },
      {
        id: "Q_H_044", domain: "热", difficulty: "advanced",
        question: "冬天铁比木头冷因为？",
        options: ["A. 铁温低", "B. 铁导热好", "C. 木比热大", "D. 铁色深"],
        answer: 1, knowledge: "导热性", relatedCard: "A21"
      },
      {
        id: "Q_H_045", domain: "热", difficulty: "advanced",
        question: "-5°C冰入0°C水正确的是？",
        options: ["A. 冰即熔", "B. 水即结", "C. 冰升温部分水结", "D. 都不变"],
        answer: 2, knowledge: "热传递分析", relatedCard: "A26"
      },
      {
        id: "Q_H_046", domain: "热", difficulty: "advanced",
        question: "海陆风成因最佳解释？",
        options: ["A. 水比热比陆大", "B. 水密度大", "C. 陆摩擦小", "D. 海压高"],
        answer: 0, knowledge: "比热容", relatedCard: "S17"
      },
      {
        id: "Q_H_047", domain: "热", difficulty: "advanced",
        question: "分子运动最剧烈的是？",
        options: ["A. 固态", "B. 液态", "C. 气态", "D. 一样"],
        answer: 2, knowledge: "气态", relatedCard: "S19"
      },
      {
        id: "Q_H_048", domain: "热", difficulty: "advanced",
        question: "热水瓶双层真空目的？",
        options: ["A. 防对流传导", "B. 增热辐射", "C. 快散热", "D. 减重"],
        answer: 0, knowledge: "隔热", relatedCard: "S17"
      },
      {
        id: "Q_H_049", domain: "热", difficulty: "advanced",
        question: "内燃机压缩冲程？",
        options: ["A. 内→机", "B. 机→内", "C. 化→内", "D. 内→化"],
        answer: 1, knowledge: "压缩", relatedCard: "S23"
      },
      {
        id: "Q_H_050", domain: "热", difficulty: "advanced",
        question: "关于热机效率正确的是？",
        options: ["A. 可达100%", "B. 总小于1", "C. 取决于燃料", "D. 做功效率最高"],
        answer: 1, knowledge: "效率<1", relatedCard: "S23"
      },
      {
        id: "Q_H_051", domain: "热", difficulty: "advanced",
        question: "冬天说话时呼出的「白气」是什么？",
        options: ["A. 水蒸气", "B. 水蒸气液化成小水滴", "C. 空气", "D. 干冰"],
        answer: 1, knowledge: "白气=液滴", relatedCard: "A25"
      },
      {
        id: "Q_H_052", domain: "热", difficulty: "advanced",
        question: "以下吸热的是？",
        options: ["A. 凝固", "B. 液化", "C. 凝华", "D. 升华"],
        answer: 3, knowledge: "升华吸热", relatedCard: "A47"
      },
      {
        id: "Q_H_053", domain: "热", difficulty: "advanced",
        question: "80°C水放20°C房间？",
        options: ["A. 即降至20", "B. 渐冷近室温", "C. 永不变", "D. 先冷再升"],
        answer: 1, knowledge: "热传递", relatedCard: "A21"
      },
      {
        id: "Q_H_054", domain: "热", difficulty: "advanced",
        question: "质量相等、初温相同的水和煤油吸收相同热量，哪个升温更多？",
        options: ["A. 水", "B. 煤油", "C. 同", "D. 无法"],
        answer: 1, knowledge: "煤比热小", relatedCard: "S22"
      },
      {
        id: "Q_H_055", domain: "热", difficulty: "advanced",
        question: "热水自然冷却正确的是？",
        options: ["A. 一直不变", "B. 降至室温不变", "C. 降至0不变", "D. 降至低于室温回升"],
        answer: 1, knowledge: "热平衡", relatedCard: "A21"
      },
      {
        id: "Q_H_056", domain: "热", difficulty: "advanced",
        question: "属于升华的是？",
        options: ["A. 冰棒白气", "B. 玻璃冰花", "C. 樟脑丸消失", "D. 草叶露珠"],
        answer: 2, knowledge: "升华", relatedCard: "A47"
      },
      {
        id: "Q_H_057", domain: "热", difficulty: "advanced",
        question: "正确的是？",
        options: ["A. 0°C冰无内能", "B. 温高运动剧烈", "C. 吸热定升温", "D. 热从大内传小内"],
        answer: 1, knowledge: "温高运动剧", relatedCard: "S19"
      },
      {
        id: "Q_H_058", domain: "热", difficulty: "challenge",
        question: "热量温度内能关系正确的是？",
        options: ["A. 温高含热多", "B. 热从大内传小内", "C. 温升内能增", "D. 吸热温定升"],
        answer: 2, knowledge: "温升内增", relatedCard: "S19"
      },
      {
        id: "Q_H_059", domain: "热", difficulty: "challenge",
        question: "等质金属加热放冰熔化多具有？",
        options: ["A. 较大密度", "B. 较大比热容", "C. 较高温度", "D. 较大体积"],
        answer: 1, knowledge: "比热大热多", relatedCard: "S22"
      },
      {
        id: "Q_H_060", domain: "热", difficulty: "basic",
        question: "铁轨留缝隙防止？",
        options: ["A. 生锈", "B. 热胀冷缩", "C. 出轨", "D. 积水"],
        answer: 1, knowledge: "热胀冷缩", relatedCard: "A24"
      },
      {
        id: "Q_H_061", domain: "热", difficulty: "basic",
        question: "铁棒入火变热通过？",
        options: ["A. 做功", "B. 热传递", "C. 热辐射", "D. 热对流"],
        answer: 1, knowledge: "热传递", relatedCard: "A21"
      },
      {
        id: "Q_H_062", domain: "热", difficulty: "basic",
        question: "搓手取暖通过？",
        options: ["A. 做功", "B. 热传递", "C. 热辐射", "D. 热对流"],
        answer: 0, knowledge: "摩擦做功", relatedCard: "A21"
      },
      {
        id: "Q_H_063", domain: "热", difficulty: "basic",
        question: "晶体熔化时？",
        options: ["A. 都固熔", "B. 温度不变", "C. 非晶熔温不变", "D. 晶不吸热"],
        answer: 1, knowledge: "温度不变", relatedCard: "S20"
      },
      {
        id: "Q_H_064", domain: "热", difficulty: "basic",
        question: "冰棍冒白气因？",
        options: ["A. 冰升华", "B. 水蒸气液化", "C. 冰熔化", "D. 冰汽化"],
        answer: 1, knowledge: "液化", relatedCard: "A25"
      },
      {
        id: "Q_H_065", domain: "热", difficulty: "basic",
        question: "关于汽化正确的是？",
        options: ["A. 蒸只在沸", "B. 沸在任意", "C. 蒸在任意", "D. 都需沸"],
        answer: 2, knowledge: "蒸发任意", relatedCard: "A25"
      },
      {
        id: "Q_H_066", domain: "热", difficulty: "basic",
        question: "高压锅快煮因？",
        options: ["A. 增压升沸点", "B. 增压降沸点", "C. 降压升沸点", "D. 降压降沸点"],
        answer: 0, knowledge: "增压升沸", relatedCard: "A25"
      },
      {
        id: "Q_H_067", domain: "热", difficulty: "basic",
        question: "车用水冷却因水？",
        options: ["A. 密度大", "B. 比热容大", "C. 沸点高", "D. 流动性好"],
        answer: 1, knowledge: "比热大", relatedCard: "S22"
      },
      {
        id: "Q_H_068", domain: "热", difficulty: "basic",
        question: "关于燃料热值正确的是？",
        options: ["A. 放热多热值大", "B. 与燃烧无关", "C. 是燃料特性", "D. 易燃烧热值大"],
        answer: 2, knowledge: "特性", relatedCard: "S18"
      },
      {
        id: "Q_H_069", domain: "热", difficulty: "basic",
        question: "可再生能源？",
        options: ["A. 煤", "B. 石油", "C. 太阳能", "D. 天然气"],
        answer: 2, knowledge: "太阳能", relatedCard: "A41"
      },
      {
        id: "Q_H_070", domain: "热", difficulty: "advanced",
        question: "水沸后继续加热水温？",
        options: ["A. 继续升", "B. 不变", "C. 降", "D. 先升后降"],
        answer: 1, knowledge: "沸时温不变", relatedCard: "A25"
      },
      {
        id: "Q_H_071", domain: "热", difficulty: "advanced",
        question: "冰棍白气正确的是？",
        options: ["A. 冰升华产水蒸气", "B. 水蒸气液化小水珠", "C. 冰熔产水", "D. 冰汽产水蒸气"],
        answer: 1, knowledge: "液化", relatedCard: "A25"
      },
      {
        id: "Q_H_072", domain: "热", difficulty: "advanced",
        question: "扩散现象表明？",
        options: ["A. 只气间", "B. 只液间", "C. 分子无规则", "D. 分间引力"],
        answer: 2, knowledge: "分子运动", relatedCard: "S19"
      },
      {
        id: "Q_H_073", domain: "热", difficulty: "advanced",
        question: "半瓶酒精倒掉剩下？",
        options: ["A. 比热热值减半", "B. 都不变", "C. 比热半热不变", "D. 比热不变热半"],
        answer: 1, knowledge: "特性不变", relatedCard: "S22"
      },
      {
        id: "Q_H_074", domain: "热", difficulty: "advanced",
        question: "热传递改内能？",
        options: ["A. 搓手", "B. 打气壁热", "C. 烧水水热", "D. 锯条热"],
        answer: 2, knowledge: "烧水", relatedCard: "A21"
      },
      {
        id: "Q_H_075", domain: "热", difficulty: "advanced",
        question: "关于内能正确的是？",
        options: ["A. 0°C物无内", "B. 温高内大", "C. 内增温定升", "D. 任何物有内"],
        answer: 3, knowledge: "都有内能", relatedCard: "S19"
      },
      {
        id: "Q_H_076", domain: "热", difficulty: "advanced",
        question: "做功冲程？",
        options: ["A. 内→机", "B. 机→内", "C. 化→内", "D. 电→机"],
        answer: 0, knowledge: "做功", relatedCard: "S18"
      },
      {
        id: "Q_H_077", domain: "热", difficulty: "advanced",
        question: "能量守恒正确的是？",
        options: ["A. 可消灭", "B. 可创造", "C. 凭空产生", "D. 不灭不创只转"],
        answer: 3, knowledge: "守恒定律", relatedCard: "T01"
      },
      {
        id: "Q_H_078", domain: "热", difficulty: "advanced",
        question: "做功改内能？",
        options: ["A. 炉烧水", "B. 阳晒被", "C. 热水袋", "D. 两手摩擦"],
        answer: 3, knowledge: "摩擦做功", relatedCard: "A21"
      },
      {
        id: "Q_H_079", domain: "热", difficulty: "advanced",
        question: "放热过程？",
        options: ["A. 熔化", "B. 蒸发", "C. 升华", "D. 凝华"],
        answer: 3, knowledge: "凝华放热", relatedCard: "A47"
      },
      {
        id: "Q_H_080", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的铜和铝吸收相同热量后接触，热从哪个物体传递到哪个物体？（c铝>c铜）",
        options: ["A. 铜→铝", "B. 铝→铜", "C. 不传", "D. 无法"],
        answer: 0, knowledge: "铜温升多", relatedCard: "S22"
      },
      {
        id: "Q_H_081", domain: "热", difficulty: "challenge",
        question: "热机与环境正确的是？",
        options: ["A. 不污染", "B. 废气无用", "C. 造成污染", "D. 无关"],
        answer: 2, knowledge: "污染", relatedCard: "S18"
      },
      {
        id: "Q_H_082", domain: "热", difficulty: "challenge",
        question: "不能提高热机效率？",
        options: ["A. 充分燃烧", "B. 减少热损", "C. 减小摩擦", "D. 提高功率"],
        answer: 3, knowledge: "功率≠效", relatedCard: "S23"
      },
      {
        id: "Q_H_083", domain: "热", difficulty: "basic",
        question: "可离开物体读数温度计？",
        options: ["A. 实验室", "B. 体温计", "C. 寒暑表", "D. 以上"],
        answer: 1, knowledge: "缩口", relatedCard: "S19"
      },
      {
        id: "Q_H_084", domain: "热", difficulty: "basic",
        question: "体温计用前甩一甩因？",
        options: ["A. 甩水银", "B. 水银回泡", "C. 更准", "D. 消毒"],
        answer: 1, knowledge: "缩口", relatedCard: "S19"
      },
      {
        id: "Q_H_085", domain: "热", difficulty: "basic",
        question: "属于凝华的是？",
        options: ["A. 冬晨霜", "B. 秋晨雾", "C. 春晨露", "D. 夏冰雾"],
        answer: 0, knowledge: "霜", relatedCard: "A47"
      },
      {
        id: "Q_H_086", domain: "热", difficulty: "basic",
        question: "属于液化的是？",
        options: ["A. 湿衣干", "B. 樟变小", "C. 水管出汗", "D. 冰化水"],
        answer: 2, knowledge: "出汗=液化", relatedCard: "A25"
      },
      {
        id: "Q_H_087", domain: "热", difficulty: "basic",
        question: "属于汽化的是？",
        options: ["A. 湿衣干", "B. 冰化水", "C. 哈气白", "D. 霜"],
        answer: 0, knowledge: "干=汽", relatedCard: "A25"
      },
      {
        id: "Q_H_088", domain: "热", difficulty: "basic",
        question: "属于熔化的是？",
        options: ["A. 冰雪消融", "B. 衣晾干", "C. 露珠", "D. 水结冰"],
        answer: 0, knowledge: "熔", relatedCard: "A26"
      },
      {
        id: "Q_H_089", domain: "热", difficulty: "basic",
        question: "烧红的铁块放入冷水中出现白气，发生的物态变化是？",
        options: ["A. 只汽化", "B. 只液化", "C. 先汽化后液化", "D. 先液化后汽化"],
        answer: 2, knowledge: "汽后液", relatedCard: "A25"
      },
      {
        id: "Q_H_090", domain: "热", difficulty: "basic",
        question: "冬天哈气暖、吹气凉，这是因为？",
        options: ["A. 哈气液化放热吹气蒸发吸热", "B. 哈气蒸发吸热吹气液化放热", "C. 都是液化", "D. 都是蒸发"],
        answer: 0, knowledge: "液化放蒸发吸", relatedCard: "A25"
      },
      {
        id: "Q_H_091", domain: "热", difficulty: "basic",
        question: "温度计使用错的是？",
        options: ["A. 泡全浸", "B. 读数留液", "C. 不触底", "D. 体温计测沸水"],
        answer: 3, knowledge: "体温计不测沸", relatedCard: "S19"
      },
      {
        id: "Q_H_092", domain: "热", difficulty: "advanced",
        question: "冬车加防冻液因？",
        options: ["A. 凝固点低", "B. 沸点低", "C. 比热大", "D. 密度大"],
        answer: 0, knowledge: "凝点低", relatedCard: "A26"
      },
      {
        id: "Q_H_093", domain: "热", difficulty: "advanced",
        question: "不做功改内能？",
        options: ["A. 钻木", "B. 搓手", "C. 热水袋", "D. 锯条热"],
        answer: 2, knowledge: "热传", relatedCard: "A21"
      },
      {
        id: "Q_H_094", domain: "热", difficulty: "advanced",
        question: "不是热机？",
        options: ["A. 蒸汽机", "B. 内燃机", "C. 喷气机", "D. 电动机"],
        answer: 3, knowledge: "电机", relatedCard: "S18"
      },
      {
        id: "Q_H_095", domain: "热", difficulty: "advanced",
        question: "物体温升则？",
        options: ["A. 定吸热", "B. 定被做功", "C. 内定增", "D. 热增"],
        answer: 2, knowledge: "内增", relatedCard: "S19"
      },
      {
        id: "Q_H_096", domain: "热", difficulty: "advanced",
        question: "温度计正确的是？",
        options: ["A. 据固胀缩", "B. 体温不离体", "C. 泡全浸", "D. 量程-10~110"],
        answer: 2, knowledge: "正确使用", relatedCard: "S19"
      },
      {
        id: "Q_H_097", domain: "热", difficulty: "advanced",
        question: "正确的是？",
        options: ["A. 固熔定升温", "B. 蒸沸都汽", "C. 蒸吸温定降", "D. 沸不断升温"],
        answer: 1, knowledge: "都汽", relatedCard: "A25"
      },
      {
        id: "Q_H_098", domain: "热", difficulty: "challenge",
        question: "试管水入烧杯沸后试管？",
        options: ["A. 也沸", "B. 不沸", "C. 超100", "D. 蒸干"],
        answer: 1, knowledge: "达沸无吸", relatedCard: "A25"
      },
      {
        id: "Q_H_099", domain: "热", difficulty: "challenge",
        question: "使蒸发变慢？",
        options: ["A. 通风晒", "B. 电吹风", "C. 菜包膜冰箱", "D. 粮晒阳"],
        answer: 2, knowledge: "降温减蒸", relatedCard: "A25"
      },
      {
        id: "Q_H_100", domain: "热", difficulty: "basic",
        question: "北河结冰深处约4°C因？",
        options: ["A. 4°C水密最大", "B. 冰不良", "C. 水比热大", "D. 都对"],
        answer: 3, knowledge: "综合", relatedCard: "S22"
      },
      {
        id: "Q_H_101", domain: "热", difficulty: "basic",
        question: "热传递改内能？",
        options: ["A. 摩擦", "B. 弯铁丝", "C. 炉烤", "D. 钻木"],
        answer: 2, knowledge: "炉烤", relatedCard: "A21"
      },
      {
        id: "Q_H_102", domain: "热", difficulty: "basic",
        question: "说明分子运动？",
        options: ["A. 柳絮", "B. 荷花香", "C. 落叶", "D. 雪花"],
        answer: 1, knowledge: "扩散", relatedCard: "S19"
      },
      {
        id: "Q_H_103", domain: "热", difficulty: "basic",
        question: "内能热量温度正确的是？",
        options: ["A. 温高含热多", "B. 吸热定升温", "C. 0°C无内", "D. 温降内减"],
        answer: 3, knowledge: "温降内减", relatedCard: "S19"
      },
      {
        id: "Q_H_104", domain: "热", difficulty: "basic",
        question: "做功冲程？",
        options: ["A. 机→内", "B. 内→机", "C. 电→机", "D. 化→内"],
        answer: 1, knowledge: "做功", relatedCard: "S18"
      },
      {
        id: "Q_H_105", domain: "热", difficulty: "basic",
        question: "关于热值正确的是？",
        options: ["A. 充燃烧热大", "B. 与燃烧无关", "C. 易燃热大", "D. 煤>柴即煤放多"],
        answer: 1, knowledge: "特性", relatedCard: "S18"
      },
      {
        id: "Q_H_106", domain: "热", difficulty: "basic",
        question: "功内能热量正确的是？",
        options: ["A. 温不变内不变", "B. 热从大内传小内", "C. 做功热传都改", "D. 温高含热多"],
        answer: 2, knowledge: "两种方式", relatedCard: "S19"
      },
      {
        id: "Q_H_107", domain: "热", difficulty: "basic",
        question: "熔化温不变该物？",
        options: ["A. 非晶", "B. 晶体", "C. 已熔", "D. 固比热大"],
        answer: 1, knowledge: "晶", relatedCard: "S20"
      },
      {
        id: "Q_H_108", domain: "热", difficulty: "advanced",
        question: "质量相等、初温相同的甲乙两物体吸收相同热量，甲升温较慢，说明什么？",
        options: ["A. 甲比热容大", "B. 乙比热容大", "C. 一样大", "D. 无法判断"],
        answer: 0, knowledge: "升慢比大", relatedCard: "S22"
      },
      {
        id: "Q_H_109", domain: "热", difficulty: "advanced",
        question: "结论错误的是？",
        options: ["A. 车用水冷效果好", "B. 液体比热容都大于固体", "C. 同种物质不同状态比热容不同", "D. 等质量的冰和水升高相同温度，冰吸收的热量少"],
        answer: 1, knowledge: "反例水银", relatedCard: "S22"
      },
      {
        id: "Q_H_110", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的甲乙两物体吸收相同热量，甲升温较慢，说明甲的比热容比乙？",
        options: ["A. 更大", "B. 更小", "C. 相等", "D. 无法判断"],
        answer: 0, knowledge: "比热大", relatedCard: "S22"
      },
      {
        id: "Q_H_111", domain: "热", difficulty: "basic",
        question: "接近25°C？",
        options: ["A. 冰水", "B. 舒适室温", "C. 体温", "D. 夏最高"],
        answer: 1, knowledge: "舒适", relatedCard: "S19"
      },
      {
        id: "Q_H_112", domain: "热", difficulty: "basic",
        question: "做功改内能？",
        options: ["A. 炉烧水", "B. 巾敷", "C. 打气壁热", "D. 路面热"],
        answer: 2, knowledge: "打气", relatedCard: "A21"
      },
      {
        id: "Q_H_113", domain: "热", difficulty: "basic",
        question: "热机不正确的是？",
        options: ["A. 内→机", "B. 水冷因比大", "C. 增功提效", "D. 污染"],
        answer: 2, knowledge: "功≠效", relatedCard: "S23"
      },
      {
        id: "Q_H_114", domain: "热", difficulty: "basic",
        question: "分子运动有关？",
        options: ["A. 柳絮", "B. 花香", "C. 落叶", "D. 雪花"],
        answer: 1, knowledge: "花香", relatedCard: "S19"
      },
      {
        id: "Q_H_115", domain: "热", difficulty: "basic",
        question: "减慢蒸发？",
        options: ["A. 通风", "B. 保鲜袋", "C. 晒粮", "D. 吹风"],
        answer: 1, knowledge: "保鲜", relatedCard: "A25"
      },
      {
        id: "Q_H_116", domain: "热", difficulty: "basic",
        question: "冬天镜片进入室内起雾后又变清晰，发生的物态变化是？",
        options: ["A. 汽后液", "B. 液后汽", "C. 凝后蒸", "D. 熔后凝"],
        answer: 1, knowledge: "液后汽", relatedCard: "A25"
      },
      {
        id: "Q_H_117", domain: "热", difficulty: "basic",
        question: "液化的是？",
        options: ["A. 冰解", "B. 白气", "C. 秋露", "D. 冻衣干"],
        answer: 1, knowledge: "白气", relatedCard: "A25"
      },
      {
        id: "Q_H_118", domain: "热", difficulty: "basic",
        question: "干冰白雾因？",
        options: ["A. 升吸液", "B. 汽化", "C. 升产白", "D. 熔蒸"],
        answer: 0, knowledge: "升+液", relatedCard: "A47"
      },
      {
        id: "Q_H_119", domain: "热", difficulty: "basic",
        question: "温内热正确的是？",
        options: ["A. 温高含多", "B. 0°C无内", "C. 搓手增内", "D. 内增定吸热"],
        answer: 2, knowledge: "搓手=功", relatedCard: "S19"
      },
      {
        id: "Q_H_120", domain: "热", difficulty: "basic",
        question: "热归纳正确的是？",
        options: ["A. 滑做功增内", "B. 推塞增内", "C. 温差小比小", "D. 壶盖顶分子引"],
        answer: 0, knowledge: "滑=功", relatedCard: "S19"
      },
      {
        id: "Q_H_121", domain: "热", difficulty: "basic",
        question: "温度估测错？",
        options: ["A. 体温37", "B. 舒适23", "C. 洗澡60", "D. 沸水100"],
        answer: 2, knowledge: "~40", relatedCard: "S19"
      },
      {
        id: "Q_H_122", domain: "热", difficulty: "basic",
        question: "0°C冰入0°C房？",
        options: ["A. 熔", "B. 结", "C. 不熔", "D. 部分熔"],
        answer: 2, knowledge: "无温差", relatedCard: "A26"
      },
      {
        id: "Q_H_123", domain: "热", difficulty: "basic",
        question: "放热的是？①消②汽③露④霜",
        options: ["A. ①②", "B. ②③", "C. ③④", "D. ①④"],
        answer: 2, knowledge: "液凝放", relatedCard: "A26"
      },
      {
        id: "Q_H_124", domain: "热", difficulty: "basic",
        question: "比热正确的是？",
        options: ["A. 跟吸放有关", "B. 质大比大", "C. 自身性质", "D. 与态无关"],
        answer: 2, knowledge: "性质", relatedCard: "S22"
      },
      {
        id: "Q_H_125", domain: "热", difficulty: "basic",
        question: "质量相等、初温相同的甲乙两物体吸收相同热量，乙升温较快，则比热容大小关系为？",
        options: ["A. c甲>c乙", "B. c甲<c乙", "C. 相等", "D. 无法判断"],
        answer: 0, knowledge: "甲慢=大", relatedCard: "S22"
      },
      {
        id: "Q_H_126", domain: "热", difficulty: "basic",
        question: "吸热与种类有关？",
        options: ["A. 等积两水同温吸同", "B. 等质铜不同温", "C. 等积水煤吸不同", "D. 等质水铜同温吸不同"],
        answer: 3, knowledge: "控变量", relatedCard: "S22"
      },
      {
        id: "Q_H_127", domain: "热", difficulty: "basic",
        question: "下列现象中属于内能转化为机械能的是？",
        options: ["A. 晒太阳取暖", "B. 爆竹升空", "C. 锯木头变热", "D. 弯铁丝发热"],
        answer: 1, knowledge: "爆竹", relatedCard: "S18"
      },
      {
        id: "Q_H_128", domain: "热", difficulty: "basic",
        question: "贡献对应正确？",
        options: ["A. 牛—惯性", "B. 托—大气压", "C. 奥—电磁感应", "D. 法—电流磁"],
        answer: 1, knowledge: "托里拆利", relatedCard: "A03"
      },
      {
        id: "Q_H_129", domain: "热", difficulty: "advanced",
        question: "热机正确的是？",
        options: ["A. 效可达100%", "B. 两门同关=功压", "C. 飞轮提效", "D. 柴高因热值大"],
        answer: 1, knowledge: "功压", relatedCard: "S18"
      },
      {
        id: "Q_H_130", domain: "热", difficulty: "basic",
        question: "接近25°C？",
        options: ["A. 体温", "B. 舒适", "C. 冰水", "D. 冬低"],
        answer: 1, knowledge: "舒适", relatedCard: "S19"
      },
      {
        id: "Q_H_131", domain: "热", difficulty: "basic",
        question: "分子运动有关？",
        options: ["A. 余音", "B. 尘", "C. 人声", "D. 花香"],
        answer: 3, knowledge: "花香", relatedCard: "S19"
      },
      {
        id: "Q_H_132", domain: "热", difficulty: "basic",
        question: "凝华？",
        options: ["A. 消", "B. 露", "C. 雾", "D. 霜"],
        answer: 3, knowledge: "霜", relatedCard: "A47"
      },
      {
        id: "Q_H_133", domain: "热", difficulty: "basic",
        question: "做功改？",
        options: ["A. 勺入汤", "B. 热袋", "C. 冰食品", "D. 弯铁丝"],
        answer: 3, knowledge: "弯", relatedCard: "A21"
      },
      {
        id: "Q_H_134", domain: "热", difficulty: "basic",
        question: "镜片从室外进入温暖的室内，起雾后又消失，发生的物态变化是？",
        options: ["A. 凝华→升华", "B. 液化→汽化", "C. 凝固→蒸发", "D. 凝华→升华"],
        answer: 1, knowledge: "液汽", relatedCard: "A25"
      },
      {
        id: "Q_H_135", domain: "热", difficulty: "basic",
        question: "下列现象中属于内能转化为机械能的是？",
        options: ["A. 流星", "B. 泡脚", "C. 汽油压缩", "D. 蒸汽顶起壶盖"],
        answer: 3, knowledge: "蒸汽", relatedCard: "S18"
      },
      {
        id: "Q_H_136", domain: "热", difficulty: "basic",
        question: "错的是？",
        options: ["A. 烟味=分子", "B. 固压斥", "C. 打气=功", "D. 0°C冰无内"],
        answer: 3, knowledge: "有内", relatedCard: "S19"
      },
      {
        id: "Q_H_137", domain: "热", difficulty: "advanced",
        question: "甲乙两物体质量比为2:3，吸收相等热量后升温比为3:2，则比热容之比为？",
        options: ["A. 1:1", "B. 9:4", "C. 4:9", "D. 2:3"],
        answer: 0, knowledge: "1:1", relatedCard: "S22"
      },
      {
        id: "Q_H_138", domain: "热", difficulty: "advanced",
        question: "内燃机中内能转化为机械能的冲程是？",
        options: ["A. 吸气", "B. 压缩", "C. 做功", "D. 排气"],
        answer: 2, knowledge: "功", relatedCard: "S18"
      },
      {
        id: "Q_H_139", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的甲乙两物体吸收相同热量，甲升温较快，说明甲的比热容比乙？",
        options: ["A. 更大", "B. 更小", "C. 相等", "D. 无法判断"],
        answer: 1, knowledge: "升快=比小", relatedCard: "S22"
      },
      {
        id: "Q_H_140", domain: "热", difficulty: "basic",
        question: "热现象正确的是？",
        options: ["A. 霜=水凝", "B. 白气=汽", "C. 罐珠=液", "D. 灯黑=液"],
        answer: 2, knowledge: "液", relatedCard: "A25"
      },
      {
        id: "Q_H_141", domain: "热", difficulty: "basic",
        question: "热正确的是？",
        options: ["A. 温高含多", "B. 冰熔内不变", "C. 气压高沸高", "D. 不对"],
        answer: 2, knowledge: "沸点", relatedCard: "A25"
      },
      {
        id: "Q_H_142", domain: "热", difficulty: "basic",
        question: "正确的是？",
        options: ["A. 吸热定升", "B. 冰花外", "C. 升不一定吸", "D. 蒸任意"],
        answer: 3, knowledge: "蒸任意", relatedCard: "A25"
      },
      {
        id: "Q_H_143", domain: "热", difficulty: "basic",
        question: "温内热正确的是？",
        options: ["A. 内增定吸", "B. 功冲机→内", "C. 内减温可不变", "D. 锯增板减"],
        answer: 2, knowledge: "可不变", relatedCard: "S19"
      },
      {
        id: "Q_H_144", domain: "热", difficulty: "basic",
        question: "比热判正确的是？",
        options: ["A. 不同物质比热容必不同", "B. 干泥土升温慢", "C. 沿海地区温差大", "D. 等质量的铝和铜升高相同温度，铝吸收的热量多"],
        answer: 3, knowledge: "铝>铜", relatedCard: "S22"
      },
      {
        id: "Q_H_145", domain: "热", difficulty: "basic",
        question: "汽柴油机正确的是？",
        options: ["A. 均吸空气", "B. 压机→内", "C. 功内→机", "D. 柴效低"],
        answer: 2, knowledge: "功同", relatedCard: "S18"
      },
      {
        id: "Q_H_146", domain: "热", difficulty: "basic",
        question: "热正确的是？",
        options: ["A. -10冰入0内增", "B. 压内→机", "C. 锯温从板吸", "D. 不敢喝含多"],
        answer: 0, knowledge: "冰吸", relatedCard: "S19"
      },
      {
        id: "Q_H_147", domain: "热", difficulty: "advanced",
        question: "质量相等、初温相同的液体a和b吸收相同热量，a升温较快，则比热容关系为？",
        options: ["A. ca>cb", "B. ca<cb", "C. 相等", "D. 无法判断"],
        answer: 1, knowledge: "比小", relatedCard: "S22"
      },
      {
        id: "Q_H_148", domain: "热", difficulty: "challenge",
        question: "温内热正确的是？",
        options: ["A. 0冰变水内不变", "B. 温高含多", "C. 大内→小内", "D. 同温升吸可不同"],
        answer: 3, knowledge: "吸不同", relatedCard: "S19"
      },
      {
        id: "Q_H_149", domain: "热", difficulty: "challenge",
        question: "质量相等的水和煤油吸收相同热量，煤油升温较快，说明煤油的比热容？",
        options: ["A. 比水大", "B. 比水小", "C. 吸热多", "D. 吸热少"],
        answer: 1, knowledge: "比小", relatedCard: "S22"
      },
      {
        id: "Q_H_150", domain: "热", difficulty: "basic",
        question: "一瓶酒精用掉一半后，剩下酒精的热值和比热容如何变化？",
        options: ["A. 热值不变比热容减半", "B. 都不变", "C. 热值减半比热容不变", "D. 热值不变比热容增大"],
        answer: 1, knowledge: "不变", relatedCard: "S22"
      },
      {
        id: "Q_H_151", domain: "热", difficulty: "basic",
        question: "比热读法？",
        options: ["A. 焦每千°C", "B. 焦耳每千克°C", "C. 焦每千克", "D. 焦每°C"],
        answer: 1, knowledge: "读法", relatedCard: "S22"
      },
      {
        id: "Q_H_152", domain: "热", difficulty: "basic",
        question: "热和能正确的是？",
        options: ["A. 铁有铁块无", "B. 压=热传增", "C. 机零内零", "D. 水冷因比大"],
        answer: 3, knowledge: "比大", relatedCard: "S22"
      },
      {
        id: "Q_H_153", domain: "热", difficulty: "advanced",
        question: "质量相等的甲乙两物体，甲降温20°C放出的热量等于乙升温15°C吸收热量的2倍，则比热容之比为？",
        options: ["A. 5:8", "B. 8:5", "C. 3:2", "D. 2:3"],
        answer: 2, knowledge: "3:2", relatedCard: "S22"
      },
      {
        id: "Q_H_154", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的铜和水放出相同热量后，将铜放入水中，热传递方向为？",
        options: ["A. 铜→水", "B. 水→铜", "C. 不传热", "D. 无法判断"],
        answer: 0, knowledge: "铜温低", relatedCard: "S22"
      },
      {
        id: "Q_H_155", domain: "热", difficulty: "basic",
        question: "镜片起雾后又变清晰，先后经历的物态变化是？",
        options: ["A. 液后汽", "B. 汽后液", "C. 只液", "D. 只汽"],
        answer: 0, knowledge: "液汽", relatedCard: "A25"
      },
      {
        id: "Q_H_156", domain: "热", difficulty: "basic",
        question: "判断正确的是？",
        options: ["A. 酒干=升吸", "B. 白气=汽吸", "C. 露=液放", "D. 雪=凝放"],
        answer: 2, knowledge: "露液放", relatedCard: "A25"
      },
      {
        id: "Q_H_157", domain: "热", difficulty: "advanced",
        question: "热传改内？",
        options: ["A. 钻木", "B. 锯热", "C. 卫壳", "D. 冰入水"],
        answer: 3, knowledge: "冰入", relatedCard: "A21"
      },
      {
        id: "Q_H_158", domain: "热", difficulty: "basic",
        question: "正确的是？",
        options: ["A. 沿海温小比小", "B. 放定降", "C. 水银比小吸少", "D. 不对"],
        answer: 2, knowledge: "比小吸少", relatedCard: "S22"
      },
      {
        id: "Q_H_159", domain: "热", difficulty: "basic",
        question: "热现象正确的是？①吸后升②做功热传③0°C无④柴吸空气柴",
        options: ["A. ②", "B. ②④", "C. ①③", "D. ①②③"],
        answer: 0, knowledge: "只②", relatedCard: "S19"
      },
      {
        id: "Q_H_160", domain: "热", difficulty: "basic",
        question: "关于做功、内能、热量，说法正确的是？",
        options: ["A. 温度不变内能不变", "B. 做功和热传递都能改变内能", "C. 温度高含热量多", "D. 内能大的物体传热给内能小的"],
        answer: 1, knowledge: "做功热传", relatedCard: "S19"
      },
      {
        id: "Q_H_161", domain: "热", difficulty: "basic",
        question: "热传改？",
        options: ["A. 摩", "B. 锯", "C. 烧", "D. 钻"],
        answer: 2, knowledge: "烧", relatedCard: "A21"
      },
      {
        id: "Q_H_162", domain: "热", difficulty: "basic",
        question: "做功改？",
        options: ["A. 冰", "B. 火柴", "C. 路晒", "D. 暖气"],
        answer: 1, knowledge: "火柴", relatedCard: "A21"
      },
      {
        id: "Q_H_163", domain: "热", difficulty: "advanced",
        question: "四冲程汽油机转速为1800r/min时，1秒内做功多少次？",
        options: ["A. 15", "B. 30", "C. 60", "D. 120"],
        answer: 0, knowledge: "15", relatedCard: "S18"
      },
      {
        id: "Q_H_164", domain: "热", difficulty: "challenge",
        question: "甲物体比热容是乙的2倍、质量是乙的3倍，放出相同热量后，甲乙降温之比为？",
        options: ["A. 2:3", "B. 3:2", "C. 1:6", "D. 6:1"],
        answer: 2, knowledge: "1:6", relatedCard: "S22"
      },
      {
        id: "Q_H_165", domain: "热", difficulty: "basic",
        question: "温度正确的是？",
        options: ["A. 表冷热", "B. 0冰比水冷", "C. 体温35", "D. 感热定高"],
        answer: 0, knowledge: "定义", relatedCard: "S19"
      },
      {
        id: "Q_H_166", domain: "热", difficulty: "basic",
        question: "夏天扇扇子感觉凉快，主要原因是？",
        options: ["A. 风本身凉", "B. 赶走热空气", "C. 加速汗液蒸发", "D. 降低空气温度"],
        answer: 2, knowledge: "蒸", relatedCard: "A25"
      },
      {
        id: "Q_H_167", domain: "热", difficulty: "basic",
        question: "非汽化？",
        options: ["A. 衣干", "B. 地干", "C. 酒干", "D. 霜"],
        answer: 3, knowledge: "霜", relatedCard: "A25"
      },
      {
        id: "Q_H_168", domain: "热", difficulty: "basic",
        question: "熔化？",
        options: ["A. 冰水", "B. 露", "C. 霜", "D. 雪无"],
        answer: 0, knowledge: "冰水", relatedCard: "A26"
      },
      {
        id: "Q_H_169", domain: "热", difficulty: "basic",
        question: "放热？",
        options: ["A. 熔", "B. 凝", "C. 蒸", "D. 沸"],
        answer: 1, knowledge: "凝", relatedCard: "A26"
      },
      {
        id: "Q_H_170", domain: "热", difficulty: "basic",
        question: "护肤品不冷？",
        options: ["A. 凝放", "B. 蒸吸", "C. 减蒸", "D. 加热"],
        answer: 2, knowledge: "减蒸", relatedCard: "A25"
      },
      {
        id: "Q_H_171", domain: "热", difficulty: "basic",
        question: "正确的是？",
        options: ["A. 晶体都有确定的熔点", "B. 液体沸腾时温度不变", "C. 蒸发只在液体表面发生", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "A25"
      },
      {
        id: "Q_H_172", domain: "热", difficulty: "basic",
        question: "非扩散？",
        options: ["A. 花香", "B. 糖甜", "C. 灰飞", "D. 墨水红"],
        answer: 2, knowledge: "灰非扩", relatedCard: "S19"
      },
      {
        id: "Q_H_173", domain: "热", difficulty: "basic",
        question: "分子正确的是？",
        options: ["A. 物由分", "B. 保化性最小", "C. 百亿分之几米", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "S19"
      },
      {
        id: "Q_H_174", domain: "热", difficulty: "basic",
        question: "分子无规？",
        options: ["A. 柳", "B. 槐香", "C. 叶", "D. 雪"],
        answer: 1, knowledge: "香", relatedCard: "S19"
      },
      {
        id: "Q_H_175", domain: "热", difficulty: "advanced",
        question: "汽柴油正确的是？",
        options: ["A. 火同", "B. 汽压燃", "C. 柴点燃", "D. 功内→机"],
        answer: 3, knowledge: "功同", relatedCard: "S18"
      },
      {
        id: "Q_H_176", domain: "热", difficulty: "advanced",
        question: "能转错？",
        options: ["A. 石势→动", "B. 酒化→内", "C. 发电电→机", "D. 太阳能转"],
        answer: 2, knowledge: "发机→电", relatedCard: "S18"
      },
      {
        id: "Q_H_177", domain: "热", difficulty: "challenge",
        question: "温内热正确的是？",
        options: ["A. 温高内大", "B. 高含多", "C. 内小也可传内大", "D. 内增定吸"],
        answer: 2, knowledge: "看温", relatedCard: "S19"
      },
      {
        id: "Q_H_178", domain: "热", difficulty: "challenge",
        question: "非利用水比热大？",
        options: ["A. 洒水", "B. 冷却", "C. 湖调温", "D. 供暖"],
        answer: 0, knowledge: "洒=蒸", relatedCard: "S22"
      },
      {
        id: "Q_H_179", domain: "热", difficulty: "basic",
        question: "质量相等的水和煤油吸收相同热量，煤油升温较快，说明煤油比热容比水？",
        options: ["A. 更大", "B. 更小", "C. 相等", "D. 无法判断"],
        answer: 1, knowledge: "<", relatedCard: "S22"
      },
      {
        id: "Q_H_180", domain: "热", difficulty: "basic",
        question: "加热水时，水的质量增大导致升温变慢，此时温度-时间图像会变得？",
        options: ["A. 不变", "B. 更陡峭", "C. 更平缓", "D. 位置更低"],
        answer: 2, knowledge: "慢", relatedCard: "S22"
      },
      {
        id: "Q_H_181", domain: "热", difficulty: "basic",
        question: "不可再生？",
        options: ["A. 风", "B. 油", "C. 潮", "D. 阳"],
        answer: 1, knowledge: "油", relatedCard: "S18"
      },
      {
        id: "Q_H_182", domain: "热", difficulty: "basic",
        question: "内燃机35%效？",
        options: ["A. 25%", "B. 35%", "C. 40%", "D. 75%"],
        answer: 1, knowledge: "35%", relatedCard: "S23"
      },
      {
        id: "Q_H_183", domain: "热", difficulty: "basic",
        question: "气门关闭、活塞上行时，发生的能量转化是？",
        options: ["A. 化学能→内能", "B. 机械能→内能", "C. 内能→机械能", "D. 机械能→化学能"],
        answer: 1, knowledge: "压", relatedCard: "S23"
      },
      {
        id: "Q_H_184", domain: "热", difficulty: "basic",
        question: "功增内？",
        options: ["A. 弯丝", "B. 灯热", "C. 钢炉", "D. 山火"],
        answer: 0, knowledge: "弯", relatedCard: "A21"
      },
      {
        id: "Q_H_185", domain: "热", difficulty: "basic",
        question: "功改内？",
        options: ["A. 晒", "B. 冷藏", "C. 锯热", "D. 铁入水"],
        answer: 2, knowledge: "锯", relatedCard: "A21"
      },
      {
        id: "Q_H_186", domain: "热", difficulty: "basic",
        question: "热传改？",
        options: ["A. 锯热", "B. 搓", "C. 锤", "D. 烧水"],
        answer: 3, knowledge: "烧", relatedCard: "A21"
      },
      {
        id: "Q_H_187", domain: "热", difficulty: "advanced",
        question: "关于汽油机和柴油机，说法错误的是？",
        options: ["A. 汽油机火花塞柴油机喷油嘴", "B. 汽油机吸汽油气柴油机吸空气", "C. 做功冲程都是内能→机械能", "D. 汽油机效率>柴油机"],
        answer: 3, knowledge: "柴高", relatedCard: "S18"
      },
      {
        id: "Q_H_188", domain: "热", difficulty: "advanced",
        question: "热值效正确的是？",
        options: ["A. 充增热", "B. 充提效", "C. 高热提效", "D. 放多效高"],
        answer: 1, knowledge: "充提效", relatedCard: "S23"
      },
      {
        id: "Q_H_189", domain: "热", difficulty: "challenge",
        question: "比热判错？",
        options: ["A. 体温水银比小", "B. 暖水比大", "C. 内陆差因水比沙大", "D. 0水冷却>0冰"],
        answer: 3, knowledge: "冰熔", relatedCard: "S22"
      },
      {
        id: "Q_H_190", domain: "热", difficulty: "basic",
        question: "说明分子运动？",
        options: ["A. 落", "B. 腌菜咸", "C. 灰", "D. 烟"],
        answer: 1, knowledge: "腌=扩散", relatedCard: "S19"
      },
      {
        id: "Q_H_191", domain: "热", difficulty: "basic",
        question: "热正确的是？",
        options: ["A. 白=升", "B. 高山不熟因高沸", "C. 冰衣干=蒸", "D. 凝熔0°C"],
        answer: 3, knowledge: "0°C", relatedCard: "A26"
      },
      {
        id: "Q_H_192", domain: "热", difficulty: "basic",
        question: "热正确的是？",
        options: ["A. 功机→内", "B. 高含多", "C. 搓=功改", "D. 白=汽"],
        answer: 2, knowledge: "搓", relatedCard: "S19"
      },
      {
        id: "Q_H_193", domain: "热", difficulty: "basic",
        question: "温内热正确的是？",
        options: ["A. 吸热温度一定升高", "B. 热从高温物体传向低温物体", "C. 等质量的水和煤油吸收相同热量，煤油升温更快", "D. 内能增加一定吸热"],
        answer: 2, knowledge: "煤升快", relatedCard: "S22"
      },
      {
        id: "Q_H_194", domain: "热", difficulty: "advanced",
        question: "关于煮粽子的现象，说法正确的是？",
        options: ["A. 白气=水蒸气", "B. 粽子沾水利用汽化吸热降温", "C. 冻霜=凝固", "D. 水珠渗出"],
        answer: 1, knowledge: "汽吸", relatedCard: "A25"
      },
      {
        id: "Q_H_195", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的甲乙两物体先后放入同一杯冷水中，最终哪杯水升温更多？",
        options: ["A. 放甲那杯", "B. 放乙那杯", "C. 一样多", "D. 无法判断"],
        answer: 1, knowledge: "乙再升", relatedCard: "S22"
      },
      {
        id: "Q_H_196", domain: "热", difficulty: "advanced",
        question: "热正确的是？",
        options: ["A. 难压只因斥", "B. 热大放多", "C. 扩说明动", "D. 沸吸升"],
        answer: 2, knowledge: "扩散", relatedCard: "S19"
      },
      {
        id: "Q_H_197", domain: "热", difficulty: "challenge",
        question: "质量相等、初温相同的甲乙两物体吸收相同热量，乙升温较慢，说明乙的比热容比甲？",
        options: ["A. 更小", "B. 更大", "C. 相等", "D. 无法判断"],
        answer: 1, knowledge: "乙大", relatedCard: "S22"
      },
      {
        id: "Q_H_198", domain: "热", difficulty: "basic",
        question: "不正确的是？",
        options: ["A. 分有引斥", "B. 都运动", "C. 高剧", "D. 固无间"],
        answer: 3, knowledge: "有隙", relatedCard: "S19"
      },
      {
        id: "Q_H_199", domain: "热", difficulty: "basic",
        question: "干冰降温用？",
        options: ["A. 熔吸", "B. 液放", "C. 升吸", "D. 凝放"],
        answer: 2, knowledge: "升吸", relatedCard: "A47"
      },
      {
        id: "Q_H_200", domain: "热", difficulty: "basic",
        question: "4°C水密度最大意义？",
        options: ["A. 湖底4°C不结", "B. 鱼死", "C. 无关", "D. 湖全冻"],
        answer: 0, knowledge: "生态保护", relatedCard: "S22"
      },
      // ==================================================
      // 电 领域
      // ==================================================
      {
        id: "Q_E_001", domain: "电", difficulty: "basic",
        question: "电流的国际单位？",
        options: ["A. 伏特", "B. 安培", "C. 欧姆", "D. 瓦特"],
        answer: 1, knowledge: "安培", relatedCard: "C07"
      },
      {
        id: "Q_E_002", domain: "电", difficulty: "basic",
        question: "电压的国际单位？",
        options: ["A. 安培", "B. 伏特", "C. 欧姆", "D. 焦耳"],
        answer: 1, knowledge: "伏特", relatedCard: "S30"
      },
      {
        id: "Q_E_003", domain: "电", difficulty: "basic",
        question: "电阻的国际单位？",
        options: ["A. 安培", "B. 伏特", "C. 欧姆", "D. 瓦特"],
        answer: 2, knowledge: "欧姆", relatedCard: "C07"
      },
      {
        id: "Q_E_004", domain: "电", difficulty: "basic",
        question: "欧姆定律公式？",
        options: ["A. P=UI", "B. W=Fs", "C. I=U/R", "D. Q=I²Rt"],
        answer: 2, knowledge: "I=U/R", relatedCard: "C07"
      },
      {
        id: "Q_E_005", domain: "电", difficulty: "basic",
        question: "我国家庭电路电压？",
        options: ["A. 36V", "B. 110V", "C. 220V", "D. 380V"],
        answer: 2, knowledge: "220V", relatedCard: "S27"
      },
      {
        id: "Q_E_006", domain: "电", difficulty: "basic",
        question: "一节干电池电压？",
        options: ["A. 1.5V", "B. 2V", "C. 3V", "D. 6V"],
        answer: 0, knowledge: "1.5V", relatedCard: "S30"
      },
      {
        id: "Q_E_007", domain: "电", difficulty: "basic",
        question: "安全电压不高于？",
        options: ["A. 1.5V", "B. 36V", "C. 110V", "D. 220V"],
        answer: 1, knowledge: "36V", relatedCard: "S27"
      },
      {
        id: "Q_E_008", domain: "电", difficulty: "basic",
        question: "属于导体的是？",
        options: ["A. 橡胶", "B. 塑料", "C. 铜丝", "D. 玻璃"],
        answer: 2, knowledge: "导体", relatedCard: "A27"
      },
      {
        id: "Q_E_009", domain: "电", difficulty: "basic",
        question: "属于绝缘体的是？",
        options: ["A. 铜", "B. 铁", "C. 铝", "D. 橡胶"],
        answer: 3, knowledge: "绝缘体", relatedCard: "A27"
      },
      {
        id: "Q_E_010", domain: "电", difficulty: "basic",
        question: "形成电流条件？",
        options: ["A. 有电源且闭合", "B. 只有电源", "C. 只闭合", "D. 有导线"],
        answer: 0, knowledge: "电源+闭合", relatedCard: "C07"
      },
      {
        id: "Q_E_011", domain: "电", difficulty: "basic",
        question: "电流表连接？",
        options: ["A. 与测并", "B. 与测串", "C. 单接", "D. 任意"],
        answer: 1, knowledge: "串", relatedCard: "C07"
      },
      {
        id: "Q_E_012", domain: "电", difficulty: "basic",
        question: "电压表连接？",
        options: ["A. 与测串", "B. 与测并", "C. 单接", "D. 任意"],
        answer: 1, knowledge: "并", relatedCard: "S30"
      },
      {
        id: "Q_E_013", domain: "电", difficulty: "basic",
        question: "串联电流关系？",
        options: ["A. I₁>I₂", "B. I₁<I₂", "C. I₁=I₂", "D. 无法"],
        answer: 2, knowledge: "相等", relatedCard: "C07"
      },
      {
        id: "Q_E_014", domain: "电", difficulty: "basic",
        question: "并联电压关系？",
        options: ["A. U₁>U₂", "B. U₁<U₂", "C. U₁=U₂", "D. 随电阻"],
        answer: 2, knowledge: "相等", relatedCard: "S31"
      },
      {
        id: "Q_E_015", domain: "电", difficulty: "basic",
        question: "电阻因素不包括？",
        options: ["A. 材料", "B. 长度", "C. 截面积", "D. 两压"],
        answer: 3, knowledge: "与压无关", relatedCard: "S23"
      },
      {
        id: "Q_E_016", domain: "电", difficulty: "basic",
        question: "短路时电路？",
        options: ["A. 电流零", "B. 电流很大", "C. 电压零", "D. 电阻增"],
        answer: 1, knowledge: "电流大", relatedCard: "S27"
      },
      {
        id: "Q_E_017", domain: "电", difficulty: "basic",
        question: "安全用电做法？",
        options: ["A. 湿手碰", "B. 高压筝", "C. 断电救人", "D. 铜替险"],
        answer: 2, knowledge: "安全", relatedCard: "S27"
      },
      {
        id: "Q_E_018", domain: "电", difficulty: "basic",
        question: "测电笔检测？",
        options: ["A. 电流", "B. 电压", "C. 火零线", "D. 电阻"],
        answer: 2, knowledge: "火零", relatedCard: "S30"
      },
      {
        id: "Q_E_019", domain: "电", difficulty: "basic",
        question: "电功率单位？",
        options: ["A. 焦耳", "B. 瓦特", "C. 安培", "D. 伏特"],
        answer: 1, knowledge: "瓦特", relatedCard: "A49"
      },
      {
        id: "Q_E_020", domain: "电", difficulty: "basic",
        question: "利用电磁感应？",
        options: ["A. 风扇", "B. 发电机", "C. 热水器", "D. 电磁起重"],
        answer: 1, knowledge: "发电机", relatedCard: "S28"
      },
      {
        id: "Q_E_021", domain: "电", difficulty: "basic",
        question: "电动机原理？",
        options: ["A. 电磁感应", "B. 通电受力", "C. 热效应", "D. 静电"],
        answer: 1, knowledge: "通电受力", relatedCard: "D05"
      },
      {
        id: "Q_E_022", domain: "电", difficulty: "basic",
        question: "奥斯特实验？",
        options: ["A. 磁生电", "B. 电生磁", "C. 热效应", "D. 电磁感应"],
        answer: 1, knowledge: "电生磁", relatedCard: "D05"
      },
      {
        id: "Q_E_023", domain: "电", difficulty: "basic",
        question: "法拉第发现？",
        options: ["A. 热效应", "B. 电磁感应", "C. 欧姆", "D. 库仑"],
        answer: 1, knowledge: "电磁感应", relatedCard: "S24"
      },
      {
        id: "Q_E_024", domain: "电", difficulty: "basic",
        question: "电磁铁磁性与？",
        options: ["A. 只电流", "B. 电流匝数", "C. 只匝数", "D. 都无关"],
        answer: 1, knowledge: "电流匝数", relatedCard: "S24"
      },
      {
        id: "Q_E_025", domain: "电", difficulty: "basic",
        question: "磁体周围存在？",
        options: ["A. 电场", "B. 磁场", "C. 引力场", "D. 电磁波"],
        answer: 1, knowledge: "磁场", relatedCard: "D05"
      },
      {
        id: "Q_E_026", domain: "电", difficulty: "basic",
        question: "螺线管磁场似？",
        options: ["A. 蹄形", "B. 条形", "C. 圆形", "D. 环形"],
        answer: 1, knowledge: "条形", relatedCard: "D05"
      },
      {
        id: "Q_E_027", domain: "电", difficulty: "basic",
        question: "外磁感线？",
        options: ["A. S→N", "B. N→S", "C. 相交", "D. 任意"],
        answer: 1, knowledge: "N→S", relatedCard: "D05"
      },
      {
        id: "Q_E_028", domain: "电", difficulty: "basic",
        question: "家庭开关应接？",
        options: ["A. 零线", "B. 地线", "C. 火用之间", "D. 任意"],
        answer: 2, knowledge: "火用之间", relatedCard: "S27"
      },
      {
        id: "Q_E_029", domain: "电", difficulty: "basic",
        question: "220V 40W表示？",
        options: ["A. 额定压功率", "B. 实际", "C. 最大", "D. 最小"],
        answer: 0, knowledge: "额定", relatedCard: "A49"
      },
      {
        id: "Q_E_030", domain: "电", difficulty: "basic",
        question: "焦耳定律热与？",
        options: ["A. I成正比", "B. I²成正比", "C. U", "D. R"],
        answer: 1, knowledge: "I²", relatedCard: "C08"
      },
      {
        id: "Q_E_031", domain: "电", difficulty: "advanced",
        question: "电阻丝对折后？",
        options: ["A. 增", "B. 减", "C. 不变", "D. 无法"],
        answer: 1, knowledge: "减", relatedCard: "S27"
      },
      {
        id: "Q_E_032", domain: "电", difficulty: "advanced",
        question: "安全电压正确的是？",
        options: ["A. <36绝安全", "B. 潮湿更低", "C. <220安全", "D. 与人阻无关"],
        answer: 1, knowledge: "环境", relatedCard: "S27"
      },
      {
        id: "Q_E_033", domain: "电", difficulty: "advanced",
        question: "不能增强电磁铁？",
        options: ["A. 加匝", "B. 加流", "C. 加芯", "D. 减压"],
        answer: 3, knowledge: "减流", relatedCard: "S24"
      },
      {
        id: "Q_E_034", domain: "电", difficulty: "advanced",
        question: "串联总电阻？",
        options: ["A. R₁+R₂", "B. (R₁R₂)/(R₁+R₂)", "C. <R₁", "D. <R₂"],
        answer: 0, knowledge: "相加", relatedCard: "C07"
      },
      {
        id: "Q_E_035", domain: "电", difficulty: "advanced",
        question: "电磁感应是？",
        options: ["A. 通导磁偏", "B. 闭导切磁生电", "C. 灯丝发光", "D. 磁吸铁"],
        answer: 1, knowledge: "磁生电", relatedCard: "S28"
      },
      {
        id: "Q_E_036", domain: "电", difficulty: "advanced",
        question: "磁场电流错？",
        options: ["A. 奥=电生磁", "B. 螺似条", "C. 流不改变磁向", "D. 通导受磁力"],
        answer: 2, knowledge: "流改变", relatedCard: "D05"
      },
      {
        id: "Q_E_037", domain: "电", difficulty: "advanced",
        question: "都是绝缘体？",
        options: ["A. 人地铜", "B. 橡塑玻", "C. 盐石墨铝", "D. 铁铜铝"],
        answer: 1, knowledge: "绝缘", relatedCard: "A27"
      },
      {
        id: "Q_E_038", domain: "电", difficulty: "challenge",
        question: "6Ω和3Ω并总阻？",
        options: ["A. 9", "B. 4.5", "C. 2", "D. 1"],
        answer: 2, knowledge: "2Ω", relatedCard: "S31"
      },
      {
        id: "Q_E_039", domain: "电", difficulty: "challenge",
        question: "家庭电路正确的是？",
        options: ["A. 串联", "B. 铜替险", "C. 开关火用间", "D. 双孔火"],
        answer: 2, knowledge: "开关位", relatedCard: "S27"
      },
      {
        id: "Q_E_040", domain: "电", difficulty: "challenge",
        question: "关于电阻正确的是？",
        options: ["A. 与压正比", "B. 与流反比", "C. 导体属性", "D. 由压流定"],
        answer: 2, knowledge: "属性", relatedCard: "C07"
      },
      {
        id: "Q_E_041", domain: "电", difficulty: "basic",
        question: "电荷作用？",
        options: ["A. 同吸异斥", "B. 同斥异吸", "C. 无", "D. 只引力"],
        answer: 1, knowledge: "同斥异吸", relatedCard: "A27"
      },
      {
        id: "Q_E_042", domain: "电", difficulty: "basic",
        question: "丝绸磨玻璃棒带？",
        options: ["A. 正", "B. 负", "C. 不带", "D. 不定"],
        answer: 0, knowledge: "正", relatedCard: "A27"
      },
      {
        id: "Q_E_043", domain: "电", difficulty: "basic",
        question: "毛皮磨橡胶棒带？",
        options: ["A. 正", "B. 负", "C. 不带", "D. 不定"],
        answer: 1, knowledge: "负", relatedCard: "A27"
      },
      {
        id: "Q_E_044", domain: "电", difficulty: "basic",
        question: "提供电能的是？",
        options: ["A. 用器", "B. 导线", "C. 开关", "D. 电源"],
        answer: 3, knowledge: "电源", relatedCard: "C07"
      },
      {
        id: "Q_E_045", domain: "电", difficulty: "basic",
        question: "电路组成？",
        options: ["A. 源+器", "B. 源器线关", "C. 源+线", "D. 器+关"],
        answer: 1, knowledge: "四要素", relatedCard: "C07"
      },
      {
        id: "Q_E_046", domain: "电", difficulty: "basic",
        question: "电流方向？",
        options: ["A. 正荷移动", "B. 负荷移动", "C. 电子移", "D. 任意"],
        answer: 0, knowledge: "正荷", relatedCard: "C07"
      },
      {
        id: "Q_E_047", domain: "电", difficulty: "basic",
        question: "串联特点？",
        options: ["A. 互不影响", "B. 一坏全停", "C. 独立", "D. 按功率"],
        answer: 1, knowledge: "一坏全停", relatedCard: "C07"
      },
      {
        id: "Q_E_048", domain: "电", difficulty: "basic",
        question: "并联特点？",
        options: ["A. 互不影响", "B. 一坏全停", "C. 须同工", "D. 按压"],
        answer: 0, knowledge: "互不", relatedCard: "S31"
      },
      {
        id: "Q_E_049", domain: "电", difficulty: "basic",
        question: "变阻器原理？",
        options: ["A. 材料", "B. 长度", "C. 截面", "D. 温度"],
        answer: 1, knowledge: "长度", relatedCard: "S27"
      },
      {
        id: "Q_E_050", domain: "电", difficulty: "basic",
        question: "地磁北极在地理？",
        options: ["A. 北极", "B. 南极", "C. 赤道", "D. 中纬"],
        answer: 1, knowledge: "地理南极", relatedCard: "D05"
      },
      {
        id: "Q_E_051", domain: "电", difficulty: "basic",
        question: "电磁继电器？",
        options: ["A. 高压控低压", "B. 低压控高压", "C. 不能", "D. 无关"],
        answer: 1, knowledge: "低压控高压", relatedCard: "S24"
      },
      {
        id: "Q_E_052", domain: "电", difficulty: "basic",
        question: "防触电措施？",
        options: ["A. 外壳接地", "B. 三孔", "C. 湿手", "D. A+B"],
        answer: 3, knowledge: "接地+三孔", relatedCard: "S27"
      },
      {
        id: "Q_E_053", domain: "电", difficulty: "basic",
        question: "白炽灯原理？",
        options: ["A. 热效应", "B. 电磁感应", "C. 磁场力", "D. 静电"],
        answer: 0, knowledge: "热效应", relatedCard: "C08"
      },
      {
        id: "Q_E_054", domain: "电", difficulty: "basic",
        question: "1kW·h=?J",
        options: ["A. 1000", "B. 3600", "C. 3.6×10⁶", "D. 3.6×10³"],
        answer: 2, knowledge: "换算", relatedCard: "A49"
      },
      {
        id: "Q_E_055", domain: "电", difficulty: "basic",
        question: "电能表测量？",
        options: ["A. 电流", "B. 电压", "C. 电功", "D. 电阻"],
        answer: 2, knowledge: "电功", relatedCard: "A49"
      },
      {
        id: "Q_E_056", domain: "电", difficulty: "basic",
        question: "保险丝作用？",
        options: ["A. 增流", "B. 过流熔", "C. 降压", "D. 增阻"],
        answer: 1, knowledge: "保护", relatedCard: "S27"
      },
      {
        id: "Q_E_057", domain: "电", difficulty: "basic",
        question: "话筒原理？",
        options: ["A. 电磁感应", "B. 热效应", "C. 磁场力", "D. 静电"],
        answer: 0, knowledge: "电磁感应", relatedCard: "S28"
      },
      {
        id: "Q_E_058", domain: "电", difficulty: "basic",
        question: "关于电源？",
        options: ["A. 电转他", "B. 他转电", "C. 储能", "D. 即电池"],
        answer: 1, knowledge: "他→电", relatedCard: "C07"
      },
      {
        id: "Q_E_059", domain: "电", difficulty: "basic",
        question: "属于电源？",
        options: ["A. 电动机", "B. 发电机", "C. 电灯", "D. 电饭锅"],
        answer: 1, knowledge: "发电机", relatedCard: "S28"
      },
      {
        id: "Q_E_060", domain: "电", difficulty: "basic",
        question: "属于用电器？",
        options: ["A. 干电池", "B. 发电机", "C. 电风扇", "D. 蓄电池"],
        answer: 2, knowledge: "电风扇", relatedCard: "C07"
      },
      {
        id: "Q_E_061", domain: "电", difficulty: "basic",
        question: "导体导电因？",
        options: ["A. 原子", "B. 分子", "C. 大量自由电", "D. 中子"],
        answer: 2, knowledge: "自由电", relatedCard: "A27"
      },
      {
        id: "Q_E_062", domain: "电", difficulty: "basic",
        question: "绝缘体不导电因？",
        options: ["A. 无电荷", "B. 无自由电", "C. 太少", "D. 自由电少"],
        answer: 3, knowledge: "极少", relatedCard: "A27"
      },
      {
        id: "Q_E_063", domain: "电", difficulty: "advanced",
        question: "研究I-U关系用？",
        options: ["A. 转换", "B. 控制变量", "C. 等效", "D. 类比"],
        answer: 1, knowledge: "控变量", relatedCard: "C07"
      },
      {
        id: "Q_E_064", domain: "电", difficulty: "advanced",
        question: "线均拉长后电阻？",
        options: ["A. 减", "B. 不变", "C. 增", "D. 无法"],
        answer: 2, knowledge: "增", relatedCard: "S27"
      },
      {
        id: "Q_E_065", domain: "电", difficulty: "advanced",
        question: "非热效应？",
        options: ["A. 饭锅", "B. 烙铁", "C. 风扇", "D. 烤炉"],
        answer: 2, knowledge: "风扇", relatedCard: "C08"
      },
      {
        id: "Q_E_066", domain: "电", difficulty: "advanced",
        question: "磁效应？",
        options: ["A. 饭锅", "B. 电磁起重", "C. 灯", "D. 风扇"],
        answer: 1, knowledge: "电磁铁", relatedCard: "S24"
      },
      {
        id: "Q_E_067", domain: "电", difficulty: "advanced",
        question: "安全做法？",
        options: ["A. 铜替险", "B. 高筝", "C. 干棍挑线", "D. 湿擦"],
        answer: 2, knowledge: "安全", relatedCard: "S27"
      },
      {
        id: "Q_E_068", domain: "电", difficulty: "advanced",
        question: "电炉热导线不热因？",
        options: ["A. 流大", "B. 阻大", "C. 压低", "D. 材特殊"],
        answer: 1, knowledge: "阻大", relatedCard: "C08"
      },
      {
        id: "Q_E_069", domain: "电", difficulty: "challenge",
        question: "220V 100W接110V？",
        options: ["A. 100", "B. 50", "C. 25", "D. 10"],
        answer: 2, knowledge: "25W", relatedCard: "A49"
      },
      {
        id: "Q_E_070", domain: "电", difficulty: "challenge",
        question: "关于电磁正确的是？",
        options: ["A. 磁向针定", "B. 变流向变磁", "C. 发电用磁力", "D. 闭导运定生电"],
        answer: 1, knowledge: "变向变磁", relatedCard: "D05"
      },
      {
        id: "Q_E_071", domain: "电", difficulty: "basic",
        question: "两灯并联？",
        options: ["A. 流等", "B. 压等", "C. 阻等", "D. 功等"],
        answer: 1, knowledge: "压等", relatedCard: "S31"
      },
      {
        id: "Q_E_072", domain: "电", difficulty: "basic",
        question: "两灯串联？",
        options: ["A. 压等", "B. 流等", "C. 阻等", "D. 功等"],
        answer: 1, knowledge: "流等", relatedCard: "C07"
      },
      {
        id: "Q_E_073", domain: "电", difficulty: "basic",
        question: "指南针指北因？",
        options: ["A. 重力", "B. 地磁场", "C. 浮力", "D. 大气压"],
        answer: 1, knowledge: "地磁场", relatedCard: "D05"
      },
      {
        id: "Q_E_074", domain: "电", difficulty: "basic",
        question: "感应电流条件？",
        options: ["A. 闭导体运动", "B. 闭导切磁线", "C. 导切磁线", "D. 任意"],
        answer: 1, knowledge: "切割", relatedCard: "S28"
      },
      {
        id: "Q_E_075", domain: "电", difficulty: "basic",
        question: "发电机原理？",
        options: ["A. 热效应", "B. 电磁感应", "C. 磁力", "D. 静电"],
        answer: 1, knowledge: "电磁感应", relatedCard: "S28"
      },
      {
        id: "Q_E_076", domain: "电", difficulty: "basic",
        question: "利用电磁感应？",
        options: ["A. 饭锅", "B. 铃", "C. 发电机", "D. 电动机"],
        answer: 2, knowledge: "发电机", relatedCard: "S28"
      },
      {
        id: "Q_E_077", domain: "电", difficulty: "basic",
        question: "利用磁力？",
        options: ["A. 灯", "B. 铃", "C. 发电", "D. 电动机"],
        answer: 3, knowledge: "电动机", relatedCard: "D05"
      },
      {
        id: "Q_E_078", domain: "电", difficulty: "basic",
        question: "电铃利用？",
        options: ["A. 发电", "B. 电动", "C. 电磁铁", "D. 灯"],
        answer: 2, knowledge: "电磁铁", relatedCard: "S24"
      },
      {
        id: "Q_E_079", domain: "电", difficulty: "basic",
        question: "防触电？",
        options: ["A. 两孔", "B. 湿擦", "C. 外壳接地", "D. 高筝"],
        answer: 2, knowledge: "接地", relatedCard: "S27"
      },
      {
        id: "Q_E_080", domain: "电", difficulty: "basic",
        question: "能转不同？",
        options: ["A. 风扇", "B. 烙铁", "C. 灯", "D. 饭锅"],
        answer: 0, knowledge: "风扇=机", relatedCard: "A49"
      },
      {
        id: "Q_E_081", domain: "电", difficulty: "advanced",
        question: "家庭安全正确的是？",
        options: ["A. <220安全", "B. 只触体触", "C. 笔测正负", "D. 并"],
        answer: 3, knowledge: "并联", relatedCard: "S27"
      },
      {
        id: "Q_E_082", domain: "电", difficulty: "advanced",
        question: "测电笔使用？",
        options: ["A. 亮=零", "B. 不触金", "C. 不辨正负", "D. 触位绝缘"],
        answer: 2, knowledge: "辨火零", relatedCard: "S30"
      },
      {
        id: "Q_E_083", domain: "电", difficulty: "challenge",
        question: "6Ω∥12Ω 6V,I₁?",
        options: ["A. 0.5", "B. 1", "C. 2", "D. 0.33"],
        answer: 1, knowledge: "1A", relatedCard: "S31"
      },
      {
        id: "Q_E_084", domain: "电", difficulty: "challenge",
        question: "滑动变阻器滑片向左移动，电压表和电流表示数如何变化？",
        options: ["A. V↑A↓", "B. V↓A↑", "C. V↑A↑", "D. V↓A↓"],
        answer: 1, knowledge: "电阻减", relatedCard: "C07"
      },
      {
        id: "Q_E_085", domain: "电", difficulty: "basic",
        question: "摩擦棒近球排斥则？",
        options: ["A. 正", "B. 负", "C. 可能不带", "D. 定不带"],
        answer: 1, knowledge: "负", relatedCard: "A27"
      },
      {
        id: "Q_E_086", domain: "电", difficulty: "basic",
        question: "关于电流？",
        options: ["A. 有压有流", "B. 从正到负", "C. 有流有压", "D. 电子形"],
        answer: 2, knowledge: "有流必然有压", relatedCard: "C07"
      },
      {
        id: "Q_E_087", domain: "电", difficulty: "basic",
        question: "磁场说法？",
        options: ["A. 磁极间磁", "B. 线真实", "C. 地北在地北", "D. 对所有导力"],
        answer: 0, knowledge: "磁极间", relatedCard: "D05"
      },
      {
        id: "Q_E_088", domain: "电", difficulty: "basic",
        question: "磁体？",
        options: ["A. 必两极", "B. 断一极", "C. 可只N", "D. 可只S"],
        answer: 0, knowledge: "必两极", relatedCard: "D05"
      },
      {
        id: "Q_E_089", domain: "电", difficulty: "basic",
        question: "能被磁吸？",
        options: ["A. 铜", "B. 铝", "C. 铁", "D. 塑料"],
        answer: 2, knowledge: "铁", relatedCard: "D05"
      },
      {
        id: "Q_E_090", domain: "电", difficulty: "basic",
        question: "磁极作用？",
        options: ["A. 同吸异斥", "B. 同斥异吸", "C. 只吸", "D. 只斥"],
        answer: 1, knowledge: "同斥异吸", relatedCard: "D05"
      },
      {
        id: "Q_E_091", domain: "电", difficulty: "basic",
        question: "电生磁发现者？",
        options: ["A. 牛", "B. 奥", "C. 法", "D. 欧"],
        answer: 1, knowledge: "奥斯特", relatedCard: "D05"
      },
      {
        id: "Q_E_092", domain: "电", difficulty: "advanced",
        question: "发电机？",
        options: ["A. 磁力", "B. 电→机", "C. 电磁感应", "D. 不外力"],
        answer: 2, knowledge: "电磁感应", relatedCard: "S28"
      },
      {
        id: "Q_E_093", domain: "电", difficulty: "advanced",
        question: "电动机？",
        options: ["A. 电磁感应", "B. 电→机", "C. 不电", "D. 不变向"],
        answer: 1, knowledge: "电→机", relatedCard: "D05"
      },
      {
        id: "Q_E_094", domain: "电", difficulty: "basic",
        question: "不能改电阻？",
        options: ["A. 长", "B. 截", "C. 材", "D. 接法"],
        answer: 3, knowledge: "接法", relatedCard: "S23"
      },
      {
        id: "Q_E_095", domain: "电", difficulty: "basic",
        question: "导体？",
        options: ["A. 塑尺", "B. 橡皮", "C. 钢尺", "D. 玻棒"],
        answer: 2, knowledge: "钢", relatedCard: "A27"
      },
      {
        id: "Q_E_096", domain: "电", difficulty: "basic",
        question: "关于电压？",
        options: ["A. 有压有流", "B. 形成电流原因", "C. 单位欧", "D. 即电源"],
        answer: 1, knowledge: "原", relatedCard: "S30"
      },
      {
        id: "Q_E_097", domain: "电", difficulty: "challenge",
        question: "保险不熔因？",
        options: ["A. 总功大", "B. 短", "C. 额小", "D. 正常"],
        answer: 3, knowledge: "正常", relatedCard: "S27"
      },
      {
        id: "Q_E_098", domain: "电", difficulty: "basic",
        question: "导体电阻？",
        options: ["A. 铜<铁", "B. 等长粗大", "C. 等粗长大", "D. 由压流定"],
        answer: 2, knowledge: "等粗长大", relatedCard: "S23"
      },
      {
        id: "Q_E_099", domain: "电", difficulty: "basic",
        question: "两个开关都闭合时灯才亮，两个开关的连接方式是？",
        options: ["A. 串联", "B. 并联", "C. 只需一个", "D. 无法判断"],
        answer: 0, knowledge: "串", relatedCard: "C07"
      },
      {
        id: "Q_E_100", domain: "电", difficulty: "basic",
        question: "电磁感应？",
        options: ["A. 风扇", "B. 衣", "C. 发", "D. 铃"],
        answer: 2, knowledge: "发", relatedCard: "S28"
      },
      {
        id: "Q_E_101", domain: "电", difficulty: "basic",
        question: "安全用电符合？",
        options: ["A. 湿拔", "B. 接地", "C. 晾衣线", "D. 手拉"],
        answer: 1, knowledge: "接地", relatedCard: "S27"
      },
      {
        id: "Q_E_102", domain: "电", difficulty: "basic",
        question: "安全带指示灯？",
        options: ["A. 关并灯", "B. 关串灯", "C. 任意", "D. 无法"],
        answer: 0, knowledge: "并=短灯", relatedCard: "S27"
      },
      {
        id: "Q_E_103", domain: "电", difficulty: "basic",
        question: "通电灯丝在磁场中晃动，是因为？",
        options: ["A. 电磁感应", "B. 磁场对电流有力的作用", "C. 热效应", "D. 吸引"],
        answer: 1, knowledge: "磁力", relatedCard: "D05"
      },
      {
        id: "Q_E_104", domain: "电", difficulty: "challenge",
        question: "LED灯带特点？",
        options: ["A. 单220", "B. 一断灭", "C. 主内", "D. 单向"],
        answer: 3, knowledge: "单向", relatedCard: "A27"
      },
      {
        id: "Q_E_105", domain: "电", difficulty: "basic",
        question: "电饭锅功率？",
        options: ["A. 0.01A", "B. 12V", "C. ~800W", "D. 0.8kW·h"],
        answer: 2, knowledge: "~800W", relatedCard: "A49"
      },
      {
        id: "Q_E_106", domain: "电", difficulty: "basic",
        question: "钢棒有磁性判？",
        options: ["A. ①②", "B. ③④", "C. ①③", "D. ②④"],
        answer: 3, knowledge: "斥为有", relatedCard: "D05"
      },
      {
        id: "Q_E_107", domain: "电", difficulty: "basic",
        question: "奥斯特实说明？",
        options: ["A. 能否带电", "B. 电动机", "C. 通导磁场", "D. 磁效应"],
        answer: 2, knowledge: "磁场", relatedCard: "D05"
      },
      {
        id: "Q_E_108", domain: "电", difficulty: "advanced",
        question: "电流表原理同？",
        options: ["A. 烙铁", "B. 铃", "C. 发", "D. 电动"],
        answer: 3, knowledge: "电动", relatedCard: "D05"
      },
      {
        id: "Q_E_109", domain: "电", difficulty: "challenge",
        question: "探究热与阻关？",
        options: ["A. 二不同串", "B. 并", "C. 同串", "D. 同并"],
        answer: 0, knowledge: "串控流", relatedCard: "C08"
      },
      {
        id: "Q_E_110", domain: "电", difficulty: "basic",
        question: "2.5μm=?m",
        options: ["A. 10⁻³", "B. 10⁻⁴", "C. 10⁻⁵", "D. 10⁻⁶"],
        answer: 3, knowledge: "10⁻⁶", relatedCard: "A01"
      },
      {
        id: "Q_E_111", domain: "电", difficulty: "basic",
        question: "安全正确？",
        options: ["A. 铜替", "B. 接地", "C. 触尖", "D. 高压钓"],
        answer: 1, knowledge: "接地", relatedCard: "S27"
      },
      {
        id: "Q_E_112", domain: "电", difficulty: "basic",
        question: "水果电池说明？",
        options: ["A. B正", "B. 内→电", "C. 化→电", "D. 电→化"],
        answer: 2, knowledge: "化→电", relatedCard: "C07"
      },
      {
        id: "Q_E_113", domain: "电", difficulty: "challenge",
        question: "ΔU1与ΔU2？",
        options: ["A. >", "B. =", "C. <", "D. 无法"],
        answer: 1, knowledge: "相等", relatedCard: "C07"
      },
      {
        id: "Q_E_114", domain: "力", difficulty: "basic",
        question: "费力杠杆？",
        options: ["A. 筷子", "B. 起", "C. 钳", "D. 扳"],
        answer: 0, knowledge: "筷子", relatedCard: "A04"
      },
      {
        id: "Q_E_115", domain: "电", difficulty: "basic",
        question: "家安正确的是？",
        options: ["A. 关火零", "B. 三孔", "C. 笔不触", "D. 同触不触"],
        answer: 1, knowledge: "三孔", relatedCard: "S27"
      },
      {
        id: "Q_E_116", domain: "电", difficulty: "challenge",
        question: "串联灯L短路？",
        options: ["A. L断", "B. R短", "C. L短", "D. 都断"],
        answer: 2, knowledge: "L短", relatedCard: "C07"
      },
      {
        id: "Q_E_117", domain: "电", difficulty: "challenge",
        question: "6V 6W和3W串？",
        options: ["A. 2:1", "B. 1:2", "C. 12V正常", "D. 9V L2正常"],
        answer: 1, knowledge: "P比1:2", relatedCard: "A49"
      },
      {
        id: "Q_E_118", domain: "电", difficulty: "basic",
        question: "选电能表型？",
        options: ["A. 5A", "B. 15A", "C. 20A", "D. 30A"],
        answer: 2, knowledge: "~20A", relatedCard: "A49"
      },
      {
        id: "Q_E_119", domain: "电", difficulty: "basic",
        question: "磁感线？",
        options: ["A. 同斥外", "B. N→S", "C. 直线", "D. 相交"],
        answer: 1, knowledge: "N→S", relatedCard: "D05"
      },
      {
        id: "Q_E_120", domain: "电", difficulty: "basic",
        question: "滑动变阻器滑片向左移动，两表示数如何变化？",
        options: ["A. A↑V↓", "B. A↑V↑", "C. A↓V↑", "D. A↓V↓"],
        answer: 2, knowledge: "R增", relatedCard: "C07"
      },
      {
        id: "Q_E_121", domain: "电", difficulty: "advanced",
        question: "安用正确？",
        options: ["A. 长脚接地", "B. 不触尾", "C. 关并器", "D. 跳定短"],
        answer: 0, knowledge: "接地", relatedCard: "S27"
      },
      {
        id: "Q_E_122", domain: "电", difficulty: "basic",
        question: "滑a移？",
        options: ["A. 亮A↑", "B. 暗A↓", "C. 亮A↓", "D. 暗A↑"],
        answer: 0, knowledge: "R减", relatedCard: "C07"
      },
      {
        id: "Q_E_123", domain: "电", difficulty: "basic",
        question: "安全？",
        options: ["A. 湿", "B. 三", "C. 筝", "D. 多器共座"],
        answer: 1, knowledge: "三脚", relatedCard: "S27"
      },
      {
        id: "Q_E_124", domain: "电", difficulty: "challenge",
        question: "光减弱？",
        options: ["A. 均减", "B. 均增", "C. A减V增", "D. A增V减"],
        answer: 0, knowledge: "R增=均减", relatedCard: "C07"
      },
      {
        id: "Q_E_125", domain: "电", difficulty: "basic",
        question: "绝缘体？",
        options: ["A. 人", "B. 塑杯", "C. 盐水", "D. 铝"],
        answer: 1, knowledge: "塑", relatedCard: "A27"
      },
      {
        id: "Q_E_126", domain: "电", difficulty: "basic",
        question: "灭蚊电路？",
        options: ["A. S1总S2灯", "B. 反", "C. 串", "D. 并"],
        answer: 0, knowledge: "S1总", relatedCard: "C07"
      },
      {
        id: "Q_E_127", domain: "电", difficulty: "basic",
        question: "手机利用？",
        options: ["A. 不真", "B. 声", "C. 电磁", "D. 无害"],
        answer: 2, knowledge: "电磁", relatedCard: "A14"
      },
      {
        id: "Q_E_128", domain: "电", difficulty: "basic",
        question: "能量守恒定律？",
        options: ["A. 守恒", "B. 牛一", "C. 欧", "D. 阿"],
        answer: 0, knowledge: "守恒", relatedCard: "T01"
      },
      {
        id: "Q_E_129", domain: "电", difficulty: "basic",
        question: "可再生能源？",
        options: ["A. 煤", "B. 油", "C. 风", "D. 气"],
        answer: 2, knowledge: "风", relatedCard: "A41"
      },
      {
        id: "Q_E_130", domain: "电", difficulty: "basic",
        question: "不可再生？",
        options: ["A. 阳", "B. 风", "C. 水", "D. 核"],
        answer: 3, knowledge: "核", relatedCard: "S18"
      },
      {
        id: "Q_E_131", domain: "电", difficulty: "basic",
        question: "关于安全用电提示，说法错误的是？",
        options: ["A. 不在树下避雨", "B. 不用湿手摸电器", "C. 只有高压才危险", "D. 电器需接地"],
        answer: 2, knowledge: "都险", relatedCard: "S27"
      },
      {
        id: "Q_E_132", domain: "电", difficulty: "advanced",
        question: "能转错？",
        options: ["A. 功改内", "B. 热传=不同形转", "C. 各种互转", "D. 有损总量不变"],
        answer: 1, knowledge: "是转移", relatedCard: "S19"
      },
      {
        id: "Q_E_133", domain: "电", difficulty: "basic",
        question: "能源正确的是？",
        options: ["A. 太阳温室", "B. 守恒无危", "C. 核可再生", "D. 化石不可"],
        answer: 3, knowledge: "不可再生", relatedCard: "S18"
      },
      {
        id: "Q_E_134", domain: "电", difficulty: "advanced",
        question: "滑变右V/A不变？",
        options: ["A. V↓", "B. A↑", "C. 亮", "D. V/A不变"],
        answer: 3, knowledge: "定值阻比不变", relatedCard: "C07"
      },
      {
        id: "Q_E_135", domain: "电", difficulty: "basic",
        question: "电流磁效？",
        options: ["A. 炉", "B. 电磁", "C. 电动", "D. 发电"],
        answer: 1, knowledge: "电磁", relatedCard: "S24"
      },
      {
        id: "Q_E_136", domain: "电", difficulty: "basic",
        question: "听筒原理？",
        options: ["A. 感应", "B. 热", "C. 磁力", "D. 静电"],
        answer: 2, knowledge: "磁力", relatedCard: "D05"
      },
      {
        id: "Q_E_137", domain: "电", difficulty: "basic",
        question: "话筒原理？",
        options: ["A. 感应", "B. 热", "C. 磁力", "D. 静电"],
        answer: 0, knowledge: "感应", relatedCard: "S28"
      },
      {
        id: "Q_E_138", domain: "电", difficulty: "challenge",
        question: "定阻功率变？6→10V流变0.1A",
        options: ["A. 1.6W", "B. 4.0", "C. 0.4", "D. 3.4"],
        answer: 0, knowledge: "ΔP=1.6", relatedCard: "A49"
      },
      {
        id: "Q_E_139", domain: "电", difficulty: "basic",
        question: "验电器原理？",
        options: ["A. 异吸", "B. 同斥", "C. 电磁", "D. 静电"],
        answer: 1, knowledge: "同斥", relatedCard: "A27"
      },
      {
        id: "Q_E_140", domain: "电", difficulty: "basic",
        question: "可磁化的是？",
        options: ["A. 铜", "B. 铝", "C. 铁", "D. 塑"],
        answer: 2, knowledge: "铁", relatedCard: "D05"
      },
      {
        id: "Q_E_141", domain: "电", difficulty: "basic",
        question: "U磁灯晃因？",
        options: ["A. 感应", "B. 磁力", "C. 热", "D. 吸"],
        answer: 1, knowledge: "磁力", relatedCard: "D05"
      },
      {
        id: "Q_E_142", domain: "电", difficulty: "advanced",
        question: "探究I-U用？",
        options: ["A. 探", "B. 控变", "C. 纳", "D. 推"],
        answer: 1, knowledge: "控", relatedCard: "C07"
      },
      {
        id: "Q_E_143", domain: "电", difficulty: "challenge",
        question: "并中L2断？",
        options: ["A. L1短", "B. L2短", "C. L1断", "D. L2断"],
        answer: 3, knowledge: "L2断", relatedCard: "S31"
      },
      {
        id: "Q_E_144", domain: "电", difficulty: "basic",
        question: "发电机能量转？",
        options: ["A. 电→机", "B. 机→电", "C. 内→电", "D. 化→电"],
        answer: 1, knowledge: "机→电", relatedCard: "S28"
      },
      {
        id: "Q_E_145", domain: "电", difficulty: "basic",
        question: "电动机能量转？",
        options: ["A. 电→机", "B. 机→电", "C. 内→机", "D. 化→机"],
        answer: 0, knowledge: "电→机", relatedCard: "D05"
      },
      {
        id: "Q_E_146", domain: "电", difficulty: "advanced",
        question: "两灯串联后一灯较暗，原因是该灯？",
        options: ["A. 实际功率小所以暗", "B. 电阻大所以暗", "C. 电流小", "D. 电压大"],
        answer: 0, knowledge: "功小暗", relatedCard: "C07"
      },
      {
        id: "Q_E_147", domain: "电", difficulty: "advanced",
        question: "额定电压220V的两灯串联接入220V电路，亮度关系是？",
        options: ["A. 额定功率大的亮", "B. 额定功率小的亮", "C. 一样亮", "D. 都不亮"],
        answer: 1, knowledge: "阻大亮=小功", relatedCard: "A49"
      },
      {
        id: "Q_E_148", domain: "电", difficulty: "challenge",
        question: "灯不亮V=电源A≈0？",
        options: ["A. 短", "B. 断", "C. 变短", "D. 变断"],
        answer: 1, knowledge: "灯断", relatedCard: "C07"
      },
      {
        id: "Q_E_149", domain: "电", difficulty: "basic",
        question: "热效？",
        options: ["A. 铃", "B. 毯", "C. 视", "D. 扇"],
        answer: 1, knowledge: "毯", relatedCard: "C08"
      },
      {
        id: "Q_E_150", domain: "电", difficulty: "basic",
        question: "全转内？",
        options: ["A. 脑", "B. 扇", "C. 衣", "D. 炉"],
        answer: 3, knowledge: "炉", relatedCard: "C08"
      },
      {
        id: "Q_E_151", domain: "电", difficulty: "basic",
        question: "磁磁线？",
        options: ["A. 有磁", "B. 有线", "C. 线=场", "D. S→N"],
        answer: 0, knowledge: "磁场存在", relatedCard: "D05"
      },
      {
        id: "Q_E_152", domain: "电", difficulty: "advanced",
        question: "滑动变阻器滑片向右移动，两表示数如何变化？",
        options: ["A. A↓V↑", "B. A↑V↓", "C. A↓V↓", "D. A↓V不变"],
        answer: 3, knowledge: "A↓V不变", relatedCard: "C07"
      },
      {
        id: "Q_E_153", domain: "电", difficulty: "advanced",
        question: "开关闭？",
        options: ["A. 不", "B. 小", "C. 大", "D. 无法"],
        answer: 2, knowledge: "大", relatedCard: "S31"
      },
      {
        id: "Q_E_154", domain: "电", difficulty: "basic",
        question: "磁场方向？",
        options: ["A. N指", "B. S指", "C. 任", "D. 反"],
        answer: 0, knowledge: "N极", relatedCard: "D05"
      },
      {
        id: "Q_E_155", domain: "电", difficulty: "basic",
        question: "关于安全用电，说法错误的是？",
        options: ["A. 不接触低压带电体不靠近高压", "B. 更换前断开电源", "C. 不用湿手操作破损电器", "D. 电器到寿命不换也行"],
        answer: 3, knowledge: "及换", relatedCard: "S27"
      },
      {
        id: "Q_E_156", domain: "电", difficulty: "challenge",
        question: "灯3W∥8Ω4V总？",
        options: ["A. 3", "B. 3.3", "C. 3.6", "D. 5"],
        answer: 2, knowledge: "~3.6", relatedCard: "A49"
      },
      {
        id: "Q_E_157", domain: "电", difficulty: "challenge",
        question: "6Ω12Ω12V串灯？",
        options: ["A. 24-0.67", "B. 20-0.8", "C. 24-0.96", "D. 20-0.67"],
        answer: 1, knowledge: "~0.8", relatedCard: "A49"
      },
      {
        id: "Q_E_158", domain: "电", difficulty: "challenge",
        question: "R1=20 I1=0.3 I2=0.2,Q?",
        options: ["A. 12J", "B. 18", "C. 30", "D. 36"],
        answer: 1, knowledge: "18", relatedCard: "C08"
      },
      {
        id: "Q_E_159", domain: "电", difficulty: "basic",
        question: "保险熔因？",
        options: ["A. 过载", "B. 短", "C. 额小", "D. 都可能"],
        answer: 3, knowledge: "都可能", relatedCard: "S27"
      },
      {
        id: "Q_E_160", domain: "电", difficulty: "basic",
        question: "开关接？",
        options: ["A. 零", "B. 火", "C. 地", "D. 任"],
        answer: 1, knowledge: "火", relatedCard: "S27"
      },
      {
        id: "Q_E_161", domain: "电", difficulty: "basic",
        question: "漏保作用？",
        options: ["A. 短", "B. 过载", "C. 漏电断", "D. 降压"],
        answer: 2, knowledge: "漏断", relatedCard: "S27"
      },
      {
        id: "Q_E_162", domain: "电", difficulty: "basic",
        question: "空开作用？",
        options: ["A. 漏", "B. 短/过载", "C. 降", "D. 升"],
        answer: 1, knowledge: "短路", relatedCard: "S27"
      },
      {
        id: "Q_E_163", domain: "电", difficulty: "basic",
        question: "三孔接法？",
        options: ["A. 左零右火上地", "B. 反", "C. 上零", "D. 任意"],
        answer: 0, knowledge: "标准", relatedCard: "S27"
      },
      {
        id: "Q_E_164", domain: "电", difficulty: "basic",
        question: "电功率公式？",
        options: ["A. P=UI", "B. P=I²R", "C. P=U²/R", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "A49"
      },
      {
        id: "Q_E_165", domain: "电", difficulty: "basic",
        question: "电能公式？",
        options: ["A. W=UIt", "B. W=Pt", "C. W=I²Rt", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "A49"
      },
      {
        id: "Q_E_166", domain: "电", difficulty: "basic",
        question: "一度电功？",
        options: ["A. 1J", "B. 1000", "C. 3.6×10⁶", "D. 3600W"],
        answer: 2, knowledge: "换算", relatedCard: "A49"
      },
      {
        id: "Q_E_167", domain: "电", difficulty: "basic",
        question: "额定与实际？",
        options: ["A. 永额定", "B. 实≤额", "C. 随压变", "D. 永实际"],
        answer: 2, knowledge: "随压", relatedCard: "A49"
      },
      {
        id: "Q_E_168", domain: "电", difficulty: "basic",
        question: "超导体？",
        options: ["A. 大阻", "B. 零阻", "C. 差导", "D. 常温"],
        answer: 1, knowledge: "零", relatedCard: "S23"
      },
      {
        id: "Q_E_169", domain: "电", difficulty: "basic",
        question: "半导体？",
        options: ["A. 介于导体绝缘间", "B. 不导", "C. 超导", "D. 绝缘"],
        answer: 0, knowledge: "介于", relatedCard: "S23"
      },
      {
        id: "Q_E_170", domain: "电", difficulty: "basic",
        question: "二极管？",
        options: ["A. 任意导", "B. 单向", "C. 不导", "D. 超"],
        answer: 1, knowledge: "单向", relatedCard: "A27"
      },
      {
        id: "Q_E_171", domain: "电", difficulty: "advanced",
        question: "串联分压？",
        options: ["A. U1:U2=R1:R2", "B. R2:R1", "C. =", "D. 无"],
        answer: 0, knowledge: "正比", relatedCard: "C07"
      },
      {
        id: "Q_E_172", domain: "电", difficulty: "advanced",
        question: "并联分流？",
        options: ["A. I1:I2=R1:R2", "B. R2:R1", "C. =", "D. 无"],
        answer: 1, knowledge: "反比", relatedCard: "S31"
      },
      {
        id: "Q_E_173", domain: "电", difficulty: "challenge",
        question: "伏安法测阻？",
        options: ["A. P=UI", "B. I=U/R", "C. R=U/I", "D. Q=I²Rt"],
        answer: 2, knowledge: "R=U/I", relatedCard: "C07"
      },
      {
        id: "Q_E_174", domain: "电", difficulty: "challenge",
        question: "额定电压相同的两灯并联，亮度关系是？",
        options: ["A. 电阻大的亮", "B. 电阻小的亮", "C. 一样亮", "D. 无法判断"],
        answer: 1, knowledge: "P=U²/R", relatedCard: "A49"
      },
      {
        id: "Q_E_175", domain: "电", difficulty: "basic",
        question: "最节能灯？",
        options: ["A. 白炽", "B. 荧光", "C. LED", "D. 卤素"],
        answer: 2, knowledge: "LED", relatedCard: "A49"
      },
      {
        id: "Q_E_176", domain: "电", difficulty: "basic",
        question: "220V 10(20)A？",
        options: ["A. 额定10A最大20A", "B. 反", "C. 220W", "D. 20V"],
        answer: 0, knowledge: "参数", relatedCard: "A49"
      },
      {
        id: "Q_E_177", domain: "电", difficulty: "basic",
        question: "超导体应用？",
        options: ["A. 磁悬浮", "B. 电热", "C. 灯丝", "D. 保险"],
        answer: 0, knowledge: "磁悬浮", relatedCard: "S23"
      },
      {
        id: "Q_E_178", domain: "电", difficulty: "basic",
        question: "LED优点？",
        options: ["A. 耗电大", "B. 寿命短", "C. 节能寿命长", "D. 价格高"],
        answer: 2, knowledge: "节能", relatedCard: "A49"
      },
      {
        id: "Q_E_179", domain: "电", difficulty: "advanced",
        question: "测阻实验滑动变阻器作用？",
        options: ["A. 保护电路", "B. 改变电压多次", "C. A和B", "D. 无用"],
        answer: 2, knowledge: "保护和变", relatedCard: "C07"
      },
      {
        id: "Q_E_180", domain: "电", difficulty: "advanced",
        question: "为什么灯丝断时重新搭上更亮？",
        options: ["A. 电阻变大使功率变大", "B. 电阻变小功率变大", "C. 电流变小", "D. 电压变大"],
        answer: 1, knowledge: "R小P大", relatedCard: "A49"
      },
      {
        id: "Q_E_181", domain: "电", difficulty: "challenge",
        question: "测小灯泡额定功率步骤？",
        options: ["A. 先调压到额定再测流", "B. 先调流", "C. 任意", "D. 不用调"],
        answer: 0, knowledge: "调到额定压", relatedCard: "A49"
      },
      {
        id: "Q_E_182", domain: "电", difficulty: "challenge",
        question: "影响电阻因素实验方法？",
        options: ["A. 控制变量", "B. 转换", "C. 等效", "D. 类比"],
        answer: 0, knowledge: "控变", relatedCard: "S23"
      },
      {
        id: "Q_E_183", domain: "电", difficulty: "basic",
        question: "常见的半导体材料？",
        options: ["A. 铜铝", "B. 硅锗", "C. 铁镍", "D. 金银"],
        answer: 1, knowledge: "硅锗", relatedCard: "S23"
      },
      {
        id: "Q_E_184", domain: "电", difficulty: "basic",
        question: "光敏电阻特点？",
        options: ["A. 光强阻大", "B. 光强阻小", "C. 无关", "D. 定值"],
        answer: 1, knowledge: "光强阻小", relatedCard: "S23"
      },
      {
        id: "Q_E_185", domain: "电", difficulty: "basic",
        question: "热敏电阻特点？",
        options: ["A. 温高阻大", "B. 温高阻小(PTC反)", "C. 无关", "D. 多数温高阻小"],
        answer: 3, knowledge: "多数温高阻小", relatedCard: "S23"
      },
      {
        id: "Q_E_186", domain: "电", difficulty: "advanced",
        question: "什么是短路？",
        options: ["A. 电流不经过用电器直接接通", "B. 断路", "C. 断路的一种", "D. 灯不亮都叫短路"],
        answer: 0, knowledge: "不经用电", relatedCard: "S27"
      },
      {
        id: "Q_E_187", domain: "电", difficulty: "advanced",
        question: "家庭电路并联的好处？",
        options: ["A. 各用电器互不影响", "B. 省电", "C. 电压低", "D. 省线"],
        answer: 0, knowledge: "互不影响", relatedCard: "S27"
      },
      {
        id: "Q_E_188", domain: "电", difficulty: "challenge",
        question: "为什么不能用铜丝代替保险丝？",
        options: ["A. 铜丝太粗", "B. 铜丝熔点高不易熔", "C. 铜丝电阻大", "D. 铜丝太贵"],
        answer: 1, knowledge: "熔点高", relatedCard: "S27"
      },
      {
        id: "Q_E_189", domain: "电", difficulty: "challenge",
        question: "电磁感应中影响电流大小的因素？",
        options: ["A. 磁体磁性", "B. 导体运动速度", "C. 线圈匝数", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "S28"
      },
      {
        id: "Q_E_190", domain: "电", difficulty: "basic",
        question: "电动机的转向取决于？",
        options: ["A. 电流方向", "B. 磁场方向", "C. A和B", "D. 都不对"],
        answer: 2, knowledge: "电流磁场", relatedCard: "D05"
      },
      {
        id: "Q_E_191", domain: "电", difficulty: "basic",
        question: "电动机转速取决于？",
        options: ["A. 电流大小", "B. 磁场强弱", "C. A和B", "D. 都不对"],
        answer: 2, knowledge: "流和磁", relatedCard: "D05"
      },
      {
        id: "Q_E_192", domain: "电", difficulty: "advanced",
        question: "发电机电压取决于？",
        options: ["A. 转速", "B. 磁场强度", "C. 线圈匝数", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "S28"
      },
      {
        id: "Q_E_193", domain: "电", difficulty: "challenge",
        question: "变压器原理？",
        options: ["A. 电磁感应", "B. 热效应", "C. 磁力", "D. 静电"],
        answer: 0, knowledge: "感应", relatedCard: "S28"
      },
      {
        id: "Q_E_194", domain: "电", difficulty: "basic",
        question: "安全用电原则？",
        options: ["A. 不接低压", "B. 不靠高压", "C. 不用湿手", "D. 都对"],
        answer: 3, knowledge: "都对", relatedCard: "S27"
      },
      {
        id: "Q_E_195", domain: "电", difficulty: "advanced",
        question: "发现有人触电首先？",
        options: ["A. 手拉", "B. 喊人", "C. 断电", "D. 浇水"],
        answer: 2, knowledge: "断电", relatedCard: "S27"
      },
      {
        id: "Q_E_196", domain: "电", difficulty: "challenge",
        question: "家庭电路进户线有？",
        options: ["A. 火线零线", "B. 火零地", "C. 火地", "D. 零地"],
        answer: 1, knowledge: "火零地", relatedCard: "S27"
      },
      {
        id: "Q_E_197", domain: "电", difficulty: "challenge",
        question: "为什么大功率用电器要用粗导线？",
        options: ["A. 阻大", "B. 阻小防过热", "C. 美", "D. 便宜"],
        answer: 1, knowledge: "阻小", relatedCard: "C08"
      },
      {
        id: "Q_E_198", domain: "电", difficulty: "basic",
        question: "电流的三种效应？",
        options: ["A. 热磁化", "B. 热、化学、磁", "C. 热光声", "D. 力电磁"],
        answer: 1, knowledge: "热化磁", relatedCard: "C08"
      },
      {
        id: "Q_E_199", domain: "电", difficulty: "basic",
        question: "化学效应应用？",
        options: ["A. 电镀", "B. 电饭锅", "C. 电扇", "D. 电灯"],
        answer: 0, knowledge: "电镀", relatedCard: "C08"
      },
      {
        id: "Q_E_200", domain: "电", difficulty: "basic",
        question: "电流的单位换算？",
        options: ["A. 1A=1000mA", "B. 1mA=1000μA", "C. A和B都对", "D. 都不对"],
        answer: 2, knowledge: "都对", relatedCard: "C07"
      },
      // ==================================================
      // 混沌 领域
      // ==================================================
      {
        id: "Q_C_001", domain: "混沌", difficulty: "basic",
        question: "芝诺悖论阿基里斯追不上乌龟的矛盾在于？",
        options: ["A. 跑得慢", "B. 无限分割等同于无限时间", "C. 瞬移", "D. 放弃"],
        answer: 1, knowledge: "悖论", relatedCard: "C01"
      },
      {
        id: "Q_C_002", domain: "混沌", difficulty: "basic",
        question: "薛定谔的猫打开前？",
        options: ["A. 活", "B. 死", "C. 活且死", "D. 逃了"],
        answer: 2, knowledge: "叠加态", relatedCard: "C04"
      },
      {
        id: "Q_C_003", domain: "混沌", difficulty: "basic",
        question: "能量守恒定律？",
        options: ["A. 凭空产生", "B. 凭空消失", "C. 转化或转移", "D. 减"],
        answer: 2, knowledge: "守恒", relatedCard: "T01"
      },
      {
        id: "Q_C_004", domain: "混沌", difficulty: "basic",
        question: "麦克斯韦妖通过什么违反热二律？",
        options: ["A. 创造能量", "B. 区分快慢分子减熵", "C. 降温", "D. 增压"],
        answer: 1, knowledge: "麦克斯韦妖", relatedCard: "C02"
      },
      {
        id: "Q_C_005", domain: "混沌", difficulty: "basic",
        question: "相变是物质在什么间转变？",
        options: ["A. 不同状态", "B. 不同颜色", "C. 不同质量", "D. 不同速度"],
        answer: 0, knowledge: "相变", relatedCard: "T02"
      },
      {
        id: "Q_C_006", domain: "混沌", difficulty: "advanced",
        question: "拉普拉斯妖核心思想？",
        options: ["A. 创宇宙", "B. 预测未来一切", "C. 改定律", "D. 时间倒流"],
        answer: 1, knowledge: "决定论", relatedCard: "C03"
      },
      {
        id: "Q_C_007", domain: "混沌", difficulty: "advanced",
        question: "孤立系统熵总是？",
        options: ["A. 减小", "B. 不变", "C. 增加或不变", "D. 先减后增"],
        answer: 2, knowledge: "熵增", relatedCard: "T03"
      },
      {
        id: "Q_C_008", domain: "混沌", difficulty: "advanced",
        question: "芝诺悖论为何不成立？",
        options: ["A. 跑得快", "B. 无穷级数和有限", "C. 乌龟累", "D. 超能"],
        answer: 1, knowledge: "级数", relatedCard: "C01"
      },
      {
        id: "Q_C_009", domain: "混沌", difficulty: "advanced",
        question: "临界点是什么？",
        options: ["A. 气液不分", "B. 绝对零度", "C. 最高温", "D. 最大压"],
        answer: 0, knowledge: "临界", relatedCard: "T02"
      },
      {
        id: "Q_C_010", domain: "混沌", difficulty: "advanced",
        question: "观测对量子态？",
        options: ["A. 无影响", "B. 坍缩为确定态", "C. 更不确定", "D. 创量子"],
        answer: 1, knowledge: "坍缩", relatedCard: "C04"
      },
      {
        id: "Q_C_011", domain: "混沌", difficulty: "advanced",
        question: "麦克斯韦妖被什么破解？",
        options: ["A. 牛力", "B. 信息论", "C. 相对论", "D. 光学"],
        answer: 1, knowledge: "信息熵", relatedCard: "C02"
      },
      {
        id: "Q_C_012", domain: "混沌", difficulty: "challenge",
        question: "量子叠加与经典区别？",
        options: ["A. 同时多态测后定", "B. 总确定", "C. 经典无叠", "D. 相同"],
        answer: 0, knowledge: "多态", relatedCard: "C04"
      },
      {
        id: "Q_C_013", domain: "混沌", difficulty: "challenge",
        question: "熵逆转可能吗？",
        options: ["A. 可", "B. 不可违热二", "C. 微观可", "D. 不可违牛"],
        answer: 1, knowledge: "不可", relatedCard: "T03"
      },
      {
        id: "Q_C_014", domain: "混沌", difficulty: "challenge",
        question: "决定论与量子关系？",
        options: ["A. 概率支持", "B. 不确定挑战", "C. 无关", "D. 相对论证明"],
        answer: 1, knowledge: "挑战", relatedCard: "C03"
      },
      {
        id: "Q_C_015", domain: "混沌", difficulty: "basic",
        question: "冰直接变水蒸气？",
        options: ["A. 熔化", "B. 凝固", "C. 升华", "D. 凝华"],
        answer: 2, knowledge: "升华", relatedCard: "A47"
      },
    ];
  }

  generateRound(mainDomain, subDomain, lastPlayedCard) {
    let mainPool = this._getPool(mainDomain);
    let subPool = (subDomain && subDomain !== mainDomain) ? this._getPool(subDomain) : [];
    let relatedPool = lastPlayedCard ? this._getRelatedPool(lastPlayedCard) : [];
    const groupByDiff = (pool) => { const map = { basic: [], advanced: [], challenge: [] }; pool.forEach(q => map[q.difficulty].push(q)); return map; };
    const selected = [];
    if (relatedPool.length > 0) { const q = this._pickRandom(relatedPool); selected.push(q); mainPool = mainPool.filter(item => item.id !== q.id); subPool = subPool.filter(item => item.id !== q.id); }
    let safety = 0;
    while (selected.length < 3 && safety < 100) { safety++; const useSub = subPool.length > 0 && Math.random() < 0.25; let pool = useSub ? subPool : mainPool; if (pool.length === 0) { pool = useSub ? mainPool : subPool; } if (pool.length === 0) break; let pick = this._pickRandom(pool); if (pick && !selected.find(q => q.id === pick.id)) { selected.push(pick); } mainPool = mainPool.filter(q => q.id !== pick.id); subPool = subPool.filter(q => q.id !== pick.id); }
    if (selected.length < 3) { const allAvail = this.questions.filter(q => !selected.find(s => s.id === q.id)); const shuffled = [...allAvail]; this._shuffle(shuffled); for (const q of shuffled) { if (selected.length >= 3) break; if (!selected.find(s => s.id === q.id)) selected.push(q); } }
    this.currentRoundData = selected; selected.forEach(q => this.usedQuestionIds.add(q.id));
    return selected.map(q => ({ id: q.id, question: q.question, options: q.options, answer: q.answer, difficulty: q.difficulty, relatedCard: q.relatedCard }));
  }

  checkAnswer(questionId, answerIndex) { const question = this.currentRoundData.find(q => q.id === questionId); if (!question) return { correct: false, knowledge: "" }; return { correct: question.answer === Number(answerIndex), knowledge: question.knowledge }; }
  getQuizBonus(correctCount) { if (correctCount >= 3) return 0.12; if (correctCount === 2) return 0.08; if (correctCount === 1) return 0.05; return 0.0; }
  getQuestionById(id) { return this.questions.find(q => q.id === id) || null; }
  getQuestions(domain, count) { let pool = this.questions.filter(q => q.domain === domain); this._shuffle(pool); return pool.slice(0, count); }
  _getPool(domain) { let pool = this.questions.filter(q => q.domain === domain && !this.usedQuestionIds.has(q.id)); if (pool.length < 3) { for (const q of this.questions) { if (q.domain === domain) this.usedQuestionIds.delete(q.id); } pool = this.questions.filter(q => q.domain === domain); } return pool; }
  _getRelatedPool(cardId) { return this.questions.filter(q => q.relatedCard === cardId && !this.usedQuestionIds.has(q.id)); }
  _pickRandom(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; }
  _shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } }
}

export { QuizSystem };
