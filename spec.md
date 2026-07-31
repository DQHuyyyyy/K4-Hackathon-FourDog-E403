# AI SPEC — Tổng kết cuối buổi + Bộ thẻ ôn · Nhóm FourDog · Zone E403
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [x] Tối ưu tính năng có sẵn (AI Tutor trên VLearn)  [ ] Tính năng mới

> **Trạng thái file:**
> - Viết đủ: §4 · §5 · §6 · §7 (quality bar và golden set đã chốt).
> - §1: câu hỏi khảo sát và quy mô đã chốt, **chỉ còn chờ con số kết quả** khi form về.
> - Còn trống: §2 · §3 · §8.
> - Mọi chỗ `[CẦN ĐIỀN]` để trống có chủ ý — **không điền số bịa**, vì guide §2.6 nêu rõ số liệu bị chỉnh sửa sẽ không được tính.

---

## §1. User & Job

- **Job executor + workflow:** [CẦN ĐIỀN — đính worksheet JTBD / ảnh sơ đồ]
- **Core JTBD** (không tên sản phẩm/AI trong câu):
  Khi vừa học xong một buổi dài, tôi muốn nắm lại được mạch chính của cả buổi trong vài phút, để tối còn kịp làm bài lab mà không phải đọc lại toàn bộ slide.
- **Problem statement** (KHÔNG chữ AI):
  Học viên xem xong tài liệu 76 trang trong buổi sáng. Đến tối, để chuẩn bị lab, họ phải tự cuộn lại từ đầu vì không nhớ ý nào nằm ở đâu; phần lớn số trang là bìa, agenda, trang chuyển tiếp nên công sức đọc lại bị đổ vào chỗ không có thông tin. Hậu quả: mất 20–30 phút mỗi tối, hoặc bỏ luôn việc ôn và vào lab với kiến thức lỗ chỗ.
- **Evidence — chuẩn A (khảo sát), quy mô n = 25:**

  | | |
  |---|---|
  | Đối tượng | 25 học viên **ngoài team**, form Google thả trong group lớp |
  | Câu hỏi chính | *"Buổi học online gần nhất, đến tối khi cần dùng lại kiến thức, bạn có phải tự mở lại slide đọc từ đầu không?"* |
  | Câu hỏi phụ (định lượng) | *"Lần đó bạn mất khoảng bao lâu?"* — thang `<5 phút / 5–15 / 15–30 / >30 phút` |
  | Kết quả | **___/25 trả lời CÓ** — **[CẦN ĐIỀN khi form về]** |
  | Ngưỡng phải đạt | **≥ 13/25 (>50%)** theo Evidence Gate #2 |
  | Cách kiểm | link form + bảng phản hồi thô ẩn danh trong `survey/` |

  > ⚠️ **Câu hỏi khảo sát đã phải viết lại.** Canvas CP1 (dòng 4) hỏi *"bạn có bị phân tâm và lỡ ≥3 slide không?"* — câu đó đo pain của **Catch Me Up**, tính năng đã gỡ ngày 31/07. Chạy nguyên câu cũ thì R1 sẽ thu bằng chứng cho một thứ không còn trong sản phẩm. Câu mới ở trên đo đúng problem statement hiện tại: phải đọc lại slide từ đầu vào buổi tối.
  >
  > Quy mô cũng đổi từ 34 → 25 người (team chốt 31/07). 25 vẫn thoả Evidence Gate #2 (≥20 người).

- **≥5 quote/ví dụ nguyên văn + nguồn:** **[CẦN ĐIỀN — trích từ chatlog trong data pack, dẫn bằng mã đoạn `[Txx-NNN]`, không chép nguyên file]**

## §2. Impact & quyết định chọn

- Bảng impact ≥3 ứng viên: **[CẦN ĐIỀN]**
- Ứng viên ĐÃ LOẠI + vì sao: **[CẦN ĐIỀN]** — trong đó có *Catch Me Up* (đã build rồi gỡ ngày 31/07, xem §9 Changelog).
- Ứng viên CHỌN + vì sao (bằng số): **[CẦN ĐIỀN]**

