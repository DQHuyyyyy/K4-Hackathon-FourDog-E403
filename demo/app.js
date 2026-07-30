/* ══════════════════════════════════════════════════════════════
   VLearn — Catch Me Up
   Reader + VLearn Tutor. AI thật gọi qua server.mjs (/api/chat, /api/catchup).
   ══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ─────────────── i18n (chỉ nhãn giao diện; Tutor luôn nói tiếng Việt) ─────────────── */
const T = {
  vi: { lib: 'Học liệu môn học', libSub: 'Chương, slide và tài liệu đã upload', read: 'Đọc', pen: 'Bút', hl: 'Highlight',
        page: 'Trang', tutorSub: 'Trợ lý học theo ngữ cảnh', chatPh: 'Nhập câu hỏi hoặc bôi đen tài liệu…',
        away: '⏸ Mô phỏng rời đi 3 phút', stuck: '⏱ Mô phỏng dừng lâu', reset: '↺ Reset',
        askSel: 'Hỏi Tutor về đoạn này', hlSel: 'Highlight' },
  en: { lib: 'Course materials', libSub: 'Chapters, slides and uploaded files', read: 'Read', pen: 'Pen', hl: 'Highlight',
        page: 'Page', tutorSub: 'Context-aware study assistant', chatPh: 'Ask a question or select text…',
        away: '⏸ Simulate 3-min absence', stuck: '⏱ Simulate long dwell', reset: '↺ Reset',
        askSel: 'Ask Tutor about this', hlSel: 'Highlight' },
};
let LANG = 'vi';
function applyLang() {
  const t = T[LANG];
  document.documentElement.dataset.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((n) => { const k = n.dataset.i18n; if (t[k]) n.textContent = t[k]; });
  document.querySelectorAll('[data-i18n-ph]').forEach((n) => { const k = n.dataset.i18nPh; if (t[k]) n.placeholder = t[k]; });
  $('btnLang').textContent = LANG.toUpperCase();
  renderPagerLabel();
  renderNote();
}

/* ─────────────── state ─────────────── */
let DOC = null;                     // pages.json
let cur = 3;                        // trang học viên đang xem
let presenter = 3;                  // trang giảng viên đang ở
let zoom = 1;
let mode = 'read';                  // read | pen | hl
let penW = 3;
let single = false;                 // một trang / cuộn liên tục
const A = {};                       // annotations: A[pageNo] = { ops: [...] }
let quote = '';                     // đoạn đang bôi đen để hỏi Tutor
let chatMsgs = [];                  // hội thoại gửi API
let sessions = [];                  // lịch sử hội thoại
let busy = false;
const ratios = new Map();

/* phát hiện dừng lâu ở một trang */
const DWELL_MS = 60_000;            // ngưỡng: 60 giây ở cùng một trang
let dwellMs = 0;                    // thời gian đã ở trang hiện tại (chỉ tính lúc đang thật sự đọc)
let armed = false;                  // badge "?" đang hiện
let awayRunning = false;            // đang chạy mô phỏng rời đi → không tính dwell
const struggled = new Set();        // trang đã hỏi rồi, mỗi trang chỉ 1 lần/phiên

const ann = (n) => (A[n] ||= { ops: [] });

/* ─────────────── boot ─────────────── */
(async function boot() {
  DOC = await (await fetch('pages.json')).json();
  $('fileName').textContent = DOC.doc.file;
  $('fileSub').textContent = `${DOC.doc.course} · ${DOC.doc.label}`;
  document.title = `VLearn — ${DOC.doc.file}`;
  $('pgTotal').textContent = DOC.doc.totalPages;

  renderLibrary();
  renderPages();
  wire();
  greet();

  // bám ảnh gốc: mở ở trang 3, sẵn 1 highlight → toolbar hiện "Trang 3 · 1 note"
  seedHighlight(3, 'Problem Statement');
  requestAnimationFrame(() => { goTo(3, false); setCur(3); });
})();

