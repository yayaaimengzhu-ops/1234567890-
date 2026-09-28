# -*- coding: utf-8 -*-
# 工作表套件：同一份表格描述，生成可填写的网页和 Word 文档
import html, json, re

OUTLINE = 'outline-v5.html'
PLAN = 'lesson-plan-v1.html'
SERIES = [
    ('s1', 'positioning-diagnosis.html', '定位'),
    ('s2', 'acquisition-diagnosis.html', '获客'),
    ('s3', 'intake-diagnosis.html', '承接'),
    ('s4', 'conversion-diagnosis.html', '转化'),
    ('s5', 'authentication-diagnosis.html', '鉴定'),
    ('s6', 'transaction-diagnosis.html', '交易闭环'),
    ('s7', 'closing-review.html', '结营'),
]
import os
OUTDIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')) + os.sep  # 仓库根目录

def e(s):
    return html.escape(str(s), quote=True)

def strip(s):
    return re.sub(r'<[^>]+>', '', str(s))

def anchor(ref):
    m = re.match(r'(\d+(?:\.\d+)*)', ref)
    return OUTLINE + ('#x' + m.group(1).replace('.', '-') if m else '')

# ---------------- 单元格 ----------------
def IN(i, label, ph=None, req=False):
    return {'k': 'in', 'id': i, 'label': label, 'ph': ph, 'req': req}

def NUM(i, label, unit='', ph=None, req=False, ex=None):
    return {'k': 'num', 'id': i, 'label': label, 'unit': unit, 'ph': ph, 'req': req, 'ex': ex}

def AREA(i, label, ph=None, rows=2, req=False):
    return {'k': 'area', 'id': i, 'label': label, 'ph': ph, 'rows': rows, 'req': req}

def DATE(i, label, req=False):
    return {'k': 'date', 'id': i, 'label': label, 'req': req}

def RAD(name, label, opts, req=False, default=None, col=False, scale=False):
    opts = [(o, o) if isinstance(o, str) else tuple(o) for o in opts]
    return {'k': 'radio', 'name': name, 'label': label, 'opts': opts, 'req': req, 'default': default, 'col': col, 'scale': scale}

def CHK(i, label, text='', cls=None):
    return {'k': 'chk', 'id': i, 'label': label, 'text': text, 'cls': cls}

def SEL(i, label, opts, req=False):
    return {'k': 'sel', 'id': i, 'label': label, 'opts': list(opts), 'req': req}

def CALC(i, f=None, init='—'):
    return {'k': 'calc', 'id': i, 'f': f, 'init': init}

def DOTS(n):
    return {'k': 'dots', 'n': n}

def T(v, cls=''):
    return {'k': 'text', 'v': v, 'cls': cls}

def RH(v): return T(v, 'rh')
def SM(v): return T(v, 'sm')
def EM(v): return T(v, 'em')
def NO(v): return T(v, 'rh n')
def Q(v): return T(v, 'q')
def MULTI(*parts): return {'k': 'multi', 'parts': list(parts)}

# ---------------- 块 ----------------
def H(text, chip=None): return {'t': 'h', 'text': text, 'chip': chip}
def P(text): return {'t': 'p', 'text': text}
def NOTE(text): return {'t': 'note', 'text': text}
def LIST(items): return {'t': 'list', 'items': items}
def TABLE(headers, rows, foot=None, cls='wt stack', tbody=None): return {'t': 'table', 'headers': headers, 'rows': rows, 'foot': foot, 'cls': cls, 'tbody': tbody}
def FORM(items, cols=3): return {'t': 'form', 'cols': cols, 'items': items}
def FIELD(label, cell): return {'t': 'field', 'label': label, 'cell': cell}
def CHECKS(label, items, reqmin=None): return {'t': 'checks', 'label': label, 'items': items, 'reqmin': reqmin}
def SIGN(pledge, items): return {'t': 'sign', 'pledge': pledge, 'items': items}
def TILES(items): return {'t': 'tiles', 'items': items}
def BARS(i, aria): return {'t': 'bars', 'id': i, 'aria': aria}
def CALCLIST(i): return {'t': 'calclist', 'id': i}
def EXNOTE(i, text): return {'t': 'exnote', 'id': i, 'text': text}
def FLOW(nodes, svc=None, aria=''): return {'t': 'flow', 'nodes': nodes, 'svc': svc, 'aria': aria}
def TWO(cols): return {'t': 'two', 'cols': cols}
def MATRIX(i, aria): return {'t': 'matrix', 'id': i, 'aria': aria}
def CALCFORM(items): return {'t': 'calcform', 'items': items}
def SMALLP(text, docx=None): return {'t': 'smallp', 'text': text, 'docx': text if docx is None else docx}

def SHEET(sid, code, title, chips, when, oref, how, blocks, result=None, core=False, path=None):
    return {'id': sid, 'code': code, 'title': title, 'chips': chips, 'when': when, 'oref': oref, 'how': how,
            'blocks': blocks, 'result': result, 'core': core, 'path': path}

