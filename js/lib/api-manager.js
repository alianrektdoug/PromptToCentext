/**
 * API Key 管理器
 * 管理多組 API Keys 的新增、刪除、輪替和驗證
 */

class APIManager {
    constructor() {
        this.keys = [];
        this.currentIndex = 0;
        this.maxKeys = 5;
        // 不在 constructor 中自動載入，由 App.init() 明確調用
    }

    /**
     * 載入已儲存的 API Keys
     */
    async loadKeys() {
        try {
            const encryptedKeys = StorageManager.getApiKeys();
            this.keys = [];

            for (const encryptedKey of encryptedKeys) {
                try {
                    const decrypted = await CryptoManager.simpleDecrypt(encryptedKey.encrypted);
                    this.keys.push({
                        id: encryptedKey.id,
                        key: decrypted,
                        status: encryptedKey.status || 'active',
                        lastUsed: encryptedKey.lastUsed || null,
                        errorCount: encryptedKey.errorCount || 0,
                        createdAt: encryptedKey.createdAt || Date.now()
                    });
                } catch (error) {
                    console.error('[APIManager] 解密 API Key 失敗:', error);
                }
            }

            console.log(`[APIManager] 已載入 ${this.keys.length} 組 API Keys`);
        } catch (error) {
            console.error('[APIManager] 載入 API Keys 失敗:', error);
            this.keys = [];
        }
    }

    /**
     * 儲存 API Keys
     */
    async saveKeys() {
        try {
            const encryptedKeys = [];

            for (const keyObj of this.keys) {
                const encrypted = await CryptoManager.simpleEncrypt(keyObj.key);
                encryptedKeys.push({
                    id: keyObj.id,
                    encrypted: encrypted,
                    status: keyObj.status,
                    lastUsed: keyObj.lastUsed,
                    errorCount: keyObj.errorCount,
                    createdAt: keyObj.createdAt
                });
            }

            const success = StorageManager.setApiKeys(encryptedKeys);
            if (success) {
                console.log('[APIManager] API Keys 已儲存');
            }
            return success;
        } catch (error) {
            console.error('[APIManager] 儲存 API Keys 失敗:', error);
            return false;
        }
    }

    /**
     * 新增 API Key
     * @param {string} apiKey - API Key
     * @returns {Object} 結果
     */
    async addKey(apiKey) {
        const result = {
            success: false,
            error: null,
            keyId: null
        };

        // 驗證格式
        const validation = Validators.validateApiKey(apiKey);
        if (!validation.valid) {
            result.error = validation.error;
            return result;
        }

        // 檢查數量限制
        if (this.keys.length >= this.maxKeys) {
            result.error = `最多只能新增 ${this.maxKeys} 組 API Keys`;
            return result;
        }

        // 檢查是否重複
        const trimmedKey = apiKey.trim();
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
            createdAt: Date.now()
        });

        // 儲存
        const saved = await this.saveKeys();
        if (saved) {
            result.success = true;
            result.keyId = keyId;
            console.log('[APIManager] API Key 已新增:', keyId);
        } else {
            result.error = '儲存失敗';
            this.keys.pop(); // 回滾
        }

        return result;
    }

    /**
     * 刪除 API Key
     * @param {string} keyId - Key ID
     * @returns {Object} 結果
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
            console.log('[APIManager] API Key 已刪除:', keyId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 取得下一個可用的 API Key
     * @returns {Object|null} Key 物件
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
                this.saveKeys(); // 非同步儲存，不等待

                // 輪替到下一個
                this.currentIndex = (this.currentIndex + 1) % this.keys.length;

                return key;
            }

            // 移到下一個
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
        }

        // 所有 Key 都不可用
        return null;
    }

    /**
     * 標記 Key 發生錯誤
     * @param {string} keyId - Key ID
     * @param {string} errorType - 錯誤類型
     */
    async markKeyError(keyId, errorType = 'unknown') {
        const key = this.keys.find(k => k.id === keyId);
        if (!key) {
            return;
        }

        key.errorCount++;

        // 如果是配額錯誤或認證錯誤，標記為不可用
        if (errorType === 'quota' || errorType === 'auth') {
            key.status = 'error';
            console.warn(`[APIManager] API Key 已標記為錯誤狀態: ${keyId} (${errorType})`);
        }

        // 如果錯誤次數過多，也標記為不可用
        if (key.errorCount >= 3) {
            key.status = 'error';
            console.warn(`[APIManager] API Key 因錯誤次數過多已停用: ${keyId}`);
        }

        await this.saveKeys();
    }

    /**
     * 重設 Key 狀態
     * @param {string} keyId - Key ID
     */
    async resetKeyStatus(keyId) {
        const key = this.keys.find(k => k.id === keyId);
        if (!key) {
            return false;
        }

        key.status = 'active';
        key.errorCount = 0;
        console.log('[APIManager] API Key 狀態已重設:', keyId);

        return await this.saveKeys();
    }

    /**
     * 取得所有 Keys（遮蔽顯示）
     * @returns {Array} Keys 陣列
     */
    getAllKeys() {
        return this.keys.map(key => ({
            id: key.id,
            key: CryptoManager.mask(key.key),
            status: key.status,
            lastUsed: key.lastUsed,
            errorCount: key.errorCount,
            createdAt: key.createdAt
        }));
    }

    /**
     * 取得 Key 統計資訊
     * @returns {Object} 統計資訊
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
     * @param {string} keyId - Key ID
     * @returns {Promise<Object>} 測試結果
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
     * @returns {string} Key ID
     */
    generateKeyId() {
        return 'key_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * 匯出 Keys（加密）
     * @returns {Promise<string>} Base64 編碼的加密資料
     */
    async exportKeys(password) {
        try {
            const data = JSON.stringify(this.keys);
            return await CryptoManager.encrypt(data, password);
        } catch (error) {
            console.error('[APIManager] 匯出失敗:', error);
            throw error;
        }
    }

    /**
     * 匯入 Keys（解密）
     * @param {string} encryptedData - 加密資料
     * @param {string} password - 密碼
     * @param {boolean} merge - 是否合併
     * @returns {Promise<Object>} 匯入結果
     */
    async importKeys(encryptedData, password, merge = false) {
        const result = {
            success: false,
            error: null,
            imported: 0
        };

        try {
            const decrypted = await CryptoManager.decrypt(encryptedData, password);
            const importedKeys = JSON.parse(decrypted);

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
                const validation = Validators.validateApiKey(key.key);
                if (!validation.valid) {
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
                    createdAt: key.createdAt || Date.now()
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
            console.error('[APIManager] 匯入失敗:', error);
            result.error = error.message;
        }

        return result;
    }
}

console.log('[APIManager] API 管理器已載入');
