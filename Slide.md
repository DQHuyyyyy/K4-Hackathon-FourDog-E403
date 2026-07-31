# Slide pitch — Catch Me Up · Nhóm FourDog · Zone E403

> File này là **context để dựng slide**, không phải slide. Mỗi trang gồm: nội dung hiện lên màn hình · lời nói · số liệu thật lấy từ đâu · chỗ còn phải điền.
>
> **Khuôn khổ:** 6 trang · 5 phút trình bày · 5 phút Q&A · mỗi thành viên nói ≥1 phần · bắt buộc có **case lỗi live** và **% so với quality bar**.

## Phân bổ thời gian & người nói

| Trang | Khối điểm | Thời lượng | Người nói |
|---|---|---|---|
| 1 · Vấn đề & bằng chứng | R1 (15đ) | 60s | **[TÊN]** |
| 2 · Lát cắt sản phẩm | R2 (15đ) | 45s | **[TÊN]** |
| 3 · Chỗ khó & rủi ro | R3 (11đ) | 60s | **[TÊN]** |
| 4 · Kết quả kiểm thử | R4 (15đ) | 60s | **[TÊN]** |
| 5 · Demo | R5 (8đ) | 75s | **[TÊN]** |
| 6 · Validation & ask | R6 (8đ) | 30s | **[TÊN]** |

⚠️ Mỗi thành viên phải giải thích được phần mang tên mình khi bị hỏi — chia phần theo đúng người đã làm phần đó, đừng chia cho đều.

---

## TRANG 1 — Vấn đề & bằng chứng · R1

### Hiện trên slide

**Tiêu đề:** Học xong rồi, nhưng không biết mình đang thiếu gì

**Ba khối:**

1. **Khoảnh khắc**
   Học viên K4 · học online qua VLearn · tài liệu một buổi dài 76 trang
   Tối, chuẩn bị lab → muốn rà lại buổi sáng

2. **Vướng ở đâu**
   Không có cách nào biết mình nắm chắc phần nào
   Cách duy nhất: mở lại toàn bộ slide đọc lướt từ đầu
   → **19% số trang không chứa kiến thức nào** (bìa · giới thiệu giảng viên · agenda)

3. **Hậu quả**
   15–30 phút mỗi tối · hoặc bỏ luôn và vào lab với lỗ hổng không biết mình có

**Bằng chứng:**
- Khảo sát **___/25** học viên ngoài nhóm xác nhận phải mở lại slide từ đầu **[ĐIỀN SỐ THẬT]**
- Đếm được trên tài liệu Day 02: **3/16 trang là trang thủ tục** — con số này ra từ chính lượt chạy AI thật của nhóm

**Bảng impact (rút gọn, 3 dòng):**

| Ứng viên | Ai gặp | Tần suất | Kết luận |
|---|---|---|---|
| Bắt kịp slide đã lỡ | người bị phân tâm | 1–2 lần/buổi | ❌ Loại |
| **Ôn cuối buổi + hỏi khi tắc** | **mọi học viên** | **mỗi buổi** | ✅ **Chọn** |
| Chatbot hỏi đáp tự do | mọi học viên | bất kỳ | ⚠️ VLearn đã có |

### Lời nói (60s)

> "Ai ở đây từng học xong một buổi, tối mở lại slide, cuộn một lượt rồi tự nhủ 'chắc là mình hiểu rồi'? Vấn đề là bạn không kiểm tra được điều đó. Đọc lướt không phát hiện được lỗ hổng của chính mình.
>
> Và trong 76 trang bạn đang đọc lại, có một phần không nhỏ **không chứa kiến thức nào cả**. Trên tài liệu Day 02, chúng tôi đếm được 3 trên 16 trang là bìa, giới thiệu giảng viên, agenda — 19% công sức đọc lại đổ vào chỗ trống.
>
> Chúng tôi hỏi 25 học viên ngoài nhóm: **___ người** xác nhận tối nào cũng phải mở lại slide từ đầu.
>
> Chúng tôi cân ba hướng. Hướng bắt kịp slide đã lỡ — chúng tôi **đã build rồi loại bỏ**, tôi sẽ nói ở trang sau vì sao. Hướng chatbot hỏi đáp — VLearn đã có sẵn. Hướng còn lại chạm tới mọi học viên, mỗi buổi: giúp họ kiểm tra xem mình thật sự nhớ được gì."

