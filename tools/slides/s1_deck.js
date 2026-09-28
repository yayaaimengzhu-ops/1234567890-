// 第一站 · 定位 —— 按《课程大纲 v5》第一站原文排版，不增删内容
const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = '第一站 · 定位';

const F = 'Microsoft YaHei';
const C = { ink: '17231E', ink2: '4A5951', ink3: '6B7770', brass: '8F6E30', brassSoft: 'EFE7D4', seal: 'A5382A', sealSoft: 'F3DFDA',
  paper: 'FFFFFF', tint: 'F2F4EF', line: 'CBD0C6', dark: '17231E', onDark: 'F2F4EF', darkSub: 'B8C2BB' };
const W = 13.333, M = 0.6;

function txt(s, text, o) { s.addText(text, Object.assign({ fontFace: F, isTextBox: true, color: C.ink, valign: 'top', margin: 0 }, o)); }

// 每页左上角的节号方块是全篇的视觉母题
function head(s, num, title, tags) {
  s.background = { color: C.paper };
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.5, w: 0.9, h: 0.9, fill: { color: C.dark }, line: { color: C.dark } });
  txt(s, num, { x: M, y: 0.5, w: 0.9, h: 0.9, fontSize: num.length > 3 ? 17 : 22, bold: true, color: C.onDark, align: 'center', valign: 'middle' });
  let x = W - M;
  (tags || []).slice().reverse().forEach(t => {
    const risk = t.startsWith('风控') || t === '新增';
    const w = 0.3 + [...t].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 0.17 : 0.085), 0);
    x -= w;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 0.72, w, h: 0.42, rectRadius: 0.06, fill: { color: risk ? C.sealSoft : C.brassSoft }, line: { color: risk ? C.sealSoft : C.brassSoft } });
    txt(s, t, { x, y: 0.72, w, h: 0.42, fontSize: 12, color: risk ? C.seal : C.brass, align: 'center', valign: 'middle' });
    x -= 0.12;
  });
  txt(s, title, { x: M + 1.15, y: 0.5, w: x - M - 1.3, h: 0.9, fontSize: 28, bold: true, valign: 'middle', fit: 'shrink' });
}

function bullets(s, items, o) {
  const size = o.fontSize || 16;
  const arr = [];
  items.forEach((it, i) => {
    const parts = Array.isArray(it) ? it : [[it, {}]];
    parts.forEach((p, j) => {
      const opt = Object.assign({ fontFace: F, fontSize: size, color: C.ink }, p[1]);
      if (j === 0) { opt.bullet = { indent: 18 }; opt.paraSpaceAfter = o.gap == null ? 8 : o.gap; }
      if (j === parts.length - 1 && i < items.length - 1) opt.breakLine = true;
      arr.push({ text: p[0], options: opt });
    });
  });
  s.addText(arr, { x: o.x, y: o.y, w: o.w, h: o.h, fontFace: F, isTextBox: true, valign: 'top', margin: 0 });
}

function note(s, text, o) {
  s.addShape(pres.shapes.RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: C.tint }, line: { color: C.tint } });
  txt(s, text, { x: o.x + 0.25, y: o.y + 0.18, w: o.w - 0.5, h: o.h - 0.36, fontSize: o.fontSize || 13, color: C.ink2, valign: 'middle' });
}

function sub(s, text, x, y, w) { txt(s, text, { x, y, w, h: 0.4, fontSize: 17, bold: true, color: C.brass }); }

const RISK = { color: C.seal, bold: true };

// ---------- 封面 ----------
{
  const s = pres.addSlide(); s.background = { color: C.dark };
  txt(s, '二手奢侈品回收 · 全渠道全链路课程', { x: M + 0.2, y: 1.3, w: 10, h: 0.4, fontSize: 16, color: C.darkSub });
  txt(s, '第一站 · 定位', { x: M + 0.2, y: 1.9, w: 10, h: 1.1, fontSize: 54, bold: true, color: C.onDark });
  txt(s, '把认知打开，把手上的牌盘清楚', { x: M + 0.2, y: 3.1, w: 10, h: 0.6, fontSize: 26, color: 'E3C98F' });
  txt(s, '1.1 行业全景 · 1.2 认知升级 · 1.3 五种链路模式 · 1.4 算账 · 1.5 资源盘点 · 1.6 零库存与安全通道\n1.7 暂定定位 · 1.8 前 30 天 · 1.9 经营底座 · 1.10 风险地图 · 1.11 本站风控',
    { x: M + 0.2, y: 5.4, w: 12, h: 0.9, fontSize: 14, color: C.darkSub, lineSpacingMultiple: 1.3 });
}

