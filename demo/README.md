# Catch Me Up — prototype VLearn Tutor

Reader VLearn dựng lại theo giao diện thật, kèm sidebar **VLearn Tutor** gọi AI thật.

## Chạy

```bash
node --env-file=.env demo/server.mjs
# → http://localhost:5173
```

Cần Node ≥ 20 (không cần `npm install` — zero dependency). Chạy từ **gốc repo** để `--env-file=.env` tìm được file.

Biến môi trường:

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | — | **Bắt buộc.** Đọc từ `.env`, chỉ nằm ở process server. |
| `MODEL` | `gpt-4.1-mini` | Đổi model, ví dụ `MODEL=gpt-4o-mini`. |
| `PORT` | `5173` | Cổng. |
| `OPENAI_BASE` | `https://api.openai.com/v1` | Trỏ sang mock/proxy khi test. |

## Kiến trúc

```
demo/
├── index.html    khung giao diện + sprite icon SVG
├── styles.css    token màu cho cả light & dark
├── app.js        toàn bộ tương tác client
├── pages.json    16 trang nội dung Day 02 + cây học liệu + dữ liệu MOCK
└── server.mjs    static server + proxy OpenAI + ghi log eval
```

**API key không bao giờ xuống browser.** Browser gọi `/api/chat` và `/api/wrapup`; server tự dựng prompt từ `pages.json` (không tin nội dung client gửi lên) rồi gọi OpenAI.

| Route | Kiểu | Việc |
|---|---|---|
| `POST /api/chat` | SSE stream | Chat tự do. Inject nội dung trang đang xem + đoạn bôi đen + nội dung đầy đủ các trang được nhắc trong câu hỏi + mục lục tài liệu |
| `POST /api/catchup` | JSON | Nhận `{from,to}`, trả `{bullets, skipped, meta}` theo JSON Schema. ⚠️ **Không còn UI nào gọi** từ 31/07 (Catch Me Up đã gỡ) — giữ lại để chạy lại được bằng chứng `catchup` trong `runs.jsonl` |
| `POST /api/hints` | JSON | Nhận `{page}`, trả 3 chỗ dễ tắc nhất trong trang theo JSON Schema |
| `POST /api/wrapup` | JSON | Nhận `{from,to}` (mặc định cả tài liệu), trả `{takeaways, skipped, meta}` |
| `POST /api/deck` | JSON | Nhận `{from,to}`, trả `{cards, dropped, meta}` — thẻ ôn dựng từ takeaway đã chốt |
| `GET /api/health` | JSON | Kiểm tra key/model đã nạp chưa |

## Quyết định AI (đây là chỗ ăn điểm Eval)

`/api/wrapup` **không** chỉ tóm tắt. Nó buộc model ra quyết định cho từng trang: **ý chính** hay **trang phụ** (bìa, agenda, trang chuyển tiếp). Chỉ trang ý chính mới vào tổng kết; trang phụ trả về trong `skipped` kèm lý do.

Đây là quyết định *đo được*: với tài liệu có ground truth, so `picked` của AI với đáp án → ra precision/recall.

Rào an toàn theo Canvas dòng 6: trang không đọc được nội dung thì câu tóm tắt **phải** bắt đầu bằng `"Phần này chưa chắc:"`, không được đoán. UI tô viền coral cho những ý đó và **không** cho chúng thành thẻ ôn.

Đầu ra **gom** các trang cùng nói về một ý thành một `takeaway` với `pages: [7,8,9]` — đó mới là "tổng hợp", và nó nối lại mạch xuyên trang thay vì liệt kê mỗi trang một dòng.

`/api/catchup` (không còn UI) hỏi cùng câu hỏi đó trên 4–5 trang, nên **chấm chung một golden set** nếu muốn thêm điểm đo.

Server lọc bỏ mọi trang model trả về mà không có thật trong khoảng, nên nút nhảy trang không bao giờ chết.

### `/api/deck` — biến đổi có ràng buộc, không phải quyết định mới

Thẻ ôn **không** đọc lại tài liệu độc lập mà sinh từ chính các takeaway đã chốt (lấy trong cache RAM của server, không nhận dữ liệu client gửi lên). Hai rào chắn chạy tự động trước khi thẻ tới tay học viên:

1. Takeaway nào bắt đầu bằng `"Phần này chưa chắc:"` thì **không được** biến thành thẻ — học viên sẽ học thuộc đúng thứ trên thẻ, nên thà thiếu còn hơn thuộc sai.
2. Mỗi thẻ bị chấm `groundedScore(đáp án, nội dung trang nguồn)` — tỉ lệ cặp-hai-âm-tiết của đáp án xuất hiện trong trang. Dưới `0.34` là model đã diễn giải ra ngoài slide → loại.

`dropped: {unsure, ungrounded}` trả về UI để nói thẳng đã bỏ bao nhiêu thẻ và vì sao.

## Log eval → `eval/runs.jsonl`

