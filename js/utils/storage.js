/**
 * LocalStorage 管理工具
 * 提供統一的 localStorage 存取介面
 */

const StorageManager = {
    /**
     * 儲存鍵名常數
     */
    KEYS: {
        API_KEYS: 'prompt_to_context_api_keys',
        TEMPLATES: 'prompt_to_context_templates',
        HISTORY: 'prompt_to_context_history',
        SETTINGS: 'prompt_to_context_settings',
        THEME: 'prompt_to_context_theme'
    },

    /**
     * 取得資料
     * @param {string} key - 儲存鍵名
     * @param {*} defaultValue - 預設值
     * @returns {*} 儲存的資料或預設值
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`[Storage] 讀取失敗 (${key}):`, error);
            return defaultValue;
        }
    },

    /**
     * 儲存資料
     * @param {string} key - 儲存鍵名
     * @param {*} value - 要儲存的資料
     * @returns {boolean} 是否成功
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[Storage] 儲存失敗 (${key}):`, error);

            // 檢查是否超出配額
            if (error.name === 'QuotaExceededError') {
                console.warn('[Storage] LocalStorage 配額已滿');
            }

            return false;
        }
    },

    /**
     * 移除資料
     * @param {string} key - 儲存鍵名
     * @returns {boolean} 是否成功
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`[Storage] 移除失敗 (${key}):`, error);
            return false;
        }
    },

    /**
     * 清除所有資料
     * @returns {boolean} 是否成功
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('[Storage] 清除失敗:', error);
            return false;
        }
    },

    /**
     * 檢查鍵是否存在
     * @param {string} key - 儲存鍵名
     * @returns {boolean} 是否存在
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    /**
     * 取得所有鍵名
     * @returns {string[]} 所有鍵名
     */
    keys() {
        return Object.keys(localStorage);
    },

    /**
     * 取得儲存空間使用情況
     * @returns {Object} 使用資訊
     */
    getUsage() {
        let total = 0;
        const details = {};

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = localStorage[key].length;
                total += size;
                details[key] = size;
            }
        }

        // 估計配額（通常是 5-10MB）
        const estimatedQuota = 5 * 1024 * 1024; // 5MB
        const usagePercent = ((total / estimatedQuota) * 100).toFixed(2);

        return {
            totalBytes: total,
            totalKB: (total / 1024).toFixed(2),
            totalMB: (total / (1024 * 1024)).toFixed(2),
            estimatedQuota: estimatedQuota,
            usagePercent: usagePercent,
            details: details
        };
    },

    /**
     * 匯出所有資料
     * @returns {Object} 所有資料
     */
    exportAll() {
        const data = {};
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    data[key] = JSON.parse(localStorage[key]);
                } catch (e) {
                    data[key] = localStorage[key];
                }
            }
        }
        return data;
    },

    /**
     * 匯入資料
     * @param {Object} data - 要匯入的資料
     * @param {boolean} merge - 是否合併現有資料
     * @returns {boolean} 是否成功
     */
    importAll(data, merge = false) {
        try {
            if (!merge) {
                localStorage.clear();
            }

            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    this.set(key, data[key]);
                }
            }

            return true;
        } catch (error) {
            console.error('[Storage] 匯入失敗:', error);
            return false;
        }
    },

    /**
     * 取得 API Keys
     * @returns {Array} API Keys 陣列
     */
    getApiKeys() {
        return this.get(this.KEYS.API_KEYS, []);
    },

    /**
     * 儲存 API Keys
     * @param {Array} keys - API Keys 陣列
     * @returns {boolean} 是否成功
     */
    setApiKeys(keys) {
        return this.set(this.KEYS.API_KEYS, keys);
    },

    /**
     * 取得範本
     * @returns {Array} 範本陣列
     */
    getTemplates() {
        return this.get(this.KEYS.TEMPLATES, []);
    },

    /**
     * 儲存範本
     * @param {Array} templates - 範本陣列
     * @returns {boolean} 是否成功
     */
    setTemplates(templates) {
        return this.set(this.KEYS.TEMPLATES, templates);
    },

    /**
     * 取得歷史記錄
     * @returns {Array} 歷史記錄陣列
     */
    getHistory() {
        return this.get(this.KEYS.HISTORY, []);
    },

    /**
     * 儲存歷史記錄
     * @param {Array} history - 歷史記錄陣列
     * @returns {boolean} 是否成功
     */
    setHistory(history) {
        return this.set(this.KEYS.HISTORY, history);
    },

    /**
     * 取得設定
     * @returns {Object} 設定物件
     */
    getSettings() {
        return this.get(this.KEYS.SETTINGS, {
            theme: 'light',
            autoSave: true,
            maxHistoryItems: 100,
            apiTimeout: 30000,
            enableAnalytics: false
        });
    },

    /**
     * 儲存設定
     * @param {Object} settings - 設定物件
     * @returns {boolean} 是否成功
     */
    setSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    },

    /**
     * 取得主題
     * @returns {string} 主題名稱
     */
    getTheme() {
        return this.get(this.KEYS.THEME, 'light');
    },

    /**
     * 儲存主題
     * @param {string} theme - 主題名稱
     * @returns {boolean} 是否成功
     */
    setTheme(theme) {
        return this.set(this.KEYS.THEME, theme);
    }
};

// 在載入時檢查 localStorage 可用性
(function checkStorageAvailability() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('[Storage] LocalStorage 可用');
    } catch (error) {
        console.error('[Storage] LocalStorage 不可用:', error);
        alert('您的瀏覽器不支援 LocalStorage 或已被停用，部分功能將無法正常運作。');
    }
})();
