  function calcT31A(){
    var ids = 0, fr = [], w = [], every = n('t31a-every'), bad = [];
    for (var i = 1; i <= 6; i++) {
      var id = val('t31a-id' + i);
      if (!id) continue;
      ids++;
      var o = val('t31a-owner' + i);
      if (o === '员工' || o === '出镜人' || o === '合伙人') bad.push(esc(id) + '（' + o + '名下）');
      var f = n('t31a-fr' + i);
      if (!isNaN(f)) fr.push([id, f]);
      var d = daysSince(val('t31a-bk' + i));
      if (!val('t31a-bk' + i)) w.push(esc(id) + ' 还没导出备份过。');
      else if (!isNaN(d) && !isNaN(every) && d > every) w.push(esc(id) + ' 上次备份是 ' + d + ' 天前，超过了你定的 ' + fm(every) + ' 天。');
    }
    if (!ids) { box('t31a-res', p('还没登记。')); return; }
    var h = p('登记了 <b>' + ids + '</b> 个号。');
    if (bad.length) w.unshift('号挂在别人名下：' + bad.join('、') + '。人一走，客户全带走：号归老板或公司（承接错误第 07 条）。');
    var tot = fr.reduce(function(s, x){ return s + x[1]; }, 0);
    if (fr.length) {
      var mx = fr.reduce(function(a, x){ return x[1] > a[1] ? x : a; }, fr[0]);
      h += p('好友合计 ' + fm(tot) + ' 人，最多的是 ' + esc(mx[0]) + '（' + fm(mx[1]) + ' 人，占 ' + pct(mx[1], tot) + '）。');
      if (ids === 1 || (tot > 0 && mx[1] / tot > 0.8)) w.push('客户几乎都压在一个号上：一次封号全部归零（承接错误第 08 条）。');
    }
    if (!ck('t31a-leave')) w.push('还没勾"人走号留"。');
    h += reqLine('t3-1a', '登记表完整，签字交给讲师。');
    box('t31a-res', h + (w.length ? warns(w) : p('归属和备份没有问题。', 'ok')));
  }

  function calcT31B(){
    var a = nck('t31b-a', 1, 4), inf = nck('t31b-i', 1, 4), gs = 0, miss = [];
    for (var i = 1; i <= 3; i++) {
      var g = val('t31b-g' + i);
      if (!g) continue;
      gs++;
      var m = [];
      if (!ck('t31b-gr' + i)) m.push('群规');
      if (!ck('t31b-ga' + i)) m.push('入群审核');
      if (!ck('t31b-gc' + i)) m.push('清群机制');
      if (m.length) miss.push(esc(g) + '：缺' + m.join('、'));
    }
    if (!a && !inf && !gs && !val('t31b-where')) { box('t31b-res', p('还没填。')); return; }
    var h = p('防封做到 ' + a + ' / 4 项；客户信息做到 ' + inf + ' / 4 项；登记了 ' + gs + ' 个群。', a === 4 && inf === 4 ? 'ok' : '');
    var w = [];
    if (!ck('t31b-a1')) w.push('外挂、群发软件、多开会封号（承接错误第 09 条）。');
    if (inf < 4) w.push('客户信息还有 ' + (4 - inf) + ' 项没做到：泄露客户信息是法律问题（承接错误第 10 条）。');
    if (miss.length) w.push('社群没把门：' + miss.join('；') + '（承接错误第 12 条）。');
    box('t31b-res', h + warns(w));
  }

  function calcT32(){
    var done = 0, cant = [], risky = [], cnt = 0;
    D.hooks.forEach(function(hk, k){
      var i = k + 1, s = val('t32-s' + i);
      if (s) { done++; cnt++; }
      if (rv('t32-can' + i) === '做不到') cant.push(hk);
      var words = found(s, D.promise);
      if (words.length) risky.push(hk + '（' + words.join('、') + '）');
      if (rv('t32-who' + i) === '白嫖党多' && rv('t32-main') === hk) risky.push('主钩子"' + hk + '"你判断吸来的白嫖党多');
    });
    var places = 0;
    for (var i = 1; i <= 4; i++) places += nck('t32-p' + i + '-', 1, D.places.length);
    var mapped = nval('t32-t', 1, 5);
    if (!cnt && !rv('t32-main')) { box('t32-res', p('还没写。')); return; }
    var h = p('话术写了 ' + done + ' / 4 版，主钩子：' + (rv('t32-main') || '还没选') + '；钩子铺到的位置共 ' + places + ' 处；选题配钩子 ' + mapped + ' / 5 类。', done === 4 ? 'ok' : '');
    var w = [];
    if (cant.length) w.push('承诺做不到的钩子：' + cant.join('、') + '。改成做得到的，或者先别用（承接错误第 02 条）。');
    if (risky.length) w.push('要再看一眼：' + risky.join('；') + '。"秒回""当天给价""免费上门"做不到就是投诉，钩子里不写"最高价"。');
    box('t32-res', h + warns(w));
  }

  function calcT33(){
    var lead = n('t33-lead'), add = n('t33-add');
    put('t33-rate', lead > 0 && !isNaN(add) ? pct(add, lead) : '—');
    var safe = nval('t33-safe', 1, 6), stale = [];
    for (var i = 1; i <= 6; i++) { var d = daysSince(val('t33-chk' + i)); if (!isNaN(d) && d > 30) stale.push(i); }
    var cls = 0, unfixed = 0;
    for (var j = 1; j <= 10; j++) {
      var k = rv('t33-xk' + j);
      if (k) cls++;
      if ((k === '会限流' || k === '会封号') && !val('t33-xf' + j)) unfixed++;
    }
    if (!safe && !cls && isNaN(lead) && !ck('t33-done')) { box('t33-res', p('还没填。')); return; }
    var h = p('记了 ' + safe + ' / 6 个平台的安全导流方式；找错分好类 ' + cls + ' / 10 条。');
    if (lead > 0 && !isNaN(add)) h += p((val('t33-path') ? val('t33-path') + '：' : '') + '公域线索 ' + fm(lead) + ' 个，加上微信 ' + fm(add) + ' 个，公域转私域 <b>' + pct(add, lead) + '</b>' + (val('t33-stuck') ? '，卡在"' + val('t33-stuck') + '"。' : '。'));
    var w = [];
    if (unfixed) w.push(unfixed + ' 条"会限流 / 会封号"的话术还没改成安全版本。');
    if (stale.length) w.push(stale.length + ' 个平台的规则超过 30 天没核对了：规则一变，话术跟着改。');
    if (!isNaN(add) && lead >= 0 && add > lead) w.push('加上微信的比公域线索还多，核一下口径。');
    box('t33-res', h + warns(w));
  }

  function calcT34A(){
    var rates = {};
    ['a', 'b'].forEach(function(k){
      var s = n('t34a-' + k + '-sent'), ps = n('t34a-' + k + '-pass');
      var r = s > 0 && !isNaN(ps) ? ps / s : NaN;
      rates[k] = r;
      put('t34a-' + k + '-rate', isNaN(r) ? '—' : fm(r * 100, 1) + '%');
    });
    var first = val('t34a-first');
    if (!val('t34a-a') && !first && isNaN(rates.a)) { box('t34a-res', p('还没填。')); return; }
    var h = '', w = [];
    if (!isNaN(rates.a) && !isNaN(rates.b)) {
      var hi = rates.a >= rates.b ? 'A' : 'B', lo = hi === 'A' ? rates.b : rates.a, top = Math.max(rates.a, rates.b);
      h += p('A 版通过率 ' + fm(rates.a * 100, 1) + '%，B 版 ' + fm(rates.b * 100, 1) + '%。' + (top > lo ? hi + ' 版更好' + (lo > 0 ? '，是另一版的 ' + fm(top / lo, 1) + ' 倍' : '') + '，以后用 ' + hi + ' 版。' : '两版一样。'), 'ok');
    } else if (!isNaN(rates.a)) h += p('A 版通过率 ' + fm(rates.a * 100, 1) + '%。B 版也发一批，才知道哪版好。');
    if (rates.a > 1 || rates.b > 1) w.push('通过数比发出数还多，核一下。');
    if (/[0-9０-９]+ *(元|块|万|k|K)/.test(first) || /(收|给)你 *[0-9０-９]/.test(first)) w.push('第一句话里出现了价格：通过好友第一句话就报价，是承接错误第 04 条。');
    var s30 = nck('t34a-s', 1, 4);
    h += p('前三十秒四件事做到 ' + s30 + ' / 4。' + (ck('t34a-pass') ? '对练已通过。' : ''), s30 === 4 && ck('t34a-pass') ? 'ok' : '');
    var cold = n('t34a-cold');
    if (!isNaN(cold)) {
      for (var i = 1; i <= 4; i++) {
        var t = n('t34a-t' + i);
        if (!isNaN(t) && t > cold * 60) w.push(D.slots[i - 1] + '要 ' + fm(t) + ' 分钟才回，超过了线索变冷的 ' + fm(cold) + ' 小时。');
      }
    }
    box('t34a-res', h + warns(w));
  }

  function calcT34B(){
    var src = val('t34b-d1'), built = nck('t34b-ok', 1, 5), rows = 0, srcs = [], ints = [], sts = [];
    for (var i = 1; i <= 20; i++) {
      if (!val('t34b-f' + i)) continue;
      rows++;
      srcs.push(val('t34b-src' + i) || '没选来源');
      ints.push(rv('t34b-int' + i));
      sts.push(val('t34b-st' + i));
    }
    if (!src && !built && !rows) { box('t34b-res', p('还没填。')); return; }
    var h = p('标签维度在微信里建好 ' + built + ' / 5 个；已导入好友 <b>' + rows + '</b> / 20 人。', built === 5 && rows >= 20 ? 'ok' : '');
    if (rows) {
      var c = tally(srcs), keys = Object.keys(c);
      h += bars(keys.map(function(k){ return [k, c[k]]; }), Math.max.apply(null, keys.map(function(k){ return c[k]; }).concat([1])));
      var ci = tally(ints);
      h += p('意向度：高 ' + (ci['高'] || 0) + '，中 ' + (ci['中'] || 0) + '，低 ' + (ci['低'] || 0) + (rows - (ci['高'] || 0) - (ci['中'] || 0) - (ci['低'] || 0) ? '，没打 ' + (rows - (ci['高'] || 0) - (ci['中'] || 0) - (ci['低'] || 0)) : '') + '。');
    }
    var w = [];
    if (src && !/关系|内容|付费|本地|平台/.test(src)) w.push('来源标签没记到路径级：写成"关系-异业""内容-抖音"这种，6.6.4 才算得出哪条路带来了成交。');
    var unk = srcs.filter(function(s){ return s === '说不清' || s === '没选来源'; }).length;
    if (unk) w.push(unk + ' 个好友来源说不清或没选。');
    if (/身份证|住址|电话|手机号/.test(D.dims.map(function(d, k){ return val('t34b-d' + (k + 1)); }).join(''))) w.push('标签里不写身份证、住址、电话这类敏感信息。');
    box('t34b-res', h + warns(w));
  }

  function calcT35(){
    var h = selfCheckHtml('t35-e', 't35'), c = nck('t35-c', 1, 4);
    if (!h && !c) { box('t35-res', p('还没作答。')); return; }
    h += p('对照自己的号：四项做到 ' + c + ' / 4。', c === 4 ? 'ok' : '');
    box('t35-res', h);
  }

  var CALCS = [calcT31A, calcT31B, calcT32, calcT33, calcT34A, calcT34B, calcT35];
