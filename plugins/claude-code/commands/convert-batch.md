# Convert Batch - 批次轉換提示詞

批次轉換多個問題為專業上下文提示詞。

## 使用方式

```
/convert-batch
```

執行後會進入互動模式，讓您輸入多個問題進行批次轉換。

## 執行流程

### 步驟 1：初始化

```javascript
const PromptToContextPlugin = require('../lib/index.js');
const readline = require('readline');

const plugin = new PromptToContextPlugin();
await plugin.initialize();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
```

### 步驟 2：收集輸入

```javascript
console.log('📝 批次轉換模式');
console.log('');
console.log('請輸入要轉換的問題（每行一個）');
console.log('輸入空行結束輸入並開始轉換');
console.log('');

const prompts = [];

function readLine() {
    return new Promise((resolve) => {
        rl.question('> ', (answer) => {
            resolve(answer);
        });
    });
}

while (true) {
    const line = await readLine();

    if (!line || line.trim().length === 0) {
        break;
    }

    prompts.push(line.trim());
    console.log(`✓ 已新增 (${prompts.length})`);
}

rl.close();

if (prompts.length === 0) {
    console.log('');
    console.log('⚠️  未輸入任何問題');
    process.exit(0);
}
```

### 步驟 3：執行批次轉換

```javascript
console.log('');
console.log(`🔄 開始轉換 ${prompts.length} 個問題...`);
console.log('');

const results = [];
let successCount = 0;
let failedCount = 0;

for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    console.log(`[${i + 1}/${prompts.length}] 轉換中...`);

    try {
        const result = await plugin.convert(prompt);

        if (result.success) {
            results.push({
                index: i + 1,
                input: prompt,
                output: result.output,
                status: 'success',
                metadata: result.metadata
            });
            successCount++;
            console.log(`✅ 完成 (${result.metadata.duration}ms)`);
        }
    } catch (error) {
        results.push({
            index: i + 1,
            input: prompt,
            output: null,
            status: 'error',
            error: error.message
        });
        failedCount++;
        console.log(`❌ 失敗: ${error.message}`);
    }

    console.log('');

    // 延遲避免超過速率限制
    if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
```

### 步驟 4：顯示結果

```javascript
console.log('');
console.log('=' .repeat(60));
console.log('📊 批次轉換完成');
console.log('=' .repeat(60));
console.log('');
console.log(`總數: ${prompts.length}`);
console.log(`✅ 成功: ${successCount}`);
console.log(`❌ 失敗: ${failedCount}`);
console.log(`成功率: ${((successCount / prompts.length) * 100).toFixed(1)}%`);
console.log('');

// 顯示詳細結果
for (const result of results) {
    console.log('-'.repeat(60));
    console.log(`[${result.index}] ${result.status === 'success' ? '✅' : '❌'}`);
    console.log('');
    console.log('【輸入】');
    console.log(result.input);
    console.log('');

    if (result.status === 'success') {
        console.log('【輸出】');
        console.log(result.output);
        console.log('');
        console.log(`⏱️  執行時間: ${result.metadata.duration}ms`);
    } else {
        console.log('【錯誤】');
        console.log(result.error);
    }

    console.log('');
}

console.log('-'.repeat(60));
```

### 步驟 5：匯出結果（可選）

```javascript
// 詢問是否匯出
rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const shouldExport = await new Promise((resolve) => {
    rl.question('是否要匯出結果到檔案？(y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
    });
});

rl.close();

if (shouldExport) {
    const fs = require('fs').promises;
    const path = require('path');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `batch-convert-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);

    await fs.writeFile(
        filepath,
        JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: prompts.length,
                success: successCount,
                failed: failedCount,
                successRate: ((successCount / prompts.length) * 100).toFixed(1) + '%'
            },
            results: results
        }, null, 2)
    );

    console.log('');
    console.log(`✅ 結果已匯出到: ${filename}`);
}
```

## 功能特色

1. **互動式輸入**：逐行輸入問題，更方便管理
2. **進度顯示**：即時顯示轉換進度
3. **錯誤處理**：單一失敗不影響其他轉換
4. **速率控制**：自動延遲避免超過 API 限制
5. **結果匯出**：可選擇匯出為 JSON 檔案

## 範例使用

```bash
$ /convert-batch

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

[1/3] 轉換中...
✅ 完成 (2341ms)

[2/3] 轉換中...
✅ 完成 (1987ms)

[3/3] 轉換中...
✅ 完成 (2156ms)

============================================================
📊 批次轉換完成
============================================================

總數: 3
✅ 成功: 3
❌ 失敗: 0
成功率: 100.0%

[結果詳細內容...]

是否要匯出結果到檔案？(y/n): y

✅ 結果已匯出到: batch-convert-2025-01-15-14-30-25.json
```

## 相關命令

- `/convert` - 轉換單一問題
- `/prompt-keys` - 管理 API Keys
- `/prompt-history` - 查看轉換歷史

## 注意事項

1. **API 配額**：批次轉換會消耗較多 API 配額，請注意使用量
2. **速率限制**：系統會自動在每次請求間延遲 1 秒
3. **輸入數量**：建議單次批次不超過 50 個問題
4. **逾時處理**：若單一問題逾時，會記錄錯誤並繼續處理下一個

## 疑難排解

### 問題：批次轉換中斷

**原因**：
- 網路連線中斷
- API Key 配額用完
- 系統資源不足

**解決方案**：
- 檢查網路連線
- 更換 API Key
- 減少單次批次數量
- 查看錯誤訊息進行診斷

### 問題：部分轉換失敗

**說明**：
批次轉換採用容錯設計，單一失敗不會影響其他問題的轉換。失敗的項目會在結果中標記，並顯示錯誤原因。

**處理方式**：
1. 查看失敗項目的錯誤訊息
2. 針對失敗項目使用 `/convert` 單獨轉換
3. 檢查是否需要調整問題表達方式
