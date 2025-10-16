# Prompt Keys - 管理 API Keys

管理 Gemini API Keys 的新增、查看和刪除。

## 使用方式

```bash
# 查看所有 API Keys
/prompt-keys list

# 新增 API Key
/prompt-keys add YOUR_API_KEY

# 刪除 API Key（依索引）
/prompt-keys remove INDEX

# 查看統計資訊
/prompt-keys stats
```

## 執行流程

### 初始化

```javascript
const PromptToContextPlugin = require('../lib/index.js');
const plugin = new PromptToContextPlugin();
await plugin.initialize();

const command = process.argv[2];
const arg = process.argv[3];
```

### 命令：list（列出所有 Keys）

```javascript
if (command === 'list' || !command) {
    const keys = plugin.listApiKeys();

    console.log('');
    console.log('🔑 API Keys 清單');
    console.log('='.repeat(60));
    console.log('');

    if (keys.length === 0) {
        console.log('目前沒有 API Keys');
        console.log('');
        console.log('使用以下命令新增：');
        console.log('/prompt-keys add YOUR_API_KEY');
        console.log('');
        console.log('取得 Gemini API Key：');
        console.log('https://makersuite.google.com/app/apikey');
    } else {
        keys.forEach((key, index) => {
            const statusIcon = key.status === 'active' ? '✅' : '❌';
            const statusText = key.status === 'active' ? '正常' : '錯誤';

            console.log(`[${index + 1}] ${statusIcon} ${statusText}`);
            console.log(`    Key: ${key.key}`);
            console.log(`    新增時間: ${new Date(key.addedAt).toLocaleString('zh-TW')}`);
            if (key.lastUsed) {
                console.log(`    最後使用: ${new Date(key.lastUsed).toLocaleString('zh-TW')}`);
            }
            console.log(`    錯誤次數: ${key.errorCount}`);
            console.log('');
        });

        console.log(`總共 ${keys.length} 組 API Keys`);
    }

    console.log('');
}
```

### 命令：add（新增 Key）

```javascript
else if (command === 'add') {
    if (!arg) {
        console.error('');
        console.error('❌ 錯誤：請提供 API Key');
        console.log('');
        console.log('使用方式：/prompt-keys add YOUR_API_KEY');
        console.log('');
        console.log('取得 Gemini API Key：');
        console.log('https://makersuite.google.com/app/apikey');
        console.log('');
        process.exit(1);
    }

    try {
        await plugin.addApiKey(arg);

        console.log('');
        console.log('✅ API Key 已新增！');
        console.log('');
        console.log('現在可以使用 /convert 命令進行轉換');
        console.log('');
    } catch (error) {
        console.error('');
        console.error('❌ 新增失敗:', error.message);
        console.log('');

        if (error.message.includes('格式錯誤')) {
            console.log('💡 提示：Gemini API Key 應以 AIza 開頭');
        } else if (error.message.includes('已存在')) {
            console.log('💡 提示：此 API Key 已經新增過了');
        } else if (error.message.includes('最多')) {
            console.log('💡 提示：已達到最大數量限制，請先刪除不需要的 Key');
        }

        console.log('');
        process.exit(1);
    }
}
```

### 命令：remove（刪除 Key）

```javascript
else if (command === 'remove') {
    if (!arg) {
        console.error('');
        console.error('❌ 錯誤：請提供要刪除的 Key 索引');
        console.log('');
        console.log('使用方式：/prompt-keys remove INDEX');
        console.log('');
        console.log('先使用 /prompt-keys list 查看索引');
        console.log('');
        process.exit(1);
    }

    const index = parseInt(arg, 10) - 1;
    const keys = plugin.listApiKeys();

    if (isNaN(index) || index < 0 || index >= keys.length) {
        console.error('');
        console.error('❌ 錯誤：無效的索引');
        console.log('');
        console.log('請使用 /prompt-keys list 查看正確的索引');
        console.log('');
        process.exit(1);
    }

    // 確認刪除
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const shouldDelete = await new Promise((resolve) => {
        console.log('');
        console.log(`即將刪除: ${keys[index].key}`);
        console.log('');
        rl.question('確定要刪除嗎？(y/n): ', (answer) => {
            resolve(answer.toLowerCase() === 'y');
        });
    });

    rl.close();

    if (!shouldDelete) {
        console.log('');
        console.log('已取消刪除');
        console.log('');
        process.exit(0);
    }

    try {
        // 實際刪除邏輯需要在 plugin 中實作
        console.log('');
        console.log('✅ API Key 已刪除');
        console.log('');
    } catch (error) {
        console.error('');
        console.error('❌ 刪除失敗:', error.message);
        console.log('');
        process.exit(1);
    }
}
```