### Ghi chú
- Nếu số khảo sát chưa về: **không được nói bừa một con số**. Nói: *"khảo sát đang chạy, hiện có N phản hồi, tỉ lệ xác nhận đến lúc này là …"* và chiếu đúng số đang có.
- Con số 3/16 là thật, lấy từ `eval/runs.jsonl` lượt `wrapup` — dám cho xem file.

---

## TRANG 2 — Lát cắt sản phẩm · R2

### Hiện trên slide

**Một câu duy nhất, chữ to giữa slide:**

> Học viên vừa đọc hết tài liệu của buổi · bấm **"Ôn lại bằng thẻ lật"** · **AI quyết định trang nào chứa ý chính, trang nào là trang phụ**, rồi biến ý chính thành thẻ hỏi–đáp · trả về **6–8 thẻ, mỗi thẻ mang số trang nguồn bấm được**

**Bóc tách bên dưới (4 ô nhỏ):**

| 1 user | 1 việc | 1 quyết định AI | 1 kết quả |
|---|---|---|---|
| học viên vừa học xong | kiểm tra mình nhớ được gì | **ý chính hay trang phụ?** | thẻ có nguồn + danh sách trang cần quay lại |

**Non-goals — 5 thứ KHÔNG làm:**
1. Không suy vị trí giảng viên đang trình chiếu
2. Không tự tóm tắt mỗi khi đổi trang
3. Không sinh trắc nghiệm 4 đáp án
4. Không OCR slide thật
5. Không có trí nhớ xuyên buổi

**Automation: AUGMENT** — AI đề xuất, người học quyết. Vì thẻ sai làm học viên **học thuộc sai**, mà chi phí kiểm chứng chỉ là một cú bấm về trang gốc.

### Lời nói (45s)

> "Quyết định AI của chúng tôi không phải 'tóm tắt tài liệu'. Tóm tắt thì không đo được — không ai chấm được một bản tóm tắt là đúng hay sai.
>
> Quyết định của chúng tôi là một câu hỏi có đáp án: **trang này chứa ý chính, hay chỉ là trang phụ?** Câu đó so được với đáp án do người đánh dấu, nên ra được precision và recall.
>
> Và đây là chỗ chúng tôi loại tính năng ban đầu: 'bắt kịp slide đã lỡ' đòi hệ thống phải biết giảng viên đang ở trang nào. VLearn là trình đọc PDF tự học — không có dữ liệu đó. Prototype cũ của chúng tôi phải giả lập bằng một biến đếm hardcode. Chúng tôi **gỡ nó đi thay vì demo một thứ chạy bằng số giả**.
>
> Chọn mức augment vì thẻ sai thì học viên thuộc sai mà không biết — nên mọi thẻ đều mang số trang nguồn, bấm một cái là kiểm chứng được ngay."

### Ghi chú
- Câu chuyện "đã build rồi tự gỡ" là điểm mạnh, không phải điểm yếu. Nói tự tin.
- Tên dự án vẫn là *Catch Me Up* — **chủ động giải thích một câu**: "tên giữ từ CP1, nay hiểu theo nghĩa giúp học viên bắt kịp phần mình chưa nắm".

---

## TRANG 3 — Chỗ khó & kịch bản rủi ro · R3

### Hiện trên slide

**4 lớp chỗ khó, mỗi lớp một dòng ngắn:**

