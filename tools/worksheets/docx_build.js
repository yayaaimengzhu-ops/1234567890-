// 用法：node docx_build.js out/s1.json [out/s2.json ...]  输出到仓库的 word/ 目录（先 npm install 装 docx）
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, PageOrientation, WidthType, ShadingType, BorderStyle, HeightRule,
  VerticalAlign, TableLayoutType, LevelFormat, PageNumber, HeadingLevel,
} = require('docx');

const OUT = process.env.WORD_OUT || path.join(__dirname, '..', '..', 'word');
fs.mkdirSync(OUT, { recursive: true });

const FONT = { ascii: 'Arial', hAnsi: 'Arial', cs: 'Arial', eastAsia: 'Microsoft YaHei' };
const INK = '1F2420', GRAY = '6B6F68', LINE = 'B9BFB3', ACCENT = '8A5A1F';
const BASE = 19; // 9.5 磅

function run(text, flags, extra) {
  const f = flags || '';
  const o = Object.assign({ text, font: FONT }, extra || {});
  if (f.includes('b')) o.bold = true;
  if (f.includes('g')) o.color = GRAY;
  if (f.includes('s')) o.size = 16;
  return new TextRun(o);
}

function runsOf(list, extra) {
  const out = [];
  let br = 0;
  for (const [t, f] of list) {
    if (t === '\n') { br++; continue; }
    const r = run(t, f, extra);
    if (br) { out.push(new TextRun({ break: br })); br = 0; }
    out.push(r);
  }
  return out.length ? out : [run('', '')];
}

const PSTYLE = {
  title: { style: 'DocTitle' }, subtitle: { style: 'DocSub' },
  h1: { heading: HeadingLevel.HEADING_1 }, h2: { heading: HeadingLevel.HEADING_2 }, h3: { heading: HeadingLevel.HEADING_3 },
  p: { style: 'Body' }, meta: { style: 'Meta' }, how: { style: 'How' }, note: { style: 'Note' },
  small: { style: 'Small' }, pledge: { style: 'Pledge' },
  li: { style: 'Body', numbering: { reference: 'dots', level: 0 } },
};

function para(b) {
  const o = Object.assign({}, PSTYLE[b.style] || PSTYLE.p);
  o.children = runsOf(b.runs);
  if (b.pagebreak) o.pageBreakBefore = true;
  return new Paragraph(o);
}

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const BORDERS = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function table(b) {
  const W = b.widths;
  const total = W.reduce((a, x) => a + x, 0);
  const rows = b.rows.map((r, ri) => {
    const keep = b.keep && ri < b.rows.length - 1; // 小表整张放在同一页
    let col = 0;
    const cells = r.cells.map((c, j) => {
      let span = c.span || 1;
      if (j === r.cells.length - 1 && col + span < W.length) span = W.length - col; // 行里格子少，最后一格补满
      const w = W.slice(col, col + span).reduce((a, x) => a + x, 0);
      col += span;
      const align = c.align === 'right' ? AlignmentType.RIGHT : c.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;
      const paras = (c.paras && c.paras.length ? c.paras : [[['', '']]]).map(p => new Paragraph({
        style: 'Cell', alignment: align, keepNext: keep, keepLines: true, children: runsOf(p),
      }));
      const o = {
        width: { size: w, type: WidthType.DXA }, children: paras,
        margins: { top: 50, bottom: 50, left: 90, right: 90 },
        verticalAlign: r.header ? VerticalAlign.CENTER : VerticalAlign.TOP,
      };
      if (span > 1) o.columnSpan = span;
      if (c.fill) o.shading = { fill: c.fill, type: ShadingType.CLEAR, color: 'auto' };
      return { cell: new TableCell(o), minh: c.minh || 0 };
    });
    const minh = Math.max(0, ...cells.map(x => x.minh));
    const ro = { children: cells.map(x => x.cell), cantSplit: true };
    if (r.header) ro.tableHeader = true;
    if (minh) ro.height = { value: minh, rule: HeightRule.ATLEAST };
    return new TableRow(ro);
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED,
    borders: BORDERS, rows,
  });
}

