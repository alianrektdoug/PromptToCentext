# Prompt-to-Context Claude Code Plugin

> 將簡單問題轉換為專業上下文提示詞的 Claude Code Plugin

## 📋 簡介

這是一個 Claude Code Plugin，可以幫助您將簡單的問題自動轉換為更專業、更有上下文的提示詞。使用 Google Gemini API 進行智慧轉換，支援批次處理和歷史記錄管理。

## ✨ 主要功能

- 🎯 **智慧轉換**：使用 Gemini AI 自動優化提示詞
- 🔑 **多 Key 管理**：支援最多 5 組 API Keys，自動輪替使用
- 📝 **批次轉換**：一次轉換多個問題
- 📊 **歷史記錄**：自動記錄所有轉換結果
- 📈 **統計分析**：提供詳細的使用統計

## 🚀 安裝

### 方法 1：從 GitHub 安裝（推薦）

```bash
# 在 Claude Code 中執行
/plugin install https://github.com/alianrektdoug/PromptToCentext/tree/master/plugins/claude-code
```

### 方法 2：從本地安裝

如果您已 clone 此 repository：

```bash
# 使用絕對路徑
/plugin install C:\Users\YOUR_USERNAME\Desktop\github\PromptToCentext\src\plugins\claude-code

# 或使用相對路徑（從工作目錄）
/plugin install ./PromptToCentext/src/plugins/claude-code
```

> ⚠️ **注意**：路徑必須使用完整的絕對路徑或正確的相對路徑

### 安裝依賴

在 Plugin 目錄中執行：

```bash
cd path/to/plugin
npm install
```

## 🔧 配置

### 1. 取得 Gemini API Key

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登入您的 Google 帳號
3. 點擊「Create API Key」
4. 複製產生的 API Key

### 2. 新增 API Key

```bash
/prompt-keys add YOUR_API_KEY
```

### 3. 驗證安裝

```bash
/prompt-keys list
```

應該會看到您剛新增的 API Key。

## 📖 使用方式

### 基本轉換

轉換單一問題：

```bash
/convert 如何學習 JavaScript？
```

**輸出範例：**
```
✅ 轉換成功！

【原始輸入】
如何學習 JavaScript？

【轉換結果】
我想系統性地學習 JavaScript 程式語言。請提供一個完整的學習路徑，包括：

1. 基礎語法和概念（變數、資料型別、函數等）
2. DOM 操作和事件處理
3. 非同步程式設計（Promise、async/await）
4. 現代 JavaScript 特性（ES6+）
5. 實作專案建議

請針對初學者的程度，提供循序漸進的學習建議，並推薦適合的學習資源。

【元資料】
⏱️  執行時間: 2341ms
📊 輸入長度: 14 字元
📊 輸出長度: 183 字元
🤖 使用模型: gemini-1.5-flash
```

### 批次轉換

轉換多個問題：

```bash
/convert-batch
```

然後按照互動提示輸入問題：

```
📝 批次轉換模式

請輸入要轉換的問題（每行一個）
輸入空行結束輸入並開始轉換

> 如何學習 Python？
✓ 已新增 (1)
> 什麼是機器學習？
✓ 已新增 (2)
> 如何優化網站效能？
✓ 已新增 (3)
>

🔄 開始轉換 3 個問題...
...
```

### 管理 API Keys

**列出所有 Keys：**
```bash
/prompt-keys list
```

**新增 Key：**
```bash
/prompt-keys add AIzaSyABC123...
```

**刪除 Key：**
```bash
/prompt-keys remove 1
```

**查看統計：**
```bash
/prompt-keys stats
```

## 📋 可用命令

| 命令 | 說明 |
|------|------|
| `/convert <問題>` | 轉換單一問題 |
| `/convert-batch` | 批次轉換多個問題 |
| `/prompt-keys list` | 列出所有 API Keys |
| `/prompt-keys add <KEY>` | 新增 API Key |
| `/prompt-keys remove <INDEX>` | 刪除 API Key |
| `/prompt-keys stats` | 查看統計資訊 |

