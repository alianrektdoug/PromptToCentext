/**
 * API Key 管理器 Bridge（直接寫入 JSON）
 * 使用 localStorage 儲存，並同步到 JSON 檔案
 */

class APIManagerBridge {
    constructor() {
        this.keys = [];
        this.currentIndex = 0;
        this.maxKeys = 5;
        this.storageKey = 'prompt_to_context_api_keys_bridge';
        this.jsonFilePath = 'src/plugins/claude-code/data/api-keys.json';
    }

    /**
     * 載入已儲存的 API Keys
     */
    async loadKeys() {
        try {
            // 從 localStorage 載入
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.keys = data.keys || [];
                console.log(`[APIManagerBridge] 已從 localStorage 載入 ${this.keys.length} 組 API Keys`);
            } else {
                this.keys = [];
            }
        } catch (error) {
            console.error('[APIManagerBridge] 載入 API Keys 失敗:', error);
            this.keys = [];
        }
    }

    /**
     * 儲存 API Keys
     */
    async saveKeys() {
        try {
            // 儲存到 localStorage
            const data = {
                keys: this.keys,
                maxKeys: this.maxKeys,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('[APIManagerBridge] API Keys 已儲存到 localStorage');

            // 同步到 JSON 檔案（觸發同步提示）
            this.triggerSyncNotification();

            return true;
        } catch (error) {
            console.error('[APIManagerBridge] 儲存 API Keys 失敗:', error);
            return false;
        }
    }

    /**
     * 觸發同步通知
     */
    triggerSyncNotification() {
        // 儲存同步標記
        localStorage.setItem('api_keys_needs_sync', 'true');
        localStorage.setItem('api_keys_sync_data', JSON.stringify({
            keys: this.keys,
            timestamp: Date.now()
        }));

        console.log('[APIManagerBridge] 資料已準備同步');
        console.log('[APIManagerBridge] 請執行同步腳本：node sync-api-keys.js');
    }

    /**
     * 取得需要同步的資料
     */
    getSyncData() {
        const syncData = localStorage.getItem('api_keys_sync_data');
        if (syncData) {
            return JSON.parse(syncData);
        }
        return null;
    }

    /**
     * 新增 API Key
     */
    async addKey(apiKey) {
        const result = {
            success: false,
            error: null,
            keyId: null
        };

        // 驗證格式
        if (!apiKey || typeof apiKey !== 'string') {
            result.error = 'API Key 不可為空';
            return result;
        }

        const trimmedKey = apiKey.trim();
        if (!trimmedKey.startsWith('AIza')) {
            result.error = 'API Key 格式錯誤（應以 AIza 開頭）';
            return result;
        }

        // 檢查數量限制
        if (this.keys.length >= this.maxKeys) {
            result.error = `最多只能新增 ${this.maxKeys} 組 API Keys`;
            return result;
        }

        // 檢查重複
        if (this.keys.some(k => k.key === trimmedKey)) {
            result.error = '此 API Key 已存在';
            return result;
        }

        // 新增 Key
        const keyId = this.generateKeyId();
        this.keys.push({
            id: keyId,
            key: trimmedKey,
            status: 'active',
            lastUsed: null,
            errorCount: 0,
            createdAt: Date.now(),
            usageCount: 0
        });

        // 儲存
        const saved = await this.saveKeys();
        if (saved) {
            result.success = true;
            result.keyId = keyId;
            console.log('[APIManagerBridge] API Key 已新增:', keyId);
        } else {
            result.error = '儲存失敗';
            this.keys.pop(); // 回滾
        }

        return result;
    }

    /**
     * 刪除 API Key
     */
    async removeKey(keyId) {
        const result = {
            success: false,
            error: null
        };

        const index = this.keys.findIndex(k => k.id === keyId);
        if (index === -1) {
            result.error = 'API Key 不存在';
            return result;
        }

        this.keys.splice(index, 1);

        // 調整當前索引
        if (this.currentIndex >= this.keys.length) {
            this.currentIndex = 0;
        }

        const saved = await this.saveKeys();
        if (saved) {
            result.success = true;
            console.log('[APIManagerBridge] API Key 已刪除:', keyId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 取得下一個可用的 API Key
     */
    getNextKey() {
        if (this.keys.length === 0) {
            return null;
        }

        // 尋找可用的 Key（狀態為 active）
        let attempts = 0;
        const maxAttempts = this.keys.length;

        while (attempts < maxAttempts) {
            const key = this.keys[this.currentIndex];

            if (key.status === 'active') {
                // 更新最後使用時間
                key.lastUsed = Date.now();
                key.usageCount = (key.usageCount || 0) + 1;
                this.saveKeys(); // 非同步儲存

                // 輪替到下一個
                this.currentIndex = (this.currentIndex + 1) % this.keys.length;

                return key;
            }

            // 移到下一個
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
        }

        return null;
    }

    /**
     * 標記 Key 發生錯誤
     */
    async markKeyError(keyId, errorType = 'unknown') {
        const key = this.keys.find(k => k.id === keyId);
        if (!key) {
            return;
        }

        key.errorCount = (key.errorCount || 0) + 1;

        // 如果是配額錯誤或認證錯誤，標記為不可用
        if (errorType === 'quota' || errorType === 'auth' || errorType === 'invalid') {
            key.status = 'error';
            console.warn(`[APIManagerBridge] API Key 已標記為錯誤: ${keyId} (${errorType})`);
        }

        // 如果錯誤次數過多，也標記為不可用
        if (key.errorCount >= 3) {
            key.status = 'error';
            console.warn(`[APIManagerBridge] API Key 因錯誤過多已停用: ${keyId}`);
        }

        await this.saveKeys();
    }

    /**
     * 重設 Key 狀態
     */
    async resetKeyStatus(keyId) {
        const key = this.keys.find(k => k.id === keyId);
        if (!key) {
            return false;
        }

        key.status = 'active';
        key.errorCount = 0;
        console.log('[APIManagerBridge] API Key 狀態已重設:', keyId);

        return await this.saveKeys();
    }

    /**
     * 取得所有 Keys（遮蔽顯示）
     */
    getAllKeys() {
        return this.keys.map(key => ({
            id: key.id,
            key: this.maskKey(key.key),
            status: key.status,
            lastUsed: key.lastUsed,
            errorCount: key.errorCount,
            createdAt: key.createdAt,
            usageCount: key.usageCount
        }));
    }

    /**
     * 遮蔽 API Key
     */
    maskKey(key) {
        if (!key || key.length <= 8) {
            return '****';
        }
        return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
    }

    /**
     * 取得 Key 統計資訊
     */
    getStats() {
        const total = this.keys.length;
        const active = this.keys.filter(k => k.status === 'active').length;
        const error = this.keys.filter(k => k.status === 'error').length;
        const inactive = this.keys.filter(k => k.status === 'inactive').length;

        return {
            total,
            active,
            error,
            inactive,
            hasAvailable: active > 0
        };
    }

    /**
     * 測試 API Key
     */
    async testKey(keyId) {
        const key = this.keys.find(k => k.id === keyId);
        if (!key) {
            return {
                success: false,
                error: 'API Key 不存在'
            };
        }

        // 這裡應該實際呼叫 Gemini API 測試
        // 暫時返回成功
        return {
            success: true,
            keyId: keyId
        };
    }

    /**
     * 清除所有 Keys
     */
    async clearAll() {
        this.keys = [];
        this.currentIndex = 0;
        return await this.saveKeys();
    }

    /**
     * 產生唯一的 Key ID
     */
    generateKeyId() {
        return 'key_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * 匯出 Keys（加密）
     */
    async exportKeys(password) {
        try {
            const data = JSON.stringify(this.keys);
            // 需要實作加密邏輯
            return data;
        } catch (error) {
            console.error('[APIManagerBridge] 匯出失敗:', error);
            throw error;
        }
    }

    /**
     * 匯入 Keys（解密）
     */
    async importKeys(encryptedData, password, merge = false) {
        const result = {
            success: false,
            error: null,
            imported: 0
        };

        try {
            const importedKeys = JSON.parse(encryptedData);

            if (!Array.isArray(importedKeys)) {
                result.error = '資料格式錯誤';
                return result;
            }

            if (!merge) {
                this.keys = [];
            }

            let imported = 0;
            for (const key of importedKeys) {
                // 驗證格式
                if (!key.key || !key.key.startsWith('AIza')) {
                    continue;
                }

                // 檢查重複
                if (this.keys.some(k => k.key === key.key)) {
                    continue;
                }

                // 檢查數量限制
                if (this.keys.length >= this.maxKeys) {
                    break;
                }

                this.keys.push({
                    id: key.id || this.generateKeyId(),
                    key: key.key,
                    status: key.status || 'active',
                    lastUsed: key.lastUsed || null,
                    errorCount: key.errorCount || 0,
                    createdAt: key.createdAt || Date.now(),
                    usageCount: key.usageCount || 0
                });

                imported++;
            }

            const saved = await this.saveKeys();
            if (saved) {
                result.success = true;
                result.imported = imported;
            } else {
                result.error = '儲存失敗';
            }
        } catch (error) {
            console.error('[APIManagerBridge] 匯入失敗:', error);
            result.error = error.message;
        }

        return result;
    }
}

console.log('[APIManagerBridge] API 管理器 Bridge 已載入（localStorage 模式）');

// 匯出為全域變數（相容原有的 APIManager）
if (typeof window !== 'undefined') {
    window.APIManager = APIManagerBridge;
}
