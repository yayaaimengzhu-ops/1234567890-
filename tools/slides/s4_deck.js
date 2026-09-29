// 第四站 · 转化 —— 文字全部取自大纲 v5 第四站原文（outline_extract.py 提取成 JSON），不增删内容
// 用法：python3 outline_extract.py ../../outline-v5.html s4 s4.json && node s4_deck.js raw.pptx s4.json && python3 fix_ppr.py raw.pptx out.pptx
const path = require('path');
const kit = require('./deck_kit');
const D = require(path.resolve(process.argv[3] || 's4.json'));
const K = kit(D, '第四站 · 转化', { fromOnSlides: true });
const { pres, C, M, CW, need, H, UL, J, cut, dots, txt, head, bullets, note, sub, tile, chips, tableSlides, slide } = K;

// ================= 封面 =================
need(D.title.length === 2, '站名');
K.cover('第四站', 6);

// ================= 这一站 =================
{
  const s = pres.addSlide();
  need(D.goal.length === 3 && D.goal[1][1] === 'b', 'stage-goal');
  const [ttl, what] = cut(D.goal[0][0], '：');
  head(s, '四', ttl);
  txt(s, what, { x: M, y: 2.05, w: CW, h: 0.9, fontSize: 30, bold: true, valign: 'middle' });
  const sents = D.goal[2][0].match(/[^。]+。/g);
  need(sents && sents.length === 2 && sents.join('') === D.goal[2][0], 'stage-goal 分句');
  note(s, [[D.goal[1][0], 'b'], [sents[0], '']], { x: M, y: 3.45, w: CW, h: 1.45, fontSize: 21, color: C.ink2, boldColor: C.ink });
  note(s, [[sents[1], '']], { x: M, y: 5.15, w: CW, h: 1.45, fill: C.sealSoft, fontSize: 21, color: C.ink });
}

// ================= 4.1 =================
{
  const id = 'x4-1', u = UL(id, 2), s = slide(id);
  const five = J(u[0]).split('、');
  need(five.length === 5, '微信号五处');
  chips(s, five, { x: M, y: 2.3, w: CW, h: 1.1, gap: 0.2, arrow: false, size: 21 });
  txt(s, J(u[1]), { x: M, y: 4.05, w: CW, h: 1.2, fontSize: 30, bold: true, valign: 'middle' });
}

// ================= 4.2 =================
{
  const id = 'x4-2', u = UL(id, 7), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const four = rest.split('、');
  need(four.length === 4, '四类内容');
  sub(s, lb, M, 1.75, 8);
  chips(s, four, { x: M, y: 2.25, w: CW, h: 0.85, gap: 0.2, arrow: false, size: 19, hi: [0, 1, 2, 3] });
  bullets(s, u.slice(1), { x: M, y: 3.4, w: CW, h: 3.4, fontSize: 19.5, gap: 12 });
}
{
  const id = 'x4-2/朋友圈风控', s = slide(id);
  const cw = (CW - 0.6) / 3;
  UL(id, 3).forEach((r, i) => tile(s, M + i * (cw + 0.3), 1.95, cw, 3.4,
    { fill: C.sealSoft, num: i + 1, numSize: 36, numH: 0.8, numColor: C.seal, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 4.3 =================
{
  const id = 'x4-3', s = slide(id);
  bullets(s, UL(id, 5), { x: M, y: 1.9, w: CW, h: 4.8, fontSize: 21.5, gap: 22 });
}
{
  const id = 'x4-3/问诊里的风控', u = UL(id, 3), s = slide(id);
  need(u[0][0][1] === 'b', '来源异常信号');
  const [lb, rest] = cut(J(u[0]), '：');
  const [sig, cap] = cut(rest, '——');
  const six = sig.split('、');
  need(six.length === 6, '六个信号');
  sub(s, lb, M, 1.75, 8, C.seal);
  const o = { x: M, w: CW, h: 0.72, gap: 0.2, arrow: false, size: 18, fill: C.sealSoft, lineColor: C.sealSoft, color: C.seal };
  chips(s, six.slice(0, 3), Object.assign({ y: 2.25 }, o));
  chips(s, six.slice(3), Object.assign({ y: 3.12 }, o));
  txt(s, cap, { x: M, y: 3.98, w: CW, h: 0.45, fontSize: 17, color: C.ink2 });
  bullets(s, u.slice(1), { x: M, y: 4.75, w: CW, h: 1.9, fontSize: 19.5, gap: 14 });
}

// ================= 4.4（两页） =================
{
  const id = 'x4-4', u = UL(id, 7), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const [cats, cap] = cut(rest, '，');
  const four = cats.split(' / ');
  need(four.length === 4, '四个品类');
  sub(s, lb, M, 1.75, 8);
  chips(s, four, { x: M, y: 2.25, w: CW, h: 0.85, gap: 0.2, arrow: false, size: 19 });
  txt(s, cap, { x: M, y: 3.18, w: CW, h: 0.4, fontSize: 16, color: C.ink3 });
  bullets(s, u.slice(1, 5), { x: M, y: 3.8, w: CW, h: 2.9, fontSize: 20, gap: 14 });
}
{
  const id = 'x4-4', u = UL(id, 7), s = slide(id, H(id).title + '（续）');
  const cw = (CW - 0.4) / 2;
  u.slice(5).forEach((r, i) => tile(s, M + i * (cw + 0.4), 1.85, cw, 2.45, { fill: C.sealSoft, body: r, bodySize: 20, bodyColor: C.ink, top: 0.3 }));
  note(s, need(H(id).note, '4.4 说明'), { x: M, y: 4.6, w: CW, h: 1.85, fontSize: 18 });
}

// ================= 4.5 =================
{
  const id = 'x4-5', u = UL(id, 5), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const [steps, cap] = cut(rest, '，');
  const four = steps.split(' / ');
  need(four.length === 4, '跟进周期');
  sub(s, lb, M, 1.75, 8);
  chips(s, four, { x: M, y: 2.25, w: CW, h: 0.85, size: 20, hi: [0, 1, 2, 3] });
  txt(s, cap, { x: M, y: 3.18, w: CW, h: 0.4, fontSize: 16, color: C.ink3 });
  bullets(s, u.slice(1), { x: M, y: 3.8, w: CW, h: 2.9, fontSize: 20, gap: 14 });
}

// ================= 课堂动作 =================
{
  const id = 'x4-5/课堂动作 —— 讲三成，练七成', s = pres.addSlide();
  head(s, '四', H(id).title, []);
  const cw = (CW - 2 * 0.3) / 3;
  UL(id, 3).forEach((r, i) => tile(s, M + i * (cw + 0.3), 2.0, cw, 3.5, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 4.6 本站风控 =================
tableSlides('x4-6', [[0, 6], [6, 14]], { lead: true, leadSize: 17, leadH: 0.75, fontSize: 16, margin: [8, 10, 8, 10] });
{
  const id = 'x4-6/课堂动作 · 找错', s = slide(id);
  const cw = (CW - 0.4) / 2;
  UL(id, 2).forEach((r, i) => tile(s, M + i * (cw + 0.4), 2.0, cw, 3.3, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 出课标准 · 交付 =================
K.closingSlide('第四站', dots(J(D.output_head)), J(D.deliver_head), { size: 20, rowH: 1.0, deliverSize: 17 });

K.save(process.argv[2] || 'deck.pptx');
