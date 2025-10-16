# API Key 統一管理系統

## 📋 概述

本專案已實作統一的 API Key 管理系統，解決了原本 `index.html` 和 `plugin` 各自儲存 API Keys 的問題。

## 🎯 架構設計

```
統一儲存位置：src/plugins/claude-code/data/api-keys.json
              (唯一真相來源 - Single Source of Truth)

┌─────────────────────────────────────────────────┐
│   統一 API Key 管理器                            │
│   src/plugins/claude-code/lib/api-key-manager.js │
│                                                 │
│  功能：                                          │
│  ✓ 新增/刪除/列出 API Keys                       │
│  ✓ AES-256-GCM 加密儲存                         │
│  ✓ 狀態管理（active/error/inactive）            │
│  ✓ 使用統計與錯誤追蹤                            │
│  ✓ 自動輪替 Keys                                │
└─────────────────────────────────────────────────┘
         ↑                              ↑
         │                              │
         │                              │
┌────────┴────────┐          ┌─────────┴─────────┐
│  Claude Code    │          │  Future: Bridge   │
│  Plugin         │          │  for index.html   │
│  (直接使用)      │          │  (HTTP API)       │
└─────────────────┘          └───────────────────┘
```

## 🔒 安全性

- **加密演算法**：AES-256-GCM
- **金鑰派生**：PBKDF2-SHA512（100,000 輪）
- **認證標籤**：確保資料完整性
- **隨機鹽值**：每次加密使用不同的鹽值

## 🛠️ 使用方式

### 1. 透過 Slash Command（推薦）

#### 列出所有 API Keys
```bash
/prompt-keys list
```

#### 新增 API Key
```bash
/prompt-keys add AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 刪除 API Key
```bash
/prompt-keys remove key_1234567890_abcdef
```

#### 重設 Key 狀態
```bash
/prompt-keys reset key_1234567890_abcdef
```

#### 顯示統計資訊
```bash
/prompt-keys stats
```

### 2. 透過 CLI 直接執行

```bash
# 列出
node src/plugins/claude-code/cli.js list

# 新增
node src/plugins/claude-code/cli.js add "YOUR_API_KEY"

# 刪除
node src/plugins/claude-code/cli.js remove "KEY_ID"

# 重設
node src/plugins/claude-code/cli.js reset "KEY_ID"

# 統計
node src/plugins/claude-code/cli.js stats
```

### 3. 在 Node.js 程式中使用

```javascript
const UnifiedApiKeyManager = require('./src/plugins/claude-code/lib/api-key-manager');

// 建立實例
const manager = new UnifiedApiKeyManager();

// 初始化
await manager.initialize();

// 新增 Key
const result = await manager.addKey('AIzaSy...');
if (result.success) {
    console.log('Key ID:', result.keyId);
}

// 取得下一個可用 Key
const keyObj = manager.getNextKey();
if (keyObj) {
    console.log('使用 Key:', keyObj.key);
}

// 標記錯誤
await manager.markKeyError(keyId, 'quota');

// 取得統計
const stats = manager.getStats();
console.log('可用 Keys:', stats.active);
```

## 📊 資料格式

### 儲存格式（api-keys.json）

```json
{
  "keys": [
    {
      "id": "key_1760639271091_vtrwzmg",
      "encrypted": "{...加密資料...}",
      "status": "active",
      "lastUsed": 1760639271091,
      "errorCount": 0,
      "createdAt": 1760639271091,
      "usageCount": 45
    }
  ],
  "maxKeys": 5,
  "createdAt": "2025-10-17T00:00:00.000Z",
  "updatedAt": "2025-10-17T00:00:00.000Z"
}
```

### Key 狀態

- `active`: 正常可用
- `error`: 發生錯誤（配額、認證失敗等）
- `inactive`: 手動停用

### 自動錯誤處理

當 Key 發生以下情況時會自動標記為 `error`：
- 配額耗盡（quota exceeded）
- 認證失敗（unauthorized, forbidden）
- 累計錯誤次數 ≥ 3 次

## 🔄 遷移指南

### 從舊系統遷移

如果您之前在 `localStorage` 或其他地方儲存了 API Keys，請手動重新新增：

1. 使用 `/prompt-keys list` 確認目前沒有 Keys
2. 使用 `/prompt-keys add` 逐一新增您的 Keys
3. 舊的儲存位置（localStorage）可以忽略，不會再被使用

### 確認遷移成功

```bash
# 列出所有 Keys
/prompt-keys list

