/**
 * Prompt-to-Context Plugin 主模組
 * 提供提示詞轉換功能
 */

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

class PromptToContextPlugin {
    constructor() {
        this.config = null;
        this.apiKeys = [];
        this.currentKeyIndex = 0;
        this.baseDir = path.join(__dirname, '..');
        this.initialized = false;
    }

    /**
     * 初始化 Plugin
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // 載入配置
            await this.loadConfig();

            // 建立必要目錄
            await this.ensureDirectories();

            // 載入 API Keys
            await this.loadApiKeys();

            this.initialized = true;
            console.log('[PromptToContext] Plugin 初始化完成');
        } catch (error) {
            console.error('[PromptToContext] 初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 載入配置
     */
    async loadConfig() {
        const configPath = path.join(this.baseDir, 'config.json');
        const configData = await fs.readFile(configPath, 'utf-8');
        this.config = JSON.parse(configData);
    }

    /**
     * 確保必要目錄存在
     */
    async ensureDirectories() {
        const dirs = ['data', 'logs'];

        for (const dir of dirs) {
            const dirPath = path.join(this.baseDir, dir);
            try {
                await fs.access(dirPath);
            } catch {
                await fs.mkdir(dirPath, { recursive: true });
            }
        }
    }

    /**
     * 載入 API Keys
     */
    async loadApiKeys() {
        const keysPath = path.join(this.baseDir, this.config.storage.apiKeysFile);

        try {
            const data = await fs.readFile(keysPath, 'utf-8');
            const keysData = JSON.parse(data);
            this.apiKeys = keysData.keys || [];
            console.log(`[PromptToContext] 已載入 ${this.apiKeys.length} 組 API Keys`);
        } catch (error) {
            // 檔案不存在，建立空檔案
            this.apiKeys = [];
            await this.saveApiKeys();
        }
    }

    /**
     * 儲存 API Keys
     */
    async saveApiKeys() {
        const keysPath = path.join(this.baseDir, this.config.storage.apiKeysFile);
        const data = {
            keys: this.apiKeys,
            updatedAt: new Date().toISOString()
        };

        await fs.writeFile(keysPath, JSON.stringify(data, null, 2));
    }

