/**
 * VLearn — Catch Me Up · local dev server + OpenAI proxy
 *
 * Chạy:   node --env-file=.env demo/server.mjs
 * Mở:     http://localhost:5173
 *
 * API key CHỈ nằm ở process này, không bao giờ gửi xuống browser.
 */
import { createServer } from 'node:http';
import { readFile, appendFile, mkdir } from 'node:fs/promises';
import { join, extname, resolve, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(HERE, '..');
const PORT = Number(process.env.PORT || 5173);
const MODEL = process.env.MODEL || 'gpt-4.1-mini';
const API_KEY = process.env.OPENAI_API_KEY || '';
// Đổi được để trỏ sang mock/proxy khi test — mặc định là OpenAI thật.
const OPENAI_URL = (process.env.OPENAI_BASE || 'https://api.openai.com/v1') + '/chat/completions';
const RUNS_LOG = join(ROOT, 'eval', 'runs.jsonl');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/* ───────────────────────── logging cho R4 (Eval) ───────────────────────── */

async function logRun(rec) {
  try {
    await mkdir(join(ROOT, 'eval'), { recursive: true });
    await appendFile(RUNS_LOG, JSON.stringify({ ts: new Date().toISOString(), ...rec }) + '\n', 'utf8');
  } catch (e) {
    console.error('[log] không ghi được runs.jsonl:', e.message);
  }
}

/* ───────────────────────── nội dung slide (nguồn duy nhất: pages.json) ───────────────────────── */

let docCache = null;
/** Đọc pages.json ở server để prompt luôn dựng từ nguồn thật, không tin dữ liệu client gửi lên. */
async function getDoc() {
  if (!docCache) docCache = JSON.parse(await readFile(join(HERE, 'pages.json'), 'utf8'));
  return docCache;
}

/* ───────────────────────── prompt building ───────────────────────── */

/** Biến 1 trang slide thành text phẳng để đưa vào prompt. */
function pageToText(page) {
  if (!page) return '';
  const strip = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const lines = [`TIÊU ĐỀ: ${strip(page.title)}`];
  if (page.sub) lines.push(`PHỤ ĐỀ: ${strip(page.sub)}`);
  if (page.foot) lines.push(`MỤC: ${strip(page.foot)}`);
  for (const r of page.rows || []) {
    const label = r.no ? `${r.no}. ` : r.k ? `${r.k}: ` : '- ';
    lines.push(label + strip(r.text));
  }
  return lines.join('\n');
}

const CATCHUP_SYSTEM = `Bạn là VLearn Tutor — trợ lý học theo ngữ cảnh trong một app đọc slide bài giảng.

Học viên vừa quay lại sau khi bị phân tâm và đã lỡ một số trang slide. Việc của bạn KHÔNG phải là tóm tắt mọi trang, mà là ra một QUYẾT ĐỊNH cho từng trang:

- Trang đó có chứa Ý CHÍNH (khái niệm, framework, kết luận, con số quan trọng) — hay chỉ là TRANG PHỤ (bìa, agenda, mục lục, trang chuyển tiếp, trang chỉ nhắc lại điều đã nói)?
- CHỈ tóm tắt các trang chứa ý chính. Bỏ hẳn trang phụ ra khỏi kết quả.
- Mỗi trang được chọn: đúng 1 câu tiếng Việt, tối đa 28 từ, viết như nói cho bạn học nghe, không mở đầu bằng "Trang này...".
- Giữ nguyên thứ tự trang tăng dần.
- Nếu nội dung một trang không đọc được hoặc quá mỏng để chắc chắn, vẫn đưa trang đó ra nhưng câu tóm tắt phải bắt đầu bằng "Phần này chưa chắc:" — TUYỆT ĐỐI không đoán nội dung.
- Không bịa thông tin không có trong nội dung được cung cấp.

Trả về đúng JSON theo schema, không thêm chữ nào ngoài JSON.`;

const HINTS_SYSTEM = `Bạn là VLearn Tutor. Học viên đã dừng ở một trang slide hơn một phút — dấu hiệu có thể đang mắc ở đâu đó trong trang này.

Đọc nội dung trang và đoán ĐÚNG BA chỗ dễ gây tắc nhất cho người mới. Ưu tiên theo thứ tự:
1. Khái niệm dễ lẫn với nhau (hai thứ gần giống mà khác bản chất).
2. Bước hoặc kết luận không hiển nhiên, cần lý do đứng sau.
3. Chỗ trừu tượng cần một ví dụ cụ thể mới hiểu.

Mỗi chỗ viết thành MỘT câu hỏi ngắn, tối đa 9 từ, đặt theo giọng chính học viên muốn hỏi — không viết "bạn có hiểu…", không viết "trang này…". Ví dụ đúng: "Phân biệt Workflow với Agent", "Vì sao ba pattern đầu đã đủ".

Chỉ dựa vào nội dung trang được cung cấp, không bịa khái niệm không có trong trang. Nếu trang quá mỏng (bìa, agenda) thì trả về ba câu hỏi tổng quát về chính nội dung ít ỏi đó.

Trả về đúng JSON theo schema.`;

function chatSystem(ctx) {
  const parts = [
    `Bạn là VLearn Tutor — trợ lý học theo ngữ cảnh, gắn với đúng trang slide mà học viên đang xem.`,
    ``,
    `Tài liệu: ${ctx.file || 'slide bài giảng'} (${ctx.course || ''} ${ctx.label || ''})`.trim(),
    `Học viên đang ở TRANG ${ctx.page}.`,
    ``,
    `NỘI DUNG TRANG ${ctx.page}:`,
    ctx.pageText || '(không đọc được nội dung trang)',
  ];
  if (ctx.neighbors) {
    parts.push('', 'NGỮ CẢNH CÁC TRANG LÂN CẬN (chỉ để tham chiếu):', ctx.neighbors);
  }
  if (ctx.quote) {
    parts.push('', `HỌC VIÊN ĐANG BÔI ĐEN ĐOẠN NÀY trên trang ${ctx.page}:`, `"""${ctx.quote}"""`,
      'Hãy trả lời tập trung vào đoạn được bôi đen.');
  }
  parts.push(
    '',
    'QUY TẮC TRẢ LỜI:',
    '- Trả lời bằng tiếng Việt, ngắn gọn, tối đa 4 câu hoặc 4 gạch đầu dòng.',
    '- Chỉ dựa vào nội dung slide được cung cấp ở trên.',
    '- Khi có thể, dẫn số trang theo dạng (trang N).',
    '- Nếu slide không có thông tin để trả lời, nói rõ "Phần này chưa chắc — slide đang xem không có thông tin đó" rồi mới gợi ý học viên xem trang nào.',
    '- Không bịa. Không mở đầu bằng lời chào dài dòng.'
  );
  return parts.filter((l) => l !== undefined).join('\n');
}

/* ───────────────────────── OpenAI helpers ───────────────────────── */

class UpstreamError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Map lỗi OpenAI thành code ngắn để UI hiển thị đúng banner. */
function classify(status, body) {
  const msg = body?.error?.message || `HTTP ${status}`;
  const type = body?.error?.type || '';
  const oaCode = body?.error?.code || '';
  if (status === 401) return new UpstreamError(status, 'auth', 'OPENAI_API_KEY không hợp lệ hoặc đã bị thu hồi.');
  if (oaCode === 'insufficient_quota' || /exceeded your current quota/i.test(msg))
    return new UpstreamError(status, 'quota', 'Tài khoản OpenAI hết quota — cần nạp credit ở platform.openai.com/settings/organization/billing.');
  if (status === 429) return new UpstreamError(status, 'ratelimit', 'Bị rate limit, thử lại sau vài giây.');
  if (status === 404 && /model/i.test(msg)) return new UpstreamError(status, 'model', `Model "${MODEL}" không khả dụng với key này.`);
  return new UpstreamError(status, type || 'upstream', msg);
}

async function openai(payload, { stream = false } = {}) {
  if (!API_KEY) throw new UpstreamError(500, 'nokey', 'Không tìm thấy OPENAI_API_KEY. Chạy server bằng: node --env-file=.env demo/server.mjs');
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, model: payload.model || MODEL, stream }),
  });
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON error body */ }
    throw classify(res.status, body);
  }
  return res;
}