function build(file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const children = [];
  let prevTable = false;
  for (const b of doc.blocks) {
    if (b.t === 'table') {
      if (prevTable) children.push(new Paragraph({ style: 'Gap', children: [] })); // 两张表之间留一点缝
      children.push(table(b));
      prevTable = true;
      (b.notes || []).forEach(t => { children.push(new Paragraph({ style: 'Small', children: [run(t, 'g')] })); prevTable = false; });
    } else {
      children.push(para(b));
      prevTable = false;
    }
  }
  const d = new Document({
    creator: '二手奢侈品回收课程', title: doc.title, description: doc.header,
    styles: {
      default: {
        document: { run: { font: FONT, size: BASE, color: INK }, paragraph: { spacing: { after: 80, line: 300 } } },
        heading1: { run: { font: FONT, size: 30, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true } },
        heading2: { run: { font: FONT, size: 25, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true } },
        heading3: { run: { font: FONT, size: 21, bold: true, color: ACCENT }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true } },
      },
      paragraphStyles: [
        { id: 'DocTitle', name: 'Doc Title', basedOn: 'Normal', run: { size: 44, bold: true }, paragraph: { spacing: { before: 600, after: 120 } } },
        { id: 'DocSub', name: 'Doc Subtitle', basedOn: 'Normal', run: { size: 21, color: GRAY }, paragraph: { spacing: { after: 280 } } },
        { id: 'Body', name: 'Body', basedOn: 'Normal', paragraph: { spacing: { after: 80, line: 300 } } },
        { id: 'Meta', name: 'Sheet Meta', basedOn: 'Normal', run: { size: 17, color: GRAY }, paragraph: { spacing: { after: 100 }, keepNext: true } },
        { id: 'How', name: 'How To Fill', basedOn: 'Normal', paragraph: { spacing: { after: 140, line: 300 }, keepNext: true,
          shading: { fill: 'F3F1EA', type: ShadingType.CLEAR, color: 'auto' },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 6 } }, indent: { left: 120 } } },
        { id: 'Note', name: 'Note', basedOn: 'Normal', run: { size: 18, color: GRAY }, paragraph: { spacing: { before: 60, after: 100 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: LINE, space: 6 } }, indent: { left: 120 } } },
        { id: 'Small', name: 'Small', basedOn: 'Normal', run: { size: 16, color: GRAY }, paragraph: { spacing: { before: 40, after: 80 } } },
        { id: 'Pledge', name: 'Pledge', basedOn: 'Normal', run: { bold: true }, paragraph: { spacing: { before: 160, after: 100 }, keepNext: true } },
        { id: 'Cell', name: 'Table Text', basedOn: 'Normal', paragraph: { spacing: { before: 0, after: 0, line: 264 } } },
        { id: 'Gap', name: 'Table Gap', basedOn: 'Normal', run: { size: 8 }, paragraph: { spacing: { before: 0, after: 0, line: 160 } } },
      ],
    },
    numbering: {
      config: [{ reference: 'dots', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 420, hanging: 260 } } } }] }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
          margin: { top: 1020, bottom: 1020, left: 1020, right: 1020, header: 500, footer: 500 },
        },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run(doc.header, 'gs')] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ children: ['第 ', PageNumber.CURRENT, ' 页 / 共 ', PageNumber.TOTAL_PAGES, ' 页'], font: FONT, size: 16, color: GRAY }),
      ] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(d).then(buf => {
    const out = path.join(OUT, doc.file);
    fs.writeFileSync(out, buf);
    console.log(out, (buf.length / 1024).toFixed(1) + ' KB');
  });
}

(async () => {
  for (const f of process.argv.slice(2)) await build(f);
})().catch(e => { console.error(e); process.exit(1); });
