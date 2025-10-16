# Claude Code Plugin 規格

## 新增的需求

### 需求：Plugin 目錄結構
Claude Code plugin 應遵循標準的 plugin 目錄結構，包含 manifest、commands、agents 和 MCP 配置。

#### 情境：建立 Plugin 目錄
- **當** 初始化 plugin 時
- **則** 應在 `plugins/claude-code/` 建立以下結構：
  ```
  claude-code/
  ├── .claude-plugin/
  │   └── plugin.json       # Plugin manifest
  ├── commands/             # 自訂 slash commands
  ├── agents/               # 自訂 agents (可選)
  ├── hooks/                # Event hooks (可選)
  │   └── hooks.json
  ├── .mcp.json            # MCP servers 配置
  ├── scripts/             # Hook 腳本
  ├── lib/                 # 共用程式碼
  ├── tests/               # Plugin 測試
  └── README.md            # Plugin 文件
  ```
- **且** 不應與 `src/` 目錄混合

### 需求：Plugin Manifest
Plugin 應有完整的 plugin.json manifest 描述元資料和組件。

#### 情境：建立 plugin.json
- **當** 初始化 plugin 時
- **則** 應建立 `.claude-plugin/plugin.json` 包含：
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
    "mcpServers": "./.mcp.json"
  }
  ```
- **且** 應使用語義化版本 (semantic versioning)
- **且** 所有路徑應正確指向組件位置

### 需求：自訂 Slash Commands
Plugin 應提供自訂的 slash commands 讓使用者快速調用轉換功能。

#### 情境：建立 /convert command
- **當** 使用者執行 `/convert <問題>`
- **則** 應呼叫 Gemini API 轉換提示詞
- **且** 應顯示轉換結果
- **且** 命令應定義在 `commands/convert.md`：
  ```markdown
  # Convert Prompt Command

  將簡單問題轉換為專業上下文提示詞

  ## Usage
  /convert <your question>

  ## Example
  /convert 如何學習 JavaScript?
  ```

#### 情境：建立 /convert-batch command
- **當** 使用者執行 `/convert-batch`
- **則** 應提示使用者輸入多個問題（一行一個）
- **且** 應並行轉換所有問題（最多 3 個同時）
- **且** 應顯示所有轉換結果
- **且** 命令應定義在 `commands/convert-batch.md`

#### 情境：建立 /prompt-keys command
- **當** 使用者執行 `/prompt-keys`
- **則** 應顯示 API key 管理選單
- **且** 支援子命令：
  - `/prompt-keys add <key>` - 新增 API key
  - `/prompt-keys list` - 列出所有 keys（遮蔽顯示）
  - `/prompt-keys remove <keyId>` - 移除指定 key
  - `/prompt-keys status` - 顯示 keys 狀態
- **且** 命令應定義在 `commands/prompt-keys.md`

### 需求：MCP Server 整合
Plugin 應整合 MCP server 提供外部工具存取能力（可選但推薦）。

#### 情境：配置 MCP Server
- **當** 建立 `.mcp.json` 配置檔
- **則** 應定義 MCP server 連線：
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
- **且** 如果提供 MCP server，應實作以下 tools：
  - `convert_prompt` - 轉換單一提示詞
  - `batch_convert` - 批次轉換
  - `manage_keys` - 管理 API keys
  - `get_stats` - 取得使用統計

#### 情境：MCP Server 啟動
- **當** Claude Code 載入 plugin 時
- **則** 應自動啟動 MCP server（如果已配置）
- **且** 應在日誌中記錄啟動狀態
- **且** 失敗時應顯示友善錯誤訊息

### 需求：Hooks 整合（可選）
Plugin 可實作 hooks 以自動化工作流程。

#### 情境：配置 pre-commit hook
- **當** 使用者提交程式碼前
- **則** 可自動檢查是否有未轉換的提示詞註解
- **且** 提示使用者轉換（如果需要）
- **且** Hook 配置在 `hooks/hooks.json`：
  ```json
  {
    "hooks": [
      {
        "event": "pre-commit",
        "script": "./scripts/check-prompts.sh",
        "enabled": false
      }
    ]
  }
  ```

### 需求：核心功能實作
Plugin 應實作核心的提示詞轉換邏輯。

#### 情境：實作轉換邏輯
- **當** 呼叫轉換功能時
- **則** 應使用 `lib/gemini-client.js` 處理 API 呼叫
- **且** 應使用 `lib/api-manager.js` 管理 API keys
- **且** 應使用 `lib/prompt-builder.js` 建構系統提示詞
- **且** 所有核心邏輯應放在 `lib/` 目錄

#### 情境：錯誤處理
- **當** API 呼叫失敗時
- **則** 應使用 `lib/error-handler.js` 統一處理錯誤
- **且** 應顯示友善的錯誤訊息給使用者
- **且** 應記錄詳細錯誤到日誌檔
- **且** 應提供重試選項（適用情況）

### 需求：API Key 安全儲存
Plugin 應安全地儲存和管理 API keys。

#### 情境：儲存 API Keys
- **當** 使用者新增 API key 時
- **則** 應加密後儲存至 `data/keys.json`（不在版控中）
- **且** 應使用 AES-256-GCM 加密
- **且** 加密金鑰應儲存在系統 keychain 或環境變數
- **且** `data/` 目錄應加入 `.gitignore`

#### 情境：讀取 API Keys
- **當** Plugin 需要使用 API key 時
- **則** 應從 `data/keys.json` 解密讀取
- **且** 應驗證 key 格式
- **且** 應檢查 key 是否過期或無效
- **且** 自動切換到下一個可用 key（如果目前 key 失敗）

### 需求：安裝和配置文件
Plugin 應提供清晰的安裝和使用文件。

#### 情境：README 內容
- **當** 使用者開啟 `README.md`
- **則** 應包含以下章節：
  - **簡介**: Plugin 功能說明
  - **安裝**: 使用 `/plugin install` 或手動安裝步驟
  - **配置**:
    - 如何新增 API keys
    - 如何配置選項
  - **使用方式**:
    - 所有可用的 slash commands
    - 使用範例和截圖
  - **MCP Tools**（如果提供）:
    - 所有可用 tools 的說明
    - 參數定義和範例
  - **疑難排解**: 常見問題和解決方案
  - **開發**: 如何本地開發和測試
- **且** 應使用繁體中文撰寫
- **且** 應包含實際的使用範例

### 需求：測試覆蓋
Plugin 應有完整的測試覆蓋。

#### 情境：單元測試
- **當** 執行 `npm test` 時
- **則** 應測試所有核心模組：
  - `lib/gemini-client.test.js` - API 呼叫邏輯
  - `lib/api-manager.test.js` - Key 管理邏輯
  - `lib/prompt-builder.test.js` - 提示詞建構
  - `lib/error-handler.test.js` - 錯誤處理
- **且** 應使用 mock 避免實際 API 呼叫
- **且** 測試覆蓋率應達到 80% 以上

#### 情境：整合測試
- **當** 執行整合測試時
- **則** 應測試 commands 的完整執行流程
- **且** 應測試 MCP tools（如果提供）
- **且** 應使用測試 API keys

### 需求：日誌系統
Plugin 應記錄重要操作和錯誤。

#### 情境：記錄操作日誌
- **當** Plugin 執行任何操作時
- **則** 應記錄到 `logs/plugin.log`
- **且** 應包含：
  - 時間戳記
  - 操作類型
  - 執行結果
  - 錯誤訊息（如果有）
- **且** 應支援日誌級別（DEBUG, INFO, WARN, ERROR）
- **且** 應自動輪替日誌（每日或達 10MB）

#### 情境：遮蔽敏感資訊
- **當** 記錄涉及 API keys 的操作時
- **則** 不應記錄完整的 API keys
- **且** 應僅記錄 key ID 或前 4 碼
- **且** 不應記錄完整的請求/回應內容（僅摘要）

### 需求：Plugin 安裝和發布
Plugin 應支援標準的安裝和發布流程。

#### 情境：從 Marketplace 安裝
- **當** 使用者執行 `/plugin install prompt-to-context`
- **則** Claude Code 應從配置的 marketplace 下載 plugin
- **且** 應自動安裝依賴（如果有 package.json）
- **且** 應驗證 plugin.json 格式
- **且** 安裝成功後應提示使用者重啟

#### 情境：本地開發安裝
- **當** 開發者想測試本地 plugin
- **則** 應支援 `/plugin install ./path/to/plugin`
- **且** 應熱重載變更（開發模式）
- **且** 應顯示開發模式標記

#### 情境：發布到 Marketplace
- **當** 準備發布 plugin 時
- **則** 應建立 `.claude-plugin/marketplace.json`：
  ```json
  {
    "plugins": [
      {
        "name": "prompt-to-context",
        "repository": "https://github.com/yourusername/PromptToCentext",
        "path": "plugins/claude-code",
        "description": "將簡單問題轉換為專業上下文提示詞"
      }
    ]
  }
  ```
- **且** 應建立 Git tag 標記版本
- **且** 應更新 CHANGELOG.md

### 需求：依賴管理
Plugin 應正確管理依賴項。

#### 情境：建立 package.json
- **當** Plugin 需要 npm 套件時
- **則** 應建立 `package.json`：
  ```json
  {
    "name": "@your-org/claude-code-prompt-to-context",
    "version": "1.0.0",
    "description": "Prompt-to-Context plugin for Claude Code",
    "main": "lib/index.js",
    "scripts": {
      "test": "jest",
      "lint": "eslint lib/**/*.js"
    },
    "dependencies": {
      "node-fetch": "^3.3.0"
    },
    "devDependencies": {
      "jest": "^29.0.0",
      "eslint": "^8.0.0"
    }
  }
  ```
- **且** 應最小化依賴數量
- **且** 應使用 lockfile（package-lock.json）

### 需求：配置選項
Plugin 應支援使用者自訂配置。

#### 情境：建立配置檔
- **當** Plugin 初始化時
- **則** 應讀取 `config.json`（如果存在）
- **且** 配置應包含：
  ```json
  {
    "apiTimeout": 30000,
    "maxConcurrent": 3,
    "rateLimit": {
      "requests": 10,
      "period": 60000
    },
    "defaultModel": "gemini-pro",
    "systemPromptPath": "./prompts/default.txt",
    "logging": {
      "level": "INFO",
      "maxSize": 10485760,
      "maxFiles": 7
    }
  }
  ```
- **且** 應使用預設值填補缺失的設定
- **且** 應驗證配置格式

#### 情境：使用者覆寫配置
- **當** 使用者建立 `config.local.json`
- **則** 應合併並覆寫預設配置
- **且** `config.local.json` 應加入 `.gitignore`
- **且** 應記錄使用的配置（啟動時）

### 需求：版本相容性
Plugin 應宣告支援的 Claude Code 版本。

#### 情境：檢查版本相容性
- **當** Plugin 載入時
- **則** 應檢查 Claude Code 版本
- **且** 應在 plugin.json 宣告相容版本：
  ```json
  {
    "engines": {
      "claude-code": ">=1.0.0"
    }
  }
  ```
- **且** 如果版本不相容應顯示警告
- **且** 應提供升級指引

### 需求：共用程式碼模組
Plugin 應有良好的程式碼組織結構。

#### 情境：核心模組結構
- **當** 實作 Plugin 邏輯時
- **則** 應組織為以下模組：
  - `lib/gemini-client.js` - Gemini API 客戶端
  - `lib/api-manager.js` - API key 管理
  - `lib/prompt-builder.js` - 系統提示詞建構
  - `lib/error-handler.js` - 錯誤處理
  - `lib/logger.js` - 日誌系統
  - `lib/config-loader.js` - 配置載入
  - `lib/crypto.js` - 加密/解密
  - `lib/utils.js` - 工具函數
- **且** 每個模組應有單一職責
- **且** 應使用 ES modules 或 CommonJS（一致性）

### 需求：MCP Tools 實作（可選）
如果提供 MCP server，應實作標準的 tools。

#### 情境：實作 convert_prompt tool
- **當** MCP server 收到 `convert_prompt` 呼叫
- **則** 應接受參數：
  ```json
  {
    "prompt": "string (required)",
    "apiKey": "string (optional)",
    "options": {
      "temperature": "number (optional)",
      "maxTokens": "number (optional)"
    }
  }
  ```
- **且** 應回應：
  ```json
  {
    "success": true,
    "result": "轉換後的提示詞",
    "metadata": {
      "keyUsed": "key-id",
      "tokensUsed": 1234,
      "duration": 1500
    }
  }
  ```
- **且** 失敗時應回應錯誤：
  ```json
  {
    "success": false,
    "error": {
      "code": "API_ERROR",
      "message": "錯誤描述",
      "details": "詳細資訊"
    }
  }
  ```

#### 情境：實作 batch_convert tool
- **當** MCP server 收到 `batch_convert` 呼叫
- **則** 應接受參數：
  ```json
  {
    "prompts": ["問題1", "問題2", "問題3"],
    "options": {
      "maxConcurrent": 3
    }
  }
  ```
- **且** 應並行處理（最多 3 個）
- **且** 應回應陣列，每個元素對應一個轉換結果
- **且** 部分失敗時應繼續處理其他請求

#### 情境：實作 manage_keys tool
- **當** MCP server 收到 `manage_keys` 呼叫
- **則** 應支援操作：
  - `action: "add"` - 新增 key
  - `action: "remove"` - 移除 key
  - `action: "list"` - 列出 keys（遮蔽）
  - `action: "status"` - 取得 keys 狀態
- **且** 應驗證操作權限
- **且** 應安全地儲存變更

### 需求：效能最佳化
Plugin 應注重效能和資源使用。

#### 情境：快取機制
- **當** 轉換相同的問題時
- **則** 應從快取回傳結果（5 分鐘內）
- **且** 快取應使用 LRU 策略
- **且** 快取大小應限制（例如：最多 100 項）
- **且** 應支援清除快取命令

#### 情境：請求限流
- **當** 短時間內收到大量請求時
- **則** 應實作限流機制（每分鐘最多 10 次）
- **且** 超過限制時應回傳 429 錯誤
- **且** 應告知使用者等待時間

### 需求：使用統計
Plugin 應追蹤使用統計以供分析。

#### 情境：記錄統計資訊
- **當** Plugin 執行操作時
- **則** 應記錄統計至 `data/stats.json`
- **且** 應包含：
  - 總轉換次數
  - 成功/失敗次數
  - 平均回應時間
  - 每個 API key 的使用次數
  - 錯誤類型分佈
- **且** 應支援查詢統計的命令（例如：`/prompt-stats`）
- **且** 統計資料不應包含敏感資訊