## §3. Giải pháp tương tự đã nghiên cứu

**[CẦN ĐIỀN — ≥2 sản phẩm]**

## §4. Thiết kế

- **Lát cắt MỘT CÂU:**
  Học viên vừa đọc hết tài liệu của buổi · bấm "Tổng kết buổi học" · AI đọc cả 16 trang, **quyết định trang nào chứa ý chính vs trang phụ**, gom các trang cùng một ý thành một takeaway · trả về 4–7 takeaway kèm số trang bấm được để nhảy tới, và biến chúng thành bộ thẻ ôn.

  > ⚠️ Canvas dòng 5 nộp ở CP1 mô tả *Catch Me Up* — đã lỗi thời từ 31/07. Câu trên là bản thay thế, **cần team xác nhận trước khi nộp**.

- **Non-goals (KHÔNG build):**
  1. Không suy ra vị trí giảng viên đang trình chiếu (không có nguồn dữ liệu — xem §5 kịch bản 9).
  2. Không tự tóm tắt mỗi khi đổi trang (tốn token liên tục, không ai yêu cầu).
  3. Không sinh câu hỏi trắc nghiệm 4 đáp án (bắt AI bịa 3 đáp án nhiễu, trái ranh giới ở §6①).
  4. Không đọc slide thật qua OCR / model đa phương thức — prototype dùng `pages.json` soạn từ transcript.
  5. Không có trí nhớ xuyên buổi.
- **Mức prototype:** [ ] Sketch [ ] Mock [x] Working
  Thật: toàn bộ 5 route gọi OpenAI thật, log thật vào `eval/runs.jsonl`. Mock: nội dung 16 trang đúc tay từ transcript Day 02 thay cho PDF thật; dữ liệu `mockWrapup`/`mockDeck` chỉ dùng khi API lỗi giữa demo và luôn hiện chip cam.
- **Automation:** [x] augment [ ] conditional [ ] automate
  Lý do theo cost-of-error: tổng kết sai làm học viên ôn sai kiến thức, nhưng người học vẫn đọc được trang gốc để tự kiểm — nên AI đề xuất, người quyết. Mọi takeaway đều bấm được để nhảy về trang nguồn; bộ thẻ luôn hiện số trang ở mặt sau. Không có bước nào AI làm thay mà người không kiểm được.

### §4b. Nguyên tắc đã áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| Làm rõ hệ thống làm được gì | Chip `✓ Ý chính: 7/16 trang` + `Bỏ trang phụ: 1, 2, 4` — nói thẳng đã đọc gì, bỏ gì, không giấu |
| Làm rõ mức độ chắc chắn | Ý không chắc bắt đầu bằng "Phần này chưa chắc:", viền coral, **và bị cấm thành thẻ ôn** |
| Errors + Graceful Failure | Lỗi API phân loại thành `quota`/`auth`/`nokey`/`model`/`ratelimit`/`network`, mỗi loại một câu hướng dẫn sửa + nút chạy tiếp bằng dữ liệu mẫu |
| Feedback + Control | Học viên tự chấm `✓ Nhớ rồi` / `↺ Chưa chắc` từng thẻ; hệ thống không tự phán đúng sai |
| Cho phép truy nguồn | Mọi takeaway và mọi thẻ đều mang số trang bấm được → kiểm chứng trong một cú bấm |

> [CẦN ĐIỀN] Ánh xạ 5 dòng trên sang mã guideline HAX/PAIR chính xác sau khi chạy HAX Playbook.

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản

**Bốn lớp cụ thể hoá cho lát cắt này:**

- ① **Nguồn sự thật** — AI bịa được ở đâu? Nội dung slide là nguồn duy nhất; mọi câu chữ không truy được về một trang cụ thể đều là bịa.
- ② **Mơ hồ / thiếu thông tin** — trang quá mỏng, nội dung không đọc được, hoặc câu hỏi không đủ dữ kiện.
- ③ **Ngoài phạm vi** — học viên đòi thứ tài liệu không có: kiến thức ngoài slide, tài liệu buổi khác, lời khuyên cá nhân.
- ④ **Đặc thù domain** — sai kiểu gì thì học viên **học sai kiến thức** rồi mang vào lab/bài thi.

