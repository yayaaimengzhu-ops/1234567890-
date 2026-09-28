// 第六站 · 交易闭环 —— 文字全部取自大纲 v5 第六站原文（outline_extract.py 提取成 JSON），不增删内容
// 用法：python3 outline_extract.py ../../outline-v5.html s6 s6.json && node s6_deck.js raw.pptx s6.json && python3 fix_ppr.py raw.pptx out.pptx
const path = require('path');
const pptxgen = require('pptxgenjs');
const D = require(path.resolve(process.argv[3] || 's6.json'));

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = '第六站 · 交易闭环';

const F = 'Microsoft YaHei';
const C = { ink: '17231E', ink2: '4A5951', ink3: '6B7770', brass: '8F6E30', brassSoft: 'EFE7D4', seal: 'A5382A', sealSoft: 'F3DFDA',
  paper: 'FFFFFF', tint: 'F2F4EF', line: 'CBD0C6', dark: '17231E', onDark: 'F2F4EF', darkSub: 'B8C2BB', gold: 'E3C98F',
  darkChip: '26352E', darkLine: '3A4A42', darkRisk: '4B2A24', riskOnDark: 'F0B4A6' };
const W = 13.333, M = 0.6, CW = W - 2 * M;
const S = pres.shapes;

// ---------- 取字：大纲结构变了就直接报错，不悄悄漏字 ----------
function need(ok, msg) { if (!ok) throw new Error('大纲结构和脚本对不上：' + msg); return ok; }
function H(id) { return need(D.h[id], id); }
function UL(id, n) {
  const u = H(id).ul;
  if (n != null) need(u.length === n, id + ' 应有 ' + n + ' 条，实际 ' + u.length);
  return u;
}
const J = runs => runs.map(r => r[0]).join('');
function cut(t, sep) { const i = t.indexOf(sep); need(i > 0, '"' + t + '" 里找不到 "' + sep + '"'); return [t.slice(0, i), t.slice(i + sep.length)]; }
function splitTop(t, sep) { // 括号里的顿号不拆
  const out = []; let d = 0, cur = '';
  for (const ch of t) {
    if (ch === '（' || ch === '(') d++;
    if (ch === '）' || ch === ')') d--;
    if (ch === sep && d === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}
const sec = id => id.split('-').slice(0, 2).join('-'); // x6-4-3 → x6-4
function tagOf(id) { const t = H(id).tags.filter(x => x[1] !== 'from').map(x => x[0]); return t.length ? t.join(' ') : null; }
function tagsFor(id) { return [tagOf(id), H(sec(id)).tref].filter(Boolean); }

// ---------- 排版 ----------
const isWide = ch => ch.charCodeAt(0) > 0x2e80;
function estW(t, size) { return [...t].reduce((a, ch) => a + (isWide(ch) ? 1 : 0.56), 0) * size / 72; }
function fitSize(t, w, size, min) { while (size > min && estW(t, size) > w) size -= 1; return size; }
function pillW(t, size) { return estW(t, size) + 0.3; }

function parts(runs, base) {
  return runs.map(([t, st]) => {
    const o = {};
    if (st === 'b') o.bold = true;
    if (st === 'risk' || st === 'new') Object.assign(o, { bold: true, color: C.seal });
    if (st === 'mv' || st === 'from') Object.assign(o, { color: C.ink3, fontSize: Math.round(base * 0.78) });
    return [t, o];
  });
}
function toParts(it, size) {
  if (typeof it === 'string') return [[it, {}]];
  if (it.length && typeof it[0][1] === 'string') return parts(it, size);
  return it;
}
function rich(ps, size, color, boldColor, extra) {
  return ps.map(([t, o]) => {
    const opt = Object.assign({ fontFace: F, fontSize: size, color }, extra || {}, o);
    if (o.bold && !o.color && boldColor) opt.color = boldColor;
    return { text: t, options: opt };
  });
}
function txt(s, text, o) { s.addText(text, Object.assign({ fontFace: F, isTextBox: true, color: C.ink, valign: 'top', margin: 0 }, o)); }
function para(s, runs, size, box, color, boldColor, extra) {
  s.addText(rich(toParts(runs, size), size, color || C.ink, boldColor, extra), Object.assign({ fontFace: F, isTextBox: true, valign: 'top', margin: 0 }, box));
}

// 每页左上角的节号方块是全篇的视觉母题
function head(s, num, title, tags) {
  s.background = { color: C.paper };
  s.addShape(S.RECTANGLE, { x: M, y: 0.5, w: 0.9, h: 0.9, fill: { color: C.dark }, line: { color: C.dark } });
  txt(s, num, { x: M, y: 0.5, w: 0.9, h: 0.9, fontSize: num.length > 3 ? 17 : 22, bold: true, color: C.onDark, align: 'center', valign: 'middle' });
  let x = W - M;
  (tags || []).filter(Boolean).slice().reverse().forEach(t => {
    const risk = t.startsWith('风控') || t === '新增';
    const w = pillW(t, 12);
    x -= w;
    s.addShape(S.ROUNDED_RECTANGLE, { x, y: 0.72, w, h: 0.42, rectRadius: 0.06, fill: { color: risk ? C.sealSoft : C.brassSoft }, line: { color: risk ? C.sealSoft : C.brassSoft } });
    txt(s, t, { x, y: 0.72, w, h: 0.42, fontSize: 12, color: risk ? C.seal : C.brass, align: 'center', valign: 'middle' });
    x -= 0.12;
  });
  const tw = x - M - 1.3;
  txt(s, title, { x: M + 1.15, y: 0.5, w: tw, h: 0.9, fontSize: fitSize(title, tw - 0.1, 28, 20), bold: true, valign: 'middle' });
}

function bullets(s, items, o) {
  const size = o.fontSize || 16;
  const arr = [];
  items.forEach((it, i) => {
    const ps = toParts(it, size);
    ps.forEach((p, j) => {
      const opt = Object.assign({ fontFace: F, fontSize: size, color: o.color || C.ink }, p[1]);
      if (j === 0) { opt.bullet = { indent: 18 }; opt.paraSpaceAfter = o.gap == null ? 8 : o.gap; }
      if (j === ps.length - 1 && i < items.length - 1) opt.breakLine = true;
      arr.push({ text: p[0], options: opt });
    });
  });
  s.addText(arr, { x: o.x, y: o.y, w: o.w, h: o.h, fontFace: F, isTextBox: true, valign: 'top', margin: 0 });
}

function note(s, content, o) {
  const fill = o.fill || C.tint;
  s.addShape(S.RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: fill }, line: { color: fill } });
  const size = o.fontSize || 14;
  const box = { x: o.x + 0.25, y: o.y + 0.15, w: o.w - 0.5, h: o.h - 0.3, valign: 'middle', lineSpacingMultiple: 1.15 };
  if (typeof content === 'string') txt(s, content, Object.assign({ fontSize: size, color: o.color || C.ink2 }, box));
  else para(s, content, size, box, o.color || C.ink2, o.boldColor || C.ink);
}

