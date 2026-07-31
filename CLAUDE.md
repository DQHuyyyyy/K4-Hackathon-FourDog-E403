# CLAUDE.md — Context bàn giao dự án

> File này để người (hoặc AI) tiếp theo đọc là làm tiếp được ngay, không cần hỏi lại.
> Cập nhật lần cuối: 2026-07-31, sau khi **gỡ bỏ Catch Me Up** và bỏ badge `model · giây · token`.

---

## 1. Dự án là gì

**Sự kiện:** AI Thực Chiến — Venture Arena, hackathon 2 ngày 30–31/07/2026. Mỗi team vừa pitch như startup vừa đóng vai investor (100 điểm đầu tư, không đầu tư cho chính mình). Top 3 nhận nhiều điểm đầu tư nhất thắng.

**Chiến tuyến đã chọn:** Nâng cấp AI Tutor trên VLearn.

**Sản phẩm:** **Tổng kết cuối buổi** — trợ lý ngữ cảnh nằm cạnh slide trong VLearn. Học viên đọc hết tài liệu, bấm một nút, AI đọc cả buổi, **quyết định trang nào chứa ý chính vs trang phụ**, gom các trang cùng một ý thành takeaway kèm số trang bấm được để nhảy tới, rồi biến takeaway thành bộ thẻ ôn.

> ### ⚠️ Thay đổi phạm vi ngày 31/07 — đọc trước khi viết `spec.md`/pitch
>
> **Catch Me Up đã bị gỡ khỏi prototype** theo yêu cầu của team (nút `⏸ Mô phỏng rời đi 3 phút`, `simulateAway`/`onMissed`/`catchUp`/`showSummary`/`caughtUp`, badge "Giảng viên đang ở trang N", `mockSummary`). Cùng lúc bỏ badge `model · giây · token` dưới mỗi câu trả lời.
>
> Hệ quả **chưa xử lý**, cần team quyết:
> - **Canvas dòng 5** vẫn ghi lát cắt theo Catch Me Up (xem dưới) — không còn khớp sản phẩm. Phải viết lại trước khi nộp, nếu không R2 (15đ) mô tả một thứ không demo được.
> - Tên dự án, `catch-me-up-vlearn.html`, và các đoạn "Catch Me Up" rải trong `CP2.md` vẫn còn.
> - Route `/api/catchup` ở server **vẫn giữ nguyên** (không còn UI nào gọi tới). Giữ vì `eval/runs.jsonl` có lượt `catchup` thật là bằng chứng R4; xoá đi thì mất khả năng chạy lại. Quyết định xoá hay giữ là của team.

**Lát cắt một câu (Canvas dòng 5 — ĐÃ LỖI THỜI, cần viết lại):**
> ~~Học viên vừa quay lại sau khi lỡ 5 slide · bấm "Catch me up" · AI đọc 5 slide đó, quyết định slide nào chứa ý chính (vs slide phụ) · trả về 3–5 gạch đầu dòng theo thứ tự, mỗi ý kèm số slide nguồn.~~

**Ranh giới AI (Canvas dòng 6):** slide không đọc được nội dung thì báo rõ "phần này chưa chắc", **không đoán** — vì tóm tắt sai làm học viên bắt kịp bằng kiến thức sai.

---

## 2. Trạng thái checkpoint

| CP | Mốc | Trạng thái |
|---|---|---|
| CP1 | Chốt Canvas | ✅ Xong (chi tiết trong `CP2.md` §2) |
| CP2 | Show được thứ bấm được | ✅ Xong |
| CP3 | AI chạy thật + đo lượt đầu | ✅ **Đã có nhiều lượt gọi thật thành công** (xem §7) |
| CP4 | `spec.md` (hạn cứng 23:59 ngày 1) | ❌ Chưa viết |
| CP5 | Validation ≥3 người ngoài team | ❌ Chưa làm |
| CP6 | Demo | ❌ Chưa |

**Rubric 100đ:** 25đ nộp checkpoint + 75đ artifact (R1 bằng chứng 15 · R2 lát cắt 15 · R3 rủi ro 11 · **R4 kiểm thử 15** · R5 prototype 8 · R6 validation 8 · R7 repo 3).

---

## 3. Chạy dự án

```powershell
node --env-file=.env demo/server.mjs
# → http://localhost:5173
```

⚠️ **`.env` hiện KHÔNG còn ở gốc repo** (kiểm 30/07 tối) — lệnh trên sẽ chết ngay ở dòng `--env-file`. Tạo lại file `.env` một dòng `OPENAI_API_KEY=sk-…` trước khi chạy. File đã được `.gitignore` (`*.env`) che, không lo commit nhầm.

