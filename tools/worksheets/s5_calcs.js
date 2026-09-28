  function calcT51(){
    var b = nx('t51-buy'), r = nx('t51-back'), g = nx('t51-gp');
    var ex = b.ex || r.ex || g.ex, loss = b.v - r.v, cnt = g.v > 0 ? loss / g.v : NaN;
    put('t51-o-loss', isNaN(loss) ? '—' : fm(Math.max(loss, 0)) + '<small> 元</small>');
    put('t51-o-n', isNaN(cnt) ? '—' : fm(Math.max(cnt, 0), 1) + '<small> 单</small>');
    var h = '';
    if (ex) h += p('还有格子没填，灰字示例值暂时替你算着。', '');
    if (!isNaN(cnt) && loss > 0) h += p('这一单亏掉 <b>' + fm(loss) + '</b> 元，按每单毛利 ' + fm(g.v) + ' 元算，要白干 <b>' + fm(cnt, 1) + '</b> 单才补得回来。', 'warn');
    else if (!isNaN(loss)) h += p('按这组数字没有亏损。换一组更接近真实的数字再算。');
    var cs = nval('t51-c', 1, 3);
    if (cs) h += p('三道防线的成本记了 ' + cs + ' / 3 条。');
    box('t51-res', h || p('还没填。'));
  }

  function calcT52A(){
    var s = scoreRows(D.scen.length, function(i){ return val('t52a-a' + i); }, function(i){ return val('t52a-k' + i); }, 't52a-r');
    var mine = nval('t52a-a', 1, D.scen.length);
    if (!mine) { box('t52a-res', p('还没作答。')); return; }
    var h = p('已判断 ' + mine + ' / ' + D.scen.length + ' 个场景。');
    if (s.done) {
      h += p('讲师已给答案的 ' + s.done + ' 题里，答对 <b>' + s.right + '</b> 题，正确率 ' + pct(s.right, s.done) + '。', s.right === s.done ? 'ok' : '');
      var wrong = [], self = 0;
      for (var i = 1; i <= D.scen.length; i++) {
        var a = val('t52a-a' + i), k = val('t52a-k' + i);
        if (a && k && a !== k) { wrong.push(i); if (a === D.opts[0]) self++; }
      }
      if (wrong.length) h += p('答错的：第 ' + wrong.join('、') + ' 题。' + (self ? '其中 ' + self + ' 题是该兜底却选了"自己判"：这是最贵的一种错（鉴定错误第 01 条）。' : ''), 'warn');
    } else h += p('讲师公布答案后，在"讲师答案"一列选上，对错会自动标出来。');
    box('t52a-res', h);
  }

  function calcT52B(){
    var c = { '上游': 0, '同行复核': 0, '鉴定机构': 0, '平台鉴定': 0 }, real = 0, rows = 0;
    for (var i = 1; i <= 8; i++) {
      var ty = val('t52b-ty' + i), nm = val('t52b-n' + i);
      if (!ty || !nm) continue;
      rows++;
      c[ty]++;
      if (ck('t52b-ok' + i)) real++;
    }
    if (!rows) { box('t52b-res', p('还没填。')); return; }
    var need = [['上游', 1], ['同行复核', 2], ['鉴定机构', 1]], miss = [];
    need.forEach(function(x){ if (c[x[0]] < x[1]) miss.push(x[0] + '还差 ' + (x[1] - c[x[0]]) + ' 个'); });
    var h = p('上游 ' + c['上游'] + ' 个，同行复核 ' + c['同行复核'] + ' 个，鉴定机构 ' + c['鉴定机构'] + ' 家，平台鉴定 ' + c['平台鉴定'] + ' 个；实际合作过 ' + real + ' 个。', miss.length ? '' : 'ok');
    h += miss.length ? p('离出课标准：' + miss.join('，') + '。', 'warn') : p('兜底资源达到出课标准。', 'ok');
    box('t52b-res', h);
  }

  function calcT52C(){
    var h = reqLine('t5-2c', '上游协议草稿要点齐了。');
    if (!h) { box('t52c-res', p('还没填。')); return; }
    var s = nck('t52c-s', 1, 3);
    if (s < 3) h += p('三个预警信号还有 ' + (3 - s) + ' 个没记住：结算越拖越长、兜底条件临时加码、开始打听你的客户。', 'warn');
    box('t52c-res', h);
  }

  function calcT53A(){
    var steps = 0;
    for (var i = 1; i <= 6; i++) if (val('t53a-w' + i) && val('t53a-t' + i)) steps++;
    var dims = nck('t53a-d', 1, 5), revs = nval('t53a-r', 1, 6), na = nck('t53a-n', 1, 10);
    if (!steps && !val('t53a-cat')) { box('t53a-res', p('还没写。')); return; }
    var h = p((val('t53a-cat') ? val('t53a-cat') + (val('t53a-brand') ? ' · ' + esc(val('t53a-brand')) : '') + '：' : '') + '动线写了 ' + steps + ' / 6 步，五个通用维度覆盖 ' + dims + ' / 5，修订记录 ' + revs + ' 条。', steps === 6 && revs ? 'ok' : '');
    var w = [];
    if (steps === 6 && !revs) w.push('交的是修订过的版本：盲测以后回来改。');
    if (dims < 5) w.push('还有 ' + (5 - dims) + ' 个通用维度没覆盖。');
    if ((val('t53a-cat') === '包' || val('t53a-cat') === '表') && na < 3) w.push('非真假问题（翻新、换件、拼装……）比假货更常见，检查项补上。');
    var d = daysSince(val('t53a-date')), upd = n('t512-upd');
    if (!isNaN(d) && !isNaN(upd) && d > upd) w.push('动线卡上次修订是 ' + d + ' 天前，超过了你在表 5.12 定的 ' + fm(upd) + ' 天。');
    box('t53a-res', h + warns(w));
  }

  function calcT53B(){
    var k = nval('t53b-x', 1, 10), t = nval('t53b-g', 1, 3);
    box('t53b-res', k || t ? p('一眼假破绽记了 ' + k + ' / 10 条；高仿档次记了 ' + t + ' / 3 档。', k === 10 ? 'ok' : '') : p('还没记。'));
  }

  function calcT58(){
    var h = reqLine('t5-8', '七个品类的隔屏边界都定了。');
    if (!h) { box('t58-res', p('还没填。')); return; }
    var f = nck('t58-f', 1, 3);
    if (f < 3) h += p('图片造假的三项核查只勾了 ' + f + ' 项：图是真的，寄来的可能是假的。', 'warn');
    box('t58-res', h);
  }

  function calcT59(){
    var now = 0, later = 0, any = false, ai = '';
    D.tools.forEach(function(t, k){
      var i = k + 1, w = val('t59-w' + i), b = n('t59-b' + i);
      if (w) any = true;
      if (!isNaN(b)) { if (w === '现在买') now += b; else if (w === '第 2 阶段' || w === '第 3 阶段') later += b; }
      if (t === 'AI 鉴定工具') ai = w;
    });
    put('t59-sum', now ? fm(now) + ' 元' : '—');
    if (!any) { box('t59-res', p('还没填。')); return; }
    var h = p('现在要花 <b>' + fm(now) + '</b> 元，第 2、3 阶段再花 ' + fm(later) + ' 元。');
    if (ai === '现在买' || ai === '已经有') h += p('AI 工具只做辅助筛查，结论不能直接用来收货。');
    box('t59-res', h + reqLine('t5-9', '采购计划写完了。'));
  }

  function calcT510(){
    var h = reqLine('t5-10', '应急卡和六个推演都写完了，打印出来贴在收货台。');
    if (!h) { box('t510-res', p('还没填。')); return; }
    var c = {};
    for (var i = 1; i <= D.cases.length; i++) { var l = val('t510-l' + i); if (l) c[l] = (c[l] || 0) + 1; }
    var keys = Object.keys(c);
    if (keys.length) h += p('六个场景错在：' + keys.map(function(k){ return k + ' ' + c[k] + ' 个'; }).join('，') + '。');
    box('t510-res', h);
  }

  function calcT511(){
    var h = reqLine('t5-11', '六个场面的话术写完了。');
    if (!h) { box('t511-res', p('还没写。')); return; }
    var bad = [];
    for (var i = 1; i <= 6; i++) { if (/假货|是假的|假的|赝品|高仿/.test(val('t511-s' + i))) bad.push(i); }
    if (bad.length) h += p('第 ' + bad.join('、') + ' 条话术里替客户下了"假"的定论：只说"不收"或"无法确认"，讲清依据（鉴定错误第 12 条）。', 'warn');
    else if (val('t511-s5')) h += p('没有替客户下"假货"定论。', 'ok');
    box('t511-res', h);
  }

  function calcT512(){
    var h = reqLine('t5-12', '内控规矩定好了。');
    if (!h) { box('t512-res', p('还没填。')); return; }
    if (!val('t512-staff')) h += p('有员工的，把"看走眼谁承担"写进员工协议（6.7.2）。');
    box('t512-res', h);
  }

  function calcT513(){ selfCheck('t513-e', 't513', 't513-res'); }

  function calcT514A(){
    var s = scoreRows(D.scen.length, function(i){ return val('t52a-a' + i); }, function(i){ return val('t52a-k' + i); }, 't52a-r');
    put('t514a-n4', s.done ? s.done + ' 题' : '—');
    put('t514a-k4', s.done ? s.right + ' 题' : '—');
    put('t514a-p4', s.done ? pct(s.right, s.done) : '—');
    var lines = [], any = false, weak = null, over = [];
    for (var i = 1; i <= 5; i++) {
      var nn = i === 4 ? s.done : n('t514a-n' + i), kk = i === 4 ? s.right : n('t514a-k' + i);
      if (i !== 4) put('t514a-p' + i, nn > 0 && !isNaN(kk) ? pct(kk, nn) : '—');
      if (nn > 0 && !isNaN(kk)) {
        any = true;
        var r = kk / nn;
        lines.push('第' + '一二三四五'.charAt(i - 1) + '轮 ' + pct(kk, nn));
        if (weak === null || r < weak[1]) weak = [i, r];
        if (kk > nn) over.push('第' + '一二三四五'.charAt(i - 1) + '轮');
      }
    }
    if (!any) { box('t514a-res', p('还没记分。')); return; }
    var h = p(lines.join('，') + '。');
    if (over.length) h += p(over.join('、') + '答对的比题数还多，核一下。', 'warn');
    if (weak) h += p('最弱的是第' + '一二三四五'.charAt(weak[0] - 1) + '轮。' + (weak[0] === 4 ? '第四轮是这一站真正的考核点：先把决策表背熟，判不了就走兜底。' : '回到对应的小节再练一遍。'), weak[1] < 1 ? 'warn' : 'ok');
    if (!ck('t514a-rev')) h += p('对完答案，动线卡当场修订（表 5.3A）。');
    box('t514a-res', h);
  }

  function calcT514B(){
    var t = 0, b = 0;
    for (var i = 1; i <= 5; i++) { if (val('t514b-t' + i)) { t++; if (ck('t514b-b' + i)) b++; } }
    if (!t) { box('t514b-res', p('还没写。')); return; }
    var h = p('写了 ' + t + ' / 5 条选题，过了 2.3.8 边界的 ' + b + ' 条。', t === 5 && b === 5 ? 'ok' : '');
    if (b < t) h += p('还没过边界的选题先别发：只讲特征，不点名卖家和店铺，不对别人的货下公开结论。', 'warn');
    box('t514b-res', h);
  }

  var CALCS = [calcT51, calcT52A, calcT52B, calcT52C, calcT53A, calcT53B, calcT58, calcT59, calcT510, calcT511, calcT512, calcT513, calcT514A, calcT514B];
