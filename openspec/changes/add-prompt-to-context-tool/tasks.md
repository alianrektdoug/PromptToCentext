# 實作任務清單

## 1. 專案基礎建置
- [ ] 1.1 建立專案目錄結構（`src/`, `plugins/claude-code/`, `docs/`, `tests/`）
- [ ] 1.2 初始化 Git 儲存庫並建立 `.gitignore`
- [ ] 1.3 建立 `README.md` 專案說明文件
- [ ] 1.4 建立 `LICENSE` 檔案（MIT License）
- [ ] 1.5 設定 ESLint 和 Prettier 配置

**驗證**: 執行 `ls` 確認目錄結構正確，Git 已初始化

## 2. HTML UI 實作（核心功能）
- [ ] 2.1 建立 `src/index.html` 基本結構
  - 問題輸入區域（textarea）
  - API key 管理面板（可摺疊）
  - 轉換按鈕
  - 結果顯示區域
  - 複製按鈕
- [ ] 2.2 建立 `src/css/styles.css` 樣式表
  - 響應式設計
  - 深色模式樣式
  - 動畫效果
- [ ] 2.3 實作 `src/js/app.js` 主要應用邏輯
  - UI 初始化
  - 事件處理
  - 狀態管理
- [ ] 2.4 實作字數統計和輸入驗證
- [ ] 2.5 實作複製到剪貼簿功能
- [ ] 2.6 實作載入狀態 UI（spinner、禁用按鈕）

**驗證**: 在瀏覽器開啟 `index.html`，確認所有 UI 元素正常顯示和互動

## 3. API Key 管理功能
- [ ] 3.1 建立 `src/js/api-manager.js` API key 管理器
  - 儲存/讀取 keys（localStorage）
  - 加密/解密功能
  - Key 格式驗證
- [ ] 3.2 實作 API key 列表顯示（遮蔽敏感資訊）
- [ ] 3.3 實作新增 API key 功能（最多 5 組）
- [ ] 3.4 實作編輯和刪除 API key 功能
- [ ] 3.5 實作 API key 狀態管理（啟用/停用/錯誤）
- [ ] 3.6 實作 API key 輪替邏輯

**驗證**: 新增、編輯、刪除 keys，重新整理頁面確認 keys 已持久化

## 4. Gemini API 整合
- [ ] 4.1 建立 `src/js/gemini-client.js` Gemini API 客戶端
  - 初始化客戶端
  - API 呼叫方法
  - 錯誤處理
- [ ] 4.2 實作系統提示詞範本
  - 預設提示詞
  - 提示詞變數替換
- [ ] 4.3 實作 API 呼叫邏輯
  - 發送請求
  - 解析回應
  - 提取轉換結果
- [ ] 4.4 實作重試機制（3 次，指數退避）
- [ ] 4.5 實作錯誤處理
  - 網路錯誤
  - API key 無效（401/403）
  - Rate limit（429）
  - 格式錯誤
- [ ] 4.6 實作客戶端限流（每分鐘最多 10 次）

**驗證**: 使用真實 API key 測試轉換功能，驗證各種錯誤情況

## 5. 進階 UI 功能
- [ ] 5.1 實作深色模式切換
  - 切換按鈕
  - 主題樣式
  - 偏好儲存（localStorage）
  - 系統主題偵測
- [ ] 5.2 實作鍵盤快捷鍵
  - `Ctrl+Enter` / `Cmd+Enter`: 執行轉換
  - `Ctrl+K`: 開啟/關閉 API key 面板
  - 快捷鍵提示 UI
- [ ] 5.3 實作 Markdown 語法高亮（結果顯示）
- [ ] 5.4 實作錯誤訊息 UI（友善錯誤提示）
- [ ] 5.5 實作離線偵測和提示

**驗證**: 測試所有進階功能，確認使用者體驗流暢

## 6. Claude Code Plugin 實作
- [ ] 6.1 建立 Plugin 目錄結構
  - `plugins/claude-code/.claude-plugin/plugin.json` - Manifest
  - `plugins/claude-code/commands/` - Slash commands 目錄
  - `plugins/claude-code/lib/` - 核心邏輯
  - `plugins/claude-code/data/` - 資料儲存（加入 .gitignore）
  - `plugins/claude-code/tests/` - Plugin 測試
- [ ] 6.2 建立 plugin.json manifest
  - 定義 name, version, description
  - 定義 author 和 repository
  - 指定 commands 路徑
  - 指定 mcpServers 路徑（可選）
  - 定義 engines 相容性
- [ ] 6.3 實作 Slash Commands
  - `commands/convert.md` - /convert 命令
  - `commands/convert-batch.md` - /convert-batch 命令
  - `commands/prompt-keys.md` - /prompt-keys 命令
  - `commands/prompt-stats.md` - /prompt-stats 命令（可選）