### Bảng kịch bản

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Trạng thái |
|---|---|---|---|---|
| 1 | **Câu hỏi cài tiền đề sai**: học viên gõ "slide thứ 16 có nói về machine learning vậy có liên quan như thế nào về sản phẩm AI" — trang 16 không hề nhắc machine learning | ①④ | Bác tiền đề **trước tiên**: "Trang 16 không nhắc tới machine learning. Trang này nói về ba cấp độ Rule / Workflow / Agent." Rồi mới trả lời phần còn lại nếu có căn cứ | 🔴 **ĐANG HỎNG** — xem ca chi tiết bên dưới |
| 2 | Model dẫn số trang không có nội dung, ví dụ dẫn "(trang 4, phần chọn mức độ AI)" trong khi trang 4 là Agenda | ①④ | Chỉ được dẫn trang mà server đã nạp nội dung đầy đủ; cấm dẫn trang chỉ có tên trong mục lục | 🔴 **ĐANG HỎNG** — cùng ca số 1 |
| 3 | Model xếp một trang vào **cả** `picked` lẫn `skipped` | ② | Một trang chỉ được thuộc một nhóm; server loại `skipped` khỏi những trang đã có trong kết quả | 🟡 Đã bắt, **chưa sửa** |
| 4 | Model **bỏ quên** một trang, không xếp vào nhóm nào | ② | Mọi trang trong khoảng phải xuất hiện ở đúng một nhóm; log trường `unaccounted` để đo | 🟡 Đã bắt, **chưa sửa** |
| 5 | Model trả về số trang không tồn tại trong tài liệu | ① | Server lọc bỏ trước khi trả về UI, để nút nhảy trang không bao giờ chết | 🟢 Đã chặn bằng code |
| 6 | Thẻ ôn có đáp án **không nằm trong** trang nguồn (model diễn giải bằng kiến thức nền) | ①④ | Chấm `groundedScore(đáp án, trang nguồn)`, dưới `0.34` là vứt thẻ, và nói thẳng đã vứt mấy thẻ vì lý do gì | 🟢 Đã chặn bằng code |
| 7 | Ý mà chính AI đã tự nhận "chưa chắc" bị biến thành thẻ ôn | ②④ | Cấm tuyệt đối — học viên học thuộc đúng chữ trên thẻ, thà thiếu thẻ còn hơn thuộc sai | 🟢 Đã chặn bằng code |
| 8 | Ngưỡng grounded loại nhầm một thẻ đúng (đã gặp thẻ điểm `0.33`, sát ngưỡng `0.34`) | ② | Chấp nhận thà bỏ sót còn hơn cho lọt; hiệu chỉnh ngưỡng bằng golden set chứ không bằng cảm tính | 🟡 Chưa hiệu chỉnh |
| 9 | Học viên hỏi "tôi đã lỡ mấy trang khi mất tập trung?" | ③ | Nói thẳng hệ thống không biết vị trí giảng viên và không suy ra được từ dữ liệu hiện có; đề xuất dùng tổng kết cả buổi thay thế | 🟡 Chưa có câu trả lời chuẩn |
| 10 | Học viên hỏi kiến thức **ngoài** tài liệu ("RAG là gì?") | ③① | Nói rõ tài liệu buổi này không có, không trả lời bằng kiến thức nền, gợi ý trang gần nhất có liên quan | 🟢 Có luật trong prompt, **chưa test** |
| 11 | API hết quota / mất mạng giữa lúc pitch | — | Banner đỏ nêu đúng loại lỗi + cách sửa + nút chạy tiếp bằng dữ liệu mẫu có chip cam `MOCK` | 🟢 Đã chặn, đã gặp thật lúc 10:19 ngày 30/07 |
| 12 | Tài liệu dài hơn 30 trang | ③ | Từ chối trước khi gọi model (`MAX_WRAP_PAGES = 30`), báo rõ giới hạn thay vì cắt thầm | 🟢 Đã chặn bằng code |