// ---------- 这一站做三件事 ----------
{
  const s = pres.addSlide(); head(s, '一', '这一站做三件事');
  const cards = [['打开认知', '让学员知道这行远不止他以为的那一种做法'], ['盘清资源', '让他知道自己该 all in 哪条路'],
    ['摊开风险地图', '让他知道这门生意会在哪几处出事、每一处在哪一站拆']];
  const cw = (W - 2 * M - 0.6) / 3;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: cw, h: 3.0, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, String(i + 1), { x: x + 0.35, y: 2.3, w: 1, h: 0.8, fontSize: 40, bold: true, color: C.brass });
    txt(s, c[0], { x: x + 0.35, y: 3.2, w: cw - 0.7, h: 0.55, fontSize: 24, bold: true });
    txt(s, c[1], { x: x + 0.35, y: 3.85, w: cw - 0.7, h: 1.0, fontSize: 16, color: C.ink2 });
  });
  txt(s, '三件事做完，第二站的选路才有依据。', { x: M, y: 5.6, w: 12, h: 0.5, fontSize: 18, bold: true, color: C.ink });
}

// ---------- 1.1 ----------
{
  const s = pres.addSlide(); head(s, '1.1', '行业全景：货从哪来，钱从哪赚', ['填表 1.1']);
  const nodes = ['C 端卖家', '回收商', '渠道 / 同行 / 平台', 'C 端买家'];
  const nw = 2.55, gap = 0.55; let x = M;
  nodes.forEach((n, i) => {
    const me = i === 1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.85, w: nw, h: 0.85, rectRadius: 0.08, fill: { color: me ? C.dark : C.tint }, line: { color: me ? C.dark : C.line } });
    txt(s, n, { x, y: 1.85, w: nw, h: 0.85, fontSize: 17, bold: true, color: me ? C.onDark : C.ink, align: 'center', valign: 'middle' });
    if (i < nodes.length - 1) {
      s.addShape(pres.shapes.LINE, { x: x + nw + 0.08, y: 2.275, w: gap - 0.16, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
    }
    x += nw + gap;
  });
  txt(s, '一条完整的货流', { x: M, y: 2.8, w: 6, h: 0.35, fontSize: 12, color: C.ink3 });
  bullets(s, [
    '二手奢侈品行业现状：市场规模、增速、为什么这两年能做',
    '行业角色全景：回收商、鉴定师、渠道商、寄卖平台、批发档口、拍卖行、维修保养、清洗改色、上游大户',
    '每个角色赚什么钱、门槛多高、天花板在哪',
    [['我们站在回收端：', { bold: true }], ['靠差价和周转赚钱', {}]],
    '行业的季节性与周期：什么时候货多、什么时候好出'], { x: M, y: 3.45, w: W - 2 * M, h: 3.4, fontSize: 17 });
}

// ---------- 1.2 九个误解 ----------
const MYTHS = [
  ['以为不会鉴定就不能入行', '实际有三条路绕开：上游兜底、机构送检、撮合规避。会鉴定是加分项，不是入场券（第五站展开）'],
  ['以为必须自己出镜', '实际可以不露脸、可以找人出镜、可以做图文，也可以根本不走内容路径'],
  ['以为必须有店有钱', '实际零库存起步的三条路都不需要压资金'],
  ['以为短视频是唯一的路', '实际关系、付费、本地、平台四条路都能独立出单，看你手上有什么'],
  ['以为这行暴利', '实际毛利区间是多少、周转怎么吃掉毛利'],
  ['以为要做全品类', '实际先做透一个品类的人跑得最快'],
  ['以为收得越多赚得越多', '实际压货是这行最大的死因'],
  ['以为客户都想卖高价', '实际卖家的动机分四类，只有一类是价格敏感'],
  ['以为风控是做大以后的事', '实际第一单就可能碰上赃物、调包、假转账截图，出一次事就可能直接出局。所以风控不单独成站，每一站都讲这一步会在哪里出事']];
function mythSlide(from, to, part) {
  const s = pres.addSlide(); head(s, '1.2', '认知升级：你以为的，和实际的', from === 0 ? ['填表 1.2'] : ['风控 新增', '填表 1.2']);
  sub(s, '九个误解，逐个拆' + part, M, 1.65, 8);
  const rows = [[{ text: '#', options: { bold: true, color: C.ink2, fill: { color: C.brassSoft } } },
    { text: '你以为', options: { bold: true, fill: { color: C.brassSoft } } }, { text: '实际', options: { bold: true, fill: { color: C.brassSoft } } }]];
  for (let i = from; i < to; i++) {
    const r = MYTHS[i];
    rows.push([{ text: String(i + 1).padStart(2, '0'), options: { color: C.ink3 } },
      { text: r[0], options: { bold: true, color: i === 8 ? C.seal : C.ink } }, { text: r[1], options: { color: C.ink2 } }]);
  }
  s.addTable(rows, { x: M, y: 2.2, w: W - 2 * M, colW: [0.7, 3.9, W - 2 * M - 4.6], fontFace: F, fontSize: 18, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: [11, 12, 11, 12], valign: 'middle' });
  return s;
}
mythSlide(0, 5, '（1–5）');
mythSlide(5, 9, '（6–9）');

