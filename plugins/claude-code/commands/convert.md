# Convert - 轉換提示詞

將簡單問題轉換為專業上下文提示詞。

## 使用方式

```
/convert <問題>
```

## 範例

```
/convert 如何學習 JavaScript？
```

## 功能說明

此命令會使用 Gemini API 將您的簡單問題轉換為更專業、更有上下文的提示詞。轉換過程包括：

1. **補充背景資訊**：增加必要的上下文說明
2. **明確化目標**：清楚表達問題的期望和目的
3. **結構化表達**：使用條列式或結構化的方式組織內容
4. **專業化語言**：使用更專業的術語和表達方式

## 執行流程

請執行以下步驟來轉換提示詞：

### 步驟 1：初始化 Plugin

```javascript
const PromptToContextPlugin = require('../lib/index.js');
const plugin = new PromptToContextPlugin();
await plugin.initialize();
```

### 步驟 2：取得使用者輸入

從命令參數中取得使用者的問題：

```javascript
const userPrompt = process.argv.slice(2).join(' ');

if (!userPrompt || userPrompt.trim().length === 0) {
    console.error('❌ 錯誤：請提供要轉換的問題');
    console.log('');
    console.log('使用方式：/convert <問題>');
    console.log('範例：/convert 如何學習 JavaScript？');
    process.exit(1);
}
```

### 步驟 3：執行轉換

呼叫 Plugin 的轉換功能：

```javascript
try {
    console.log('🔄 正在轉換中...');
    console.log('');

    const result = await plugin.convert(userPrompt);

    if (result.success) {
        console.log('✅ 轉換成功！');
        console.log('');
        console.log('【原始輸入】');
        console.log(userPrompt);
        console.log('');
        console.log('【轉換結果】');
        console.log(result.output);
        console.log('');
        console.log('【元資料】');
        console.log(`⏱️  執行時間: ${result.metadata.duration}ms`);
        console.log(`📊 輸入長度: ${result.metadata.inputLength} 字元`);
        console.log(`📊 輸出長度: ${result.metadata.outputLength} 字元`);
        console.log(`🤖 使用模型: ${result.metadata.model}`);
    } else {
        console.error('❌ 轉換失敗');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ 錯誤:', error.message);
    console.log('');

    if (error.message.includes('沒有可用的 API Key')) {
        console.log('💡 提示：請先使用 /prompt-keys 命令新增 API Key');
    }

    process.exit(1);
}
```

### 步驟 4：完成

轉換完成後，結果會顯示在終端機上。您可以：

- 複製轉換後的提示詞使用
- 查看執行時間和其他統計資訊
- 使用 `/convert-batch` 進行批次轉換

## 相關命令

- `/convert-batch` - 批次轉換多個問題
- `/prompt-keys` - 管理 API Keys
- `/prompt-history` - 查看轉換歷史

## 注意事項

1. **API Key 要求**：使用前需先透過 `/prompt-keys add` 新增至少一個 Gemini API Key
2. **輸入限制**：單次輸入最多 10,000 字元
3. **網路連線**：需要穩定的網路連線來呼叫 Gemini API
4. **逾時設定**：預設逾時時間為 30 秒

## 疑難排解

### 問題：沒有可用的 API Key

**解決方案**：
```bash
/prompt-keys add YOUR_API_KEY
```

### 問題：API 請求失敗

**可能原因**：
- API Key 無效或已過期
- API 配額用完
- 網路連線問題
- API 服務暫時無法使用

**解決方案**：
1. 檢查 API Key 是否有效
2. 查看 API 配額使用情況
3. 確認網路連線正常
4. 稍後再試

### 問題：轉換結果不理想

**解決方案**：
- 提供更具體的問題描述
- 增加背景資訊和上下文
- 嘗試不同的表達方式
- 查看範本庫尋找合適的範本
