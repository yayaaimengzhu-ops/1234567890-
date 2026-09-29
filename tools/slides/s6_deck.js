// 第六站 · 交易闭环 —— 文字全部取自大纲 v5 第六站原文（outline_extract.py 提取成 JSON），不增删内容
// 用法：python3 outline_extract.py ../../outline-v5.html s6 s6.json && node s6_deck.js raw.pptx s6.json && python3 fix_ppr.py raw.pptx out.pptx
const path = require('path');
const kit = require('./deck_kit');
const D = require(path.resolve(process.argv[3] || 's6.json'));
const K = kit(D, '第六站 · 交易闭环');
const { pres, C, W, M, CW, S, need, H, UL, J, cut, splitTop, tagsFor, estW, pillW, txt, para, head, bullets, note, sub, tile, chips, timeline,
  tableSlides, slide } = K;

const NAV = D.nav;
need(NAV.length === 7, 'seqbar');
const opener = (id, active) => K.opener(id, { bar: NAV, active, barOpts: { sep: '›', lastRight: true } });

// ================= 封面 =================
need(D.title.length === 3, '站名');
K.cover('第六站', 7);

// ================= 这一站：五个环节 =================
{
  const s = pres.addSlide();
  need(D.goal.length === 3 && D.goal[1][1] === 'b', 'stage-goal');
  const [ttl, v] = cut(D.goal[0][0], '：');
  const verbs = v.replace(/。$/, '').split('、');
  need(verbs.length === 5, '五个环节');
  head(s, '六', ttl);
  const sw = J(UL('x6-1', 4)[2]).split('，')[0]; // 出货预判三问
  const n = 6, gap = 0.42, nw = (CW - gap * (n - 1)) / n, y = 1.85, nh = 1.15;
  for (let i = 0; i < n; i++) {
    const x = M + i * (nw + gap), first = i === 0;
    s.addShape(S.RECTANGLE, { x, y, w: nw, h: nh, fill: { color: first ? C.dark : C.tint }, line: { color: first ? C.dark : C.line } });
    txt(s, NAV[i], { x, y: y + 0.17, w: nw, h: 0.45, fontSize: 19, bold: true, color: first ? C.onDark : C.ink, align: 'center' });
    txt(s, first ? sw : verbs[i - 1], { x, y: y + 0.64, w: nw, h: 0.38, fontSize: 14, color: first ? C.darkSub : C.ink2, align: 'center' });
    if (i < n - 1) s.addShape(S.LINE, { x: x + nw + 0.06, y: y + nh / 2, w: gap - 0.12, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
  }
  const x1 = M + nw + gap, bw = CW - nw - gap, by = y + nh + 0.2;
  s.addShape(S.RECTANGLE, { x: x1, y: by, w: bw, h: 0.5, fill: { color: C.sealSoft }, line: { color: C.sealSoft } });
  txt(s, NAV[6], { x: x1, y: by, w: bw, h: 0.5, fontSize: 15, bold: true, color: C.seal, align: 'center', valign: 'middle' });
  const rest = D.goal[2][0], sents = rest.match(/[^。]+。/g);
  need(sents && sents.length === 3 && sents.join('') === rest, 'stage-goal 分句');
  bullets(s, [[[D.goal[1][0], { bold: true }], [sents[0], {}]], sents[1], sents[2]], { x: M, y: 4.25, w: CW, h: 2.7, fontSize: 20, gap: 16 });
}

// ================= 6.1 =================
{
  const id = 'x6-1', u = UL(id, 4), s = slide(id);
  const [fl, cap] = cut(J(u[0]), '，');
  const steps = fl.split(' → ');
  need(steps.length === 9, '6.1 九步');
  timeline(s, steps, { y: 2.25, size: 18 });
  txt(s, cap, { x: M, y: 3.5, w: CW, h: 0.4, fontSize: 16, color: C.ink3, align: 'center' });
  bullets(s, [u[1], u[3]], { x: M, y: 4.6, w: CW, h: 2.3, fontSize: 21, gap: 22 });
}
{
  const id = 'x6-1', u = UL(id, 4);
  const [lead, qs] = cut(J(u[2]), '：');
  const q = qs.split(' / ');
  need(q.length === 3, '出货预判三问');
  const s = slide(id, lead);
  const cw = (CW - 0.6) / 3;
  q.forEach((t, i) => tile(s, M + i * (cw + 0.3), 1.8, cw, 2.45, { num: i + 1, numSize: 40, numH: 0.85, body: t, bodySize: 22, bodyColor: C.ink, bodyBold: true }));
  note(s, need(H(id).note, '6.1 说明'), { x: M, y: 4.6, w: CW, h: 2.05, fontSize: 17 });
}

// ================= 6.2 估价 =================
opener('x6-2', 1);
{
  const id = 'x6-2-1', s = slide(id);
  const cw = (CW - 3 * 0.2) / 4, ch = 2.35;
  UL(id, 8).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + (i % 4) * (cw + 0.2), 1.75 + Math.floor(i / 4) * (ch + 0.2), cw, ch, { num: i + 1, title: t, body: b, titleSize: 18, bodySize: 15.5 });
  });
}
{
  const id = 'x6-2-2', u = UL(id, 7), s = slide(id);
  const cw = (CW - 3 * 0.2) / 4;
  u.slice(0, 4).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 1.75, cw, 1.85, { title: t, body: b, titleSize: 17, bodySize: 15.5 });
  });
  bullets(s, [u[4], u[5]], { x: M, y: 3.85, w: CW, h: 1.2, fontSize: 18.5, gap: 12 });
  const [lb, fl] = cut(J(u[6]), '：');
  const steps = fl.split('，');
  need(steps.length === 3, '6.2.2 过渡路径');
  sub(s, lb, M, 5.2, 8);
  chips(s, steps, { x: M, y: 5.7, w: CW, h: 0.8, size: 17, hi: [2] });
}
{
  const a = 'x6-2-3', b = 'x6-2-4';
  const s = pres.addSlide();
  head(s, '6.2', H(a).title + ' · ' + H(b).title, tagsFor(a));
  const cw = (CW - 0.4) / 2;
  [[a, 4], [b, 5]].forEach(([k, n], i) => {
    const x = M + i * (cw + 0.4);
    s.addShape(S.RECTANGLE, { x, y: 1.75, w: cw, h: 4.95, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, H(k).num + ' ' + H(k).title, { x: x + 0.3, y: 1.98, w: cw - 0.6, h: 0.45, fontSize: 18, bold: true, color: C.brass });
    bullets(s, UL(k, n), { x: x + 0.3, y: 2.65, w: cw - 0.6, h: 3.95, fontSize: 18, gap: 13 });
  });
}
{
  const id = 'x6-2-5', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 20.5, gap: 14 });
}
{
  const id = 'x6-2-6', act = 'x6-2-6/课堂动作 · 盲报', s = slide(id);
  const cw = (CW - 3 * 0.2) / 4;
  UL(id, 4).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 1.75, cw, 1.95, { title: t, body: b, titleSize: 20, bodySize: 16 });
  });
  sub(s, H(act).title, M, 4.0, 8);
  const aw = (CW - 2 * 0.2) / 3;
  UL(act, 3).forEach((r, i) => tile(s, M + i * (aw + 0.2), 4.5, aw, 2.05, { num: i + 1, numSize: 22, numH: 0.5, body: r, bodySize: 18, bodyColor: C.ink }));
}
tableSlides('x6-2-7', [[0, 5], [5, 10]], { fontSize: 17.5, margin: [11, 12, 11, 12] });