{
  const s = pres.addSlide(); head(s, '1.2', '这行真正的门槛在哪', ['填表 1.2']);
  txt(s, '不是鉴定技术，是获客能力和风险意识', { x: M, y: 1.8, w: W - 2 * M, h: 0.8, fontSize: 30, bold: true, color: C.brass });
  const cw = (W - 2 * M - 0.4) / 2;
  sub(s, '赚钱的人在赚哪几种钱', M, 2.95, cw);
  txt(s, '差价 · 周转 · 信息差 · 渠道差 · 服务费', { x: M, y: 3.45, w: cw, h: 0.9, fontSize: 18 });
  sub(s, '你可能不知道的几条路', M + cw + 0.4, 2.95, cw);
  txt(s, '居间撮合 · 代收 · 导流分成 · 做渠道商 · 鉴定服务 · 寄卖代运营 · 给同行供货', { x: M + cw + 0.4, y: 3.45, w: cw, h: 0.9, fontSize: 18 });
  note(s, '这一节是整门课的认知锚。多数人卡在门口，不是因为不会做，是因为以为自己必须先成为某种人才能开始。把这九条拆开，剩下的五站才有人愿意听下去。',
    { x: M, y: 5.0, w: W - 2 * M, h: 1.3, fontSize: 15 });
}

// ---------- 1.3 ----------
{
  const s = pres.addSlide(); head(s, '1.3', '五种链路模式，分别适合什么人', ['填表 1.3']);
  const modes = [['纯回收赚差价', '压资金，单笔利润高，吃估价能力'], ['居间撮合', '先谈好买家再收，零库存零压力，利润薄但适合起步'],
    ['寄卖代卖', '不压钱，赚佣金，回款周期长'], ['鉴定服务收费', '轻资产，靠专业变现'], ['门店零售', '重资产，靠客流和溢价，回本慢']];
  const cw = (W - 2 * M - 4 * 0.2) / 5;
  modes.forEach((m, i) => {
    const x = M + i * (cw + 0.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.8, w: cw, h: 2.6, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, m[0], { x: x + 0.2, y: 2.0, w: cw - 0.4, h: 0.5, fontSize: 18, bold: true });
    txt(s, m[1], { x: x + 0.2, y: 2.6, w: cw - 0.4, h: 1.7, fontSize: 15, color: C.ink2 });
  });
  bullets(s, [
    [['组合打法：', { bold: true }], ['回收为主，撮合和寄卖做补充，大货吃不下就转撮合', {}]],
    [['每种模式各自扛什么风险 ', { bold: true }], ['风控', RISK], ['：真假风险、压货风险、资金风险、纠纷风险分别落在谁身上——同一件货换一种模式，风险就换一个人扛', {}]]],
    { x: M, y: 4.8, w: W - 2 * M, h: 2.0, fontSize: 17, gap: 12 });
}

// ---------- 1.4 ----------
{
  const s = pres.addSlide(); head(s, '1.4', '把这门生意的账算清楚', ['填表 1.4']);
  bullets(s, ['单笔毛利怎么算：收价、出价、差价，再扣物流、鉴定费、平台手续费、退货损耗', '各品类的真实毛利区间',
    '行业基准区间：各品类的参考成交率、参考客单毛利、参考复购次数'], { x: M, y: 1.75, w: W - 2 * M, h: 1.5, fontSize: 16 });
  sub(s, '一个客户值多少钱', M, 3.3, 6);
  const f = ['成交率', '×', '客单毛利', '×', '复购次数']; let x = M;
  f.forEach(t => {
    const op = t === '×'; const w = op ? 0.5 : 2.0;
    if (!op) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.8, w, h: 0.7, rectRadius: 0.06, fill: { color: C.brassSoft }, line: { color: C.brassSoft } });
    txt(s, t, { x, y: 3.8, w, h: 0.7, fontSize: op ? 22 : 17, bold: true, color: op ? C.brass : C.ink, align: 'center', valign: 'middle' });
    x += w + 0.1;
  });
  sub(s, '月目标倒推', M, 4.85, 6);
  const chain = ['想赚多少', '成交几单', '谈几个客户', '加几个微信', '每天做几个动作'];
  const cw = 2.05; x = M;
  chain.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.35, w: cw, h: 0.7, fill: { color: i === chain.length - 1 ? C.dark : C.tint }, line: { color: i === chain.length - 1 ? C.dark : C.line } });
    txt(s, t, { x, y: 5.35, w: cw, h: 0.7, fontSize: 16, bold: true, color: i === chain.length - 1 ? C.onDark : C.ink, align: 'center', valign: 'middle' });
    if (i < chain.length - 1) s.addShape(pres.shapes.LINE, { x: x + cw + 0.04, y: 5.7, w: 0.37, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
    x += cw + 0.45;
  });
}
{
  const s = pres.addSlide(); head(s, '1.4', '把这门生意的账算清楚（续）', ['填表 1.4']);
  bullets(s, [
    '动作量按路径换算：走内容路径是发几条视频，走关系路径是打几个电话，走本地路径是跑几家店，走付费路径是花多少钱',
    [['周转率比毛利率更重要', { bold: true }]],
    '多少钱起步、第一个月这笔钱怎么花',
    [['把风险算进成本 ', { bold: true }], ['风控', RISK], ['：看走眼、退货、资金占用、登记存证和送检的成本按比例计提，不算这一项的测算表永远偏乐观', {}]]],
    { x: M, y: 1.75, w: W - 2 * M, h: 2.7, fontSize: 17, gap: 12 });
  sub(s, '课堂动作', M, 4.55, 6);
  txt(s, '现场填测算表，当场念出自己每天要完成的动作量', { x: M, y: 5.0, w: W - 2 * M, h: 0.45, fontSize: 17 });
  note(s, '基准数据必须先备好，否则新手填出来的是想象。允许按自己选的品类取值，当场标注"这是假设，结营前校准"。', { x: M, y: 5.75, w: W - 2 * M, h: 0.95 });
}