# 查看統計
/prompt-keys stats
```

## 🔧 進階配置

### 修改最大 Keys 數量

編輯 `src/plugins/claude-code/lib/api-key-manager.js`：

```javascript
this.maxKeys = 10; // 預設是 5
```

### 修改加密密碼

編輯 `src/plugins/claude-code/lib/api-key-manager.js`：

```javascript
const key = crypto.pbkdf2Sync(
    'your-custom-secret',  // 修改此處
    salt,
    100000,
    this.keyLength,
    'sha512'
);
```

**注意**：修改密碼後，舊的 Keys 將無法解密，需要重新新增。

## 📝 API 參考

### UnifiedApiKeyManager

#### 方法

- `async initialize()` - 初始化管理器
- `async addKey(apiKey)` - 新增 API Key
- `async removeKey(keyId)` - 刪除 API Key
- `getNextKey()` - 取得下一個可用 Key（自動輪替）
- `async markKeyError(keyId, errorType)` - 標記 Key 錯誤
- `async resetKeyStatus(keyId)` - 重設 Key 狀態
- `getAllKeys()` - 取得所有 Keys（已遮蔽）
- `getStats()` - 取得統計資訊
- `getRawKey(keyId)` - 取得原始 Key（用於 API 呼叫）

#### 錯誤類型

- `quota` - 配額耗盡
- `auth` - 認證失敗
- `invalid` - Key 無效
- `timeout` - 請求逾時
- `unknown` - 未知錯誤

## ❓ 常見問題

### Q: 如何取得 Gemini API Key？

A: 前往 https://makersuite.google.com/app/apikey

### Q: API Key 儲存在哪裡？

A: `src/plugins/claude-code/data/api-keys.json`（AES-256-GCM 加密）

### Q: 可以新增多少個 Keys？

A: 預設最多 5 個（可修改 `maxKeys`）

### Q: Key 會自動輪替嗎？

A: 是的，每次呼叫 `getNextKey()` 會自動輪替到下一個可用 Key

### Q: 如果 Key 發生錯誤怎麼辦？

A: 系統會自動標記為 `error`，並跳過該 Key。可以使用 `/prompt-keys reset KEY_ID` 重設狀態

### Q: index.html 如何使用統一的 API Keys？

A: ✅ index.html 已整合！透過 `APIManagerBridge` 連接到統一管理器，所有操作都會直接讀寫 `src/plugins/claude-code/data/api-keys.json`

**注意**：index.html 必須在 Node.js 環境中執行（例如透過 Electron 或本地伺服器），才能存取檔案系統

## 📚 相關檔案

- `src/plugins/claude-code/lib/api-key-manager.js` - 統一管理器
- `js/lib/api-manager-bridge.js` - index.html Bridge（已整合）
- `src/plugins/claude-code/cli.js` - CLI 介面
- `src/plugins/claude-code/lib/index.js` - Plugin 主程式
- `.claude/commands/prompt-keys.md` - Slash Command 定義

## 🚀 未來規劃

- [x] ~~實作 Bridge 讓 index.html 使用統一 API Keys~~ **已完成**
- [ ] 支援 API Key 有效性檢測
- [ ] 支援 Key 使用配額限制
- [ ] 支援 Key 過期時間設定
- [ ] 支援匯出/匯入 Keys（加密格式）

---

最後更新：2025-10-17
