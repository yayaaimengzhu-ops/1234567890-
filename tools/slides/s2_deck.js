// 第二站 · 获客 —— 文字全部取自大纲 v5 第二站原文（outline_extract.py 提取成 JSON），不增删内容
// 用法：python3 outline_extract.py ../../outline-v5.html s2 s2.json && node s2_deck.js raw.pptx s2.json && python3 fix_ppr.py raw.pptx out.pptx
const path = require('path');
const kit = require('./deck_kit');
const D = require(path.resolve(process.argv[3] || 's2.json'));
const K = kit(D, '第二站 · 获客');
const { pres, C, F, M, CW, S, need, H, UL, J, cut, dots, tagsFor, txt, para, head, bullets, note, sub, tile, chips, tableSlides, slide } = K;

// 五条路径：每条路一张深色开篇页，顶上的条标出当前是哪条路（并列关系，不用箭头）
const PATHS = ['x2-2', 'x2-3', 'x2-4', 'x2-5', 'x2-6'];
const BAR = PATHS.map(k => H(k).title);
const opener = id => K.opener(id, { bar: BAR, active: PATHS.indexOf(id),
  toc: k => (k.startsWith(id + '-') || k.startsWith(id + '/')) && !!(D.h[k].num || D.h[k].rk) });

// 两到三个小节并排放一页：每栏一个浅底块，上面是小节号和标题
function columns(ids, n, o) {
  const s = pres.addSlide();
  head(s, o.num, ids.map(k => H(k).title).join(' · '), tagsFor(ids[0]));
  const gap = 0.3, cw = (CW - gap * (ids.length - 1)) / ids.length;
  ids.forEach((k, i) => {
    const x = M + i * (cw + gap);
    s.addShape(S.RECTANGLE, { x, y: 1.75, w: cw, h: 4.95, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, H(k).num + ' ' + H(k).title, { x: x + 0.25, y: 1.98, w: cw - 0.5, h: 0.45, fontSize: 18, bold: true, color: C.brass });
    bullets(s, UL(k, n[i]), { x: x + 0.25, y: 2.65, w: cw - 0.5, h: 3.95, fontSize: o.fontSize, gap: o.gap || 13 });
  });
  return s;
}

// 每条路径末尾的"30 天目标"
function goalSlide(id) {
  const out = need(H(id).output, id + ' 30 天目标');
  const items = dots(J(out.runs));
  const s = pres.addSlide();
  head(s, H(id).num, out.label, tagsFor(id));
  const rowH = items.length > 4 ? 0.88 : 0.95, gap = 0.16;
  items.forEach((t, i) => {
    const y = 1.85 + i * (rowH + gap);
    s.addShape(S.RECTANGLE, { x: M, y, w: CW, h: rowH, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, String(i + 1), { x: M + 0.3, y, w: 0.6, h: rowH, fontSize: 28, bold: true, color: C.brass, valign: 'middle' });
    txt(s, t, { x: M + 1.0, y, w: CW - 1.3, h: rowH, fontSize: 22, bold: true, valign: 'middle' });
  });
  return s;
}

// ================= 封面 =================
need(D.title.length === 3, '站名');
K.cover('第二站', 8);

// ================= 这一站 =================
{
  const s = pres.addSlide();
  need(D.goal.length === 3 && D.goal[1][1] === 'b', 'stage-goal');
  head(s, '二', D.goal[0][0].replace(/。$/, ''));
  const gap = 0.2, cw = (CW - gap * 4) / 5;
  PATHS.forEach((k, i) => {
    const tag = H(k).tags.find(t => t[1] === 'core' || t[1] === 'full');
    tile(s, M + i * (cw + gap), 1.85, cw, 1.45, { num: H(k).num, numSize: 16, numH: 0.35, title: H(k).title, titleSize: 22, titleH: 0.5, titleGap: 0.02,
      body: tag ? tag[0] : '', bodySize: 14, bodyColor: C.ink3 });
  });
  const sents = D.goal[2][0].match(/[^。]+。/g);
  need(sents && sents.length === 3 && sents.join('') === D.goal[2][0], 'stage-goal 分句');
  bullets(s, [[[D.goal[1][0], { bold: true }], [sents[0], {}]], sents[1], sents[2]], { x: M, y: 3.8, w: CW, h: 3.0, fontSize: 22, gap: 24 });
}

// ================= 2.1 =================
{
  const id = 'x2-1/路径全景', t = need(H(id).table, '路径全景表'), s = slide(id, H('x2-1').title);
  need(t.head.length === 7 && t.rows.length === 5, '路径全景表 5 行 7 列');
  sub(s, H(id).title, M, 1.72, 6);
  const hd = { bold: true, fill: { color: C.brassSoft } };
  const rows = [t.head.map(x => ({ text: x, options: hd }))];
  t.rows.forEach(r => rows.push(r.map((c, j) => ({ text: c,
    options: j === 0 ? { bold: true } : j === 6 ? { color: C.seal } : j === 1 ? {} : { color: C.ink2, align: 'center' } }))));
  s.addTable(rows, { x: M, y: 2.2, w: CW, colW: [1.3, 3.15, 1.15, 0.85, 1.45, 1.65, CW - 9.55], fontFace: F, fontSize: 15.5, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: [9, 8, 9, 8], valign: 'middle' });
}
{
  const id = 'x2-1/怎么选', u = UL(id, 4), s = slide(id);
  bullets(s, u.slice(0, 3), { x: M, y: 1.9, w: CW, h: 2.6, fontSize: 21, gap: 20 });
  note(s, u[3], { x: M, y: 4.75, w: CW, h: 1.6, fill: C.sealSoft, fontSize: 20, color: C.ink, boldColor: C.ink });
}
{
  const id = 'x2-1/all in 是什么意思，不是什么意思', u = UL(id, 5), s = slide(id);
  const cw = (CW - 0.3) / 2;
  u.slice(0, 2).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.3), 1.8, cw, 1.6, { title: t, titleSize: 22, titleColor: i ? C.seal : C.brass, body: b, bodySize: 18, bodyColor: C.ink });
  });
  bullets(s, u.slice(2), { x: M, y: 3.65, w: CW, h: 1.6, fontSize: 18.5, gap: 12 });
  note(s, need(H(id).note, '2.1 说明'), { x: M, y: 5.35, w: CW, h: 1.35, fontSize: 16 });
}