// ---------- 1.5 ----------
{
  const s = pres.addSlide(); head(s, '1.5', '我手上已经有什么 —— 八类底牌，逐项盘', ['填表 1.5A · 1.5B']);
  const cards = [['人脉存量', '通讯录、微信好友数、已加的群、老同学老同事、亲戚邻居'], ['职业与身份资产', '现在或过去的职业带来的信任度，能接触到什么人群'],
    ['线上存量资产', '已有账号、粉丝、社群、公众号、闲鱼号、朋友圈体量'], ['线下存量资产', '门店、客流、场地、库存、车'],
    ['行业关系', '金店、典当行、修表店、洗护店、名品折扣、美容院、会所、房产中介、保险、二手车、婚庆、律师、财务'],
    ['客户名单', '做过其他生意积累的客户，哪些人群和二奢重合'],
    ['地缘与圈层', '本地社群、商会、老乡会、车友会、宝妈群、业主群、健身房、宠物群、兴趣圈'],
    ['时间、资金与配合资源', '全职兼职、每天几小时、启动资金、身边有没有能帮你出镜的人']];
  const cw = (W - 2 * M - 3 * 0.2) / 4, ch = 2.45;
  cards.forEach((c, i) => {
    const x = M + (i % 4) * (cw + 0.2), y = 1.75 + Math.floor(i / 4) * (ch + 0.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, String(i + 1), { x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.45, fontSize: 20, bold: true, color: C.brass });
    txt(s, c[0], { x: x + 0.2, y: y + 0.65, w: cw - 0.4, h: 0.45, fontSize: 17, bold: true });
    txt(s, c[1], { x: x + 0.2, y: y + 1.15, w: cw - 0.4, h: ch - 1.25, fontSize: 13.5, color: C.ink2 });
  });
}
{
  const s = pres.addSlide(); head(s, '1.5', '真实性校验：把形容词换成数字', ['填表 1.5A · 1.5B']);
  const q = [['"人脉广"', '能直接打电话不尴尬的有几个？其中和二奢人群重合的有几个？上次联系是什么时候？'], ['"有行业关系"', '能直接约出来吃饭的有几家？谈过合作没有？'],
    ['"有客户名单"', '名单上有多少人？多久没联系了？还认得你吗？'], ['"有账号"', '真实粉丝多少？最近三条数据？还能不能发'], ['"有预算"', '能亏掉不影响生活的是多少？']];
  const rows = q.map(r => [{ text: r[0], options: { bold: true, color: C.brass } }, { text: '→', options: { color: C.brass, align: 'center' } }, { text: r[1], options: {} }]);
  s.addTable(rows, { x: M, y: 1.75, w: W - 2 * M, colW: [2.4, 0.5, W - 2 * M - 2.9], fontFace: F, fontSize: 16, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: [7, 10, 7, 10], valign: 'middle' });
  txt(s, '校验后重新排序，圈出经得起数字检验的三张牌', { x: M, y: 4.75, w: W - 2 * M, h: 0.5, fontSize: 19, bold: true });
  note(s, '这一节是整门课的分岔口，也是最容易自欺的一节。All in 一条真实存在的路是对的；all in 一条自以为存在的路，比分散做还危险。所以盘点必须走完校验，形容词一律换成可数的数字。',
    { x: M, y: 5.45, w: W - 2 * M, h: 1.25 });
}