- [ ] 6.4 實作核心邏輯模組
  - `lib/gemini-client.js` - 重用或實作 Gemini API 客戶端
  - `lib/api-manager.js` - 重用或實作 API key 管理
  - `lib/prompt-builder.js` - 系統提示詞建構
  - `lib/error-handler.js` - 錯誤處理
  - `lib/logger.js` - 日誌系統
  - `lib/config-loader.js` - 配置載入
  - `lib/crypto.js` - 加密/解密
- [ ] 6.5 實作 MCP Server（可選但推薦）
  - `lib/mcp-server.js` - MCP server 實作
  - `.mcp.json` - MCP server 配置
  - 實作 tools: convert_prompt, batch_convert, manage_keys, get_stats
- [ ] 6.6 實作資料儲存和安全
  - API keys 加密儲存至 `data/keys.json`
  - 配置檔 `config.json` 和 `config.local.json`
  - 統計資料 `data/stats.json`
  - 日誌目錄 `logs/`

**驗證**: 使用 `/plugin install ./plugins/claude-code` 本地安裝，測試所有 slash commands

## 7. Plugin 文件和配置
- [ ] 7.1 撰寫 `plugins/claude-code/README.md`
  - 簡介
  - 安裝步驟
  - 配置說明
  - 使用範例
  - API 參考
  - 疑難排解
- [ ] 7.2 建立 `config.json` 預設配置
- [ ] 7.3 建立 `package.json` 並定義依賴
- [ ] 7.4 撰寫版本相容性說明

**驗證**: 按照 README 文件從頭安裝 plugin，確認步驟正確

## 8. 測試實作
- [ ] 8.1 建立 `tests/unit/` 目錄和測試框架配置（Jest）
- [ ] 8.2 撰寫 API Manager 單元測試
  - Key 儲存/讀取
  - 加密/解密
  - 驗證邏輯
- [ ] 8.3 撰寫 Gemini Client 單元測試（使用 mock）
  - API 呼叫
  - 錯誤處理
  - 重試機制
- [ ] 8.4 撰寫 Plugin API 測試
  - 所有端點測試
  - 錯誤情況測試
- [ ] 8.5 建立 `tests/e2e/` E2E 測試（Playwright）
  - 完整轉換流程測試
  - UI 互動測試
- [ ] 8.6 執行測試並確保覆蓋率 ≥ 80%

**驗證**: 執行 `npm test`，確認所有測試通過，檢查覆蓋率報告

## 9. 整合測試
- [ ] 9.1 測試 HTML UI 與 Gemini API 整合
  - 成功轉換
  - 各種錯誤情況
  - API key 輪替
- [ ] 9.2 測試 Plugin 與主功能整合
  - Plugin 呼叫主功能 API
  - 資料一致性
- [ ] 9.3 測試跨瀏覽器相容性
  - Chrome
  - Firefox
  - Safari
  - Edge

**驗證**: 在多個瀏覽器執行完整測試流程

## 10. 文件完善
- [ ] 10.1 完善專案 `README.md`
  - 專案簡介
  - 功能特色
  - 快速開始
  - 配置說明
  - 開發指南
  - 授權資訊
- [ ] 10.2 建立 `docs/API.md` API 文件
- [ ] 10.3 建立 `docs/CONTRIBUTING.md` 貢獻指南
- [ ] 10.4 建立 `CHANGELOG.md` 變更日誌
- [ ] 10.5 新增程式碼註解和 JSDoc

**驗證**: 檢視所有文件，確認清晰完整

## 11. 部署準備
- [ ] 11.1 建立生產環境配置
- [ ] 11.2 最佳化資源（CSS/JS 壓縮）
- [ ] 11.3 建立部署腳本（可選）
- [ ] 11.4 測試部署版本
- [ ] 11.5 建立 GitHub Pages 部署（可選）

**驗證**: 部署到測試環境，執行完整測試

## 12. 最終驗證
- [ ] 12.1 執行完整功能測試檢查清單
- [ ] 12.2 執行所有自動化測試
- [ ] 12.3 執行效能測試
- [ ] 12.4 執行安全性檢查
- [ ] 12.5 Code review
- [ ] 12.6 更新所有文件

**驗證**: 所有測試通過，文件完整，功能符合需求

## 依賴關係
- **並行任務**:
  - 階段 2 和階段 3 可以並行開發（UI 和 API Manager）
  - 階段 6 (Plugin) 可以在階段 4 完成後獨立開發
  - 階段 8 (測試) 可以在對應功能完成後立即進行

- **順序依賴**:
  - 階段 4 (Gemini API) 依賴階段 3 (API Manager)
  - 階段 5 (進階 UI) 依賴階段 2 (基本 UI)
  - 階段 9 (整合測試) 依賴所有功能完成
  - 階段 11 (部署) 依賴階段 10 (文件)

## 預估時間
- 階段 1-3: 4-6 小時
- 階段 4-5: 6-8 小時
- 階段 6-7: 8-10 小時
- 階段 8-9: 6-8 小時
- 階段 10-12: 4-6 小時
- **總計**: 28-38 小時