// ================= 2.2 关系路径 =================
opener('x2-2');
{
  const id = 'x2-2-1', s = slide(id);
  bullets(s, UL(id, 9), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19.5, gap: 11 });
}
{
  const id = 'x2-2-2', u = UL(id, 9), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const names = rest.split('、');
  need(names.length === 15, '15 类异业');
  sub(s, lb, M, 1.72, 6);
  for (let r = 0; r < 3; r++) chips(s, names.slice(r * 5, r * 5 + 5), { x: M, y: 2.2 + r * 0.62, w: CW, h: 0.52, gap: 0.15, arrow: false, size: 16 });
  bullets(s, u.slice(1, 5), { x: M, y: 4.25, w: CW, h: 2.5, fontSize: 19.5, gap: 13 });
}
{
  const id = 'x2-2-2', u = UL(id, 9), s = slide(id, H(id).title + '（续）');
  bullets(s, u.slice(5, 7), { x: M, y: 1.95, w: CW, h: 1.2, fontSize: 21, gap: 16 });
  const cw = (CW - 0.3) / 2;
  u.slice(7).forEach((r, i) => tile(s, M + i * (cw + 0.3), 3.45, cw, 2.7, { body: r, bodySize: 21, bodyColor: C.ink, top: 0.3 }));
}
columns(['x2-2-3', 'x2-2-4'], [4, 4], { num: '2.2', fontSize: 18.5, gap: 16 });
{
  const id = 'x2-2-4/关系路径风控', s = slide(id, null, '2.2');
  bullets(s, UL(id, 7), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19, gap: 13 });
}
goalSlide('x2-2');