// ---------- 1.6 ----------
{
  const s = pres.addSlide(); head(s, '1.6', '零库存起步路径与新手安全通道', ['填表 1.6A · 1.6B']);
  const lw = 4.2;
  sub(s, '零库存怎么起步', M, 1.75, lw);
  bullets(s, ['三条不压钱的路：居间撮合、代收、先谈好买家再收货', '第一个月只做撮合能赚到什么、赚不到什么', '什么时候可以开始压第一笔货'],
    { x: M, y: 2.25, w: lw, h: 3.2, fontSize: 15.5, gap: 10 });
  const x0 = M + lw + 0.5, rw = W - M - x0;
  sub(s, '安全通道：风险敞口随能力递增', x0, 1.75, rw);
  const st = [['第 1 阶段', '只做撮合，或只碰有小票保卡的低价品类，一律走机构鉴定或上游兜底'], ['第 2 阶段', '可自收，但单笔上限 X 元，判不准的一律送检或找同行复核'], ['第 3 阶段', '放开品类和金额，按自己的判断收']];
  st.forEach((r, i) => {
    const y = 2.3 + i * 1.02, ind = i * 0.45;
    s.addShape(pres.shapes.RECTANGLE, { x: x0 + ind, y, w: rw - ind, h: 0.88, fill: { color: i === 2 ? C.brassSoft : C.tint }, line: { color: i === 2 ? C.brassSoft : C.tint } });
    txt(s, r[0], { x: x0 + ind + 0.2, y, w: 1.3, h: 0.88, fontSize: 16, bold: true, color: C.brass, valign: 'middle' });
    txt(s, r[1], { x: x0 + ind + 1.55, y, w: rw - ind - 1.75, h: 0.88, fontSize: 14.5, valign: 'middle' });
  });
  bullets(s, ['三个阶段分别对应第五站鉴定能力的哪一级',
    [['止损线：', { bold: true, color: C.seal }], ['单笔最多亏多少、连续几单看走眼就必须停下来复盘', {}]]], { x: x0, y: 5.5, w: rw, h: 1.3, fontSize: 15.5, gap: 8 });
}

// ---------- 1.7 ----------
{
  const s = pres.addSlide(); head(s, '1.7', '给自己定位（暂定版）', ['填表 1.7A · 1.7B']);
  const cats = ['包', '表', '黄金', '珠宝', '服饰', '潮牌', '数码'];
  const cw = 1.0; let x = M;
  cats.forEach(c => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: cw, h: 0.6, rectRadius: 0.06, fill: { color: C.tint }, line: { color: C.line } });
    txt(s, c, { x, y: 1.8, w: cw, h: 0.6, fontSize: 16, bold: true, align: 'center', valign: 'middle' });
    x += cw + 0.15;
  });
  txt(s, '难度 · 利润 · 周转 · 货源量  四项对比', { x: x + 0.2, y: 1.8, w: W - M - x - 0.2, h: 0.6, fontSize: 15, color: C.brass, valign: 'middle' });
  bullets(s, ['品类怎么选：包 / 表 / 黄金 / 珠宝 / 服饰 / 潮牌 / 数码 —— 难度、利润、周转、货源量四项对比', '新手从哪个品类切入最不容易死',
    '有店还是无店、全职还是兼职', '人设方向：鉴定师、回收老板、本地上门服务，选一个别混着做', '区域定位：只做本地，还是接全国邮寄'],
    { x: M, y: 2.75, w: W - 2 * M, h: 2.9, fontSize: 17, gap: 10 });
  note(s, '这一节做的是暂定假设。学员此刻还不知道各品类的鉴定难度（第五站）和出货难度（第六站出货环节），现在锁死必然选错。结营前会带着后五站的信息回来重填。',
    { x: M, y: 5.75, w: W - 2 * M, h: 1.0 });
}

// ---------- 1.8 ----------
{
  const s = pres.addSlide(); head(s, '1.8', '前 30 天你会遇到什么', ['填表 1.8']);
  txt(s, '真实节奏：前两周大概率没单、发的东西没反馈、加的人不回消息', { x: M, y: 1.8, w: W - 2 * M, h: 0.5, fontSize: 19, bold: true });
  sub(s, '会遇到的四件事', M, 2.65, 6);
  const four = ['同行套价', '客户放鸽子', '报价被嫌低', '第一次看走眼'];
  const cw = (W - 2 * M - 3 * 0.25) / 4;
  four.forEach((t, i) => {
    const x = M + i * (cw + 0.25);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.15, w: cw, h: 1.1, fill: { color: i === 3 ? C.sealSoft : C.tint }, line: { color: i === 3 ? C.sealSoft : C.tint } });
    txt(s, t, { x, y: 3.15, w: cw, h: 1.1, fontSize: 19, bold: true, color: i === 3 ? C.seal : C.ink, align: 'center', valign: 'middle' });
  });
  bullets(s, ['什么时候该坚持、什么时候该换打法：三个可量化的判断口径', '不同路径的第一单通常在第几天来——预期要分路径给'],
    { x: M, y: 4.7, w: W - 2 * M, h: 1.6, fontSize: 17, gap: 12 });
}

