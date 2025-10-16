---
description: 批次轉換多個問題為專業上下文提示詞
---

你需要執行以下任務：

1. **互動式輸入模式**：
   - 提示使用者輸入要轉換的問題（每行一個）
   - 使用空行表示輸入結束

2. **讀取 Plugin 配置**：
   - 讀取 `src/plugins/claude-code/data/api-keys.json` 取得可用的 Gemini API Keys
   - 讀取 `src/plugins/claude-code/config.json` 取得配置

3. **批次執行轉換**：
   - 對每個問題依序呼叫 Gemini API
   - 使用以下命令：
   ```bash
   node src/plugins/claude-code/lib/index.js convert-batch
   ```

4. **顯示結果**：
   - 顯示轉換進度（例如：1/5, 2/5...）
   - 對每個問題顯示：
     - 原始問題
     - 轉換後的提示詞
     - 執行時間
   - 最後顯示總結統計

如果發現沒有 API Key，提示使用者使用 `/prompt-keys add` 命令新增。