CHIP = {'dx': ('dx', '诊断'), 'ref': ('ref', '对照'), 'calc': ('calc', '自动计算'), 'sign': ('sign', '确认单'),
        'lec': ('lec', '讲师填'), 'rec': ('ref', '记录'), 'plan': ('dx', '计划'), 'tpl': ('ref', '模板')}

# ---------------- 网页：单元格 ----------------
def attrs(**kw):
    out = []
    for k, v in kw.items():
        if v is None or v is False:
            continue
        k = k.rstrip('_').replace('_', '-')
        out.append(k if v is True else '%s="%s"' % (k, e(v)))
    return ' '.join(out)

def h_cell(c):
    if isinstance(c, str):
        return c
    k = c['k']
    if k == 'text':
        return c['v']
    if k == 'multi':
        return ''.join(h_cell(x) for x in c['parts'])
    if k == 'in':
        return '<input type="text" %s>' % attrs(class_='in', id=c['id'], data_fill=True, data_label=c['label'], aria_label=c['label'], data_req=c['req'], placeholder=c['ph'])
    if k == 'num':
        inp = '<input type="number" %s>' % attrs(class_='in num', id=c['id'], inputmode='decimal', step='any', min='0', data_fill=True,
                                                  data_label=c['label'], aria_label=c['label'], data_req=c['req'], placeholder=c['ph'], data_ex=c['ex'])
        return '<span class="numw">%s%s</span>' % (inp, '<span class="u">%s</span>' % c['unit'] if c['unit'] else '')
    if k == 'area':
        return '<textarea %s></textarea>' % attrs(class_='in ta', id=c['id'], rows=str(c['rows']), data_fill=True, data_label=c['label'], aria_label=c['label'], data_req=c['req'], placeholder=c['ph'])
    if k == 'date':
        return '<input type="date" %s>' % attrs(class_='in date', id=c['id'], data_fill=True, data_label=c['label'], aria_label=c['label'], data_req=c['req'])
    if k == 'radio':
        items = []
        for j, (v, t) in enumerate(c['opts'], 1):
            rid = '%s-%d' % (c['name'], j)
            a = attrs(type='radio', name=c['name'], id=rid, value=v, data_fill=True, data_label=c['label'], data_text=t, data_req=c['req'], checked=(c['default'] == v))
            items.append('<label class="ro" for="%s"><input %s><span>%s</span></label>' % (rid, a, t))
        opts = c['opts']
        cls = (' col' + (' nw' if all(len(strip(t)) <= 6 for _, t in opts) else '')) if c['col'] else (' scale' if c['scale'] else (' tight' if len(opts) <= 3 and all(len(t) <= 2 for _, t in opts) else ''))
        return '<span class="rg%s" role="radiogroup" aria-label="%s">%s</span>' % (cls, e(c['label']), ''.join(items))
    if k == 'chk':
        a = attrs(type='checkbox', id=c['id'], class_=c['cls'], data_fill=True, data_label=c['label'], aria_label=c['label'])
        return '<label class="ck" for="%s"><input %s><span>%s</span></label>' % (c['id'], a, c['text'])
    if k == 'sel':
        o = ['<option value="">请选择</option>'] + ['<option value="%s">%s</option>' % (e(v), v) for v in c['opts']]
        return '<select %s>%s</select>' % (attrs(class_='in sel', id=c['id'], data_fill=True, data_label=c['label'], aria_label=c['label'], data_req=c['req']), ''.join(o))
    if k == 'calc':
        return '<span id="%s">%s</span>' % (c['id'], c['init'])
    if k == 'dots':
        return '<span class="dots" aria-label="%d / 5">%s<span class="off">%s</span></span>' % (c['n'], '●' * c['n'], '●' * (5 - c['n']))
    raise ValueError(k)

def td_cls(c):
    if isinstance(c, str):
        return ''
    if c['k'] == 'text':
        return c['cls']
    if c['k'] == 'calc':
        return 'calc'
    return ''

def h_table(b):
    headers = b['headers']
    th = ''.join('<th>%s</th>' % h for h in headers)
    def row(r):
        tds = []
        for j, c in enumerate(r):
            span = 1
            if isinstance(c, dict) and c.get('span'):
                span = c['span']
            cls = td_cls(c)
            a = ' class="%s"' % cls if cls else ''
            if span > 1:
                a += ' colspan="%d"' % span
            if 'rh' not in cls:
                lb = strip(headers[j]) if j < len(headers) else ''
                a += ' data-lb="%s"' % e(lb)
            tds.append('<td%s>%s</td>' % (a, h_cell(c)))
        return '<tr>%s</tr>' % ''.join(tds)
    body = ''.join(row(r) for r in b['rows'])
    foot = '<tfoot>%s</tfoot>' % ''.join(row(r) for r in b['foot']) if b.get('foot') else ''
    tb = b.get('tbody') or ''
    return ('<div class="tscroll"><table class="%s"><thead><tr>%s</tr></thead><tbody%s>%s</tbody>%s</table></div>'
            % (b['cls'], th, tb, body, foot))