**Tự kiểm — kịch bản nào làm nhóm sợ nhất khi demo?** Số 1. Nó là câu hỏi tự nhiên nhất mà một giám khảo sẽ gõ, và nó phá đúng lời hứa trung tâm của sản phẩm.

### Ca hỏng đã ghi nhận — "câu hỏi cài tiền đề sai"

**Thời điểm:** `2026-07-31T04:03:11.851Z` · route `chat` · trang 16 · `gpt-4.1-mini-2025-04-14` · 2152 ms · 1533 token (dòng có thật trong `eval/runs.jsonl`).

**Học viên hỏi:**
> "slide thứ 16 có nói về machine learning vậy có liên quan như thế nào về sản phẩm AI"

**Bot trả lời** (nguyên văn):
> Phần về ba cấp độ Rule / Workflow / Agent ở trang 16 giúp phân loại giải pháp AI, trong đó:
> · Agent thường liên quan đến machine learning vì cần khả năng tự học, ra quyết định linh hoạt.
> · Machine learning là công nghệ nền tảng giúp Agent hoạt động thông minh hơn so với Rule hay Workflow.
> · Việc hiểu cấp độ này giúp chọn đúng mức độ AI phù hợp với bài toán sản phẩm **(trang 4, phần chọn mức độ AI)**.
> · Để phát triển sản phẩm AI hiệu quả, cần cân nhắc kỹ mức độ áp dụng machine learning trong Agent (trang 16).

**Nội dung thật của trang 16** (để đối chiếu — trích từ `demo/pages.json`):
> **Ba cấp độ: Rule / Workflow / Agent** — *Luôn đi từ đơn giản lên, đừng lạm dụng kỹ thuật*
> · **Rule:** viết được thành quy tắc rõ ràng thì code luôn, không cần AI. Scoring ngân hàng 30–40 rule if vẫn chạy tốt.
> · **Workflow:** chia được thành các bước lớn, có LLM ở vài nút và gate kiểm tra giữa các bước: tuần tự → phân nhánh → song song.
> · **Agent:** AI tự lập kế hoạch, tự chia task, tự gọi tool. Chỉ dùng khi ba cách trên đã chạm trần.
> · Anthropic (*Building Effective Agents*): ba pattern workflow đầu tiên đã đủ cho hầu hết nhu cầu.
> · Agent thật thì tốn kém và khó kiểm soát — một prompt có thể spawn hơn trăm agent, đốt 4 triệu token.
> · Luồng đơn giản thì sai là debug được; luồng agent phức tạp thì mỗi lỗi là một logic mới.

Trang 16 nói về **chi phí và khả năng kiểm soát** khi chọn mức độ AI. Không có một chữ nào về machine learning, cũng không có khái niệm "tự học".

**Ba lỗi trong một câu trả lời:**

1. **Nuốt trọn tiền đề sai.** Cụm "machine learning" **không xuất hiện ở bất kỳ trang nào** trong cả 16 trang của `pages.json` (kiểm bằng tìm kiếm toàn văn). Bot nhận luôn khẳng định của học viên làm nền rồi xây tiếp lên đó.
2. **Bịa nội dung.** Hai gạch đầu dòng giữa không có trong tài liệu, và còn sai về chuyên môn: Agent trong bài giảng này là LLM tự lập kế hoạch và gọi tool, không phải chuyện "tự học".
3. **Dẫn sai trang.** "(trang 4, phần chọn mức độ AI)" — trang 4 là **Agenda**; chính route `wrapup` của nhóm đã xếp trang 4 vào `skipped` với lý do "agenda". Hai bộ phận trong cùng sản phẩm đang mâu thuẫn nhau.

**Nguyên nhân gốc — không phải model kém, mà thiếu một luật.**
Prompt chat đã có luật *"nếu slide không có thông tin để trả lời thì nói chưa chắc"*. Nhưng model **tưởng là nó có** thông tin: nó thấy trang 16 nói về Agent, thấy Agent gần nghĩa với ML trong kiến thức nền, rồi nối hai thứ lại. Nó không rơi vào trạng thái "không biết" nên luật kia không kích hoạt. Luật còn thiếu thuộc loại khác hẳn: **kiểm tra tiền đề của câu hỏi trước khi trả lời**.

