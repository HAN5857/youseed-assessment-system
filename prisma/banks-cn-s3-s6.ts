// Mandarin assessment banks for Standards 3–6.
//
// Source of truth:
//   Mandarin/三年级华文测试/三年级_华文_程度评估测试.docx
//   Mandarin/四年级华文测试/四年级_华文_程度评估测试.docx
//   Mandarin/五年级华文测试/五年级_华文_程度评估测试.docx
//   Mandarin/六年级华文测试/六年级_华文_程度评估测试.docx
//
// The source questions and expected answers are preserved. Related paper
// questions are grouped into richer interactive cards where that reduces
// repetition (for example, a passage followed by several sub-questions).

import type { QData } from "./banks-s4-s6";

type Choice = { key: string; text: string };

const choices = (...texts: string[]): Choice[] =>
  texts.map((text, index) => ({ key: String.fromCharCode(65 + index), text }));

const single = (
  prompt: string,
  optionTexts: string[],
  key: string,
  dimension = "GRAMMAR",
  score = 1,
  topicLabel?: string,
  topicIcon?: string,
): QData => ({
  type: "SINGLE",
  dimension,
  score,
  prompt,
  content: { options: choices(...optionTexts), topicLabel, topicIcon },
  answer: { key },
});

const passage = (title: string, body: string) => `${title}\n\n${body}`;