/* ─────────────── sidebar học liệu ─────────────── */
function renderLibrary() {
  $('railBody').innerHTML = '';
  DOC.library.forEach((day) => {
    const node = el(`
      <section class="day ${day.open ? 'open' : ''}">
        <button class="day-head">
          <span class="pi"><svg><use href="#i-play"/></svg></span>
          <span class="txt"><span class="t">${esc(day.name)}</span><span class="m">${day.docs} TÀI LIỆU · ${esc(day.state)}</span></span>
          ${day.badge ? `<span class="badge">${esc(day.badge)}</span>` : ''}
          <span class="chev"><svg><use href="#i-chev-d"/></svg></span>
        </button>
        <div class="day-items"></div>
      </section>`);
    const items = node.querySelector('.day-items');
    day.items.forEach((it) => {
      const d = el(`
        <button class="doc ${it.active ? 'active' : ''}">
          <span class="pi"><svg><use href="#i-play"/></svg></span>
          <span class="txt"><span class="dn">${esc(it.title)}</span><span class="dp">${esc(it.pages)}</span></span>
          ${it.active ? '<span class="ck"><svg><use href="#i-check"/></svg></span>' : ''}
        </button>`);
      d.onclick = () => {
        if (it.active) { goTo(1); toast('Về đầu tài liệu'); return; }
        toast(`"${it.title}" chưa được nạp trong prototype — demo dùng ${DOC.doc.file}`);
      };
      items.appendChild(d);
    });
    node.querySelector('.day-head').onclick = () => node.classList.toggle('open');
    $('railBody').appendChild(node);
  });
}

/* ─────────────── render slide pages ─────────────── */
function rowHTML(r) {
  const lead = r.no ? `<span class="no">${esc(r.no)}</span>`
    : r.k ? `<span class="k">${esc(r.k)}</span>`
    : `<span class="dot"></span>`;
  return `<div class="row">${lead}<span class="tx">${r.text}</span></div>`;
}

function renderPages() {
  const sc = $('scroller');
  sc.innerHTML = '';
  const total = DOC.doc.totalPages;
  for (const p of DOC.pages) {
    const nn = String(p.n).padStart(2, '0');
    const node = el(`
      <article class="page ${p.kind === 'cover' ? 'cover' : ''}" id="page-${p.n}" data-page="${p.n}">
        <div class="page-top"><span>Trang ${p.n} / ${total}</span><span>${esc(DOC.doc.file)}</span></div>
        <h2 class="p-title">${p.title}</h2>
        <div class="p-sub">${p.sub || ''}</div>
        <div class="rows">${(p.rows || []).map(rowHTML).join('')}</div>
        <div class="page-foot"><span>${esc(p.foot || '')}</span><span>${esc(DOC.doc.day)} · ${nn} / ${total}</span></div>
        <canvas class="ink"></canvas>
      </article>`);
    sc.appendChild(node);
  }
  sizeCanvases();
  observePages();
}

/* ─────────────── theo dõi trang đang xem ─────────────── */
let io = null;
function observePages() {
  io?.disconnect();
  ratios.clear();
  io = new IntersectionObserver((entries) => {
    for (const e of entries) ratios.set(Number(e.target.dataset.page), e.isIntersecting ? e.intersectionRatio : 0);
    if (single) return;
    let best = cur, bestR = -1;
    for (const [n, r] of ratios) if (r > bestR + 0.001) { bestR = r; best = n; }
    if (bestR > 0 && best !== cur) setCur(best);
  }, { root: $('scroller'), threshold: [0, .15, .3, .5, .75, 1] });
  document.querySelectorAll('.page').forEach((p) => io.observe(p));
}

function setCur(n) {
  if (n !== cur) resetDwell();        // đổi trang là tính lại từ đầu
  cur = n;
  renderPagerLabel();
  renderNote();
  $('slideChip').textContent = `${T[LANG].page} slide: ${n}`;
  $('ctxLine').innerHTML = `Ngữ cảnh: <b>Slide trang ${n}</b>`;
  if (single) document.querySelectorAll('.page').forEach((p) => p.classList.toggle('cur', Number(p.dataset.page) === n));
}
const renderPagerLabel = () => { $('pgNow').textContent = cur; };
function renderNote() {
  const k = ann(cur).ops.length;
  $('tnote').textContent = k ? `${T[LANG].page} ${cur} · ${k} note` : `${T[LANG].page} ${cur}`;
}