Mỗi lượt gọi AI ghi một dòng JSON:

```json
{"ts":"…","route":"catchup","model":"gpt-4.1-mini","latency_ms":1840,
 "in_tokens":1204,"out_tokens":132,"total_tokens":1336,
 "missed_range":[4,7],"missed_count":4,"picked":[5,6,7],"skipped":[4]}
```

`picked` + `skipped` là dữ liệu thô để dựng golden set và tính precision/recall cho R4. Route `hints` log thêm mảng `hints` để đối chiếu. Lỗi cũng được log (`error_code`).

`wrapup` log cùng cặp `picked`/`skipped` như `catchup` (nên chấm được bằng chung một golden set), thêm `takeaways` và `unsure`. `deck` log số đo tự động của riêng nó:

```json
{"route":"deck","cards_returned":5,"cards_kept":3,"dropped_unsure":1,
 "dropped_ungrounded":2,"grounded_ratio":0.6,"grounded_scores":[1,1,1,0.08,0]}
```

`grounded_ratio` là tỉ lệ thẻ truy được về trang nguồn — con số này server tự tính, không cần chấm tay.

> **Lưu ý cho R4:** route `/api/hints` là **quyết định AI thứ hai** ("chỗ nào trong trang dễ gây tắc nhất"). Nếu đưa nó vào phần chấm điểm thì cần golden set riêng; nếu chỉ muốn đo một quyết định thì giữ nó ở mức tính năng phụ trợ và chỉ đo `catchup`.

## Tính năng

**Reader**
- Cuộn liên tục nhiều trang; chip `Trang N`, pager và ngữ cảnh Tutor tự bám trang đang trong viewport
- Nút 🗍 đổi giữa cuộn liên tục ↔ một trang
- Zoom `− 100% +` (60–200%), phím `←` `→` đổi trang
- Cây học liệu Day01–Day06 mở/đóng được
- Dark mode (nút ◐), VI/EN đổi nhãn giao diện
- **Bút**: vẽ tự do trên canvas overlay, `+`/`−` đổi cỡ bút, nét lưu theo toạ độ tương đối nên zoom không lệch
- **Highlight**: bôi đen là tô vàng, chịu được vùng chọn trải qua nhiều thẻ
- `↺` hoàn tác từng ghi chú · `🗑` xoá ghi chú trang hiện tại · `⤓` tải `vlearn-notes.json`
- Bôi đen ở chế độ Đọc → hiện nút **Hỏi Tutor về đoạn này** → đoạn đó thành context của câu hỏi

**Tutor**
- Chat streaming thật, hiện badge `model · latency · tokens` dưới mỗi câu trả lời
- **Hỏi được trang ở xa trang đang xem.** `referencedPages()` rút số trang từ chính câu hỏi ("slide 10 nói gì", "trang 8 và 12 khác nhau chỗ nào", "tóm tắt trang 7-9") rồi server nạp nội dung đầy đủ đúng những trang đó từ `pages.json` — client không quyết định được text nào vào prompt. Trần 5 trang/lượt. Số phải thuộc về từ khoá `trang`/`slide`/`page`/`tr.` nên "70% thành công" không thành trang 70 — nhưng **nhận cả chữ đệm**: `slide số 7`, `trang thứ 12`, `từ trang số 5 đến trang số 8` (sửa 31/07, trước đó những cách nói này bị bỏ sót hoàn toàn). Hỏi trang không tồn tại thì prompt nói thẳng là tài liệu không có, không cho đoán
- **Tra cứu theo chủ đề** (thêm 31/07): hỏi theo nội dung mà không gọi số trang ("vì sao làm sản phẩm AI khó hơn", "Double Diamond là gì") → `topicPages()` chấm độ khớp giữa từ khoá câu hỏi và từng trang, nạp tối đa 3 trang liên quan nhất
  - Cụm hai âm tiết ăn điểm gấp đôi từ rời; trùng ở tiêu đề ăn thêm điểm — "sản phẩm" đáng tin hơn "sản" hay "phẩm" đứng riêng
  - Phải có ≥1 cụm hai âm tiết trùng hoặc ≥3 từ khoá trùng, nên câu xã giao ("cảm ơn bạn nhé", "bạn làm tôi bực mình") không quét trúng trang nào
  - **Loại trang thủ tục** (bìa · giới thiệu giảng viên · agenda · mục lục) khỏi tra cứu chủ đề: agenda liệt kê đủ mọi đề mục nên nó khớp với gần như mọi câu hỏi, mà nội dung chỉ là danh sách tiêu đề. Hỏi thẳng "trang 4 nói gì" thì vẫn nạp bình thường
  - Log `topic_pages` vào `runs.jsonl`
- **Bảo vệ prompt** (thêm 31/07): đoạn bôi đen do client gửi lên được đối chiếu với nội dung trang thật (`verifyQuote`), không khớp thì bỏ và ghi `quote_rejected`; lịch sử hội thoại chỉ nhận `user`/`assistant`, chặn `role` giả chèn chỉ thị
- `+` mở hội thoại mới, `⟲` mở lại hội thoại cũ
- Tay nắm phải thu/mở Tutor; khi thu thì thành tab icon bot ở rìa phải