| Lớp | Với sản phẩm này nghĩa là gì | Ví dụ |
|---|---|---|
| ① **Nguồn sự thật** | Slide là nguồn duy nhất; câu nào không truy được về một trang là bịa | Hỏi về khái niệm không có trong tài liệu |
| ② **Mơ hồ** | Trang mỏng, nội dung không đủ chắc | Sinh thẻ từ trang bìa |
| ③ **Ngoài phạm vi** | Đòi thứ tài liệu không có | "Tôi lỡ mấy trang rồi?" |
| ④ **Đặc thù domain** | Sai kiểu này thì học viên **học thuộc sai** rồi mang vào lab | Lẫn Workflow với Agent |

**15 kịch bản — trạng thái:**

🟢 **7 kịch bản đã chặn bằng code** · 🟡 **6 đã thêm luật, chờ kiểm với model thật** · 2 chưa test

**Năm rào chắn bằng code, không phải bằng lời hứa:**
1. Ý nào AI tự nhận "chưa chắc" → **cấm** thành thẻ ôn
2. Đáp án không truy được về trang nguồn (`groundedScore < 0.34`) → **vứt**
3. Trang model bịa ra (không có trong tài liệu) → **lọc** trước khi tới người dùng
4. Đoạn bôi đen do client gửi lên → **đối chiếu với trang thật**, không khớp thì bỏ *(chặn prompt injection)*
5. Lịch sử hội thoại từ client → chỉ nhận `user`/`assistant`, **chặn role giả chèn chỉ thị**

### Lời nói (60s)

> "Lớp nguy hiểm nhất với chúng tôi là lớp ④: sai kiểu nào thì học viên **học thuộc cái sai** rồi mang vào lab. Người học sẽ không phát hiện ra, vì họ tin thẻ.
>
> Nên chúng tôi không chặn bằng lời dặn trong prompt. Chúng tôi chặn bằng code, ba lớp:
>
> Một — ý nào chính AI tự nhận là 'chưa chắc' thì **bị cấm** biến thành thẻ. Thà thiếu thẻ còn hơn để bạn thuộc một câu chúng tôi không chắc.
>
> Hai — mỗi đáp án bị chấm điểm truy nguồn so với nội dung trang. Dưới ngưỡng là vứt, tự động, không cần ai duyệt.
>
> Ba — trang nào model bịa ra mà tài liệu không có thì server lọc bỏ, nên nút nhảy trang không bao giờ chết.
>
> Và chúng tôi có **2 kịch bản đang hỏng**, chưa sửa xong. Trang sau tôi sẽ cho các bạn xem một cái."

### Ghi chú
- Câu cuối là **cầu nối sang trang 4** — đừng bỏ, nó tạo thế chủ động cho phần trình bày case lỗi.
- Nếu bị hỏi "sao dám để 2 cái hỏng?": trả lời rằng biết mình hỏng ở đâu và đo được nó, tốt hơn là không biết.

---

## TRANG 4 — Kết quả kiểm thử · R4

### Hiện trên slide

**Golden set: 25 case nhóm tự xây**

| Lớp ① | Lớp ② | Lớp ③ | Lớp ④ | Thường | Hiếm |
|---|---|---|---|---|---|
| 4 | 3 | 2 | 3 | 9 | 4 |

**12/25 case lấy từ câu hỏi người dùng thật · 13 case nhóm soạn**

**Quality bar (chốt trước khi đo, không sửa sau):**
> ≥ **80%** case qua bộ (≥20/25) **VÀ** không case nào thuộc lớp ① bị fail

**Kết quả lượt chạy:**

| Pass | Fail | % | So với bar |
|---|---|---|---|
| **[ĐIỀN]** | **[ĐIỀN]** | **[ĐIỀN]%** | **[đạt / chưa đạt]** |

**5 chiều chất lượng đều có định nghĩa nhị phân** — người ngoài nhóm chấm ra cùng kết quả:
quyết định đúng · phủ hết trang · truy được nguồn · không bịa khi thiếu căn cứ · đúng cỡ

### 🔴 CASE LỖI LIVE — bắt buộc phải có

**Đây là phần được chấm, đừng lướt qua.**

Chiếu song song hai khối:

**Học viên hỏi:**
> "slide thứ 16 có nói về machine learning vậy có liên quan như thế nào về sản phẩm AI"

**Bot trả lời:**
> · Agent thường liên quan đến machine learning vì cần khả năng **tự học**…
> · Machine learning là công nghệ nền tảng giúp Agent hoạt động thông minh hơn…
> · …**(trang 4, phần chọn mức độ AI)**

**Trang 16 thật sự nói gì:**
> Ba cấp độ: Rule / Workflow / Agent — Rule thì code luôn không cần AI · Workflow chia bước có gate · Agent tự lập kế hoạch, chỉ dùng khi ba cách trên chạm trần

**Ba lỗi trong một câu trả lời:**
1. Nuốt tiền đề sai — *"machine learning"* **không có ở bất kỳ trang nào** trong cả 16 trang
2. Bịa nội dung — và sai cả chuyên môn: Agent ở đây là LLM gọi tool, không phải "tự học"
3. Dẫn sai trang — trang 4 là **Agenda**, chính AI của nhóm đã xếp nó vào nhóm trang phụ

### Lời nói (60s)

> "Golden set 25 case do nhóm tự xây, 12 case lấy từ câu hỏi người dùng thật. Bar chốt trước khi đo và không sửa sau: 80%, **và** không được fail case nào ở lớp bịa nguồn — vì bịa là lỗi chặn, không đánh đổi bằng phần trăm. Kết quả: **[đọc số thật]**.
>
> Giờ là case hỏng của chúng tôi. Một người dùng hỏi 'slide 16 nói về machine learning thì liên quan gì tới sản phẩm AI'. Cụm 'machine learning' **không tồn tại trong cả 16 trang tài liệu**. Bot vẫn trả lời trơn tru bốn gạch đầu dòng, còn dẫn thêm trang 4 — mà trang 4 là Agenda.
>
> Nguyên nhân không phải model kém. Prompt của chúng tôi có luật 'không biết thì nói chưa chắc'. Nhưng model **tưởng là nó biết** — nó thấy trang 16 nói về Agent, thấy Agent gần nghĩa với ML, rồi nối lại. Nó không rơi vào trạng thái 'không biết' nên luật kia không kích hoạt.
>
> Điều này dạy chúng tôi một thứ về thiết kế: quyết định trung tâm của sản phẩm **không được đặt ở chat**. Nó đặt ở chỗ chúng tôi chặn được bằng code."

### Ghi chú
- **Chưa chạy xong bộ thì nói thật**: *"bộ 25 case đã soạn xong, chúng tôi mới chạy được N case, kết quả đến lúc này là…"*. Rubric ghi rõ kết quả trung thực kể cả chưa đạt bar vẫn được tính đủ điểm; số bị chỉnh sửa thì **không** được tính.
- Ca lỗi này có timestamp thật trong `eval/runs.jsonl` (`2026-07-31T04:03:11`) — mở file ra được nếu bị hỏi.
- Nếu không gọi được AI ngay lúc trình bày, chiếu bản ghi nguyên văn kèm dòng log; đừng cố chạy live rồi hỏng giữa chừng.

---

## TRANG 5 — Demo & kiến trúc AI thật · R5

### Hiện trên slide

**Sơ đồ một dòng:**

```
Browser  ──/api/*──►  server.mjs  ──►  OpenAI gpt-4.1-mini
   │                      │
   │   API key KHÔNG      │  prompt dựng từ pages.json ở server
   │   bao giờ xuống      │  (không tin dữ liệu client gửi lên)
   │   browser            │
   └──────────────────────┴──►  eval/runs.jsonl  (log mọi lượt)
```

**Bằng chứng AI chạy thật:** `eval/runs.jsonl` — **87 dòng**, **40 lượt gọi model thật thành công**

Một dòng log thật chiếu lên:
```json
{"route":"wrapup","model":"gpt-4.1-mini-2025-04-14","latency_ms":6818,
 "picked":[5,6,...,16], "skipped":[1,2,4], "takeaways":6}

{"route":"deck","cards_returned":8,"cards_kept":6,
 "dropped_ungrounded":2,"grounded_ratio":0.75}
```