**Vì sao nghiêm trọng.** Ranh giới AI của nhóm (Canvas dòng 6) hứa *"không đoán, vì tóm tắt sai làm học viên bắt kịp bằng kiến thức sai"*. Ca này làm đúng điều đã hứa sẽ không làm. Nặng hơn nữa với đúng nhóm người dùng đang nhắm: học viên hỏi vì **không chắc mình nhớ đúng không** — bot xác nhận cái nhớ sai thì sản phẩm đang chủ động cài kiến thức sai vào đầu người học.

**Phát hiện ra một bất đối xứng trong thiết kế:**

| Chỗ | Rào chắn | Chắc đến đâu |
|---|---|---|
| `/api/wrapup` | JSON Schema strict + server lọc trang không tồn tại | **cứng** — code chặn |
| `/api/deck` | lọc ý "chưa chắc" + `groundedScore` < 0.34 là vứt | **cứng** — code chặn |
| `/api/chat` | vài dòng dặn dò trong prompt | **mềm** — model muốn nghe thì nghe |

Quyết định AI được chấm điểm thì được bảo vệ bằng code; phần chat tự do — chỗ người dùng nghịch nhiều nhất — chỉ được bảo vệ bằng lời dặn.

**Biện pháp:**

| Việc | Chi phí | Trạng thái |
|---|---|---|
| Thêm luật kiểm tra tiền đề vào prompt chat: học viên khẳng định slide nói X → tìm X trong nội dung được cấp → không có thì phải nói thẳng trước khi nói bất cứ điều gì khác | ~10 phút | ⬜ Chưa làm |
| Cấm dẫn số trang không nằm trong phần nội dung server đã nạp | ~5 phút | ⬜ Chưa làm |
| Đưa 3 case tiền đề sai vào golden set (lớp ① ở §7) | | ⬜ Chưa làm |
| Kịch bản demo đi qua Tổng kết → Thẻ ôn (rào cứng), không mời gõ chat tự do; chủ động nói trước giới hạn của chat khi Q&A | 0 | ⬜ Chốt với team |

**Điều rút ra cho pitch:** đây chính là lý do quyết định chính của sản phẩm **không** đặt ở chat, mà đặt ở chỗ chặn được bằng code — thẻ nào không truy về được trang nguồn thì bị vứt tự động, không cần tin vào lời hứa của model.

---

## §6. Bốn đường đi của trải nghiệm

- **Happy path:** đọc hết tài liệu → nút "Tổng kết buổi học" tự nhấp nháy mời → bấm → 4–7 takeaway gom theo phần, mỗi ý kèm chip số trang bấm được → "Ôn lại bằng thẻ lật" → lật từng thẻ, tự chấm → điểm cuối kèm danh sách trang cần quay lại.
- **Low-confidence (②):** trang mỏng hoặc không đọc được → takeaway bắt đầu bằng "Phần này chưa chắc:", viền coral, **không** được biến thành thẻ ôn. Bộ thẻ nói rõ "Đã loại 1 ý chưa chắc · 2 thẻ không truy được nguồn".
- **Failure / không căn cứ (①):** nếu mọi ý đều không chắc → trả bộ thẻ rỗng kèm câu giải thích *"Thà thiếu thẻ còn hơn để bạn học thuộc một câu trả lời mình không chắc."* Lỗi API → banner đỏ đúng loại lỗi + nút chạy tiếp bằng dữ liệu mẫu có chip cam.
- **Correction (user sửa):** học viên bấm `↺ Chưa chắc` trên thẻ → cuối bộ, hệ thống liệt kê đúng những trang đó và đưa thẳng về trang gốc. Học viên luôn được quyền không tin AI và tự đọc lại.
- **Khi bị đòi ngoài phạm vi (③):** hỏi kiến thức ngoài tài liệu / tài liệu buổi khác / vị trí giảng viên → nói thẳng là không có trong tài liệu này, **không** trả lời bằng kiến thức nền, gợi ý trang gần nhất có liên quan. *(Ca số 1 ở §5 cho thấy đường đi này đang chưa chạy đúng khi câu hỏi cài tiền đề sai.)*
- **Case đặc thù domain (④):** khái niệm dễ lẫn nhau (Workflow vs Agent, Automation vs Augmentation). Thẻ ôn hỏi thẳng vào chỗ phân biệt, đáp án bắt buộc lấy nguyên từ trang nguồn — vì đây đúng là chỗ học viên nhớ nhầm rồi mang cái nhầm vào lab.