// ================= 6.3 报价 =================
opener('x6-3', 2);
{
  const id = 'x6-3-1', s = slide(id);
  const cw = (CW - 4 * 0.2) / 5;
  UL(id, 5).forEach((r, i) => tile(s, M + i * (cw + 0.2), 1.95, cw, 3.8, { num: i + 1, numSize: 36, numH: 0.8, body: r, bodySize: 20.5, bodyColor: C.ink, bodyBold: true }));
}
{
  const id = 'x6-3-2', h = H(id), s = slide(id);
  para(s, need(h.intro, '6.3.2 导语'), 17, { x: M, y: 1.72, w: CW, h: 0.85 }, C.ink2, C.ink);
  const cw = (CW - 4 * 0.2) / 5, ch = 1.95;
  UL(id, 10).forEach((r, i) => tile(s, M + (i % 5) * (cw + 0.2), 2.72 + Math.floor(i / 5) * (ch + 0.2), cw, ch,
    { num: i + 1, numSize: 16, numH: 0.36, body: r, bodySize: 16.5, bodyColor: C.ink, bodyBold: true }));
}
tableSlides('x6-3-3', [[0, 5], [5, 10]], { fontSize: 17.5, margin: [11, 12, 11, 12] });

// ================= 6.4 成交 =================
opener('x6-4', 3);
{
  const id = 'x6-4-1', u = UL(id, 5), s = slide(id);
  const [fl, cap] = cut(J(u[0]), '，');
  const steps = fl.split(' → ');
  need(steps.length === 8, '6.4.1 八步');
  const bold = u[0].filter(r => r[1] === 'b').map(r => r[0].trim());
  const hi = steps.map((t, i) => (bold.includes(t) ? i : -1)).filter(i => i >= 0);
  need(hi.length === 1, '出货预判');
  const ins = cut(J(u[1]), '插在')[0]; // 来源核查和登记存证
  const ty = 2.6, st = CW / steps.length, bx = M + st * need(steps.indexOf('确认') + 1, '确认') - st;
  const pw = pillW(ins, 14) + 0.3;
  s.addShape(S.ROUNDED_RECTANGLE, { x: bx - pw / 2, y: 1.72, w: pw, h: 0.44, rectRadius: 0.06, fill: { color: C.sealSoft }, line: { color: C.sealSoft } });
  txt(s, ins, { x: bx - pw / 2, y: 1.72, w: pw, h: 0.44, fontSize: 14, bold: true, color: C.seal, align: 'center', valign: 'middle' });
  s.addShape(S.LINE, { x: bx, y: 2.18, w: 0, h: ty + 0.25 - 2.2, line: { color: C.seal, width: 1.5, endArrowType: 'triangle' } });
  timeline(s, steps, { y: ty, hi, size: 17 });
  txt(s, cap, { x: M, y: ty + 1.14, w: CW, h: 0.4, fontSize: 16, color: C.ink3, align: 'center' });
  bullets(s, u.slice(1), { x: M, y: 4.45, w: CW, h: 2.5, fontSize: 19.5, gap: 13 });
}
{
  const id = 'x6-4-2', u = UL(id, 5), s = slide(id);
  const [sc, cap] = cut(J(u[0]), '，');
  const scenes = sc.split('、');
  need(scenes.length === 4, '四种场景');
  chips(s, scenes, { x: M, y: 1.85, w: CW, h: 0.95, gap: 0.2, arrow: false, size: 20 });
  txt(s, cap, { x: M, y: 2.9, w: CW, h: 0.4, fontSize: 16, color: C.ink3 });
  bullets(s, u.slice(1), { x: M, y: 3.65, w: CW, h: 3.2, fontSize: 20.5, gap: 18 });
}
{
  const id = 'x6-4-3', s = slide(id);
  bullets(s, UL(id, 7), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 21, gap: 17 });
}
{
  const id = 'x6-4-4', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 20.5, gap: 14 });
}
{
  const id = 'x6-4-5', u = UL(id, 7), s = slide(id);
  const cw = (CW - 2 * 0.2) / 3;
  u.slice(0, 3).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 1.75, cw, 1.75, { title: t, body: b, titleSize: 20, bodySize: 17 });
  });
  bullets(s, u.slice(3), { x: M, y: 3.85, w: CW, h: 3.0, fontSize: 20, gap: 15 });
}
{
  const id = 'x6-4-6', u = UL(id, 6), s = slide(id);
  const cw = (CW - 2 * 0.2) / 3;
  u.slice(0, 3).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 1.75, cw, 1.75, { title: t, body: b, titleSize: 20, bodySize: 17 });
  });
  bullets(s, u.slice(3), { x: M, y: 3.85, w: CW, h: 3.0, fontSize: 20.5, gap: 18 });
}
{
  const id = 'x6-4-7', u = UL(id, 5), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const scams = splitTop(rest, '、');
  need(scams.length === 3, '三种骗局');
  sub(s, lb, M, 1.75, 8);
  const cw = (CW - 2 * 0.2) / 3;
  scams.forEach((t, i) => {
    const k = t.indexOf('（');
    tile(s, M + i * (cw + 0.2), 2.25, cw, 1.5, { fill: C.sealSoft, title: k > 0 ? t.slice(0, k) : t, titleColor: C.seal, titleSize: 19,
      body: k > 0 ? t.slice(k) : '', bodySize: 16, bodyColor: C.ink2 });
  });
  bullets(s, u.slice(1), { x: M, y: 4.1, w: CW, h: 2.8, fontSize: 19.5, gap: 14 });
}
{
  const id = 'x6-4-8', s = slide(id);
  bullets(s, UL(id, 6), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 21.5, gap: 20 });
}
{
  const id = 'x6-4-8/课堂动作', s = pres.addSlide();
  head(s, '6.4', H(id).title, tagsFor(id));
  const cw = (CW - 2 * 0.3) / 3;
  UL(id, 3).forEach((r, i) => tile(s, M + i * (cw + 0.3), 2.0, cw, 3.5, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}
tableSlides('x6-4-9', [[0, 7], [7, 14]], { fontSize: 16, margin: [8, 10, 8, 10] });

// ================= 6.5 出货 =================
opener('x6-5', 4);
{
  const id = 'x6-5-1', u = UL(id, 5), s = slide(id);
  bullets(s, u.slice(0, 3), { x: M, y: 1.75, w: CW, h: 1.6, fontSize: 19.5, gap: 12 });
  const [lb, fl] = cut(J(u[3]), '：');
  const cols = fl.split(' → ');
  need(cols.length === 5, '对照表五列');
  sub(s, lb, M, 3.5, 6);
  chips(s, cols, { x: M, y: 4.0, w: CW, h: 0.85, size: 18 });
  note(s, u[4], { x: M, y: 5.2, w: CW, h: 1.5, fill: C.sealSoft, fontSize: 18.5, color: C.ink, boldColor: C.ink });
}
{
  const id = 'x6-5-1/课堂动作', s = pres.addSlide();
  head(s, '6.5.1', H(id).title, tagsFor(id));
  const cw = (CW - 0.4) / 2;
  UL(id, 2).forEach((r, i) => tile(s, M + i * (cw + 0.4), 2.0, cw, 3.2, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 22, bodyColor: C.ink }));
}
{
  const id = 'x6-5-2', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 20, gap: 14 });
}
{
  const id = 'x6-5-3', s = slide(id);
  bullets(s, UL(id, 6), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 21, gap: 19 });
}
{
  const id = 'x6-5-4', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 20, gap: 14 });
}
{
  const id = 'x6-5-5', s = slide(id);
  bullets(s, UL(id, 8), { x: M, y: 1.85, w: CW, h: 5.0, fontSize: 20, gap: 14 });
}
tableSlides('x6-5-6', [[0, 6], [6, 12]], { fontSize: 17, margin: [10, 11, 10, 11] });

