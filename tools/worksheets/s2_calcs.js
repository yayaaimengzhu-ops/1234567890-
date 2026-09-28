  function skipSec(sec){
    var pth = sec.getAttribute('data-path'), ch = val('t21b-path');
    return !!(pth && ch && pth !== ch);
  }
  function zi(s){ return (s.match(/[一-鿿]/g) || []).length + (s.match(/[A-Za-z0-9]+/g) || []).length; }
  function scan(text){
    var hits = [];
    (D.words || []).forEach(function(r, k){
      var f = found(text, r[1]);
      if (f.length) hits.push([f.join('、'), val('t23e-alt' + (k + 1))]);
    });
    for (var i = 1; i <= 4; i++) { var w = val('t23e-w' + i); if (w && text.indexOf(w) >= 0) hits.push([w, val('t23e-wa' + i)]); }
    return hits;
  }
  function hitText(hits){ return hits.map(function(x){ return '"' + esc(x[0]) + '"' + (x[1] ? ' → ' + esc(x[1]) : ''); }).join('；'); }

  function calcT21A(){
    var cands = [], alts = [], ans = 0;
    D.paths.forEach(function(pn, k){
      var i = k + 1, card = rv('t21a-card' + i), af = rv('t21a-af' + i), vetos = [];
      D.veto.forEach(function(v, j){ if (ck('t21a-v' + i + '-' + (j + 1))) vetos.push(v); });
      var t = '—', cls = '';
      if (card) ans++;
      if (!card) t = '—';
      else if (card === '没有') t = '没牌';
      else if (vetos.length) { t = '否决：' + vetos.join('、'); cls = 'warn'; }
      else if (af === '输不起') { t = '输不起'; cls = 'warn'; }
      else if (!af) t = '待定';
      else if (card === '有') { t = '候选'; cls = 'ok'; cands.push(pn); }
      else { t = '备选'; alts.push(pn); }
      mark('t21a-r' + i, t, cls);
    });
    if (!ans) { box('t21a-res', p('还没作答。')); return; }
    var h = '';
    if (cands.length === 1) h = p('候选：<b>' + cands[0] + '</b>。把它写进表 2.1B。', 'ok');
    else if (cands.length > 1) h = p('候选有 ' + cands.length + ' 条：' + cands.join('、') + '。all in 只选一条：同样有牌，选你输得起的那条。', 'warn');
    else if (alts.length) h = p('没有"有牌"的候选，只有备选：' + alts.join('、') + '。牌不硬，回表 1.5B 再追问一轮；还拿不准，默认走关系路径起步。');
    else h = p('没有候选。默认走关系路径起步：它最快见到第一单，第一单能救活信心（2.1）。');
    if (ans < 5) h += p('还有 ' + (5 - ans) + ' 条路没判断。');
    box('t21a-res', h);
  }

  function calcT21B(){
    var path = val('t21b-path'), why = val('t21b-why').replace(/[。．.，,；;、\s]+$/, ''), acts = [];
    for (var i = 1; i <= 5; i++) {
      var a = val('t21b-a' + i);
      if (a) acts.push(a + (val('t21b-n' + i) ? ' ' + val('t21b-n' + i) : '') + (val('t21b-f' + i) ? '（' + val('t21b-f' + i) + '）' : ''));
    }
    var r = secReq('t2-1b');
    if (!r[0]) { box('t21b-res', p('还没填。')); return; }
    var h = p('我走<b>' + (path || '＿＿') + '</b>，因为我手上有' + (why ? esc(why) : '＿＿') + '，我第一个月的动作是' + (acts.length ? esc(acts.join('；')) : '＿＿') + '。');
    var w = [], share = n('t21b-share');
    if (!isNaN(share) && share < 80) w.push('压在这条路上的时间只有 ' + fm(share) + '%。all in 的意思是第一个月八成时间和预算压在这一条上。');
    if (why && !hasDigit(why)) w.push('"因为我手上有"里没有数字，换成可数的数字。');
    ['t21b-stop1', 't21b-stop2', 't21b-stop3'].forEach(function(id, k){
      var s = val(id);
      if (s && !hasDigit(s)) w.push('止损口径 ' + '①②③'.charAt(k) + ' 里没有数字，写成能量化的。');
    });
    var k = D.paths.indexOf(path) + 1;
    if (k > 0) {
      var vetos = D.veto.filter(function(v, j){ return ck('t21a-v' + k + '-' + (j + 1)); });
      if (vetos.length) w.push('这条路在表 2.1A 被否决项卡住了：' + vetos.join('、') + '。');
      if (rv('t21a-card' + k) === '没有') w.push('表 2.1A 里你说这条路手上没有牌。');
      if (rv('t21a-af' + k) === '输不起') w.push('表 2.1A 里你说这条路输不起。');
    }
    var full = r[1] > 0 && r[0] === r[1];
    h += p('必填 ' + r[0] + ' / ' + r[1] + (full ? '。路径选择书完整，签字交给讲师。' : '。'), full ? 'ok' : '');
    h += warns(w);
    box('t21b-res', h);
  }

  function calcT22A(){
    var r = secReq('t2-2a');
    if (!r[0]) { box('t22a-res', p('还没填。')); return; }
    var w = [], pre = val('t22a-pre');
    var dates = [1, 2, 3].map(function(i){ return val('t22a-r' + i + '-date'); });
    var whos = [1, 2, 3].map(function(i){ return val('t22a-r' + i + '-who'); });
    if (pre && dates[0]) {
      var gap = Math.round((new Date(dates[0] + 'T00:00:00') - new Date(pre + 'T00:00:00')) / 86400000);
      if (gap < 14) w.push('第 1 轮群发离朋友圈铺垫开始只有 ' + gap + ' 天，铺垫满两周再开口。');
    }
    if (whos[0] && whos[0] !== 'A 类') w.push('第 1 轮先发 A 类：最熟的人最容易给第一单。');
    for (var i = 1; i < 3; i++) {
      if (dates[i] && dates[i - 1] && dates[i] <= dates[i - 1]) w.push('第 ' + (i + 1) + ' 轮的日期不晚于第 ' + i + ' 轮，分批要隔开时间。');
    }
    var a = n('t22a-a'), b = n('t22a-b'), c = n('t22a-c'), t = n('t22a-total');
    var sum = [a, b, c].reduce(function(s, x){ return s + (isNaN(x) ? 0 : x); }, 0);
    if (!isNaN(t) && sum > t) w.push('A、B、C 三类加起来比总数还多，核一下。');
    var h = reqLine('t2-2a', '存量激活计划写完了。');
    if (!isNaN(a) || !isNaN(b)) h += p('先发 A 类' + (isNaN(a) ? '' : ' ' + fm(a) + ' 人') + '，再发 B 类' + (isNaN(b) ? '' : ' ' + fm(b) + ' 人') + '。');
    h += w.length ? warns(w) : p('节奏没有问题。', 'ok');
    box('t22a-res', h);
  }

  function calcT22B(){
    var fbs = [], rows = 0;
    for (var i = 1; i <= 20; i++) {
      if (val('t22b-name' + i) || val('t22b-fb' + i)) rows++;
      fbs.push(val('t22b-fb' + i));
    }
    if (!rows) { box('t22b-res', p('还没记录。')); return; }
    var c = tally(fbs), keys = ['有货要出', '介绍了人', '暂时没有', '冷处理', '误解成微商', '拒绝'];
    var bad = (c['误解成微商'] || 0) + (c['拒绝'] || 0);
    var mx = Math.max.apply(null, keys.map(function(k){ return c[k] || 0; }).concat([1]));
    var h = p('已记录 <b>' + rows + '</b> 人。') + bars(keys.map(function(k){ return [k, c[k] || 0]; }), mx);
    var a = n('t22a-a'), b = n('t22a-b'), ab = (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b);
    if (ab) h += p('表 2.2A 里 A、B 类共 ' + fm(ab) + ' 人，这张记了 ' + rows + ' 人' + (rows >= ab ? '，存量名单跑完一轮。' : '。'), rows >= ab ? 'ok' : '');
    if (rows >= 5 && bad * 10 >= rows * 3) h += p('被当成微商和拒绝的占 ' + pct(bad, rows) + '，三成以上了。先停下来改开场和节奏，别接着群发。', 'warn');
    box('t22b-res', h);
  }

  function calcT22C(){
    var first = [], contacted = 0, signed = 0, pushing = 0, matGiven = 0;
    D.ind.forEach(function(nm, k){ if (rv('t22c-first' + (k + 1)) === '第一批') first.push(nm); });
    for (var i = 1; i <= 10; i++) {
      var st = val('t22c-st' + i);
      if (st && st !== '约上了') contacted++;
      if (st === '已签协议' || st === '已开始推单') signed++;
      if (st === '已开始推单') pushing++;
      if (ck('t22c-mat' + i)) matGiven++;
    }
    var mats = nck('t22c-m', 1, 4);
    if (!first.length && !contacted && !mats && !val('t22c-script')) { box('t22c-res', p('还没填。')); return; }
    var h = '';
    if (first.length) h += p('第一批上门：' + first.join('、') + '。');
    h += p('已实际联系 <b>' + contacted + '</b> 家（出课标准 5 家）' + (contacted >= 5 ? '，达标。' : '，还差 ' + (5 - contacted) + ' 家。'), contacted >= 5 ? 'ok' : '');
    if (contacted) h += p('签了协议 ' + signed + ' 家，开始推单 ' + pushing + ' 家，给了物料 ' + matGiven + ' 家。');
    h += p('物料一套：' + (mats === 4 ? '齐了。' : '做好 ' + mats + ' / 4。'), mats === 4 ? 'ok' : '');
    if (contacted && !val('t22d-c1')) h += p('开始谈分成了，协议草稿在表 2.2D。口头约定分成是获客错误第 12 条。', 'warn');
    box('t22c-res', h);
  }

  function calcT22D(){
    var h = reqLine('t2-2d', '协议草稿要点齐了。');
    if (!h) { box('t22d-res', p('还没填。')); return; }
    var w = [];
    if (!ck('t22d-lawyer')) w.push('草稿用之前给律师看一遍。');
    if (!val('t22d-c5')) w.push('"货出了问题谁负责"一定要写：别让合作方的信誉替你兜底，也别替合作方兜底。');
    box('t22d-res', h + warns(w));
  }

  function calcT22E(){
    var inN = 0, open = 0, sus = [], refs = 0;
    D.circles.forEach(function(c, k){
      var i = k + 1, d = daysSince(val('t22e-d' + i));
      put('t22e-days' + i, isNaN(d) ? '—' : (d < 0 ? '还没到' : d + ' 天'));
      if (ck('t22e-in' + i)) inN++;
      if (rv('t22e-s' + i) === '能开口') open++;
    });
    for (var i = 1; i <= 6; i++) {
      if (val('t22e-src' + i) || val('t22e-what' + i)) refs++;
      if (val('t22e-why' + i) === '说不清' || rv('t22e-mo' + i) === '可疑') sus.push(i);
    }
    if (!inN && !refs) { box('t22e-res', p('还没填。')); return; }
    var h = p('已进圈层 ' + inN + ' 个（30 天目标 2 个），能开口的 ' + open + ' 个。', inN >= 2 ? 'ok' : '');
    if (refs) h += p('转介 ' + refs + ' 单。');
    if (sus.length) h += p('第 ' + sus.join('、') + ' 单的动机说不清或可疑：先想清楚是不是问题货、难缠的客户，或者借机套价，再决定接不接。', 'warn');
    box('t22e-res', h);
  }

  function calcT23A(){
    var lines = [], any = false, mains = [];
    D.plat.forEach(function(pl, k){
      var j = k + 1, use = rv('t23a-use' + j), done = 0, miss = [];
      D.acct.forEach(function(it, i){ if (ck('t23a-c' + (i + 1) + '-' + j)) done++; else miss.push(it); });
      if (use || done || val('t23a-name' + j)) any = true;
      if (use === '主号') mains.push(pl);
      if (use === '不做' || (!use && !done)) return;
      lines.push('<b>' + pl + '</b>' + (use ? '（' + use + '）' : '') + '：' + done + ' / ' + D.acct.length + (done === D.acct.length ? '，改完了' : '，还差：' + miss.join('、')));
    });
    if (!any) { box('t23a-res', p('还没填。')); return; }
    var h = lines.length ? ul(lines) : p('四个平台都选了"不做"。');
    if (mains.length > 1) h += p('主号选了 ' + mains.length + ' 个平台（' + mains.join('、') + '）。定一个先冷启动，其余当矩阵号铺量（2.3.1）。', 'warn');
    box('t23a-res', h);
  }

  function calcT23B(){
    var cnt = 0, hooks = 0, okN = 0, pub = 0, types = {};
    for (var i = 1; i <= 30; i++) {
      if (!val('t23b-t' + i)) continue;
      cnt++;
      if (val('t23b-h' + i)) hooks++;
      if (ck('t23b-ok' + i)) okN++;
      if (val('t23b-st' + i) === '已发布') pub++;
      var ty = val('t23b-ty' + i);
      if (ty) types[ty] = (types[ty] || 0) + 1;
    }
    if (!cnt) { box('t23b-res', p('还没写选题。')); return; }
    var five = D.types.slice(0, 5);
    var h = p('已写 <b>' + cnt + '</b> / 30 条，带钩子的 ' + hooks + ' 条，合规已查 ' + okN + ' 条，已发布 ' + pub + ' 条。', cnt >= 30 && hooks >= 30 ? 'ok' : '');
    h += bars(five.map(function(ty){ return [ty, types[ty] || 0]; }), Math.max.apply(null, five.map(function(ty){ return types[ty] || 0; }).concat([1])));
    var w = [], miss = five.filter(function(ty){ return !types[ty]; });
    if (miss.length) w.push('五类必出量选题还缺：' + miss.join('、') + '。');
    if (hooks < cnt) w.push('有 ' + (cnt - hooks) + ' 条没写钩子：写选题时就把钩子和评论区动作写完。');
    if (pub > okN) w.push('已发布的比"合规已查"的多：每条发之前都过一遍违禁词表。');
    if (!pub) w.push('出课标准要一条已经发布的内容。');
    box('t23b-res', h + warns(w));
  }

  function calcT23C(){
    var tot = 0, txt = '';
    ['t23c-s1', 't23c-s2', 't23c-s3'].forEach(function(id){ var s = val(id), c = zi(s); tot += c; txt += s + '\n'; put(id + 'c', s ? c + ' 字' : '—'); });
    var hits = scan(txt);
    put('t23c-total', tot ? tot + ' 字' : '—');
    put('t23c-dur', tot ? '约 ' + Math.round(tot / 4) + ' 秒' : '—');
    put('t23c-bad', tot ? (hits.length ? hits.length + ' 处' : '没查到') : '—');
    if (!tot) { box('t23c-res', p('还没写。')); return; }
    var h = '', c1 = zi(val('t23c-s1'));
    if (c1 > 12) h += p('钩子 ' + c1 + ' 字，按每秒 4 个字要念 ' + Math.round(c1 / 4) + ' 秒，超过 3 秒了，压成一句短话。', 'warn');
    h += hits.length ? p('可能有风险的词：' + hitText(hits) + '。替代表述见表 2.3E。', 'warn') : p('没查到表 2.3E 里的词。', 'ok');
    if (/[0-9]{6,}|微信号|vx|VX|wx/.test(val('t23c-s3'))) h += p('引导句里别写联系方式，引到私信或主页。', 'warn');
    box('t23c-res', h);
  }

  function calcT23D(){
    var plan = rv('t23d-plan');
    if (!plan) { box('t23d-res', p('还没选出镜方案。')); return; }
    var h = p('出镜方案：<b>' + plan + '</b>。'), w = [];
    if (plan === '找人出镜') {
      var miss = D.terms.filter(function(t, k){ return !ck('t23d-t' + (k + 1)); });
      if (miss.length) w.push('出镜人协议还没写：' + miss.join('、') + '。协议没签不开拍（获客错误第 10 条）。');
      else h += p('六项条款都写进协议了。' + (val('t23d-signdate') ? '签署日期：' + esc(val('t23d-signdate')) + '。' : '记得写签署日期。'), 'ok');
      if (rv('t23d-pay') === '给股份') w.push('别一上来就谈股份：先按条或按月，跑顺了再谈（2.3.4）。');
      var j3 = rv('t23d-job3');
      if (j3 && j3 !== '我') w.push('专业判断归你：出镜人不需要懂行，懂行的是你。');
      var hs = nck('t23d-h', 1, 4);
      if (hs < 4) w.push('出镜人走人第一小时的准备还差 ' + (4 - hs) + ' 项：改密码、收回后台和收款权限、备份素材、定好对外口径。');
    }
    if (plan === '自己出镜' || plan === '找人出镜') {
      var ds = nck('t23d-d', 1, 4);
      h += p('降依赖做了 ' + ds + ' / 4 项。' + (ds ? '' : '粉丝认人不认号，人走了账号就废。'), ds ? '' : 'warn');
    }
    box('t23d-res', h + warns(w));
  }

  function calcT23E(){
    var txt = val('t23e-text'), hits = txt ? scan(txt) : [];
    var el = $('t23e-hits');
    if (el) el.innerHTML = hits.map(function(x){ return '<li><b>' + esc(x[0]) + '</b> → ' + (x[1] ? esc(x[1]) : '替代表述还没填') + '</li>'; }).join('');
    var alts = D.words.filter(function(r, k){ return val('t23e-alt' + (k + 1)); }).length;
    if (!txt && !alts && !ck('t23e-done')) { box('t23e-res', p('还没填。')); return; }
    var h = p('替代表述已填 ' + alts + ' / ' + D.words.length + ' 行。' + (ck('t23e-done') ? '账号已经自查过一遍。' : ''), ck('t23e-done') ? 'ok' : '');
    if (txt) h += hits.length ? p('这段文案查到 ' + hits.length + ' 处可能有风险的词，见上面的清单。', 'warn') : p('这段文案没查到表里的词。素材授权、打码、估价口径还要人来查。', 'ok');
    box('t23e-res', h);
  }

  function calcT23F(){
    var rows = [], any = false;
    for (var w = 1; w <= 4; w++) {
      var sx = n('t23f-w' + w + '-sx'), jw = n('t23f-w' + w + '-jw');
      if (!isNaN(sx) || !isNaN(jw) || !isNaN(n('t23f-w' + w + '-wb')) || !isNaN(n('t23f-w' + w + '-n'))) any = true;
      rows.push({ w: w, sx: sx, jw: jw });
    }
    if (!any) { box('t23f-res', p('还没填。')); return; }
    var mx = Math.max.apply(null, rows.map(function(r){ return isNaN(r.sx) ? 0 : r.sx; }).concat([1]));
    var h = bars(rows.map(function(r){ return ['第 ' + r.w + ' 周私信', isNaN(r.sx) ? 0 : r.sx]; }), mx);
    rows.forEach(function(r){ if (r.sx > 0 && !isNaN(r.jw)) h += p('第 ' + r.w + ' 周：私信 ' + fm(r.sx) + ' 条，加微 ' + fm(r.jw) + ' 个，私信到加微 ' + pct(r.jw, r.sx) + '。'); });
    var flat = [];
    for (var i = 2; i < 4; i++) {
      var a = rows[i - 2].sx, b = rows[i - 1].sx, c = rows[i].sx;
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && b <= a && c <= b) flat.push(i + 1);
    }
    if (flat.length) h += p('私信量连续两周没涨（到第 ' + flat.join('、') + ' 周）。按开头、中段、结尾找问题，一次改一处，再看一周。', 'warn');
    box('t23f-res', h);
  }

  function calcT23G(){
    var a = nck('t23g-a', 1, 5), f = nval('t23g-f', 1, 3);
    if (!a && !f) { box('t23g-res', p('还没填。')); return; }
    var h = p('资产保全做了 ' + a + ' / 5 项；第一小时预案写了 ' + f + ' / 3 项。', a >= 3 && f === 3 ? 'ok' : '');
    if (!ck('t23g-a1')) h += p('还没有备用号：身家压在一个账号上，是获客错误第 11 条。', 'warn');
    box('t23g-res', h);
  }

  function calcT24(){
    var L = D.ledger;
    var cost = sumRange('t24-cost', 1, L), lead = sumRange('t24-lead', 1, L), valid = sumRange('t24-valid', 1, L), deal = sumRange('t24-deal', 1, L), gp = sumRange('t24-gp', 1, L);
    put('t24-s-cost', isNaN(cost) ? '—' : fm(cost) + ' 元');
    put('t24-s-lead', isNaN(lead) ? '—' : fm(lead) + ' 个');
    put('t24-s-valid', isNaN(valid) ? '—' : fm(valid) + ' 个');
    put('t24-s-deal', isNaN(deal) ? '—' : fm(deal) + ' 单');
    put('t24-s-gp', isNaN(gp) ? '—' : fm(gp) + ' 元');
    var has = cost > 0;
    put('t24-o-lead', has && lead > 0 ? fm(cost / lead) + ' 元' : '—');
    put('t24-o-valid', has && valid > 0 ? fm(cost / valid) + ' 元' : '—');
    put('t24-o-deal', has && deal > 0 ? fm(cost / deal) + ' 元' : '—');
    put('t24-o-roi', has && !isNaN(gp) ? fm(gp / cost, 2) : '—');
    var head = reqLine('t2-4', '预算和止损线写好了。');
    if (!head && !has) { box('t24-res', p('还没填。')); return; }
    var h = head, w = [];
    var stop = n('t24-stop'), cap = n('t24-cap'), day = n('t24-daycap'), budget = n('t24-budget');
    if (has && !(ck('t24-pre1') && ck('t24-pre2'))) w.push('承接和转化还没勾"跑通"就开投了，是获客错误第 04 条。');
    for (var i = 1; i <= L; i++) { var c = n('t24-cost' + i); if (!isNaN(c) && !isNaN(day) && c > day) w.push('账本第 ' + i + ' 行花费 ' + fm(c) + ' 元，超过单日上限 ' + fm(day) + ' 元。'); }
    if (!isNaN(stop) && !isNaN(budget) && stop > budget) w.push('止损线比试投总预算还高，止损线要落在预算以内。');
    if (!has) h += p('开投以后每天记一行账。');
    else {
      h += p('累计花费 <b>' + fm(cost) + '</b> 元，线索 ' + fm(lead || 0) + ' 个，有效客户 ' + fm(valid || 0) + ' 个，成交 ' + fm(deal || 0) + ' 单。');
      var cpv = valid > 0 ? cost / valid : NaN;
      if (!isNaN(stop) && cost >= stop && (isNaN(cpv) || (!isNaN(cap) && cpv > cap))) {
        h += p('到止损线了：单个有效客户成本' + (isNaN(cpv) ? '算不出来（还没有有效客户）' : ' ' + fm(cpv) + ' 元') + (isNaN(cap) ? '' : '，你定的上限是 ' + fm(cap) + ' 元') + '。停投，回头查承接和素材，再决定换平台还是换路。', 'warn');
      } else if (!isNaN(cpv) && !isNaN(cap) && cpv <= cap && gp > cost) {
        h += p('单个有效客户成本 ' + fm(cpv) + ' 元，在上限以内，成交毛利已经盖过花费，可以考虑加码。', 'ok');
      } else {
        h += p('数据还不够下结论：按单日上限继续试，花到止损线再判断。');
      }
      if (lead > 0) h += p('线索成本 ' + fm(cost / lead) + ' 元' + (deal > 0 ? '，成交成本 ' + fm(cost / deal) + ' 元' : '，还没有成交') + '。看成交成本，别只看线索成本：便宜的线索里可能全是白嫖和同行。');
    }
    if ((ck('t24-ag1') || ck('t24-ag2') || ck('t24-ag3')) && !(ck('t24-ag1') && ck('t24-ag2'))) w.push('找代投的，账户和数据都必须在自己手里（获客错误第 14 条）。');
    if (has && !ck('t24-m2')) w.push('素材和落地页的价格说法要和第六站的报价口径对齐：投放说"高价"，收货时压价，就是投诉。');
    box('t24-res', h + warns(w));
  }

  function calcT25A(){
    var on = 0, rvs = 0, any = false, w = [];
    for (var i = 1; i <= 5; i++) {
      var st = val('t25a-st' + i), x = n('t25a-rv' + i);
      if (st) any = true;
      if (st === '已上线' || st === '已优化') { on++; if (!ck('t25a-true' + i)) w.push('"' + D.lplat[i - 1] + '"已上线，但"资质、地址真实"没勾：虚报信息被举报就下架。'); }
      if (!isNaN(x)) { rvs += x; any = true; }
    }
    if (!any && !val('t25a-name')) { box('t25a-res', p('还没填。')); return; }
    var h = p('已上线 ' + on + ' / 5 个入口；评价合计 <b>' + rvs + '</b> 条（30 天目标：攒够前 10 条）。', rvs >= 10 ? 'ok' : '');
    if (rv('t25a-found') === '还不能') w.push('本地搜索还搜不到：店名带关键词和地域，信息补全（2.5.1）。');
    box('t25a-res', h + warns(w));
  }

  function calcT25B(){
    var pts = 0, contacts = 0, noResp = 0;
    for (var i = 1; i <= 20; i++) {
      if (!val('t25b-pt' + i)) continue;
      pts++;
      var x = n('t25b-n' + i);
      if (!isNaN(x)) contacts += x;
      if (!ck('t25b-r' + i)) noResp++;
    }
    var act = val('t25b-type');
    if (!pts && !act) { box('t25b-res', p('还没填。')); return; }
    var h = p('跑了 <b>' + pts + '</b> 个点位（30 天目标：20 个，或办完 1 场活动），留下联系方式 ' + contacts + ' 个' + (pts ? '，平均每个点位 ' + fm(contacts / pts, 1) + ' 个' : '') + '。', pts >= 20 ? 'ok' : '');
    if (act) h += p('活动：' + esc(act) + (val('t25b-date') ? '，' + val('t25b-date') : '') + '。');
    var w = [], s = nck('t25b-s', 1, 4);
    if (noResp) w.push(noResp + ' 个点位没勾"责任写清"：谁负责现场、出了纠纷算谁的，合作之前先写清。');
    if (s < 4) w.push('活动与物料合规还差 ' + (4 - s) + ' 项。');
    box('t25b-res', h + warns(w));
  }

  function calcT26A(){
    var buy = 0, sell = 0, deals = 0, wants = 0;
    for (var i = 1; i <= 12; i++) {
      var t = rv('t26a-ty' + i);
      if (!val('t26a-t' + i) && !t) continue;
      if (t === '求购') buy++; else if (t === '出售') sell++;
      if (val('t26a-st' + i) === '已成交') deals++;
      var v = n('t26a-v' + i);
      if (!isNaN(v)) wants += v;
    }
    var m = sumRange('t26a-dm', 1, 5), r = sumRange('t26a-dr', 1, 5), y = sumRange('t26a-dy', 1, 5);
    put('t26a-s-m', isNaN(m) ? '—' : fm(m) + ' 人');
    put('t26a-s-r', isNaN(r) ? '—' : fm(r) + ' 人');
    put('t26a-s-y', isNaN(y) ? '—' : fm(y) + ' 人');
    if (!buy && !sell && isNaN(m) && !rv('t26a-real')) { box('t26a-res', p('还没填。')); return; }
    var h = p('求购帖 ' + buy + ' 条，出售帖 ' + sell + ' 条，已成交 ' + deals + ' 条，想要和私信合计 ' + wants + ' 个。', buy && sell ? 'ok' : '');
    if (m > 0) h += p('主动开发：私信 ' + fm(m) + ' 人，回复 ' + fm(r || 0) + ' 人（' + pct(r || 0, m) + '），真有意向 ' + fm(y || 0) + ' 人。');
    var d = daysSince(val('t26a-start'));
    if (!isNaN(d) && d >= 0) h += p('养号第 ' + (d + 1) + ' 天。');
    var w = [];
    if (rv('t26a-real') === '没有') w.push('先实名：实名和信用是闲鱼权重的底子。');
    if (!buy) w.push('还没发求购帖：求购帖是收货主力动作。');
    box('t26a-res', h + warns(w));
  }

  function calcT26B(){
    var unsure = [], ans = 0;
    D.scams.forEach(function(s, k){ var v = rv('t26b-k' + (k + 1)); if (v) ans++; if (v === '不确定') unsure.push(s); });
    var seo = ['t26b-w', 't26b-b', 't26b-58', 't26b-lt'].filter(function(id){ return ck(id + '-ok'); }).length;
    if (!ans && !seo) { box('t26b-res', p('还没填。')); return; }
    var h = p('六种骗局已答 ' + ans + ' / 6；搜索入口卡位 ' + seo + ' / 4。');
    if (unsure.length) h += p('不确定的：' + unsure.join('、') + '。课上问清楚。原则只有一条：一律只走平台流程。', 'warn');
    else if (ans === 6) h += p('六种骗局都知道怎么应对。', 'ok');
    box('t26b-res', h);
  }

  function calcT27A(){
    var a = val('t27a-first'), b = val('t27a-second');
    if (!a && !b) { box('t27a-res', p('还没选。')); return; }
    var tag = {};
    D.risk.forEach(function(r){ tag[r[0]] = r[1]; });
    var h = p('第一条：<b>' + (a || '—') + '</b>；第二条：<b>' + (b || '—') + '</b>。'), w = [];
    if (a && b && a === b) w.push('第二条路和第一条一样，选"暂不加"或者换一条。');
    else if (a && tag[a] && tag[b]) {
      var same = tag[a].filter(function(t){ return tag[b].indexOf(t) >= 0; });
      if (same.length) w.push(a + '和' + b + '都会' + same.join('、') + '：加第二条路时别叠加同一种风险。');
    }
    var c = nck('t27a-c', 1, 3);
    if (b && b !== '暂不加' && c < 3) w.push('加第二条路的三个前提只满足了 ' + c + ' 个，先把第一条跑稳。');
    var chosen = val('t21b-path');
    if (a && chosen && a !== chosen) w.push('第一条路和表 2.1B 写的"' + chosen + '"不一致。');
    box('t27a-res', h + (w.length ? warns(w) : p('没有叠加同一种风险。', 'ok')));
  }

  function calcT27B(){
    var path = val('t27b-path') || val('t21b-path');
    [].forEach.call(document.querySelectorAll('#t2-7b tbody[data-path]'), function(tb){
      var wrap = tb.closest ? tb.closest('.tscroll') : null;
      var off = !!path && tb.getAttribute('data-path') !== path;
      if (wrap) {
        wrap.hidden = off;
        var hd = wrap.previousElementSibling;
        if (hd && hd.classList.contains('sub-h') && hd.textContent === tb.getAttribute('data-path')) hd.hidden = off;
      }
    });
    var k = D.paths.indexOf(path) + 1;
    if (!val('t27b-path') && !(k > 0 && val('t27b-p' + k + '-s1'))) { box('t27b-res', p('还没填。')); return; }
    var h = '';
    if (k > 0) {
      var goals = D.goals[k - 1][1], g = 0, st = 0, miss = 0;
      goals.forEach(function(x, j){ if (ck('t27b-g' + k + '-' + (j + 1))) g++; });
      for (var j = 1; j <= 3; j++) { var d = rv('t27b-p' + k + '-d' + j); if (d) st++; if (d === '没做') miss++; }
      h += p(path + '：30 天目标达成 <b>' + g + ' / ' + goals.length + '</b>，三个阶段填了 ' + st + ' 个。', g === goals.length ? 'ok' : '');
      if (miss) h += p('有 ' + miss + ' 个阶段没做。换打法之前先问三句：动作量做满了吗？漏斗有没有一环在变好？满 30 天了吗？（表 1.8）', 'warn');
    }
    if (val('t27b-path') && val('t21b-path') && val('t27b-path') !== val('t21b-path')) h += p('这里的路和表 2.1B 写的不一致。', 'warn');
    box('t27b-res', h || p('还没填。'));
  }

  function calcT28(){
    var h = selfCheckHtml('t28-e', 't28');
    var ex = 0, fixed = 0;
    for (var i = 1; i <= 10; i++) {
      if (nck('t28-p' + i + '-', 1, 4)) ex++;
      if (val('t28-fix' + i)) fixed++;
    }
    var mine = 0;
    for (var j = 1; j <= 3; j++) { if (val('t28-m' + j) && val('t28-f' + j)) mine++; }
    if (!h && !ex && !mine) { box('t28-res', p('还没作答。')); return; }
    if (ex || fixed) h += p('课堂找错：标出问题 ' + ex + ' 条，改好 ' + fixed + ' 条。');
    h += p('本路径翻车三件事写了 ' + mine + ' / 3 件' + (mine === 3 ? '，出课标准达成。' : '。'), mine === 3 ? 'ok' : '');
    box('t28-res', h);
  }

  var CALCS = [calcT21A, calcT21B, calcT22A, calcT22B, calcT22C, calcT22D, calcT22E, calcT23A, calcT23B, calcT23C, calcT23D, calcT23E,
               calcT23F, calcT23G, calcT24, calcT25A, calcT25B, calcT26A, calcT26B, calcT27A, calcT27B, calcT28];
