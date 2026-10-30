MOFU 月份分頁自動讀取版

網站仍使用原本的同一份 Google 試算表、Cloudflare Worker 與網址。

【一次性設定】
1. Google Sheet 新增分頁「月份索引」，A1 填「月份」、B1 填「gid」。
2. 從第二列起填月份與對應班表分頁的 gid，例如：
   2026-11,你的11月分頁數字gid
   2026-12,你的12月分頁數字gid
   重要：請將上述文字替換成實際純數字 gid，原始 1214441936 對應哪個月份須由你確認。
3. 確認整份 Google 試算表或索引分頁已「發布到網路」。
4. 從「月份索引」的工作表網址取得 gid（分頁網址 #gid= 後面的數字）。
5. 在 wrangler.jsonc 的 vars.INDEX_GID 填入此 gid（只能填數字），提交 GitHub 並部署。
6. 之後每次新增月份，只要新增該月份的班表分頁及索引列，不必改程式／重新部署。

【每個月分頁的表頭】
日期,女僕,班別,假日班制
2026-11-01,示例女僕,中+晚,是

【測試】
/api/months 查看是否列出月份，mode=index 表示索引已啟用。
/api/sheet?month=2026-10 查看該月份 CSV。
/api/sheet?month=2026-11 查看下一月 CSV；尚未設定時會回傳 HTTP 404。

【重要】
- INDEX_GID 空白時，保留舊版資料來源做過渡，所有月份都讀原分頁；要真正多分頁自動切換必須填入 INDEX_GID。
- 每個月份必須在同一份已發布的 Google Sheet 文件內，使用同一個發布 ID。
- 月曆手機版不刪除女僕姓名及日期標籤，只改為水平滑動閱讀完整資訊。
- Google Sheet 發布的 CSV 是公開內容；不要放私人資料。
- 已有分頁的 gid 不能用「分頁名稱」替代。
- 第一次部署需一起更新 worker.js、wrangler.jsonc、public/index.html，並確認 public/ 目錄存在。