// ================= 6.6 复购 =================
opener('x6-6', 5);
{
  const ids = ['x6-6-1', 'x6-6-2', 'x6-6-3'], s = pres.addSlide();
  head(s, '6.6', ids.map(k => H(k).title).join(' · '), tagsFor(ids[0]));
  const cw = (CW - 2 * 0.3) / 3;
  ids.forEach((k, i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(S.RECTANGLE, { x, y: 1.75, w: cw, h: 4.95, fill: { color: C.tint }, line: { color: C.tint } });
    txt(s, H(k).num + ' ' + H(k).title, { x: x + 0.25, y: 1.98, w: cw - 0.5, h: 0.45, fontSize: 18, bold: true, color: C.brass });
    bullets(s, UL(k, 4), { x: x + 0.25, y: 2.65, w: cw - 0.5, h: 3.95, fontSize: 17.5, gap: 15 });
  });
}
{
  const id = 'x6-6-4', u = UL(id, 6), s = slide(id);
  const [lb, nums] = cut(J(u[0]), '：');
  const six = nums.split('、');
  need(six.length === 6, '六个数');
  sub(s, lb, M, 1.75, 6);
  chips(s, six, { x: M, y: 2.25, w: CW, h: 0.9, gap: 0.2, arrow: false, size: 19, hi: [0, 1, 2, 3, 4, 5] });
  bullets(s, u.slice(1), { x: M, y: 3.55, w: CW, h: 3.3, fontSize: 19.5, gap: 14 });
}
tableSlides('x6-6-5', [[0, 4], [4, 8]], { fontSize: 19, margin: [13, 11, 13, 11] });

