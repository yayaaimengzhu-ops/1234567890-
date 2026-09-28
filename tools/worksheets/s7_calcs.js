  function addDays(s, k){ var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + k); return d; }
  function md(d){ return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }

  function calcT71(){
    var fed = nck('t71-f', 1, 6), asked = nval('t71-q', 1, 5);
    if (!fed && !asked) { box('t71-res', p('还没填。')); return; }
    var h = p('喂进去 ' + fed + ' / 6 类资料；五类问题问了 ' + asked + ' / 5 类。', fed === 6 && asked === 5 ? 'ok' : '');
    if (rv('t71-ok1') === '能') h += p('鉴定的答案选了"能直接用"：鉴定结论绝对不能只信 AI，走动线卡和兜底复核。', 'warn');
    var noCheck = [];
    D.ask.forEach(function(k, i){ if (val('t71-q' + (i + 1)) && !val('t71-c' + (i + 1))) noCheck.push(k); });
    if (noCheck.length) h += p(noCheck.join('、') + '问了但还没写怎么复核。', 'warn');
    box('t71-res', h);
  }

  function calcT72(){
    var big = [], any = false;
    D.six.forEach(function(s){
      var a = n('t72-' + s[0] + '-a'), b = n('t72-' + s[0] + '-b');
      if (isNaN(a) || isNaN(b)) { put('t72-' + s[0] + '-d', '—'); return; }
      any = true;
      var d = b - a;
      put('t72-' + s[0] + '-d', (d > 0 ? '+' : '') + fm(d, 1) + ' ' + s[2]);
      if (a !== 0 && Math.abs(d / a) >= 0.2) big.push(s[1] + '（假设 ' + fm(a, 1) + '，真实 ' + fm(b, 1) + '）');
    });
    var h = reqLine('t7-2', '校准完了。第一站表 1.7B 右边一列也填上。');
    if (!h && !any) { box('t72-res', p('还没填。')); return; }
    if (big.length) h += p('和第一站的假设差两成以上的：' + big.join('；') + '。按真实数重算一遍表 1.4 的每天动作量。', 'warn');
    else if (any) h += p('真实数和假设差得不多。', 'ok');
    var ch = [];
    if (rv('t72-cat') === '换') ch.push('品类');
    if (rv('t72-path') === '换') ch.push('路径');
    if (ch.length) h += p('这次改了' + ch.join('和') + '：把新的起步模式、路径和风险敞口写进表 7.4 的 30 天执行表。');
    box('t72-res', h);
  }

  function calcT73A(){
    var c = { '做到了': 0, '有时': 0, '没做到': 0 }, ans = 0, gaps = {};
    D.red.forEach(function(r, i){
      var v = rv('t73a-r' + (i + 1));
      if (!v) return;
      ans++; c[v]++;
      if (v !== '做到了') (gaps[r[2]] = gaps[r[2]] || []).push(('0' + (i + 1)).slice(-2) + ' ' + r[0] + (v === '有时' ? '（有时）' : ''));
    });
    var pre = n('t73a-pre'), post = n('t73a-post');
    put('t73a-diff', !isNaN(pre) && !isNaN(post) ? (post - pre > 0 ? '多了 ' + (post - pre) + ' 题' : (post - pre < 0 ? '少了 ' + (pre - post) + ' 题' : '一样')) : '—');
    if (!ans && isNaN(pre)) { box('t73a-res', p('还没作答。')); return; }
    var h = p('已答 ' + ans + ' / ' + D.red.length + ' 条：做到了 ' + c['做到了'] + '，有时 ' + c['有时'] + '，没做到 <b>' + c['没做到'] + '</b>。', c['没做到'] || c['有时'] ? 'warn' : 'ok');
    ['官司', '人身', '亏钱', '封号', '全部'].forEach(function(k){
      if (gaps[k]) h += p('<b>会' + (k === '全部' ? '让所有漏洞一直漏' : (k === '人身' ? '出人身安全问题' : (k === '官司' ? '摊上官司' : k))) + '的：</b>') + ul(gaps[k]);
    });
    if (!isNaN(pre) && !isNaN(post)) h += p('课前风险自测选第三项 ' + pre + ' 题，结营 ' + post + ' 题。', post < pre ? 'ok' : '');
    box('t73a-res', h);
  }

  function calcT73B(){
    var need = 0, miss = [], noInfo = [];
    D.agr.forEach(function(k, i){
      var j = i + 1;
      if (rv('t73b-n' + j) !== '需要') return;
      need++;
      if (!ck('t73b-r' + j)) miss.push(k);
      else if (!ck('t73b-m' + j)) noInfo.push(k);
    });
    var h = reqLine('t7-3b', '');
    if (!h) { box('t73b-res', p('还没核对。')); return; }
    h += p('需要的协议 ' + need + ' 份。', !miss.length && !noInfo.length ? 'ok' : '');
    if (miss.length) h += p('还没准备：' + miss.join('、') + '。当场补。', 'warn');
    if (noInfo.length) h += p('准备了但还没填自己的信息：' + noInfo.join('、') + '。', 'warn');
    box('t73b-res', h);
  }

  function calcT73C(){
    var h = reqLine('t7-3c', '合订版应急卡齐了，随身带着。');
    box('t73c-res', h || p('还没填。'));
  }

  function calcT73D(){
    var c = { '对': 0, '部分对': 0, '错': 0 }, done = 0;
    for (var i = 1; i <= 10; i++) { if (rv('t73d-c' + i)) done++; var g = rv('t73d-g' + i); if (g) c[g]++; }
    if (!done) { box('t73d-res', p('还没判断。')); return; }
    var graded = c['对'] + c['部分对'] + c['错'];
    var h = p('判断了 ' + done + ' / 10 个场景。');
    if (graded) h += p('讲师评了 ' + graded + ' 个：对 ' + c['对'] + '，部分对 ' + c['部分对'] + '，错 ' + c['错'] + '；得分 ' + fm((c['对'] + c['部分对'] * 0.5) / graded * 100) + ' 分。', c['错'] ? 'warn' : 'ok');
    box('t73d-res', h);
  }

  function calcT74(){
    var st = val('t74-start'), today = today0(), late = [];
    D.nodes.forEach(function(d){
      if (!st) { put('t74-due' + d, '—'); return; }
      var due = addDays(st, d), done = ck('t74-done' + d);
      if (!done && due < today) { mark('t74-due' + d, md(due) + '（已过）', 'warn'); late.push('第 ' + d + ' 天'); }
      else mark('t74-due' + d, md(due), done ? 'ok' : '');
    });
    var b = n('t74-f-buy'), s = n('t74-f-sell'), f = n('t74-f-fee');
    var gp = !isNaN(b) && !isNaN(s) ? s - b - (isNaN(f) ? 0 : f) : NaN;
    put('t74-f-gp', isNaN(gp) ? '—' : fm(gp) + ' 元');
    var h = reqLine('t7-4', '30 天执行表排好了。');
    if (!h && !st) { box('t74-res', p('还没填。')); return; }
    if (late.length) h += p(late.join('、') + '的作业过了截止日期还没交。', 'warn');
    var gaps = nval('t74-g', 1, 5), fixed = nck('t74-gc', 1, 5);
    if (gaps) h += p('没达标的项写了 ' + gaps + ' 条，已补 ' + fixed + ' 条。');
    if (!isNaN(gp)) {
      h += p('第一单：收 ' + fm(b) + ' 元，出 ' + fm(s) + ' 元，毛利 <b>' + fm(gp) + '</b> 元' + (val('t74-f-days') ? '，用了 ' + val('t74-f-days') + ' 天' : '') + '。', gp > 0 ? 'ok' : 'warn');
      var m = [];
      if (!ck('t74-f-src')) m.push('来源核查');
      if (!ck('t74-f-agr')) m.push('协议');
      if (!ck('t74-f-evi')) m.push('存证');
      if (m.length) h += p('第一单的' + m.join('、') + '不齐全：每一单都要有合同和存证。', 'warn');
    }
    box('t74-res', h);
  }

  function calcT75(){
    var ok = 0, no = [], loose = [];
    D.std.forEach(function(m, i){
      var v = rv('t75-s' + (i + 1));
      if (v === '已达标') ok++;
      if (v === '没达标') { no.push(m); if (!ck('t75-m' + (i + 1))) loose.push(m); }
    });
    var h = reqLine('t7-5', '出课标准确认完成，学员和讲师都签了字。');
    if (!h) { box('t75-res', p('还没确认。')); return; }
    h += p('已达标 ' + ok + ' / ' + D.std.length + ' 个模块。', no.length ? '' : 'ok');
    if (no.length) h += p('没达标：' + no.join('、') + '。', 'warn');
    if (loose.length) h += p(loose.join('、') + '还没写进表 7.4：没达标的项都要写进 30 天执行表。', 'warn');
    box('t75-res', h);
  }

  var CALCS = [calcT71, calcT72, calcT73A, calcT73B, calcT73C, calcT73D, calcT74, calcT75];
