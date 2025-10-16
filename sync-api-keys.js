#!/usr/bin/env node

/**
 * 同步 API Keys 腳本
 * 將 localStorage 的 API Keys 同步到統一的 JSON 檔案
 */

const fs = require('fs').promises;
const path = require('path');
const UnifiedApiKeyManager = require('./src/plugins/claude-code/lib/api-key-manager');

async function syncApiKeys() {
    console.log('========================================');
    console.log('  API Keys 同步工具');
    console.log('========================================');
    console.log('');

    try {
        // 讀取瀏覽器端的 localStorage 資料（從提示輸入）
        console.log('請複製瀏覽器 Console 中 localStorage 的 API Keys 資料');
        console.log('在瀏覽器 Console 執行:');
        console.log('  JSON.stringify(JSON.parse(localStorage.getItem("api_keys_sync_data")))');
        console.log('');
        console.log('然後貼上結果（按 Ctrl+D 結束輸入）：');
        console.log('');

        // 從標準輸入讀取
        const chunks = [];
        for await (const chunk of process.stdin) {
            chunks.push(chunk);
        }

        const input = Buffer.concat(chunks).toString().trim();

        if (!input) {
            console.error('❌ 錯誤：未提供資料');
            process.exit(1);
        }

        // 解析資料
        const data = JSON.parse(input);
        const keys = data.keys || [];

        console.log(`\n找到 ${keys.length} 組 API Keys`);
        console.log('');

        // 初始化統一管理器
        const manager = new UnifiedApiKeyManager();
        await manager.initialize();

        // 清除舊 Keys
        await manager.clearAll();
        console.log('已清除舊的 API Keys');

        // 新增所有 Keys
        let successCount = 0;
        for (const key of keys) {
            if (key.key) {
                const result = await manager.addKey(key.key);
                if (result.success) {
                    successCount++;
                    console.log(`✅ 已新增: ${manager.maskKey(key.key)}`);
                } else {
                    console.error(`❌ 新增失敗: ${result.error}`);
                }
            }
        }

        console.log('');
        console.log('========================================');
        console.log(`同步完成！成功同步 ${successCount}/${keys.length} 組 Keys`);
        console.log('========================================');

    } catch (error) {
        console.error('');
        console.error('❌ 同步失敗:', error.message);
        console.error('');
        console.error('請確認：');
        console.error('1. 資料格式正確（JSON 格式）');
        console.error('2. API Keys 格式正確（以 AIza 開頭）');
        process.exit(1);
    }
}

// 執行同步
if (require.main === module) {
    syncApiKeys().catch(error => {
        console.error('執行失敗:', error);
        process.exit(1);
    });
}

module.exports = syncApiKeys;