function goTo(n, smooth = true) {
  const p = $(`page-${n}`);
  if (!p) { toast(`Trang ${n} chưa có nội dung trong prototype`); return; }
  setCur(n);
  if (single) { p.scrollIntoView(); requestAnimationFrame(sizeCanvases); return; }
  const sc = $('scroller');
  const top = p.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  sc.scrollTo({ top: Math.max(0, top - 66), behavior: smooth ? 'smooth' : 'auto' });
}
function flash(n) { const p = $(`page-${n}`); if (!p) return; p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash'); }

/* ─────────────── canvas bút vẽ ─────────────── */
function sizeCanvases() {
  document.querySelectorAll('.page').forEach((p) => {
    const c = p.querySelector('canvas.ink');
    const dpr = window.devicePixelRatio || 1;
    const w = p.clientWidth, h = p.clientHeight;
    if (!w || !h) return;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    redraw(Number(p.dataset.page));
  });
}
function redraw(n) {
  const p = $(`page-${n}`); if (!p) return;
  const c = p.querySelector('canvas.ink'), ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#2547c8';
  ctx.lineCap = ctx.lineJoin = 'round';
  for (const op of ann(n).ops) {
    if (op.t !== 'stroke' || op.pts.length < 2) continue;
    ctx.lineWidth = op.w * dpr;
    ctx.beginPath();
    op.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * c.width, y * c.height) : ctx.moveTo(x * c.width, y * c.height)));
    ctx.stroke();
  }
}
function wirePen() {
  $('scroller').addEventListener('pointerdown', (e) => {
    if (mode !== 'pen') return;
    const c = e.target.closest('canvas.ink'); if (!c) return;
    const p = c.closest('.page'), n = Number(p.dataset.page);
    const r = c.getBoundingClientRect();
    const op = { t: 'stroke', w: penW, pts: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] };
    ann(n).ops.push(op);
    c.setPointerCapture(e.pointerId);
    const move = (ev) => { op.pts.push([(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height]); redraw(n); };
    const up = () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); renderNote(); };
    c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    e.preventDefault();
  });
}

/* ─────────────── highlight ─────────────── */
function pageOf(node) { const e = node.nodeType === 1 ? node : node.parentElement; return e?.closest('.page') || null; }

/** Bọc <mark> quanh vùng chọn, chịu được selection trải qua nhiều text node. */
function wrapRange(range) {
  const host = pageOf(range.startContainer);
  if (!host || host !== pageOf(range.endContainer)) return [];
  const slices = [];
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!range.intersectsNode(n) || !n.nodeValue.trim()) continue;
    if (n.parentElement.closest('mark')) continue;
    const s = n === range.startContainer ? range.startOffset : 0;
    const e = n === range.endContainer ? range.endOffset : n.nodeValue.length;
    if (e > s) slices.push({ n, s, e });
  }
  const made = [];
  for (const { n, s, e } of slices.reverse()) {           // ngược lại để split không lệch offset
    const mid = s ? n.splitText(s) : n;
    if (e - s < mid.nodeValue.length) mid.splitText(e - s);
    const mk = document.createElement('mark');
    mk.textContent = mid.nodeValue;
    mid.parentNode.replaceChild(mk, mid);
    made.unshift(mk);
  }
  return made;
}
function unwrap(els) {
  for (const m of els) {
    if (!m.parentNode) continue;
    const p = m.parentNode;
    p.replaceChild(document.createTextNode(m.textContent), m);
    p.normalize();
  }
}
function highlightSelection() {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  const host = pageOf(range.startContainer);
  if (!host) return false;
  const text = sel.toString().trim();
  const made = wrapRange(range);
  sel.removeAllRanges();
  if (!made.length) return false;
  ann(Number(host.dataset.page)).ops.push({ t: 'mark', els: made, text });
  renderNote();
  return true;
}
/** Highlight sẵn theo chuỗi text (dùng để khớp ảnh gốc: trang 3 có 1 note). */
function seedHighlight(n, needle) {
  const host = $(`page-${n}`); if (!host) return;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const i = node.nodeValue.indexOf(needle);
    if (i < 0) continue;
    const r = document.createRange();
    r.setStart(node, i); r.setEnd(node, i + needle.length);
    const made = wrapRange(r);
    if (made.length) ann(n).ops.push({ t: 'mark', els: made, text: needle });
    renderNote();
    return;
  }
}