- Node ≥ 20, **không cần `npm install`** (zero dependency).
- Phải chạy **từ gốc repo**, vì `--env-file=.env` tìm file ở thư mục hiện tại.
- **Đừng** mở `demo/index.html` bằng `file://` hay Live Server — trang hiện được nhưng mọi lời gọi AI chết.
- Lỗi `EADDRINUSE` → server tự in hướng dẫn; đổi cổng bằng `$env:PORT=5174`.

| Biến env | Mặc định | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | — | Bắt buộc, đọc từ `.env` (đã được `.gitignore` bảo vệ) |
| `MODEL` | `gpt-4.1-mini` | Đổi model |
| `PORT` | `5173` | Cổng |
| `OPENAI_BASE` | `https://api.openai.com/v1` | Trỏ sang mock khi test |

---

## 4. Cấu trúc repo

```
├── CLAUDE.md                    ← file này
├── CP2.md                       context CP1/CP2, canvas, roadmap gốc
├── 01-de-bai.md 02-guide.md 03-template-ai-spec.md 04-rubric.md
├── .env                         OPENAI_API_KEY (KHÔNG commit, đã gitignore)
├── catch-me-up-vlearn.html      prototype CP2 cũ, giữ làm bằng chứng đã nộp
├── demo/                        ← prototype hiện tại, làm việc ở đây
│   ├── index.html               khung giao diện + sprite 24 icon SVG
│   ├── styles.css               token màu, có cả dark theme
│   ├── app.js                   toàn bộ tương tác client
│   ├── pages.json               16 trang nội dung + cây học liệu + dữ liệu MOCK
│   ├── server.mjs               static server + proxy OpenAI + log eval
│   └── README.md                tài liệu kỹ thuật chi tiết hơn file này
├── eval/runs.jsonl              log mọi lượt gọi AI — ĐỪNG XOÁ, là bằng chứng R4
├── data/vlearn-pack/            data pack BTC cấp (transcript, slide, chatlog)
└── tham-khao/                   JTBD playbook
```

---

## 5. Kiến trúc

Browser **không bao giờ** thấy API key. Browser gọi `/api/*` → `server.mjs` tự dựng prompt từ `pages.json` (không tin dữ liệu client gửi lên) → gọi OpenAI.

| Route | Kiểu | Việc |
|---|---|---|
| `POST /api/chat` | SSE stream | Chat tự do; server inject nội dung trang đang xem + tiêu đề 2 trang lân cận + đoạn bôi đen + **nội dung đầy đủ các trang học viên nhắc tới trong câu hỏi** + mục lục cả tài liệu |
| `POST /api/catchup` | JSON Schema | `{from,to}` → `{bullets, skipped, meta}` — ⚠️ **không còn UI nào gọi** sau khi gỡ Catch Me Up (31/07); giữ lại để chạy được bằng chứng R4 cũ |
| `POST /api/hints` | JSON Schema | `{page}` → 3 chỗ dễ tắc trong trang |
| `POST /api/wrapup` | JSON Schema | `{from,to}` (mặc định cả tài liệu) → `{takeaways, skipped, meta}`, mỗi takeaway gom nhiều trang |
| `POST /api/deck` | JSON Schema | `{from,to}` → `{cards, dropped, meta}`; thẻ dựng từ takeaway trong cache RAM, không tin client |
| `GET /api/health` | JSON | Kiểm tra key/model |

**Nội dung slide:** `demo/pages.json` — 16 trang đúc từ transcript Day 02 trong data pack, giữ nhãn `/ 76` như tài liệu thật trên VLearn. Trang 3 khớp nguyên văn slide thật. **Trang 1, 2, 4 là bìa / giới thiệu giảng viên / Agenda** — cố ý để demo được việc AI nhận ra trang phụ và bỏ qua.

**Hàm chính trong `app.js`:** `renderPages()` · `setCur()` · `goTo()` · `sendChat()` (streaming) · `askStruggle()` · `tickDwell()`/`arm()`/`disarm()` · `wrapUp()`/`showWrapup()`/`exportWrapup()` · `openDeck()`/`startDeck()`/`renderCard()`/`flipCard()`/`nextCard()`/`deckDone()` · `highlightSelection()`/`wrapRange()` · `wirePen()` · `resetDemo()`.

**State:** `cur` (trang đang xem) · `A[n].ops` (annotation từng trang) · `chatMsgs` · `struggled` (Set trang đã hỏi) · `dwellMs` · `wrapData` (bản tổng kết gần nhất) · `deck`/`deckI`/`deckShaky` (bộ thẻ đang ôn).

> Lưu ý khi test bằng DevTools/CDP: `app.js` là classic script, mọi `let` ở tầng ngoài nằm trong global **lexical** scope — gõ `cur` được, `window.cur` thì `undefined`.

---

## 6. Các quyết định AI

