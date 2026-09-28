# pptxgenjs 在同一段里的每个文字块前都写一个 <a:pPr>，后面的会盖掉项目符号：每段只留第一个
import re, sys, zipfile, shutil
src, dst = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst + '.tmp', 'w', zipfile.ZIP_DEFLATED)
PPR = re.compile(r'<a:pPr\b[^>]*/>|<a:pPr\b[^>]*>.*?</a:pPr>', re.S)
n = 0
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename.startswith('ppt/slides/slide') and item.filename.endswith('.xml'):
        x = data.decode('utf-8')
        def para(m):
            global n
            body = m.group(0); seen = [False]
            def one(mm):
                global n
                if seen[0]: n += 1; return ''
                seen[0] = True; return mm.group(0)
            return PPR.sub(one, body)
        x = re.sub(r'<a:p>.*?</a:p>', para, x, flags=re.S)
        data = x.encode('utf-8')
    zout.writestr(item, data)
zout.close(); shutil.move(dst + '.tmp', dst); print('removed extra pPr:', n)
