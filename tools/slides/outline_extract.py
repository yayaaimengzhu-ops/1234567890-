# 从 outline-v5.html 里取出某一站的原文，存成 JSON，PPT 脚本只从这里拿字，保证和大纲一字不差
# 用法：python3 outline_extract.py ../../outline-v5.html s6 s6.json
import json, re, sys
from html.parser import HTMLParser

SRC, SID, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
html = open(SRC, encoding='utf-8').read()
a = html.index('<section class="stage" id="%s"' % SID)
b = html.index('<section class="stage"', a + 10)
seg = html[a:b]

STYLE = {'t-risk': 'risk', 't-mv': 'mv', 't-new': 'new', 't-from': 'from', 't-core': 'core', 't-full': 'full'}
TAGS = ('risk', 'mv', 'new', 'from', 'core', 'full')


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []      # 每层：(tag, style, class)
        self.cur = None      # 正在收集的文字块：{'kind', 'runs'}
        self.out = []        # 按顺序的块
        self.cell = None
        self.row = None
        self.table = None
        self.in_nav = False

    def style(self):
        st = ''
        for tag, s, c in self.stack:
            if s: st = s
        return st

    def handle_starttag(self, tag, attrs):
        at = dict(attrs)
        cls = at.get('class', '') or ''
        s = ''
        if tag == 'b': s = 'b'
        if tag == 'span':
            for k, v in STYLE.items():
                if k in cls.split(): s = v
            if 'gap' in cls.split(): s = ''
        if tag == 'a' and 'tref' in cls.split(): s = 'tref'
        if tag == 'span' and 'lb' in cls.split(): s = 'lb'
        if tag == 'span' and not cls: s = 'sub'
        self.stack.append((tag, s, cls))
        if tag in ('h2', 'h3', 'h4'):
            self.cur = {'kind': tag, 'id': at.get('id'), 'cls': cls, 'runs': []}
        elif tag == 'li':
            self.cur = {'kind': 'li', 'runs': []}
        elif tag == 'p':
            self.cur = {'kind': 'p', 'cls': cls, 'runs': []}
        elif tag == 'div' and cls.startswith('note'):
            self.cur = {'kind': 'note', 'runs': []}
        elif tag == 'div' and cls in ('output', 'deliver'):
            # 放在某条路径块里面的（如"关系路径 · 30 天目标"）归到那一节，站末的才是整站的出课标准
            inblock = any(t == 'div' and 'block' in c.split() for t, _, c in self.stack[:-1])
            self.out.append({'kind': cls, 'inblock': inblock})
        elif tag == 'nav':
            self.out.append({'kind': 'nav'})
            self.in_nav = True
        elif tag == 'table':
            self.table = {'kind': 'table', 'head': [], 'rows': []}
        elif tag == 'tr':
            self.row = []
        elif tag in ('td', 'th'):
            self.cell = []
        elif tag == 'a' and self.in_nav and self.cur is None:
            self.cur = {'kind': 'navitem', 'runs': []}

    def handle_endtag(self, tag):
        while self.stack:
            t, _, _ = self.stack.pop()
            if t == tag: break
        if tag in ('h2', 'h3', 'h4', 'li', 'p') and self.cur and self.cur['kind'] in (tag, 'li', 'p', 'h2', 'h3', 'h4'):
            if self.cur['kind'] == tag:
                self.flush()
        elif tag == 'div' and self.cur and self.cur['kind'] == 'note':
            self.flush()
        elif tag == 'a' and self.cur and self.cur['kind'] == 'navitem':
            self.flush()
        elif tag in ('td', 'th'):
            self.row.append(norm(''.join(self.cell)))
            self.cell = None
        elif tag == 'tr':
            if self.table is not None:
                if not self.table['head']: self.table['head'] = self.row
                else: self.table['rows'].append(self.row)
            self.row = None
        elif tag == 'table':
            self.out.append(self.table)
            self.table = None
        elif tag == 'nav':
            self.in_nav = False

    def flush(self):
        c = self.cur
        c['runs'] = tidy(c['runs'])
        self.out.append(c)
        self.cur = None

    def handle_data(self, d):
        if self.cell is not None:
            self.cell.append(d)
            return
        if self.cur is None:
            # 出课标准、交付两块开头的标签和说明文字，没有被 li 包住
            if self.out and self.out[-1]['kind'] in ('output', 'deliver') and d.strip():
                self.out[-1].setdefault('runs', []).append([d, self.style()])
            return
        self.cur['runs'].append([d, self.style()])


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def tidy(runs):
    out = []
    for t, s in runs:
        t = re.sub(r'\s+', ' ', t)
        if out and out[-1][1] == s:
            out[-1][0] += t
        else:
            out.append([t, s])
    # 去掉首尾空白
    while out and not out[0][0].strip(): out.pop(0)
    while out and not out[-1][0].strip(): out.pop()
    if out:
        out[0][0] = out[0][0].lstrip()
        out[-1][0] = out[-1][0].rstrip()
    return out