function undoAnn() {
  const op = ann(cur).ops.pop();
  if (!op) return toast(`Trang ${cur} chưa có ghi chú nào`);
  if (op.t === 'mark') unwrap(op.els); else redraw(cur);
  renderNote();
  toast('Đã hoàn tác 1 ghi chú');
}
function clearAnn() {
  const a = ann(cur);
  if (!a.ops.length) return toast(`Trang ${cur} chưa có ghi chú nào`);
  a.ops.filter((o) => o.t === 'mark').forEach((o) => unwrap(o.els));
  a.ops = [];
  redraw(cur); renderNote();
  toast(`Đã xoá ghi chú trang ${cur}`);
}
function exportAnn() {
  const pages = Object.keys(A).map(Number).sort((a, b) => a - b)
    .map((n) => ({ page: n, highlights: A[n].ops.filter((o) => o.t === 'mark').map((o) => o.text), strokes: A[n].ops.filter((o) => o.t === 'stroke').length }))
    .filter((p) => p.highlights.length || p.strokes);
  if (!pages.length) return toast('Chưa có ghi chú nào để tải');
  const blob = new Blob([JSON.stringify({ file: DOC.doc.file, exportedAt: new Date().toISOString(), pages }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vlearn-notes.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Đã tải vlearn-notes.json');
}

/* ─────────────── popup khi bôi đen ─────────────── */
function hideSel() { $('selPop').hidden = true; }
function onSelectionUp(e) {
  if (mode === 'pen') return;
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!sel.rangeCount || sel.isCollapsed || text.length < 4 || !pageOf(sel.getRangeAt(0).startContainer)) return hideSel();

  if (mode === 'hl') { highlightSelection(); return hideSel(); }

  const rd = $('reader').getBoundingClientRect();
  const r = sel.getRangeAt(0).getBoundingClientRect();
  const pop = $('selPop');
  pop.hidden = false;
  const w = pop.offsetWidth || 300;
  pop.style.left = Math.min(Math.max(8, r.left - rd.left + r.width / 2 - w / 2), rd.width - w - 8) + 'px';
  pop.style.top = Math.max(8, r.top - rd.top - pop.offsetHeight - 10) + 'px';
  void e;
}

/* ─────────────── Tutor: khung tin nhắn ─────────────── */
function push(node) { $('tbody').appendChild(node); $('tbody').scrollTop = $('tbody').scrollHeight; return node; }
const bottom = () => { $('tbody').scrollTop = $('tbody').scrollHeight; };

/** markdown rất nhẹ: **bold**, `code`, gạch đầu dòng, xuống dòng. */
function fmt(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*[-•*]\s+/gm, '· ')
    .replace(/\n/g, '<br>');
}
function greet() {
  $('tbody').innerHTML = '';
  push(el(`<div class="msg bot">Xin chào! Mình là VLearn Tutor. Bạn có thể bôi đen một đoạn trên slide để hỏi, hoặc gửi câu hỏi tự do nhé!</div>`));
}
function setState(s) { $('tutorState').textContent = s; }

function errBlock(err, onMock) {
  const hint = {
    quota: 'Nạp credit ở <code>platform.openai.com/settings/organization/billing</code> rồi thử lại — code không cần sửa gì.',
    auth: 'Kiểm tra lại <code>OPENAI_API_KEY</code> trong <code>.env</code>.',
    nokey: 'Chạy server bằng <code>node --env-file=.env demo/server.mjs</code>.',
    model: 'Đổi model: <code>MODEL=gpt-4o-mini node --env-file=.env demo/server.mjs</code>.',
    ratelimit: 'Đợi vài giây rồi bấm lại.',
  }[err.code] || 'Xem log ở terminal chạy server để biết thêm.';
  const node = el(`
    <div class="err">
      <div class="h"><svg><use href="#i-warn"/></svg> Không gọi được AI (${esc(err.code || 'unknown')})</div>
      <div class="b">${esc(err.message)}<br><br>${hint}</div>
    </div>`);
  push(node);
  if (onMock) {
    const b = el(`<button class="btn btn-ghost">Dùng dữ liệu mẫu (MOCK) để chạy tiếp demo</button>`);
    b.onclick = () => { b.remove(); onMock(); };
    push(b);
  }
  setState('Lỗi gọi AI');
}

/* ─────────────── Tutor: chat streaming thật ─────────────── */
async function sendChat(text, opts = {}) {
  if (busy) return;
  const q = opts.quote ?? quote;
  busy = true; $('btnSend').disabled = true;

  push(el(`<div class="msg user">${q ? `<div style="font-size:11.5px;opacity:.7;font-style:italic;margin-bottom:5px">“${esc(q.slice(0, 120))}${q.length > 120 ? '…' : ''}”</div>` : ''}${esc(text)}</div>`));
  chatMsgs.push({ role: 'user', content: q ? `Về đoạn "${q}" ở trang ${cur}: ${text}` : text });
  dropQuote();

  setState('Đang trả lời…');
  const bubble = push(el(`<div class="msg bot"><span class="cursor"></span></div>`));
  let acc = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatMsgs, page: cur, quote: q }),
    });

    if ((res.headers.get('content-type') || '').includes('application/json')) {
      const j = await res.json();
      bubble.remove();
      errBlock(j.error || { code: 'unknown', message: 'Lỗi không rõ' });
      chatMsgs.pop();
      return;
    }

    const rd = res.body.getReader(), dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await rd.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const frames = buf.split('\n\n'); buf = frames.pop() ?? '';
      for (const f of frames) {
        for (const line of f.split('\n')) {
          if (!line.startsWith('data:')) continue;
          let evt; try { evt = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (evt.delta) { acc += evt.delta; bubble.innerHTML = fmt(acc) + '<span class="cursor"></span>'; bottom(); }
          if (evt.error) { bubble.innerHTML = fmt(acc); errBlock(evt.error); }
          if (evt.done) {
            bubble.innerHTML = fmt(acc);
            const m = evt.meta || {};
            bubble.appendChild(el(`<div class="pills"><span class="pill meta">${esc(m.model || '')} · ${((m.latency_ms || 0) / 1000).toFixed(1)}s${m.total_tokens ? ' · ' + m.total_tokens + ' tok' : ''}</span></div>`));
          }
        }
      }
    }
    if (acc) chatMsgs.push({ role: 'assistant', content: acc });
    else { bubble.remove(); chatMsgs.pop(); }
    setState('Sẵn sàng');
  } catch (e) {
    bubble.remove();
    errBlock({ code: 'network', message: 'Không kết nối được server: ' + e.message });
    chatMsgs.pop();
  } finally {
    busy = false; $('btnSend').disabled = false; bottom();
  }
}

