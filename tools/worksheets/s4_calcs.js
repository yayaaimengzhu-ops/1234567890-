  function addDays(s, k){ var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + k); return d; }
  function md(d){ return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }

  function calcT41(){
    var ok = nck('t41-ok', 1, 5), aft = nval('t41-a', 1, 5), peer = rv('t41-peer');
    if (!ok && !aft && !peer) { box('t41-res', p('还没填。')); return; }
    var h = p('五项改完 ' + ok + ' / 5，写了改后方案 ' + aft + ' / 5。', ok === 5 ? 'ok' : '');
    if (peer === '敢') h += p('同桌说敢把货交给你。', 'ok');
    else if (peer) h += p('同桌说"' + peer + '"' + (val('t41-why') ? '：' + esc(val('t41-why')) : '') + '。按他的理由再改一轮。', 'warn');
    box('t41-res', h);
  }

  function calcT42A(){
    var c = {}, rows = 0, noAuth = [], noW = 0, bad = [];
    for (var d = 1; d <= 30; d++) {
      var ty = val('t42a-ty' + d), ct = val('t42a-c' + d);
      if (!ty && !ct) continue;
      rows++;
      if (ty) c[ty] = (c[ty] || 0) + 1;
      if ((ty === '成交实拍' || ty === '客户反馈') && !ck('t42a-auth' + d)) noAuth.push(d);
      if (ct && !ck('t42a-w' + d)) noW++;
      var f = found(ct, D.bad);
      if (f.length) bad.push('第 ' + d + ' 天（' + f.join('、') + '）');
    }
    if (!rows) { box('t42a-res', p('还没排。')); return; }
    var h = p('排了 <b>' + rows + '</b> / 30 天。', rows >= 30 ? 'ok' : '');
    var mx = Math.max.apply(null, D.types.map(function(t){ return c[t] || 0; }).concat([1]));
    h += bars(D.types.map(function(t){ return [t, c[t] || 0]; }), mx);
    var tot = D.types.reduce(function(s, t){ return s + (c[t] || 0); }, 0), diff = [];
    D.types.forEach(function(t, k){
      var r = n('t42a-r' + (k + 1));
      if (isNaN(r) || !tot) return;
      var act = (c[t] || 0) / tot * 100;
      if (Math.abs(act - r) >= 10) diff.push(t + ' 实际 ' + fm(act) + '%，建议 ' + fm(r) + '%');
    });
    var w = [];
    if (diff.length) w.push('和讲师给的配比差得多：' + diff.join('；') + '。');
    if (noAuth.length) w.push('第 ' + noAuth.join('、') + ' 天是成交实拍或客户反馈，还没勾"授权打码"。');
    if (bad.length) w.push('内容里有违禁说法：' + bad.join('；') + '。');
    if (noW) w.push(noW + ' 天还没勾"违禁词已查"。');
    box('t42a-res', h + warns(w));
  }

  function calcT42B(){
    var rows = 0, pa = 0, pm = 0, pw = 0, fixed = 0;
    for (var i = 1; i <= 10; i++) {
      if (!val('t42b-t' + i) && !rv('t42b-a' + i)) continue;
      rows++;
      var a = rv('t42b-a' + i) === '没有', m = rv('t42b-m' + i) === '没打', w = rv('t42b-w' + i) === '有';
      if (a) pa++;
      if (m) pm++;
      if (w) pw++;
      if ((a || m || w) && val('t42b-f' + i)) fixed++;
    }
    if (!rows) { box('t42b-res', p('还没查。')); return; }
    var probs = pa + pm + pw;
    var h = p('查了 ' + rows + ' 条：没授权 ' + pa + ' 条，没打码 ' + pm + ' 条，有违禁词 ' + pw + ' 条。', probs ? 'warn' : 'ok');
    if (probs) h += p('写了改法的 ' + fixed + ' 条。能删的当场删，删不了的补授权、补打码。');
    box('t42b-res', h);
  }

  function calcT43A(){
    var steps = nval('t43a-s', 1, 8), mots = nval('t43a-m', 1, 4), sens = 0;
    for (var i = 1; i <= 4; i++) if (rv('t43a-mp' + i) === '是') sens++;
    if (!steps && !mots) { box('t43a-res', p('还没写。')); return; }
    var h = p('问诊八步写了 ' + steps + ' / 8 步；四类动机记了 ' + mots + ' / 4 类。' + (ck('t43a-pass') ? '对练已通过。' : ''), steps === 8 && ck('t43a-pass') ? 'ok' : '');
    var w = [];
    if (sens > 1) w.push('标了 ' + sens + ' 类"价格敏感"。大纲 1.2 的说法是四类动机里只有一类是价格敏感，再对一下。');
    var txt = '';
    for (var j = 1; j <= 8; j++) txt += val('t43a-s' + j) + '\n';
    if (/[0-9０-９]+ *(元|块|万)/.test(txt)) w.push('问诊话术里出现了价格：这一站不给数字（转化错误第 06 条）。');
    if (/保证|肯定收|包收/.test(txt + val('t43a-just'))) w.push('话术里有"保证""肯定收"这类承诺：截图就是纠纷证据（转化错误第 07 条）。');
    box('t43a-res', h + warns(w));
  }

  function calcT43B(){
    var tags = nval('t43b-tag', 1, D.signals.length), recs = 0, stop = [], rev = [];
    for (var i = 1; i <= 5; i++) {
      var sig = [];
      D.signals.forEach(function(s, j){ if (ck('t43b-c' + i + '-s' + (j + 1))) sig.push(j); });
      var act = rv('t43b-act' + i), minor = sig.indexOf(D.signals.length - 1) >= 0;
      if (val('t43b-c' + i) || sig.length) recs++;
      if (minor) { mark('t43b-r' + i, act === '停止' ? '已停止' : '立即停止', act === '停止' ? 'ok' : 'warn'); if (act !== '停止') stop.push(i); }
      else if (sig.length >= 2) { mark('t43b-r' + i, sig.length + ' 个信号，成交前逐条复核', 'warn'); if (act === '继续问诊') rev.push(i); }
      else if (sig.length === 1) mark('t43b-r' + i, '记进标签', '');
      else mark('t43b-r' + i, '—', '');
    }
    if (!tags && !recs) { box('t43b-res', p('还没填。')); return; }
    var h = p('七个信号写了标签 ' + tags + ' / 7 个；问诊记录 ' + recs + ' 条。', tags === 7 ? 'ok' : '');
    var w = [];
    if (stop.length) w.push('第 ' + stop.join('、') + ' 位客户听出是未成年人，要立即停止，不谈价、不约见（转化错误第 09 条）。');
    if (rev.length) w.push('第 ' + rev.join('、') + ' 位客户出现两个以上信号还在"继续问诊"：至少标记复核，成交前在 6.4.4 逐条过。');
    box('t43b-res', h + warns(w));
  }

  function calcT44A(){
    var h = reqLine('t4-4a', '要图话术写完了。');
    box('t44a-res', h || p('还没写。'));
  }

  function calcT44B(){
    var sent = 0, full = 0, noSearch = [], arch = 0;
    for (var i = 1; i <= 5; i++) {
      if (!val('t44b-d' + i) && !val('t44b-c' + i)) continue;
      if (val('t44b-d' + i)) sent++;
      var f = rv('t44b-full' + i);
      if (f === '齐了') full++;
      if ((f === '齐了' || f === '缺几张') && !ck('t44b-s' + i)) noSearch.push(i);
      if (ck('t44b-a' + i)) arch++;
    }
    if (!sent && !full) { box('t44b-res', p('还没发要图请求。')); return; }
    var h = p('发出要图请求 <b>' + sent + '</b> 个（出课标准 3 个），按清单收齐 ' + full + ' 个，已归档 ' + arch + ' 个。', sent >= 3 && full >= 1 ? 'ok' : '');
    var w = [];
    if (noSearch.length) w.push('第 ' + noSearch.join('、') + ' 个客户的图还没以图搜图：防盗图、防借真图卖假货（转化错误第 11 条）。');
    if (full && arch < full) w.push('收齐的图要按客户归档，这是后面存证的第一批材料。');
    box('t44b-res', h + warns(w));
  }

  function calcT45(){
    var today = today0(), due = [], rows = 0;
    for (var i = 1; i <= 10; i++) {
      var c = val('t45-c' + i), f = val('t45-f' + i), l = val('t45-l' + i) || f, s = val('t45-s' + i);
      if (!c && !f) { put('t45-next' + i, '—'); continue; }
      rows++;
      if (s === '已成交') { mark('t45-next' + i, '已成交，转复购（6.6）', 'ok'); continue; }
      if (s === '明确拒绝') { mark('t45-next' + i, '停止跟进', ''); continue; }
      if (!f) { mark('t45-next' + i, '填第一次聊的日期', ''); continue; }
      var last = new Date(l + 'T00:00:00'), node = null;
      for (var k = 1; k < D.nodes.length; k++) { if (addDays(f, D.nodes[k]) > last) { node = D.nodes[k]; break; } }
      if (node === null) {
        mark('t45-next' + i, s === '沉默' ? '死单激活：用真实行情说话' : '三十天节点已过', s === '沉默' ? 'warn' : '');
        if (s === '沉默') due.push(esc(c || '第 ' + i + ' 行') + '（死单激活）');
        continue;
      }
      var at = addDays(f, node);
      if (at <= today) { mark('t45-next' + i, '该跟进了：' + node + ' 天节点', 'warn'); due.push(esc(c || '第 ' + i + ' 行') + '（' + node + ' 天节点）'); }
      else mark('t45-next' + i, node + ' 天节点：' + md(at), '');
    }
    var h = reqLine('t4-5', '跟进节奏定好了。');
    if (!rows && !h) { box('t45-res', p('还没填。')); return; }
    if (rows) h += due.length ? p('今天该跟进：' + due.join('、') + '。', 'warn') : p('记录里今天没有要跟进的。', 'ok');
    if (/跌|涨价|最后一次|错过/.test(val('t45-dead'))) h += p('死单激活话术别制造焦虑，用真实行情说话（转化错误第 13 条）。', 'warn');
    box('t45-res', h);
  }

  function calcT46(){
    var h = selfCheckHtml('t46-e', 't46'), ex = 0, fixed = 0;
    for (var i = 1; i <= 8; i++) { if (nck('t46-x' + i + '-', 1, 3)) ex++; if (val('t46-r' + i)) fixed++; }
    if (!h && !ex) { box('t46-res', p('还没作答。')); return; }
    if (ex || fixed) h += p('聊天找错：标出问题 ' + ex + ' / 8 段，写了改法 ' + fixed + ' 段。');
    box('t46-res', h);
  }

  var CALCS = [calcT41, calcT42A, calcT42B, calcT43A, calcT43B, calcT44A, calcT44B, calcT45, calcT46];