function sub(s, text, x, y, w, color) { txt(s, text, { x, y, w, h: 0.4, fontSize: 17, bold: true, color: color || C.brass }); }

// 浅底方块：可选序号、标题、正文
function tile(s, x, y, w, h, o) {
  const fill = o.fill || C.tint;
  s.addShape(S.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill } });
  const px = o.pad == null ? 0.22 : o.pad;
  let yy = y + (o.top == null ? 0.2 : o.top);
  if (o.num != null) {
    const nh = o.numH || 0.45;
    txt(s, String(o.num), { x: x + px, y: yy, w: w - 2 * px, h: nh, fontSize: o.numSize || 18, bold: true, color: o.numColor || C.brass });
    yy += nh + 0.05;
  }
  if (o.title != null) {
    const th = o.titleH || 0.45;
    txt(s, o.title, { x: x + px, y: yy, w: w - 2 * px, h: th, fontSize: o.titleSize || 17, bold: true, color: o.titleColor || C.ink });
    yy += th + (o.titleGap == null ? 0.08 : o.titleGap);
  }
  if (o.body != null && o.body !== '') {
    const size = o.bodySize || 14;
    const box = { x: x + px, y: yy, w: w - 2 * px, h: y + h - yy - 0.12, valign: 'top' };
    const extra = o.bodyBold ? { bold: true } : null;
    let body = o.body;
    if (Array.isArray(body) && body.length > 1 && body[body.length - 1][1] === 'mv') {
      body = parts(body, size);
      const k = body.length - 2;
      body[k] = [body[k][0].replace(/\s+$/, ''), Object.assign({}, body[k][1], { breakLine: true })];
    }
    if (typeof body === 'string') txt(s, body, Object.assign({ fontSize: size, color: o.bodyColor || C.ink2 }, extra || {}, box));
    else para(s, body, size, box, o.bodyColor || C.ink2, o.bodyBoldColor || C.ink, extra);
  }
}

