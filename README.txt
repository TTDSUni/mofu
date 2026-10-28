MOFU Google Sheet 日期格式相容修正版（Cloudflare Workers）

已支援試算表日期：YYYY-MM-DD、YYYY/M/D、YYYY.M.D、YYYY年M月D日、M/D/YYYY。
部署請保留根目錄 worker.js、wrangler.jsonc、public/index.html。
GitHub 根目錄一定要有 public/index.html。
部署命令：npx wrangler deploy
先測 /api/sheet 是否回傳 CSV，再進首頁測試。
如果仍失敗，請從 /api/sheet 複製前 3 行（可遮蔽女僕名字），用來確認實際輸出。