/* ─────────────── phát hiện dừng lâu → badge "?" ─────────────── */

/** Đồng hồ chỉ chạy khi học viên thật sự đang đọc trang: tab hiện, không mô phỏng vắng, chưa hỏi trang này. */
function tickDwell() {
  if (document.hidden || awayRunning || armed || struggled.has(cur)) return;
  dwellMs += 1000;
  if (dwellMs >= DWELL_MS) arm();
}
function arm() {
  armed = true;
  $('qBadgeHead').classList.add('on');
  $('qBadgeTab').classList.add('on');
  setState('Bạn đang mắc ở trang này?');
  toast(`Bạn đã ở trang ${cur} hơn ${Math.round(dwellMs / 60000) || 1} phút — bấm dấu ? ở Tutor`);
}
function disarm() {
  armed = false;
  $('qBadgeHead').classList.remove('on');
  $('qBadgeTab').classList.remove('on');
}
function resetDwell() { dwellMs = 0; disarm(); }

/** Bấm badge "?" → bot hỏi + 3 chip khó khăn do AI sinh theo nội dung trang. */
async function askStruggle() {
  if (busy) return;
  const page = cur;
  const mins = Math.max(1, Math.round(dwellMs / 60000));
  struggled.add(page);
  disarm();
  if ($('tutor').classList.contains('collapsed')) $('hTutor').click();

  const card = push(el(`
    <div class="struggle">
      <div class="h">Bạn đang vướng chỗ nào ở trang ${page}? <span class="dw">đã ${mins} phút ở đây</span></div>
      <div class="b">Mình đoán mấy chỗ này dễ tắc nhất trong trang — bấm một cái, hoặc gõ câu hỏi của bạn.</div>
      <div class="chips"><div class="load"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div></div>
    </div>`));
  const host = card.querySelector('.chips');
  setState('Đang đọc trang bạn đang mắc…');

  try {
    const res = await fetch('/api/hints', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    });
    const data = await res.json();
    host.innerHTML = '';
    if (data.error) {
      host.appendChild(el(`<div class="msg sys">Chưa gợi ý được (${esc(data.error.code)}) — bạn gõ câu hỏi trực tiếp nhé.</div>`));
      setState('Lỗi gọi AI');
      return;
    }
    data.hints.forEach((h, i) => {
      const c = el(`<button class="chip-q"><span class="n">${i + 1}</span><span>${esc(h.q)}</span></button>`);
      c.onclick = () => { c.closest('.chips').querySelectorAll('.chip-q').forEach((b) => (b.disabled = true)); sendChat(h.q, { quote: '' }); };
      host.appendChild(c);
    });
    const m = data.meta || {};
    host.appendChild(el(`<div class="pills"><span class="pill meta">${esc(m.model || '')} · ${((m.latency_ms || 0) / 1000).toFixed(1)}s${m.total_tokens ? ' · ' + m.total_tokens + ' tok' : ''}</span></div>`));
    setState('Sẵn sàng');
    bottom();
  } catch (e) {
    host.innerHTML = '';
    host.appendChild(el(`<div class="msg sys">Không kết nối được server — bạn gõ câu hỏi trực tiếp nhé.</div>`));
    void e;
  }
}

