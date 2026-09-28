  function calcT0(){
    var risky = [], riskyPost = [], ans = 0, ansPost = 0, better = 0, worse = 0;
    for (var i = 1; i <= 10; i++) {
      var a = rv('t0-q' + i + '-pre'), b = rv('t0-q' + i + '-post');
      if (a) ans++;
      if (b) ansPost++;
      if (a === '3') risky.push(i);
      if (b === '3') riskyPost.push(i);
      if (a && b) { if (+b < +a) better++; else if (+b > +a) worse++; }
    }
    if (!ans) { box('t0-res', p('还没作答。')); return; }
    var h = p('课前已答 <b>' + ans + ' / 10</b> 题。');
    if (risky.length) {
      var st = [];
      risky.forEach(function(i){ var s = (D.t0 || [])[i - 1]; if (s && st.indexOf(s) < 0) st.push(s); });
      h += p('选了第三项的题：第 ' + risky.join('、') + ' 题。上课时这几处多留心：' + st.join('；') + '。', 'warn');
    } else {
      h += p('没有选第三项的题。', 'ok');
    }
    if (ansPost) h += p('结营已答 <b>' + ansPost + ' / 10</b> 题：比课前改善 ' + better + ' 题' + (worse ? '，变差 ' + worse + ' 题' : '') + '；仍选第三项的 ' + riskyPost.length + ' 题。');
    box('t0-res', h);
  }

  function calcT11(){
    var now = [], want = [];
    (D.t11 || []).forEach(function(r, i){
      if (ck('t11-now-' + (i + 1))) now.push(r);
      if (ck('t11-want-' + (i + 1))) want.push(r);
    });
    if (!now.length && !want.length) { box('t11-res', p('还没勾选。')); return; }
    box('t11-res', p('我现在是：' + (now.length ? now.join('、') : '还不在货流里')) + p('我想做：' + (want.length ? want.join('、') : '还没想好')) + p('我们站在回收端：靠差价和周转赚钱。'));
  }

  function calcT12(){
    var hit = [], ans = 0, paths = [];
    (D.t12 || []).forEach(function(m, i){
      var v = rv('t12-m' + (i + 1));
      if (v) ans++;
      if (v === '信' || v === '半信') hit.push((i + 1) + '. 以为' + m);
    });
    (D.t12p || []).forEach(function(pn, i){ if (ck('t12-path-' + (i + 1))) paths.push(pn); });
    if (!ans && !paths.length) { box('t12-res', p('还没作答。')); return; }
    var h = p('已答 ' + ans + ' / 9 条。');
    if (hit.length) h += p('原来信或半信的：' + hit.join('；') + '。这几条对应的站要认真听。', 'warn');
    else if (ans === 9) h += p('九条都不信，入门认知没有卡点。', 'ok');
    if (paths.length) h += p('感兴趣的路：' + paths.join('、') + '。');
    box('t12-res', h);
  }

  function calcT13(){
    var main = [], sup = [], ans = 0;
    (D.t13 || []).forEach(function(m, i){
      var v = rv('t13-m' + (i + 1));
      if (v) ans++;
      if (v === '主做') main.push(m);
      if (v === '补充') sup.push(m);
    });
    if (!ans) { box('t13-res', p('还没选。')); return; }
    var h = p('主做：' + (main.length ? main.join('、') : '还没选') + (sup.length ? '　补充：' + sup.join('、') : ''));
    var w = [];
    if (main.length > 1) w.push('主做只选一个，其余改成"补充"。');
    if (!main.length && ans === 5) w.push('五种都没选主做，先定一个。');
    if (main.indexOf('纯回收赚差价') >= 0 || main.indexOf('门店零售') >= 0) w.push('提醒：第 1 阶段按安全通道走（表 1.6A），大货吃不下就转撮合。');
    if (main.indexOf('鉴定服务收费') >= 0) w.push('提醒：鉴定服务要为结论负责，先确认自己的鉴定能力到了哪一级（第五站）。');
    box('t13-res', h + warns(w));
  }

  var T14_IDS = ['t14-g', 't14-fc', 't14-m', 't14-rp', 't14-r1', 't14-r2', 't14-r3', 't14-d', 't14-n', 't14-p', 't14-t'];
  function calcT14(){
    var v = {}, usedEx = false;
    T14_IDS.forEach(function(id){ var r = nx(id); v[id] = r.v; if (r.ex) usedEx = true; });
    var exn = $('t14-exnote'); if (exn) exn.hidden = !usedEx;
    var net = v['t14-m'] * (1 - v['t14-rp'] / 100);
    var r1 = v['t14-r1'] / 100, r2 = v['t14-r2'] / 100, r3 = v['t14-r3'] / 100, days = v['t14-d'];
    var ok = net > 0 && r1 > 0 && r2 > 0 && r3 > 0 && days > 0 && r1 <= 1 && r2 <= 1 && r3 <= 1;
    var perDay = NaN, cap = NaN, h = '', w = [];
    if (!ok) {
      ['t14-o-day', 't14-o-deals', 't14-o-cap', 't14-o-vadd'].forEach(function(id){ put(id, '—'); });
      put('t14-funnel', ''); put('t14-detail', '');
      w.push('有数字不合理：毛利扣掉计提后要大于 0，三个比例在 1–100 之间，工作天数大于 0。');
    } else {
      var deals = Math.ceil((v['t14-g'] + v['t14-fc']) / net);
      var quotes = Math.ceil(deals / r3), talks = Math.ceil(quotes / r2), adds = Math.ceil(talks / r1);
      perDay = adds / days;
      var reserve = deals * v['t14-m'] * v['t14-rp'] / 100;
      var vAdd = r1 * r2 * r3 * v['t14-m'] * v['t14-n'];
      cap = deals * v['t14-p'] * v['t14-t'] / 30;
      var turns = v['t14-t'] > 0 ? 365 / v['t14-t'] : NaN;
      var dayShow = Math.ceil(perDay * 10) / 10;
      put('t14-o-day', fm(dayShow, 1) + '<small>个</small>');
      put('t14-o-deals', fm(deals) + '<small>单</small>');
      put('t14-o-cap', fm(Math.round(cap / 100) * 100) + '<small>元</small>');
      put('t14-o-vadd', fm(Math.round(vAdd)) + '<small>元</small>');
      put('t14-funnel', bars([['加微', adds], ['聊开（发图）', talks], ['报价', quotes], ['成交', deals]], adds).replace('<div class="bars">', '').replace(/<\/div>$/, ''));
      put('t14-detail', ['单笔净贡献（扣掉计提）：' + fm(Math.round(net)) + ' 元',
        '每月风险与损耗计提：' + fm(Math.round(reserve)) + ' 元',
        '一个成交客户值：' + fm(Math.round(v['t14-m'] * v['t14-n'])) + ' 元（客单毛利 × 平均成交次数）',
        '资金一年能转：' + fm(turns, 1) + ' 次，周转越快，同样的钱赚得越多'].map(function(t){ return '<li>' + t + '</li>'; }).join(''));
      h += p('每月要成交 <b>' + fm(deals) + '</b> 单 → 报价 ' + fm(quotes) + ' 次 → 聊开 ' + fm(talks) + ' 人 → 加微 ' + fm(adds) + ' 人，<b>每天加微 ' + fm(dayShow, 1) + ' 个</b>。');
      h += p('同时压在手里的货值约 ' + fm(Math.round(cap / 100) * 100) + ' 元，这就是要准备的周转资金。');
    }
    (D.t14path || []).forEach(function(pp){
      var key = pp[0], unit = pp[2], c = nx('t14-c-' + key).v, out = '—';
      if (isFinite(perDay) && c > 0) out = key === 'paid' ? fm(Math.round(perDay * c)) + ' 元 / 天' : fm(Math.ceil(perDay / c)) + ' ' + unit + ' / 天';
      put('t14-a-' + key, out);
    });
    var sum = 0, any = false;
    for (var i = 1; i <= 6; i++) { var x = n('t14-bud-' + i); if (!isNaN(x)) { sum += x; any = true; } }
    put('t14-bud-sum', any ? fm(sum) + ' 元' : '—');
    var cash = n('t15a-8-cash'), capRow = n('t14-bud-4');
    if (any && !isNaN(cash) && sum > cash) w.push('第一个月要花 ' + fm(sum) + ' 元，超过了启动资金 ' + fm(cash) + ' 元（表 1.5A）。');
    if (isFinite(cap) && !isNaN(cash) && cap > cash) w.push('按测算要约 ' + fm(Math.round(cap / 100) * 100) + ' 元周转资金，超过了启动资金：先走零库存起步（1.6），或者降低月目标。');
    if (isFinite(cap) && !isNaN(capRow) && capRow < cap * 0.8) w.push('E 部分的周转资金只准备了 ' + fm(capRow) + ' 元，比测算的少很多。');
    if (usedEx) w.push('还有格子是示例值，换成你自己的数字再念。');
    box('t14-res', h + warns(w));
  }

  function sumIds(prefix, count){
    var s = 0, any = false;
    for (var i = 1; i <= count; i++) { var x = n(prefix + i); if (!isNaN(x)) { s += x; any = true; } }
    return any ? s : NaN;
  }
  function calcT15A(){
    var sk = sumIds('t15a-5-k', 13), se = sumIds('t15a-5-e', 13), sc = sumIds('t15a-5-c', 13);
    put('t15a-5-sk', fm(sk)); put('t15a-5-se', fm(se)); put('t15a-5-sc', fm(sc));
    var joined = 0, speak = 0;
    for (var i = 1; i <= 9; i++) {
      if (ck('t15a-7-in' + i)) joined++;
      if (rv('t15a-7-s' + i) === '能开口') speak++;
    }
    var maxFans = NaN;
    for (var j = 1; j <= 3; j++) { var f = n('t15a-3-f' + j); if (!isNaN(f)) maxFans = isNaN(maxFans) ? f : Math.max(maxFans, f); }
    var call = n('t15a-1-call'), ov = n('t15a-1-overlap'), rc = n('t15a-1-recent'), cash = n('t15a-8-cash'), loss = n('t15a-8-loss');
    var h = p('人脉：能直接打电话 ' + fm(call) + ' 人，其中重合 ' + fm(ov) + ' 人，最近三个月联系 ' + fm(rc) + ' 人。');
    h += p('行业关系：能约饭 ' + fm(se) + ' 家，谈过合作 ' + fm(sc) + ' 家。圈层：已加入 ' + joined + ' 个，能开口 ' + speak + ' 个。');
    h += p('时间和钱：' + (rv('t15a-8-ft') || '—') + '，每天 ' + fm(n('t15a-8-hours'), 1) + ' 小时，启动资金 ' + fm(cash) + ' 元，能亏掉 ' + fm(loss) + ' 元。');
    var w = [];
    if (!isNaN(ov) && !isNaN(call) && ov > call) w.push('"其中重合的"不会超过"能直接打电话的"，再核一下。');
    if (!isNaN(loss) && !isNaN(cash) && loss > cash) w.push('能亏掉的钱不会超过启动资金，再核一下。');
    if (!isNaN(se) && !isNaN(sk) && se > sk) w.push('能约饭的家数不会超过认识的家数。');
    box('t15a-res', h + warns(w));
    return { se: se, sc: sc, joined: joined, speak: speak, maxFans: maxFans };
  }

  function calcT15B(inv){
    var speak = rv('t15a-2-speak');
    var nums = [
      '能直接打电话 ' + fm(n('t15a-1-call')) + ' 人 · 重合 ' + fm(n('t15a-1-overlap')) + ' 人 · 三个月内联系 ' + fm(n('t15a-1-recent')) + ' 人',
      (val('t15a-2-job') ? esc(val('t15a-2-job')) + ' · ' : '') + '每月接触高消费人群 ' + fm(n('t15a-2-reach')) + ' 人 · 工作圈' + (speak ? (speak === '能' ? '能开口' : speak) : '：—'),
      '最大账号粉丝 ' + fm(inv.maxFans) + ' · 社群 ' + fm(n('t15a-3-commn')) + ' 人 · 朋友圈 ' + fm(n('t15a-3-moments')) + ' 人',
      '门店：' + (rv('t15a-4-shop') || '—') + ' · 月客流 ' + fm(n('t15a-4-flow')) + ' 人',
      '能约饭 ' + fm(inv.se) + ' 家 · 谈过合作 ' + fm(inv.sc) + ' 家',
      '名单 ' + fm(n('t15a-6-n')) + ' 人 · 重合 ' + fm(n('t15a-6-overlap')) + ' 人 · 还认得你 ' + fm(n('t15a-6-know')) + ' 人',
      '已加入 ' + inv.joined + ' 个圈层 · 能开口 ' + inv.speak + ' 个',
      '每天 ' + fm(n('t15a-8-hours'), 1) + ' 小时 · 能亏 ' + fm(n('t15a-8-loss')) + ' 元 · 出镜人 ' + fm(n('t15a-8-cast')) + ' 人'
    ];
    nums.forEach(function(t, i){ put('t15b-num-' + (i + 1), t); });
    var picks = [], bad = [];
    (D.t15b || []).forEach(function(c, i){
      if (!ck('t15b-pick-' + (i + 1))) return;
      picks.push(i);
      var v = rv('t15b-v' + (i + 1));
      if (v === '不成立' || v === '存疑') bad.push(c[0] + '（' + v + '）');
      else if (!v) bad.push(c[0] + '（还没校验）');
    });
    var score = { relation: 0, content: 0, paid: 0, local: 0, platform: 0 };
    picks.forEach(function(i){
      var c = D.t15b[i];
      if (c[1].length) { c[1].forEach(function(k){ score[k]++; }); return; }
      if (n('t15a-8-loss') > 0) score.paid++;
      if (rv('t15a-8-self') === '愿意' || n('t15a-8-cast') > 0) score.content++;
      if (n('t15a-8-hours') >= 2) score.platform++;
    });
    var h = '', w = [];
    if (!picks.length) h += p('还没圈三张牌。');
    else {
      h += p('我的三张牌：<b>' + picks.map(function(i){ return D.t15b[i][0]; }).join('、') + '</b>' + (picks.length !== 3 ? '（要圈满三张，现在是 ' + picks.length + ' 张）' : ''), picks.length === 3 ? 'ok' : 'warn');
      if (bad.length) w.push('这几张没过校验，不能当底牌：' + bad.join('、') + '。换一张"经得起"的。');
      var max = 0, k;
      for (k in score) { if (has(score, k)) max = Math.max(max, score[k]); }
      h += bars((D.paths || []).map(function(pp){ return [pp[1], score[pp[0]]]; }), 3);
      var top = (D.paths || []).filter(function(pp){ return max > 0 && score[pp[0]] === max; }).map(function(pp){ return pp[1]; });
      if (top.length) h += p('路径倾向：<b>' + top.join('、') + '</b>。这只是倾向，第二站 2.1 对着否决项再定。');
    }
    var m3 = rv('t15a-8-3m'), loss = n('t15a-8-loss'), hrs = n('t15a-8-hours');
    if (m3 === '不能') w.push('不能坚持三个月：五条路都要跑满三个月才看得出结果（2.1），先想清楚再开始。');
    else if (m3 === '不确定') w.push('还不确定能不能坚持三个月：这是第一个否决项，先想清楚。');
    if (!isNaN(loss) && loss <= 0) w.push('没有能亏掉的钱：付费路径先别考虑。');
    if (!isNaN(hrs) && hrs < 2) w.push('每天不到 2 小时：内容路径的日更和本地路径的地推都会很紧。');
    if (rv('t15a-8-self') === '不愿意' && !(n('t15a-8-cast') > 0)) w.push('不愿意出镜、身边也没人出镜：内容路径可以走不露脸或图文（2.3.4）。');
    box('t15b-res', h + warns(w));
  }

  function calcT16B(){
    var w = [], stage = rv('t16b-stage');
    var mb = n('t16b-maxbuy'), ml = n('t16b-maxloss'), mm = n('t16b-monthloss');
    var loss = n('t15a-8-loss'), cash = n('t15a-8-cash');
    if (stage === '3') w.push('新手直接从第 3 阶段开始，是定位错误清单第 08 条。');
    if (!isNaN(mm) && !isNaN(loss) && mm > loss) w.push('一个月最多能亏 ' + fm(mm) + ' 元，超过了你能亏掉的钱 ' + fm(loss) + ' 元（表 1.5A）。');
    if (!isNaN(ml) && !isNaN(mm) && ml > mm) w.push('单笔最多能亏比一个月最多能亏还多，改一下。');
    if (!isNaN(ml) && !isNaN(mb) && ml > mb) w.push('单笔最多能亏不会超过单笔收货金额，再核一下。');
    if (!isNaN(mb) && !isNaN(cash) && mb > cash) w.push('单笔收货金额超过了启动资金（表 1.5A）。');
    var cap = stage === '1' ? n('t16a-cap1') : (stage === '2' ? n('t16a-cap2') : NaN);
    if (!isNaN(cap) && !isNaN(mb) && mb > cap) w.push('单笔收货金额超过了讲师给的第 ' + stage + ' 阶段上限 ' + fm(cap) + ' 元（表 1.6A）。');
    var hs = 0;
    for (var i = 1; i <= 4; i++) { if (ck('t16b-h' + i)) hs++; }
    var sec = $('t1-6b'), rq = sec ? reqUnits(sec) : [0, 0];
    if (!rq[0]) { box('t16b-res', p('还没填。')); return; }
    var full = rq[1] > 0 && rq[0] === rq[1];
    var h = p('必填 ' + rq[0] + ' / ' + rq[1] + (full ? '，确认单完整，可以签字交给讲师。' : '。'), full ? 'ok' : '');
    if (!hs) w.push('还没选判不准时怎么处理。');
    h += w.length ? warns(w) : p('数字之间没有冲突。', 'ok');
    box('t16b-res', h);
  }

  function calcT17A(){
    var cand = [], avoid = [];
    (D.t17 || []).forEach(function(c, i){
      var f = +rv('t17a-f' + (i + 1)) || 0, s = +rv('t17a-s' + (i + 1)) || 0, risk = c[1], t = '—', cls = '';
      if (f && s) {
        if (risk >= 4 && f <= 2) { t = '别作为起步品类'; cls = 'warn'; avoid.push(c[0]); }
        else if (f >= 3 && s >= 3) { t = '可作起步候选'; cls = 'ok'; cand.push(c[0]); }
        else t = '先观察';
      }
      var el = $('t17a-h' + (i + 1));
      if (el) { el.textContent = t; el.className = cls; }
    });
    var h = '';
    if (!cand.length && !avoid.length) h = p('每个品类的两列都打完分，这里会给出建议。');
    else {
      if (cand.length) h += p('可作起步候选：<b>' + cand.join('、') + '</b>。在表 1.7B 里只选一个做主打。', 'ok');
      if (avoid.length) h += p('风险高又不熟，别作为起步品类：' + avoid.join('、') + '（定位错误第 04 条）。', 'warn');
    }
    box('t17a-res', h);
    return avoid;
  }

  function calcT17B(avoid){
    var cat = val('t17b-cat-a'), shop = rv('t17b-shop-a'), ft = rv('t17b-ft-a'), per = rv('t17b-persona-a'), area = rv('t17b-area-a'), mode = val('t17b-mode-a'), path = val('t17b-path-a'), aux = val('t17b-aux-a');
    if (!cat && !shop && !ft && !per && !area && !mode) { box('t17b-res', p('还没填暂定一列。')); return; }
    var h = p('我暂定：主打 <b>' + esc(cat || '—') + '</b>' + (aux ? '，辅助 ' + esc(aux) : '') + '；' + (shop || '—') + '，' + (ft || '—') + '；人设 ' + (per || '—') + '；' + (area || '—') + '；起步模式 ' + esc(mode || '—') + (path ? '；路径倾向 ' + esc(path) : '') + '。');
    var w = [];
    if (cat && avoid.indexOf(cat) >= 0) w.push('主打品类在表 1.7A 里被提示"别作为起步品类"。');
    if (mode === '门店零售' && shop === '无店') w.push('选了门店零售，但暂定是无店。');
    if (shop === '有店' && rv('t15a-4-shop') === '无') w.push('暂定有店，但盘点表里写的是没有门店：先租店再找客户是定位错误第 05 条。');
    if (mode === '鉴定服务收费') w.push('鉴定服务要为结论负责，先确认鉴定能力（第五站）。');
    box('t17b-res', h + warns(w));
  }

  function calcT19A(){
    var ent = rv('t19a-entity'), a1 = val('t19a-acc1'), a2 = val('t19a-acc2'), a3 = val('t19a-acc3');
    if (!ent && !a1 && !a2 && !a3) { box('t19a-res', p('还没填。')); return; }
    var h = p('主体：' + (ent || '—') + (val('t19a-when') ? '；调整时机：' + esc(val('t19a-when')) : '') + '。');
    var w = [];
    if (a1 && a3 && a1 === a3) w.push('收货付款账户和个人生活账户写的是同一个，要分开。');
    if (a2 && a3 && a2 === a3) w.push('出货收款账户和个人生活账户写的是同一个，要分开。');
    if (!a1 || !a2 || !a3) w.push('三个账户还没写全。');
    box('t19a-res', h + (w.length ? warns(w) : p('三个账户已分开。', 'ok')));
  }

  function calcT19B(){
    var need = [], miss = [];
    (D.t19b || []).forEach(function(nm, i){
      if (!ck('t19b-need-' + (i + 1))) return;
      need.push(nm);
      if (!ck('t19b-ready-' + (i + 1))) miss.push(nm);
    });
    if (!need.length) { box('t19b-res', p('还没勾"我需要"。')); return; }
    box('t19b-res', p('我现在需要 ' + need.length + ' 份：' + need.join('、') + '。') + (miss.length ? p('还没准备：' + miss.join('、') + '。在对应的那一站现场填。', 'warn') : p('需要的都准备好了。', 'ok')));
  }

  function calcT19C(){
    var empty = [], filled = 0;
    (D.t19c || []).forEach(function(k, i){ if (val('t19c-' + (i + 1))) filled++; else empty.push(k); });
    if (!filled) { box('t19c-res', p('没有合伙人的，这张可以跳过。')); return; }
    box('t19c-res', empty.length ? p('还没谈清：' + empty.join('、') + '。这些就是以后最容易吵架的地方。', 'warn') : p('七项都谈了。' + (ck('t19c-sign') ? '' : '下一步：签合伙协议。'), 'ok'));
  }

  function calcT110(){
    var items = [];
    (D.t110 || []).forEach(function(r, i){
      var l = +rv('t110-l' + (i + 1)) || 0, s = +rv('t110-s' + (i + 1)) || 0;
      items.push({ i: i, name: r[0], where: r[1], l: l, s: s, p: l * s });
    });
    var rated = items.filter(function(x){ return x.l && x.s; });
    rated.sort(function(a, b){ return (b.p - a.p) || (b.s - a.s) || (a.i - b.i); });
    var top = rated.slice(0, 3).map(function(x){ return x.i; });
    var mx = $('t110-mx');
    if (mx) {
      [].forEach.call(mx.querySelectorAll('.mx-cell'), function(c){ c.innerHTML = ''; });
      rated.forEach(function(x){
        var cell = mx.querySelector('.mx-cell[data-l="' + x.l + '"][data-s="' + x.s + '"]');
        if (cell) cell.insertAdjacentHTML('beforeend', '<span class="rchip' + (top.indexOf(x.i) >= 0 ? ' top' : '') + '">' + x.name + '</span>');
      });
    }
    var unr = items.filter(function(x){ return !x.l; }).map(function(x){ return x.name; });
    if (!rated.length) { box('t110-res', p('给每类风险选"我踩中的可能"，这里会圈出你最该防的三类。')); return; }
    var h = '<ol class="top3">' + rated.slice(0, 3).map(function(x){
      var a = val('t110-a' + (x.i + 1));
      return '<li><b>' + x.name + '</b>：去 ' + x.where + ' 重点听。第一个防范动作：' + (a ? esc(a) : '<span class="warn">还没写</span>') + '</li>';
    }).join('') + '</ol>';
    if (unr.length) h += p('还没评估：' + unr.join('、') + '。', 'warn');
    box('t110-res', h);
  }

  function calcT111(){
    var yes = [], maybe = [], ans = 0;
    (D.t111 || []).forEach(function(r, i){
      var v = rv('t111-e' + (i + 1));
      if (v) ans++;
      if (v === '有') yes.push(i);
      if (v === '可能') maybe.push(i);
    });
    if (!ans) { box('t111-res', p('还没作答。')); return; }
    var h = p('已答 ' + ans + ' / 13 条：有 <b>' + yes.length + '</b> 条，可能 ' + maybe.length + ' 条。', yes.length ? 'warn' : 'ok');
    var list = yes.concat(maybe);
    if (list.length) h += '<ul class="plain">' + list.map(function(i){ var r = D.t111[i]; return '<li>' + ('0' + (i + 1)).slice(-2) + ' ' + r[0] + ' → ' + r[1] + '</li>'; }).join('') + '</ul>';
    box('t111-res', h);
  }

  var CALCS = [calcT0, calcT11, calcT12, calcT13, calcT14, function(){ calcT15B(calcT15A()); }, calcT16B, function(){ calcT17B(calcT17A()); }, calcT19A, calcT19B, calcT19C, calcT110, calcT111];