def h_block(b):
    t = b['t']
    if t == 'h':
        chip = ' <span class="chip %s">%s</span>' % CHIP[b['chip']] if b.get('chip') else ''
        return '<h3 class="sub-h">%s%s</h3>' % (b['text'], chip)
    if t == 'p':
        return '<p class="para">%s</p>' % b['text']
    if t == 'note':
        return '<p class="note">%s</p>' % b['text']
    if t == 'smallp':
        return '<p class="mxnote">%s</p>' % b['text']
    if t == 'list':
        return '<ul class="plain">%s</ul>' % ''.join('<li>%s</li>' % x for x in b['items'])
    if t == 'table':
        return h_table(b)
    if t == 'form':
        cells = ''.join('<div class="f"><span class="fl">%s</span>%s</div>' % (lb, h_cell(c)) for lb, c in b['items'])
        return '<div class="fgrid c%d">%s</div>' % (b['cols'], cells)
    if t == 'field':
        c = b['cell']
        fid = c.get('id') if isinstance(c, dict) else None
        lab = '<label class="fl" for="%s">%s</label>' % (fid, b['label']) if fid and c['k'] in ('in', 'area', 'date', 'num', 'sel') else '<span class="fl">%s</span>' % b['label']
        return '<div class="fblock">%s%s</div>' % (lab, h_cell(c))
    if t == 'checks':
        rq = ' data-reqgroup data-reqmin="%d"' % b['reqmin'] if b.get('reqmin') else ''
        lab = '<span class="fl">%s</span>' % b['label'] if b['label'] else ''
        return '<div class="fblock"%s>%s<div class="rg">%s</div></div>' % (rq, lab, ''.join(h_cell(c) for c in b['items']))
    if t == 'sign':
        items = ''.join('<div class="sg"><label for="%s">%s</label>%s</div>' % (c['id'], lb, h_cell(c)) for lb, c in b['items'])
        return '<div class="signrow"><p class="pledge">%s</p>%s</div>' % (b['pledge'], items)
    if t == 'tiles':
        return '<div class="tiles n%d">%s</div>' % (len(b['items']), ''.join('<div class="tile"><div class="k">%s</div><div class="v" id="%s">—</div></div>' % (lb, i) for i, lb in b['items']))
    if t == 'bars':
        return '<div class="bars" id="%s" role="img" aria-label="%s"></div>' % (b['id'], e(b['aria']))
    if t == 'calclist':
        return '<ul class="calc-list" id="%s"></ul>' % b['id']
    if t == 'exnote':
        return '<p class="exnote" id="%s" hidden>%s</p>' % (b['id'], b['text'])
    if t == 'flow':
        parts = []
        for j, (name, sub, me) in enumerate(b['nodes']):
            if j:
                parts.append('<span class="arr" aria-hidden="true">→</span>')
            parts.append('<div class="node%s">%s<small>%s</small></div>' % (' me' if me else '', name, sub))
        svc = '<p class="svc">%s</p>' % b['svc'] if b.get('svc') else ''
        return '<div class="chainflow" role="img" aria-label="%s">%s</div>%s' % (e(b['aria']), ''.join(parts), svc)
    if t == 'two':
        return '<div class="two">%s</div>' % ''.join('<div><h4>%s</h4><ul class="plain">%s</ul></div>' % (ttl, ''.join('<li>%s</li>' % x for x in items)) for ttl, items in b['cols'])
    if t == 'matrix':
        cells = ''
        for s, sl in ((3, '严重度 高'), (2, '中'), (1, '低')):
            cells += '<div class="mx-y">%s</div>' % sl
            for l in (1, 2, 3):
                pr = l * s
                z = 'z3' if pr >= 6 else ('z2' if pr >= 3 else 'z1')
                cells += '<div class="mx-cell %s" data-l="%d" data-s="%d"></div>' % (z, l, s)
        cells += '<div></div><div class="mx-x">可能 低</div><div class="mx-x">中</div><div class="mx-x">高</div>'
        return '<div class="matrix" id="%s" role="img" aria-label="%s">%s</div>' % (b['id'], e(b['aria']), cells)
    if t == 'calcform':
        out = '<div class="calcform">'
        for i, label, unit, ex, hint in b['items']:
            c = NUM(i, label, unit, '例：%s' % ex, req=True, ex=ex)
            out += '<div class="cf"><label for="%s">%s%s</label>%s</div>' % (i, label, '<small>%s</small>' % hint if hint else '', h_cell(c))
        return out + '</div>'
    raise ValueError(t)

def h_sheet(sh):
    ch = ''.join('<span class="chip %s">%s</span>' % CHIP[c] for c in sh['chips'])
    res = ''
    if sh['result']:
        res = '<div class="result" id="%s" data-copy aria-live="polite"><h4>%s</h4><div class="rbody">—</div></div>' % tuple(sh['result'])
    body = ''.join(h_block(b) for b in sh['blocks'])
    pth = sh.get('path')
    return ('<section class="sheet%s" id="%s" data-sid="%s" data-title="%s"%s>'
            '<div class="sh-head"><span class="code">%s</span><h2>%s</h2>'
            '<div class="sh-meta">%s%s<span>%s</span><a href="%s">大纲 %s</a><span class="prog" data-prog="%s">选填</span></div></div>'
            '<p class="howfill"><b>怎么填</b>%s</p>%s%s</section>'
            % (' core' if sh['core'] else '', sh['id'], sh['id'], e(sh['code'] + ' ' + sh['title']), ' data-path="%s"' % e(pth) if pth else '',
               sh['code'], sh['title'], ch, '<span class="pathtag">%s的填</span>' % pth if pth else '',
               sh['when'], anchor(sh['oref']), sh['oref'], sh['id'], sh['how'], body, res))

