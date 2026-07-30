# CP2 · Catch Me Up — Handoff Context

> File này gói toàn bộ context để tiếp tục dự án ở tài khoản/phiên khác.
> Đọc từ trên xuống. Mỗi section đều đứng độc lập được.

---

## 0. TL;DR — đang ở đâu

- **Sự kiện:** AI Thực Chiến — Venture Arena (Hackathon 30/07 – 31/07)
- **Team:** thí sinh (K3)
- **Chiến tuyến:** VLearn AI Tutor
- **Idea:** **Catch Me Up** — trợ lý ngữ cảnh trong VLearn Tutor. Khi học viên lỡ vài trang tài liệu, bấm 1 nút → AI đọc các trang đã trôi qua, chọn ra ý chính, trả về 3–5 bullet kèm số trang nguồn.
- **Trạng thái checkpoint:** ✅ CP1 (Canvas) xong · 🟡 CP2 (prototype bấm được) xong bản đầu · ⬜ CP3–CP6 chưa làm.
- **Deliverable CP2 hiện có:** file `catch-me-up-vlearn.html` — prototype bám giao diện VLearn thật, có sidebar Tutor bên phải, luồng "rời đi → quay lại → catch me up → tóm tắt bullet → nhảy trang" chạy được end-to-end. **Dữ liệu tóm tắt hardcode, chưa gọi AI** (đúng chuẩn CP2).

---

## 1. Bối cảnh sự kiện (Venture Arena)

**Thể thức:** hackathon 2 ngày, mô phỏng thị trường gọi vốn. Mỗi team 3–5 người, vừa là startup pitch vừa là investor (100 điểm đầu tư/team, không đầu tư cho chính mình). Top 3 nhận điểm đầu tư cao nhất thắng.

**3 chiến tuyến:**
1. Nâng cấp AI Tutor trên VLearn ← *nhóm chọn cái này*
2. Trợ lý học viên trên Discord
3. Hướng mở

**6 checkpoint (Khóa 3):**
| # | Mốc | Deadline K3 |
|---|---|---|
| CP1 | Chốt Canvas | 10:00 ngày 1 |
| CP2 | Show được thứ bấm được | 12:00 ngày 1 |
| CP3 | AI chạy thật + đo lượt đầu | 16:00 ngày 1 |
| CP4 | Chốt tiến độ (spec nộp hạn cứng 23:59 ngày 1) | 17:30 ngày 1 |
| CP5 | Xác minh + validation + dry run | 09:00 ngày 2 |
| CP6 | Demo | 10:00 ngày 2 |

**5 cổng bằng chứng (Evidence Gate) áp dụng xuyên suốt:**
1. Pain cụ thể — ai, mắc ở đâu, hậu quả
2. Bằng chứng — khảo sát ≥20 người, ≥50% xác nhận **hoặc** đếm ≥5 ví dụ dữ liệu
3. Problem & impact — viết không dùng chữ "AI", so sánh ≥3 cơ hội
4. Lát cắt đủ sắc — 1 người dùng · 1 công việc · 1 quyết định AI · 1 kết quả, demo được 5 phút
5. Người dùng sẵn sàng thử — ≥3 người ngoài team đồng ý thử trước Demo

**Rubric học thuật 100đ:**
- 25đ nộp checkpoint (5đ/CP × 5 CP)
- 75đ artifact: R1 Bằng chứng & impact (15đ) · R2 Lát cắt & thiết kế (15đ) · R3 Chỗ khó & rủi ro (11đ) · R4 Kiểm thử (15đ) · R5 Prototype chạy được (8đ) · R6 Validation với user (8đ) · R7 Quy trình & repo (3đ)

**Repo cần chuẩn bị trước CP6:** README · AI Spec (spec.md) · Demo slides · Eval (golden set + kết quả) · Validation (feedback log) · Reflection cá nhân · DEMO. Điều kiện tối thiểu: prototype phải có **ít nhất 1 lời gọi AI chạy thật**.

---

## 2. CP1 · Canvas 7 dòng (ĐÃ CHỐT)

