#!/usr/bin/env node

/**
 * Claude Code Plugin CLI
 * 提供命令列介面操作 API Keys
 */

const UnifiedApiKeyManager = require('./lib/api-key-manager');
const path = require('path');

class PluginCLI {
    constructor() {
        this.manager = new UnifiedApiKeyManager();
    }

    async run(args) {
        const command = args[0];
        const param = args[1];

        try {
            await this.manager.initialize();

            switch (command) {
                case 'list':
                    await this.listKeys();
                    break;
                case 'add':
                    await this.addKey(param);
                    break;
                case 'remove':
                    await this.removeKey(param);
                    break;
                case 'stats':
                    await this.showStats();
                    break;
                case 'reset':
                    await this.resetKey(param);
                    break;
                default:
                    this.showUsage();
            }
        } catch (error) {
            console.error('❌ 錯誤:', error.message);
            process.exit(1);
        }
    }

    async listKeys() {
        const keys = this.manager.getAllKeys();
        const stats = this.manager.getStats();

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

                console.log(`${index + 1}. ${key.key} (${statusIcon} ${statusText})`);
                console.log(`   - Key ID: ${key.id}`);
                console.log(`   - 新增時間: ${this.formatTimestamp(key.createdAt)}`);
                console.log(`   - 最後使用: ${key.lastUsed ? this.formatTimestamp(key.lastUsed) : '未使用'}`);
                console.log(`   - 使用次數: ${key.usageCount || 0} 次`);
                console.log(`   - 錯誤次數: ${key.errorCount || 0} 次`);
                console.log('');
            });
        }

        console.log('='.repeat(60));
        console.log(`總計: ${stats.total} 個 Keys | ✅ ${stats.active} 正常 | ❌ ${stats.error} 錯誤`);
    }

    async addKey(apiKey) {
        if (!apiKey) {
            console.error('❌ 錯誤: 請提供 API Key');
            console.log('');
            console.log('使用方式：');
            console.log('/prompt-keys add YOUR_API_KEY');
            process.exit(1);
        }

        const result = await this.manager.addKey(apiKey);

        if (result.success) {
            console.log('✅ API Key 已新增！');
            console.log('');
            console.log(`Key: ${this.manager.maskKey(apiKey)}`);
            console.log(`Key ID: ${result.keyId}`);
            console.log('');
            console.log('現在可以使用 /convert 命令進行轉換');
        } else {
            console.error('❌ 新增失敗:', result.error);
            process.exit(1);
        }
    }

    async removeKey(keyId) {
        if (!keyId) {
            console.error('❌ 錯誤: 請提供 Key ID');
            console.log('');
            console.log('使用方式：');
            console.log('/prompt-keys remove KEY_ID');
            console.log('');
            console.log('提示：先使用 /prompt-keys list 查看所有 Key ID');
            process.exit(1);
        }

        // 顯示要刪除的 Key 資訊
        const keys = this.manager.getAllKeys();
        const targetKey = keys.find(k => k.id === keyId);

        if (!targetKey) {
            console.error('❌ 錯誤: 找不到指定的 Key ID');
            process.exit(1);
        }

        console.log('即將刪除以下 API Key：');
        console.log(`Key: ${targetKey.key}`);
        console.log(`Key ID: ${targetKey.id}`);
        console.log('');

        const result = await this.manager.removeKey(keyId);

        if (result.success) {
            console.log('✅ API Key 已刪除');
        } else {
            console.error('❌ 刪除失敗:', result.error);
            process.exit(1);
        }
    }

    async resetKey(keyId) {
        if (!keyId) {
            console.error('❌ 錯誤: 請提供 Key ID');
            console.log('');
            console.log('使用方式：');
            console.log('/prompt-keys reset KEY_ID');
            process.exit(1);
        }

        const success = await this.manager.resetKeyStatus(keyId);

        if (success) {
            console.log('✅ API Key 狀態已重設為正常');
        } else {
            console.error('❌ 重設失敗');
            process.exit(1);
        }
    }

    async showStats() {
        const stats = this.manager.getStats();
        const keys = this.manager.getAllKeys();

        console.log('📊 統計資訊');
        console.log('='.repeat(60));
        console.log('');

        console.log('【API Keys】');
        console.log(`總數: ${stats.total}`);
        console.log(`✅ 正常: ${stats.active}`);
        console.log(`❌ 錯誤: ${stats.error}`);
        console.log('');

        if (keys.length > 0) {
            console.log('【使用統計】');
            const totalUsage = keys.reduce((sum, k) => sum + (k.usageCount || 0), 0);
            const totalErrors = keys.reduce((sum, k) => sum + (k.errorCount || 0), 0);
            const successRate = totalUsage > 0
                ? (((totalUsage - totalErrors) / totalUsage) * 100).toFixed(1)
                : 0;

            console.log(`總使用次數: ${totalUsage}`);
            console.log(`總錯誤次數: ${totalErrors}`);
            console.log(`成功率: ${successRate}%`);
            console.log('');

            // 顯示最近使用的 Keys
            const recentKeys = keys
                .filter(k => k.lastUsed)
                .sort((a, b) => b.lastUsed - a.lastUsed)
                .slice(0, 3);

            if (recentKeys.length > 0) {
                console.log('【最近使用的 Keys】');
                recentKeys.forEach((key, index) => {
                    console.log(`${index + 1}. ${key.key}`);
                    console.log(`   最後使用: ${this.formatTimestamp(key.lastUsed)}`);
                    console.log(`   使用次數: ${key.usageCount || 0} 次`);
                });
                console.log('');
            }
        }

        console.log('='.repeat(60));
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return '未知';

        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    showUsage() {
        console.log('Claude Code Plugin CLI');
        console.log('');
        console.log('使用方式：');
        console.log('  node cli.js <command> [options]');
        console.log('');
        console.log('可用命令：');
        console.log('  list              列出所有 API Keys');
        console.log('  add <key>         新增 API Key');
        console.log('  remove <key_id>   刪除 API Key');
        console.log('  reset <key_id>    重設 Key 狀態為正常');
        console.log('  stats             顯示統計資訊');
        console.log('');
        console.log('範例：');
        console.log('  node cli.js list');
        console.log('  node cli.js add AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        console.log('  node cli.js remove key_1234567890_abcdef');
        console.log('  node cli.js stats');
    }
}

// 執行 CLI
if (require.main === module) {
    const cli = new PluginCLI();
    const args = process.argv.slice(2);

    cli.run(args).catch(error => {
        console.error('❌ 執行失敗:', error);
        process.exit(1);
    });
}

module.exports = PluginCLI;