// 一排方块，arrow 为真时中间画箭头（流程）
function chips(s, list, o) {
  const n = list.length, gap = o.gap == null ? 0.45 : o.gap, arrow = o.arrow !== false;
  const cw = (o.w - gap * (n - 1)) / n;
  let x = o.x;
  list.forEach((t, i) => {
    const hi = (o.hi || []).includes(i);
    const fill = hi ? (o.hiFill || C.dark) : (o.fill || C.tint);
    s.addShape(S.RECTANGLE, { x, y: o.y, w: cw, h: o.h, fill: { color: fill }, line: { color: hi ? fill : (o.lineColor || C.line) } });
    txt(s, t, { x: x + 0.08, y: o.y, w: cw - 0.16, h: o.h, fontSize: o.size || 16, bold: true, color: hi ? (o.hiColor || C.onDark) : (o.color || C.ink), align: 'center', valign: 'middle' });
    if (arrow && i < n - 1) s.addShape(S.LINE, { x: x + cw + 0.06, y: o.y + o.h / 2, w: gap - 0.12, h: 0, line: { color: C.brass, width: 2, endArrowType: 'triangle' } });
    x += cw + gap;
  });
}

// 编号圆点连成一条线：步骤多的流程用
function timeline(s, steps, o) {
  const n = steps.length, st = CW / n, d = 0.5, cy = o.y + d / 2;
  s.addShape(S.LINE, { x: M + st / 2, y: cy, w: st * (n - 1), h: 0, line: { color: C.line, width: 2 } });
  steps.forEach((t, i) => {
    const cx = M + st * i + st / 2, hi = (o.hi || []).includes(i), col = hi ? C.brass : C.dark;
    s.addShape(S.OVAL, { x: cx - d / 2, y: o.y, w: d, h: d, fill: { color: col }, line: { color: col } });
    txt(s, String(i + 1), { x: cx - d / 2, y: o.y, w: d, h: d, fontSize: 13, bold: true, color: C.onDark, align: 'center', valign: 'middle' });
    txt(s, t, { x: M + st * i, y: o.y + d + 0.12, w: st, h: 0.45, fontSize: o.size || 16, bold: true, color: hi ? C.brass : C.ink, align: 'center' });
  });
}

