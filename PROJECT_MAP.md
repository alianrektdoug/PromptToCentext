# 🗺️ Prompt-to-Context 專案地圖

> 快速導航和理解專案結構的指南

## 📍 專案結構說明

本專案分為兩個主要部分：

1. **`openspec/`** - OpenSpec 規格文件（獨立，不包含程式碼）
2. **`src/`** - 實際專案程式碼

## 📂 完整目錄結構

```
PromptToCentext/
│
├── 📄 README.md                         # 專案說明
├── 📄 PROJECT_MAP.md                    # 本檔案（專案地圖）
│
├── 📁 openspec/                         # 📋 OpenSpec 規格（獨立）
│   ├── 📄 project.md                   # 專案配置
│   └── 📁 changes/
│       └── 📁 add-prompt-to-context-tool/
│           ├── 📄 SUMMARY.md          # ⭐ 提案摘要
│           ├── 📄 proposal.md         # 提案說明
│           ├── 📄 design.md           # 架構設計
│           ├── 📄 tasks.md            # 任務清單
│           └── 📁 specs/              # 詳細規格
│               ├── 📁 html-ui/
│               ├── 📁 api-integration/
│               ├── 📁 claude-code-plugin/
│               ├── 📁 template-library/
│               ├── 📁 history-management/
│               └── 📁 export-functionality/
│
└── 📁 src/                              # 🎯 主要專案程式碼
    ├── 📄 index.html                   # Web UI 入口
    ├── 📄 .gitignore                   # Git 忽略檔案
    │
    ├── 📁 css/                         # 樣式表
    │   ├── 📄 styles.css
    │   └── 📄 dark-theme.css
    │
    ├── 📁 js/                          # JavaScript 程式碼
    │   ├── 📄 app.js                  # 主控制器
    │   ├── 📁 lib/                    # 核心函式庫
    │   │   ├── 📄 api-manager.js     # API Key 管理
    │   │   ├── 📄 gemini-client.js   # Gemini API 客戶端
    │   │   ├── 📄 template-manager.js # 範本管理
    │   │   ├── 📄 history-manager.js  # 歷史記錄管理
    │   │   └── 📄 export-manager.js   # 匯出功能
    │   └── 📁 utils/                  # 工具函數
    │       ├── 📄 crypto.js
    │       ├── 📄 storage.js
    │       └── 📄 validators.js
    │
    ├── 📁 plugins/                     # 🔌 Plugin 系統
    │   └── 📁 claude-code/            # Claude Code plugin
    │       ├── 📁 .claude-plugin/
    │       │   └── 📄 plugin.json    # Plugin manifest
    │       ├── 📁 commands/          # Slash commands
    │       │   ├── 📄 convert.md
    │       │   ├── 📄 convert-batch.md
    │       │   └── 📄 prompt-keys.md
    │       ├── 📁 lib/               # Plugin 核心邏輯
    │       ├── 📁 data/              # 資料儲存（gitignore）
    │       ├── 📁 logs/              # 日誌（gitignore）
    │       ├── 📁 tests/             # Plugin 測試
    │       ├── 📄 .mcp.json          # MCP 配置（可選）
    │       ├── 📄 package.json
    │       ├── 📄 config.json
    │       └── 📄 README.md
    │
    ├── 📁 tests/                       # 🧪 測試
    │   ├── 📁 unit/                   # 單元測試
    │   ├── 📁 integration/            # 整合測試
    │   └── 📁 e2e/                    # E2E 測試
    │
    ├── 📁 docs/                        # 📚 文件
    │   ├── 📄 API.md
    │   └── 📄 CONTRIBUTING.md
    │
    ├── 📁 config/                      # ⚙️ 配置檔
    └── 📁 screenshots/                 # 📸 截圖
```

## 🎯 快速導航

### 我想開始開發
→ 進入 `src/` 目錄
→ 開啟 `src/index.html` 查看 UI
→ 查看 `src/js/` 目錄的程式碼

### 我想查看規格
→ 進入 `openspec/changes/add-prompt-to-context-tool/`
→ 從 `SUMMARY.md` 開始閱讀
→ 詳細規格在 `specs/` 目錄

### 我想安裝 Plugin
→ 進入 `src/plugins/claude-code/`
→ 閱讀 `README.md`
→ 使用 `/plugin install` 安裝

### 我想執行測試
→ 進入 `src/tests/`
→ 執行 `npm test`

## 📊 開發狀態

- **OpenSpec 規格**: ✅ 完成（100%）
- **專案程式碼**: 🚧 開發中（10%）
  - ✅ 目錄結構建立
  - 🚧 HTML UI 實作中
  - ⏳ JavaScript 模組待實作
  - ⏳ Plugin 待實作
  - ⏳ 測試待建立

## 🔗 重要連結

### OpenSpec 文件
- [提案摘要](openspec/changes/add-prompt-to-context-tool/SUMMARY.md) ⭐
- [完整提案](openspec/changes/add-prompt-to-context-tool/proposal.md)
- [架構設計](openspec/changes/add-prompt-to-context-tool/design.md)
- [任務清單](openspec/changes/add-prompt-to-context-tool/tasks.md)

### 規格文件（6 個）
1. [HTML UI](openspec/changes/add-prompt-to-context-tool/specs/html-ui/spec.md)
2. [API 整合](openspec/changes/add-prompt-to-context-tool/specs/api-integration/spec.md)
3. [Plugin](openspec/changes/add-prompt-to-context-tool/specs/claude-code-plugin/spec.md)
4. [範本庫](openspec/changes/add-prompt-to-context-tool/specs/template-library/spec.md)
5. [歷史記錄](openspec/changes/add-prompt-to-context-tool/specs/history-management/spec.md)
6. [匯出功能](openspec/changes/add-prompt-to-context-tool/specs/export-functionality/spec.md)

## 💡 重要提醒

### 專案分離原則
- ✅ **`openspec/`**: 純規格文件，不包含程式碼
- ✅ **`src/`**: 實際專案程式碼和資源

### Git 管理
- `src/` 有獨立的 `.git` 和 `.gitignore`
- `openspec/` 保持獨立，可選擇性版控

### 檔案位置
- 所有程式碼 → `src/`
- 所有規格 → `openspec/`
- 不要混合！

---

**最後更新**: 2025-10-16

**目前階段**: 專案初始化，開始實作 Phase 1 功能
