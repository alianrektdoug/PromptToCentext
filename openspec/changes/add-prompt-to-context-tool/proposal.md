# 新增 Prompt-to-Context 轉換工具

## 為什麼
開發者和 AI 助手使用者經常需要將簡單的問題轉換為更專業、更有上下文的提示詞，以獲得更好的 AI 回應品質。手動編寫專業提示詞既耗時又需要經驗。本工具透過 Gemini API 自動化此過程，並提供 Claude Code plugin 讓其他工具可以輕鬆整合此功能。

## 什麼變更
- 新增一個純 HTML/CSS/JavaScript 的 Web UI，允許使用者輸入問題並獲得專業的上下文提示詞
- 實作 Gemini API 整合，支援多組 API keys（預設 5 組）管理和輪替使用
- 建立獨立的 Claude Code plugin 系統，放置在 `plugins/claude-code/` 目錄
- 提供標準 API 介面，讓其他工具（如 Claude Code）可以調用此功能
- 實作 API key 的本地儲存和管理功能（使用 localStorage）
- 建立清晰的目錄結構，將主功能和 plugin 完全分離

## 影響
- 受影響的規格：
  - `specs/html-ui`（新增）- Web UI 介面規格
  - `specs/api-integration`（新增）- Gemini API 整合規格
  - `specs/claude-code-plugin`（新增）- Claude Code plugin 規格
- 受影響的程式碼：
  - `src/index.html`（新增）- 主要 UI
  - `src/js/app.js`（新增）- 核心邏輯
  - `src/js/api-manager.js`（新增）- API key 管理
  - `src/js/gemini-client.js`（新增）- Gemini API 客戶端
  - `plugins/claude-code/`（新增）- Plugin 目錄
  - `plugins/claude-code/README.md`（新增）- Plugin 安裝和使用文件

## 技術決策
### 為什麼使用純 HTML/JavaScript
- 無需建置工具，可直接在瀏覽器中執行
- 易於部署和分享
- 使用者可以本地運行，無需伺服器

### 為什麼獨立 Plugin 目錄
- 主功能和 plugin 邏輯分離，便於維護
- 不同工具的 plugin 可以獨立開發和測試
- 符合使用者要求的目錄結構規範

### Claude Code Plugin 架構選擇
- **使用標準 Plugin 結構**：遵循 Claude Code 官方規範
- **Slash Commands**：提供 `/convert`, `/convert-batch`, `/prompt-keys` 等命令
- **plugin.json Manifest**：標準化的 plugin 描述和配置
- **可選 MCP Server**：提供額外的 tools 供其他應用整合
- **Commands 定義為 Markdown**：簡單易讀的命令文件格式

### API Key 管理
- 使用 localStorage 進行本地儲存（Web UI）
- Plugin 使用加密檔案儲存（`data/keys.json`）
- 支援多組 keys 以避免 rate limit
- 輪替使用以平衡負載