function riskTable(s, id, from, to, o) {
  const t = need(H(id).table, id + ' 没有表');
  const hd = { bold: true, fill: { color: C.brassSoft } };
  const rows = [t.head.map(x => ({ text: x, options: hd }))];
  t.rows.slice(from, to).forEach(r => {
    need(r.length === 4, id + ' 表格列数');
    rows.push([{ text: r[0], options: { color: C.ink3 } }, { text: r[1], options: { bold: true } },
      { text: r[2], options: { color: C.seal } }, { text: r[3], options: { color: C.ink2 } }]);
  });
  s.addTable(rows, { x: M, y: o.y || 1.75, w: CW, colW: [0.8, 3.8, 3.9, CW - 8.5], fontFace: F, fontSize: o.fontSize, color: C.ink,
    border: { type: 'solid', pt: 0.75, color: C.line }, margin: o.margin, valign: 'middle' });
}
function tableSlides(id, splits, o) {
  need(splits[0][0] === 0 && splits[splits.length - 1][1] === H(id).table.rows.length, id + ' 表格行数');
  splits.forEach(([a, b], i) => {
    const s = pres.addSlide();
    head(s, H(id).num, H(id).title + (i ? '（续）' : ''), tagsFor(id));
    riskTable(s, id, a, b, o);
  });
}

function slide(id, title) { const s = pres.addSlide(); head(s, H(id).num, title || H(id).title, tagsFor(id)); return s; }

// ---------- 环节条与环节开篇页（深色） ----------
const NAV = D.nav;
need(NAV.length === 7, 'seqbar');
function stepBar(s, active) {
  let x = M;
  const y = 0.55, hh = 0.42, size = 13;
  NAV.forEach((t, i) => {
    const on = i === active, risk = i === NAV.length - 1;
    const w = estW(t, size) + 0.45;
    if (risk) x = W - M - w; // 贯穿放在最右
    const fill = on ? (risk ? C.sealSoft : C.gold) : C.darkChip;
    s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h: hh, rectRadius: 0.06, fill: { color: fill }, line: { color: on ? fill : C.darkLine } });
    txt(s, t, { x, y, w, h: hh, fontSize: size, bold: on, color: on ? (risk ? C.seal : C.dark) : C.darkSub, align: 'center', valign: 'middle' });
    x += w;
    if (i < NAV.length - 2) { txt(s, '›', { x, y, w: 0.3, h: hh, fontSize: 14, color: C.darkSub, align: 'center', valign: 'middle' }); x += 0.3; }
  });
}

function opener(id, active) {
  const h = H(id);
  const s = pres.addSlide();
  s.background = { color: C.dark };
  stepBar(s, active);
  txt(s, h.num, { x: M, y: 1.55, w: 4, h: 0.85, fontSize: 44, bold: true, color: C.gold });
  txt(s, h.title, { x: M, y: 2.4, w: CW, h: 0.95, fontSize: fitSize(h.title, CW, 40, 28), bold: true, color: C.onDark, valign: 'middle' });
  const pills = [[tagOf(id), true], ...h.tags.filter(t => t[1] === 'from').map(t => [t[0], false]), [h.tref, false]].filter(p => p[0]);
  let x = M;
  pills.forEach(([t, risk]) => {
    const w = pillW(t, 13);
    s.addShape(S.ROUNDED_RECTANGLE, { x, y: 3.55, w, h: 0.42, rectRadius: 0.06, fill: { color: risk ? C.darkRisk : C.darkChip }, line: { color: risk ? C.darkRisk : C.darkLine } });
    txt(s, t, { x, y: 3.55, w, h: 0.42, fontSize: 13, color: risk ? C.riskOnDark : C.gold, align: 'center', valign: 'middle' });
    x += w + 0.15;
  });
  para(s, need(h.intro, id + ' 导语'), 18, { x: M, y: 4.25, w: CW, h: 1.35, lineSpacingMultiple: 1.2 }, C.darkSub, C.onDark);
  // 本环节的小节
  const subs = D.order.filter(k => D.h[k].num.startsWith(h.num + '.'));
  const rows = Math.ceil(subs.length / 3), colW = CW / 3;
  subs.forEach((k, i) => {
    const c = Math.floor(i / rows), r = i % rows, hk = D.h[k];
    const risk = hk.tags.some(t => t[1] === 'risk');
    s.addText([{ text: hk.num + '  ', options: { fontFace: F, fontSize: 14, bold: true, color: C.gold } },
      { text: hk.title, options: { fontFace: F, fontSize: 14, color: risk ? C.riskOnDark : C.darkSub } }],
    { x: M + c * colW, y: 5.9 + r * 0.38, w: colW - 0.2, h: 0.36, isTextBox: true, margin: 0, valign: 'middle' });
  });
}

