---
description: 使用 Gemini API 將簡單問題轉換為專業上下文提示詞
argument-hint: <問題>
---

你需要執行以下任務：

1. **取得使用者輸入**：使用者提供的問題是：$ARGUMENTS

2. **讀取 Plugin 配置**：
   - 讀取 `src/plugins/claude-code/data/api-keys.json` 取得可用的 Gemini API Keys
   - 讀取 `src/plugins/claude-code/config.json` 取得配置

3. **執行轉換**：
   - 使用 Node.js 執行 plugin 的轉換功能
   - 呼叫 Gemini API 進行提示詞優化
   - 使用以下命令：
   ```bash
   node src/plugins/claude-code/lib/index.js convert "$ARGUMENTS"
   ```

4. **顯示結果**：
   - 顯示原始問題
   - 顯示轉換後的專業提示詞
   - 顯示執行時間和統計資訊

如果發現沒有 API Key，提示使用者使用 `/prompt-keys add` 命令新增。
