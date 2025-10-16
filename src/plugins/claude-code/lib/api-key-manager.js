/**
 * 統一 API Key 管理模組
 * 提供統一的 API Key 儲存、讀取、加密機制
 * 作為 index.html 和 Plugin 的共用模組
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class UnifiedApiKeyManager {
    constructor(dataFilePath = null) {
        // 預設儲存路徑
        this.dataFilePath = dataFilePath || path.join(__dirname, '..', 'data', 'api-keys.json');
        this.keys = [];
        this.maxKeys = 5;
        this.currentIndex = 0;
        this.initialized = false;

        // 加密設定
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.saltLength = 64;
        this.tagLength = 16;
    }

    /**
     * 初始化管理器
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // 確保目錄存在
            const dirPath = path.dirname(this.dataFilePath);
            await fs.mkdir(dirPath, { recursive: true });

            // 載入 API Keys
            await this.loadKeys();

            this.initialized = true;
            console.log('[UnifiedApiKeyManager] 初始化完成');
        } catch (error) {
            console.error('[UnifiedApiKeyManager] 初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 載入 API Keys
     */
    async loadKeys() {
        try {
            const data = await fs.readFile(this.dataFilePath, 'utf-8');
            const keysData = JSON.parse(data);

            // 解密所有 Keys
            this.keys = [];
            for (const encryptedKey of keysData.keys || []) {
                try {
                    const decryptedKey = await this.decrypt(encryptedKey.encrypted);
                    this.keys.push({
                        id: encryptedKey.id,
                        key: decryptedKey,
                        status: encryptedKey.status || 'active',
                        lastUsed: encryptedKey.lastUsed || null,
                        errorCount: encryptedKey.errorCount || 0,
                        createdAt: encryptedKey.createdAt || Date.now(),
                        usageCount: encryptedKey.usageCount || 0
                    });
                } catch (decryptError) {
                    console.error('[UnifiedApiKeyManager] 解密失敗:', decryptError);
                }
            }

            console.log(`[UnifiedApiKeyManager] 已載入 ${this.keys.length} 組 API Keys`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 檔案不存在，建立空檔案
                this.keys = [];
                await this.saveKeys();
                console.log('[UnifiedApiKeyManager] 建立新的 API Keys 檔案');
            } else {
                throw error;
            }
        }
    }

    /**
     * 儲存 API Keys
     */
    async saveKeys() {
        try {
            // 加密所有 Keys
            const encryptedKeys = [];
            for (const keyObj of this.keys) {
                const encrypted = await this.encrypt(keyObj.key);
                encryptedKeys.push({
                    id: keyObj.id,
                    encrypted: encrypted,
                    status: keyObj.status,
                    lastUsed: keyObj.lastUsed,
                    errorCount: keyObj.errorCount,
                    createdAt: keyObj.createdAt,
                    usageCount: keyObj.usageCount
                });
            }

            const data = {
                keys: encryptedKeys,
                maxKeys: this.maxKeys,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2));
            console.log('[UnifiedApiKeyManager] API Keys 已儲存');
            return true;
        } catch (error) {
            console.error('[UnifiedApiKeyManager] 儲存失敗:', error);
            return false;
        }
    }

    /**
     * 加密 API Key
     */
    async encrypt(plaintext) {
        return new Promise((resolve, reject) => {
            try {
                // 生成隨機 salt 和 IV
                const salt = crypto.randomBytes(this.saltLength);
                const iv = crypto.randomBytes(this.ivLength);

                // 從密碼派生金鑰（使用固定密碼，實際應用應使用使用者密碼）
                const key = crypto.pbkdf2Sync('prompt-to-context-secret', salt, 100000, this.keyLength, 'sha512');

                // 加密
                const cipher = crypto.createCipheriv(this.algorithm, key, iv);
                let encrypted = cipher.update(plaintext, 'utf8', 'base64');
                encrypted += cipher.final('base64');

                // 取得驗證標籤
                const tag = cipher.getAuthTag();

                // 組合結果：salt + iv + tag + encrypted
                const result = {
                    salt: salt.toString('base64'),
                    iv: iv.toString('base64'),
                    tag: tag.toString('base64'),
                    data: encrypted
                };

                resolve(JSON.stringify(result));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 解密 API Key
     */
    async decrypt(encryptedData) {
        return new Promise((resolve, reject) => {
            try {
                const parsed = JSON.parse(encryptedData);

                // 解析組件
                const salt = Buffer.from(parsed.salt, 'base64');
                const iv = Buffer.from(parsed.iv, 'base64');
                const tag = Buffer.from(parsed.tag, 'base64');
                const encrypted = parsed.data;

                // 從密碼派生金鑰
                const key = crypto.pbkdf2Sync('prompt-to-context-secret', salt, 100000, this.keyLength, 'sha512');

                // 解密
                const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
                decipher.setAuthTag(tag);

                let decrypted = decipher.update(encrypted, 'base64', 'utf8');
                decrypted += decipher.final('utf8');

                resolve(decrypted);
            } catch (error) {
                reject(error);
            }
        });
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

        try {
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
                console.log('[UnifiedApiKeyManager] API Key 已新增:', keyId);
            } else {
                result.error = '儲存失敗';
                this.keys.pop(); // 回滾
            }
        } catch (error) {
            console.error('[UnifiedApiKeyManager] 新增失敗:', error);
            result.error = error.message;
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

        try {
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
                console.log('[UnifiedApiKeyManager] API Key 已刪除:', keyId);
            } else {
                result.error = '儲存失敗';
            }
        } catch (error) {
            console.error('[UnifiedApiKeyManager] 刪除失敗:', error);
            result.error = error.message;
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
                // 更新最後使用時間和使用次數
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
            console.warn(`[UnifiedApiKeyManager] API Key 已標記為錯誤: ${keyId} (${errorType})`);
        }

        // 如果錯誤次數過多，也標記為不可用
        if (key.errorCount >= 3) {
            key.status = 'error';
            console.warn(`[UnifiedApiKeyManager] API Key 因錯誤過多已停用: ${keyId}`);
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
        console.log('[UnifiedApiKeyManager] API Key 狀態已重設:', keyId);

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
     * 取得統計資訊
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
     * 產生唯一的 Key ID
     */
    generateKeyId() {
        return 'key_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
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
     * 取得原始 Key（用於 API 呼叫）
     */
    getRawKey(keyId) {
        const key = this.keys.find(k => k.id === keyId);
        return key ? key.key : null;
    }
}

module.exports = UnifiedApiKeyManager;
