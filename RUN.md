## Cần 2 cửa sổ terminal, mở song song:

# Terminal 1 — server (chạy từ gốc repo):


cd "E:\VSCSTD\Lab VIN\K4-Hackathon-FourDog-E403"
# node --env-file=.env demo/server.mjs
Đợi thấy dòng OPENAI_API_KEY: đã nạp (sk-proj…) rồi mới sang bước sau.

# Terminal 2 — tunnel:


cloudflared tunnel --url http://localhost:5173
Sau ~10 giây nó in ra một khung, URL nằm trong đó:


+----------------------------------------------------+
|  https://<mấy-chữ-ngẫu-nhiên>.trycloudflare.com     |
+----------------------------------------------------+
Copy đúng dòng https://…trycloudflare.com đó đem gửi.

Dừng lại
# Ctrl+C ở terminal tunnel → link chết ngay. Ctrl+C ở terminal server → app tắt.

Hai tiến trình tôi vừa khởi động đang chạy nền, không thuộc terminal nào của bạn. Muốn tắt:

# Nếu muốn dọn sạch cả tunnel:


# Get-Process cloudflared | Stop-Process -Force

Lúc đó chạy cloudflared tunnel --url http://localhost:5173 lần sau sẽ ra một URL khác.