# ---------------- 页面 ----------------
def load(name):
    import os
    return open(os.path.join(os.path.dirname(__file__), name), encoding='utf-8').read()

def page_html(pg):
    css = load('ws.css')
    engine = load('engine.js').replace('/*STATION*/', pg['js'])
    series = ' '.join('<a href="%s"%s>%s</a>' % (f, ' class="cur" aria-current="page"' if k == pg['key'] else '', n) for k, f, n in SERIES)
    head = ['<div class="wrap"><header class="top">']
    head.append('<p class="eyebrow">%s</p><h1 class="doc-title">%s</h1>' % (pg['eyebrow'], pg['title']))
    head += ['<p class="doc-sub">%s</p>' % x for x in pg['lead']]
    head.append('<div class="doc-meta"><div><b>对应</b> 大纲 %s</div><div><b>适用</b> 学员填写 · 讲师批改</div>'
                '<div><b>配套</b> <a href="%s">课程大纲 v5</a> · <a href="%s">讲师教案 v1</a></div></div>' % (pg['orange'], OUTLINE, PLAN))
    head.append('<nav class="series" aria-label="诊断表系列"><span>诊断表系列：</span>%s</nav>' % series)
    head.append('<div class="who" id="who">'
                '<div><label for="w-name">姓名</label>%s</div><div><label for="w-class">期数</label>%s</div>'
                '<div><label for="w-date">填表日期</label>%s</div><div><label for="w-teacher">主讲讲师</label>%s</div></div>'
                % (h_cell(IN('w-name', '姓名', req=True)), h_cell(IN('w-class', '期数', '例：第 3 期')),
                   h_cell(IN('w-date', '填表日期', '例：2026-10-08')), h_cell(IN('w-teacher', '主讲讲师'))))
    turn = ''.join('<li><a href="#%s">%s</a><small>%s</small><span class="st" data-st="%s">未开始</span></li>' % (sid, name, what, sid) for sid, name, what in pg['turnin'])
    howto = ''.join('<li>%s</li>' % x for x in pg['howto'])
    head.append('<div class="howto"><div><h3>怎么用这套表</h3><ol>%s</ol>'
                '<p class="save">填的内容自动保存在本机浏览器里，换浏览器或清理缓存会丢；要留存就导出。打印用浏览器的打印（Ctrl + P，Mac 用 ⌘ + P），每张表单独一页。改表格的样式和内容，用配套的 Word 版。</p></div>'
                '<div class="turnin"><h3>%s</h3><ul>%s</ul></div></div>' % (howto, pg['turnin_title'], turn))
    idx_rows = [[T('<a href="#%s">%s</a>' % (sh['id'], sh['code']), 'rh'), sh['title'], '、'.join(CHIP[c][1] for c in sh['chips']), sh['when'], SM('<a href="%s">%s</a>' % (anchor(sh['oref']), sh['oref']))] for sh in pg['sheets']]
    head.append('<details class="idx"><summary>%d 张表一览</summary>%s</details>' % (len(pg['sheets']), h_table(TABLE(['表号', '名称', '类型', '什么时候填', '大纲'], idx_rows))))
    head.append('</header></div>')
    nav = '<nav class="index" aria-label="表格导航"><div class="index-inner">%s</div></nav>' % ''.join(
        '<a href="#%s">%s</a>' % (sh['id'], sh['code'].replace('表 ', '')) for sh in pg['sheets'])
    body = '<div class="wrap">' + ''.join(h_sheet(sh) for sh in pg['sheets'])
    body += ('<footer>%s v1 · 对应大纲 v5 %s · <a href="%s">课程大纲 v5</a> · <a href="%s">讲师教案 v1</a><br>'
             '<b>说明：</b>表里的参考值、评级和"建议口径"是常见判断，开课前由讲师按本地行情校准；涉及法律和税务的内容只讲风险意识，具体以当地规定和律师、会计意见为准。</footer></div>'
             % (pg['title'], pg['eyebrow'].split(' · ')[0], OUTLINE, PLAN))
    dock = ('<div class="dock" id="dock" role="region" aria-label="填写工具">'
            '<div class="dk-prog"><span>必填</span><b id="dk-done">0</b><span>/</span><span id="dk-total">0</span><span class="dk-bar"><i id="dk-bar"></i></span></div>'
            '<button type="button" id="btn-export">导出已填写版</button>'
            '<button type="button" id="btn-copy">复制全部填写</button>'
            '<button type="button" id="btn-clear" class="warn">清除本机草稿</button>'
            '<span class="dk-msg" id="dk-msg" role="status" aria-live="polite"></span></div>'
            '<div class="copybox" id="copybox" hidden><p>浏览器没有允许自动复制。下面的文字已经选中，按 Ctrl + C（Mac 用 ⌘ + C）复制。</p>'
            '<label class="vh" for="copytext">填写内容</label><textarea id="copytext" readonly rows="10"></textarea>'
            '<button type="button" id="copyclose">关闭</button></div>')
    data = json.dumps(pg['data'], ensure_ascii=False).replace('<', '\\u003c')
    scripts = ('<script type="application/json" id="ws-data" data-keep>%s</script>'
               '<script type="application/json" id="fill-state" data-doc="%s" data-file="%s" data-title="%s" data-keep>{}</script>'
               '<script data-keep>%s</script>' % (data, pg['doc'], pg['file'].replace('.html', ''), e(pg['title']), engine))
    page = ('<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<title>%s</title>\n<style>%s</style>\n</head>\n<body>\n%s\n%s\n%s\n%s\n%s\n</body>\n</html>\n'
            % (pg['title'], css, ''.join(head), nav, body, dock, scripts))
    ids = re.findall(r' id="([^"]+)"', page)
    dups = sorted({i for i in ids if ids.count(i) > 1})
    assert not dups, (pg['key'], dups[:10])
    fors = set(re.findall(r' for="([^"]+)"', page))
    missing = sorted(f for f in fors if f not in set(ids))
    assert not missing, (pg['key'], missing[:10])
    return page