**Quyết định 1 — `/api/wrapup`: "trang này là ý chính hay trang phụ?"**
Đây là lát cắt chính và là chỗ ăn điểm R4. Nó **không phải** "sinh tóm tắt" — sinh tóm tắt thì không đo được. Quyết định chọn/bỏ trang thì so được với ground truth → ra precision/recall. Đầu ra **gom** các trang cùng một ý thành một takeaway `pages:[7,8,9]` — nối lại mạch xuyên trang.

`/api/catchup` hỏi model **đúng câu hỏi đó** trên phạm vi hẹp hơn (4–5 trang bị lỡ), nên chấm chung một golden set. Từ 31/07 route này không còn UI gọi tới, nhưng golden set dựng cho `wrapup` vẫn chấm được nó qua `curl` nếu cần thêm điểm đo.

**`/api/deck` — biến đổi có ràng buộc, không tính là quyết định mới**
Thẻ ôn sinh từ chính takeaway đã chốt (đọc từ cache RAM ở server), không đọc lại tài liệu độc lập. Hai rào chắn chạy tự động: ý "chưa chắc" không được thành thẻ, và mỗi thẻ bị chấm `groundedScore(đáp án, trang nguồn)` — dưới `0.34` là model đã diễn giải ra ngoài slide → loại. Số đo `grounded_ratio` vào thẳng `runs.jsonl`, không cần chấm tay.

**Quyết định 2 — `/api/hints`: "chỗ nào trong trang dễ gây tắc nhất?"**
Thêm ngày 30/07 cùng tính năng phát hiện dừng lâu. ⚠️ **Đây mới là chỗ thật sự phát sinh quyết định thứ hai** — nếu đưa vào chấm R4 thì cần golden set riêng. Muốn giữ đúng "một lát cắt" thì để nó là tính năng phụ trợ và chỉ đo `wrapup`.

---

## 7. Bằng chứng đã có (quan trọng cho CP3 + R4)

`eval/runs.jsonl` — **87 dòng** (đếm lại 31/07), trong đó **40 lượt gọi OpenAI thật thành công** (20 `chat` · 6 `hints` · 5 `catchup` · 5 `deck` · 4 `wrapup`), 43 lượt qua mock khi test, 4 dòng lỗi.

> Phân biệt thật/mock bằng trường `model`: lượt thật là `gpt-4.1-mini-2025-04-14`, lượt mock là `mock-gpt-*`. Đếm lại bất cứ lúc nào:
> ```powershell
> node -e "const l=require('fs').readFileSync('eval/runs.jsonl','utf8').trim().split('\n').map(JSON.parse); console.log(l.filter(o=>o.model&&!/^mock-/.test(o.model)&&!o.error_code).length)"
> ```

```json
{"route":"catchup","model":"gpt-4.1-mini-2025-04-14","latency_ms":2280,
 "in_tokens":1341,"out_tokens":126,"total_tokens":1467,
 "missed_range":[4,7],"missed_count":4,"picked":[5,6,7],"skipped":[4]}
```

**AI thật đã chọn đúng:** tóm tắt trang 5–7 và **tự bỏ trang 4 vì nhận ra là Agenda**. Đây chính là hành vi mà cả dự án đặt cược vào. Lượt thật thứ hai trên khoảng `[8,11]` chọn cả 4 trang, `skipped` rỗng — chứng minh AI **không bỏ trang bừa** mà thật sự phân biệt được, đây là mặt còn lại của bằng chứng.

🔴 **QUOTA ĐÃ HẾT — xác nhận 31/07 lúc ~10:05.** Mọi lượt gọi thật đều trả `{"error":{"code":"quota"}}`. Ngày 30/07 vẫn còn chạy được, giờ thì không. **Không nạp credit thì demo sống trên sân khấu là không thể** — chỉ còn nút "Dùng dữ liệu mẫu (MOCK)". Đây là việc số 1 ở §11.

**Tổng kết cuối buổi + bộ thẻ ôn cũng đã có lượt thật** (30/07, 15:08–15:09, sau khi đặt lại `.env`):

```json
{"route":"wrapup","model":"gpt-4.1-mini-2025-04-14","latency_ms":6818,
 "in_tokens":3760,"out_tokens":434,"total_tokens":4194,"range":[1,16],"considered":16,
 "picked":[5,6,7,8,9,10,11,12,13,14,15,16],"skipped":[1,2,4],"takeaways":6,"unsure":0}

{"route":"deck","model":"gpt-4.1-mini-2025-04-14","latency_ms":5769,"total_tokens":3642,
 "from_takeaways":6,"cards_returned":8,"cards_kept":6,"dropped_ungrounded":2,
 "grounded_ratio":0.75,"grounded_scores":[0.05,0.44,0.93,0.57,1,0.77,0.6,0.33]}
```

