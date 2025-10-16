# Plugin 安裝指南

## 🚀 推薦安裝方式

### 方式 1：從 GitHub 安裝（最簡單）

```bash
/plugin install https://github.com/alianrektdoug/PromptToCentext/tree/master/plugins/claude-code
```

**優點**：
- ✅ 最穩定可靠
- ✅ 自動處理路徑問題
- ✅ 總是獲得最新版本

**等待安裝完成後**，重啟 Claude Code，然後驗證安裝：
```bash
/plugin list
```

應該會看到 `prompt-to-context` 出現在列表中。

---

## 🔧 替代安裝方式

### 方式 2：從本地路徑安裝（進階）

如果從 GitHub 安裝失敗，可以嘗試本地安裝：

#### Windows 系統

**選項 A：使用正斜線**
```bash
/plugin install C:/Users/alian/Desktop/github/PromptToCentext/src/plugins/claude-code
```

**選項 B：使用 file:// 協議**
```bash
/plugin install file:///C:/Users/alian/Desktop/github/PromptToCentext/src/plugins/claude-code
```

**選項 C：使用相對路徑**（需在專案目錄中）
```bash
cd C:\Users\alian\Desktop\github\PromptToCentext
/plugin install ./src/plugins/claude-code
```

#### macOS / Linux 系統

```bash
/plugin install /Users/YOUR_USERNAME/path/to/PromptToCentext/src/plugins/claude-code
```

或使用 file:// 協議：
```bash
/plugin install file:///Users/YOUR_USERNAME/path/to/PromptToCentext/src/plugins/claude-code
```

---

## ✅ 驗證安裝

### 步驟 1：檢查 Plugin 列表

```bash
/plugin list
```

**預期輸出**：
```
已安裝的 Plugins:
- prompt-to-context (v1.0.0)
```

### 步驟 2：測試指令

```bash
/convert 測試問題
```

如果看到錯誤訊息要求 API Key，表示 Plugin 已成功安裝！

### 步驟 3：新增 API Key

```bash
/prompt-keys add YOUR_GEMINI_API_KEY
```

取得 API Key：https://makersuite.google.com/app/apikey

### 步驟 4：完整測試

```bash
/convert 如何學習 JavaScript？
```

**預期輸出**：
```
✅ 轉換成功！

【原始輸入】
如何學習 JavaScript？

【轉換結果】
我想系統性地學習 JavaScript 程式語言...
```

---

## 🐛 疑難排解

### 問題 1：找不到 Plugin

**錯誤訊息**：
```
Marketplace "path" not found
```

**解決方案**：

1. **檢查路徑是否正確**
   ```bash
   # Windows - 確認路徑存在
   dir C:\Users\alian\Desktop\github\PromptToCentext\src\plugins\claude-code

   # macOS/Linux
   ls /path/to/PromptToCentext/src/plugins/claude-code
   ```

2. **確認目錄結構**
   ```bash
   cd C:\Users\alian\Desktop\github\PromptToCentext\src\plugins\claude-code
   ls
   ```

   應該看到：
   - `.claude-plugin/` 目錄
   - `commands/` 目錄
   - `package.json`
   - `README.md`

3. **使用完整絕對路徑**
   - ✅ 正確：`C:/Users/alian/Desktop/github/PromptToCentext/src/plugins/claude-code`
   - ❌ 錯誤：`path/to/PromptToCentext/src/plugins/claude-code`

4. **改用 GitHub 安裝**
   ```bash
   /plugin install https://github.com/alianrektdoug/PromptToCentext/tree/master/plugins/claude-code
   ```

### 問題 2：安裝後找不到指令

**錯誤訊息**：
```
Unknown command: /convert
```

**解決方案**：

1. **重啟 Claude Code**
   - 關閉所有 Claude Code 視窗
   - 重新開啟

2. **檢查 Plugin 狀態**
   ```bash
   /plugin list
   ```

3. **重新安裝**
   ```bash
   /plugin uninstall prompt-to-context
   /plugin install https://github.com/alianrektdoug/PromptToCentext/tree/master/plugins/claude-code
   ```

### 問題 3：API Key 錯誤

**錯誤訊息**：
```
請先新增 API Key
```

**解決方案**：

1. **新增 API Key**
   ```bash
   /prompt-keys add AIzaSy...
   ```

2. **驗證格式**
   - API Key 必須以 `AIza` 開頭
   - 長度約 39 字元
   - 從 https://makersuite.google.com/app/apikey 取得

3. **檢查 Key 列表**
   ```bash
   /prompt-keys list
   ```

### 問題 4：轉換失敗

**錯誤訊息**：
```
轉換失敗：...
```

**可能原因和解決方案**：

1. **網路問題**
   - 檢查網路連線
   - 確認可以訪問 Google API

2. **API 配額用完**
   ```bash
   /prompt-keys add ANOTHER_API_KEY
   ```

3. **API Key 無效**
   ```bash
   /prompt-keys remove 1
   /prompt-keys add NEW_API_KEY
   ```

4. **輸入過長**
   - 減少輸入文字長度（限制 10,000 字元）

---

## 📋 完整安裝檢查清單

安裝前檢查：
- [ ] 已安裝 Claude Code（版本 >= 1.0.0）
- [ ] 有穩定的網路連線
- [ ] 已取得 Gemini API Key

安裝步驟：
- [ ] 執行安裝指令
- [ ] 等待安裝完成
- [ ] 重啟 Claude Code
- [ ] 執行 `/plugin list` 驗證
- [ ] 新增 API Key
- [ ] 執行測試轉換

安裝成功標準：
- [ ] `/plugin list` 顯示 `prompt-to-context`
- [ ] `/convert 測試` 可以執行（即使缺 API Key 也會有提示）
- [ ] `/prompt-keys list` 可以顯示 Keys
- [ ] 完整測試轉換成功

---

## 🆘 需要協助？

如果以上方法都無法解決問題：

1. **查看日誌**
   ```bash
   # 檢查 Plugin 目錄的日誌
   cat C:\Users\alian\Desktop\github\PromptToCentext\src\plugins\claude-code\logs\plugin.log
   ```

2. **提交 Issue**
   https://github.com/alianrektdoug/PromptToCentext/issues

   請提供：
   - Claude Code 版本
   - 作業系統
   - 完整錯誤訊息
   - 安裝指令

3. **參考文件**
   - [Plugin README](README.md)
   - [主專案文件](../../README.md)
   - [Claude Code 官方文件](https://docs.claude.com/claude-code)

---

**最後更新**: 2025-10-16
**版本**: 1.0.0