# ---------------- Word：把表格描述换成段落和表格 ----------------
TEXT_W = 14798  # A4 横向，左右各 1.8 cm 页边距

def runs(s, base=''):
    """把简单的 HTML 片段转成 [[文字, 标记]]：b 粗体，g 灰色，s 小字。"""
    out, flags = [], [base]
    for tok in re.split(r'(<[^>]+>)', str(s)):
        if not tok:
            continue
        if tok.startswith('<'):
            tag = re.match(r'</?\s*([a-zA-Z0-9]+)', tok)
            name = tag.group(1).lower() if tag else ''
            closing = tok.startswith('</')
            if name in ('b', 'strong'):
                flags.append(flags[-1] + 'b') if not closing else flags.pop() if len(flags) > 1 else None
            elif name == 'small':
                flags.append(flags[-1] + 'gs') if not closing else flags.pop() if len(flags) > 1 else None
            elif name == 'br':
                out.append(['\n', flags[-1]])
            continue
        txt = html.unescape(tok)
        if txt:
            out.append([txt, flags[-1]])
    return out or [['', base]]

def paras_of(s, base=''):
    rs = runs(s, base)
    paras, cur = [], []
    for t, f in rs:
        if t == '\n':
            paras.append(cur or [['', f]]); cur = []
        else:
            cur.append([t, f])
    paras.append(cur or [['', base]])
    return paras

def d_cell(c):
    if isinstance(c, str):
        c = T(c)
    k = c['k']
    if k == 'multi':
        paras = []
        for x in c['parts']:
            paras += d_cell(x)['paras']
        return {'paras': paras}
    if k == 'text':
        cls = c.get('cls', '')
        base = 'b' if ('rh' in cls or 'em' in cls) else ('g' if 'sm' in cls else '')
        return {'paras': paras_of(c['v'], base), 'fill': 'F3F1EA' if 'rh' in cls else None}
    if k in ('in', 'area', 'date'):
        ph = c.get('ph') or ''
        show = ph and (ph.startswith('例') or ph.startswith('讲师') or ph.startswith('提示') or k == 'area')
        r = [[ph, 'gs']] if show else [['', '']]
        if k == 'date':
            r = [['　　年　　月　　日', 'g']]
        return {'paras': [r], 'minh': 300 * c.get('rows', 1) if k == 'area' else 0}
    if k == 'num':
        ph = c.get('ph') or ''
        r = []
        if ph and (ph.startswith('例') or ph.startswith('讲师')):
            r.append([ph + '　', 'gs'])
        if c.get('unit'):
            r.append([c['unit'], 'g'])
        return {'paras': [r or [['', '']]], 'align': 'right'}
    if k == 'radio':
        if c['col']:
            return {'paras': [[['□\u00a0' + t, '']] for _, t in c['opts']]}
        return {'paras': [[['　'.join('□\u00a0' + t for _, t in c['opts']), '']]]}
    if k == 'chk':
        return {'paras': [[['□\u00a0' + strip(c.get('text') or ''), '']]], 'align': 'center' if not c.get('text') else None}
    if k == 'sel':
        if len(c['opts']) <= 5:
            return {'paras': [[['　'.join('□\u00a0' + o for o in c['opts']), '']]]}
        return {'paras': [[['选一：' + ' / '.join(c['opts']), 'gs']]]}
    if k == 'calc':
        return {'paras': [[[('自动：' + c['f']) if c.get('f') else '网页版自动计算', 'gs']]], 'fill': 'F4F5EE'}
    if k == 'dots':
        return {'paras': [[['●' * c['n'] + '○' * (5 - c['n']), '']]]}
    raise ValueError(k)