**Phát hiện dừng lâu** (chủ động)
- Ở cùng một trang liên tục **60 giây** → hiện badge `?` đỏ nhấp nháy ở icon bot (cả trong header Tutor và trên tab bot khi Tutor đang thu)
- Bot **không nói gì** cho tới khi bấm — push tín hiệu, pull nội dung
- Bấm `?` → gọi `/api/hints`, AI đọc trang và sinh **3 chỗ dễ tắc nhất** dạng chip bấm được; bấm chip là gửi thành câu hỏi thật
- Đồng hồ reset khi đổi trang; **tạm dừng** khi tab bị ẩn (alt-tab > 30s thì tính lại)
- Mỗi trang chỉ hỏi **1 lần mỗi phiên**, không quấy rầy
- Nút demo `⏱ Mô phỏng dừng lâu` cho hiện badge tức thì khi pitch

> **Đã gỡ 31/07:** luồng **Catch Me Up** (nút `⏸ Mô phỏng rời đi 3 phút` → "Bạn đã lỡ N trang" → `/api/catchup`) không còn trong prototype. Badge `model · giây · token` dưới mỗi câu trả lời cũng đã bỏ — số liệu vẫn ghi đủ vào `eval/runs.jsonl`.

**Tổng kết cuối buổi + bộ thẻ ôn** (lát cắt chính)
1. Nút `Tổng kết buổi học` nằm ngay dưới dòng ngữ cảnh trong Tutor. Đọc tới trang cuối thì nút **tự nhấp nháy mời** và Tutor đẩy một card gợi ý — vẫn im lặng chờ bấm, giống badge `?`
2. Bấm → gọi `/api/wrapup` → bong bóng tổng kết: các ý gom theo phần (`PHẦN 2 · TÌM VẤN ĐỀ`), mỗi ý kèm **nhiều chip số trang**, chip `✓ Ý chính: 7/16 trang` và chip "Bỏ trang phụ"
3. Bấm một ý → nhảy tới trang gốc, ý đó mờ đi. Ý "chưa chắc" viền coral, không được đưa vào thẻ ôn
4. `Ôn lại bằng thẻ lật` → `/api/deck` → bộ thẻ chiếm trọn khung Tutor: mặt trước câu hỏi, bấm lật ra đáp án + chip trang nguồn, tự chấm `✓ Nhớ rồi` / `↺ Chưa chắc`
5. Hết bộ thẻ → điểm tự đánh giá (`2/3`) + danh sách **đúng những trang cần quay lại**, bấm là đóng thẻ và nhảy về trang đó
6. `Tải bản tổng kết (.md)` xuất file gồm cả takeaway lẫn thẻ ôn, để đọc lúc di chuyển

## Khi AI lỗi

Server không bao giờ trả 500 trắng. Nó phân loại lỗi thành `quota` / `auth` / `nokey` / `model` / `ratelimit` / `network`, UI hiện banner đỏ kèm cách sửa cụ thể, và thêm nút **"Dùng dữ liệu mẫu (MOCK)"** để buổi pitch chạy tiếp được. Bullet MOCK luôn có chip cam `MOCK — chưa gọi AI` để không nhầm là AI thật.

Tổng kết và bộ thẻ có `mockWrapup` / `mockDeck` trong `pages.json`. Nếu bản tổng kết đang là MOCK thì bộ thẻ dùng MOCK luôn, không gọi API một vòng chắc chắn hỏng rồi mới hiện nút.

## Test không đốt quota

Dựng một mock OpenAI local trả JSON/SSE giả rồi trỏ server sang nó:

```bash
OPENAI_BASE=http://localhost:5199/v1 node --env-file=.env demo/server.mjs
```

Phần giao diện kiểm bằng Chrome headless qua CDP (`WebSocket` có sẵn từ Node 22, không cần cài gì):

```bash
chrome --headless=new --remote-debugging-port=9333 about:blank
# rồi lái trang bằng Runtime.evaluate: bấm nút thật, đọc DOM thật
```

## Nội dung slide

16 trang trong `pages.json` được đúc lại từ transcript Day 02 của data pack (`transcript-01-clean.md`, `transcript-02-clean.md`), giữ nhãn `/ 76` đúng như tài liệu gốc trên VLearn. Trang 3 khớp nguyên văn slide thật.

Trang 4 là **Agenda** — cố tình để trong khoảng bị lỡ mặc định (4–7) để demo được việc AI nhận ra đó là trang phụ và bỏ qua.

> Theo luật data pack: nội dung này chỉ dùng trong phạm vi hackathon, không đăng công khai, không chia sẻ ra ngoài khoá. Chỉ phần trang bị lỡ được gửi lên OpenAI (phần tối thiểu cần thiết để prototype chạy).