// ================= 封面 =================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };
  need(D.title.length === 3, '站名');
  const [name, subt, core] = D.title.map(r => r[0].trim());
  txt(s, '二手奢侈品回收 · 全渠道全链路课程', { x: M + 0.2, y: 1.3, w: 10, h: 0.4, fontSize: 16, color: C.darkSub });
  txt(s, '第六站 · ' + name, { x: M + 0.2, y: 1.9, w: 11, h: 1.1, fontSize: 54, bold: true, color: C.onDark });
  txt(s, subt, { x: M + 0.2, y: 3.1, w: 11, h: 0.6, fontSize: 26, color: C.gold });
  const pw = pillW(core, 14) + 0.2;
  s.addShape(S.ROUNDED_RECTANGLE, { x: M + 0.2, y: 3.95, w: pw, h: 0.45, rectRadius: 0.06, fill: { color: C.gold }, line: { color: C.gold } });
  txt(s, core, { x: M + 0.2, y: 3.95, w: pw, h: 0.45, fontSize: 14, bold: true, color: C.dark, align: 'center', valign: 'middle' });
  const secs = D.order.filter(k => D.h[k].level === 'h3').map(k => D.h[k].num + ' ' + D.h[k].title.split('：')[0]);
  need(secs.length === 7, '七个小节');
  txt(s, secs.slice(0, 4).join(' · ') + '\n' + secs.slice(4).join(' · '), { x: M + 0.2, y: 5.4, w: 12, h: 0.9, fontSize: 14, color: C.darkSub, lineSpacingMultiple: 1.3 });
}

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
  const id = 'x6-2-6', act = 'x6-2-6/act', s = slide(id);
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
  const id = 'x6-4-8/act', s = pres.addSlide();
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
  const id = 'x6-5-1/act', s = pres.addSlide();
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
function rowsSlide(title, headText, items, o) {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  txt(s, title, { x: M, y: 0.55, w: CW, h: 0.7, fontSize: 30, bold: true, color: C.onDark });
  let y = 1.55;
  if (headText) {
    txt(s, headText, { x: M, y: 1.45, w: CW, h: 0.45, fontSize: 17, bold: true, color: C.gold });
    y = 2.2;
  }
  const bw = CW - 1.3;
  items.forEach(r => {
    need(r[0][1] === 'b', '按环节分列的标签');
    const body = J(r.slice(1)).replace(/^：/, '');
    const lines = Math.ceil(estW(body, o.size) / (bw - 0.15));
    const hh = lines * o.size * 1.2 * 1.18 / 72 + 0.04;
    txt(s, r[0][0], { x: M, y, w: 1.1, h: 0.4, fontSize: o.size + 2, bold: true, color: C.gold });
    txt(s, body, { x: M + 1.3, y: y + 0.02, w: bw, h: hh, fontSize: o.size, color: C.onDark, lineSpacingMultiple: 1.18 });
    y += hh + o.gap;
  });
  need(y < 7.2, title + ' 放不下');
}
need(D.output.length === 6 && D.deliver.length === 6, '出课标准 / 交付');
rowsSlide('第六站 · ' + D.output_label, null, D.output, { size: 17.5, gap: 0.3 });
rowsSlide('第六站 · ' + D.deliver_label, J(D.deliver_head), D.deliver, { size: 16, gap: 0.2 });

pres.writeFile({ fileName: process.argv[2] || 'deck.pptx' }).then(f => console.log('written', f, pres.slides.length, 'slides'));