/* ─────────────── Catch Me Up ─────────────── */
function simulateAway() {
  const last = DOC.pages.at(-1).n;
  const from = cur + 1;
  const to = Math.min(cur + 4, last);
  if (to < from + 1) return toast('Cuộn về gần đầu tài liệu rồi chạy lại demo');

  $('btnAway').disabled = true;
  awayRunning = true;              // dừng đồng hồ dwell: đang vắng thì không phải đang mắc
  resetDwell();
  setState('Bạn đang vắng…');
  $('presenter').hidden = false;
  let n = cur;
  const iv = setInterval(() => {
    n++;
    presenter = n;
    $('presenter').textContent = `Giảng viên đang ở trang ${n}`;
    if (n >= to) { clearInterval(iv); awayRunning = false; onMissed(from, to); }
  }, 300);
}

function onMissed(from, to) {
  const k = to - from + 1;
  setState('Phát hiện bạn lỡ trang');
  push(el(`<div class="msg sys">— Bạn vừa quay lại sau khi vắng 3 phút —</div>`));
  push(el(`
    <div class="alert">
      <div class="h"><svg><use href="#i-warn"/></svg> Bạn đã lỡ ${k} trang</div>
      <div class="b">Trong lúc bạn vắng, bài giảng đã đi từ trang ${from} đến ${to}. Bắt kịp ngay thay vì tua lại từng trang?</div>
    </div>`));
  const btn = el(`<button class="btn btn-coral"><svg><use href="#i-bolt"/></svg> Catch me up (${from}–${to})</button>`);
  btn.onclick = () => { btn.remove(); catchUp(from, to); };
  push(btn);
  toast(`VLearn Tutor: bạn đã lỡ ${k} trang`);
}

async function catchUp(from, to) {
  const k = to - from + 1;
  push(el(`<div class="msg user">⚡ Catch me up (${from}–${to})</div>`));
  setState('Đang đọc các trang bạn đã lỡ…');
  const load = push(el(`
    <div class="load">
      <div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div>
      <div class="note">AI đang đọc ${k} trang và chọn ra trang chứa ý chính…</div>
    </div>`));

  try {
    const res = await fetch('/api/catchup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to }),
    });
    const data = await res.json();
    load.remove();
    if (data.error) return errBlock(data.error, () => showSummary(from, to, DOC.mockSummary, [], { mock: true }));
    showSummary(from, to, data.bullets, data.skipped || [], data.meta || {});
  } catch (e) {
    load.remove();
    errBlock({ code: 'network', message: 'Không kết nối được server: ' + e.message },
      () => showSummary(from, to, DOC.mockSummary, [], { mock: true }));
  }
}

function showSummary(from, to, bullets, skipped, meta) {
  setState('Sẵn sàng');
  const k = to - from + 1;
  const node = el(`
    <div class="msg bot">
      <div class="sum-head">Tóm tắt nhanh ${k} trang bạn đã lỡ</div>
      <div class="sum-sub">Trang ${from}–${to} · theo đúng thứ tự</div>
      <div class="pills">
        <span class="pill ok">✓ Ý chính: ${bullets.length}/${k} trang</span>
        ${skipped.length ? `<span class="pill skip">Bỏ trang phụ: ${skipped.map((s) => s.p).join(', ')}</span>` : ''}
        ${meta.mock ? `<span class="pill mock">MOCK — chưa gọi AI</span>`
          : `<span class="pill meta">${esc(meta.model || '')} · ${((meta.latency_ms || 0) / 1000).toFixed(1)}s${meta.total_tokens ? ' · ' + meta.total_tokens + ' tok' : ''}</span>`}
      </div>
      <div class="bullets"></div>
    </div>`);
  const list = node.querySelector('.bullets');
  bullets.forEach((b) => {
    const unsure = /chưa chắc/i.test(b.t);
    const item = el(`<button class="bullet ${unsure ? 'unsure' : ''}"><span class="chip">Trang ${b.p}</span><span class="tx">${esc(b.t)}</span></button>`);
    item.onclick = () => { item.classList.add('seen'); goTo(b.p); flash(b.p); };
    list.appendChild(item);
  });
  if (!bullets.length) list.appendChild(el(`<div class="msg sys">AI đánh giá cả ${k} trang này đều là trang phụ — bạn không bỏ lỡ ý chính nào.</div>`));
  push(node);

  const done = el(`<button class="btn btn-blue">✓ Đã bắt kịp — tiếp tục học</button>`);
  done.onclick = () => { done.remove(); caughtUp(to); };
  push(done);
  push(el(`<div class="msg sys">Bấm từng ý để nhảy tới đúng trang đó.</div>`));
  if (skipped.length) push(el(`<div class="msg sys">Trang bị bỏ: ${skipped.map((s) => `${s.p} (${esc(s.why)})`).join(' · ')}</div>`));
}