// ================= 2.3 内容路径 =================
opener('x2-3');
{
  const id = 'x2-3-1', s = slide(id);
  bullets(s, UL(id, 6), { x: M, y: 1.9, w: CW, h: 4.9, fontSize: 20.5, gap: 18 });
}
{
  const id = 'x2-3-2', u = UL(id, 6), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const five = rest.split('、');
  need(five.length === 5, '五类选题');
  sub(s, lb, M, 1.72, 6);
  chips(s, five, { x: M, y: 2.2, w: CW, h: 0.85, gap: 0.2, arrow: false, size: 19, hi: [0, 1, 2, 3, 4] });
  bullets(s, u.slice(1), { x: M, y: 3.4, w: CW, h: 3.4, fontSize: 19, gap: 13 });
}
{
  const id = 'x2-3-3', u = UL(id, 5), s = slide(id);
  const half = (CW - 0.5) / 2, x2 = M + half + 0.5;
  const [lb1, r1] = cut(J(u[0]), '：');
  const three = r1.split('、');
  need(three.length === 3, '三种结构');
  sub(s, lb1, M, 1.72, half);
  chips(s, three, { x: M, y: 2.2, w: half, h: 0.85, gap: 0.15, arrow: false, size: 17 });
  const [lb2, r2] = cut(J(u[1]), '：');
  const [flow, cap] = cut(r2, '，');
  const steps = flow.split(' → ');
  need(steps.length === 3, '口播脚本三段');
  sub(s, lb2, x2, 1.72, half);
  chips(s, steps, { x: x2, y: 2.2, w: half, h: 0.85, size: 18, hi: [0, 1, 2] });
  txt(s, cap, { x: x2, y: 3.13, w: half, h: 0.4, fontSize: 16, color: C.ink3 });
  bullets(s, u.slice(2), { x: M, y: 3.9, w: CW, h: 2.8, fontSize: 20, gap: 16 });
}
{
  const id = 'x2-3-4', u = UL(id, 4), s = slide(id);
  para(s, need(H(id).intro, '2.3.4 导语'), 21, { x: M, y: 1.75, w: CW, h: 0.6 }, C.ink2, C.ink);
  const cw = (CW - 3 * 0.2) / 4;
  u.forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 2.7, cw, 2.6, { title: t, titleSize: 20, titleH: 0.5, body: b, bodySize: 18.5 });
  });
}
{
  const id = 'x2-3-4/找人出镜怎么做', s = slide(id);
  bullets(s, UL(id, 7), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 18, gap: 11 });
}
{
  const id = 'x2-3-4/出镜人风险与降依赖', u = UL(id, 9), s = slide(id);
  const cw = (CW - 0.5) / 2;
  bullets(s, u.slice(0, 5), { x: M, y: 1.85, w: cw, h: 4.9, fontSize: 19.5, gap: 14 });
  bullets(s, u.slice(5), { x: M + cw + 0.5, y: 1.85, w: cw, h: 4.9, fontSize: 19.5, gap: 14 });
}
{
  const id = 'x2-3-4/自己出镜的基本功（给愿意出镜的人）', s = slide(id);
  bullets(s, UL(id, 4), { x: M, y: 1.95, w: CW, h: 4.8, fontSize: 22, gap: 24 });
}
columns(['x2-3-5', 'x2-3-6', 'x2-3-7'], [3, 5, 3], { num: '2.3', fontSize: 16.5, gap: 13 });
{
  const id = 'x2-3-8', u = UL(id, 12);
  [[0, 6], [6, 12]].forEach(([a, b], i) => {
    const s = slide(id, H(id).title + (i ? '（续）' : ''));
    bullets(s, u.slice(a, b), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19.5, gap: 17 });
  });
}
columns(['x2-3-9', 'x2-3-10'], [5, 5], { num: '2.3', fontSize: 18, gap: 14 });
goalSlide('x2-3');