```
1. CHIẾN TUYẾN
   VLearn AI Tutor — trợ lý ngữ cảnh gắn với slide học viên đang xem
   (chốt theo repo K3)

2. VAI CỤ THỂ (ai · khoảnh khắc)
   Học viên đang xem bài giảng slide online trên VLearn, vừa bị phân tâm
   ~2–3 phút (nhắn tin / chạy lab / mệt) nên lỡ mất 4–5 slide.

3. PAIN (ai · làm gì · vướng đâu · hậu quả)
   Quay lại màn hình, không biết vừa bỏ lỡ gì → phải tua ngược 4–5 slide,
   mất 3–5 phút; hoặc bỏ tua và mất mạch cả phần còn lại → tối phải đọc
   lại slide từ đầu.

4. 1–2 BẰNG CHỨNG ĐẦU TIÊN
   Khảo sát 34 học viên ngoài team (form Google, thả trong group lớp).
   Câu hỏi: "Buổi học online gần nhất, bạn có bị phân tâm và lỡ ≥3 slide
   không?"
   Kết quả: ___/34 trả lời CÓ (mục tiêu ≥50%).
   Cách kiểm: link form + bảng phản hồi thô ẩn danh trong repo.
   [⚠ CẦN ĐIỀN SỐ THẬT khi form về]

5. LÁT CẮT MỘT CÂU
   Học viên vừa quay lại sau khi lỡ 5 slide · bấm "Catch me up" ·
   AI đọc 5 slide đó, quyết định slide nào chứa ý chính (vs slide phụ) ·
   trả về 3–5 gạch đầu dòng theo thứ tự, mỗi ý kèm số slide nguồn.

6. AI TỰ LÀM ĐẾN ĐÂU + 1 DÒNG LÝ DO
   AI tự tóm tắt các slide nó ĐỌC ĐƯỢC nội dung; slide không đọc được
   (ảnh mờ/OCR fail) thì báo rõ "phần này chưa chắc" thay vì đoán — vì
   tóm tắt sai làm học viên bắt kịp bằng kiến thức sai.

7. ≥3 NGƯỜI SẼ THỬ + PHÂN CÔNG CÓ TÊN
   Người thử (ngoài team): Minh · Hà · Trang
   Team: An – bằng chứng · Bình – prompt · Châu – build ·
   Dũng – spec · Em – validation
   [⚠ ĐỔI SANG TÊN THẬT của nhóm]
```

**Tự kiểm dòng 5 (bắt buộc đạt):**
- Đọc xong có biết ngay demo bấm vào đâu, gõ gì, ra gì không? → CÓ: bấm "Catch me up" → 3–5 bullet kèm số slide.
- Bỏ AI đi việc đó còn tồn tại không? → CÓ: học viên vẫn phải tự tua ngược để bắt kịp.

---

## 3. CP2 · Show được thứ bấm được

### 3.1 Chuẩn "ĐỦ" và bẫy "CHƯA ĐỦ"

**ĐỦ:** mở trang → dán/tương tác → gõ/bấm → hiện ra kết quả (dữ liệu giả cũng được) → **bấm được đến cuối flow**. Chưa cần AI. Chưa cần đẹp.

**CHƯA ĐỦ:** giao diện đẹp nhưng bấm không ra gì · 5 màn hình rời rạc không nối được · chỉ có ảnh Figma tĩnh.

### 3.2 Prototype hiện tại

**File:** `catch-me-up-vlearn.html` (một file HTML self-contained, mở bằng trình duyệt là chạy).

**Layout 3 cột (khớp giao diện VLearn thật):**
- **Trái:** sidebar học liệu — Day01 (2 tài liệu) · Day02 STUDYING (đang mở `material_95eb786b4d9e.pdf`) · Day03.
- **Giữa:** canvas PDF viewer — toolbar Đọc/Bút/Highlight, zoom 100%, "Trang 3 · 1 note", nội dung slide, pager dưới cùng.
- **Phải:** **VLearn Tutor sidebar** — header có icon bot xanh, tiêu đề "VLearn Tutor / Trợ lý học theo ngữ cảnh", chip "Trang slide: N" auto cập nhật, dòng "Ngữ cảnh: Slide trang N", vùng chat với bubble bot/user, ô nhập "Nhập câu hỏi hoặc bôi đen tài liệu…" + nút gửi ➤. Có tay nắm `›` để thu/mở sidebar.