/* ───────────────────────── route: /api/catchup ───────────────────────── */

const CATCHUP_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'catch_me_up',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['bullets', 'skipped'],
      properties: {
        bullets: {
          type: 'array',
          description: 'Các trang chứa ý chính, theo thứ tự trang tăng dần.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['p', 't'],
            properties: {
              p: { type: 'integer', description: 'Số trang slide.' },
              t: { type: 'string', description: 'Một câu tóm tắt ý chính của trang đó, tối đa 28 từ.' },
            },
          },
        },
        skipped: {
          type: 'array',
          description: 'Các trang bị đánh giá là trang phụ nên không tóm tắt.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['p', 'why'],
            properties: {
              p: { type: 'integer' },
              why: { type: 'string', description: 'Lý do rất ngắn, ví dụ "agenda", "trang chuyển tiếp".' },
            },
          },
        },
      },
    },
  },
};

async function handleCatchup(req, res, body) {
  const from = Number(body.from);
  const to = Number(body.to);
  if (!Number.isInteger(from) || !Number.isInteger(to) || to < from) {
    return json(res, 400, { error: { code: 'badreq', message: 'Khoảng trang không hợp lệ.' } });
  }

  const doc = await getDoc();
  const pages = [];
  for (let n = from; n <= to; n++) {
    const page = doc.pages.find((p) => p.n === n);
    pages.push({ page: n, content: pageToText(page) });
  }
  if (!pages.length) return json(res, 400, { error: { code: 'badreq', message: 'Không có trang nào trong khoảng.' } });

  const userMsg = [
    `Học viên đã lỡ các trang ${from}–${to} (${pages.length} trang). Nội dung từng trang:`,
    '',
    ...pages.map((p) => `=== TRANG ${p.page} ===\n${p.content || '(trang không đọc được nội dung)'}`),
  ].join('\n');

  const t0 = Date.now();
  try {
    const r = await openai({
      messages: [
        { role: 'system', content: CATCHUP_SYSTEM },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.2,
      response_format: CATCHUP_SCHEMA,
    });
    const data = await r.json();
    const latency = Date.now() - t0;
    const parsed = JSON.parse(data.choices[0].message.content);
    const usage = data.usage || {};

    await logRun({
      route: 'catchup', model: data.model, latency_ms: latency,
      in_tokens: usage.prompt_tokens, out_tokens: usage.completion_tokens, total_tokens: usage.total_tokens,
      missed_range: [from, to], missed_count: pages.length,
      picked: parsed.bullets.map((b) => b.p), skipped: parsed.skipped.map((s) => s.p),
    });

    return json(res, 200, {
      bullets: parsed.bullets,
      skipped: parsed.skipped,
      meta: { model: data.model, latency_ms: latency, total_tokens: usage.total_tokens, considered: pages.length },
    });
  } catch (e) {
    const latency = Date.now() - t0;
    await logRun({ route: 'catchup', model: MODEL, latency_ms: latency, error_code: e.code || 'unknown', error: e.message, missed_range: [from, to] });
    console.error('[catchup]', e.code || '', e.message);
    return json(res, 200, { error: { code: e.code || 'unknown', message: e.message } });
  }
}

/* ───────────────────────── route: /api/hints (phát hiện dừng lâu) ───────────────────────── */

const HINTS_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'struggle_hints',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['hints'],
      properties: {
        hints: {
          type: 'array',
          description: 'Đúng ba câu hỏi ngắn về chỗ dễ tắc trong trang.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['q'],
            properties: { q: { type: 'string', description: 'Câu hỏi ngắn tối đa 9 từ, giọng học viên.' } },
          },
        },
      },
    },
  },
};

