  function skipSec(sec){ return sec.id === 't6-7b' && rv('t67b-now') === '暂不招'; }
  function yuan(x){ return isNaN(x) ? '—' : fm(x) + ' 元'; }

  function calcT61(){
    var q1 = val('t61-q1'), q2 = n('t61-q2'), q3 = n('t61-q3'), gp = n('t61-gp');
    put('t61-cap', !isNaN(q3) && !isNaN(gp) ? yuan(q3 - gp) : '—');
    if (!val('t61-item') && !q1 && isNaN(q2) && isNaN(q3)) { box('t61-res', p('还没填。')); return; }
    var miss = [];
    if (!q1) miss.push('走哪个渠道');
    if (isNaN(q2)) miss.push('多少天出掉');
    if (isNaN(q3)) miss.push('到手价');
    var h = miss.length ? p('三问还没答上来：' + miss.join('、') + '。答不上来就不该收。', 'warn')
      : p('三问答上来了：走' + q1 + '，约 ' + fm(q2) + ' 天出掉，到手 ' + fm(q3) + ' 元' + (!isNaN(gp) ? '；留 ' + fm(gp) + ' 元利润，收价上限 <b>' + fm(q3 - gp) + '</b> 元' : '') + '。', 'ok');
    var steps = nval('t61-who', 1, 9);
    if (steps) h += p('九步写了"谁做" ' + steps + ' / 9 步。');
    box('t61-res', h);
  }

  function calcT62A(){
    var ok = nck('t62a-ok', 1, 8), who = nval('t62a-who', 1, 8), fees = nval('t62a-fee', 1, 8);
    if (!ok && !who && !fees) { box('t62a-res', p('还没填。')); return; }
    box('t62a-res', p('记了手续费 ' + fees + ' / 8 个渠道；写了联系人 ' + who + ' 个，已加上 <b>' + ok + '</b> 个（出课标准至少 3 个）。', ok >= 3 ? 'ok' : 'warn'));
  }

  function calcT62B(){
    var rows = 0, ask = [], stale = [];
    for (var i = 1; i <= 10; i++) {
      if (!val('t62b-it' + i)) continue;
      rows++;
      if (rv('t62b-kind' + i) === '挂价') ask.push(i);
      var d = daysSince(val('t62b-d' + i));
      if (!isNaN(d) && d > 7) stale.push(i);
    }
    if (!rows) { box('t62b-res', p('还没写。')); return; }
    var h = p('行情表有 <b>' + rows + '</b> 个款。', rows >= 5 && !ask.length && !stale.length ? 'ok' : '');
    var w = [];
    if (ask.length) w.push('第 ' + ask.join('、') + ' 行看的是挂价：只认成交价，不认挂价（估价错误第 01 条）。');
    if (stale.length) w.push('第 ' + stale.join('、') + ' 行超过 7 天没更新了：每周更新一次（估价错误第 02 条）。');
    box('t62b-res', h + warns(w));
  }

  function calcT62C(){
    var c = {}, rows = 0;
    for (var i = 1; i <= 6; i++) { var t = val('t62c-ty' + i); if (!t || !val('t62c-n' + i)) continue; rows++; c[t] = (c[t] || 0) + 1; }
    if (!rows) { box('t62c-res', p('还没填。')); return; }
    var h = p('外部报价来源 ' + rows + ' 个：' + Object.keys(c).map(function(k){ return k + ' ' + c[k]; }).join('，') + '。', c['上游'] && rows >= 2 ? 'ok' : '');
    var w = [];
    if (!c['上游']) w.push('出课标准要至少 1 个上游。');
    if (rows < 2) w.push('至少两个来源，才能交叉验证。');
    if (rv('t62c-stage')) h += p('现在在"' + rv('t62c-stage') + '"这一步。');
    box('t62c-res', h + warns(w));
  }

  function calcT62D(){
    var mk = nx('t62d-mk'), kc = nx('t62d-kc'), ka = nx('t62d-ka'), kr = nx('t62d-kr'), kd = nx('t62d-kd');
    var saleA = mk.v * kc.v * ka.v * (1 + kr.v / 100) - kd.v, exA = mk.ex || kc.ex || ka.ex || kr.ex || kd.ex;
    put('t62d-o-sale', isNaN(saleA) ? '—' : fm(saleA) + '<small> 元</small>');
    var s0 = n('t62d-sale'), sale = isNaN(s0) ? saleA : s0;
    var f = nx('t62d-fee'), sh = nx('t62d-ship'), au = nx('t62d-auth'), ot = nx('t62d-oth'), dy = nx('t62d-days'), rt0 = nx('t62d-rate'), bk = nx('t62d-back'), gp = nx('t62d-gp'), rm = nx('t62d-room');
    var ex = (isNaN(s0) && exA) || f.ex || sh.ex || au.ex || ot.ex || dy.ex || rt0.ex || bk.ex || gp.ex || rm.ex;
    var net = sale * (1 - f.v / 100) - sh.v - au.v - ot.v;
    var cost = net * rt0.v / 100 * dy.v / 30;
    var cap = net - cost - bk.v - gp.v;
    var open = cap * (1 - rm.v / 100);
    put('t62d-o-net', isNaN(net) ? '—' : fm(net) + '<small> 元</small>');
    put('t62d-o-cost', isNaN(cost) ? '—' : fm(cost) + '<small> 元</small>');
    put('t62d-o-cap', isNaN(cap) ? '—' : fm(cap) + '<small> 元</small>');
    put('t62d-o-open', isNaN(open) ? '—' : fm(open) + '<small> 元</small>');
    var exEl = $('t62d-exnote'); if (exEl) exEl.hidden = !ex;
    var best = null, fast = null;
    for (var i = 1; i <= 3; i++) {
      var cp = n('t62d-cp' + i), cf = n('t62d-cf' + i), co = n('t62d-co' + i), cd = n('t62d-cd' + i);
      if (isNaN(cp)) { put('t62d-cn' + i, '—'); put('t62d-cr' + i, '—'); continue; }
      var cn = cp * (1 - (isNaN(cf) ? 0 : cf) / 100) - (isNaN(co) ? 0 : co);
      var cr = isNaN(cd) ? NaN : cn - cn * rt0.v / 100 * cd / 30;
      put('t62d-cn' + i, yuan(cn));
      put('t62d-cr' + i, yuan(cr));
      var nm = val('t62d-c' + i) || '第 ' + i + ' 个渠道', v = isNaN(cr) ? cn : cr;
      if (!best || v > best[1]) best = [nm, v];
      if (!isNaN(cd) && (!fast || cd < fast[1])) fast = [nm, cd];
    }
    var h = '';
    if (ex) h += p('还有格子没填，示例值暂时替你算着。');
    if (!isNaN(cap)) {
      if (cap <= 0) h += p('按这组数字，收价上限是 ' + fm(cap) + ' 元：这件货没有利润空间，别收。', 'warn');
      else h += p('到手价 ' + fm(net) + ' 元，收价上限 <b>' + fm(cap) + '</b> 元。报价区间：开口 ' + fm(open) + ' 元，最高不超过 ' + fm(cap) + ' 元。', 'ok');
    }
    if (best) h += p('渠道对比：扣完费用和资金成本，' + esc(best[0]) + '到手最多（' + fm(best[1]) + ' 元）' + (fast ? '；' + esc(fast[0]) + '出得最快（' + fm(fast[1]) + ' 天）' : '') + '。');
    box('t62d-res', h || p('还没填。'));
  }

  function calcT62E(){
    var tol = n('t62e-tol'), cnt = 0, errs = [], within = 0, why = 0;
    for (var i = 1; i <= 20; i++) {
      var me = n('t62e-me' + i), rf = n('t62e-ref' + i);
      if (!isNaN(me)) cnt++;
      if (ck('t62e-why' + i)) why++;
      if (isNaN(me) || !(rf > 0)) { put('t62e-err' + i, '—'); continue; }
      var e = (me - rf) / rf * 100;
      errs.push(Math.abs(e));
      var ok = !isNaN(tol) && Math.abs(e) <= tol;
      if (ok) within++;
      mark('t62e-err' + i, (e > 0 ? '+' : '') + fm(e, 1) + '%', isNaN(tol) ? '' : (ok ? 'ok' : 'warn'));
    }
    if (!cnt) { box('t62e-res', p('还没报。')); return; }
    var h = p('报了 ' + cnt + ' / 20 件，折价逻辑说得清的 ' + why + ' 件。');
    if (errs.length) {
      var avg = errs.reduce(function(s, x){ return s + x; }, 0) / errs.length;
      h += p('对上参考价的 ' + errs.length + ' 件，平均误差 <b>' + fm(avg, 1) + '%</b>' + (isNaN(tol) ? '。讲师定了可接受误差以后填在上面。' : '，在 ±' + fm(tol) + '% 以内的 ' + within + ' 件。'), !isNaN(tol) && within === errs.length ? 'ok' : '');
    }
    box('t62e-res', h);
  }

  function calcT62F(){ selfCheck('t62f-e', 't62f', 't62f-res'); }

  function calcT63A(){
    var ask = n('t63a-ask'), cap = n('t63a-cap'), gap = n('t63a-gap'), v = '—', cls = '';
    if (!isNaN(ask) && cap > 0) {
      var d = (ask - cap) / cap * 100;
      if (d <= 0) { v = '在上限以内，可以谈'; cls = 'ok'; }
      else if (!isNaN(gap) && d <= gap) { v = '高出 ' + fm(d, 1) + '%：按依据守价'; cls = 'warn'; }
      else { v = '高出 ' + fm(d, 1) + '%：放弃这一单'; cls = 'warn'; }
    }
    mark('t63a-verdict', v, cls);
    var h = reqLine('t6-3a', '报价决策卡写好了。');
    if (!h && isNaN(ask)) { box('t63a-res', p('还没填。')); return; }
    if (v !== '—') h += p('客户要价 ' + fm(ask) + ' 元，你的上限 ' + fm(cap) + ' 元：' + v + '。', cls);
    if (/最高价|保证|肯定/.test(val('t63a-second'))) h += p('理由里别出现"最高价""保证"这类承诺：只承诺条件，不承诺结果。', 'warn');
    box('t63a-res', h);
  }

  function calcT63B(){
    var s = nval('t63b-s', 1, 10), b = nck('t63b-b', 1, 10), v = nck('t63b-v', 1, 10), ps = nck('t63b-p', 1, 10);
    if (!s && !ps) { box('t63b-res', p('还没写。')); return; }
    var h = p('十个场景：话术写了 ' + s + ' 个，先说了依据 ' + b + ' 个，录像回放 ' + v + ' 个，对练通过 <b>' + ps + '</b> 个。', ps === 10 ? 'ok' : '');
    if (ps > b) h += p('有的场景没先说鉴定结论和估价依据也勾了通过：说不出依据的，退回 6.2.5 重来。', 'warn');
    box('t63b-res', h);
  }

  function calcT63C(){ selfCheck('t63c-e', 't63c', 't63c-res'); }

  function calcT64A(){
    var h = reqLine('t6-4a', 'SOP 写完了，打印贴在收货台。'), x = nck('t64a-x', 1, 8);
    if (!h && !x) { box('t64a-res', p('还没写。')); return; }
    h += p('必拒清单勾了 ' + x + ' / 8 条。', x === 8 ? 'ok' : '');
    var s5 = val('t64a-s5'), s6 = val('t64a-s6');
    if ((val('t64a-s7') || val('t64a-s8')) && (!s5 || !s6)) h += p('来源核查和登记存证要插在"确认"和"付款"之前：先核查、登记、录像，再付款。', 'warn');
    box('t64a-res', h);
  }

  function calcT64B(){
    var any = false, out = [];
    for (var j = 1; j <= 3; j++) {
      var c = 0, miss = [];
      D.check.forEach(function(x, i){ if (ck('t64b-c' + (i + 1) + '-' + j)) c++; else miss.push(i + 1); });
      var it = val('t64b-it' + j);
      if (!it && !c) { mark('t64b-v' + j, '—', ''); continue; }
      any = true;
      if (c === D.check.length) { mark('t64b-v' + j, '七项全过，可以进"确认"', 'ok'); out.push((it ? esc(it) : '第 ' + j + ' 单') + '：可以进"确认"'); }
      else { mark('t64b-v' + j, '还差 ' + (D.check.length - c) + ' 项', 'warn'); out.push((it ? esc(it) : '第 ' + j + ' 单') + '：还差第 ' + miss.join('、') + ' 项，先补，补不上就拒收'); }
    }
    box('t64b-res', any ? ul(out) : p('还没核查。'));
  }

  function calcT64C(){
    var h = reqLine('t6-4c', '三份协议要点齐了。');
    if (!h) { box('t64c-res', p('还没填。')); return; }
    var me = nck('t64c-me', 1, 3), law = nck('t64c-law', 1, 3);
    h += p('信息已填 ' + me + ' / 3 份，律师看过 ' + law + ' / 3 份。', me === 3 ? 'ok' : '');
    box('t64c-res', h);
  }

  function calcT64D(){
    var d = val('t64d-date'), no = val('t64d-no');
    var seq = (no.match(/(\d+)\s*$/) || [])[1];
    put('t64d-code', d ? 'RK' + d.replace(/-/g, '') + '-' + (seq ? ('0' + seq).slice(-2) : '01') : '—');
    var h = reqLine('t6-4d', '回收单和交接单都填好了。');
    if (!h) { box('t64d-res', p('还没填。')); return; }
    var w = [];
    if (!ck('t64d-id')) w.push('身份登记还没勾：不登记就收，是成交错误第 01 条。');
    if (val('t64d-pay') !== '现金' && no && val('t64d-memo').indexOf(no) < 0) w.push('转账备注里没有单号：写上货品和单号，纠纷时才说得清。');
    if (!ck('t64d-sign')) w.push('卖家还没签字。');
    if (!ck('t64d-feat')) w.push('交接前拍下特征点，防调包。');
    box('t64d-res', h + warns(w));
  }

  function calcT64E(){
    var m = nck('t64e-m', 1, 4), hm = nck('t64e-h', 1, 3), ml = nck('t64e-p', 1, 4);
    var h = reqLine('t6-4e', '');
    if (!h && !m && !hm && !ml) { box('t64e-res', p('还没勾。')); return; }
    h += p('见面交易 ' + m + ' / 4，上门收货 ' + hm + ' / 3，异地邮寄 ' + ml + ' / 4。');
    var w = [];
    if (!ck('t64e-m2')) w.push('大额交易一个人去是成交错误第 06 条：两人同行。');
    if (!ck('t64e-p1')) w.push('异地先验货后付款，或者走担保（成交错误第 02 条）。');
    box('t64e-res', h + warns(w));
  }

  function calcT64F(){
    var s = scoreRows(10, function(i){ return rv('t64f-a' + i); }, function(i){ return rv('t64f-k' + i); }, 't64f-r');
    var mine = 0, lured = [];
    for (var i = 1; i <= 10; i++) { if (rv('t64f-a' + i)) mine++; if (rv('t64f-k' + i) === '不收' && rv('t64f-a' + i) === '收') lured.push(i); }
    if (!mine) { box('t64f-res', p('还没判断。')); return; }
    var h = p('判断了 ' + mine + ' / 10 个场景。');
    if (s.done) h += p('讲师已给答案的 ' + s.done + ' 个里答对 <b>' + s.right + '</b> 个。', s.right === s.done ? 'ok' : '');
    if (lured.length) h += p('第 ' + lured.join('、') + ' 个是该拒收的场景你选了"收"：被价格诱惑住了（成交错误第 07 条）。', 'warn');
    box('t64f-res', h);
  }

  function calcT64G(){ selfCheck('t64g-e', 't64g', 't64g-res'); }

  function calcT65A(){
    var c = { '对': 0, '部分对': 0, '错': 0 }, done = 0;
    for (var i = 1; i <= 20; i++) { if (val('t65a-c1-' + i)) done++; var g = rv('t65a-g' + i); if (g) c[g]++; }
    if (!done) { box('t65a-res', p('还没分。')); return; }
    var graded = c['对'] + c['部分对'] + c['错'];
    var h = p('分了 ' + done + ' / 20 件。');
    if (graded) h += p('讲师评了 ' + graded + ' 件：对 ' + c['对'] + '，部分对 ' + c['部分对'] + '，错 ' + c['错'] + '；得分 ' + fm((c['对'] + c['部分对'] * 0.5) / graded * 100) + ' 分（部分对算半分）。', c['错'] ? 'warn' : 'ok');
    box('t65a-res', h);
  }

  function calcT65B(){
    var ok = n('t65b-ok'), wl = n('t65b-warn'), inN = 0, val0 = 0, dsum = 0, dn = 0, over = [], slow = [];
    for (var i = 1; i <= 12; i++) {
      var it = val('t65b-it' + i), st = val('t65b-st' + i), d = daysSince(val('t65b-d' + i));
      if (!it && !val('t65b-d' + i)) { put('t65b-days' + i, '—'); put('t65b-w' + i, '—'); continue; }
      if (st === '已售' || st === '已退回') { put('t65b-days' + i, isNaN(d) ? '—' : d + ' 天'); mark('t65b-w' + i, st, ''); continue; }
      inN++;
      var c = n('t65b-c' + i);
      if (!isNaN(c)) val0 += c;
      if (isNaN(d)) { put('t65b-days' + i, '—'); mark('t65b-w' + i, '填入库日期', ''); continue; }
      put('t65b-days' + i, d + ' 天');
      dsum += d; dn++;
      if (!isNaN(wl) && d > wl) { mark('t65b-w' + i, '到预警线：降价或换渠道', 'warn'); over.push(it || '第 ' + i + ' 行'); }
      else if (!isNaN(ok) && d > ok) { mark('t65b-w' + i, '超过健康线', 'warn'); slow.push(it || '第 ' + i + ' 行'); }
      else mark('t65b-w' + i, '正常', 'ok');
    }
    var h = reqLine('t6-5b', '三条线定好了。');
    if (!inN && !h) { box('t65b-res', p('还没填。')); return; }
    if (inN) h += p('在库 ' + inN + ' 件，货值 ' + fm(val0) + ' 元' + (dn ? '，平均在库 ' + fm(dsum / dn) + ' 天' : '') + '。');
    if (over.length) h += p('到预警线的：' + over.map(esc).join('、') + '。降价、换渠道、拆件、同行调换、打包甩，别舍不得（出货错误第 09 条）。', 'warn');
    if (slow.length) h += p('超过健康线的：' + slow.map(esc).join('、') + '。', 'warn');
    var k = nck('t65b-k', 1, 6);
    if (k < 4) h += p('货品保管只做到 ' + k + ' / 6 项。', 'warn');
    box('t65b-res', h);
  }

  function calcT65C(){
    var owe = 0, flag = [], rows = 0;
    for (var i = 1; i <= 6; i++) {
      var nm = val('t65c-n' + i), cap = n('t65c-cap' + i), mx = n('t65c-max' + i), ow = n('t65c-owe' + i), d = daysSince(val('t65c-since' + i));
      if (!nm && isNaN(cap)) { put('t65c-st' + i, '—'); continue; }
      rows++;
      if (!isNaN(ow)) owe += ow;
      if (!isNaN(ow) && !isNaN(cap) && ow > cap) { mark('t65c-st' + i, '超上限，停止发货', 'warn'); flag.push((nm || '第 ' + i + ' 行') + '超上限'); }
      else if (ow > 0 && !isNaN(d) && !isNaN(mx) && d > mx) { mark('t65c-st' + i, '超期 ' + (d - mx) + ' 天，催款', 'warn'); flag.push((nm || '第 ' + i + ' 行') + '超期'); }
      else if (isNaN(cap)) mark('t65c-st' + i, '先设上限', 'warn');
      else mark('t65c-st' + i, '正常', 'ok');
    }
    var h = reqLine('t6-5c', '账期上限设好了。');
    if (!rows && !h) { box('t65c-res', p('还没填。')); return; }
    if (rows) h += p('登记了 ' + rows + ' 家，当前未结合计 ' + fm(owe) + ' 元。');
    if (flag.length) h += p(flag.map(esc).join('、') + '。对方一跑，钱全没（出货错误第 06 条）。', 'warn');
    if (!ck('t65c-r2')) h += p('只看转账截图就发货是出货错误第 05 条：以到账为准。', 'warn');
    box('t65c-res', h);
  }

  function calcT65D(){
    var c = nck('t65d-c', 1, 8), h = reqLine('t6-5d', '');
    if (!c && !h) { box('t65d-res', p('还没勾。')); return; }
    h += p('上架前检查做到 ' + c + ' / 8 项。', c === 8 ? 'ok' : '');
    if (!(ck('t65d-c1') && ck('t65d-c2') && ck('t65d-c3'))) h += p('瑕疵、翻新、换件一样都不能瞒：隐瞒可能被认定为欺诈，退款加三倍赔偿。', 'warn');
    box('t65d-res', h);
  }

  function calcT65E(){ selfCheck('t65e-e', 't65e', 't65e-res'); }

  function calcT66A(){
    var rows = 0, tiers = [], paths = [], noVisit = 0, due = [], sum = 0;
    for (var i = 1; i <= 15; i++) {
      var nm = val('t66a-n' + i);
      if (!nm) continue;
      rows++;
      tiers.push(val('t66a-t' + i) || '没分层');
      paths.push(val('t66a-p' + i) || '没记来源');
      var m = n('t66a-m' + i); if (!isNaN(m)) sum += m;
      if (val('t66a-d' + i) && !ck('t66a-v' + i)) noVisit++;
      var x = daysSince(val('t66a-x' + i));
      if (!isNaN(x) && x >= 0) due.push(esc(nm));
    }
    if (!rows) { box('t66a-res', p('还没建台账。')); return; }
    var t = tally(tiers), pc = tally(paths);
    var h = p('台账 <b>' + rows + '</b> 人，累计成交额 ' + fm(sum) + ' 元。分层：' + Object.keys(t).map(function(k){ return k + ' ' + t[k]; }).join('，') + '。');
    h += p('来源路径：' + Object.keys(pc).map(function(k){ return k + ' ' + pc[k]; }).join('，') + '。');
    var w = [];
    if (noVisit) w.push(noVisit + ' 个成交过的客户还没做 48 小时回访（复购错误第 06 条）。');
    if (due.length) w.push('到了该触达的日子：' + due.join('、') + '。');
    if (pc['没记来源']) w.push(pc['没记来源'] + ' 个客户没记来源路径，6.6.4 就拆不出哪条路带来了成交。');
    box('t66a-res', h + warns(w));
  }

  function calcT66B(){
    var sm = 0, sd = 0, unpaid = 0, any = false;
    for (var i = 1; i <= 5; i++) {
      var m = n('t66b-m' + i), r = n('t66b-r' + i);
      if (isNaN(m) || isNaN(r)) { put('t66b-due' + i, '—'); continue; }
      any = true;
      var due = m * r / 100;
      sm += m; sd += due;
      if (!ck('t66b-paid' + i)) unpaid += due;
      put('t66b-due' + i, yuan(due));
    }
    put('t66b-sum-m', any ? yuan(sm) : '—');
    put('t66b-sum-due', any ? yuan(sd) : '—');
    put('t66b-unpaid', any ? yuan(unpaid) : '—');
    var h = reqLine('t6-6b', '转介绍方案写好了。');
    if (!h && !any) { box('t66b-res', p('还没填。')); return; }
    if (any) h += p('线人应结合计 ' + fm(sd) + ' 元，还没结 ' + fm(unpaid) + ' 元。', unpaid ? 'warn' : 'ok');
    if (any && !val('t66b-scope')) h += p('线人的授权范围还没写：他以你的名义收错的货、欠的钱，会找你算账（复购错误第 03 条）。', 'warn');
    box('t66b-res', h);
  }

  function calcT66C(){
    var tot = {}, weeks = 0, risk = { nd: 0, np: 0, ac: 0 };
    D.six.forEach(function(s){ tot[s[0]] = 0; });
    for (var w = 1; w <= 4; w++) {
      var jw = n('t66c-w' + w + '-jw');
      if (isNaN(jw)) continue;
      weeks++;
      D.six.forEach(function(s){ var x = n('t66c-w' + w + '-' + s[0]); if (!isNaN(x)) tot[s[0]] += x; });
      D.risk3.forEach(function(r){ var x = n('t66c-w' + w + '-' + r[0]); if (!isNaN(x)) risk[r[0]] += x; });
    }
    if (!weeks) { box('t66c-res', p('还没填。')); return; }
    var r1 = tot.jw > 0 ? tot.ky / tot.jw : NaN, r2 = tot.ky > 0 ? tot.bj / tot.ky : NaN, r3 = tot.bj > 0 ? tot.cj / tot.bj : NaN;
    var h = p('已填 ' + weeks + ' / 4 周：加微 ' + fm(tot.jw) + '，开口 ' + fm(tot.ky) + '，报价 ' + fm(tot.bj) + '，成交 ' + fm(tot.cj) + '，毛利 ' + fm(tot.ml) + ' 元。');
    h += bars([['加微', tot.jw], ['开口', tot.ky], ['报价', tot.bj], ['成交', tot.cj]], Math.max(tot.jw, 1));
    var steps = [['开口率（开口 ÷ 加微）', r1], ['报价率（报价 ÷ 开口）', r2], ['成交率（成交 ÷ 报价）', r3]].filter(function(x){ return !isNaN(x[1]); });
    if (steps.length) {
      var low = steps.reduce(function(a, x){ return x[1] < a[1] ? x : a; }, steps[0]);
      h += p(steps.map(function(x){ return x[0] + ' ' + fm(x[1] * 100, 1) + '%'; }).join('；') + '。掉率最高的是<b>' + low[0].split('（')[0] + '</b>，先补这一环，不要平均用力。');
    }
    var gpd = tot.cj > 0 ? tot.ml / tot.cj : NaN;
    if (!isNaN(gpd)) h += p('填回第一站表 1.4 的真实数：' + (isNaN(r1) ? '' : '开口率 ' + fm(r1 * 100, 1) + '%，') + (isNaN(r2) ? '' : '报价率 ' + fm(r2 * 100, 1) + '%，') + (isNaN(r3) ? '' : '成交率 ' + fm(r3 * 100, 1) + '%，') + '客单毛利 ' + fm(gpd) + ' 元。');
    var rs = risk.nd + risk.np + risk.ac;
    h += rs ? p('风控三问：没登记就收 ' + risk.nd + ' 单，没签协议 ' + risk.np + ' 单，出事 ' + risk.ac + ' 单。同一个漏洞别一直漏（复购错误第 08 条）。', 'warn') : p('风控三问：四周都是 0。', 'ok');
    if (weeks === 4 && !rv('t66c-dec')) h += p('四周填满了，在下面选判断：继续加码、加第二条路，还是换路。');
    box('t66c-res', h);
  }

  function calcT66D(){ selfCheck('t66d-e', 't66d', 't66d-res'); }

  function calcT67A(){
    var cost = {}, buys = 0, sells = 0, gsum = 0, matched = 0;
    for (var i = 1; i <= 5; i++) { var code = val('t67a-bn' + i), c = n('t67a-bp' + i); if (code) { buys++; if (!isNaN(c)) cost[code] = c; } }
    for (var j = 1; j <= 5; j++) {
      var sc = val('t67a-sn' + j), sp = n('t67a-sp' + j), sf = n('t67a-sf' + j);
      if (!sc && isNaN(sp)) { put('t67a-sg' + j, '—'); continue; }
      sells++;
      if (isNaN(sp)) { put('t67a-sg' + j, '填售价'); continue; }
      var net = sp - (isNaN(sf) ? 0 : sf);
      if (sc && Object.prototype.hasOwnProperty.call(cost, sc)) { var g = net - cost[sc]; gsum += g; matched++; mark('t67a-sg' + j, fm(g) + ' 元', g >= 0 ? 'ok' : 'warn'); }
      else mark('t67a-sg' + j, '找不到同编号的收价', 'warn');
    }
    var h = reqLine('t6-7a', '');
    if (!buys && !sells && !h) { box('t67a-res', p('还没记。')); return; }
    h += p('进货 ' + buys + ' 笔，销售 ' + sells + ' 笔' + (matched ? '，对上编号的 ' + matched + ' 笔毛利合计 <b>' + fm(gsum) + '</b> 元' : '') + '。');
    var cash = 0;
    for (var k = 1; k <= 5; k++) { if (val('t67a-bw' + k) === '现金' && n('t67a-bp' + k) >= 10000) cash++; }
    if (cash) h += p(cash + ' 笔万元以上的进货付的现金：大额走转账或对公并备注用途（1.9、6.4.7）。', 'warn');
    box('t67a-res', h);
  }

  function calcT67B(){
    var now = rv('t67b-now');
    if (!now) { box('t67b-res', p('还没选。')); return; }
    if (now === '暂不招') { box('t67b-res', p('暂不招人，这张表先跳过。招第一个人之前回来填。')); return; }
    var a = nck('t67b-a', 1, D.agree.length), c = nck('t67b-c', 1, 5);
    var h = p('员工协议写进 ' + a + ' / ' + D.agree.length + ' 条；内控做到 ' + c + ' / 5 项。', a === D.agree.length ? 'ok' : '');
    var miss = D.agree.filter(function(x, i){ return !ck('t67b-a' + (i + 1)); });
    if (miss.length) h += p('还没写进协议：' + miss.join('、') + '。', 'warn');
    box('t67b-res', h);
  }

  function calcT67C(){
    var h = reqLine('t6-7c', '应急卡写完了，打印贴在收货台、存进手机。');
    box('t67c-res', h || p('还没写。'));
  }

  var CALCS = [calcT61, calcT62A, calcT62B, calcT62C, calcT62D, calcT62E, calcT62F, calcT63A, calcT63B, calcT63C,
               calcT64A, calcT64B, calcT64C, calcT64D, calcT64E, calcT64F, calcT64G, calcT65A, calcT65B, calcT65C, calcT65D, calcT65E,
               calcT66A, calcT66B, calcT66C, calcT66D, calcT67A, calcT67B, calcT67C];
