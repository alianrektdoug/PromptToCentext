# 設計文件

## 架構概覽

### 系統架構圖
```
┌─────────────────────────────────────────────────────────┐
│                     使用者介面層                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         HTML UI (src/index.html)                  │   │
│  │  - 問題輸入區                                      │   │
│  │  - API Key 管理面板                               │   │
│  │  - 結果顯示區                                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     應用邏輯層                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   App.js     │  │ API Manager  │  │Gemini Client │  │
│  │  (主控制器)   │→│ (Key管理)     │→│  (API呼叫)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     資料儲存層                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │        localStorage (瀏覽器本地儲存)                │   │
│  │  - API Keys (加密)                                 │   │
│  │  - 使用者偏好設定                                   │   │
│  │  - 使用統計                                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     外部服務層                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Gemini API (Google AI)                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Plugin 整合層 (獨立)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Claude Code Plugin (plugins/claude-code/)    │   │
│  │  ┌────────────┐         ┌────────────┐            │   │
│  │  │ MCP Server │    →    │  API 層    │            │   │
│  │  └────────────┘         └────────────┘            │   │
│  │         ↓                      ↓                   │   │
│  │  ┌────────────┐         ┌────────────┐            │   │
│  │  │ 核心邏輯   │    →    │  儲存層    │            │   │
│  │  └────────────┘         └────────────┘            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 核心組件設計

### 1. App.js - 主控制器
**職責**:
- 初始化應用程式
- 管理全域狀態
- 協調各組件互動
- 處理 UI 事件

**關鍵方法**:
```javascript
class App {
  constructor()           // 初始化
  init()                 // 啟動應用
  handleConvert()        // 處理轉換請求
  updateUI(state)        // 更新介面
  handleError(error)     // 錯誤處理
}
```

### 2. APIManager - API Key 管理器
**職責**:
- 儲存和讀取 API keys
- 加密和解密 keys
- Key 輪替策略
- Key 狀態管理

**關鍵方法**:
```javascript
class APIManager {
  addKey(key)              // 新增 key
  removeKey(keyId)         // 移除 key
  listKeys()               // 列出 keys（遮蔽）
  getNextKey()             // 取得下一個可用 key
  markKeyInvalid(keyId)    // 標記 key 無效
  encrypt(data)            // 加密
  decrypt(data)            // 解密
}
```

**Key 輪替策略**:
- Round-robin: 依序使用每個 key
- 當遇到 rate limit (429) 時立即切換
- 記錄每個 key 的使用次數和錯誤次數
- 自動禁用連續失敗的 key

**加密方案**:
- 使用 Web Crypto API (AES-GCM)
- 加密金鑰從使用者密碼派生（PBKDF2）
- 或使用裝置指紋作為金鑰（簡化版）

### 3. GeminiClient - Gemini API 客戶端
**職責**:
- 封裝 Gemini API 呼叫
- 處理請求和回應
- 錯誤處理和重試
- Rate limiting

**關鍵方法**:
```javascript
class GeminiClient {
  constructor(apiManager)        // 注入 API Manager
  convert(prompt, options)       // 轉換提示詞
  buildRequest(prompt)           // 建立請求
  parseResponse(response)        // 解析回應
  handleError(error)             // 錯誤處理
  retry(fn, attempts)            // 重試邏輯
}
```

**系統提示詞設計**:
```
你是一位專業的提示詞優化專家。你的任務是將使用者提供的簡單問題轉換為
更專業、更有上下文的提示詞，以便獲得更高品質的 AI 回應。

轉換規則：
1. 識別問題的核心意圖和領域
2. 補充必要的背景資訊
3. 明確化約束條件和期望
4. 使用專業術語
5. 結構化輸出格式

輸出格式（Markdown）：
## 背景
[補充的背景資訊]

## 任務
[清晰的任務描述]

## 約束條件
- [約束 1]
- [約束 2]

## 期望輸出
[明確的輸出格式要求]