// ---------- 1.9 ----------
{
  const s = pres.addSlide(); head(s, '1.9', '经营底座：主体、账户、协议与合伙', ['风控 迁自 8.3 · 8.6 · 8.8', '填表 1.9A–C']);
  const cw = (W - 2 * M - 0.4) / 2;
  sub(s, '主体与资质', M, 1.75, cw);
  bullets(s, ['个体户还是公司，什么阶段该注册，各自的税负差异', '经营范围怎么写，旧货经营需要什么资质', '旧货经营的登记与备案要求（按当地规定核实）', '什么阶段该找代账、找什么样的'],
    { x: M, y: 2.25, w: cw, h: 3.3, fontSize: 15.5, gap: 10 });
  const x2 = M + cw + 0.4;
  sub(s, '账户', x2, 1.75, cw);
  bullets(s, ['私账公账分开，为什么必须分', '收货付款、出货收款、个人生活三个账户分开，起步第一天就分——混在一起，流水说不清，账也算不清'],
    { x: x2, y: 2.25, w: cw, h: 2.0, fontSize: 15.5, gap: 10 });
  const acc = ['收货付款', '出货收款', '个人生活']; const aw = (cw - 0.4) / 3;
  acc.forEach((a, i) => {
    const x = x2 + i * (aw + 0.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.55, w: aw, h: 0.8, fill: { color: C.dark }, line: { color: C.dark } });
    txt(s, a, { x, y: 4.55, w: aw, h: 0.8, fontSize: 16, bold: true, color: C.onDark, align: 'center', valign: 'middle' });
  });
  txt(s, '三个账户分开', { x: x2, y: 5.45, w: cw, h: 0.35, fontSize: 12, color: C.ink3 });
}
{
  const s = pres.addSlide(); head(s, '1.9', '经营底座（续）：协议总览与合伙', ['风控 迁自 8.3 · 8.6 · 8.8', '填表 1.9A–C']);
  const cw = (W - 2 * M - 0.4) / 2;
  sub(s, '协议总览', M, 1.75, cw);
  bullets(s, ['这门生意要签的八份协议：回收、寄卖、代收撮合（6.4.5）、异业（2.2.2）、上游（5.2）、出镜人（2.3.4）、员工（6.7.2）、合伙（本节）——每份在它发生的那一站讲、那一站现场填',
    '什么情况必须签、什么情况口头也行、签了怎么保管'], { x: M, y: 2.25, w: cw, h: 2.9, fontSize: 15, gap: 10 });
  const x2 = M + cw + 0.4;
  sub(s, '合伙', x2, 1.75, cw);
  bullets(s, ['合伙人风险：出资、决策权、退出机制、闹掰了货和客户怎么分', '合伙协议：出资、分工、分成、退出机制——逐条讲关键点和常见坑，现场填自己的信息',
    '亲友合伙最容易碍于情面不签，而闹掰时最伤的也是这一种'], { x: x2, y: 2.25, w: cw, h: 2.9, fontSize: 15, gap: 10 });
  note(s, '这一节只讲起步时就要定下来的底座。三本账、发票、流水要等有了交易才挂得住，放在第六站 6.7.1。涉及法律和税务的内容讲的是风险意识和常见做法，具体条款以当地规定和律师、会计的意见为准。',
    { x: M, y: 5.35, w: W - 2 * M, h: 1.3 });
}

