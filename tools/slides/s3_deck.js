// 第三站 · 承接 —— 文字全部取自大纲 v5 第三站原文（outline_extract.py 提取成 JSON），不增删内容
// 用法：python3 outline_extract.py ../../outline-v5.html s3 s3.json && node s3_deck.js raw.pptx s3.json && python3 fix_ppr.py raw.pptx out.pptx
const path = require('path');
const kit = require('./deck_kit');
const D = require(path.resolve(process.argv[3] || 's3.json'));
const K = kit(D, '第三站 · 承接', { fromOnSlides: true });
const { pres, C, M, CW, S, need, H, UL, J, cut, dots, txt, head, bullets, note, sub, tile, chips, tableSlides, slide } = K;

// ================= 封面 =================
need(D.title.length === 2, '站名');
K.cover('第三站', 5);

// ================= 这一站 =================
{
  const s = pres.addSlide();
  need(D.goal.length === 3 && D.goal[1][1] === 'b', 'stage-goal');
  const [ttl, rest] = cut(D.goal[0][0], '。');
  head(s, '三', ttl);
  const [acts, after] = cut(rest, '——');
  const four = acts.split('、');
  need(four.length === 4, '四种来路');
  // 四条来路 → 没进微信就白费
  const cw = 1.75, gap = 0.15, cy = 1.95, ch = 1.05;
  four.forEach((t, i) => {
    const x = M + i * (cw + gap);
    s.addShape(S.RECTANGLE, { x, y: cy, w: cw, h: ch, fill: { color: C.tint }, line: { color: C.line } });
    txt(s, t, { x, y: cy, w: cw, h: ch, fontSize: 18, bold: true, align: 'center', valign: 'middle' });
  });
  const ax = M + 4 * cw + 3 * gap;
  s.addShape(S.LINE, { x: ax + 0.1, y: cy + ch / 2, w: 0.45, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
  const bx = ax + 0.7;
  s.addShape(S.RECTANGLE, { x: bx, y: cy, w: M + CW - bx, h: ch, fill: { color: C.sealSoft }, line: { color: C.sealSoft } });
  txt(s, after, { x: bx + 0.1, y: cy, w: M + CW - bx - 0.2, h: ch, fontSize: 18, bold: true, color: C.seal, align: 'center', valign: 'middle' });
  // 进了微信也不等于安全：三件事
  txt(s, D.goal[1][0], { x: M, y: 3.55, w: CW, h: 0.55, fontSize: 24, bold: true });
  const [qs, tail] = cut(D.goal[2][0].replace(/^：/, ''), '，');
  const three = qs.split('、');
  need(three.length === 3, '三件事');
  const tw = (CW - 0.6) / 3;
  three.forEach((t, i) => tile(s, M + i * (tw + 0.3), 4.3, tw, 1.5, { num: i + 1, numSize: 20, numH: 0.4, body: t, bodySize: 23, bodyColor: C.ink, bodyBold: true }));
  txt(s, tail, { x: M, y: 6.05, w: CW, h: 0.5, fontSize: 20, color: C.ink2 });
}

// ================= 3.1 =================
{
  const id = 'x3-1', u = UL(id, 5), s = slide(id);
  txt(s, J(u[0]), { x: M, y: 1.8, w: CW, h: 0.55, fontSize: 22, bold: true });
  const cw = (CW - 0.4) / 3;
  u.slice(1, 4).forEach((r, i) => {
    const [t, b] = cut(J(r), '：');
    tile(s, M + i * (cw + 0.2), 2.6, cw, 2.0, { title: t, body: b, titleSize: 20, bodySize: 17 });
  });
  note(s, u[4], { x: M, y: 4.9, w: CW, h: 1.5, fontSize: 19, color: C.ink2, boldColor: C.ink });
}
{
  const id = 'x3-1/私域号的风控', s = slide(id);
  bullets(s, UL(id, 5), { x: M, y: 1.85, w: CW, h: 4.9, fontSize: 19.5, gap: 16 });
}

// ================= 3.2 =================
{
  const id = 'x3-2', u = UL(id, 5), s = slide(id);
  const [lb, rest] = cut(J(u[0]), '：');
  const hooks = rest.split('、');
  need(hooks.length === 4, '四种钩子');
  sub(s, lb, M, 1.75, 8);
  chips(s, hooks, { x: M, y: 2.25, w: CW, h: 0.9, gap: 0.2, arrow: false, size: 19, hi: [0, 1, 2, 3] });
  bullets(s, u.slice(1, 4), { x: M, y: 3.45, w: CW, h: 1.7, fontSize: 19.5, gap: 12 });
  note(s, u[4], { x: M, y: 5.3, w: CW, h: 1.3, fill: C.sealSoft, fontSize: 18.5, color: C.ink, boldColor: C.ink });
}

// ================= 3.3 =================
{
  const id = 'x3-3', s = slide(id);
  bullets(s, UL(id, 7), { x: M, y: 1.85, w: CW, h: 4.9, fontSize: 20.5, gap: 16 });
}

// ================= 3.4（两页） =================
{
  const id = 'x3-4', u = UL(id, 7), s = slide(id);
  bullets(s, u.slice(0, 2), { x: M, y: 1.85, w: CW, h: 1.2, fontSize: 20.5, gap: 14 });
  const [lb, rest] = cut(J(u[2]), '：');
  const steps = rest.split('、');
  need(steps.length === 3, '前三十秒');
  sub(s, lb, M, 3.2, 8);
  chips(s, steps, { x: M, y: 3.7, w: CW, h: 0.9, size: 19, hi: [0, 1, 2] });
  bullets(s, [u[3]], { x: M, y: 5.0, w: CW, h: 1.0, fontSize: 20.5 });
}
{
  const id = 'x3-4', u = UL(id, 7), s = slide(id, H(id).title + '（续）');
  const [lb, rest] = cut(J(u[4]), '：');
  const tags = rest.split(' / ');
  need(tags.length === 5, '标签体系');
  const bold = u[4].filter(r => r[1] === 'b').map(r => r[0].trim());
  sub(s, lb, M, 1.75, 8);
  chips(s, tags, { x: M, y: 2.25, w: CW, h: 0.85, gap: 0.2, arrow: false, size: 18, hi: tags.map((t, i) => (bold.includes(t) ? i : -1)).filter(i => i >= 0) });
  bullets(s, [u[5]], { x: M, y: 3.35, w: CW, h: 0.6, fontSize: 19.5 });
  note(s, u[6], { x: M, y: 4.05, w: CW, h: 1.3, fill: C.sealSoft, fontSize: 18, color: C.ink, boldColor: C.ink });
  note(s, need(H(id).note, '3.4 说明'), { x: M, y: 5.5, w: CW, h: 1.15, fontSize: 16.5 });
}

// ================= 课堂动作 =================
{
  const id = 'x3-4/课堂动作', s = pres.addSlide();
  head(s, '三', H(id).title, []);
  const cw = (CW - 2 * 0.3) / 3;
  UL(id, 3).forEach((r, i) => tile(s, M + i * (cw + 0.3), 2.0, cw, 3.5, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 3.5 本站风控 =================
tableSlides('x3-5', [[0, 5], [5, 12]], { lead: true, leadSize: 17, leadH: 0.75, fontSize: 16, margin: [8, 10, 8, 10] });
{
  const id = 'x3-5/课堂动作 · 找错', s = slide(id);
  const cw = (CW - 0.4) / 2;
  UL(id, 2).forEach((r, i) => tile(s, M + i * (cw + 0.4), 2.0, cw, 3.3, { num: i + 1, numSize: 40, numH: 0.85, body: r, bodySize: 21, bodyColor: C.ink }));
}

// ================= 出课标准 · 交付 =================
K.closingSlide('第三站', dots(J(D.output_head)), J(D.deliver_head), { size: 20, rowH: 1.0, deliverSize: 18 });

K.save(process.argv[2] || 'deck.pptx');
