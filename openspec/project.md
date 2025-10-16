# Prompt-to-Context 專案

## 專案概述
一個將使用者問題轉換為專業上下文提示詞的工具，支援 Gemini API 整合和多工具串接。

## 技術架構
- **前端**：純 HTML/CSS/JavaScript
- **API 整合**：Gemini API（支援多組 API keys）
- **Plugin 系統**：Claude Code plugin（獨立資料夾）

## 目錄結構
```
/
├── src/                    # 主功能（HTML UI）
├── plugins/               # Plugin 系統（獨立）
│   └── claude-code/      # Claude Code plugin
├── openspec/             # OpenSpec 規格管理
│   ├── specs/           # 功能規格
│   └── changes/         # 變更提案
└── docs/                # 文件
```

## 開發慣例
- **檔案編碼**：UTF-8
- **換行符**：LF
- **程式碼風格**：ESLint + Prettier
- **測試**：單元測試 + 整合測試

## 受保護區域
無

## API Keys 管理
- 支援多組 Gemini API keys（預設 5 組）
- 本地儲存（localStorage）
- 加密儲存選項（未來功能）