// ─────────────────────────────────────────────────────────────────────────
// 三年级 · richer word knowledge, sentence building and guided composition
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard3Questions(): QData[] {
  const antStory = passage(
    "小蚂蚁的启示",
    "小明在公园里玩耍时，发现了一群小蚂蚁正在搬运食物。那些食物比蚂蚁的身体还要大好几倍，可是蚂蚁们毫不气馁，一步一步地把食物搬回巢穴。\n\n小明忍不住蹲下来仔细观察。他发现，每当一只蚂蚁搬不动时，就会有其他蚂蚁来帮忙。它们分工合作，努力不懈，终于把比自己大好多倍的食物顺利搬回去了。\n\n小明若有所思地站起来，心想：蚂蚁那么渺小，却能做到这么了不起的事，我以后做事也要像蚂蚁一样，不怕困难，坚持到底。",
  );

  return [
    single("找一找意思最接近的伙伴。\n\n下面哪个词语是「勇敢」的近义词？", ["胆小", "懦弱", "勇猛", "害怕"], "C", "VOCAB", 1, "近义词", "🧭"),
    single("找一找意思相反的伙伴。\n\n下面哪个词语是「宽阔」的反义词？", ["广阔", "开阔", "狭窄", "宽广"], "C", "VOCAB", 1, "反义词", "↔️"),
    single("把最生动的词放进句子里。\n\n天黑了，星星（　　）在天空中。", ["爬行", "闪烁", "奔跑", "游动"], "B", "VOCAB", 1, "词语运用", "✨"),
    single("根据情境，选出最贴切的心情。\n\n弟弟考试得了第一名，妈妈（　　）地笑了。", ["难过", "伤心", "开心", "生气"], "C", "VOCAB", 1, "情境词语", "😊"),
    single("把最准确的词放进句子里。\n\n他做事非常（　　），每件事都做得很好。", ["马虎", "粗心", "认真", "懒惰"], "C", "VOCAB", 1, "词语运用", "🎯"),
    {
      type: "MATCHING", dimension: "VOCAB", score: 2,
      prompt: "让词语找到最合适的搭档。",
      content: { left: ["改正", "保护"], right: ["环境", "错误"], dragDrop: true, topicLabel: "词语搭配" },
      answer: { pairs: { "0": 1, "1": 0 } },
    },
    {
      type: "READING", dimension: "VOCAB", score: 3,
      prompt: "成语拼图：根据意思，补上最合适的字。",
      content: {
        passage: "每个成语都藏着一幅画面。先读意思，再完成成语。",
        subs: [
          { stem: "成群结（　）—— 好多人或小动物聚在一起", icon: "🐜", options: choices("群", "队", "人") },
          { stem: "汪洋（　）海 —— 大海无边无际", icon: "🌊", options: choices("大", "小", "阔") },
          { stem: "分（　）合作 —— 大家分配好工作", icon: "🤝", options: choices("配", "工", "享") },
        ],
      },
      answer: { keys: ["B", "A", "B"] },
    },
    {
      type: "READING", dimension: "PHONICS", score: 2,
      prompt: "多音字侦探：根据句子的意思，找出「着」的正确读音。",
      content: {
        passage: "zháo：进入某种状态，如睡着、着火。\nzhuó：穿戴，如穿着、戴着。",
        subs: [
          { stem: "她睡着了，很快就进入了梦乡。", options: choices("zháo", "zhuó") },
          { stem: "他穿着一件蓝色的外套走进教室。", options: choices("zháo", "zhuó") },
        ],
      },
      answer: { keys: ["A", "B"] },
    },
    single("部首寻亲：哪个字和「清」一样，都有三点水（氵）？", ["情", "请", "游", "晴"], "C", "VOCAB", 1, "部首", "💧"),
    single("部首寻亲：哪个字和「跑」一样，都有足字旁（足）？", ["泡", "炮", "跳", "抱"], "C", "VOCAB", 1, "部首", "👣"),
    single("为句子选一个正确的标点符号。\n\n你今天为什么迟到了（　）", ["，", "。", "！", "？"], "D", "GRAMMAR", 1, "标点", "❓"),
    {
      type: "READING", dimension: "GRAMMAR", score: 2,
      prompt: "量词配对站：为每个名词选出合适的量词。",
      content: {
        passage: "量词会告诉我们事物该怎样计算。读完整个词组再选择。",
        subs: [
          { stem: "一（　）建议", options: choices("条", "则") },
          { stem: "一（　）消息", options: choices("条", "则") },
        ],
      },
      answer: { keys: ["A", "B"] },
    },
    single("根据动作的快慢，选出最恰当的词。\n\n天气很热，我们（　　）地跑回家。", ["急急忙忙", "慢慢吞吞"], "A", "GRAMMAR", 1, "状语", "🏃"),
    single("句子诊所：找出没有语病的句子。", ["昨天下了一场很大的大雨。", "昨天下了一场大雨。"], "B", "GRAMMAR", 1, "病句", "🩺"),
    single("句子诊所：找出没有语病的句子。", ["我们要保护环境卫生。", "我们要保护环境卫生干净。"], "A", "GRAMMAR", 1, "病句", "🌱"),
    {
      type: "READING", dimension: "GRAMMAR", score: 2,
      prompt: "关联词桥梁：选择能把前后意思自然连起来的组合。",
      content: {
        passage: "词语库：因为……所以…… / 虽然……但是…… / 如果……就…… / 不但……而且……",
        subs: [
          { stem: "妹妹（　）会唱歌，（　）会跳舞。", options: choices("因为……所以……", "不但……而且……", "如果……就……") },
          { stem: "（　）小明生病了，（　）他还是坚持来上学。", options: choices("虽然……但是……", "因为……所以……", "不但……而且……") },
        ],
      },
      answer: { keys: ["B", "A"] },
    },
    {
      type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "词句重组挑战：轻点词语卡，把它们排成通顺的句子。",
      content: { items: ["小鸟", "在", "蓝蓝的", "可爱的", "自由地", "天空中", "飞翔"], dragDrop: true },
      answer: { order: [3, 0, 1, 2, 5, 4, 6] },
      explanation: "正确句子：可爱的小鸟在蓝蓝的天空中自由地飞翔。",
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 2,
      prompt: "句子变身：把陈述句改成感叹句。\n\n原句：这朵花真美丽。",
      content: { minWords: 7, maxWords: 20, template: "这朵花……！", lang: "zh" },
      answer: { rubric: "参考：这朵花真美丽啊！须保留原意，并使用感叹语气和感叹号。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 2,
      prompt: "句子变身：用「把」字改写。\n\n原句：我做完了功课。",
      content: { minWords: 7, maxWords: 20, template: "我把……", lang: "zh" },
      answer: { rubric: "参考：我把功课做完了。须使用把字句并保持原意。" },
    },
    {
      type: "READING", dimension: "READING", score: 8,
      prompt: "阅读探索：先观察画面，再读《小蚂蚁的启示》，完成六个线索任务。",
      content: {
        passage: antStory,
        passageImage: "/questions/chinese-reading/s3-ant-teamwork.jpg",
        passageImageAlt: "小明在公园观察一群蚂蚁合作搬运比身体大的食物",
        subs: [
          { stem: "蚂蚁在公园里做什么？", options: choices("在草地上玩耍", "在搬运比自己身体还大的食物", "在找水喝", "在修建巢穴") },
          { stem: "文中「毫不气馁」是什么意思？", options: choices("非常生气，不愿意做", "完全没有灰心，继续努力", "很害怕，不敢向前", "慢慢来，不着急") },
          { stem: "小明从蚂蚁身上学到了什么？", options: choices("食物越大越好吃", "要多到公园玩", "做事要不怕困难，坚持到底", "蚂蚁比人更聪明") },
          { stem: "判断：蚂蚁搬的食物比自己的身体还大好几倍。", options: choices("对", "错") },
          { stem: "判断：蚂蚁各自行动，没有互相帮助。", options: choices("对", "错") },
          { stem: "判断：小明决定以后也要坚持到底。", options: choices("对", "错") },
        ],
      },
      answer: { keys: ["B", "B", "C", "A", "B", "A"] },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 4,
      prompt: "合作故事工坊\n\n写一段你和同学合作完成任务的经历。\n\n• 什么时候、做什么活动\n• 大家怎样分工合作\n• 最后结果和你的感受\n\n词语参考：分工合作、努力、坚持、终于、非常开心",
      content: {
        minWords: 40, maxWords: 100, lang: "zh",
        imageUrl: "/questions/chinese-reading/s3-class-teamwork.jpg",
        template: "先交代时间和任务，再写合作过程，最后写结果和感受。",
      },
      answer: { rubric: "包含时间/活动、合作过程、结果与感受；句子连贯，不少于40字。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 四年级 · MPT4-inspired information reading, KBAT and supplied writing
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard4Questions(): QData[] {
  const clubs = passage(
    "课外兴趣班简介",
    "🎨 绘画班｜素描、水彩画与手工制作；每月作品展览。培养创造力、色彩搭配、耐心与专注力。适合喜爱美术、富有想象力的学生。每周二下午 1:00–3:00。\n\n⚫ 围棋班｜学习对弈技巧、分析棋局；每月参加校内比赛。培养观察力、专注力与逻辑分析能力。适合喜爱思考与博弈、性格沉稳的学生。每周三下午 2:00–4:00。\n\n🎤 演讲班｜训练口才、姿态与临场应变；每月进行模拟演讲比赛。培养语言表达、自信心与应变能力。适合乐于表达、思维敏捷的学生。每周四下午 1:00–3:00。",
  );
  const umbrella = passage(
    "一把雨伞",
    "那天，天空乌云密布，不一会儿，豆大的雨点便落了下来。放学铃声刚响，同学们纷纷冲出课室，有的打开雨伞，有的蹲在走廊里等待家长。\n\n小恩站在走廊边，心里很着急。她忘了带雨伞，而妈妈要很晚才来接她。阿明走过来，把自己的雨伞递给小恩，说：「你先用吧，我等一会儿再走。」\n\n小恩担心阿明淋湿。阿明笑着说：「我家就在学校旁边，你家比较远，还是你用吧。」小恩接过雨伞，心里充满感激。\n\n第二天，小恩把雨伞还给阿明，还带了妈妈做的曲奇饼感谢他。妈妈知道后说：「朋友之间，就应该互相帮助。」小恩用力地点点头，心里暖洋洋的。",
  );

  return [
    single("词语镜像：下面哪个词语是「勤劳」的反义词？", ["努力", "认真", "懒惰"], "C", "VOCAB", 2, "反义词", "🪞"),
    single("词语伙伴：下面哪个词语与「关爱」意思最相近？", ["冷漠", "关心", "批评"], "B", "VOCAB", 2, "近义词", "🤲"),
    single("把最有温度的词放进句子里。\n\n妈妈的声音（　），听了让人心里感到很温暖。", ["刺耳", "沙哑", "温柔"], "C", "VOCAB", 2, "语境选词", "🎙️"),
    single("成语情境：哪个成语形容非常专心学习，连睡觉和吃饭都忘了？", ["三心二意", "废寝忘食", "好逸恶劳"], "B", "VOCAB", 2, "成语", "📚"),
    single("读句子，判断成语画面。\n\n「他张牙舞爪地冲了过来」中的「张牙舞爪」形容什么？", ["动作优雅", "很有礼貌", "凶猛吓人的样子"], "C", "VOCAB", 2, "成语理解", "🐯"),
    single("句子诊所：找出没有语病的句子。", ["虽然天气很冷，所以我们还是坚持去运动。", "虽然天气很冷，但是我们还是坚持去运动。", "因为天气很冷，但是我们还是坚持去运动。"], "B", "GRAMMAR", 2, "关联词", "🩺"),
    single("关联词桥梁：选出正确的组合。\n\n（　）你努力练习，（　）一定会进步。", ["虽然……但是……", "不但……而且……", "如果……就……"], "C", "GRAMMAR", 2, "关联词", "🌉"),
    {
      type: "READING", dimension: "PHONICS", score: 2,
      prompt: "读音辨析：根据句意选择正确读音。",
      content: { passage: "同一个字放进不同词语里，读音可能会改变。", subs: [
        { stem: "老师教（　）我们做人的道理。", options: choices("jiāo", "jiào") },
        { stem: "这道数学题真难，我算了很久（　）也算不出。", options: choices("jiǔ", "jiū") },
      ] },
      answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 2,
      prompt: "修辞画室：辨认句子使用的修辞手法。",
      content: { passage: "比喻会把一种事物比作另一种；拟人会让事物像人一样行动。", subs: [
        { stem: "弯弯的月亮像一条小船挂在天上。", options: choices("比喻", "拟人") },
        { stem: "小鸟在枝头唱着欢快的歌。", options: choices("比喻", "拟人") },
      ] },
      answer: { keys: ["A", "B"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "量词调色盘：为每个名词选出合适的量词。",
      content: { passage: "词语库：条 / 阵 / 股 / 首", subs: [
        { stem: "一（　）微风", options: choices("条", "阵", "股", "首") },
        { stem: "一（　）香味", options: choices("条", "阵", "股", "首") },
        { stem: "一（　）河流", options: choices("条", "阵", "股", "首") },
        { stem: "一（　）诗", options: choices("条", "阵", "股", "首") },
      ] },
      answer: { keys: ["B", "C", "A", "D"] },
    },
    {
      type: "READING", dimension: "READING", score: 5,
      prompt: "资讯导航：阅读《课外兴趣班简介》，找出关键资料。",
      content: {
        passage: clubs,
        passageImage: "/questions/chinese-reading/s4-interest-clubs.jpg",
        passageImageAlt: "三位学生分别参加绘画班、围棋班和演讲班",
        subs: [
          { stem: "绘画班每月举办什么活动？", options: choices("作品展览", "模拟演讲比赛", "校内围棋比赛", "模拟辩论赛") },
          { stem: "围棋班主要培养哪一种能力？", options: choices("色彩搭配能力", "语言表达能力", "观察力与逻辑分析能力", "手工制作能力") },
          { stem: "哪一个兴趣班最适合喜爱思考与博弈、性格沉稳的学生？", options: choices("绘画班", "围棋班", "演讲班", "三个都一样") },
          { stem: "演讲班什么时候上课？", options: choices("周二 1:00–3:00", "周三 2:00–4:00", "周五 1:00–3:00", "周四 1:00–3:00") },
          { stem: "三个兴趣班有什么相同点？", options: choices("都在操场上课", "都学习绘画", "每月都有比赛或展示", "上课时间都相同") },
        ],
      },
      answer: { keys: ["A", "C", "B", "D", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "因果线索\n\n阿明为什么愿意把雨伞借给小恩？",
      content: { minWords: 18, maxWords: 70, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "答出阿明家近、小恩家远，以及主动帮助同学。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 4,
      prompt: "人物侦探\n\n小恩为什么带曲奇饼给阿明？从这个举动，你看出她是怎样的人？",
      content: { minWords: 25, maxWords: 90, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "感谢借伞；人物特点可为懂得感恩、有礼貌或体贴，并须说明依据。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 4,
      prompt: "生活连结 · YouSeed 开放思考\n\n你赞同「朋友之间应该互相帮助」吗？请用一个具体生活例子说明。",
      content: { minWords: 35, maxWords: 120, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "明确表态、说明理由，并举一个具体生活例子；言之有理即可。" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 12,
      prompt: "阅读能量地图\n\n根据四个资料点，写一段文字说明多阅读课外书的好处。\n\n• 增加知识，开阔视野\n• 提高写作与表达能力\n• 培养专注力与耐心\n• 放松心情，带来快乐",
      content: { minWords: 40, maxWords: 120, lang: "zh", imageUrl: "/questions/chinese-reading/s4-reading-benefits.jpg", template: "先写总句，再选择三至四个好处逐点说明，最后写总结。" },
      answer: { rubric: "不少于40字；内容涵盖资料点，结构连贯，用词准确。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 五年级 · UASA-style critical reading and topic-choice composition
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard5Questions(): QData[] {
  const network = passage(
    "网络的两面性",
    "如今，网络已经进入生活的每一个角落。学生用网络查资料、学习新知识；大人用网络工作、购物和联系朋友。网络让世界变得更小，让信息传播得越来越快。\n\n然而，网络也有黑暗面。一些人沉迷网络游戏，忘记现实生活中的责任；一些人轻易相信网络谣言，造成误解甚至恐慌。更严重的是，有些不法分子利用网络行骗，让许多人蒙受损失。\n\n因此，我们使用网络时必须保持清醒。善用网络，它就是好帮手；滥用网络，它就会成为绊脚石。",
  );

  return [
    single("词语温度计：选出最恰当的褒义词。\n\n他（　）地帮助有需要的人，不求回报。", ["自私", "慷慨", "吝啬", "冷漠"], "B", "VOCAB", 2, "褒义词", "🌤️"),
    single("词语温度计：选出最恰当的贬义词。\n\n他做事很（　），不多考虑就下决定，常常出错。", ["果断", "勇敢", "鲁莽", "积极"], "C", "VOCAB", 2, "贬义词", "⚠️"),
    single("成语情境：小明每天练习到深夜，甚至（　），只为了赢得比赛。", ["三心二意", "废寝忘食", "好逸恶劳", "不劳而获"], "B", "VOCAB", 2, "成语", "🏆"),
    single("哪个词语可以代替句子中的「统统」？\n\n妖怪要把捉鱼的人统统吃掉。", ["索性", "真正", "整体", "全部"], "D", "VOCAB", 2, "词语替换", "🔁"),
    single("成语推理：他们一开始（　），后来才齐心协力完成任务。", ["废寝忘食", "分工合作", "各自为政", "通力合作"], "C", "VOCAB", 1, "成语语境", "🧩"),
    {
      type: "READING", dimension: "PHONICS", score: 2,
      prompt: "多音字解码：根据词义选择读音。",
      content: { passage: "先读完整个句子，再判断多音字在这里表达的意思。", subs: [
        { stem: "妈妈把破了的衣服缝好了。", options: choices("féng", "fèng") },
        { stem: "他的成绩在班上数一数二。", options: choices("shǔ", "shù") },
      ] }, answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "修辞镜头：辨认每个句子的表达手法。",
      content: { passage: "选择：比喻 / 拟人 / 夸张", subs: [
        { stem: "教室里静得连一根针掉在地上都能听见。", options: choices("比喻", "拟人", "夸张") },
        { stem: "春风轻轻地抚摸着大地。", options: choices("比喻", "拟人", "夸张") },
        { stem: "弯弯的月亮像一只小船挂在天上。", options: choices("比喻", "拟人", "夸张") },
      ] }, answer: { keys: ["C", "B", "A"] },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 2,
      prompt: "句子诊所：删去多余成分，写出正确句子。\n\n病句：通过这次活动，使我明白了团结的重要。",
      content: { minWords: 14, maxWords: 35, lang: "zh", template: "这次活动……" },
      answer: { rubric: "参考：这次活动使我明白了团结的重要。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 2,
      prompt: "语气转换：把陈述句改成反问句。\n\n原句：我们不能忘记老师的教导。",
      content: { minWords: 14, maxWords: 40, lang: "zh", template: "我们怎么能……呢？" },
      answer: { rubric: "参考：我们怎么能忘记老师的教导呢？须保持原意并使用反问语气。" },
    },
    {
      type: "READING", dimension: "VOCAB", score: 2,
      prompt: "近义词辨析：选择放进句子里最准确的词。",
      content: { passage: "相近的词，也会因搭配对象不同而有不同用法。", subs: [
        { stem: "我们要（　）时间，不要白白浪费。", options: choices("爱惜", "爱护") },
        { stem: "这个故事给了我很大的（　）。", options: choices("启示", "启事") },
      ] }, answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "READING", score: 6,
      prompt: "双面镜阅读：观察画面，阅读《网络的两面性》，寻找事实与观点。",
      content: {
        passage: network,
        passageImage: "/questions/chinese-reading/s5-network-balance.jpg",
        passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险",
        subs: [
          { stem: "网络给大人的生活带来了什么便利？", options: choices("查资料和学习新知识", "工作、购物和联系朋友", "玩游戏和行骗") },
          { stem: "轻易相信网络谣言为什么不好？", options: choices("会造成误解甚至恐慌", "会忘记现实责任", "会传播有用信息") },
          { stem: "「好帮手」和「绊脚石」分别指什么？", options: choices("网络的快与慢", "网络的普遍与特殊", "网络的正面作用与负面危害") },
        ],
      }, answer: { keys: ["B", "A", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "后果链\n\n沉迷网络游戏会带来什么不良后果？请根据文章说明。",
      content: { minWords: 28, maxWords: 100, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险" },
      answer: { rubric: "可答忘记责任、影响功课/学业、视力或健康、耽误正事等，至少说明两点。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "数码侦探 · YouSeed 开放思考\n\n小学生怎样在阅读网络信息时保持清醒？请举一个具体方法。",
      content: { minWords: 30, maxWords: 110, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险" },
      answer: { rubric: "例如向家长/老师求证、查可靠来源、核实后才转发；须有具体方法。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "文章编辑室\n\n找出语病并写出正确句子：\n「一些人不法分子利用网络行骗，让许多人蒙受损失。」",
      content: { minWords: 20, maxWords: 55, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险", template: "病因是……；修改后：……" },
      answer: { rubric: "「一些人」与「不法分子」语义重复。修改：一些不法分子利用网络行骗，让许多人蒙受损失。" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 15,
      prompt: "主题创作舱\n\n从三个题目中选择一个，完成一篇结构完整的作文。",
      content: {
        minWords: 100, maxWords: 220, lang: "zh",
        writingChoices: [
          { key: "network", title: "网络对我们生活的影响", description: "说明网络的好处、坏处，以及正确使用网络的方法。", icon: "🌐" },
          { key: "moved", title: "一次令我感动的经历", description: "写清楚事情经过、感动的原因，以及你学到什么。", icon: "💛" },
          { key: "dream", title: "我的梦想", description: "介绍梦想、原因，以及你准备怎样实现。", icon: "🚀" },
        ],
        template: "先选题，再规划开头、两个主要内容和结尾感受。",
      },
      answer: { rubric: "切题、结构完整、内容具体、语句通顺；题目选择须清楚。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 六年级 · UASA readiness, evaluative reading and extended composition
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard6Questions(): QData[] {
  const seedJourney = passage(
    "一粒种子的旅程",
    "春天，一粒蒲公英种子随风飘落在一块贫瘠的土地上。那里土壤干硬，几乎没有水分。其他种子不是被鸟儿吃掉，就是被风再次吹走。只有这粒种子凭着顽强的生命力，悄悄扎根。\n\n它用细小的根须一点一点渗透进坚硬的泥土，寻找每一滴水分，汲取每一丝养分。风雨来了，它弯下腰，却没有断；烈日当空，它低下头，却没有枯。经过漫长等待，第一抹嫩芽终于破土而出。\n\n多年以后，那块贫瘠的土地上开满蒲公英，黄灿灿的花朵随风摇曳，带来生机与希望。路过的人们无不停下脚步，赞叹这一片美丽的生命奇迹。",
  );

  return [
    single("语境换词：「你在这里处处都要小心，免得让我牵挂。」哪个词可代替「牵挂」？", ["思念", "担忧", "责怪"], "B", "VOCAB", 1, "词语替换", "🧠"),
    single("多音字推理：「每天给的点心钱，他也舍不得花。」哪一项的「舍」读音相同？", ["退避三舍", "寒舍", "施舍"], "C", "PHONICS", 1, "多音字", "🔤"),
    single("拼音雷达：哪两个字的韵母相同？", ["幼、会", "庞、红", "再、海"], "C", "PHONICS", 1, "韵母", "📡"),
    single("词语色彩：选出含有贬义的词。\n\n他（　）地拒绝别人的好意，让对方很难堪。", ["坚定", "果断", "傲慢"], "C", "VOCAB", 1, "褒贬义", "🎨"),
    single("用词审稿：哪个句子的词语使用最准确？", ["他谦虚地炫耀自己的成绩。", "她虚伪地表扬同学，让同学受到鼓励。", "他谦虚地说自己还有很多不足，请大家多指教。"], "C", "VOCAB", 1, "用词准确", "📝"),
    single("错别字侦探：哪个句子有错别字？", ["即使面对再大的风雨，我们也决不向困难低头。", "老师鼓励我们要勇于偿试新的事物，不要害怕失败。", "操场上，同学们正在兴致勃勃地练习踢足球。"], "B", "VOCAB", 2, "错别字", "🔎"),
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "修辞实验室：判断每个句子的修辞手法。",
      content: { passage: "选择最能解释句子表达效果的修辞。", subs: [
        { stem: "这么简单的道理，难道你还不明白吗？", options: choices("比喻", "拟人", "夸张", "反问") },
        { stem: "他饿得能吃下一头牛。", options: choices("比喻", "拟人", "夸张", "反问") },
        { stem: "溪水哗啦啦地唱着歌，欢快地奔向远方。", options: choices("比喻", "拟人", "夸张", "反问") },
      ] }, answer: { keys: ["D", "C", "B"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "句式转换站：选择保持原意的正确改写。",
      content: { passage: "改写后，人称、时间和原意都要保持一致。", subs: [
        { stem: "把「小树被大风吹倒了」改成把字句。", options: choices("大风把小树吹倒了。", "小树把大风吹倒了。", "大风被小树吹倒了。") },
        { stem: "把「老师说：『我明天不来上课。』」改成转述句。", options: choices("老师说，我明天不来上课。", "老师说，他明天不来上课。", "老师说，你明天不来上课。") },
      ] }, answer: { keys: ["A", "B"] },
    },
    {
      type: "READING", dimension: "VOCAB", score: 2,
      prompt: "成语应用：根据语境完成两个成语任务。",
      content: { passage: "成语要放在合适的语境，也要注意固定写法。", subs: [
        { stem: "老师讲解得（　），我们一听就懂。", options: choices("深入浅出", "囫囵吞枣", "不知所云") },
        { stem: "完成固定搭配：孜孜（　）倦；恋恋（　）舍。", options: choices("不、不", "不、无", "无、不") },
      ] }, answer: { keys: ["A", "B"] },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "逻辑修复：改正病句。\n\n为了防止这类事故不再发生，我们必须加强安全教育。",
      content: { minWords: 22, maxWords: 55, lang: "zh", template: "为了防止……" },
      answer: { rubric: "参考：为了防止这类事故再发生，我们必须加强安全教育。删去双重否定中的「不」。" },
    },
    {
      type: "READING", dimension: "READING", score: 6,
      prompt: "生命轨迹：观察画面，阅读《一粒种子的旅程》，追踪关键线索。",
      content: {
        passage: seedJourney,
        passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg",
        passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海",
        subs: [
          { stem: "为什么其他种子无法在那块土地上生存？", options: choices("被烈日晒枯", "被风雨折断", "不习惯春天", "被鸟吃掉或被风吹走") },
          { stem: "这粒种子怎样寻找水分和养分？", options: choices("等待大雨", "由路人浇水", "用根须渗透进坚硬泥土", "只靠阳光") },
          { stem: "「弯下腰却没有断；低下头却没有枯」赞美什么品质？", options: choices("乐于助人", "听天由命", "顽强不屈", "追求美丽") },
        ],
      }, answer: { keys: ["D", "C", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "变化图谱\n\n多年后，贫瘠的土地发生了什么变化？人们有什么反应？",
      content: { minWords: 35, maxWords: 120, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "土地开满蒲公英、充满生机；路人停下脚步并赞叹。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "成长启示 · YouSeed 开放思考\n\n你从蒲公英种子的成长旅程中得到什么启示？",
      content: { minWords: 35, maxWords: 130, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "围绕毅力、坚持、不轻言放弃、克服困难等展开；言之有理并结合文章。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "同义改写\n\n把句子中的「无不」换成意思相同的词，并重写整句：\n「路过的人们无不停下脚步，赞叹这一片美丽的生命奇迹。」",
      content: { minWords: 28, maxWords: 70, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "参考：路过的人们都停下脚步，赞叹这一片美丽的生命奇迹。" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 15,
      prompt: "毕业创作室\n\n从三个题目中选择一个，完成一篇结构完整、观点清楚的作文。",
      content: {
        minWords: 150, maxWords: 320, lang: "zh",
        writingChoices: [
          { key: "tech", title: "科技与人情味", description: "提出看法，并用至少两个理由说明科技与人情味如何共存。", icon: "🤖" },
          { key: "adversity", title: "逆境中的成长", description: "写一次困难或挫折、克服过程，以及你的成长。", icon: "⛰️" },
          { key: "future-letter", title: "给十年后的自己一封信", description: "使用书信格式，写下希望、担忧和期待。", icon: "✉️" },
        ],
        template: "选定题目后，先列出开头、两个主要内容和有力量的结尾。",
      },
      answer: { rubric: "不少于150字；切题、内容具体、结构完整、表达清楚，书信题须符合格式。" },
    },
  ];
}
