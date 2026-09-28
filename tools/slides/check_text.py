# 核对 PPT 文字和大纲原文：大纲某一站的每一小段都要在 PPT 里找得到；PPT 里多出来的字列出来人工看
# 用法：python3 check_text.py 第六站-交易闭环.pptx ../../outline-v5.html s6
import re, sys, zipfile, html as H
deck, outline, sid = sys.argv[1], sys.argv[2], sys.argv[3]
z = zipfile.ZipFile(deck)
names = sorted([n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)], key=lambda n: int(re.findall(r'\d+', n)[0]))
runs = []
for n in names:
    runs += [H.unescape(t) for t in re.findall(r'<a:t>([^<]*)</a:t>', z.read(n).decode('utf-8'))]
norm = lambda t: re.sub(r'[\s 　]+', '', t)
SEP = r'[|，。、；：:（）()“”"\'·→/—\-–›!！？?]'
def segs(t): return [x for x in re.split(SEP, norm(t)) if len(x) >= 2]
deck_all = '|' + '|'.join(norm(r) for r in runs) + '|'

s = open(outline, encoding='utf-8').read()
a = s.index('<section class="stage" id="%s"' % sid); b = s.index('<section class="stage"', a + 10)
body = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', s[a:b], flags=re.S)
src_split = H.unescape(re.sub(r'<[^>]+>', '|', body))   # 每个文字节点分开
src_join = norm(H.unescape(re.sub(r'<[^>]+>', '', body)))  # 去掉标签连成一串

S = segs(src_split)
def found(x):
    if x in deck_all: return True
    m = re.match(r'(\d+(?:\.\d+)+)(.+)$', x)  # 节号在左上角方块里，和标题分开放
    return bool(m) and ('|' + m.group(1) + '|') in deck_all and m.group(2) in deck_all
miss = [x for x in S if not found(x)]
print('大纲原文小段', len(S), '（去重', len(set(S)), '），PPT 里找不到的：', len(miss))
for x in miss: print('  缺：', x)
extra = sorted(set(x for x in segs('|'.join(runs)) if x not in src_join))
print('PPT 里不在大纲原文中的小段：', len(extra))
for x in extra: print('  多：', x)