async function handleHints(req, res, body) {
  const pageNo = Number(body.page);
  const doc = await getDoc();
  const page = doc.pages.find((p) => p.n === pageNo);
  if (!page) return json(res, 400, { error: { code: 'badreq', message: `Trang ${body.page} không có nội dung.` } });

  const t0 = Date.now();
  try {
    const r = await openai({
      messages: [
        { role: 'system', content: HINTS_SYSTEM },
        { role: 'user', content: `Nội dung TRANG ${pageNo}:\n\n${pageToText(page)}` },
      ],
      temperature: 0.4,
      response_format: HINTS_SCHEMA,
    });
    const data = await r.json();
    const latency = Date.now() - t0;
    const hints = JSON.parse(data.choices[0].message.content).hints.slice(0, 3);
    const usage = data.usage || {};

    await logRun({
      route: 'hints', model: data.model, latency_ms: latency, page: pageNo,
      in_tokens: usage.prompt_tokens, out_tokens: usage.completion_tokens, total_tokens: usage.total_tokens,
      hints: hints.map((h) => h.q),
    });

    return json(res, 200, { hints, meta: { model: data.model, latency_ms: latency, total_tokens: usage.total_tokens } });
  } catch (e) {
    await logRun({ route: 'hints', model: MODEL, latency_ms: Date.now() - t0, page: pageNo, error_code: e.code || 'unknown', error: e.message });
    console.error('[hints]', e.code || '', e.message);
    return json(res, 200, { error: { code: e.code || 'unknown', message: e.message } });
  }
}

/* ───────────────────────── route: /api/chat (SSE stream) ───────────────────────── */