    /**
     * 新增 API Key
     */
    async addApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API Key 不可為空');
        }

        // 驗證格式
        if (!apiKey.startsWith('AIza')) {
            throw new Error('API Key 格式錯誤（應以 AIza 開頭）');
        }

        // 檢查重複
        if (this.apiKeys.some(k => k.key === apiKey)) {
            throw new Error('此 API Key 已存在');
        }

        // 檢查數量限制
        if (this.apiKeys.length >= this.config.limits.maxApiKeys) {
            throw new Error(`最多只能新增 ${this.config.limits.maxApiKeys} 組 API Keys`);
        }

        // 新增
        this.apiKeys.push({
            key: apiKey,
            status: 'active',
            addedAt: new Date().toISOString(),
            lastUsed: null,
            errorCount: 0
        });

        await this.saveApiKeys();
        console.log('[PromptToContext] API Key 已新增');
    }

    /**
     * 取得可用的 API Key
     */
    getNextApiKey() {
        const activeKeys = this.apiKeys.filter(k => k.status === 'active');

        if (activeKeys.length === 0) {
            return null;
        }

        // 輪替
        const key = activeKeys[this.currentKeyIndex % activeKeys.length];
        this.currentKeyIndex++;

        return key;
    }

    /**
     * 轉換提示詞
     */
    async convert(prompt, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        // 驗證輸入
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('提示詞不可為空');
        }

        if (prompt.length > this.config.limits.maxInputLength) {
            throw new Error(`輸入過長（最多 ${this.config.limits.maxInputLength} 字元）`);
        }

        // 取得 API Key
        const keyObj = this.getNextApiKey();
        if (!keyObj) {
            throw new Error('沒有可用的 API Key');
        }

        const startTime = Date.now();

        try {
            // 建立請求
            const systemPrompt = this.getSystemPrompt();
            const requestBody = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: '我理解了。我會將使用者的簡單問題轉換為更專業、更有上下文的提示詞。' }]
                    },
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    topK: options.topK || 40,
                    topP: options.topP || 0.95,
                    maxOutputTokens: options.maxOutputTokens || 2048
                }
            };

            // 發送請求
            const result = await this.makeRequest(keyObj.key, requestBody);

            // 處理回應
            if (!result.candidates || result.candidates.length === 0) {
                throw new Error('API 回應格式錯誤');
            }

            const output = result.candidates[0].content.parts[0].text.trim();
            const duration = Date.now() - startTime;

            // 更新 Key 使用狀態
            keyObj.lastUsed = new Date().toISOString();
            await this.saveApiKeys();

            // 記錄歷史
            await this.addHistory({
                input: prompt,
                output: output,
                status: 'success',
                duration: duration,
                model: this.config.gemini.model
            });

            return {
                success: true,
                output: output,
                metadata: {
                    duration: duration,
                    inputLength: prompt.length,
                    outputLength: output.length,
                    model: this.config.gemini.model
                }
            };

        } catch (error) {
            const duration = Date.now() - startTime;

            // 記錄錯誤
            keyObj.errorCount++;
            if (keyObj.errorCount >= 3) {
                keyObj.status = 'error';
            }
            await this.saveApiKeys();

            // 記錄歷史
            await this.addHistory({
                input: prompt,
                output: null,
                status: 'error',
                error: error.message,
                duration: duration,
                model: this.config.gemini.model
            });

            throw error;
        }
    }

    /**
     * 發送 API 請求
     */
    async makeRequest(apiKey, body) {
        const url = `${this.config.gemini.baseUrl}/models/${this.config.gemini.model}:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.gemini.timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error?.message ||
                    `API 請求失敗 (${response.status})`
                );
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('請求逾時');
            }

            throw error;
        }
    }

    /**
     * 取得系統提示詞
     */
    getSystemPrompt() {
        return `你是一個專業的提示詞優化助手。你的任務是將使用者的簡單問題轉換為更專業、更有上下文的提示詞。

**轉換原則：**
1. 保持原意，但增加專業性和清晰度
2. 補充必要的背景資訊和上下文
3. 明確化問題的目標和期望
4. 使用結構化的表達方式
5. 適當增加限制條件和要求

**輸出格式：**
直接輸出轉換後的提示詞，不需要額外的說明或前綴。`;
    }

    /**
     * 新增歷史記錄
     */
    async addHistory(record) {
        const historyPath = path.join(this.baseDir, this.config.storage.historyFile);

        let history = [];
        try {
            const data = await fs.readFile(historyPath, 'utf-8');
            const historyData = JSON.parse(data);
            history = historyData.records || [];
        } catch {
            // 檔案不存在
        }

        // 新增記錄
        history.unshift({
            ...record,
            timestamp: new Date().toISOString()
        });

        // 限制數量
        if (history.length > this.config.limits.maxHistoryItems) {
            history = history.slice(0, this.config.limits.maxHistoryItems);
        }

        // 儲存
        await fs.writeFile(historyPath, JSON.stringify({
            records: history,
            updatedAt: new Date().toISOString()
        }, null, 2));
    }

    /**
     * 取得歷史記錄
     */
    async getHistory(limit = 20) {
        const historyPath = path.join(this.baseDir, this.config.storage.historyFile);

        try {
            const data = await fs.readFile(historyPath, 'utf-8');
            const historyData = JSON.parse(data);
            const records = historyData.records || [];
            return records.slice(0, limit);
        } catch {
            return [];
        }
    }

    /**
     * 列出所有 API Keys
     */
    listApiKeys() {
        return this.apiKeys.map(k => ({
            key: this.maskApiKey(k.key),
            status: k.status,
            addedAt: k.addedAt,
            lastUsed: k.lastUsed,
            errorCount: k.errorCount
        }));
    }

    /**
     * 遮蔽 API Key
     */
    maskApiKey(key) {
        if (key.length <= 8) return key;
        return key.substring(0, 4) + '********' + key.substring(key.length - 4);
    }

    /**
     * 取得統計資訊
     */
    async getStats() {
        const history = await this.getHistory(100);

        const total = history.length;
        const success = history.filter(r => r.status === 'success').length;
        const failed = history.filter(r => r.status === 'error').length;

        const durations = history
            .filter(r => r.duration)
            .map(r => r.duration);

        const avgDuration = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;

        return {
            apiKeys: {
                total: this.apiKeys.length,
                active: this.apiKeys.filter(k => k.status === 'active').length,
                error: this.apiKeys.filter(k => k.status === 'error').length
            },
            history: {
                total: total,
                success: success,
                failed: failed,
                successRate: total > 0 ? ((success / total) * 100).toFixed(1) : 0
            },
            performance: {
                avgDuration: avgDuration
            }
        };
    }
}

module.exports = PromptToContextPlugin;