**Luồng demo end-to-end (bấm đi hết được):**
1. Mở trang → thấy VLearn với slide 3/76 "Bốn câu hỏi trọng tâm", Tutor bên phải chào hỏi.
2. Bấm **"⏸ Mô phỏng rời đi 3 phút"** (góc trên trái canvas) → giảng viên tự đi từ trang 3 → 7 (mỗi 300ms +1), badge coral hiện "Giảng viên đang ở trang 7".
3. Sau 4 bước → Tutor tự đẩy tin nhắn hệ thống "— Bạn vừa quay lại sau khi vắng 3 phút —" + alert đỏ "⚠ Bạn đã lỡ 4 trang" + nút coral **"⚡ Catch me up (4–7)"**.
4. Bấm nút → tin user "⚡ Catch me up (4–7)" hiện, kèm loading skeleton "Đang đọc 4 trang bạn đã lỡ…".
5. Sau 1.3s → bot trả bubble xanh nhạt: header "Tóm tắt nhanh 4 trang bạn đã lỡ · Trang 4–7", chip "✓ Đã tóm tắt 4/4 trang", **4 bullet có chip số trang** (Trang 4/5/6/7) + nội dung tóm tắt.
6. Bấm từng bullet → canvas nhảy tới đúng trang đó, bullet đã đọc mờ đi.
7. Bấm **"✓ Đã bắt kịp — tiếp tục học"** → về trạng thái theo dõi bình thường.
8. Có nút **"↺ Reset"** để chạy lại khi pitch.

### 3.3 Kiến trúc code (để tiếp tục dev)

**Toàn bộ trong 1 file HTML.** Data giả nằm ở 2 biến JS:

```javascript
// Nội dung 5 trang (3 = trang gốc, 4–7 = trang bị lỡ)
const PAGES = {
  3:{title:'Bốn câu hỏi <em>trọng tâm</em>', sub:'…', rows:[[no, text], …]},
  4:{…}, 5:{…}, 6:{…}, 7:{…}
};

// Bullet tóm tắt hardcode cho 4 trang bị lỡ
const SUMMARY = [
  {p:4, t:'Chỉ dùng AI khi bài toán mơ hồ…'},
  {p:5, t:'Ba cấp độ giải pháp: Rule/Workflow/Agent…'},
  {p:6, t:'Problem Statement phải nêu rõ ai đau…'},
  {p:7, t:'Quyết định Go/Not Yet/No-Go dựa trên bằng chứng…'}
];
```

**State:** `userPage`, `presenterPage`, `seen` (Set các trang đã click).

**Các hàm chính:**
- `renderPage()` — vẽ lại canvas + cập nhật chip trang slide + dòng ngữ cảnh trong Tutor.
- `simulateAway()` → setInterval đẩy `presenterPage` lên +1 mỗi 300ms, sau 4 bước gọi `onMissed()`.
- `onMissed()` — append alert + nút Catch me up vào Tutor.
- `catchUp(from,to)` — append tin user + loading skeleton, sau 1.3s gọi `showSummary()`.
- `showSummary(from,to)` — append bubble bot với danh sách bullet.
- `jumpTo(p)` — set `userPage = p`, render, đánh dấu bullet seen.
- `caughtUp(to)` — reset về trạng thái theo dõi.
- `sendMsg()` — chat tự do, hiện tại chỉ echo lại "chưa gọi AI thật".
- `toggleTutor()` — thu/mở sidebar phải.
- `resetDemo()` — reset toàn bộ state.

**CSS token quan trọng (giữ nhất quán khi mở rộng):**
```
--navy:#1b2a6b   --blue:#2f4fd0    --blue-soft:#eef2fd
--paper:#fdfcf7  --coral:#e0743f   --coral-soft:#fdeee4
--green:#1f8a52  --green-soft:#e7f4ec
```

---

## 4. CP3 · Nối AI thật (chưa làm — hướng đi)

**Yêu cầu CP3:** "AI chạy thật + đo lượt đầu". Nghĩa là ít nhất một lời gọi model thật, và có log/số đo được cho lần chạy.