現在，請將以下問題轉換為專業提示詞：
{user_prompt}
```

**重試策略**:
- 最多重試 3 次
- 指數退避: 1s, 2s, 4s
- 僅重試暫時性錯誤（網路、timeout）
- 不重試永久性錯誤（401, 403）

## Plugin 架構設計

### Claude Code Plugin 結構
```
Claude Code
     ↓
Plugin Loader
     ↓
Plugin Directory (plugins/claude-code/)
     ├── .claude-plugin/
     │   └── plugin.json          # Manifest
     ├── commands/                # Slash Commands
     │   ├── convert.md
     │   ├── convert-batch.md
     │   └── prompt-keys.md
     ├── .mcp.json               # MCP Server 配置（可選）
     └── lib/                    # 核心邏輯
         ├── gemini-client.js
         ├── api-manager.js
         ├── prompt-builder.js
         └── ...
```

### Plugin Manifest 範例 (plugin.json)
```json
{
  "name": "prompt-to-context",
  "version": "1.0.0",
  "description": "將簡單問題轉換為專業上下文提示詞",
  "author": {
    "name": "Your Name",
    "email": "[email protected]"
  },
  "homepage": "https://github.com/yourusername/PromptToCentext",
  "repository": "https://github.com/yourusername/PromptToCentext",
  "license": "MIT",
  "keywords": ["prompt", "context", "gemini", "ai"],
  "commands": ["./commands/"],
  "mcpServers": "./.mcp.json",
  "engines": {
    "claude-code": ">=1.0.0"
  }
}
```

### Slash Command 定義範例 (commands/convert.md)
```markdown
# Convert Prompt Command

將簡單問題轉換為專業上下文提示詞

## Usage
/convert <your question>

## Example
/convert 如何學習 JavaScript?

## Options
- --model: 指定 Gemini 模型 (預設: gemini-pro)
- --temperature: 溫度參數 (0.0-1.0, 預設: 0.7)

## Implementation
此命令會呼叫 lib/gemini-client.js 中的轉換邏輯
```

### MCP Server 整合（可選）
如果需要提供 MCP tools 供其他工具調用：

**.mcp.json 配置**:
```json
{
  "mcpServers": {
    "prompt-converter": {
      "command": "node",
      "args": ["./lib/mcp-server.js"],
      "env": {
        "API_KEYS_PATH": "./data/keys.json"
      }
    }
  }
}
```

**MCP Tools**:
- `convert_prompt` - 轉換單一提示詞
- `batch_convert` - 批次轉換
- `manage_keys` - 管理 API keys
- `get_stats` - 取得使用統計

## 資料流設計

### 轉換流程
```
使用者輸入問題
    ↓
App.handleConvert()
    ↓
驗證輸入（非空、長度）
    ↓
APIManager.getNextKey()
    ↓
GeminiClient.convert(prompt, key)
    ↓
建立 API 請求（包含系統提示詞）
    ↓
發送到 Gemini API
    ↓
解析回應
    ↓
更新 UI（顯示結果）
    ↓
記錄使用統計
```

### 錯誤處理流程
```
API 呼叫失敗
    ↓
識別錯誤類型
    ├── 網路錯誤 → 重試（最多 3 次）
    ├── 401/403 → 標記 key 無效，切換 key
    ├── 429 → 切換 key，等待後重試
    ├── 400 → 顯示輸入錯誤訊息
    └── 500 → 顯示伺服器錯誤，稍後重試
    ↓
更新 UI（顯示錯誤訊息）
    ↓