## 📁 目錄結構

```
claude-code/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                # Slash commands
│   ├── convert.md
│   ├── convert-batch.md
│   └── prompt-keys.md
├── lib/                     # 核心邏輯
│   └── index.js
├── data/                    # 資料儲存（gitignore）
│   ├── api-keys.json
│   └── history.json
├── logs/                    # 日誌（gitignore）
│   └── plugin.log
├── tests/                   # 測試
├── config.json              # 配置檔
├── package.json
└── README.md                # 本檔案
```

## ⚙️ 配置選項

編輯 `config.json` 自訂配置：

```json
{
  "gemini": {
    "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
    "model": "gemini-1.5-flash",
    "timeout": 30000,
    "maxRetries": 3
  },
  "limits": {
    "maxApiKeys": 5,
    "maxHistoryItems": 100,
    "maxInputLength": 10000
  }
}
```

## 🔒 安全性

- ✅ API Keys 儲存在本地 `data/api-keys.json`
- ✅ 檔案權限應設為僅使用者可讀寫
- ✅ 不會將 Keys 上傳到任何伺服器
- ✅ 列出時只顯示遮蔽的 Key 內容
- ⚠️ 請將 `data/` 目錄加入 `.gitignore`

## 📊 統計資訊

使用 `/prompt-keys stats` 查看：

```
📊 統計資訊
============================================================

【API Keys】
總數: 3
✅ 正常: 2
❌ 錯誤: 1

【轉換歷史】
總轉換數: 45
✅ 成功: 43
❌ 失敗: 2
成功率: 95.6%

【效能】
平均執行時間: 2156ms

============================================================
```

## 🐛 疑難排解

### 問題：找不到 Plugin

**解決方案：**
1. 確認 Plugin 已正確安裝
2. 重啟 Claude Code
3. 使用 `/plugin list` 確認 Plugin 狀態

### 問題：API Key 無效

**解決方案：**
1. 確認 Key 格式正確（以 `AIza` 開頭）
2. 確認 Key 未過期
3. 在 Google AI Studio 重新產生

### 問題：轉換失敗

**可能原因：**
- 網路連線問題
- API 配額用完
- API Key 無效
- 輸入過長

**解決方案：**
1. 檢查網路連線
2. 查看 API 配額
3. 更換 API Key
4. 縮短輸入長度

### 問題：批次轉換中斷

**解決方案：**
1. 減少單次批次數量
2. 檢查網路穩定性
3. 查看錯誤日誌：`logs/plugin.log`

## 🧪 測試

執行測試：

```bash
npm test
```

## 📝 開發

### 設定開發環境

```bash
# 安裝依賴
npm install

# 執行測試
npm test

# 檢查程式碼
npm run lint
```

### 新增命令

1. 在 `commands/` 目錄建立 `.md` 檔案
2. 按照 Claude Code 命令格式撰寫
3. 在 `plugin.json` 中註冊命令

### 修改核心邏輯

主要邏輯在 `lib/index.js`，修改後建議執行測試確認功能正常。

## 📄 授權

MIT License

## 🙏 致謝

- [Google Gemini API](https://ai.google.dev/) - 提供強大的 AI 能力
- [Claude Code](https://claude.com/claude-code) - 優秀的 AI 編程工具

## 📧 支援

如有問題或建議，請：

1. 查看 [疑難排解](#-疑難排解) 章節
2. 提交 [Issue](https://github.com/alianrektdoug/PromptToCentext/issues)
3. 參考主專案 [README](../../../README.md)

## 🔗 相關連結

- [主專案 Repository](https://github.com/alianrektdoug/PromptToCentext)
- [Web UI Demo](https://alianrektdoug.github.io/PromptToCentext/)
- [Gemini API 文件](https://ai.google.dev/docs)
- [Claude Code 文件](https://docs.claude.com/claude-code)

---

**版本**: 1.0.0
**最後更新**: 2025-10-16