async function handleChat(req, res, body) {
  const { messages = [], page: pageNo = 1, quote = '' } = body;
  const doc = await getDoc();
  const cur = doc.pages.find((p) => p.n === Number(pageNo));
  const near = [Number(pageNo) - 1, Number(pageNo) + 1]
    .map((n) => doc.pages.find((p) => p.n === n))
    .filter(Boolean)
    .map((p) => `[trang ${p.n}] ${String(p.title).replace(/<[^>]+>/g, '')}`)
    .join('\n');

  const ctx = {
    ...doc.doc,
    page: Number(pageNo),
    pageText: pageToText(cur),
    neighbors: near || undefined,
    quote: String(quote || '').slice(0, 1200) || undefined,
  };

  const t0 = Date.now();
  let upstream;
  try {
    upstream = await openai(
      {
        messages: [{ role: 'system', content: chatSystem(ctx) }, ...messages.slice(-12)],
        temperature: 0.3,
        max_tokens: 600,
        stream_options: { include_usage: true },
      },
      { stream: true }
    );
  } catch (e) {
    await logRun({ route: 'chat', model: MODEL, latency_ms: Date.now() - t0, page: ctx.page, error_code: e.code || 'unknown', error: e.message });
    console.error('[chat]', e.code || '', e.message);
    return json(res, 200, { error: { code: e.code || 'unknown', message: e.message } });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  let full = '';
  let usage = null;
  let model = MODEL;
  let buf = '';

  // upstream.body là WHATWG stream → chunk là Uint8Array, phải decode bằng TextDecoder
  // (Uint8Array.toString('utf8') trả về danh sách byte, không phải text).
  const dec = new TextDecoder();
  try {
    for await (const chunk of upstream.body) {
      buf += dec.decode(chunk, { stream: true });
      const frames = buf.split('\n\n');
      buf = frames.pop() ?? '';
      for (const frame of frames) {
        for (const line of frame.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let evt;
          try { evt = JSON.parse(payload); } catch { continue; }
          if (evt.model) model = evt.model;
          if (evt.usage) usage = evt.usage;
          const delta = evt.choices?.[0]?.delta?.content;
          if (delta) { full += delta; send({ delta }); }
        }
      }
    }
    const latency = Date.now() - t0;
    send({ done: true, meta: { model, latency_ms: latency, total_tokens: usage?.total_tokens } });
    await logRun({
      route: 'chat', model, latency_ms: latency, page: ctx.page, has_quote: !!ctx.quote,
      in_tokens: usage?.prompt_tokens, out_tokens: usage?.completion_tokens, total_tokens: usage?.total_tokens,
      chars_out: full.length,
    });
  } catch (e) {
    console.error('[chat/stream]', e.message);
    send({ error: { code: 'stream', message: 'Mất kết nối giữa lúc đang trả lời: ' + e.message } });
    await logRun({ route: 'chat', model, latency_ms: Date.now() - t0, page: ctx.page, error_code: 'stream', error: e.message });
  } finally {
    res.end();
  }
}

/* ───────────────────────── plumbing ───────────────────────── */

function json(res, status, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(s) });
  res.end(s);
}

function readBody(req, limit = 1_000_000) {
  return new Promise((ok, bad) => {
    let n = 0;
    const parts = [];
    req.on('data', (c) => {
      n += c.length;
      if (n > limit) { bad(new Error('payload quá lớn')); req.destroy(); return; }
      parts.push(c);
    });
    req.on('end', () => {
      try { ok(parts.length ? JSON.parse(Buffer.concat(parts).toString('utf8')) : {}); }
      catch (e) { bad(e); }
    });
    req.on('error', bad);
  });
}

/** Chỉ phục vụ file trong demo/ — chặn path traversal. */
async function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath).replace(/^\/+/, '');
  const target = normalize(join(HERE, rel));
  if (!target.startsWith(HERE.endsWith(sep) ? HERE : HERE + sep)) {
    return json(res, 403, { error: { code: 'forbidden', message: 'Ngoài phạm vi demo/' } });
  }
  try {
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': MIME[extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — không tìm thấy ' + rel);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return json(res, 200, { ok: true, model: MODEL, keyPresent: !!API_KEY, node: process.version });
  }

  const routes = { '/api/chat': handleChat, '/api/catchup': handleCatchup, '/api/hints': handleHints };
  if (req.method === 'POST' && routes[url.pathname]) {
    let body;
    try { body = await readBody(req); }
    catch (e) { return json(res, 400, { error: { code: 'badjson', message: e.message } }); }
    return routes[url.pathname](req, res, body);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json(res, 405, { error: { code: 'method', message: 'Chỉ hỗ trợ GET/POST' } });
  }
  return serveStatic(res, url.pathname);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  ✗ Cổng ${PORT} đang bị chiếm — có một server khác chạy rồi.`);
    console.error(`    · Nếu đó là server này: mở http://localhost:${PORT} là dùng được luôn.`);
    console.error(`    · Muốn chạy cổng khác:  $env:PORT=5174; node --env-file=.env demo/server.mjs`);
    console.error(`    · Muốn tắt cái đang chạy: Ctrl+C ở terminal đó, hoặc`);
    console.error(`      Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -Expand OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }\n`);
  } else {
    console.error(`\n  ✗ Không mở được server: ${e.message}\n`);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  VLearn · Catch Me Up`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  model: ${MODEL}   ·   OPENAI_API_KEY: ${API_KEY ? 'đã nạp (' + API_KEY.slice(0, 7) + '…)' : 'THIẾU — chạy với node --env-file=.env'}`);
  console.log(`  log eval: eval/runs.jsonl\n`);
});