p = P()
p.feed(seg)

D = {'title': None, 'goal': None, 'nav': [], 'h': {}, 'order': [], 'output': [], 'deliver': []}
last = cur = ctx = cur_h3 = None
for blk in p.out:
    k = blk['kind']
    if k == 'h2':
        D['title'] = blk['runs']
    elif k == 'p' and 'stage-goal' in blk['cls']:
        D['goal'] = blk['runs']
    elif k == 'navitem':
        D['nav'].append(''.join(t for t, s in blk['runs']))
    elif k in ('h3', 'h4'):
        runs = blk['runs']
        head = ''.join(t for t, s in runs if s == '').strip()
        m = re.match(r'([\d.]+)\s+(.*)$', head)
        num, title = (m.group(1), m.group(2)) if m else ('', head)
        key = blk['id'] or (last + '/' + title)  # 没有编号的小标题（课堂动作、某某风控）挂在前一个有编号的标题下
        assert key not in D['h'], key
        D['h'][key] = {'level': k, 'num': num, 'title': title, 'rk': 'rk' in blk['cls'].split(),
                       'tags': [[t.strip(), s] for t, s in runs if s in TAGS],
                       'tref': ''.join(t for t, s in runs if s == 'tref').strip(), 'ul': [], 'intro': None, 'note': None, 'table': None,
                       'output': None}
        D['order'].append(key)
        if blk['id']: last = blk['id']
        if k == 'h3': cur_h3 = key
        cur, ctx = key, None
    elif k == 'li':
        if ctx in ('output', 'deliver'): D[ctx].append(blk['runs'])
        else: D['h'][cur]['ul'].append(blk['runs'])
    elif k == 'p' and ('intro' in blk['cls'] or 'lead' in blk['cls']):
        D['h'][cur]['intro'] = blk['runs']
    elif k == 'note':
        D['h'][cur]['note'] = blk['runs']
    elif k == 'table':
        D['h'][cur]['table'] = {'head': blk['head'], 'rows': blk['rows']}
    elif k in ('output', 'deliver') and blk['inblock']:
        rr = blk.get('runs', [])
        D['h'][cur_h3]['output'] = {'label': ''.join(t for t, s in rr if s == 'lb').strip(), 'runs': tidy([[t, s] for t, s in rr if s != 'lb'])}
    elif k in ('output', 'deliver'):
        ctx = k
        rr = blk.get('runs', [])
        D[k + '_label'] = ''.join(t for t, s in rr if s == 'lb').strip()
        D[k + '_head'] = tidy([[t, s] for t, s in rr if s != 'lb'])

json.dump(D, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('headings', len(D['h']), 'items', sum(len(v['ul']) for v in D['h'].values()),
      'tables', sum(1 for v in D['h'].values() if v['table']), 'output', len(D.get('output', [])), 'deliver', len(D.get('deliver', [])))