// ---------- 1.10 ----------
{
  const s = pres.addSlide(); head(s, '1.10', '风险地图：这门生意会在哪里出事', ['风控 新增 · 迁自 8.1', '填表 1.10']);
  const R = [['真假与品相', '收到高仿；翻新、改装货按原厂价收进来', '第五站'], ['货品来源', '收到赃物、抵押货、离婚纠纷货，货被扣、钱追不回', '第四站看信号 · 第六站成交环节核查'],
    ['定价与库存', '估高了；收了出不掉，压货', '第六站估价、出货环节'], ['交易与资金', '调包、假转账截图、账期收不回', '第六站成交、出货环节'],
    ['平台与内容', '违禁词限流、虚假宣传被投诉、封号', '第二站 · 第三站 · 第四站'], ['合同与纠纷', '口头约定扯皮、卖家反悔、被起诉', '各站协议 · 第六站 6.7.3'],
    ['税务与合规', '大额流水被冻卡、收货没有进项凭证', '本站 1.9 · 第六站 6.7.1'], ['用人与合作', '出镜人带走粉丝、员工私收私卖、上游跑路、异业跳单', '本站 1.9 · 第二、三、五站 · 第六站 6.7.2'],
    ['人身与资产', '上门收货遇险、现金被抢、邮寄丢件', '第六站成交、出货环节']];
  const hd = o => ({ bold: true, fill: { color: C.brassSoft } });
  const rows = [[{ text: '风险', options: hd() }, { text: '典型事故', options: hd() }, { text: '在哪一站拆', options: hd() }]]
    .concat(R.map(r => [{ text: r[0], options: { bold: true } }, { text: r[1], options: { color: C.ink2 } }, { text: r[2], options: { color: C.brass } }]));
  s.addTable(rows, { x: M, y: 1.7, w: W - 2 * M, colW: [2.1, 5.8, W - 2 * M - 7.9], fontFace: F, fontSize: 15, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: [4, 8, 4, 8], valign: 'middle' });
}
{
  const s = pres.addSlide(); head(s, '1.10', '风险地图：怎么读', ['风控 新增 · 迁自 8.1', '填表 1.10']);
  const sev = ['亏钱', '封号', '摊上官司'];
  const cw = 2.6;
  sub(s, '严重度排序：哪些会亏钱、哪些会封号、哪些会摊上官司', M, 1.75, W - 2 * M);
  sev.forEach((t, i) => {
    const x = M + i * (cw + 0.25);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.3, w: cw, h: 0.8, fill: { color: [C.tint, C.brassSoft, C.sealSoft][i] }, line: { color: [C.tint, C.brassSoft, C.sealSoft][i] } });
    txt(s, t, { x, y: 2.3, w: cw, h: 0.8, fontSize: 19, bold: true, color: [C.ink, C.brass, C.seal][i], align: 'center', valign: 'middle' });
  });
  sub(s, '每站末尾的"本站风控"怎么读', M, 3.45, W - 2 * M);
  const steps = ['错误做法', '最坏会怎样', '怎么防']; let x = M;
  steps.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.95, w: 2.6, h: 0.75, fill: { color: C.dark }, line: { color: C.dark } });
    txt(s, t, { x, y: 3.95, w: 2.6, h: 0.75, fontSize: 17, bold: true, color: C.onDark, align: 'center', valign: 'middle' });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: x + 2.66, y: 4.325, w: 0.33, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
    x += 3.05;
  });
  txt(s, '不只讲怎么防，更讲防不住会怎样——新手不重视登记和合同，多半是因为没人告诉过他最坏情况长什么样', { x: M, y: 4.85, w: W - 2 * M, h: 0.5, fontSize: 15, color: C.ink2 });
  note(s, '这一节只摊地图，不展开。展开放在每一站末尾：学员在哪一步做事，就在哪一步学这一步的错。集中讲的时候学员没有挂靠对象，用的时候又想不起来——这是取消第八站的原因。全部红线的汇总表和自查表放在结营 7.3。',
    { x: M, y: 5.55, w: W - 2 * M, h: 1.2 });
}

// ---------- 1.11 ----------
const ERR = [
  ['看别人哪条路火就跟哪条', '没有那条路要的资源，三个月零产出，钱和信心一起耗光', '按 1.5 校验过的三张牌选路'],
  ['把形容词当资源："我人脉广""我有客户"', 'all in 一条不存在的路，比分散做还危险', '过真实性校验，形容词一律换成数字（1.5）'],
  ['一上来做全品类', '每类都判不准、估不准、出不掉，看走眼的概率成倍放大', '先做透一个品类（1.7）'],
  ['新手从高价腕表、彩宝玉石、文玩字画切入', '一单看走眼就是几个月的利润', '按品类风险排序选（5.7），走安全通道（1.6）'],
  ['先租店、装修、囤货，再找客户', '固定成本和库存压死现金流，没开张先亏', '零库存起步，门店是跑通之后的事（1.6）'],
  ['只算差价，不算周转、损耗和风险', '账面赚钱，实际亏钱', '全口径算账，风险成本按比例计提（1.4）'],
  ['没写止损线就开始收货', '一单大货直接出局，连续亏损停不下来', '签下止损线与风险敞口确认单（1.6）'],
  ['跳过安全通道，第一个月就自收大单', '单笔损失超过承受能力', '按三个阶段放开敞口（1.6）'],
  ['鉴定师、回收老板、上门服务几个人设混着做', '客户记不住你是谁，信任建立不起来', '选一个人设（1.7）'],
  ['个人账户大额收付，公私混用', '流水异常被银行风控冻卡，税务说不清', '起步就分账（1.9）'],
  ['和亲友合伙不签协议', '闹掰时货、客户、账号分不清，生意和关系一起没了', '先签合伙协议再开工（1.9）'],
  ['把 all in 当成押上身家', '输一次就没有第二次', 'all in 的是时间和注意力，预算只动"亏掉不影响生活"的那部分（1.5）'],
  ['暂定定位当成最终答案，或者三天一换', '前者选错了不回头，后者永远在起步', '暂定 → 结营校准 → 30 天数据验证（1.7、7.2）']];