// ================= 6.7 贯穿 =================
opener('x6-7', 6);
{
  const id = 'x6-7-1', u = UL(id, 5), s = slide(id);
  const [lb, r1] = cut(J(u[0]), '：');
  const [books, cap] = cut(r1, '，');
  const three = books.split('、');
  need(three.length === 3, '三本账');
  sub(s, lb, M, 1.75, 6);
  chips(s, three, { x: M, y: 2.25, w: 7.6, h: 0.95, gap: 0.25, arrow: false, size: 20, hi: [0, 1, 2] });
  txt(s, cap, { x: M + 7.9, y: 2.25, w: CW - 7.9, h: 0.95, fontSize: 20, color: C.ink2, valign: 'middle' });
  bullets(s, u.slice(1), { x: M, y: 3.65, w: CW, h: 3.1, fontSize: 21, gap: 19 });
}
{
  const id = 'x6-7-2', u = UL(id, 9), s = slide(id);
  const cw = (CW - 0.5) / 2;
  bullets(s, u.slice(0, 5), { x: M, y: 1.8, w: cw, h: 3.3, fontSize: 18, gap: 11 });
  bullets(s, u.slice(5), { x: M + cw + 0.5, y: 1.8, w: cw, h: 3.3, fontSize: 18, gap: 11 });
  note(s, need(H(id).note, '6.7.2 说明'), { x: M, y: 5.25, w: CW, h: 1.5, fontSize: 16.5 });
}
{
  const id = 'x6-7-3', u = UL(id, 4), s = slide(id);
  bullets(s, u.slice(0, 2), { x: M, y: 1.85, w: CW, h: 1.3, fontSize: 21, gap: 16 });
  const [lb, rest] = cut(J(u[2]), '：');
  const five = rest.split('、');
  need(five.length === 5, '五张应急卡');
  sub(s, lb, M, 3.45, CW);
  chips(s, five, { x: M, y: 3.97, w: CW, h: 1.05, gap: 0.2, arrow: false, size: 19, fill: C.sealSoft, lineColor: C.sealSoft, color: C.seal });
  bullets(s, [u[3]], { x: M, y: 5.45, w: CW, h: 0.6, fontSize: 21 });
}

// ================= 出课标准 · 交付 =================
need(D.output.length === 6 && D.deliver.length === 6, '出课标准 / 交付');
K.rowsSlide('第六站 · ' + D.output_label, null, D.output, { size: 17.5, gap: 0.3 });
K.rowsSlide('第六站 · ' + D.deliver_label, J(D.deliver_head), D.deliver, { size: 16, gap: 0.2 });

K.save(process.argv[2] || 'deck.pptx');