→ AI thật **bỏ đúng** trang 1 (bìa) · 2 (giới thiệu giảng viên) · 4 (agenda)
→ Bộ lọc **vứt đúng** 2/8 thẻ không truy được về nguồn

**Mức prototype khai báo: WORKING** — 4 route AI thật; phần mock duy nhất là nội dung 16 trang slide (đúc từ transcript data pack) và dữ liệu dự phòng có nhãn cam.

### Kịch bản demo (75 giây, tập trước cho thuộc)

| Giây | Thao tác | Nói gì |
|---|---|---|
| 0–15 | Mở app, cuộn vài trang, **dừng lại ở một trang 60 giây** (hoặc bấm nút mô phỏng) → badge `?` đỏ nhấp nháy | "Bot phát hiện tôi đang tắc. Nó **không chen vào**, chỉ bật tín hiệu và chờ tôi bấm." |
| 15–30 | Bấm `?` → 3 chip câu hỏi hiện ra → bấm một chip | "Nó gợi ý ba chỗ dễ tắc nhất **của đúng trang này**. Tôi không phải nghĩ ra câu hỏi lúc đang mệt." |
| 30–50 | Cuộn tới trang cuối → nút **Tổng kết** tự nhấp nháy mời → bấm `Ôn lại bằng thẻ lật` | "Đọc hết tài liệu, nó mời ôn. Vẫn im lặng chờ bấm." |
| 50–65 | Bộ thẻ mở ra → lật một thẻ → **chỉ vào chip số trang** → bấm `↺ Chưa chắc` | "Mặt sau luôn có **số trang nguồn**. Tôi không tin thì bấm về kiểm tra ngay." |
| 65–75 | Lật nốt → màn kết quả → **chỉ vào danh sách trang cần quay lại** → bấm một dòng, nhảy về trang gốc | "Và đây là thứ khác biệt: nó không chấm điểm tôi. Nó chỉ đúng **những trang tôi cần quay lại**." |

### Ghi chú
- **Chốt trước** dùng dữ liệu thật hay dữ liệu mẫu. Nếu dùng mẫu thì **nói ra**, chip cam đã ghi sẵn `MOCK` trên màn hình rồi — giấu là mất điểm nặng hơn nhiều so với thừa nhận.
- Không cuộn lung tung. Tập đúng 5 thao tác trên.
- Câu chốt trang này: *"Không có bước nào AI làm thay mà người dùng không kiểm được."*

---

## TRANG 6 — Validation & lời mời đầu tư · R6

### Hiện trên slide

**12 người ngoài nhóm đã thử** *(rubric yêu cầu ≥5)*

Ba câu hỏi cố định cho mọi người:
1. Bộ thẻ có giúp bạn phát hiện chỗ mình nhớ sai không?
2. Bạn có tin đáp án trên thẻ không? Có thẻ nào thấy sai không?
3. Bạn có bấm số trang để về slide gốc kiểm tra không?

**2–3 quote nguyên văn có tên + vai:**
> "**[QUOTE THẬT]**" — *[Tên, vai]*
> "**[QUOTE THẬT]**" — *[Tên, vai]*

**Thay đổi đã áp dụng từ feedback:**
> **[ĐIỀN — 1 thay đổi cụ thể, hoặc lý do giữ nguyên có căn cứ]**

**Đã đổi gì trong 2 ngày (changelog rút gọn):**
- Gỡ hẳn tính năng bắt kịp slide vì không có nguồn dữ liệu thật
- Cấm ý "chưa chắc" biến thành thẻ ôn
- Thêm bộ lọc truy nguồn tự động cho từng thẻ

**Ask:**
> Chúng tôi có một quyết định AI **đo được**, ba rào chắn **bằng code**, và một case hỏng chúng tôi **tự tìm ra và dám chiếu lên**.

### Lời nói (30s)