**AI thật lại chọn đúng:** bỏ trang 1 (bìa), 2 (giới thiệu giảng viên), 4 (agenda) — cùng loại quyết định với `catchup` nhưng trên cả buổi. Gom được `[7,8,9,10]` thành một ý xuyên 4 trang, đúng thứ `catchup` không làm được. Bộ lọc grounded loại 2/8 thẻ, `grounded_ratio = 0.75`.

⚠️ **Hai điểm cần chú ý khi dựng golden set:**
1. **Trang 3 không xuất hiện ở cả `picked` lẫn `skipped`** — model bỏ quên, vì schema không ép phải phủ hết mọi trang. Tính recall thì trang 3 sẽ thành miss. Cách sửa: thêm một câu vào `WRAPUP_SYSTEM` bắt mọi trang phải nằm ở một trong hai nhóm, và/hoặc log thêm trường `unaccounted`.
2. **Ngưỡng `GROUNDED_MIN = 0.34` chưa được hiệu chỉnh** — lượt thật có một thẻ bị loại ở đúng `0.33`, sát biên. Cần vài lượt nữa mới biết ngưỡng này chặt hay lỏng.

---

## 8. ĐÃ LÀM ĐƯỢC

### Giao diện (bám 3 screenshot VLearn thật)
- Header: back · logo VLearn · icon sách · tên file + `COMP2010 · Lecture_material_ms203vsq_ob7vqp` · nút `VI` · nút `◐`
- Sidebar trái: `Học liệu môn học`, card Day01→Day06 mở/đóng được, badge `STUDYING` ở Day02, doc card có viền xanh + check tròn
- Toolbar nổi 12 nút: `Đọc / Bút / Highlight / ···` ‖ `Trang N · M note` ‖ `− 100% +` ‖ `+ − ⤓ 🗍 ↺ 🗑`
- **Cuộn liên tục nhiều trang** (không phải thay 1 trang như prototype CP2 cũ)
- Trang giấy kem có dòng kẻ mờ, tiêu đề có chữ nhấn teal, footer 2 bên
- Pager nổi `‹ Trang N / 76 ›`
- Tay nắm `‹` trái thu sidebar học liệu; tay nắm phải thu Tutor và **biến thành tab icon bot** khi đã thu
- Sidebar Tutor phải: icon bot, chip `Trang slide: N`, dòng mono `Ngữ cảnh: Slide trang N`, bubble trắng viền xanh, ô nhập pill + nút gửi tròn
- Watermark: **đã bỏ** theo yêu cầu

### Reader
- Chip trang / pager / ngữ cảnh Tutor **tự bám trang đang trong viewport** (IntersectionObserver)
- Pager `‹ ›` và phím `←` `→`
- `🗍` đổi cuộn liên tục ↔ một trang
- Zoom `− 100% +` (60–200%)
- **Bút vẽ tự do**: canvas overlay mỗi trang, `+`/`−` đổi cỡ 1–12px, nét lưu toạ độ tương đối nên zoom không lệch
- **Highlight**: bôi đen là tô vàng, chịu được vùng chọn trải qua nhiều thẻ HTML (`wrapRange`)
- `↺` hoàn tác từng ghi chú · `🗑` xoá ghi chú trang · `⤓` tải `vlearn-notes.json`
- Đếm note `Trang 3 · 1 note` theo số ghi chú thật
- **Bôi đen ở chế độ Đọc → nút "Hỏi Tutor về đoạn này"** → đoạn đó thành context câu hỏi
- Dark mode toàn bộ (kể cả màu mực bút), `VI`↔`EN` đổi nhãn giao diện

### Tutor
- **Chat streaming AI thật**, chữ hiện dần. Badge `model · giây · token` dưới mỗi câu trả lời **đã bỏ 31/07** — số liệu vẫn ghi đủ vào `eval/runs.jsonl`, chỉ là không hiện trên giao diện nữa
- Context tự động: nội dung trang đang xem + tiêu đề 2 trang lân cận + đoạn bôi đen
- **Hỏi được trang ở xa** (sửa 31/07): hỏi "slide 10 nói gì", "trang 8 và 12 khác nhau chỗ nào", "tóm tắt trang 7-9" → server `referencedPages()` rút số trang từ chính câu hỏi rồi nạp **nội dung đầy đủ** đúng những trang đó từ `pages.json`. Trước đó chỉ có trang đang xem nên Tutor luôn trả "chưa chắc" khi hỏi trang xa
  - Số trang phải đứng sau từ khoá `trang`/`slide`/`page`/`tr.` → "70% thành công" không bị hiểu nhầm thành trang 70
  - Quét cả câu hỏi **trước đó** nên hỏi nối ("vì sao vậy?") vẫn giữ ngữ cảnh
  - Trần `MAX_ASK_PAGES = 5` trang mỗi lượt, giữ ràng buộc "chỉ gửi phần tối thiểu cần thiết"
  - Hỏi trang không tồn tại (trang 40 / tài liệu chỉ có 16) → prompt nói thẳng trang đó không có, model không được đoán
  - Kèm **mục lục tiêu đề cả 16 trang** để Tutor chỉ được "xem trang N" — trước đây prompt bắt nó gợi ý trang nhưng không cho nó biết tài liệu có gì
  - Log `asked_pages` / `asked_missing` vào `runs.jsonl`