---

## §7. Kiểm thử

### Các chiều chất lượng (định nghĩa kiểm chứng được)

| Chiều | Định nghĩa pass/fail | Đo bằng |
|---|---|---|
| **Quyết định đúng** | Trang được AI xếp `picked`/`skipped` khớp ground truth | precision/recall trên `picked` trong `runs.jsonl` |
| **Phủ hết trang** | Mọi trang trong khoảng nằm ở đúng một nhóm, không trùng, không sót | đếm `unaccounted` và giao của `picked` ∩ `skipped` |
| **Truy được nguồn** | Mọi câu trong takeaway/thẻ trace được về trang đã dẫn | `groundedScore` ≥ 0.34 (server tự chấm) |
| **Không bịa khi thiếu căn cứ** | Câu hỏi có tiền đề sai hoặc ngoài tài liệu → bác bỏ tiền đề / từ chối, tuyệt đối không diễn giải | chấm tay theo golden set, pass/fail |
| **Đúng cỡ** | Takeaway ≤ 40 từ; thẻ: câu hỏi ≤ 12 từ, đáp án ≤ 30 từ | đếm tự động |

### Tên các lỗi đã đặt

`nuốt tiền đề sai` · `bịa ngoài slide` · `cite sai trang` · `trang trùng hai nhóm` · `trang bị bỏ quên` · `trang không tồn tại` · `chưa-chắc lọt vào thẻ ôn` · `loại nhầm thẻ đúng`

### Golden set — `eval/golden-set.json` · **25 case** *(guide yêu cầu ≥20)* **[CHƯA DỰNG]**

| Nhóm | Số case | Nội dung |
|---|---|---|
| Lớp ① nguồn sự thật | 4 | 3 case tiền đề sai (gồm ca thật ở §5), 1 case yêu cầu dẫn nguồn cho câu bịa |
| Lớp ② mơ hồ | 3 | trang mỏng, khoảng chỉ toàn trang phụ, khoảng đúng 1 trang |
| Lớp ③ ngoài phạm vi | 2 | hỏi vị trí giảng viên, hỏi tài liệu buổi khác |
| Lớp ④ đặc thù domain | 3 | Workflow vs Agent, Automation vs Augmentation, con số cụ thể trong slide |
| Case thường | 9 | các khoảng trang khác nhau, ground truth trang ý chính do người đánh dấu |
| Case hiếm | 4 | tài liệu >30 trang, mọi trang đều là trang phụ, API lỗi giữa chừng, model trả trang không tồn tại |
| **Tổng** | **25** | mỗi lớp chỗ khó đều ≥2 case ✓ |

**≥10 case phải lấy hoặc phát triển từ chatlog thật** trong data pack. Hai thành viên chấm độc lập 5 output trước; lệch nhau thì viết lại định nghĩa rồi mới chấm cả bộ.

### Quality bar — ĐÃ CHỐT

> **Đạt khi ≥ 80% case qua bộ (≥ 20/25), và không case nào thuộc lớp ① bị fail** — bịa ra thứ không có trong tài liệu là lỗi chặn, không đánh đổi bằng phần trăm.

Chốt ngày 31/07, team đồng thuận. Giữ nguyên từ thời điểm này, không chỉnh sau khi đã đo.

⚠️ Ghi nhận thẳng: template yêu cầu chốt bar tại **23:59 ngày 1**, nhóm chốt trễ hơn mốc đó. Ghi đúng sự thật thay vì lùi ngày, vì guide §2.6 nêu rõ *"số liệu bị chỉnh sửa sẽ không được tính"* — và bar được chốt **trước khi chạy đo**, nên tính khách quan của phép đo vẫn còn nguyên.

### Kết quả các lượt chạy

