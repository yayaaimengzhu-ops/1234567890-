
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var D = {};
  try { D = JSON.parse($('ws-data').textContent) || {}; } catch (e) { D = {}; }
  var stateEl = $('fill-state');
  var DOC = (stateEl && stateEl.getAttribute('data-doc')) || 'worksheet-v1';
  var FILE = (stateEl && stateEl.getAttribute('data-file')) || 'worksheet';
  var TITLE = (stateEl && stateEl.getAttribute('data-title')) || document.title;
  var KEY = 'fill:' + DOC;
  var fields = [].slice.call(document.querySelectorAll('[data-fill]'));
  var msgEl = $('dk-msg');
  var has = function(o, k){ return Object.prototype.hasOwnProperty.call(o, k); };
  function copyInto(d, s){ for (var k in s) { if (has(s, k)) d[k] = String(s[k]); } return d; }
  function say(t){ if (msgEl) msgEl.textContent = t; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var baked = {};
  try { baked = JSON.parse(stateEl ? stateEl.textContent : '{}') || {}; } catch (e) { baked = {}; }
  var state = copyInto({}, baked);
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { stored = null; }
  if (stored && typeof stored === 'object') copyInto(state, stored);

  function keyOf(el){ return el.type === 'radio' ? el.name : el.id; }
  function rv(name){ var c = document.querySelector('input[type="radio"][name="' + name + '"]:checked'); return c ? c.value : ''; }
  function getVal(el){
    if (el.type === 'checkbox') return el.checked ? '1' : '';
    if (el.type === 'radio') return rv(el.name);
    return el.value;
  }
  function setVal(el, v){
    if (el.type === 'checkbox') el.checked = (v === '1');
    else if (el.type === 'radio') el.checked = (el.value === v);
    else el.value = v;
  }
  function resetDefault(el){
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = el.defaultChecked;
    else if (el.tagName === 'SELECT') {
      el.value = '';
      [].forEach.call(el.options, function(o){ if (o.defaultSelected) el.value = o.value; });
    } else el.value = el.defaultValue;
  }
  function autosize(el){
    if (el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px';
  }
  fields.forEach(function(el){ var k = keyOf(el); if (has(state, k)) setVal(el, state[k]); });

  function val(id){ var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function n(id){ var s = val(id); if (s === '') return NaN; var x = parseFloat(s); return isFinite(x) ? x : NaN; }
  function nx(id){
    var x = n(id);
    if (!isNaN(x)) return { v: x, ex: false };
    var el = $(id);
    return { v: el ? parseFloat(el.getAttribute('data-ex')) : NaN, ex: true };
  }
  function ck(id){ var el = $(id); return !!(el && el.checked); }
  function fm(x, d){ if (typeof x !== 'number' || !isFinite(x)) return '—'; return x.toLocaleString('zh-CN', { maximumFractionDigits: d || 0 }); }
  function put(id, h){ var el = $(id); if (el) el.innerHTML = h; }
  function box(id, h){ var el = $(id); if (!el) return; var b = el.querySelector('.rbody'); if (b) b.innerHTML = h; }
  function p(t, cls){ return '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + t + '</p>'; }
  function warns(list){ return list.map(function(t){ return p(t, 'warn'); }).join(''); }
  function bars(rows, max){
    return '<div class="bars">' + rows.map(function(r){
      var w = max > 0 ? Math.max(r[1] > 0 ? 2 : 0, r[1] / max * 100) : 0;
      return '<span class="bl">' + r[0] + '</span><span class="bar" title="' + r[0] + '：' + r[1] + '"><i style="width:' + w.toFixed(1) + '%"></i></span><span class="bn">' + fm(r[1]) + '</span>';
    }).join('') + '</div>';
  }

  function reqUnits(sec){
    var done = 0, total = 0, seen = {};
    [].forEach.call(sec.querySelectorAll('[data-req]'), function(el){
      if (el.closest && el.closest('[hidden]')) return;
      if (el.type === 'radio') {
        if (seen[el.name]) return;
        seen[el.name] = 1; total++;
        if (rv(el.name)) done++;
        return;
      }
      total++;
      if (String(el.value).trim() !== '') done++;
    });
    [].forEach.call(sec.querySelectorAll('[data-reqgroup]'), function(g){
      if (g.closest && g.closest('[hidden]')) return;
      total++;
      var c = g.querySelectorAll('input[type="checkbox"]:checked').length;
      var mn = parseInt(g.getAttribute('data-reqmin') || '1', 10), mx = parseInt(g.getAttribute('data-reqmax') || '0', 10);
      if (c >= mn && (!mx || c <= mx)) done++;
    });
    return [done, total];
  }


  function sumRange(prefix, from, to, suffix){
    var s = 0, any = false;
    for (var i = from; i <= to; i++) { var x = n(prefix + i + (suffix || '')); if (!isNaN(x)) { s += x; any = true; } }
    return any ? s : NaN;
  }
  function selfCheck(prefix, key, resId){
    var h = selfCheckHtml(prefix, key);
    box(resId, h || p('还没作答。'));
  }
  function rt(name){ var c = document.querySelector('input[type="radio"][name="' + name + '"]:checked'); return c ? c.getAttribute('data-text') : ''; }
  function ul(items){ return items.length ? '<ul class="plain">' + items.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>' : ''; }
  function nck(prefix, from, to, suffix){ var c = 0; for (var i = from; i <= to; i++) { if (ck(prefix + i + (suffix || ''))) c++; } return c; }
  function nval(prefix, from, to, suffix){ var c = 0; for (var i = from; i <= to; i++) { if (val(prefix + i + (suffix || ''))) c++; } return c; }
  function found(text, words){
    var f = words.filter(function(w){ return w && text.indexOf(w) >= 0; });
    return f.filter(function(w){ return !f.some(function(o){ return o !== w && o.indexOf(w) >= 0; }); });
  }
  function hasDigit(s){ return /[0-9０-９]/.test(s); }
  function pct(a, b){ return b > 0 ? fm(a / b * 100, 1) + '%' : '—'; }
  function reqLine(sid, doneText){
    var r = secReq(sid);
    if (!r[0]) return '';
    var full = r[1] > 0 && r[0] === r[1];
    return p('必填 ' + r[0] + ' / ' + r[1] + (full ? '。' + (doneText || '这张表可以交了。') : '。'), full ? 'ok' : '');
  }
  function selfCheckHtml(prefix, key){
    var list = D[key] || [], yes = [], maybe = [], ans = 0;
    list.forEach(function(r, i){ var v = rv(prefix + (i + 1)); if (v) ans++; if (v === '有') yes.push(i); if (v === '可能') maybe.push(i); });
    if (!ans) return '';
    var h = p('已答 ' + ans + ' / ' + list.length + ' 条：有 <b>' + yes.length + '</b> 条，可能 ' + maybe.length + ' 条。', yes.length ? 'warn' : 'ok');
    var all = yes.concat(maybe);
    if (all.length) h += '<ul class="plain">' + all.map(function(i){ var r = list[i]; return '<li>' + ('0' + (i + 1)).slice(-2) + ' ' + r[0] + ' → ' + r[1] + '</li>'; }).join('') + '</ul>';
    return h;
  }
  function mark(id, text, cls){ var el = $(id); if (el) { el.textContent = text; el.className = cls || ''; } }
  function scoreRows(count, mine, key, outPrefix){
    var done = 0, right = 0, pending = 0;
    for (var i = 1; i <= count; i++) {
      var a = mine(i), b = key(i);
      if (a && b) { done++; if (a === b) { right++; mark(outPrefix + i, '对', 'ok'); } else mark(outPrefix + i, '错', 'warn'); }
      else if (a) { pending++; mark(outPrefix + i, '等答案', ''); }
      else mark(outPrefix + i, '—', '');
    }
    return { done: done, right: right, pending: pending };
  }
  function today0(){ var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function daysSince(s){
    if (!s) return NaN;
    var d = new Date(s + 'T00:00:00');
    if (isNaN(d.getTime())) return NaN;
    return Math.round((today0() - d) / 86400000);
  }
  function tally(values){ var c = {}; values.forEach(function(v){ if (v) c[v] = (c[v] || 0) + 1; }); return c; }
  function secReq(sid){ var sec = $(sid); return sec ? reqUnits(sec) : [0, 0]; }
  function status(sid, resId, doneText){
    var r = secReq(sid);
    if (!r[0]) { box(resId, p('还没填。')); return false; }
    var full = r[1] > 0 && r[0] === r[1];
    box(resId, p('必填 ' + r[0] + ' / ' + r[1] + (full ? '。' + (doneText || '这张表可以交了。') : '。'), full ? 'ok' : ''));
    return full;
  }

  /*STATION*/

  var dkDone = $('dk-done'), dkTotal = $('dk-total'), dkBar = $('dk-bar');
  function progress(){
    var done = 0, total = 0;
    [].forEach.call(document.querySelectorAll('[data-sid]'), function(sec){
      var sid = sec.getAttribute('data-sid');
      var skip = typeof skipSec === 'function' && skipSec(sec);
      sec.classList.toggle('skip', !!skip);
      var r = skip ? [0, 0] : reqUnits(sec);
      done += r[0]; total += r[1];
      [].forEach.call(document.querySelectorAll('[data-prog="' + sid + '"]'), function(el){
        el.textContent = skip ? '不是你的路，可跳过' : (r[1] ? '必填 ' + r[0] + ' / ' + r[1] : '选填');
        el.classList.toggle('done', !skip && !!r[1] && r[0] === r[1]);
      });
      [].forEach.call(document.querySelectorAll('[data-st="' + sid + '"]'), function(el){
        el.textContent = skip ? '不用交' : (!r[1] ? '选填' : (r[0] === r[1] ? '已完成' : (r[0] ? '填了 ' + r[0] + ' / ' + r[1] : '未开始')));
        el.className = 'st' + (skip ? ' skip' : (r[1] && r[0] === r[1] ? ' done' : (r[0] ? ' part' : '')));
      });
    });
    var who = $('who');
    if (who) { var r2 = reqUnits(who); done += r2[0]; total += r2[1]; }
    if (dkDone) dkDone.textContent = done;
    if (dkTotal) dkTotal.textContent = total;
    if (dkBar) dkBar.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  }

  function recalc(){
    CALCS.forEach(function(f){ try { f(); } catch (err) { if (window.console) console.error(err); } });
    progress();
  }

  var saveTimer = null;
  function save(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      try { localStorage.setItem(KEY, JSON.stringify(state)); say('已自动保存到本机浏览器'); }
      catch (e) { say('这里无法自动保存，请用"导出已填写版"留存'); }
    }, 400);
  }
  fields.forEach(function(el){
    var ev = (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(ev, function(){
      state[keyOf(el)] = getVal(el);
      autosize(el);
      recalc();
      save();
    });
  });
  var tas = fields.filter(function(el){ return el.tagName === 'TEXTAREA'; });
  tas.forEach(autosize);
  recalc();
  var rz = null;
  window.addEventListener('resize', function(){ clearTimeout(rz); rz = setTimeout(function(){ tas.forEach(autosize); }, 150); });

  var framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  var dlReady = (window.claude && typeof window.claude.use === 'function')
    ? Promise.resolve(window.claude.use('downloads')).catch(function(){ return null; })
    : Promise.resolve(null);
  function stamp(){
    var d = new Date(), q = function(x){ return (x < 10 ? '0' : '') + x; };
    return d.getFullYear() + q(d.getMonth() + 1) + q(d.getDate()) + '-' + q(d.getHours()) + q(d.getMinutes());
  }
  function buildExport(){
    var root = document.documentElement.cloneNode(true);
    fields.forEach(function(el){
      var c = root.querySelector('#' + el.id);
      if (!c) return;
      if (el.tagName === 'TEXTAREA') { c.textContent = el.value; c.removeAttribute('style'); }
      else if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); }
      else if (el.tagName === 'SELECT') {
        [].forEach.call(c.options, function(o){ if (o.value === el.value && el.value !== '') o.setAttribute('selected', ''); else o.removeAttribute('selected'); });
      } else c.setAttribute('value', el.value);
    });
    [].forEach.call(root.querySelectorAll('script:not([data-keep])'), function(s){ s.parentNode.removeChild(s); });
    var st = root.querySelector('#fill-state');
    if (st) {
      st.textContent = JSON.stringify(state).replace(/</g, '\\u003c');
      st.setAttribute('data-doc', DOC.replace(/-\d{8}-\d{4}$/, '') + '-' + stamp());
    }
    [].forEach.call(root.querySelectorAll('.index a.on'), function(a){ a.classList.remove('on'); });
    var m = root.querySelector('#dk-msg'); if (m) m.textContent = '';
    var cb = root.querySelector('#copybox'); if (cb) cb.setAttribute('hidden', '');
    return '<!DOCTYPE html>\n' + root.outerHTML;
  }
  $('btn-export').addEventListener('click', function(){
    var html = buildExport();
    var name = FILE + '-filled-' + stamp().slice(0, 8) + '.html';
    dlReady.then(function(dl){
      if (dl) {
        return dl.save({ filename: name, data: html }).then(function(){ say('已导出：' + name); }, function(err){
          var c = err && err.code;
          say(c === 'declined' ? '已取消导出' : (c === 'rate_limited' ? '稍等几秒再试' : '这里暂时不能导出，可以用"复制全部填写"'));
        });
      }
      if (framed) { say('这个页面里不能直接下载。可以用"复制全部填写"，或把 HTML 文件存到本地打开后再导出'); return; }
      var url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      var a = document.createElement('a');
      a.href = url; a.download = name; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.parentNode.removeChild(a); }, 1500);
      say('已导出到下载文件夹：' + name);
    });
  });

  function unitOf(el){ var u = el.parentNode && el.parentNode.querySelector ? el.parentNode.querySelector('.u') : null; return u ? u.textContent : ''; }
  function buildText(){
    var out = [], head = [];
    ['w-name', 'w-class', 'w-date', 'w-teacher'].forEach(function(id){
      var el = $(id);
      if (el && el.value.trim()) head.push(el.getAttribute('data-label') + '：' + el.value.trim());
    });
    [].forEach.call(document.querySelectorAll('[data-sid]'), function(sec){
      var lines = [], seen = {};
      [].forEach.call(sec.querySelectorAll('[data-fill]'), function(el){
        var lb = (el.getAttribute('data-label') || el.id).replace(/^表 [0-9.A-Z]+ ?/, '');
        if (el.type === 'radio') {
          if (seen[el.name]) return;
          seen[el.name] = 1;
          var c = sec.querySelector('input[type="radio"][name="' + el.name + '"]:checked');
          if (c) lines.push('· ' + lb + '：' + c.getAttribute('data-text'));
          return;
        }
        if (el.type === 'checkbox') { if (el.checked) lines.push('· ✓ ' + lb); return; }
        var v = String(el.value).trim();
        if (v) lines.push('· ' + lb + '：' + v + unitOf(el));
      });
      if (!lines.length) return;
      var rb = sec.querySelector('.result .rbody');
      var rt = rb ? rb.innerText.trim() : '';
      out.push('【' + sec.getAttribute('data-title') + '】\n' + lines.join('\n') + (rt ? '\n→ ' + rt.replace(/\n+/g, '\n→ ') : ''));
    });
    if (!out.length) return '';
    return TITLE + ' · 填写内容\n' + (head.length ? head.join('　') + '\n' : '') + '\n' + out.join('\n\n');
  }
  var copyBox = $('copybox'), copyText = $('copytext');
  $('copyclose').addEventListener('click', function(){ copyBox.hidden = true; });
  $('btn-copy').addEventListener('click', function(){
    var t = buildText();
    if (!t) { say('还没有填写任何内容'); return; }
    var fallback = function(){ copyText.value = t; copyBox.hidden = false; copyText.focus(); copyText.select(); say('已选中，按 Ctrl + C 复制'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ say('已复制，可以粘贴到微信或文档'); }, fallback);
      else fallback();
    } catch (e) { fallback(); }
  });

  var btnClear = $('btn-clear'), armed = false, armTimer = null;
  function disarm(){ armed = false; clearTimeout(armTimer); btnClear.textContent = '清除本机草稿'; btnClear.classList.remove('armed'); }
  btnClear.addEventListener('click', function(){
    if (!armed) {
      armed = true; btnClear.textContent = '再点一次确认清除'; btnClear.classList.add('armed');
      armTimer = setTimeout(disarm, 4000);
      return;
    }
    disarm();
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = copyInto({}, baked);
    fields.forEach(function(el){ var k = keyOf(el); if (has(baked, k)) setVal(el, baked[k]); else resetDefault(el); autosize(el); });
    recalc();
    say('已清除本机草稿');
  });

  var links = [].slice.call(document.querySelectorAll('.index a'));
  var map = {};
  links.forEach(function(a){ var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) map[el.id] = a; });
  var targets = Object.keys(map).map(function(id){ return document.getElementById(id); });
  if (!('IntersectionObserver' in window) || !targets.length) return;
  var current = null, bar = document.querySelector('.index-inner');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      if (current) current.classList.remove('on');
      current = map[en.target.id];
      current.classList.add('on');
      var r = current.getBoundingClientRect(), b = bar.getBoundingClientRect();
      if (r.left < b.left || r.right > b.right) bar.scrollLeft += r.left - b.left - 20;
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  targets.forEach(function(t){ io.observe(t); });
})();
