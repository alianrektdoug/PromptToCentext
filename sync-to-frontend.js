#!/usr/bin/env node

/**
 * 安全的前端同步腳本
 * 僅在命令列顯示同步指令,不產生包含明文 API Keys 的檔案
 */

const UnifiedApiKeyManager = require('./src/plugins/claude-code/lib/api-key-manager.js');

async function syncToFrontend() {
    console.log('🔄 API Keys 同步工具\n');

    try {
        // 初始化後端 API Key 管理器
        const manager = new UnifiedApiKeyManager();
        await manager.initialize();

        const keys = manager.keys;

        if (keys.length === 0) {
            console.log('⚠️  後端沒有 API Keys');
            return;
        }

        console.log(`📊 找到 ${keys.length} 組 API Keys\n`);

        // 統計資訊
        const stats = manager.getStats();
        console.log('📈 統計資訊:');
        console.log(`   總數: ${stats.total}`);
        console.log(`   ✅ 正常: ${stats.active}`);
        console.log(`   ❌ 錯誤: ${stats.error}\n`);

        // 顯示遮蔽後的 Keys
        console.log('🔑 API Keys 清單:');
        keys.forEach((k, index) => {
            const statusIcon = k.status === 'active' ? '✅' : '❌';
            console.log(`   ${index + 1}. ${manager.maskKey(k.key)} ${statusIcon}`);
        });
        console.log('');

        // 準備前端格式的資料
        const frontendData = {
            keys: keys.map(k => ({
                id: k.id,
                key: k.key,
                status: k.status,
                lastUsed: k.lastUsed,
                errorCount: k.errorCount,
                createdAt: k.createdAt,
                usageCount: k.usageCount
            })),
            maxKeys: manager.maxKeys,
            updatedAt: new Date().toISOString()
        };

        // 輸出 JavaScript 程式碼
        console.log('📋 請在瀏覽器 Console 中執行以下程式碼:\n');
        console.log('━'.repeat(80));
        console.log('// 將後端 API Keys 同步到前端 localStorage');
        console.log('(function() {');
        console.log('    const data = ' + JSON.stringify(frontendData, null, 4) + ';');
        console.log('    localStorage.setItem("prompt_to_context_api_keys_bridge", JSON.stringify(data));');
        console.log('    console.log("✅ 已同步 " + data.keys.length + " 組 API Keys");');
        console.log('    location.reload(); // 重新載入頁面');
        console.log('})();');
        console.log('━'.repeat(80));
        console.log('');

        console.log('📖 使用步驟:');
        console.log('   1. 開啟瀏覽器並訪問 index.html');
        console.log('   2. 按 F12 開啟開發者工具');
        console.log('   3. 切換到 Console 標籤');
        console.log('   4. 複製上方程式碼並貼上執行');
        console.log('   5. 頁面會自動重新載入並顯示 API Keys\n');

        console.log('⚠️  安全提醒:');
        console.log('   - 上述程式碼包含明文 API Keys');
        console.log('   - 請勿將程式碼儲存到檔案或分享給他人');
        console.log('   - 執行後請清除 Console 歷史記錄\n');

    } catch (error) {
        console.error('❌ 同步失敗:', error.message);
        process.exit(1);
    }
}

// 執行同步
if (require.main === module) {
    syncToFrontend().catch(error => {
        console.error('執行失敗:', error);
        process.exit(1);
    });
}

module.exports = syncToFrontend;