- `+` hội thoại mới · `⟲` mở lại hội thoại cũ
- Thu/mở Tutor → tab icon bot

### ~~Catch Me Up~~ — ĐÃ GỠ 31/07
Toàn bộ luồng "mô phỏng rời đi → lỡ trang → catch me up" đã bị xoá khỏi `app.js`, `index.html`, `styles.css`, `pages.json` theo yêu cầu team. Xem cảnh báo phạm vi ở §1. Lấy lại được bằng `git revert` nếu đổi ý.

### Tổng kết cuối buổi + bộ thẻ ôn (lát cắt chính)
- Nút `Tổng kết buổi học` nằm dưới dòng ngữ cảnh trong Tutor; đọc tới trang cuối thì nút **tự nhấp nháy mời** + Tutor đẩy card gợi ý, vẫn im lặng chờ bấm
- Gọi `/api/wrapup` → bong bóng tổng kết: ý **gom theo phần** (`PHẦN 2 · TÌM VẤN ĐỀ`), mỗi ý kèm **nhiều chip số trang**, chip `✓ Ý chính: 7/16 trang` và chip "Bỏ trang phụ"
- Bấm một ý → nhảy tới trang gốc, ý mờ đi; ý "chưa chắc" viền coral và **không được đưa vào thẻ ôn**
- `Ôn lại bằng thẻ lật` → `/api/deck` → bộ thẻ chiếm trọn khung Tutor: lật thẻ ra đáp án + chip trang nguồn, tự chấm `✓ Nhớ rồi` / `↺ Chưa chắc`, thanh tiến trình
- Hết bộ → điểm tự đánh giá (`2/3`) + **danh sách đúng những trang cần quay lại**, bấm là đóng thẻ và nhảy về trang đó
- `Tải bản tổng kết (.md)` xuất cả takeaway lẫn thẻ ôn
- Server tự loại thẻ không truy được về trang nguồn và báo rõ số thẻ đã bỏ; có `mockWrapup`/`mockDeck` để pitch không chết

### Phát hiện dừng lâu (mới, 30/07)
- Ở cùng một trang **60 giây** → badge `?` đỏ nhấp nháy ở **cả** icon bot trong header **và** tab bot ở rìa phải
- Bot im lặng tới khi bấm (push tín hiệu, pull nội dung)
- Bấm `?` → gọi `/api/hints`, AI sinh 3 chip "chỗ dễ tắc"; bấm chip là gửi thành câu hỏi thật
- Reset khi đổi trang; tạm dừng khi tab ẩn (alt-tab > 30s thì tính lại)
- Mỗi trang chỉ hỏi 1 lần mỗi phiên
- Nút demo `⏱ Mô phỏng dừng lâu` cho hiện badge tức thì

### Server
- Static server + **chặn path traversal** (đã test `/%2e%2e%2f.env` → 403)
- Proxy SSE streaming; JSON Schema strict cho 2 route quyết định
- **Phân loại lỗi** `quota`/`auth`/`nokey`/`model`/`ratelimit`/`network` → UI hiện banner đỏ kèm cách sửa cụ thể
- **Nút "Dùng dữ liệu mẫu (MOCK)"** để pitch không chết giữa sân khấu; bullet MOCK có chip cam rõ ràng
- Thông báo `EADDRINUSE` tử tế thay vì stack trace
- **Log `eval/runs.jsonl`** mọi lượt: model, latency, in/out token, `picked`, `skipped`, `hints`, `error_code`

---

## 9. CHƯA LÀM ĐƯỢC

### ✅ Lỗi badge `?` — ĐÃ SỬA (30/07 tối)

Nguyên nhân đúng như nghi ngờ số 1: `if (busy) return;` ở đầu `askStruggle` nuốt click im lặng khi cờ `busy` còn sót lại từ lượt chat trước, nên `disarm()` không bao giờ chạy và badge cứ nằm đó.