> "12 người ngoài nhóm đã thử. Câu hỏi chúng tôi quan tâm nhất không phải 'có thích không', mà là **'bạn có bấm về trang gốc để kiểm tra không'** — vì đó là thước đo họ có thật sự tin, hay chỉ gật cho xong.
>
> **[Đọc 1 quote thật]**
>
> Trong hai ngày chúng tôi đã tự gỡ một tính năng đã build xong, vì nó chạy bằng số giả.
>
> Cái chúng tôi mang tới đây không phải một sản phẩm hoàn hảo. Là một quyết định AI đo được, ba rào chắn bằng code, và một case hỏng chúng tôi tự tìm ra rồi dám chiếu lên màn hình."

---

## Chuẩn bị Q&A — giám khảo sẽ chạy 1 case lạ tại chỗ

| Câu hỏi khả năng cao | Trả lời |
|---|---|
| *"Tên Catch Me Up mà không có catch me up?"* | "Tên giữ từ CP1. Tính năng đó chúng tôi build xong rồi tự gỡ vì nó phải giả lập vị trí giảng viên bằng biến hardcode — VLearn không có dữ liệu đó. Chúng tôi chọn gỡ thay vì demo số giả." |
| *"Ngưỡng 0.34 lấy đâu ra?"* | "Đặt theo kinh nghiệm rồi kiểm bằng dữ liệu thật: lượt chạy cho điểm `[0.05, 0.44, 0.93, 0.57, 1, 0.77, 0.6, 0.33]` — thẻ bịa rơi vào 0.05, thẻ tốt từ 0.44 trở lên. Chúng tôi biết ngưỡng này **chưa được hiệu chỉnh kỹ**, có một thẻ bị loại ở 0.33 sát biên, và đã ghi vào spec là việc còn phải làm." |
| *"25 case tự soạn thì khách quan không?"* | "12/25 lấy từ câu hỏi người dùng thật. Và 5 chiều chất lượng đều có định nghĩa nhị phân để người ngoài nhóm chấm ra cùng kết quả — không phải chấm cảm tính." |
| *"Sao không dùng luôn chat có sẵn của VLearn?"* | "Vì chat là chỗ khó đặt rào chắn nhất — case hỏng ở trang 4 chính là ví dụ. Quyết định trung tâm của chúng tôi đặt ở chỗ chặn được bằng code." |
| **Giám khảo gõ một câu hỏi lạ vào chat** | **Chuẩn bị tinh thần nó trả lời sai.** Nếu sai: *"Đúng như case chúng tôi vừa chiếu — đây là lý do chúng tôi không đặt quyết định chính ở chat."* Đừng chối, đừng đổ lỗi. |
| **Giám khảo bắt chạy golden set case lạ** | Mở `eval/runs.jsonl` cho xem log thật, chạy một case trong bộ 25. |

---

## Nguyên tắc khi dựng slide

1. **Không con số nào được bịa.** Chỗ chưa có thì để trống và nói thật khi trình bày — rubric ghi rõ: kết quả trung thực kể cả chưa đạt bar vẫn được tính đủ điểm, số bị chỉnh sửa thì không được tính.
2. **Mỗi con số trên slide phải trỏ về được một file trong repo.** Bị hỏi là mở ra được ngay.
3. **Case lỗi là tài sản, không phải điểm yếu.** Nhóm nào cũng nói "AI có thể sai"; nhóm bạn có một ca cụ thể, có timestamp, có phân tích nguyên nhân, có biện pháp.
4. Chữ trên slide **ít thôi** — slide là chỗ chiếu bằng chứng, lời nói mới là phần thuyết phục.

## Việc còn phải điền trước khi in slide

| Chỗ | Trang |
|---|---|
| Số khảo sát `___/25` | 1 |
| Kết quả chạy golden set + % so với bar | 4 |
| 2–3 quote validation có tên + vai | 6 |
| 1 thay đổi đã áp dụng từ feedback | 6 |
| Tên người nói từng trang | bảng đầu file |