// ================= 2.4 付费路径 =================
opener('x2-4');
{
  const id = 'x2-4', u = UL(id, 10), s = slide(id);
  bullets(s, u.slice(0, 3), { x: M, y: 1.85, w: CW, h: 1.6, fontSize: 20, gap: 14 });
  need(u[3][0][1] === 'b', '各投放口径速览');
  const [lb, rest] = cut(J(u[3]), '：');
  const plats = rest.split(' / ');
  need(plats.length === 7, '七个投放口径');
  txt(s, lb, { x: M, y: 3.65, w: CW, h: 0.45, fontSize: 20, bold: true });
  chips(s, plats.slice(0, 4), { x: M, y: 4.2, w: CW, h: 0.8, gap: 0.2, arrow: false, size: 17 });
  chips(s, plats.slice(4), { x: M, y: 5.15, w: CW - (CW - 0.6) / 4 - 0.2, h: 0.8, gap: 0.2, arrow: false, size: 17 });
}
{
  const id = 'x2-4', u = UL(id, 10), s = slide(id, H(id).title + '（续）');
  bullets(s, u.slice(4), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 20, gap: 17 });
}
{
  const id = 'x2-4/付费路径风控', s = slide(id);
  bullets(s, UL(id, 4), { x: M, y: 1.9, w: CW, h: 4.9, fontSize: 20, gap: 20 });
}
goalSlide('x2-4');

// ================= 2.5 本地路径 =================
opener('x2-5');
columns(['x2-5-1', 'x2-5-2'], [4, 6], { num: '2.5', fontSize: 18, gap: 13 });
columns(['x2-5-3', 'x2-5-4'], [3, 5], { num: '2.5', fontSize: 18, gap: 13 });
{
  const id = 'x2-5-4/本地路径风控', s = slide(id, null, '2.5');
  bullets(s, UL(id, 5), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19, gap: 15 });
}
goalSlide('x2-5');

// ================= 2.6 平台路径 =================
opener('x2-6');
{
  const id = 'x2-6-1', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19.5, gap: 12 });
}
columns(['x2-6-2', 'x2-6-3', 'x2-6-4'], [2, 3, 5], { num: '2.6', fontSize: 16.5, gap: 13 });
{
  const id = 'x2-6-4/平台路径风控', s = slide(id, null, '2.6');
  bullets(s, UL(id, 4), { x: M, y: 1.85, w: CW, h: 4.95, fontSize: 19.5, gap: 17 });
}
goalSlide('x2-6');

// ================= 2.7 =================
{
  const id = 'x2-7', s = slide(id);
  bullets(s, UL(id, 6), { x: M, y: 1.85, w: CW, h: 3.3, fontSize: 19, gap: 11 });
  note(s, need(H(id).note, '2.7 说明'), { x: M, y: 5.25, w: CW, h: 1.45, fontSize: 16 });
}

// ================= 2.8 本站风控 =================
tableSlides('x2-8', [[0, 4], [4, 10], [10, 16]], { lead: true, leadSize: 17, leadH: 0.75, fontSize: 16, margin: [9, 10, 9, 10] });
{
  const id = 'x2-8/课堂动作 · 找错', s = slide(id);
  const cw = (CW - 0.4) / 2;
  UL(id, 2).forEach((r, i) => tile(s, M + i * (cw + 0.4), 2.0, cw, 3.3, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 出课标准 · 交付 =================
need(D.output.length === 6, '出课标准六行');
K.rowsSlide('第二站 · ' + D.output_label, null, D.output, { size: 17, gap: 0.3, labW: 1.3 });
{
  const all = dots(J(D.deliver_head));
  K.listSlide('第二站 · ' + D.deliver_label, all[0], all.slice(1), { cols: 3, size: 16.5, rowH: 0.62 });
}

K.save(process.argv[2] || 'deck.pptx');