CH = 195     # 9.5 磅中文字宽，单位 twip
PAD = 220    # 单元格左右边距加余量

def tlen(s):
    """估算显示宽度（中文算 1，英文数字算 0.55）。"""
    s = html.unescape(strip(s))
    return sum(1 if ord(ch) > 0x2E80 else 0.55 for ch in s)

def cell_mw(c):
    """返回 (最小宽, 理想宽)，单位 twip。最小宽是折行也放不下的宽度。"""
    if isinstance(c, str):
        c = T(c)
    k = c['k']
    if k == 'multi':
        ms = [cell_mw(x) for x in c['parts']]
        return max(m for m, _ in ms), max(w for _, w in ms)
    if k == 'text':
        lines = [tlen(x) for x in re.split(r'<br\s*/?>', c['v'])] or [0]
        want = min(max(lines) * CH + PAD, 5600)
        head = 6 if 'rh' in c.get('cls', '') else 3
        return min(want, head * CH + PAD), want
    if k in ('in', 'area'):
        ph = c.get('ph') or ''
        want = min(max(2600 if k == 'in' else 4200, tlen(ph) * 165 + PAD), 5200)
        return (1500 if k == 'in' else 2600), want
    if k == 'num':
        ph = c.get('ph') or ''
        w = tlen(ph) * 165 + (tlen(c.get('unit') or '') + 1) * CH + PAD
        return max(1100, min(w, 2200)), max(1500, w)
    if k == 'date':
        return 1900, 2100
    if k == 'radio':
        opts = [tlen(t) + 1.4 for _, t in c['opts']]
        if c['col']:
            w = max(opts) * CH + PAD
            return w, w
        want = (sum(opts) + len(opts) - 1) * CH + PAD
        if c.get('scale'):
            return (sum(opts[:3]) + 2) * CH + PAD, want
        return max(opts) * CH + PAD, want
    if k == 'chk':
        t = tlen(c.get('text') or '')
        return (min(t, 4) + 1.4) * CH + PAD, (t + 1.4) * CH + PAD
    if k == 'sel':
        if len(c['opts']) <= 5:
            opts = [tlen(o) + 1.4 for o in c['opts']]
            return max(opts) * CH + PAD, (sum(opts) + len(opts) - 1) * CH + PAD
        return 1800, min((tlen(' / '.join(c['opts'])) + 3) * 165 + PAD, 5200)
    if k == 'calc':
        t = tlen(('自动：' + c['f']) if c.get('f') else '网页版自动计算') * 165 + PAD
        return min(t, 1400), min(t, 3200)
    if k == 'dots':
        return 5 * CH + PAD, 5 * CH + PAD
    return 1200, 2000

def widths(headers, rows, total=None):
    total = total or TEXT_W
    n = max(len(headers), max((len(r) for r in rows), default=0))
    mins, wants = [], []
    for j in range(n):
        h = headers[j] if j < len(headers) else ''
        hl = tlen(h)
        mn, wt = min(hl, 3) * 200 + PAD, hl * 200 + PAD
        cells = [cell_mw(r[j]) for r in rows if j < len(r) and not (isinstance(r[j], dict) and r[j].get('span', 1) > 1)]
        if cells:
            mn = max([mn] + [m for m, _ in cells])
            ws = sorted(w for _, w in cells)
            wt = max(wt, ws[min(len(ws) - 1, int(len(ws) * 0.8))])
        mins.append(max(mn, 520))
        wants.append(max(wt, mins[-1]))
    smin, swant = sum(mins), sum(wants)
    if smin >= total:
        out = [m * total / smin for m in mins]
    elif swant <= total:
        extra = total - swant
        out = [w + extra * w / swant for w in wants]
    else:
        flex = [w - m for m, w in zip(mins, wants)]
        out = [m + (total - smin) * f / sum(flex) for m, f in zip(mins, flex)]
    out = [int(x) for x in out]
    out[-1] += total - sum(out)
    return out

def hoisted(rows):
    """同一列里反复出现的长下拉选项，只在表头写一次，格子留空手写。"""
    out = {}
    n = max((len(r) for r in rows), default=0)
    for j in range(n):
        cs = [r[j] for r in rows if j < len(r)]
        sels = [c for c in cs if isinstance(c, dict) and c.get('k') == 'sel' and (len(c['opts']) > 5 or sum(len(o) for o in c['opts']) > 16)]
        if len(sels) >= 2 and all(x['opts'] == sels[0]['opts'] for x in sels):
            out[j] = sels[0]['opts']
    return out

