MOFU Cloudflare Workers 直接部署版

這版是配合你現有的「npx wrangler deploy」Workers 部署流程（非 Pages Functions）。

請把本 ZIP 解壓後的 3 項內容放在 GitHub Repository 根目錄：
  - wrangler.jsonc
  - worker.js
  - public/index.html
不要把整包 ZIP 本身上傳為專案檔案，也不需要保留先前 functions/ 目錄。

Cloudflare Workers 設定：
  建置指令：可留空
  部署指令：npx wrangler deploy
  Root directory：Repository root

重要：本次不再使用 assets.directory = "."，只部署 public/ 內的英文檔名 index.html，避開 Manifest path must be URI encoded 錯誤。

部署成功後測試：
  https://你的域名/api/sheet  應回傳 CSV 原文
  https://你的域名/           應顯示 MOFU 月曆

若 /api/sheet 回傳 502，代表 Worker 已成功運作，但 Google Sheet 發布連結的上游抓取失敗；再檢查 Google Sheet 的發布狀態。
