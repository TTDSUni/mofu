MOFU 沫芙｜活動週與活動日期高亮版

部署（Cloudflare Workers）：
- GitHub 根目錄保留 worker.js、wrangler.jsonc，public/index.html
- 部署命令：npx wrangler deploy
- 保留既有 wrangler.jsonc 中的 INDEX_GID（月份索引 gid）！
- 新增 EVENT_GID（活動索引分頁 gid），填入有效數字。
  注意：若直接整份覆蓋 wrangler.jsonc，請先把舊的 INDEX_GID 帶入，否則多月份班表會失效。
- 必須在 Google 試算表「發布到網路」，選擇活動分頁、CSV。
- 測試 /api/events 有 CSV、/api/sheet?month=2026-11 有班表、/api/months 有月份。

活動 Google Sheet 欄位：活動名稱,開始日期,結束日期,顏色,備註
* 單日活動：開始日期＝結束日期，或結束日期留空。
* 活動週／跨月活動：填寫起訖日期（含當日）；可跨月份自動高亮。
* 可用顏色：粉色、奶茶、紫色、黃色、綠色、藍色（其他值將回退成粉色）。
* 一日期可以有多個活動；月曆會顯示最多 2 個，點開日期可看全部。
* 活動只影響顏色及備註，不改變營業班次；週三依然固定公休。
* EVENT_GID 未設定時，活動功能不顯示，但班表繼續正常同步。
* 網頁每五分鐘及重新聚焦時更新班表與活動資料；Google 發布可能額外快取。
* 範本內是示範事件，不代表沫芙實際活動；上線前請刪除或替換示例。