**Điểm cần thay trong code:** chỉ **1 chỗ duy nhất** — biến `SUMMARY` hardcode. Thay bằng lời gọi API:

```javascript
async function catchUp(from, to){
  appendMsg(`<div class="msg user">⚡ Catch me up (${from}–${to})</div>`);
  showLoading();

  // Gom nội dung các trang bị lỡ
  const missedContent = [];
  for(let p = from; p <= to; p++){
    missedContent.push({page: p, content: extractPageText(p)});
  }

  // Gọi AI thật
  const bullets = await callAI(missedContent);
  // → mỗi bullet: {p: <số trang>, t: "<tóm tắt>"}

  removeLoading();
  showSummary(from, to, bullets);
}
```

**Prompt gợi ý (bám lát cắt Canvas dòng 5–6):**
```
Bạn là VLearn Tutor. Học viên vừa quay lại sau khi lỡ các trang [4–7]
của bài giảng. Đây là nội dung từng trang:

[Trang 4]: <content>
[Trang 5]: <content>
…

Nhiệm vụ:
1. Với mỗi trang, quyết định trang đó có chứa Ý CHÍNH hay chỉ là trang
   phụ (chuyển tiếp, minh họa, ví dụ).
2. Chỉ tóm tắt trang chứa ý chính, mỗi trang 1 câu ngắn (≤ 25 từ).
3. Nếu không đọc được nội dung trang, ghi rõ "phần này chưa chắc".
4. Trả về JSON: [{"p": <số trang>, "t": "<câu tóm tắt>"}, …]
   theo đúng thứ tự trang.
```

**Đo lượt đầu (cho R4 Eval — 15đ):**
- Chuẩn bị **golden set**: chọn 3–5 đoạn 4–5 trang từ 1 bài giảng thật, tự tay đánh dấu trang nào là ý chính (ground truth).
- Chạy AI, so kết quả AI chọn với ground truth → tính precision/recall trên "trang được chọn là ý chính".
- Log mỗi lượt gọi: input tokens, output tokens, latency, model version. Lưu vào `eval/runs.jsonl`.

---

## 5. CP4–CP6 · Roadmap còn lại

### CP4 · Chốt tiến độ + spec (hạn cứng 23:59 ngày 1)
Nộp `spec.md` gồm 7 phần theo cấu trúc rubric:
- §1 Problem & Evidence (R1) — pain point + kết quả khảo sát 34 người
- §2 Impact & 3 cơ hội so sánh (R1)
- §3 (dự phòng)
- §4 Lát cắt & thiết kế UX (R2) — dán Canvas dòng 5 + screenshot flow
- §5 Chỗ khó (R3) — OCR fail, slide dài, câu hỏi khó
- §6 Kịch bản rủi ro (R3) — AI tóm tắt sai → biện pháp "chưa chắc"
- §7 Kiểm thử — golden set + kế hoạch eval (R4)

### CP5 · Validation với user (R6 — 8đ)
- Cho **≥3 người thật ngoài team** thử prototype có AI thật.
- Ghi `validation/feedback-log.md`: mỗi người 3 câu hỏi tối thiểu — có bắt kịp được không? có tin tưởng bullet không? có nhấn nhảy trang không?
- Nếu có feedback tiêu cực → sửa hoặc note lại trong Reflection.

### CP6 · Demo (10:00 ngày 2)
- Pitch ~5 phút. Kịch bản gợi ý:
  1. **Hook (30s):** "Ai từng bị phân tâm rồi lỡ vài slide? [khảo sát bằng chứng: XX/34]"
  2. **Pain (45s):** kể lại khoảnh khắc quay lại màn hình, không biết bỏ lỡ gì.
  3. **Demo (2 phút):** chạy `catch-me-up-vlearn.html` với AI thật đã nối ở CP3.
  4. **Evidence (60s):** cho xem con số eval + feedback validation.
  5. **Ask (15s):** gọi vốn — vì sao đáng đầu tư 100 điểm.

---

## 6. Repo structure cần chuẩn bị trước CP6