記錄錯誤日誌
```

## 安全性設計

### API Key 安全
1. **儲存加密**:
   - 使用 AES-256-GCM 加密
   - 金鑰派生自使用者密碼或裝置指紋
   - IV (Initialization Vector) 隨機生成

2. **傳輸安全**:
   - 僅透過 HTTPS 呼叫 API
   - 不在 URL 中包含 API key
   - 使用 Authorization header

3. **顯示遮蔽**:
   - UI 上僅顯示前 4 碼和後 6 碼
   - 範例: `AIza****xyz123`

4. **日誌安全**:
   - 不記錄完整的 API keys
   - 僅記錄 key ID 或哈希值

### XSS 防護
- 所有使用者輸入都經過 sanitize
- 使用 textContent 而非 innerHTML
- CSP (Content Security Policy) header

### CSRF 防護
- Plugin API 驗證請求來源
- 使用 CORS 限制跨域請求

## 效能最佳化

### 前端最佳化
1. **資源載入**:
   - CSS/JS 壓縮
   - 使用 defer/async 載入腳本
   - 圖片最佳化（如果有）

2. **快取策略**:
   - localStorage 快取使用者偏好
   - 快取系統提示詞範本

3. **UI 回應性**:
   - 使用 Web Worker 處理加密（避免阻塞主執行緒）
   - 虛擬捲動（如果 key 列表很長）

### API 最佳化
1. **Request 最佳化**:
   - 壓縮請求 payload
   - 使用連線池（fetch API）

2. **Rate Limiting**:
   - 客戶端限流（每分鐘最多 10 次）
   - Debounce 使用者輸入

3. **快取**:
   - 快取相同問題的轉換結果（5 分鐘）
   - 使用 LRU 快取策略

## 擴展性設計

### 支援更多 LLM
目前架構設計為易於擴展到其他 LLM：

```javascript
// 抽象基類
class LLMClient {
  convert(prompt, options) { throw new Error("Not implemented"); }
}

// Gemini 實作
class GeminiClient extends LLMClient {
  convert(prompt, options) { /* ... */ }
}

// 未來可擴展
class OpenAIClient extends LLMClient {
  convert(prompt, options) { /* ... */ }
}

// 工廠模式
class LLMFactory {
  static create(type) {
    switch(type) {
      case 'gemini': return new GeminiClient();
      case 'openai': return new OpenAIClient();
      // ...
    }
  }
}
```

### Plugin 生態系統
- 標準化的 Plugin API
- Plugin 註冊機制
- Plugin 市場（未來功能）

## 測試策略

### 單元測試
- **API Manager**: 測試所有 key 管理邏輯
- **Gemini Client**: 使用 mock 測試 API 呼叫
- **加密功能**: 測試加密/解密正確性

### 整合測試
- **UI + API Manager**: 測試 key 管理流程
- **完整轉換流程**: 端到端測試

### E2E 測試（Playwright）
- **使用者流程**: 從輸入到獲得結果
- **錯誤情境**: 各種錯誤處理
- **跨瀏覽器**: Chrome, Firefox, Safari

### 效能測試
- **回應時間**: 轉換操作應在 5 秒內完成
- **並行請求**: 測試 3 個並行請求
- **記憶體**: 長時間使用不應記憶體洩漏

## 監控和日誌

### 前端監控
- 錯誤追蹤（使用 try-catch）
- 效能監控（Performance API）
- 使用者行為追蹤（可選）

### Plugin 日誌
- 結構化日誌（JSON 格式）
- 日誌級別: DEBUG, INFO, WARN, ERROR
- 日誌輪替（每日或 10MB）
- 保留最近 7 天日誌

### 監控指標
- API 呼叫成功率
- 平均回應時間
- Key 使用分佈
- 錯誤類型統計

## 部署策略

### 靜態網頁部署
- **GitHub Pages**: 免費，簡單
- **Netlify/Vercel**: 更多功能，CDN

### Plugin 部署
- **npm 套件**: 發布到 npm registry
- **GitHub Releases**: 附帶安裝說明
- **自動化 CI/CD**: GitHub Actions

## 未來擴展

### Phase 2 功能
- 提示詞範本庫
- 歷史記錄管理
- 收藏和分類功能
- 多語言支援

### Phase 3 功能
- 團隊協作功能
- 提示詞分享社群
- AI 學習和個性化
- 進階分析和洞察

## 技術債務追蹤
- localStorage 容量限制（5-10MB）
  - 解決: 使用 IndexedDB
- 客戶端加密性能
  - 解決: 使用 Web Worker
- 單一 HTML 檔案維護性
  - 解決: 引入建置工具（webpack/vite）
