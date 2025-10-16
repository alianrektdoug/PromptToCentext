# Prompt-to-Context 轉換工具

> 將簡單問題轉換為專業上下文提示詞的智慧工具

## 📋 專案概述

Prompt-to-Context 是一個基於 Web 的工具，使用 Gemini API 將使用者的簡單問題自動轉換為更專業、更有上下文的提示詞，以獲得更高品質的 AI 回應。

### 主要特色

- 🎯 **智慧轉換**: 使用 Gemini AI 自動優化提示詞
- 🔑 **多 Key 管理**: 支援最多 5 組 API keys，自動輪替使用
- 🔒 **安全儲存**: API keys 加密儲存於本地
- 🎨 **友善介面**: 簡潔直覺的 Web UI，支援深色模式
- 🔌 **Plugin 支援**: 提供 Claude Code plugin 供其他工具整合
- ⚡ **純前端**: 無需後端伺服器，可直接在瀏覽器執行
- 📚 **範本庫**: 預設範本庫，快速套用常用提示詞格式
- 📝 **歷史記錄**: 完整的轉換歷史追蹤和管理
- 💾 **匯出功能**: 支援多種格式匯出結果

## 🏗️ 專案結構

```
PromptToCentext/
├── openspec/                   # OpenSpec 規格文件（獨立）
│   ├── project.md
│   └── changes/
│       └── add-prompt-to-context-tool/
│
└── src/                        # 主要專案程式碼
    ├── index.html             # Web UI 入口
    ├── css/                   # 樣式表
    ├── js/                    # JavaScript 程式碼
    │   ├── app.js            # 主控制器
    │   ├── lib/              # 核心函式庫
    │   │   ├── api-manager.js
    │   │   ├── gemini-client.js
    │   │   └── ...
    │   └── utils/            # 工具函數
    ├── plugins/              # Plugin 系統
    │   └── claude-code/      # Claude Code plugin
    ├── tests/                # 測試
    ├── docs/                 # 文件
    └── config/               # 配置檔
```

## 🚀 快速開始

### 1. 取得程式碼

```bash
git clone https://github.com/yourusername/PromptToCentext.git
cd PromptToCentext/src
```

### 2. 開啟 Web UI

直接在瀏覽器開啟 `src/index.html` 即可使用！

### 3. 配置 API Keys

1. 點擊「API Key 設定」按鈕
2. 輸入您的 Gemini API key（可從 [Google AI Studio](https://makersuite.google.com/app/apikey) 取得）
3. 最多可新增 5 組 keys

### 4. 開始轉換

1. 在輸入區輸入您的問題
2. 點擊「轉換」按鈕或按 `Ctrl+Enter`
3. 查看轉換後的專業提示詞
4. 點擊「複製」按鈕使用結果

## 🔌 Claude Code Plugin 安裝

### 安裝步驟

**重要**：必須先切換到專案根目錄，並使用相對路徑！

#### 步驟 1：切換到專案根目錄
```bash
cd C:\Users\YOUR_USERNAME\path\to\PromptToCentext
```

#### 步驟 2：新增 Marketplace
```bash
/plugin marketplace add ./src/plugins
```

#### 步驟 3：安裝 Plugin
```bash
/plugin install prompt-to-context
```

#### 步驟 4：使用 Plugin
安裝完成後，可使用以下 slash commands：
- `/convert <問題>` - 轉換單一問題
- `/convert-batch` - 批次轉換
- `/prompt-keys` - 管理 API keys

詳細說明請參閱 [Plugin 安裝指南](src/plugins/claude-code/INSTALL.md) 和 [Plugin 文件](src/plugins/claude-code/README.md)

## 📖 OpenSpec 文件

本專案使用 OpenSpec 進行規格驅動開發。規格文件位於 `openspec/` 目錄：

- [提案說明](openspec/changes/add-prompt-to-context-tool/proposal.md)
- [架構設計](openspec/changes/add-prompt-to-context-tool/design.md)
- [任務清單](openspec/changes/add-prompt-to-context-tool/tasks.md)
- [提案摘要](openspec/changes/add-prompt-to-context-tool/SUMMARY.md)

### 規格文件

- [HTML UI 規格](openspec/changes/add-prompt-to-context-tool/specs/html-ui/spec.md)
- [API 整合規格](openspec/changes/add-prompt-to-context-tool/specs/api-integration/spec.md)
- [Claude Code Plugin 規格](openspec/changes/add-prompt-to-context-tool/specs/claude-code-plugin/spec.md)
- [範本庫規格](openspec/changes/add-prompt-to-context-tool/specs/template-library/spec.md)
- [歷史記錄規格](openspec/changes/add-prompt-to-context-tool/specs/history-management/spec.md)
- [匯出功能規格](openspec/changes/add-prompt-to-context-tool/specs/export-functionality/spec.md)

## 🛠️ 開發指南

### 技術棧

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **API**: Google Gemini API
- **Plugin**: Node.js, MCP (Model Context Protocol)
- **測試**: Jest (單元測試), Playwright (E2E)

### 開發環境設定

```bash
cd src

# 安裝依賴（Plugin 開發）
cd plugins/claude-code
npm install

# 執行測試
npm test

# 程式碼檢查
npm run lint
```

## 🔐 安全性

- ✅ API keys 使用 AES-256-GCM 加密儲存
- ✅ 所有 API 呼叫使用 HTTPS
- ✅ 不在日誌中記錄敏感資訊
- ✅ UI 上遮蔽顯示 API keys
- ✅ XSS 和 CSRF 防護

## 📊 效能

- ⚡ 平均轉換時間: < 3 秒
- 📈 支援並行請求: 最多 3 個
- 💾 記憶體使用: < 50MB
- 🚀 首次載入: < 1 秒

## 🗺️ 開發路線圖

### Phase 1 (目前開發中)
- ✅ OpenSpec 規格完成
- 🚧 基本 Web UI
- 🚧 Gemini API 整合
- 🚧 API Key 管理
- 🚧 Claude Code Plugin
- 🚧 範本庫
- 🚧 歷史記錄
- 🚧 匯出功能

### Phase 2 (規劃中)
- [ ] 多語言支援
- [ ] 範本市場
- [ ] 雲端同步
- [ ] 團隊協作功能

### Phase 3 (未來)
- [ ] AI 學習和個性化
- [ ] 進階分析和洞察
- [ ] 提示詞分享社群

## 🤝 貢獻

歡迎貢獻！請閱讀 [CONTRIBUTING.md](docs/CONTRIBUTING.md) 了解如何參與開發。

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Google Gemini API](https://ai.google.dev/) - 提供強大的 AI 能力
- [OpenSpec](https://github.com/openspec-dev/openspec) - 規格驅動開發框架
- [Claude Code](https://claude.com/claude-code) - Plugin 整合平台

## 📧 聯絡方式

- Issue 追蹤: [GitHub Issues](https://github.com/yourusername/PromptToCentext/issues)

---

**注意**: 主要專案程式碼位於 `src/` 目錄，OpenSpec 規格文件位於 `openspec/` 目錄（獨立）。
