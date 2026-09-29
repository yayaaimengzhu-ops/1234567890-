// 各站 PPT 共用的版式：配色、页头（左上角节号方块）、要点、方块、流程、风控表、深色开篇页、封面、收尾页
// 文字一律从 outline_extract.py 生成的 JSON 里取；大纲结构和脚本对不上时直接报错，不悄悄漏字
const pptxgen = require('pptxgenjs');

module.exports = function kit(D, deckTitle, opt) {
  opt = opt || {};
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.title = deckTitle;

  const F = 'Microsoft YaHei';
  const C = { ink: '17231E', ink2: '4A5951', ink3: '6B7770', brass: '8F6E30', brassSoft: 'EFE7D4', seal: 'A5382A', sealSoft: 'F3DFDA',
    paper: 'FFFFFF', tint: 'F2F4EF', line: 'CBD0C6', dark: '17231E', onDark: 'F2F4EF', darkSub: 'B8C2BB', gold: 'E3C98F',
    darkChip: '26352E', darkLine: '3A4A42', darkRisk: '4B2A24', riskOnDark: 'F0B4A6' };
  const W = 13.333, M = 0.6, CW = W - 2 * M;
  const S = pres.shapes;

  // ---------- 取字 ----------
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
  const dots = t => t.split(/\s*·\s*/).map(x => x.trim()).filter(Boolean); // "甲 · 乙 · 丙" → 三项
  const sec = id => id.split('/')[0].split('-').slice(0, 2).join('-'); // x6-4-3、x6-4-8/课堂动作 → x6-4
  // 标题旁的红色标签：风控 / 新增 / 迁自
  function tagOf(id) { const t = H(id).tags.filter(x => ['risk', 'mv', 'new'].includes(x[1])).map(x => x[0]); return t.length ? t.join(' ') : null; }
  // 内容页右上角：本节标签 + （可选）整节的来源 + 填表编号
  function tagsFor(id) {
    const s = H(sec(id));
    const from = opt.fromOnSlides ? s.tags.filter(t => t[1] === 'from').map(t => t[0]) : [];
    return [tagOf(id), ...from, s.tref].filter(Boolean);
  }

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
      const op = Object.assign({ fontFace: F, fontSize: size, color }, extra || {}, o);
      if (o.bold && !o.color && boldColor) op.color = boldColor;
      return { text: t, options: op };
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
        const op = Object.assign({ fontFace: F, fontSize: size, color: o.color || C.ink }, p[1]);
        if (j === 0) { op.bullet = { indent: 18 }; op.paraSpaceAfter = o.gap == null ? 8 : o.gap; }
        if (j === ps.length - 1 && i < items.length - 1) op.breakLine = true;
        arr.push({ text: p[0], options: op });
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
      if (Array.isArray(body) && body.length > 1 && body[body.length - 1][1] === 'mv') { // "迁自"单独起一行，免得被拆开
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

  // 常见错误 / 最坏会怎样 / 怎么防 四列表
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
  // 表分几页放；o.lead 为真时第一页表格上方先放本节导语
  function tableSlides(id, splits, o) {
    need(splits[0][0] === 0 && splits[splits.length - 1][1] === H(id).table.rows.length, id + ' 表格行数');
    splits.forEach(([a, b], i) => {
      const s = pres.addSlide();
      head(s, H(id).num, H(id).title + (i ? '（续）' : ''), tagsFor(id));
      let y = o.y || 1.75;
      if (o.lead && i === 0) {
        para(s, need(H(id).intro, id + ' 导语'), o.leadSize || 16, { x: M, y: 1.68, w: CW, h: o.leadH || 0.75 }, C.ink2, C.ink);
        y = 1.68 + (o.leadH || 0.75) + 0.12;
      }
      riskTable(s, id, a, b, Object.assign({}, o, { y }, i === 0 && o.firstFontSize ? { fontSize: o.firstFontSize } : {}));
    });
  }

  function slide(id, title, num) {
    const s = pres.addSlide();
    head(s, num || H(id).num || H(id.split('/')[0]).num, title || H(id).title, tagsFor(id));
    return s;
  }

  // ---------- 环节条与开篇页（深色） ----------
  // items：条上的字；active：当前那一项；o.sep：项之间的分隔符（顺序关系用 ›，并列关系不用）；o.lastRight：最后一项单独放在最右（贯穿）
  function stepBar(s, items, active, o) {
    o = o || {};
    let x = M;
    const y = 0.55, hh = 0.42, size = 13;
    items.forEach((t, i) => {
      const last = o.lastRight && i === items.length - 1;
      const on = i === active;
      const w = estW(t, size) + 0.45;
      if (last) x = W - M - w;
      const fill = on ? (last ? C.sealSoft : C.gold) : C.darkChip;
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h: hh, rectRadius: 0.06, fill: { color: fill }, line: { color: on ? fill : C.darkLine } });
      txt(s, t, { x, y, w, h: hh, fontSize: size, bold: on, color: on ? (last ? C.seal : C.dark) : C.darkSub, align: 'center', valign: 'middle' });
      x += w;
      if (i < items.length - (o.lastRight ? 2 : 1)) {
        if (o.sep) { txt(s, o.sep, { x, y, w: 0.3, h: hh, fontSize: 14, color: C.darkSub, align: 'center', valign: 'middle' }); x += 0.3; }
        else x += 0.15;
      }
    });
  }

  // o.bar / o.active / o.barOpts：顶部的环节条；o.toc(key)：哪些小节列进目录（默认只列有编号的）
  function opener(id, o) {
    o = o || {};
    const h = H(id);
    const s = pres.addSlide();
    s.background = { color: C.dark };
    if (o.bar) stepBar(s, o.bar, o.active, o.barOpts);
    txt(s, h.num, { x: M, y: 1.55, w: 4, h: 0.85, fontSize: 44, bold: true, color: C.gold });
    txt(s, h.title, { x: M, y: 2.4, w: CW, h: 0.95, fontSize: fitSize(h.title, CW, 40, 28), bold: true, color: C.onDark, valign: 'middle' });
    const pills = [[tagOf(id), true], ...h.tags.filter(t => t[1] === 'core' || t[1] === 'full').map(t => [t[0], false]),
      ...h.tags.filter(t => t[1] === 'from').map(t => [t[0], false]), [h.tref, false]].filter(p => p[0]);
    let x = M;
    pills.forEach(([t, risk]) => {
      const w = pillW(t, 13);
      s.addShape(S.ROUNDED_RECTANGLE, { x, y: 3.55, w, h: 0.42, rectRadius: 0.06, fill: { color: risk ? C.darkRisk : C.darkChip }, line: { color: risk ? C.darkRisk : C.darkLine } });
      txt(s, t, { x, y: 3.55, w, h: 0.42, fontSize: 13, color: risk ? C.riskOnDark : C.gold, align: 'center', valign: 'middle' });
      x += w + 0.15;
    });
    para(s, need(h.intro, id + ' 导语'), 18, { x: M, y: 4.25, w: CW, h: 1.35, lineSpacingMultiple: 1.2 }, C.darkSub, C.onDark);
    // 本节的小节
    const subs = D.order.filter(o.toc || (k => D.h[k].num.startsWith(h.num + '.')));
    const rows = Math.ceil(subs.length / 3), colW = CW / 3, y0 = Math.min(5.9, 7.1 - rows * 0.38);
    subs.forEach((k, i) => {
      const c = Math.floor(i / rows), r = i % rows, hk = D.h[k];
      const risk = hk.tags.some(t => t[1] === 'risk') || hk.rk;
      const runs = [{ text: hk.title, options: { fontFace: F, fontSize: 14, color: risk ? C.riskOnDark : C.darkSub } }];
      if (hk.num) runs.unshift({ text: hk.num + '  ', options: { fontFace: F, fontSize: 14, bold: true, color: C.gold } });
      s.addText(runs, { x: M + c * colW, y: y0 + r * 0.38, w: colW - 0.2, h: 0.36, isTextBox: true, margin: 0, valign: 'middle' });
    });
    return s;
  }

  // ---------- 封面 ----------
  // station：第几站；nSec：应有几个小节（对不上就报错）
  function cover(station, nSec) {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    const [name, subt, core] = D.title.map(r => r[0].trim());
    txt(s, '二手奢侈品回收 · 全渠道全链路课程', { x: M + 0.2, y: 1.3, w: 10, h: 0.4, fontSize: 16, color: C.darkSub });
    txt(s, station + ' · ' + name, { x: M + 0.2, y: 1.9, w: 11, h: 1.1, fontSize: 54, bold: true, color: C.onDark });
    txt(s, subt, { x: M + 0.2, y: 3.1, w: 11, h: 0.6, fontSize: fitSize(subt, 10.9, 26, 20), color: C.gold });
    if (core) {
      const pw = pillW(core, 14) + 0.2;
      s.addShape(S.ROUNDED_RECTANGLE, { x: M + 0.2, y: 3.95, w: pw, h: 0.45, rectRadius: 0.06, fill: { color: C.gold }, line: { color: C.gold } });
      txt(s, core, { x: M + 0.2, y: 3.95, w: pw, h: 0.45, fontSize: 14, bold: true, color: C.dark, align: 'center', valign: 'middle' });
    }
    const secs = D.order.filter(k => D.h[k].level === 'h3' && D.h[k].num).map(k => D.h[k].num + ' ' + D.h[k].title.split('：')[0]);
    need(secs.length === nSec, '小节数 ' + secs.length);
    txt(s, secs.slice(0, 4).join(' · ') + '\n' + secs.slice(4).join(' · '), { x: M + 0.2, y: 5.4, w: 12, h: 0.9, fontSize: 14, color: C.darkSub, lineSpacingMultiple: 1.3 });
    return s;
  }

  // ---------- 收尾页（深色） ----------
  // 每行：左边金色标签（如"估价"），右边这一行的字
  function rowsSlide(title, headText, items, o) {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    txt(s, title, { x: M, y: 0.55, w: CW, h: 0.7, fontSize: 30, bold: true, color: C.onDark });
    let y = 1.55;
    if (headText) {
      txt(s, headText, { x: M, y: 1.45, w: CW, h: 0.45, fontSize: 17, bold: true, color: C.gold });
      y = 2.2;
    }
    const lw = o.labW || 1.1, bx = lw + 0.2, bw = CW - bx;
    items.forEach(r => {
      need(r[0][1] === 'b', '按环节分列的标签');
      const body = J(r.slice(1)).replace(/^：/, '');
      const lines = Math.ceil(estW(body, o.size) / (bw - 0.15));
      const hh = lines * o.size * 1.2 * 1.18 / 72 + 0.04;
      txt(s, r[0][0], { x: M, y, w: lw, h: 0.4, fontSize: o.size + 2, bold: true, color: C.gold });
      txt(s, body, { x: M + bx, y: y + 0.02, w: bw, h: hh, fontSize: o.size, color: C.onDark, lineSpacingMultiple: 1.18 });
      y += hh + o.gap;
    });
    need(y < 7.2, title + ' 放不下');
    return s;
  }

  // 出课标准（编号两列）+ 交付（一段话），和第一站收尾页同一个样子
  function closingSlide(station, stdItems, deliverText, o) {
    o = Object.assign({ size: 17, rowH: 0.85, deliverSize: 16 }, o || {});
    const s = pres.addSlide();
    s.background = { color: C.dark };
    txt(s, station + ' · ' + (D.output_label || '出课标准'), { x: M, y: 0.55, w: CW, h: 0.7, fontSize: 30, bold: true, color: C.onDark });
    const cw = (CW - 0.4) / 2, rows = Math.ceil(stdItems.length / 2), d = 0.4;
    stdItems.forEach((t, i) => {
      const x = M + Math.floor(i / rows) * (cw + 0.4), y = 1.6 + (i % rows) * o.rowH;
      s.addShape(S.OVAL, { x, y: y + (o.rowH - 0.2 - d) / 2, w: d, h: d, fill: { color: C.gold }, line: { color: C.gold } });
      txt(s, String(i + 1), { x, y: y + (o.rowH - 0.2 - d) / 2, w: d, h: d, fontSize: 13, bold: true, color: C.dark, align: 'center', valign: 'middle' });
      txt(s, t, { x: x + 0.6, y, w: cw - 0.65, h: o.rowH - 0.2, fontSize: o.size, color: C.onDark, valign: 'middle' });
    });
    const y0 = 1.6 + rows * o.rowH + 0.3;
    txt(s, D.deliver_label || '交付', { x: M, y: y0, w: 3, h: 0.45, fontSize: 18, bold: true, color: C.gold });
    txt(s, deliverText, { x: M, y: y0 + 0.55, w: CW, h: 7.1 - y0 - 0.55, fontSize: o.deliverSize, color: C.darkSub, lineSpacingMultiple: 1.35 });
    return s;
  }

  // 深色清单页：标题 + 金色说明行 + 分几列排的条目（交付清单这类一项项的名字）
  function listSlide(title, headText, items, o) {
    o = Object.assign({ cols: 3, size: 16, rowH: 0.46 }, o || {});
    const s = pres.addSlide();
    s.background = { color: C.dark };
    txt(s, title, { x: M, y: 0.55, w: CW, h: 0.7, fontSize: 30, bold: true, color: C.onDark });
    txt(s, headText, { x: M, y: 1.45, w: CW, h: 0.45, fontSize: 18, bold: true, color: C.gold });
    const rows = Math.ceil(items.length / o.cols), colW = CW / o.cols;
    items.forEach((t, i) => {
      const c = Math.floor(i / rows), r = i % rows, x = M + c * colW, y = 2.3 + r * o.rowH;
      s.addShape(S.OVAL, { x, y: y + o.rowH / 2 - 0.06, w: 0.12, h: 0.12, fill: { color: C.gold }, line: { color: C.gold } });
      txt(s, t, { x: x + 0.28, y, w: colW - 0.4, h: o.rowH, fontSize: o.size, color: C.onDark, valign: 'middle' });
    });
    need(2.3 + rows * o.rowH < 7.2, title + ' 放不下');
    return s;
  }

  function save(file) {
    return pres.writeFile({ fileName: file }).then(f => console.log('written', f, pres.slides.length, 'slides'));
  }

  return { pres, C, F, W, M, CW, S, need, H, UL, J, cut, splitTop, dots, sec, tagOf, tagsFor, estW, fitSize, pillW, parts, toParts, rich,
    txt, para, head, bullets, note, sub, tile, chips, timeline, riskTable, tableSlides, slide, stepBar, opener, cover, rowsSlide, closingSlide, listSlide, save };
};