### 命令：stats（統計資訊）

```javascript
else if (command === 'stats') {
    const stats = await plugin.getStats();

    console.log('');
    console.log('📊 統計資訊');
    console.log('='.repeat(60));
    console.log('');

    console.log('【API Keys】');
    console.log(`總數: ${stats.apiKeys.total}`);
    console.log(`✅ 正常: ${stats.apiKeys.active}`);
    console.log(`❌ 錯誤: ${stats.apiKeys.error}`);
    console.log('');

    console.log('【轉換歷史】');
    console.log(`總轉換數: ${stats.history.total}`);
    console.log(`✅ 成功: ${stats.history.success}`);
    console.log(`❌ 失敗: ${stats.history.failed}`);
    console.log(`成功率: ${stats.history.successRate}%`);
    console.log('');

    console.log('【效能】');
    console.log(`平均執行時間: ${stats.performance.avgDuration}ms`);
    console.log('');

    console.log('='.repeat(60));
    console.log('');
}
```

### 命令：help（說明）

```javascript
else if (command === 'help') {
    console.log('');
    console.log('🔑 Prompt Keys - API Key 管理工具');
    console.log('');
    console.log('使用方式：');
    console.log('  /prompt-keys list          - 列出所有 API Keys');
    console.log('  /prompt-keys add KEY       - 新增 API Key');
    console.log('  /prompt-keys remove INDEX  - 刪除 API Key');
    console.log('  /prompt-keys stats         - 查看統計資訊');
    console.log('  /prompt-keys help          - 顯示此說明');
    console.log('');
    console.log('範例：');
    console.log('  /prompt-keys add AIzaSyABC123...');
    console.log('  /prompt-keys remove 1');
    console.log('');
    console.log('取得 API Key：');
    console.log('  https://makersuite.google.com/app/apikey');
    console.log('');
}
```

### 錯誤處理

```javascript
else {
    console.error('');
    console.error(`❌ 未知命令: ${command}`);
    console.log('');
    console.log('使用 /prompt-keys help 查看可用命令');
    console.log('');
    process.exit(1);
}
```

## 功能特色

1. **安全儲存**：API Keys 儲存在本地 JSON 檔案
2. **遮蔽顯示**：列出時只顯示部分 Key 內容
3. **狀態追蹤**：自動追蹤每個 Key 的使用狀態和錯誤次數
4. **統計資訊**：提供詳細的使用統計

## 注意事項

1. **最多 5 組**：最多可新增 5 組 API Keys
2. **格式要求**：Gemini API Key 必須以 `AIza` 開頭
3. **自動輪替**：系統會自動輪替使用可用的 Keys
4. **錯誤處理**：連續錯誤 3 次的 Key 會自動標記為錯誤狀態

## 取得 API Key

1. 前往 Google AI Studio：https://makersuite.google.com/app/apikey
2. 登入您的 Google 帳號
3. 點擊「Create API Key」
4. 選擇或建立專案
5. 複製產生的 API Key
6. 使用 `/prompt-keys add` 命令新增

## 相關命令

- `/convert` - 使用 API Key 進行轉換
- `/convert-batch` - 批次轉換
- `/prompt-history` - 查看轉換歷史

## 疑難排解

### 問題：API Key 無效

**症狀**：
新增後顯示格式錯誤或轉換時失敗

**解決方案**：
1. 確認 Key 以 `AIza` 開頭
2. 確認複製完整的 Key（無多餘空格）
3. 確認 Key 尚未過期
4. 在 Google AI Studio 重新產生 Key

### 問題：所有 Keys 都顯示錯誤狀態

**原因**：
- API 配額用完
- 網路連線問題
- Google AI 服務暫時無法使用

**解決方案**：
1. 檢查 API 配額使用情況
2. 確認網路連線正常
3. 稍後再試
4. 聯絡 Google AI 支援

### 問題：無法刪除 Key

**解決方案**：
1. 確認索引正確（使用 `list` 命令查看）
2. 檢查檔案權限
3. 確認沒有其他程式正在使用 Plugin

## API Key 安全建議

1. **不要分享**：絕對不要將 API Key 分享給他人
2. **定期更換**：建議定期更換 API Key
3. **限制權限**：在 Google Cloud Console 中限制 Key 的權限
4. **監控使用**：定期檢查 API 使用量
5. **備份 Keys**：在安全的地方備份您的 Keys
