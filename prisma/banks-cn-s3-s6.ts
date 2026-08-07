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
): QData => ({
  type: "SINGLE",
  dimension,
  score,
  prompt,
  content: { options: choices(...optionTexts) },
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
    single("下面哪个词语是「勇敢」的近义词？（意思最相近）", ["胆小", "懦弱", "勇猛", "害怕"], "C", "VOCAB", 1),
    single("下面哪个词语是「宽阔」的反义词？（意思相反）", ["广阔", "开阔", "狭窄", "宽广"], "C", "VOCAB", 1),
    single("句子「天黑了，星星（　）在天空中。」填入哪个词语最恰当？", ["爬行", "闪烁", "奔跑", "游动"], "B", "VOCAB", 1),
    single("弟弟考试得了第一名，妈妈（　）地笑了。", ["难过", "伤心", "开心", "生气"], "C", "VOCAB", 1),
    single("他做事非常（　），每件事都做得完美无缺。填入哪个词语最恰当？", ["马虎", "粗心", "认真", "懒惰"], "C", "VOCAB", 1),
    {
      type: "MATCHING", dimension: "VOCAB", score: 2,
      prompt: "把词语连成正确的搭配。",
      content: { left: ["改正", "保护"], right: ["环境", "错误"], dragDrop: true },
      answer: { pairs: { "0": 1, "1": 0 } },
    },
    {
      type: "READING", dimension: "VOCAB", score: 3,
      prompt: "根据图片和意思提示，选择成语中缺少的一个字。",
      content: {
        passage: "根据图片和意思提示，选择成语中缺少的一个字。",
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
      prompt: "根据括号里的提示，选出「着」的正确读音。",
      content: {
        passage: "zháo：进入某种状态，如睡着、着火。\nzhuó：穿戴，如穿着、戴着。",
        subs: [
          { stem: "她睡着了，很快就进入了梦乡。", highlightText: "着", options: choices("zháo", "zhuó") },
          { stem: "他穿着一件蓝色的外套走进教室。", highlightText: "着", options: choices("zháo", "zhuó") },
        ],
      },
      answer: { keys: ["A", "B"] },
    },
    single("「清」字的部首是三点水（氵），下面哪个字也有三点水？", ["情", "请", "游", "晴"], "C", "VOCAB", 1),
    single("「跑」字的部首是足字旁（足），下面哪个字也有足字旁？", ["泡", "炮", "跳", "抱"], "C", "VOCAB", 1),
    single("为句子选一个正确的标点符号。\n\n你今天为什么迟到了（　）", ["，", "。", "！", "？"], "D", "GRAMMAR", 1),
    {
      type: "READING", dimension: "GRAMMAR", score: 2,
      prompt: "为每个名词选出合适的量词。",
      content: {
        passage: "从括号里选出最恰当的答案。",
        subs: [
          { stem: "一（　）建议", options: choices("条", "则") },
          { stem: "一（　）消息", options: choices("条", "则") },
        ],
      },
      answer: { keys: ["A", "B"] },
    },
    single("根据动作的快慢，选出最恰当的词。\n\n天气很热，我们（　　）地跑回家。", ["急急忙忙", "慢慢吞吞"], "A", "GRAMMAR", 1),
    single("找出没有语病的句子。", ["昨天下了一场很大的大雨。", "昨天下了一场大雨。"], "B", "GRAMMAR", 1),
    single("找出没有语病的句子。", ["我们要保护环境卫生。", "我们要保护环境卫生干净。"], "A", "GRAMMAR", 1),
    {
      type: "READING", dimension: "GRAMMAR", score: 2,
      prompt: "从词语库中选出最恰当的关联词。",
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
      prompt: "把下面的词语排成一句正确的句子。",
      content: { items: ["小鸟", "在", "蓝蓝的", "可爱的", "自由地", "天空中", "飞翔"], dragDrop: true },
      answer: { order: [3, 0, 1, 2, 5, 4, 6] },
      explanation: "正确句子：可爱的小鸟在蓝蓝的天空中自由地飞翔。",
    },
    single("把陈述句改成感叹句。\n\n原句：这朵花真美丽。\n\n哪一个改写最正确？", ["这朵花真美丽。", "这朵花真美丽啊！"], "B", "GRAMMAR", 2),
    single("用「把」字改写句子。\n\n原句：我做完了功课。\n\n哪一个改写最正确？", ["我做完了功课。", "我把功课做完了。"], "B", "GRAMMAR", 2),
    {
      type: "READING", dimension: "READING", score: 8,
      prompt: "阅读下面的短文，然后回答问题。",
      content: {
        passage: antStory,
        passageImage: "/questions/chinese-reading/s3-ant-teamwork.jpg",
        passageImageAlt: "小明在公园观察一群蚂蚁合作搬运比身体大的食物",
        subs: [
          { stem: "蚂蚁在公园里做什么？", options: choices("在草地上玩耍", "在搬运比自己身体还大的食物", "在找水喝", "在修建巢穴") },
          { stem: "文中「毫不气馁」的意思是什么？", options: choices("非常生气，不愿意做", "完全没有灰心丧气，继续努力", "很害怕，不敢向前", "慢慢来，不着急") },
          { stem: "小明从蚂蚁身上学到了什么道理？", options: choices("食物越大越好吃", "要懂得欣赏大自然", "做事要不怕困难，坚持到底", "应该多在公园里玩耍") },
          { stem: "判断：蚂蚁搬的食物比它们自己的身体还要大好几倍。", options: choices("对", "错") },
          { stem: "判断：蚂蚁一只一只地各自行动，没有互相帮助。", options: choices("对", "错") },
          { stem: "判断：小明决定以后做事也要像蚂蚁一样坚持到底。", options: choices("对", "错") },
        ],
      },
      answer: { keys: ["B", "B", "C", "A", "B", "A"] },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 4,
      prompt: "参考下面的情景和词语，写一段连贯的短文，字数不少于40字。\n\n情景：在一次班级活动中，你和同学们合作完成了一个任务。\n\n• 什么时候、做什么活动\n• 大家怎样合作\n• 你的感受\n\n词语参考：分工合作、努力、坚持、终于、非常开心",
      content: {
        minWords: 40, maxWords: 1000, minimumOnly: true, lang: "zh",
        imageUrl: "/questions/chinese-reading/s3-class-teamwork.jpg",
        template: "先交代时间和任务，再写合作过程，最后写结果和感受。",
      },
      answer: { rubric: "参考答案1：今天，我们一起布置教室，准备迎接节日。同学们分工合作，有的画画，有的贴彩带，有的摆气球。虽然很累，可是我们都很努力，坚持把工作做完。终于，教室变得又漂亮又热闹。我们看着自己的作品，心里感到非常开心，也更加喜欢我们这个班级了。\n\n参考答案2：上个星期五，我们班举办了大扫除活动。老师把我们分成几个小组，大家分工合作。有的擦窗户，有的扫地，有的整理桌椅。我们非常努力，一直坚持到底，终于把教室打扫得干干净净。看着整洁的教室，大家都非常开心。这次活动让我明白：只要团结合作，就能把事情做好。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 四年级 · MPT4-inspired information reading, KBAT and supplied writing
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard4Questions(): QData[] {
  const clubs = passage(
    "课外兴趣班简介",
    "阅读下表，比较三个兴趣班的主要内容、核心能力、适合对象和上课时间。",
  );
  const umbrella = passage(
    "一把雨伞",
    "那天，天空乌云密布，不一会儿，豆大的雨点便落了下来。放学铃声刚响，同学们纷纷冲出课室，有的打开雨伞，有的蹲在走廊里等待家长来接。\n\n小恩站在走廊边，看着雨水哗哗地落下，心里很着急。她忘了带雨伞，而妈妈要到很晚才能来接她。这时，坐在她旁边的同学阿明走了过来，把自己的雨伞递给小恩，说：「你先用吧，我等一会儿再走。」\n\n小恩摇摇头，说：「这样你会淋湿的，不行。」阿明笑着说：「没关系，我家就在学校旁边，走两步就到了。你家比较远，还是你用吧。」小恩接过雨伞，心里充满了感激。\n\n第二天，小恩把雨伞还给阿明，还特地带了一包妈妈亲手做的曲奇饼送给他，说：「谢谢你昨天帮助我，这是我妈妈做的曲奇饼，请你吃。」阿明接过饼干，开心地说：「谢谢你！有朋友真好！」\n\n小恩回到家，把这件事告诉了妈妈。妈妈摸着她的头说：「阿明是一个善良的孩子，你也做得很好。朋友之间，就应该互相帮助。」小恩用力地点点头，心里暖洋洋的。\n\n（改编）",
  );

  return [
    single("下面哪个词语是「勤劳」的反义词？", ["努力", "认真", "懒惰"], "C", "VOCAB", 2),
    single("下面哪个词语与「关爱」意思最相近？", ["冷漠", "关心", "批评"], "B", "VOCAB", 2),
    single("「妈妈的声音（　），听了让人心里感到很温暖。」填入哪个词最恰当？", ["刺耳", "沙哑", "温柔"], "C", "VOCAB", 2),
    single("下面哪个成语可以用来形容一个人非常专心地学习，连睡觉和吃饭都忘了？", ["三心二意", "废寝忘食", "好逸恶劳"], "B", "VOCAB", 2),
    single("句子「他张牙舞爪地冲了过来，吓得我们连忙躲到一旁。」「张牙舞爪」用来形容什么？", ["一个人动作优雅", "一个人很有礼貌", "一个人凶猛吓人的样子"], "C", "VOCAB", 2),
    single("找出下面没有语病的句子。", ["虽然天气很冷，所以我们还是坚持去运动。", "虽然天气很冷，但是我们还是坚持去运动。", "因为天气很冷，但是我们还是坚持去运动。"], "B", "GRAMMAR", 2),
    single("选出括号里正确的关联词。\n\n「（　）你努力练习，（　）一定会进步的。」", ["虽然……但是……", "不但……而且……", "如果……就……"], "C", "GRAMMAR", 2),
    {
      type: "READING", dimension: "PHONICS", score: 3,
      prompt: "根据句意选择正确读音。",
      content: { passage: "同一个字放进不同词语里，读音可能会改变。", subs: [
        { stem: "老师教（　）我们做人的道理。", options: choices("jiāo", "jiào") },
        { stem: "这道数学题真难，我算了很久（　）也算不出。", options: choices("jiǔ", "jiū") },
      ] },
      answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "判断下列句子使用的修辞手法。",
      content: { passage: "比喻会把一种事物比作另一种；拟人会让事物像人一样行动。", subs: [
        { stem: "弯弯的月亮像一条小船挂在天上。", options: choices("比喻", "拟人") },
        { stem: "小鸟在枝头唱着欢快的歌。", options: choices("比喻", "拟人") },
      ] },
      answer: { keys: ["A", "B"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "填入正确的量词。",
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
      prompt: "阅读以下《课外兴趣班简介》，然后回答问题。",
      content: {
        passage: clubs,
        passageImage: "/questions/chinese-reading/s4-interest-clubs.jpg",
        passageImageAlt: "三位学生分别参加绘画班、围棋班和演讲班",
        passageTable: {
          columns: ["兴趣班名称", "主要内容", "核心能力培养", "适合对象", "上课时间"],
          rows: [
            ["绘画班", "学习素描、水彩画与手工制作，每月举办作品展览。", "创造力、色彩搭配能力、耐心与专注力", "喜爱美术、富有想象力的学生", "每周二 下午1:00–3:00"],
            ["围棋班", "学习围棋对弈技巧，分析棋局变化，每月参加校内比赛。", "观察力、专注力与逻辑分析能力", "喜爱思考与博弈、性格沉稳的学生", "每周三 下午2:00–4:00"],
            ["演讲班", "训练口才表达、姿态与临场应变能力，每月进行模拟演讲比赛。", "语言表达能力、自信心与应变能力", "乐于表达、思维敏捷的学生", "每周四 下午1:00–3:00"],
          ],
        },
        subs: [
          { stem: "绘画班每月举办什么活动？", options: choices("作品展览", "模拟演讲比赛", "校内围棋比赛", "模拟辩论赛") },
          { stem: "围棋班主要培养学生哪一种能力？", options: choices("色彩搭配能力", "语言表达能力", "观察力与逻辑分析能力", "手工制作能力") },
          { stem: "哪一个兴趣班最适合喜爱思考与博弈、性格沉稳的学生？", options: choices("绘画班", "围棋班", "演讲班", "三个兴趣班都一样") },
          { stem: "演讲班的上课时间是什么时候？", options: choices("每周二下午1:00–3:00", "每周三下午2:00–4:00", "每周五下午1:00–3:00", "每周四下午1:00–3:00") },
          { stem: "三个兴趣班有什么相同的地方？", options: choices("上课地点都在操场", "主要内容都是学习绘画", "每月都举办比赛或展示活动", "每周的上课时间都相同") },
        ],
      },
      answer: { keys: ["A", "C", "B", "D", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "阿明为什么愿意把雨伞借给小恩？",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "因为阿明的家就在学校旁边，走两步就到；而小恩的家比较远，所以阿明愿意把雨伞借给她。（答出「阿明家近」1分、「小恩家远」1分、「主动帮助同学」1分。）" },
    },
    {
      type: "SHORT", dimension: "READING", score: 4,
      prompt: "小恩为什么要特地带曲奇饼送给阿明？从这个举动，你看出小恩是一个怎样的人？",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "因为小恩想感谢阿明昨天把雨伞借给她。（2分）从这个举动可以看出小恩是一个懂得感恩、有礼貌、体贴别人的孩子。（2分）（人物分析言之有理即可，须有形容词＋依据。）" },
    },
    {
      type: "SHORT", dimension: "READING", score: 4,
      prompt: "妈妈说：「朋友之间，就应该互相帮助。」你赞同这句话吗？请联系自己的生活经验说一说。",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: umbrella, passageImage: "/questions/chinese-reading/s4-umbrella-friendship.jpg", passageImageAlt: "雨天放学时阿明把雨伞借给小恩" },
      answer: { rubric: "赞同。妈妈的话让我明白互相帮助的重要。例如，同学忘了带铅笔时，我会主动把自己的借给他；下次我有困难时，他也会帮我。朋友之间应该在对方需要时伸出援手。（表态1分＋理由1分＋生活例子2分。言之有理即可，例子必须具体。）" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "根据下面提供的资料，书写一段文字，说明多阅读课外书的好处。字数不少于40字。\n\n• 增加知识，开阔视野\n• 提高写作与表达能力\n• 培养专注力与耐心\n• 放松心情，带来快乐",
      content: { minWords: 40, maxWords: 1000, minimumOnly: true, lang: "zh", imageUrl: "/questions/chinese-reading/s4-reading-benefits.jpg", template: "先写总句，再选择三至四个好处逐点说明，最后写总结。" },
      answer: { rubric: "参考答案：多阅读课外书有很多好处。第一，阅读能增加我们的知识，开阔视野。第二，多读书能提高我们的写作和表达能力。此外，阅读还能培养专注力和耐心，让我们的心情更加轻松愉快。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 五年级 · UASA-style critical reading and topic-choice composition
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard5Questions(): QData[] {
  const network = passage(
    "网络的两面性",
    "如今，网络已经进入了我们生活的每一个角落。学生用网络查资料、学习新知识；大人用网络工作、购物、和朋友联系。网络让世界变得更小，让信息传播的速度越来越快。\n\n然而，网络也有它的黑暗面。一些人沉迷于网络游戏，忘记了现实生活中的责任；一些人轻易相信网络上的谣言，造成误解甚至恐慌。更严重的是，有些不法分子利用网络行骗，让许多人蒙受损失。\n\n因此，我们在使用网络时，必须保持清醒的头脑。善用网络，它就是我们的好帮手；滥用网络，它就会成为我们的绊脚石。",
  );

  return [
    single("句子「他（　）地帮助有需要的人，不求任何回报。」填入哪个词最恰当？（选褒义词）", ["自私", "慷慨", "吝啬", "冷漠"], "B", "VOCAB", 2),
    single("「他做事很（　），不多加考虑就乱下决定，常常出错。」填入哪个词最恰当？（选贬义词）", ["果断", "勇敢", "鲁莽", "积极"], "C", "VOCAB", 2),
    single("哪个成语最适合填入下面的段落？\n\n「小明在准备比赛期间，每天练习到深夜，甚至（　），只为了赢得冠军。」", ["三心二意", "废寝忘食", "好逸恶劳", "不劳而获"], "B", "VOCAB", 2),
    single("如此一来可就惹恼了河底的妖怪，他不允许任何人在河里捉鱼，否则就把捉鱼的人统统吃掉。\n\n哪个词语可以代替上面句子中的「统统」？", ["索性", "真正", "整体", "全部"], "D", "VOCAB", 2),
    single("「他们一开始（　），后来在老师的鼓励下，终于齐心协力完成了任务。」填入哪个成语最恰当？", ["废寝忘食", "分工合作", "各自为政", "通力合作"], "C", "VOCAB", 1),
    {
      type: "READING", dimension: "PHONICS", score: 2,
      prompt: "选出正确的读音。",
      content: { passage: "先读完整个句子，再判断多音字在这里表达的意思。", subs: [
        { stem: "妈妈把破了的衣服缝好了。", highlightText: "缝", options: choices("féng", "fèng") },
        { stem: "他的成绩在班上数一数二。", highlightText: "数", options: choices("shǔ", "shù") },
      ] }, answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "判断下列句子使用的修辞手法。",
      content: { passage: "选择：比喻 / 拟人 / 夸张", subs: [
        { stem: "教室里静得连一根针掉在地上都能听见。", options: choices("比喻", "拟人", "夸张") },
        { stem: "春风轻轻地抚摸着大地。", options: choices("比喻", "拟人", "夸张") },
        { stem: "弯弯的月亮像一只小船挂在天上。", options: choices("比喻", "拟人", "夸张") },
      ] }, answer: { keys: ["C", "B", "A"] },
    },
    single("修改病句。\n\n原句：通过这次活动，使我明白了团结的重要。\n\n哪一个修改最正确？", ["通过这次活动，使我明白了团结的重要。", "这次活动使我明白了团结的重要。"], "B", "GRAMMAR", 2),
    single("把陈述句改成反问句。\n\n原句：我们不能忘记老师的教导。\n\n哪一个改写最正确？", ["我们不能忘记老师的教导。", "我们怎么能忘记老师的教导呢？"], "B", "GRAMMAR", 2),
    {
      type: "READING", dimension: "VOCAB", score: 2,
      prompt: "辨析近义词和同音词，选出最恰当的词。",
      content: { passage: "相近的词，也会因搭配对象不同而有不同用法。", subs: [
        { stem: "我们要（　）时间，不要白白浪费。", options: choices("爱惜", "爱护") },
        { stem: "这个故事给了我很大的（　）。", options: choices("启示", "启事") },
      ] }, answer: { keys: ["A", "A"] },
    },
    {
      type: "READING", dimension: "READING", score: 6,
      prompt: "阅读下面的文章，然后回答问题。",
      content: {
        passage: network,
        passageImage: "/questions/chinese-reading/s5-network-balance.jpg",
        passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险",
        subs: [
          { stem: "根据文章第一自然段，网络给大人的生活带来了什么便利？", options: choices("查资料和学习新知识。", "工作、购物和与朋友联系。", "玩网络游戏和在网络上行骗。") },
          { stem: "为什么课文中说「一些人轻易相信网络上的谣言」是一件坏事？", options: choices("因为这会造成人们的误解甚至恐慌。", "因为这会让人们忘记现实生活中的责任。", "因为不法分子会利用网络来传播有用的信息。") },
          { stem: "「善用网络，它就是我们的好帮手；滥用网络，它就会成为我们的绊脚石。」句子中的「好帮手」和「绊脚石」分别指的是什么？", options: choices("网络的准时性与滞后性", "网络的普遍性与特殊性", "网络的正面作用与负面危害") },
        ],
      }, answer: { keys: ["B", "A", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "沉迷于网络游戏会给人们带来什么不良的后果？",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险" },
      answer: { rubric: "沉迷网络游戏会让人忘记现实生活中的责任，例如忘了做功课、荒废学业；也会影响视力和身体健康，耽误正事。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "作为一名小学生，我们应该如何做到在阅读网络信息时「保持清醒的头脑」？试举出一个具体的方法。",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险" },
      answer: { rubric: "看到网络上的信息不要马上相信，应该先向老师或父母求证，或查找可靠的来源核实，确认是真的才转发出去。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "「一些人不法分子利用网络行骗，让许多人蒙受损失。」\n\n上面的句子有什么语病？试将修改后的正确句子写在下面。",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: network, passageImage: "/questions/chinese-reading/s5-network-balance.jpg", passageImageAlt: "学生一边善用网络学习，一边避开游戏沉迷、谣言和诈骗风险", template: "病因是……；修改后：……" },
      answer: { rubric: "「一些人」与「不法分子」语义重复。修改：一些不法分子利用网络行骗，让许多人蒙受损失。" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 15,
      prompt: "从以下三个题目中选择一个，写一篇作文。",
      content: {
        minWords: 1, maxWords: 1000, countOnly: true, lang: "zh",
        writingChoices: [
          { key: "network", genre: "说明文", title: "网络对我们生活的影响", description: "描述网络的好处和坏处，并说说你认为怎样才是正确使用网络的方法。", icon: "🌐" },
          { key: "moved", genre: "记叙文", title: "一次令我感动的经历", description: "描述一件让你深受感动的事情，说明为什么令你感动以及你从中学到了什么。", icon: "💛" },
          { key: "dream", genre: "记叙文／说明文", title: "我的梦想", description: "介绍你的梦想是什么，为什么有这个梦想，以及你打算怎样实现它。", icon: "🚀" },
        ],
        template: "先选题，再规划开头、两个主要内容和结尾感受。",
      },
      answer: { rubric: "按所选题目与文体完成作文；评估核心要点的串联、结构完整度与表达。题目没有指定字数。" },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 六年级 · UASA readiness, evaluative reading and extended composition
// ─────────────────────────────────────────────────────────────────────────
export function chineseStandard6Questions(): QData[] {
  const seedJourney = passage(
    "一粒种子的旅程",
    "春天，一粒蒲公英的种子随风飘落，落在了一块贫瘠的土地上。那里土壤干硬，几乎没有水分。其他的种子不是被鸟儿吃掉，就是被风再次吹走。只有这粒种子，凭着顽强的生命力，悄悄地扎根。\n\n它用细小的根须，一点一点地渗透进坚硬的泥土，寻找每一滴水分，汲取每一丝养分。风雨来了，它弯下腰，却没有断；烈日当空，它低下头，却没有枯。经过漫长的等待，终于，第一抹嫩芽破土而出，在阳光下展开了稚嫩的叶片。\n\n多年以后，那块贫瘠的土地上，一片片蒲公英盛开着，黄灿灿的花朵随风摇曳，带来了生机与希望。路过的人们无不停下脚步，赞叹这一片美丽的生命奇迹。",
  );

  return [
    single("你在这里处处都要小心，免得让我牵挂。\n\n哪个词语可以代替上面句子中的「牵挂」？", ["思念", "担忧", "责怪"], "B", "VOCAB", 1),
    single("每天给的点心钱，他也舍不得花……\n\n哪项的「舍」和上面句子中的「舍」读音相同？", ["退避三舍", "寒舍", "施舍"], "C", "PHONICS", 1),
    single("哪两个字的韵母相同？", ["幼、会", "庞、红", "再、海"], "C", "PHONICS", 1),
    single("「他（　）地拒绝了别人的好意，让对方感到很难堪。」选出含有贬义的词。", ["坚定", "果断", "傲慢"], "C", "VOCAB", 1),
    single("下面哪个句子中，词语使用最为准确？", ["他谦虚地炫耀自己的成绩，让大家都印象深刻。", "她虚伪地表扬了同学，让同学感到非常鼓励。", "他谦虚地说自己还有很多不足，请大家多指教。"], "C", "VOCAB", 1),
    single("哪个句子有错别字？", ["即使面对再大的风雨，我们也决不向困难低头。", "老师鼓励我们要勇于偿试新的事物，不要害怕失败。", "操场上，同学们正在兴致勃勃地练习踢足球。"], "B", "VOCAB", 2),
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "判断下列句子的修辞手法。",
      content: { passage: "选择最能解释句子表达效果的修辞。", subs: [
        { stem: "这么简单的道理，难道你还不明白吗？", options: choices("比喻", "拟人", "夸张", "反问") },
        { stem: "他饿得能吃下一头牛。", options: choices("比喻", "拟人", "夸张", "反问") },
        { stem: "溪水哗啦啦地唱着歌，欢快地奔向远方。", options: choices("比喻", "拟人", "夸张", "反问") },
      ] }, answer: { keys: ["D", "C", "B"] },
    },
    {
      type: "READING", dimension: "GRAMMAR", score: 4,
      prompt: "选择保持原意的正确改写。",
      content: { passage: "把下面的句子按照要求改写。", subs: [
        { stem: "把「小树被大风吹倒了」改成把字句。", options: choices("小树被大风吹倒了。", "大风把小树吹倒了。") },
        { stem: "把「老师说：『我明天不来上课。』」改成转述句。", options: choices("老师说：『我明天不来上课。』", "老师说，他明天不来上课。") },
      ] }, answer: { keys: ["B", "B"] },
    },
    {
      type: "READING", dimension: "VOCAB", score: 2,
      prompt: "根据语境选择和完成成语。",
      content: { passage: "成语运用。", subs: [
        { stem: "老师讲解得（　），我们一听就懂。", options: choices("深入浅出", "囫囵吞枣", "不知所云") },
        { stem: "（　）不倦", options: choices("孜孜", "恋恋") },
        { stem: "（　）不舍", options: choices("孜孜", "恋恋") },
      ] }, answer: { keys: ["A", "A", "B"] },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "修改病句。\n\n为了防止这类事故不再发生，我们必须加强安全教育。",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", template: "为了防止……" },
      answer: { rubric: "参考：为了防止这类事故再发生，我们必须加强安全教育。删去双重否定中的「不」。" },
    },
    {
      type: "READING", dimension: "READING", score: 6,
      prompt: "阅读下面的文章，然后回答问题。",
      content: {
        passage: seedJourney,
        passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg",
        passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海",
        subs: [
          { stem: "为什么其他蒲公英种子无法在那块土地上生存？", options: choices("它们被烈日晒得枯萎了。", "它们在风雨来临时被折断了。", "它们不习惯在春天时随风飘落。", "它们不是被鸟儿吃掉，就是被风再次吹走。") },
          { stem: "课文中的蒲公英种子是如何在艰苦的环境中寻找水分和养分的？", options: choices("靠着风雨带来的大量雨水。", "依靠路过的人们为它浇水。", "用细小的根须，一点一点地渗透进坚硬的泥土。", "展开稚嫩的叶片，从阳光中直接汲取所需的养分。") },
          { stem: "「风雨来了，它弯下腰，却没有断；烈日当空，它低下头，却没有枯。」上面句子主要赞美了蒲公英种子的什么品质？", options: choices("乐于助人，不求回报", "随遇而安，听天由命", "顽强不屈，不轻言放弃", "追求美丽，渴望展示自己") },
        ],
      }, answer: { keys: ["D", "C", "C"] },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "多年以后，那块贫瘠的土地发生了什么变化？路过的人们对此有什么反应？",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "多年以后，那块贫瘠的土地上开满了一片片蒲公英，黄灿灿的花朵随风摇曳，充满生机与希望。路过的人们都停下脚步，赞叹这一片美丽的生命奇迹。" },
    },
    {
      type: "SHORT", dimension: "READING", score: 3,
      prompt: "读了这篇短文，你从蒲公英种子的成长旅程中得到了什么启示？",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "无论环境多么艰难，只要有顽强的毅力、坚持不懈、不轻言放弃，就能克服困难，创造出属于自己的美好未来。" },
    },
    {
      type: "SHORT", dimension: "GRAMMAR", score: 3,
      prompt: "试将下面句子中的「无不」改写成相同意思的词语，重新写出整个句子。\n\n「路过的人们无不停下脚步，赞叹这一片美丽的生命奇迹。」",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "zh", passage: seedJourney, passageImage: "/questions/chinese-reading/s6-dandelion-journey.jpg", passageImageAlt: "蒲公英种子在贫瘠土地扎根、发芽并开成一片花海" },
      answer: { rubric: "参考：路过的人们都停下脚步，赞叹这一片美丽的生命奇迹。" },
    },
    {
      type: "SHORT", dimension: "WRITING", score: 15,
      prompt: "从以下三个题目中选择一个，写一篇作文，字数不少过150个字。",
      content: {
        minWords: 150, maxWords: 1000, minimumOnly: true, lang: "zh",
        writingChoices: [
          { key: "tech", genre: "议论文入门", title: "科技与人情味", description: "说说科技和人情味哪个更重要，或者如何让两者共存。给出你的看法和至少两个理由。", icon: "🤖" },
          { key: "adversity", genre: "记叙文", title: "逆境中的成长", description: "描述一次你遇到困难或挫折的经历，说明你如何克服困难以及你从中得到了什么。", icon: "⛰️" },
          { key: "future-letter", genre: "书信", title: "给十年后的自己一封信", description: "想象十年后的自己，写一封信，说说你的希望、担忧和期待。", icon: "✉️" },
        ],
        template: "选定题目后，先列出开头、两个主要内容和有力量的结尾。",
      },
      answer: { rubric: "不少于150字；切题、内容具体、结构完整、表达清楚，书信题须符合格式。" },
    },
  ];
}