function errSlide(from, to, first) {
  const s = pres.addSlide(); head(s, '1.11', '本站风控：定位阶段最常见的错' + (first ? '' : '（续）'), ['风控 新增', '填表 1.11']);
  let y = 1.7;
  if (first) {
    txt(s, '定位错了，后面每一站都在错的方向上用力。这一站的错大多不会当场亏钱，而是三个月后才显形。', { x: M, y: 1.65, w: W - 2 * M, h: 0.45, fontSize: 15, color: C.ink2 });
    y = 2.2;
  }
  const hd = { bold: true, fill: { color: C.brassSoft } };
  const rows = [[{ text: '#', options: hd }, { text: '常见错误', options: hd }, { text: '最坏会怎样', options: hd }, { text: '怎么防', options: hd }]];
  for (let i = from; i < to; i++) {
    const r = ERR[i];
    rows.push([{ text: String(i + 1).padStart(2, '0'), options: { color: C.ink3 } }, { text: r[0], options: { bold: true } },
      { text: r[1], options: { color: C.seal } }, { text: r[2], options: { color: C.ink2 } }]);
  }
  s.addTable(rows, { x: M, y, w: W - 2 * M, colW: [0.6, 3.9, 3.9, W - 2 * M - 8.4], fontFace: F, fontSize: 14.5, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: [7, 8, 7, 8], valign: 'middle' });
  return s;
}
errSlide(0, 7, true);
errSlide(7, 13, false);
{
  const s = pres.addSlide(); head(s, '1.11', '课堂动作 · 找错', ['风控 新增', '填表 1.11']);
  const acts = ['给五个学员画像（资源、资金、打算），每人找出每个画像里的定位错误，并说出该改成什么', '自己的定位方案两两交换，互相挑错，挑出来的写进自己的风险地图'];
  const cw = (W - 2 * M - 0.4) / 2;
  acts.forEach((a, i) => {
    const x = M + i * (cw + 0.4);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: cw, h: 3.2, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, String(i + 1), { x: x + 0.35, y: 2.3, w: 1, h: 0.8, fontSize: 40, bold: true, color: C.brass });
    txt(s, a, { x: x + 0.35, y: 3.25, w: cw - 0.7, h: 1.8, fontSize: 19 });
  });
}

// ---------- 出课标准与交付 ----------
{
  const s = pres.addSlide(); s.background = { color: C.dark };
  txt(s, '第一站 · 出课标准', { x: M, y: 0.55, w: 10, h: 0.7, fontSize: 30, bold: true, color: C.onDark });
  const std = ['校验过的资源盘点表（圈出经得起数字检验的三张牌）', '填完的测算表（含风险成本）', '一条暂定的起步路径',
    '写下止损线和第一阶段风险敞口的确认单', '经营主体与分账方案', '一张标出自己最可能踩的三类风险的风险地图'];
  const cw = (W - 2 * M - 0.4) / 2;
  std.forEach((t, i) => {
    const x = M + (i % 2) * (cw + 0.4), y = 1.5 + Math.floor(i / 2) * 0.85;
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.13, w: 0.36, h: 0.36, fill: { color: 'E3C98F' }, line: { color: 'E3C98F' } });
    txt(s, String(i + 1), { x, y: y + 0.13, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: C.dark, align: 'center', valign: 'middle' });
    txt(s, t, { x: x + 0.55, y, w: cw - 0.6, h: 0.62, fontSize: 16, color: C.onDark, valign: 'middle' });
  });
  txt(s, '交付', { x: M, y: 4.25, w: 3, h: 0.45, fontSize: 18, bold: true, color: 'E3C98F' });
  txt(s, '定位诊断表（17 张可填写的表，含下列各表）· 行业链路图 · 认知升级对照表（九个误解） · 资源盘点表与校验清单 · 单店测算表（含行业基准区间与风险成本）· 品类对比表 · 新手安全通道路线图 · 前 30 天分路径预期表 · 全课风险地图 · 八份协议总览 · 合伙协议模板 · 税务合规要点手册（主体与资质篇）· 定位错误清单',
    { x: M, y: 4.8, w: W - 2 * M, h: 1.9, fontSize: 15, color: C.darkSub, lineSpacingMultiple: 1.35 });
}

pres.writeFile({ fileName: process.argv[2] || 'deck.pptx' }).then(f => console.log('written', f));