Đã sửa hai chỗ:
1. **Bỏ hẳn cờ `busy` khỏi `askStruggle`** — nó không dùng chung tài nguyên với `sendChat`. Thay bằng kiểm tra `struggled.has(page)` và `toast()` báo rõ, không còn nhánh `return` câm nào.
2. **Cả hai badge tự bắt click trên chính nó** rồi `stopPropagation()`, thay vì để badge trên tab dựa vào `e.target.closest()` trong handler của `#hTutor` — click không còn rơi xuống nút cha thành thao tác thu/mở Tutor. Thêm `cursor:pointer` vì badge là `<span>`.

Đã reproduce đúng lỗi cũ và xác nhận đã hết: test browser thật đặt `busy = true` trước khi bấm badge, rồi kiểm cả ba điều kiện (có card mới · badge tắt · Tutor không bị thu). Xem §10.

### 🔴 Lỗi phát hiện thêm trong lúc test — đã sửa

**`hidden` không có tác dụng.** Mọi khối bật/tắt bằng thuộc tính `hidden` mà CSS có đặt `display:flex` (`.sel-pop`, `.quote-bar`, `.deck`) đều hiện thường trực, vì rule của tác giả luôn thắng UA stylesheet. Popup "Hỏi Tutor về đoạn này" đã hiện sai như vậy **từ trước**, không ai thấy vì chưa từng mở browser kiểm. Sửa bằng một dòng `[hidden]{display:none !important}` ở đầu `styles.css`.

### Chưa có bằng chứng / tài liệu (mất điểm nhiều nhất)
- ❌ **Khảo sát 34 người** — Canvas dòng 4 vẫn ghi `___/34`, **chưa có số thật**. Đây là R1 (15đ).
- ❌ **`spec.md`** 7 phần — CP4 hạn cứng 23:59 ngày 1. Template có sẵn ở `03-template-ai-spec.md`.
- ❌ **Golden set** — `eval/golden-set.json` chưa tồn tại. Cần chọn 3–5 đoạn 4–5 trang, tự đánh dấu trang nào là ý chính, chạy AI, tính precision/recall. Đây là R4 (15đ), hiện chỉ có log thô.
- ❌ **Validation ≥3 người ngoài team** — `validation/feedback-log.md` chưa có. R6 (8đ).
- ❌ **Reflection cá nhân** từng thành viên. **README repo** với tên + phân công. **Slide pitch.** R7 (3đ).
- ❌ **Tên thành viên thật** — `CP2.md` §2 dòng 7 vẫn là placeholder An/Bình/Châu/Dũng/Em.

### Prototype — phần trang trí / giới hạn
- Nút back `‹` chỉ hiện toast, không có màn hình khác
- `···` chỉ hiện toast gợi ý phím tắt, không phải menu thật
- Các tài liệu khác trong sidebar (day01_302.pdf…) bấm ra toast "chưa nạp"; chỉ `material_95eb786b4d9e.pdf` có nội dung
- **Chỉ có 16 trang** dù nhãn ghi `/ 76`; `pgNext` ở trang 16 sẽ báo "chưa có nội dung"
- `VI`↔`EN` chỉ đổi nhãn giao diện; nội dung slide và Tutor luôn tiếng Việt
- Lịch sử hội thoại chỉ sống trong RAM, refresh là mất

### Tính năng đã brainstorm nhưng chưa build
| Tính năng | Ghi chú |
|---|---|
| Tự tóm tắt ngay khi đổi slide | Tốn token liên tục — cuộn 16 trang là 16 lời gọi |
| Tóm tắt tăng dần, nối mạch liên slide | Một phần đã có: `wrapup` gom trang cùng ý thành một mạch. Phần "cập nhật dần theo từng slide" thì chưa |
| Trắc nghiệm 4 đáp án chấm điểm | Đã chọn flashcard lật thay vì trắc nghiệm: sinh đáp án nhiễu = bắt AI bịa, trái Canvas dòng 6 |
| Đọc slide thật qua DOM / OCR / model đa phương thức | Hiện dùng `pages.json` soạn tay |
| Trí nhớ dài hạn xuyên buổi | Hiện chỉ inject tiêu đề 2 trang lân cận |
| Live indicator "đã tóm tắt X / còn Y" | Có chip trang rồi, thiếu bộ đếm |
| Phát hiện quay lại trang nhiều lần | Đã có phát hiện dừng lâu; phần "revisit" chưa làm |
| Tổng kết tài liệu dài > 30 trang | `MAX_WRAP_PAGES = 30` chặn trước. Cả buổi 76 trang thật thì phải chia cụm, chưa làm |

**Vì sao hoãn:** Evidence Gate #4 chấm "lát cắt đủ sắc — 1 người dùng · 1 công việc · 1 quyết định AI · 1 kết quả". Mỗi tính năng mới là một quyết định AI mới cần golden set riêng cho R4. `CP2.md` §8 nguyên tắc 1 đã chốt: CP2–CP6 chỉ demo một lát cắt, phần còn lại gói làm roadmap trong pitch. (Lát cắt đó nay là "tổng kết cuối buổi", không còn là Catch Me Up — xem §1.)