function caughtUp(to) {
  presenter = to;
  goTo(to); flash(to);
  $('presenter').hidden = true;
  $('btnAway').disabled = false;
  setState('Đang theo dõi bài giảng');
  push(el(`<div class="msg bot">Đã bắt kịp! Bạn đang ở cùng trang với giảng viên. Cần bắt kịp lần nữa thì cứ rời đi rồi quay lại nhé.</div>`));
  toast('Bạn đã bắt kịp bài giảng ✓');
}

/* ─────────────── hội thoại: mới / lịch sử ─────────────── */
function newChat() {
  if ($('tbody').children.length > 1) {
    sessions.unshift({ at: new Date(), page: cur, html: $('tbody').innerHTML, msgs: chatMsgs.slice() });
    sessions = sessions.slice(0, 12);
  }
  chatMsgs = [];
  greet();
  setState(T[LANG].tutorSub);
  toast('Đã mở đoạn hội thoại mới');
}
function toggleHist() {
  const pop = $('histPop');
  if (!pop.hidden) { pop.hidden = true; return; }
  pop.innerHTML = sessions.length ? '' : '<div class="empty">Chưa có hội thoại nào được lưu.<br>Bấm + để mở đoạn mới.</div>';
  sessions.forEach((s, i) => {
    const first = (s.msgs.find((m) => m.role === 'user')?.content || 'Hội thoại trống').slice(0, 60);
    const b = el(`<button class="hi">${esc(first)}<small>trang ${s.page} · ${s.at.toLocaleTimeString('vi-VN')}</small></button>`);
    b.onclick = () => { $('tbody').innerHTML = s.html; chatMsgs = s.msgs.slice(); sessions.splice(i, 1); pop.hidden = true; bottom(); toast('Đã mở lại hội thoại'); };
    pop.appendChild(b);
  });
  pop.hidden = false;
}

/* ─────────────── quote bar ─────────────── */
function setQuote(t) {
  quote = t;
  $('quoteText').textContent = t;
  $('quoteBar').hidden = false;
  $('chatInput').focus();
}
function dropQuote() { quote = ''; $('quoteBar').hidden = true; }

/* ─────────────── zoom / mode / theme ─────────────── */
function setZoom(z) {
  zoom = Math.min(2, Math.max(.6, Math.round(z * 20) / 20));
  document.documentElement.style.setProperty('--zoom', zoom);
  $('zVal').textContent = Math.round(zoom * 100) + '%';
  requestAnimationFrame(sizeCanvases);
}
function setMode(m) {
  mode = m;
  $('reader').dataset.mode = m;
  document.querySelectorAll('.tool[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  hideSel();
  if (m === 'pen') toast(`Chế độ Bút — cỡ ${penW}px, kéo chuột để vẽ`);
  if (m === 'hl') toast('Chế độ Highlight — bôi đen là tô vàng ngay');
}
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  $('themeIcon').setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
  document.querySelectorAll('.page').forEach((p) => redraw(Number(p.dataset.page)));
}

