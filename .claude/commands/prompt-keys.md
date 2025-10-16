---
description: 管理 Gemini API Keys（list/add/remove/stats）
argument-hint: <action> [value]
---

你需要使用統一的 API Key 管理 CLI 來執行 API Key 管理任務。

## 操作參數

第一個參數 `$1` 是操作類型，可能的值：
- `list`: 列出所有 API Keys
- `add`: 新增 API Key（第二個參數 `$2` 是 Key 值）
- `remove`: 刪除 API Key（第二個參數 `$2` 是 Key ID）
- `reset`: 重設 Key 狀態（第二個參數 `$2` 是 Key ID）
- `stats`: 顯示統計資訊

## 任務執行

### 統一執行方式

使用以下命令呼叫統一管理 CLI：

```bash
node src/plugins/claude-code/cli.js $1 $2
```

### 1. List - 列出 API Keys

```bash
node src/plugins/claude-code/cli.js list
```

### 2. Add - 新增 API Key

```bash
node src/plugins/claude-code/cli.js add "$2"
```

範例：
```bash
node src/plugins/claude-code/cli.js add AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Remove - 刪除 API Key

```bash
node src/plugins/claude-code/cli.js remove "$2"
```

範例：
```bash
node src/plugins/claude-code/cli.js remove key_1234567890_abcdef
```

### 4. Reset - 重設 Key 狀態

```bash
node src/plugins/claude-code/cli.js reset "$2"
```

範例：
```bash
node src/plugins/claude-code/cli.js reset key_1234567890_abcdef
```

### 5. Stats - 統計資訊

```bash
node src/plugins/claude-code/cli.js stats
```

## 錯誤處理

- CLI 會自動驗證參數並顯示錯誤訊息
- 所有操作都使用統一的 API Key 管理器
- 資料儲存在 `src/plugins/claude-code/data/api-keys.json`（加密格式）