**Vì sao "tổng kết cuối buổi" vẫn được build (30/07 tối):** vì nó **không** thêm quyết định AI mới — vẫn là "ý chính hay trang phụ", chỉ đổi phạm vi, nên dùng chung golden set (§6). Câu chuyện pitch cũng chặt hơn: *một quyết định AI, hai khoảnh khắc — giữa buổi khi bị lỡ, cuối buổi khi phải ôn.*

---

## 10. Kiểm thử đã chạy

| Hạng mục | Kết quả |
|---|---|
| Static routes, health | ✅ 200 |
| Path traversal `/%2e%2e%2f.env` | ✅ 403 |
| `.env` có bị gitignore | ✅ `git check-ignore` xác nhận |
| Error path OpenAI thật | ✅ phân loại đúng `quota` |
| `/api/catchup` happy path | ✅ qua mock — parse JSON Schema, picked [5,6,7] skipped [4] *(route còn sống, UI đã gỡ)* |
| `/api/chat` streaming | ✅ qua mock — nhận đủ delta, ghép đúng text |
| `/api/hints` | ✅ qua mock — trả 3 chip, `slice(0,3)` cắt đúng khi AI trả 4 |
| Trang không tồn tại | ✅ `badreq` trước khi gọi AI, không đốt token |
| `referencedPages()` — tách số trang từ câu hỏi | ✅ 12/12 case: "slide 10"→[10] · "trang 8 và 12"→[8,12] · "trang 7-9"→[7,8,9] · "trang 5 đến 8"→[5,6,7,8] · **"70% thành công"→[] · "4 câu hỏi"→[]** · "trang 1-999" chặn ở 20 |
| Nạp trang xa vào prompt `/api/chat` | ✅ soi prompt thật qua mock: có khối `── TRANG 10 ──` đầy đủ nội dung · hỏi trang 40 → prompt cảnh báo "chỉ có trang 1–16" · hỏi nối "vì sao vậy?" vẫn giữ trang 10 · không nhắc trang nào → không nạp thừa · trần 5 trang chặn đúng |
| Cross-check tĩnh | ✅ 61/61 `$('id')` tồn tại · 26 icon symbol đủ · i18n VI+EN đủ (15/15) · không class thiếu CSS |
| `/api/wrapup` | ✅ qua mock — gom trang đúng, **tự lọc bỏ takeaway trỏ trang không tồn tại** (6 → 5) |
| `/api/deck` | ✅ qua mock — loại 1 ý "chưa chắc" + 2 thẻ không truy được nguồn (`grounded_scores [1,1,1,0.08,0]`) |
| `/api/deck` khi chưa có cache | ✅ tự chạy `wrapup` trước rồi mới dựng thẻ, log cả 2 lượt, cộng dồn token |
| Biên khoảng trang | ✅ >30 trang và from>to → `badreq`; không truyền `from/to` → mặc định cả tài liệu |
| Bộ thẻ rỗng | ✅ mọi ý đều "chưa chắc" → trả `cards:[]`, UI giải thích vì sao không có thẻ |
| Upstream chết | ✅ cả 2 route mới trả `error` có code + ghi `error_code` vào log, UI hiện nút MOCK |

**Test hồi quy sau khi gỡ Catch Me Up (31/07) — 27/27 PASS, 0 exception.** Chrome headless qua CDP, mock OpenAI ở `:5199` nên không đốt quota. Kiểm: nút/badge/hàm/biến của Catch Me Up đã biến mất sạch · `mockSummary` hết, `mockWrapup` còn · chat + hints + wrapup không còn `.pill.meta` nào · chip `✓ Ý chính` và `Bỏ trang phụ` vẫn còn · bấm takeaway nhảy đúng trang 7 · badge `?` bật/tắt đúng · thẻ lật mở được · `↺ Reset` không ném lỗi. Cross-check tĩnh: 56/56 `$('id')` tồn tại, i18n VI+EN đủ 14/14, không còn class nào mất CSS.

**Test giao diện trong browser thật (30/07) — 40/40 PASS** (Chrome headless lái qua CDP, `WebSocket` có sẵn từ Node 22 nên vẫn zero dependency). Bấm nút thật, đọc DOM thật, bắt cả `Runtime.exceptionThrown` lẫn `console.error`: khởi động · **regression lỗi badge cũ** (đặt `busy = true` rồi bấm) · badge trên tab · tổng kết (số ý, nhóm theo phần, chip "chưa chắc", chip bỏ trang phụ) · bấm ý nhảy trang · lật thẻ · tự chấm · màn kết quả · nhảy về trang chưa chắc · xuất `.md` · dark mode · VI↔EN · reset · auto mời ở trang cuối. Không có exception nào trong cả phiên.

