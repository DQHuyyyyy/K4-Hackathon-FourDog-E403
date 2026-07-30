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

**API key không bao giờ xuống browser.** Browser gọi `/api/chat` và `/api/catchup`; server tự dựng prompt từ `pages.json` (không tin nội dung client gửi lên) rồi gọi OpenAI.

| Route | Kiểu | Việc |
|---|---|---|
| `POST /api/chat` | SSE stream | Chat tự do, inject nội dung trang đang xem + đoạn bôi đen |
| `POST /api/catchup` | JSON | Nhận `{from,to}`, trả `{bullets, skipped, meta}` theo JSON Schema |
| `POST /api/hints` | JSON | Nhận `{page}`, trả 3 chỗ dễ tắc nhất trong trang theo JSON Schema |
| `GET /api/health` | JSON | Kiểm tra key/model đã nạp chưa |

## Quyết định AI (đây là chỗ ăn điểm Eval)

`/api/catchup` **không** chỉ tóm tắt. Nó buộc model ra quyết định cho từng trang: **ý chính** hay **trang phụ** (bìa, agenda, trang chuyển tiếp). Chỉ trang ý chính mới được tóm tắt; trang phụ trả về trong `skipped` kèm lý do.

Đây là quyết định *đo được*: với một đoạn slide có ground truth, so `picked` của AI với đáp án → ra precision/recall.

Rào an toàn theo Canvas dòng 6: trang không đọc được nội dung thì câu tóm tắt **phải** bắt đầu bằng `"Phần này chưa chắc:"`, không được đoán. UI tô chip màu coral cho những bullet đó.

## Log eval → `eval/runs.jsonl`

Mỗi lượt gọi AI ghi một dòng JSON:

```json
{"ts":"…","route":"catchup","model":"gpt-4.1-mini","latency_ms":1840,
 "in_tokens":1204,"out_tokens":132,"total_tokens":1336,
 "missed_range":[4,7],"missed_count":4,"picked":[5,6,7],"skipped":[4]}
```

`picked` + `skipped` là dữ liệu thô để dựng golden set và tính precision/recall cho R4. Route `hints` log thêm mảng `hints` để đối chiếu. Lỗi cũng được log (`error_code`).

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
- `+` mở hội thoại mới, `⟲` mở lại hội thoại cũ
- Tay nắm phải thu/mở Tutor; khi thu thì thành tab icon bot ở rìa phải

**Phát hiện dừng lâu** (chủ động)
- Ở cùng một trang liên tục **60 giây** → hiện badge `?` đỏ nhấp nháy ở icon bot (cả trong header Tutor và trên tab bot khi Tutor đang thu)
- Bot **không nói gì** cho tới khi bấm — push tín hiệu, pull nội dung
- Bấm `?` → gọi `/api/hints`, AI đọc trang và sinh **3 chỗ dễ tắc nhất** dạng chip bấm được; bấm chip là gửi thành câu hỏi thật
- Đồng hồ reset khi đổi trang; **tạm dừng** khi tab bị ẩn (alt-tab > 30s thì tính lại) và khi đang chạy mô phỏng rời đi — tránh vừa "lỡ trang" vừa "dừng lâu" cùng lúc
- Mỗi trang chỉ hỏi **1 lần mỗi phiên**, không quấy rầy
- Nút demo `⏱ Mô phỏng dừng lâu` cho hiện badge tức thì khi pitch

**Catch Me Up** (lát cắt chính)
1. Bấm `⏸ Mô phỏng rời đi 3 phút` → giảng viên đi từ trang hiện tại lên +4, badge coral hiện trang giảng viên
2. Tutor đẩy alert "Bạn đã lỡ 4 trang" + nút `⚡ Catch me up (4–7)`
3. Bấm → gọi `/api/catchup` thật → bullet kèm chip số trang, chip trang phụ bị bỏ, badge model/latency/token
4. Bấm bullet → nhảy tới trang đó, trang nháy viền xanh, bullet mờ đi
5. `✓ Đã bắt kịp` → về trạng thái theo dõi bình thường
6. `↺ Reset` để chạy lại khi pitch

## Khi AI lỗi

Server không bao giờ trả 500 trắng. Nó phân loại lỗi thành `quota` / `auth` / `nokey` / `model` / `ratelimit` / `network`, UI hiện banner đỏ kèm cách sửa cụ thể, và thêm nút **"Dùng dữ liệu mẫu (MOCK)"** để buổi pitch chạy tiếp được. Bullet MOCK luôn có chip cam `MOCK — chưa gọi AI` để không nhầm là AI thật.

## Nội dung slide

16 trang trong `pages.json` được đúc lại từ transcript Day 02 của data pack (`transcript-01-clean.md`, `transcript-02-clean.md`), giữ nhãn `/ 76` đúng như tài liệu gốc trên VLearn. Trang 3 khớp nguyên văn slide thật.

Trang 4 là **Agenda** — cố tình để trong khoảng bị lỡ mặc định (4–7) để demo được việc AI nhận ra đó là trang phụ và bỏ qua.

> Theo luật data pack: nội dung này chỉ dùng trong phạm vi hackathon, không đăng công khai, không chia sẻ ra ngoài khoá. Chỉ phần trang bị lỡ được gửi lên OpenAI (phần tối thiểu cần thiết để prototype chạy).