| Lượt | Ngày | Bộ | % qua | Ghi chú |
|---|---|---|---|---|
| — | — | — | — | **[CẦN ĐIỀN sau khi dựng golden set]** |

**Số liệu thô đã có sẵn** trong `eval/runs.jsonl` (137 dòng, trong đó có các lượt gọi model thật):

- `wrapup` thật `2026-07-30T15:08:41Z`: `picked [5..16]`, `skipped [1,2,4]`, 6 takeaway, 4194 token, 6.8s — **bỏ đúng bìa / giới thiệu giảng viên / agenda**, nhưng **trang 3 vắng mặt ở cả hai nhóm** (kịch bản 4).
- `deck` thật `2026-07-30T15:09:03Z`: trả 8 thẻ, giữ 6, `grounded_ratio 0.75`, `grounded_scores [0.05, 0.44, 0.93, 0.57, 1, 0.77, 0.6, 0.33]` — loại đúng thẻ bịa 0.05, và loại một thẻ 0.33 sát ngưỡng (kịch bản 8).
- `catchup` thật `2026-07-30T15:07:44Z`: `picked [13,14,15,16]` **và** `skipped [13,14,15,16]` — ca kịch bản 3.
- `chat` thật `2026-07-31T04:03:11Z`: ca tiền đề sai ở §5.

### Kiểm thử kỹ thuật đã chạy

40/40 kiểm tra giao diện trong Chrome thật (điều khiển qua CDP): khởi động · badge dừng lâu · tổng kết · nhảy trang · lật thẻ · tự chấm · màn kết quả · xuất `.md` · dark mode · VI/EN · reset. Không có exception nào. Phía API: 2 route quyết định chạy qua mock, kiểm biên khoảng trang, bộ thẻ rỗng, upstream chết, chặn path traversal.

---

## §8. Phân công & kế hoạch

- Phân công có tên: **[CẦN ĐIỀN — `CP2.md` §2 vẫn là placeholder An/Bình/Châu/Dũng/Em]**
- Willing users (≥3 tên) + kế hoạch validation CP5: **[CẦN ĐIỀN]**
  Ba câu hỏi đã chốt cho vòng validation:
  1. Bản tổng kết có giúp bạn nắm lại buổi học nhanh hơn đọc lại slide không?
  2. Bạn có tin những ý AI chọn là ý chính không? Có chỗ nào thấy sai không?
  3. Bạn có bấm vào ý để nhảy về trang gốc không? Vì sao có / vì sao không?
- Multi-prototype: **[CẦN ĐIỀN nếu làm]**

---

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 30/07 sáng | CP2 prototype 1 file → `demo/` có server, nối AI thật | CP3 cần lượt gọi model thật |
| 30/07 chiều | Thêm phát hiện dừng lâu (`/api/hints`) | Học viên tắc mà không biết hỏi gì |
| 30/07 tối | Thêm Tổng kết cuối buổi + Bộ thẻ ôn | Cùng quyết định AI, phạm vi rộng hơn → không phát sinh golden set thứ hai |
| 30/07 tối | Sửa lỗi badge `?` bấm không phản hồi; sửa `[hidden]` vô tác dụng | Bắt được khi test browser thật lần đầu |
| 31/07 | **Gỡ Catch Me Up khỏi prototype** | Hệ thống không có cách biết giảng viên đang ở trang nào — xem §5 kịch bản 9 |
| 31/07 | Ghi nhận ca hỏng "câu hỏi cài tiền đề sai" | Phát hiện trong lúc dùng thử; §5 |
| 31/07 | Chốt quality bar ≥80% (≥20/25) + điều kiện cứng lớp ① | Team đồng thuận; chốt trước khi chạy đo |
| 31/07 | Golden set chốt quy mô **25 case** | Guide yêu cầu ≥20; chia đủ ≥2 case cho mỗi lớp chỗ khó |
| 31/07 | Khảo sát: đổi quy mô **34 → 25 người** và **viết lại câu hỏi** | Câu hỏi cũ đo pain của Catch Me Up — tính năng đã gỡ. Câu mới đo đúng problem statement ở §1 |