def d_table(headers, rows, foot=None):
    hs = hoisted(rows)
    w = widths(headers, [[IN('x', 'x') if j in hs and isinstance(c, dict) and c.get('k') == 'sel' else c for j, c in enumerate(r)] for r in rows] + (foot or []))
    head, notes = [], []
    for j, h in enumerate(headers):
        ps = paras_of(h, 'b')
        if j in hs:
            ps.append([['选项见表下', 'gs']])
            notes.append('"%s"可选：%s' % (strip(h), ' / '.join(hs[j])))
        head.append({'paras': ps, 'fill': 'EFE7D4'})
    trs = [{'header': True, 'cells': head}]
    for r in rows + (foot or []):
        cells = []
        for j, c in enumerate(r):
            if j in hs and isinstance(c, dict) and c.get('k') == 'sel':
                cells.append({'paras': [[['', '']]]})
                continue
            dc = d_cell(c)
            if isinstance(c, dict) and c.get('span', 1) > 1:
                dc['span'] = c['span']
            cells.append(dc)
        trs.append({'cells': cells})
    return {'t': 'table', 'widths': w, 'rows': trs, 'keep': len(trs) <= 8, 'notes': notes}

def d_block(b):
    t = b['t']
    if t == 'h':
        return [{'t': 'para', 'style': 'h3', 'runs': runs(b['text'])}]
    if t == 'p':
        return [{'t': 'para', 'style': 'p', 'runs': runs(b['text'])}]
    if t == 'note':
        return [{'t': 'para', 'style': 'note', 'runs': runs(b['text'])}]
    if t == 'smallp':
        return [{'t': 'para', 'style': 'small', 'runs': runs(b['docx'], 'g')}] if b['docx'] else []
    if t == 'list':
        return [{'t': 'para', 'style': 'li', 'runs': runs(x)} for x in b['items']]
    if t == 'table':
        return [d_table(b['headers'], b['rows'], b.get('foot'))]
    if t == 'form':
        cols = max(1, min(b['cols'], 2))
        items = b['items']
        rows = []
        for i in range(0, len(items), cols):
            chunk = items[i:i + cols]
            cells = []
            for lb, c in chunk:
                cells.append({'paras': paras_of(lb, 'b'), 'fill': 'F3F1EA'})
                dc = d_cell(c)
                if isinstance(c, dict) and c['k'] == 'area':
                    dc['minh'] = 300 * c.get('rows', 2)
                cells.append(dc)
            while len(cells) < cols * 2:
                cells.append({'paras': [[['', '']]]})
            rows.append({'cells': cells})
        unit = TEXT_W // cols
        w = [int(unit * 0.38), unit - int(unit * 0.38)] * cols
        w[-1] += TEXT_W - sum(w)
        return [{'t': 'table', 'widths': w, 'rows': rows}]
    if t == 'field':
        dc = d_cell(b['cell'])
        if isinstance(b['cell'], dict) and b['cell']['k'] == 'area':
            dc['minh'] = 300 * b['cell'].get('rows', 2)
        return [{'t': 'table', 'widths': [int(TEXT_W * 0.28), TEXT_W - int(TEXT_W * 0.28)],
                 'rows': [{'cells': [{'paras': paras_of(b['label'], 'b'), 'fill': 'F3F1EA'}, dc]}]}]
    if t == 'checks':
        r = []
        if b['label']:
            r.append([strip(b['label']) + '　', 'b'])
        r.append(['　'.join('□\u00a0' + strip(c.get('text') or '') for c in b['items']), ''])
        return [{'t': 'para', 'style': 'p', 'runs': r}]
    if t == 'sign':
        cells = []
        for lb, c in b['items']:
            cells.append({'paras': [[[lb, 'b']]], 'fill': 'F3F1EA'})
            cells.append({'paras': [[['', '']]], 'minh': 520})
        n = len(b['items'])
        unit = TEXT_W // n
        w = [int(unit * 0.35), unit - int(unit * 0.35)] * n
        w[-1] += TEXT_W - sum(w)
        return [{'t': 'para', 'style': 'pledge', 'runs': runs(b['pledge'])},
                {'t': 'table', 'widths': w, 'rows': [{'cells': cells}]}]
    if t == 'tiles':
        n = len(b['items'])
        w = [TEXT_W // n] * n
        w[-1] += TEXT_W - sum(w)
        return [{'t': 'table', 'widths': w, 'rows': [
            {'header': True, 'cells': [{'paras': [[[lb, 'b']]], 'fill': 'EFE7D4'} for _, lb in b['items']]},
            {'cells': [{'paras': [[['网页版自动计算', 'gs']]], 'fill': 'F4F5EE', 'minh': 480} for _ in b['items']]}]}]
    if t in ('bars', 'calclist', 'exnote'):
        return []
    if t == 'flow':
        cells, w = [], []
        nn = len(b['nodes'])
        arrow_w = 520
        node_w = (TEXT_W - arrow_w * (nn - 1)) // nn
        for j, (name, sub, me) in enumerate(b['nodes']):
            if j:
                cells.append({'paras': [[['→', 'b']]], 'align': 'center'})
                w.append(arrow_w)
            cells.append({'paras': [[[name, 'b']], [[sub, 'gs']]], 'fill': 'EFE7D4' if me else None})
            w.append(node_w)
        w[-1] += TEXT_W - sum(w)
        out = [{'t': 'table', 'widths': w, 'rows': [{'cells': cells}]}]
        if b.get('svc'):
            out.append({'t': 'para', 'style': 'small', 'runs': runs(b['svc'])})
        return out
    if t == 'two':
        n = len(b['cols'])
        w = [TEXT_W // n] * n
        w[-1] += TEXT_W - sum(w)
        head = {'header': True, 'cells': [{'paras': [[[ttl, 'b']]], 'fill': 'EFE7D4'} for ttl, _ in b['cols']]}
        body = {'cells': [{'paras': [[['· ' + strip(x), '']] for x in items]} for _, items in b['cols']]}
        return [{'t': 'table', 'widths': w, 'rows': [head, body]}]
    if t == 'matrix':
        w = [1500] + [(TEXT_W - 1500) // 3] * 3
        w[-1] += TEXT_W - sum(w)
        fills = {1: None, 2: 'FBF5F3', 3: 'F0DAD4'}
        rows = []
        for s, sl in ((3, '严重度 高'), (2, '中'), (1, '低')):
            cells = [{'paras': [[[sl, 'b']]], 'fill': 'F3F1EA'}]
            for l in (1, 2, 3):
                pr = l * s
                z = 3 if pr >= 6 else (2 if pr >= 3 else 1)
                cells.append({'paras': [[['', '']]], 'fill': fills[z], 'minh': 900})
            rows.append({'cells': cells})
        rows.append({'cells': [{'paras': [[['', '']]]}] + [{'paras': [[[x, 'b']]], 'align': 'center', 'fill': 'F3F1EA'} for x in ('可能 低', '中', '高')]})
        return [{'t': 'table', 'widths': w, 'rows': rows, 'keep': True},
                {'t': 'para', 'style': 'small', 'runs': [['把表里每一类风险按"可能"和"严重度"写进对应格子，越往右上越要先防。', 'g']]}]
    if t == 'calcform':
        rows = []
        for i, label, unit, ex, hint in b['items']:
            lab = [[label, 'b']] + ([['　' + hint, 'gs']] if hint else [])
            rows.append([T(label + ('<small>　%s</small>' % hint if hint else ''), 'rh'), NUM(i, label, unit, '例：%s' % ex)])
        return [d_table(['项目', '填写'], rows)]
    raise ValueError(t)

def d_sheet(sh, first=False):
    out = [{'t': 'para', 'style': 'h1', 'runs': [[sh['code'] + '　' + sh['title'], '']], 'pagebreak': not first}]
    meta = '、'.join(CHIP[c][1] for c in sh['chips']) + ' · ' + strip(sh['when']) + ' · 对应大纲 ' + sh['oref']
    if sh.get('path'):
        meta = '走' + sh['path'] + '的填 · ' + meta
    out.append({'t': 'para', 'style': 'meta', 'runs': [[meta, 'g']]})
    out.append({'t': 'para', 'style': 'how', 'runs': [['怎么填　', 'b']] + runs(sh['how'])})
    for b in sh['blocks']:
        out += d_block(b)
    if sh['result']:
        out.append({'t': 'para', 'style': 'h3', 'runs': [['结论 / 备注', '']]})
        out.append({'t': 'table', 'widths': [TEXT_W], 'rows': [{'cells': [{'paras': [[['网页版会在这里自动给出%s；Word 版手写结论。' % strip(sh['result'][1]), 'gs']]], 'minh': 1100}]}]})
    return out

def page_docx(pg):
    blocks = []
    blocks.append({'t': 'para', 'style': 'title', 'runs': [[pg['title'], '']]})
    blocks.append({'t': 'para', 'style': 'subtitle', 'runs': [[pg['eyebrow'] + ' · 配套《课程大纲 v5》· 对应大纲 ' + pg['orange'], 'g']]})
    for x in pg['lead']:
        blocks.append({'t': 'para', 'style': 'p', 'runs': runs(x)})
    blocks.append({'t': 'para', 'style': 'h2', 'runs': [['怎么用这套表', '']]})
    for x in pg['howto']:
        blocks.append({'t': 'para', 'style': 'li', 'runs': runs(x)})
    blocks.append({'t': 'para', 'style': 'note', 'runs': [['这份 Word 版用来修改表格和打印。网页版（%s）里标"自动"的格子会自动计算；在 Word 里可以手算，或删掉这一列。' % pg['file'], '']]})
    blocks.append({'t': 'para', 'style': 'h2', 'runs': [[strip(pg['turnin_title']), '']]})
    by_id = {sh['id']: sh for sh in pg['sheets']}
    blocks.append(d_table(['表', '对应出课标准', '已交'], [[RH(name), what, CHK('x', 'x')] for sid, name, what in pg['turnin']]))
    blocks.append({'t': 'para', 'style': 'h2', 'runs': [['全部表格（%d 张）' % len(pg['sheets']), '']]})
    blocks.append(d_table(['表号', '名称', '类型', '什么时候填', '大纲'],
                          [[RH(sh['code']), sh['title'], '、'.join(CHIP[c][1] for c in sh['chips']), strip(sh['when']), sh['oref']] for sh in pg['sheets']]))
    for i, sh in enumerate(pg['sheets']):
        blocks += d_sheet(sh, first=False)
    return {'file': pg['docx'], 'title': pg['title'], 'header': '二手奢侈品回收课程 · ' + pg['title'], 'blocks': blocks}