/* ─────────────── toast ─────────────── */
let toastT;
function toast(m) {
  const t = $('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900);
}

/* ─────────────── reset demo ─────────────── */
function resetDemo() {
  Object.keys(A).forEach((n) => { A[n].ops.filter((o) => o.t === 'mark').forEach((o) => unwrap(o.els)); delete A[n]; });
  renderPages();
  presenter = 3;
  $('presenter').hidden = true;
  $('btnAway').disabled = false;
  awayRunning = false;
  struggled.clear(); resetDwell();
  chatMsgs = []; sessions = []; dropQuote();
  greet(); setState(T[LANG].tutorSub);
  setZoom(1);
  seedHighlight(3, 'Problem Statement');
  goTo(3, false); setCur(3);
  toast('Đã reset demo về trạng thái đầu');
}

/* ─────────────── wiring ─────────────── */
function wire() {
  // rail / tutor handles
  $('hRail').onclick = () => {
    $('rail').classList.toggle('collapsed');
    const c = $('rail').classList.contains('collapsed');
    $('hRail').querySelector('use').setAttribute('href', c ? '#i-chev-r' : '#i-chev-l');
    setTimeout(sizeCanvases, 300);
  };
  $('hTutor').onclick = (e) => {
    if (e.target.closest('.q-badge')) { askStruggle(); return; }   // bấm badge thì hỏi, không thu sidebar
    const t = $('tutor'); t.classList.toggle('collapsed');
    const c = t.classList.contains('collapsed');
    $('hTutor').classList.toggle('as-bot', c);
    $('hTutor').querySelector('use').setAttribute('href', c ? '#i-bot' : '#i-chev-r');
    setTimeout(sizeCanvases, 300);
  };

  // toolbar
  document.querySelectorAll('.tool[data-mode]').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
  $('zIn').onclick = () => setZoom(zoom + .1);
  $('zOut').onclick = () => setZoom(zoom - .1);
  $('penUp').onclick = () => { penW = Math.min(12, penW + 1); toast(`Cỡ bút: ${penW}px`); };
  $('penDown').onclick = () => { penW = Math.max(1, penW - 1); toast(`Cỡ bút: ${penW}px`); };
  $('btnExport').onclick = exportAnn;
  $('btnUndo').onclick = undoAnn;
  $('btnClear').onclick = clearAnn;
  $('btnFit').onclick = () => {
    single = !single;
    $('scroller').classList.toggle('single', single);
    setCur(cur);
    if (!single) requestAnimationFrame(() => goTo(cur, false));
    requestAnimationFrame(sizeCanvases);
    toast(single ? 'Chế độ một trang' : 'Chế độ cuộn liên tục');
  };
  $('btnMore').onclick = () => toast('← → đổi trang · bôi đen để hỏi Tutor · ⤓ tải ghi chú · 🗑 xoá ghi chú trang này');

  // pager
  $('pgPrev').onclick = () => goTo(Math.max(DOC.pages[0].n, cur - 1));
  $('pgNext').onclick = () => goTo(Math.min(DOC.pages.at(-1).n, cur + 1));

  // header
  $('btnTheme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  $('btnLang').onclick = () => { LANG = LANG === 'vi' ? 'en' : 'vi'; applyLang(); };
  $('btnBack').onclick = () => toast('Prototype chỉ có màn hình reader — nút quay lại để đúng giao diện VLearn');

  // selection
  $('scroller').addEventListener('mouseup', onSelectionUp);
  $('scroller').addEventListener('scroll', hideSel, { passive: true });
  $('selAsk').onclick = () => {
    const t = window.getSelection().toString().trim();
    window.getSelection().removeAllRanges(); hideSel();
    if (t) { setQuote(t); if ($('tutor').classList.contains('collapsed')) $('hTutor').click(); }
  };
  $('selHl').onclick = () => { highlightSelection(); hideSel(); };
  $('quoteDrop').onclick = dropQuote;

  // tutor
  $('chatForm').onsubmit = (e) => {
    e.preventDefault();
    const v = $('chatInput').value.trim();
    if (!v) return;
    $('chatInput').value = '';
    sendChat(v);
  };
  $('btnNew').onclick = newChat;
  $('btnHist').onclick = (e) => { e.stopPropagation(); toggleHist(); };
  document.addEventListener('click', (e) => { if (!e.target.closest('.tutor-head')) $('histPop').hidden = true; });

  // badge "?" — phát hiện dừng lâu
  $('qBadgeHead').onclick = (e) => { e.stopPropagation(); askStruggle(); };
  setInterval(tickDwell, 1000);
  // Alt-tab ngắn thì chỉ tạm dừng (tickDwell tự bỏ qua khi document.hidden);
  // rời đi lâu thì coi như mạch đọc đã đứt, tính lại từ đầu.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 30_000) resetDwell();
  });

  // demo
  $('btnAway').onclick = simulateAway;
  $('btnStuck').onclick = () => {
    if (struggled.has(cur)) return toast(`Trang ${cur} đã hỏi rồi — cuộn sang trang khác hoặc bấm Reset`);
    dwellMs = DWELL_MS; arm();
  };
  $('btnReset').onclick = resetDemo;

  // keyboard + resize
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); $('pgNext').click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('pgPrev').click(); }
  });
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeCanvases, 120); });

  wirePen();
  applyLang();
}