```
repo/
├── README.md                    # thành viên + phân công + link demo
├── spec.md                      # AI Spec 7 phần (xem CP4)
├── demo/
│   ├── catch-me-up-vlearn.html  # prototype (đã có, cần nối AI)
│   └── slides.pdf               # deck pitch
├── eval/
│   ├── golden-set.json          # 3–5 đoạn có ground truth
│   └── runs.jsonl               # log các lượt chạy AI
├── validation/
│   └── feedback-log.md          # ≥3 người thử ngoài team
├── survey/
│   ├── form-link.txt            # link Google Form
│   └── responses-anon.csv       # phản hồi thô ẩn danh (34 người)
└── reflection/
    ├── an.md
    ├── binh.md                  # mỗi thành viên 1 file
    ├── chau.md
    ├── dung.md
    └── em.md
```

---

## 7. Ràng buộc dữ liệu (Slide 11 — Data is Trust)

- Chỉ dùng **data pack hackathon** hoặc **dữ liệu giả tự sinh** để build/eval.
- Không commit API key thật vào repo (dùng `.env` + `.gitignore`).
- Nếu dùng công cụ AI ngoài: chỉ đưa phần tối thiểu cần thiết, chú ý chính sách lưu/huấn luyện của công cụ.
- Không đưa data pack lên mạng xã hội, không chia sẻ ra ngoài khóa.
- Xóa data pack sau sự kiện theo yêu cầu BTC.

---

## 8. Nguyên tắc thiết kế cần giữ (đừng bẻ khi mở rộng)

Rút ra từ quá trình build:

1. **Một lát cắt duy nhất.** Nhóm đã brainstorm rất nhiều tính năng (tóm tắt tăng dần, live indicator, phát hiện lỗ hổng, flashcard cuối buổi…). Tất cả đều hay, nhưng **CP2–CP6 chỉ demo "Catch Me Up"**. Các tính năng khác gói làm roadmap trong pitch, không build.

2. **Quyết định AI phải rõ.** "Sinh tóm tắt" không phải quyết định. Cái quyết định thực sự là **"slide nào là ý chính vs slide phụ"** — vì nó cho phép Eval đo được (golden set).

3. **Ranh giới AI (Canvas dòng 6).** Slide không đọc được → nói "chưa chắc", không đoán. Đây là điểm ăn R3 (Chỗ khó & rủi ro, 11đ).

4. **Bằng chứng phải thật.** Con số 34 người khảo sát không được bịa. Nếu chưa có, chạy form ngay — không viết đại vào spec.

5. **Nội dung slide mẫu trong prototype:** đang dùng bài "RAG / Rule-Workflow-Agent / Problem Statement / Go-Not Yet-No-Go" (trang 3 lấy từ ảnh chụp VLearn thật của thí sinh). Đổi sang bài giảng thật của khóa nếu demo bài khác.

---

## 9. Việc cần làm ngay (thứ tự ưu tiên)

1. **[Ngay]** Gửi form khảo sát 34 người → điền số vào dòng 4 Canvas.
2. **[Trước CP3 — 16:00 ngày 1]** Chọn model AI (Claude/GPT/Gemini) + nối vào chỗ `SUMMARY` trong `catch-me-up-vlearn.html`. Chuẩn bị golden set 3 đoạn.
3. **[Trước CP4 — 23:59 ngày 1]** Viết `spec.md` 7 phần.
4. **[Sáng ngày 2]** Cho 3 người ngoài team thử → ghi feedback log.
5. **[10:00 ngày 2]** Demo.

---

## 10. Nếu cần Claude/AI khác tiếp tục từ đây

Prompt gợi ý để bắt đầu phiên mới:

> Tôi đang làm hackathon Venture Arena (AI Thực Chiến). Team đã xong CP1 và CP2. Đây là file context: [dán file này]. Tôi cần bạn giúp tôi [ghi rõ: CP3 nối AI thật / viết spec.md / chuẩn bị pitch / v.v.]. Prototype hiện tại là file `catch-me-up-vlearn.html` với luồng Catch Me Up chạy được nhưng data hardcode.

---

*Cập nhật lần cuối: sau khi hoàn thành CP2 với prototype v2 (VLearn Tutor sidebar bên phải).*
