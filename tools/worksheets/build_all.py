# -*- coding: utf-8 -*-
# 诊断表生成器：同一份表格描述（s1.py–s7.py）同时生成网页版和 Word 版。
# 用法：
#   python3 build_all.py [s1 s2 ...]      生成仓库根目录下的网页版，不带参数就生成全部七站
#   npm install && node docx_build.js out/s*.json   再生成 word/ 目录下的 Word 版
# 改表的内容改 sN.py，改自动计算改 sN_calcs.js，改样式改 ws.css，公共的填写、保存、导出逻辑在 engine.js。
import importlib, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, 'out')
os.makedirs(OUT_JSON, exist_ok=True)

keys = sys.argv[1:] or [k for k, _, _ in kit.SERIES if os.path.exists(os.path.join(HERE, k + '.py'))]
for key in keys:
    pg = importlib.import_module(key).PAGE
    page = kit.page_html(pg)
    with open(os.path.join(kit.OUTDIR, pg['file']), 'w', encoding='utf-8') as f:
        f.write(page)
    doc = kit.page_docx(pg)
    with open(os.path.join(OUT_JSON, key + '.json'), 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False)
    n_fill = page.count(' data-fill')
    print('%s  %-32s %3d 张表  %4d 个填写项  %6.1f KB   docx 块 %d' % (key, pg['file'], len(pg['sheets']), n_fill, len(page.encode('utf-8')) / 1024, len(doc['blocks'])))