**Bug đã bắt và sửa trong quá trình test:**
1. Chat stream trả rỗng — `upstream.body` cho ra `Uint8Array`, `Uint8Array.toString('utf8')` trả về `"100,97,116,97…"` chứ không phải text. Sửa bằng `TextDecoder`.
2. Thiếu bản dịch EN cho nhãn `⏱ Mô phỏng dừng lâu`.
3. Class `ghost` không có CSS (dead class).
4. **`[hidden]` vô tác dụng** với mọi khối có `display:flex` — overlay bộ thẻ và popup bôi đen hiện thường trực. Chỉ lộ ra khi chụp màn hình thật (§9).
5. **Thẻ lật kéo giãn hết chiều cao khung** vì `flex:1` → đổi sang cao tự nhiên `min-height:210px`.
6. **Đang ở chế độ MOCK mà bấm ôn thẻ vẫn gọi API** một vòng chắc chắn hỏng rồi mới hiện nút MOCK → nay tổng kết MOCK thì thẻ dùng MOCK luôn.

**Cách test API mà không đốt quota:** dựng mock OpenAI local trả JSON/SSE giả rồi chạy `OPENAI_BASE=http://localhost:5199/v1 node --env-file=.env demo/server.mjs`.

---

## 11. Việc tiếp theo, theo thứ tự ưu tiên

1. 🔴 **NẠP CREDIT OPENAI** — xác nhận hết quota 31/07 (§7). Đây là thứ chặn mọi thứ khác: không có credit thì không demo thật được, không chạy được golden set, không có thêm bằng chứng R4. `.env` vẫn còn ở gốc repo và key vẫn nạp được, chỉ là hết tiền.
2. **Xử lý hệ quả của việc gỡ Catch Me Up** (§1) — viết lại Canvas dòng 5 cho khớp sản phẩm thật, nếu không R2 (15đ) chấm một thứ không demo được.
3. **Chạy form khảo sát**, điền số thật vào Canvas dòng 4. Không có số này thì R1 mất phần lớn 15đ.
4. **Viết `spec.md`** — CP4 hạn cứng 23:59 ngày 1, template ở `03-template-ai-spec.md`.
5. **Dựng golden set** — đánh dấu ground truth "ý chính / trang phụ" cho 16 trang, chạy `wrapup`, tính precision/recall từ `picked`/`skipped` trong `runs.jsonl` (§6). R4 15đ đang bỏ trống.
6. **Cho ≥3 người ngoài team thử**, ghi `validation/feedback-log.md`. R6 8đ.
7. **README repo + reflection + slide pitch.** R7 3đ.
8. Chỉ khi còn thời gian mới nghĩ tới tính năng mới ở §9.

---

## 12. Ràng buộc phải giữ

**Dữ liệu (Slide 11 — Data is Trust):**
- Chỉ dùng data pack hackathon hoặc dữ liệu giả tự sinh
- **Không commit API key** — `.env` đã trong `.gitignore` (`*.env`), giữ nguyên
- Không đổ nguyên file data pack lên repo nộp bài — trích ngắn, dẫn bằng mã đoạn `[Txx-NNN]`
- Không đăng data pack lên mạng xã hội, không chia sẻ ra ngoài khoá
- Gửi lên AI ngoài: chỉ phần tối thiểu cần thiết (hiện chỉ gửi nội dung các trang bị lỡ)
- Xoá data pack sau sự kiện nếu BTC yêu cầu
- Tên giảng viên/TA/khách mời **đã được ẩn** trong transcript — đừng khôi phục

**Thiết kế (từ `CP2.md` §8):**
1. **Một lát cắt duy nhất** — mọi tính năng khác là roadmap trong pitch, không build. Ngoại lệ duy nhất được chấp nhận: tính năng **không thêm quyết định AI mới** (xem §6). Lát cắt hiện tại là **tổng kết cuối buổi**, không còn là Catch Me Up (§1)
2. **Quyết định AI phải rõ và đo được** — "chọn trang ý chính" chứ không phải "sinh tóm tắt"
3. **Ranh giới AI** — không đọc được thì nói "chưa chắc", không đoán. Đây là điểm ăn R3 (11đ)
4. **Bằng chứng phải thật** — con số khảo sát không được bịa

**Code:**
- Zero dependency, không thêm `npm install` trừ khi thật cần
- API key không bao giờ xuống browser
- Prompt dựng ở server từ `pages.json`, không tin dữ liệu client gửi lên
- Mọi lượt gọi AI phải log vào `runs.jsonl` — đó là nguồn điểm R4
