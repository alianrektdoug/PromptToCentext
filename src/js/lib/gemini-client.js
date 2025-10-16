/**
 * Gemini API 客戶端
 * 負責與 Google Gemini API 通訊
 */

class GeminiClient {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.timeout = 30000; // 30 秒
        this.systemPrompt = this.getSystemPrompt();

        // 模型配置（按優先級排序）
        this.models = {
            'GEMINI_2_5_FLASH': {
                name: 'Gemini 2.5 Flash',
                endpoint: 'gemini-2.5-flash',
                maxTokens: 32768,
                priority: 1,  // 最高優先級
                timeout: 30000,
                quotaExhausted: false
            },
            'GEMINI_2_5_FLASH_LITE': {
                name: 'Gemini 2.5 Flash-Lite',
                endpoint: 'gemini-2.5-flash-lite',
                maxTokens: 32768,
                priority: 2,  // 第二優先級
                timeout: 30000,
                quotaExhausted: false
            },
            'GEMINI_2_0_FLASH': {
                name: 'Gemini 2.0 Flash',
                endpoint: 'gemini-2.0-flash',
                maxTokens: 32768,
                priority: 3,  // 第三優先級
                timeout: 30000,
                quotaExhausted: false
            },
            'GEMINI_2_0_FLASH_LITE': {
                name: 'Gemini 2.0 Flash-Lite',
                endpoint: 'gemini-2.0-flash-lite',
                maxTokens: 32768,
                priority: 4,  // 第四優先級
                timeout: 30000,
                quotaExhausted: false
            },
            'GEMINI_1_5_FLASH': {
                name: 'Gemini 1.5 Flash',
                endpoint: 'gemini-1.5-flash',
                maxTokens: 30720,
                priority: 5,  // 備援模型
                timeout: 30000,
                quotaExhausted: false
            }
        };

        // 預設使用最高優先級模型
        this.currentModelKey = 'GEMINI_2_5_FLASH';
    }

    /**
     * 取得系統提示詞
     * @returns {string} 系統提示詞
     */
    getSystemPrompt() {
        return `你是一個專業的提示詞優化助手。你的任務是將使用者的簡單問題轉換為更專業、更有上下文的提示詞。

**核心要求：事實檢查思考（Fact-Check Thinking）**
你必須在回答前先進行「事實檢查思考」。除非使用者明確提供、或資料中確實存在，否則不得假設、推測或自行創造內容。

**具體規則：**

1. **嚴格依據來源**
   - 僅使用使用者提供的內容、你內部明確記載的知識、或經明確查證的資料
   - 若資訊不足，請直接說明「沒有足夠資料」或「我無法確定」，不要臆測

2. **顯示思考依據**
   - 若你引用資料或推論，請說明你依據的段落或理由
   - 若是個人分析或估計，必須明確標註「這是推論」或「這是假設情境」

3. **避免裝作知道**
   - 不可為了讓答案完整而「補完」不存在的內容
   - 若遇到模糊或不完整的問題，請先回問確認或提出選項，而非自行決定

4. **保持語意一致**
   - 不可改寫或擴大使用者原意
   - 若你需要重述，應明確標示為「重述版本」，並保持語義對等

5. **回答格式**
   - 若有明確資料：回答並附上依據
   - 若無明確資料：回答「無法確定」並說明原因
   - 不要在回答中使用「應該是」「可能是」「我猜」等模糊語氣，除非使用者要求

6. **思考深度**
   - 在產出前，先檢查答案是否：
     a. 有清楚依據
     b. 未超出題目範圍
     c. 沒有出現任何未被明確提及的人名、數字、事件或假設

**最終原則：寧可空白，不可捏造。**

**轉換原則：**
1. 保持原意，但增加專業性和清晰度
2. 補充必要的背景資訊和上下文（基於使用者提供的資訊，不自行創造）
3. 明確化問題的目標和期望
4. 使用結構化的表達方式
5. 適當增加限制條件和要求（需基於使用者原意）

**輸出格式：**
直接輸出轉換後的提示詞，不需要額外的說明或前綴。

**範例：**
輸入：如何學習 JavaScript？
輸出：我想系統性地學習 JavaScript 程式語言。請提供一個完整的學習路徑，包括：
1. 基礎語法和概念（變數、資料型別、函數等）
2. DOM 操作和事件處理
3. 非同步程式設計（Promise、async/await）
4. 現代 JavaScript 特性（ES6+）
5. 實作專案建議

請針對初學者的程度，提供循序漸進的學習建議，並推薦適合的學習資源。

**注意：在轉換時，請嚴格遵守「事實檢查思考」原則，不要在轉換後的提示詞中加入使用者未提及的假設或資訊。**`;
    }

    /**
     * 轉換提示詞
     * @param {string} userPrompt - 使用者輸入的問題
     * @param {Object} options - 選項
     * @returns {Promise<Object>} 轉換結果
     */
    async convert(userPrompt, options = {}) {
        const result = {
            success: false,
            output: null,
            error: null,
            metadata: {
                inputLength: userPrompt.length,
                outputLength: 0,
                startTime: Date.now(),
                endTime: null,
                duration: null,
                keyId: null,
                model: this.getCurrentModel().name
            }
        };

        try {
            // 驗證輸入
            const validation = Validators.validateInputText(userPrompt);
            if (!validation.valid) {
                result.error = validation.error;
                return result;
            }

            // 取得 API Key
            const keyObj = this.apiManager.getNextKey();
            if (!keyObj) {
                result.error = '沒有可用的 API Key，請先新增';
                return result;
            }

            result.metadata.keyId = keyObj.id;

            // 建立請求
            const requestBody = {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: this.systemPrompt
                            }
                        ]
                    },
                    {
                        role: 'model',
                        parts: [
                            {
                                text: '我理解了。我會將使用者的簡單問題轉換為更專業、更有上下文的提示詞。'
                            }
                        ]
                    },
                    {
                        role: 'user',
                        parts: [
                            {
                                text: userPrompt
                            }
                        ]
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
            const response = await this.makeRequest(keyObj.key, requestBody);

            // 處理回應
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                const text = candidate.content.parts[0].text;

                result.success = true;
                result.output = text.trim();
                result.metadata.outputLength = result.output.length;
                result.metadata.endTime = Date.now();
                result.metadata.duration = result.metadata.endTime - result.metadata.startTime;

                console.log('[GeminiClient] 轉換成功:', {
                    inputLength: result.metadata.inputLength,
                    outputLength: result.metadata.outputLength,
                    duration: result.metadata.duration + 'ms'
                });
            } else {
                throw new Error('API 回應格式錯誤');
            }

        } catch (error) {
            result.error = this.handleError(error, result.metadata.keyId);
            result.metadata.endTime = Date.now();
            result.metadata.duration = result.metadata.endTime - result.metadata.startTime;
            console.error('[GeminiClient] 轉換失敗:', error);
        }

        return result;
    }

    /**
     * 發送 API 請求
     * @param {string} apiKey - API Key
     * @param {Object} body - 請求內容
     * @returns {Promise<Object>} API 回應
     */
    async makeRequest(apiKey, body) {
        const currentModel = this.getCurrentModel();
        const url = `${this.baseUrl}/models/${currentModel.endpoint}:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), currentModel.timeout);

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
            throw error;
        }
    }

    /**
     * 處理錯誤
     * @param {Error} error - 錯誤物件
     * @param {string} keyId - Key ID
     * @returns {string} 錯誤訊息
     */
    handleError(error, keyId) {
        let errorMessage = '轉換失敗';
        let errorType = 'unknown';

        if (error.name === 'AbortError') {
            errorMessage = '請求逾時，請稍後再試';
            errorType = 'timeout';
        } else if (error.message.includes('API key')) {
            errorMessage = 'API Key 無效或已過期';
            errorType = 'auth';
            if (keyId) {
                this.apiManager.markKeyError(keyId, errorType);
            }
        } else if (error.message.includes('quota') || error.message.includes('exhausted')) {
            errorMessage = 'API 配額已用完';
            errorType = 'quota';

            // 標記當前模型配額耗盡
            this.markModelQuotaExhausted(this.currentModelKey);

            // 嘗試降級到下一個模型
            if (this.fallbackToNextModel()) {
                errorMessage += `，已自動切換到 ${this.getCurrentModel().name}`;
            } else {
                errorMessage += '，且無可用備援模型';
                if (keyId) {
                    this.apiManager.markKeyError(keyId, errorType);
                }
            }
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'API 請求頻率過高，請稍後再試';
            errorType = 'rate_limit';
        } else if (error.message.includes('model not found') || error.message.includes('404')) {
            errorMessage = `模型 ${this.getCurrentModel().name} 不可用`;
            errorType = 'model_unavailable';

            // 標記模型不可用並降級
            this.markModelQuotaExhausted(this.currentModelKey);
            if (this.fallbackToNextModel()) {
                errorMessage += `，已自動切換到 ${this.getCurrentModel().name}`;
            }
        } else if (!navigator.onLine) {
            errorMessage = '網路連線中斷，請檢查網路狀態';
            errorType = 'network';
        } else {
            errorMessage = error.message || '未知錯誤';
        }

        return errorMessage;
    }

    /**
     * 批次轉換
     * @param {Array<string>} prompts - 提示詞陣列
     * @param {Object} options - 選項
     * @returns {Promise<Array>} 轉換結果陣列
     */
    async convertBatch(prompts, options = {}) {
        const results = [];
        const {
            concurrency = 3,
            delayBetween = 1000
        } = options;

        // 分批處理
        for (let i = 0; i < prompts.length; i += concurrency) {
            const batch = prompts.slice(i, i + concurrency);
            const batchResults = await Promise.all(
                batch.map(prompt => this.convert(prompt, options))
            );
            results.push(...batchResults);

            // 延遲（避免超過速率限制）
            if (i + concurrency < prompts.length) {
                await this.delay(delayBetween);
            }
        }

        return results;
    }

    /**
     * 延遲函數
     * @param {number} ms - 毫秒
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 測試 API 連線
     * @param {string} apiKey - API Key
     * @returns {Promise<Object>} 測試結果
     */
    async testConnection(apiKey) {
        const result = {
            success: false,
            error: null,
            latency: null
        };

        const startTime = Date.now();

        try {
            const requestBody = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: 'Hello' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 10
                }
            };

            await this.makeRequest(apiKey, requestBody);

            result.success = true;
            result.latency = Date.now() - startTime;
        } catch (error) {
            result.error = this.handleError(error, null);
        }

        return result;
    }

    /**
     * 取得模型資訊
     * @returns {Object} 模型資訊
     */
    getModelInfo() {
        const currentModel = this.getCurrentModel();
        return {
            name: currentModel.name,
            endpoint: currentModel.endpoint,
            baseUrl: this.baseUrl,
            timeout: currentModel.timeout,
            maxTokens: currentModel.maxTokens,
            priority: currentModel.priority,
            quotaExhausted: currentModel.quotaExhausted
        };
    }

    /**
     * 取得所有模型資訊
     * @returns {Array} 所有模型資訊
     */
    getAllModelsInfo() {
        return Object.entries(this.models).map(([key, model]) => ({
            key,
            name: model.name,
            endpoint: model.endpoint,
            maxTokens: model.maxTokens,
            priority: model.priority,
            quotaExhausted: model.quotaExhausted,
            isCurrent: key === this.currentModelKey
        }));
    }

    /**
     * 取得當前模型
     * @returns {Object} 模型配置
     */
    getCurrentModel() {
        return this.models[this.currentModelKey];
    }

    /**
     * 取得可用的模型（按優先級排序）
     * @returns {Array} 可用模型列表
     */
    getAvailableModels() {
        return Object.entries(this.models)
            .filter(([key, model]) => !model.quotaExhausted)
            .sort((a, b) => a[1].priority - b[1].priority)
            .map(([key, model]) => ({ key, ...model }));
    }

    /**
     * 切換到下一個可用模型（降級）
     * @returns {boolean} 是否成功切換
     */
    fallbackToNextModel() {
        const availableModels = this.getAvailableModels();
        const currentPriority = this.getCurrentModel().priority;

        // 找到下一個優先級較低的模型
        const nextModel = availableModels.find(m => m.priority > currentPriority);

        if (nextModel) {
            this.currentModelKey = nextModel.key;
            console.log('[GeminiClient] 降級至模型:', nextModel.name);
            return true;
        }

        console.warn('[GeminiClient] 沒有可用的備援模型');
        return false;
    }

    /**
     * 標記模型配額耗盡
     * @param {string} modelKey - 模型鍵值
     */
    markModelQuotaExhausted(modelKey) {
        if (this.models[modelKey]) {
            this.models[modelKey].quotaExhausted = true;
            console.log('[GeminiClient] 模型配額已耗盡:', this.models[modelKey].name);
        }
    }

    /**
     * 重置所有模型的配額狀態
     */
    resetModelQuotas() {
        Object.keys(this.models).forEach(key => {
            this.models[key].quotaExhausted = false;
        });
        console.log('[GeminiClient] 已重置所有模型配額狀態');
    }

    /**
     * 設定模型
     * @param {string} modelKey - 模型鍵值
     */
    setModel(modelKey) {
        if (this.models[modelKey]) {
            this.currentModelKey = modelKey;
            console.log('[GeminiClient] 模型已切換:', this.models[modelKey].name);
        } else {
            console.warn('[GeminiClient] 無效的模型名稱:', modelKey);
        }
    }

    /**
     * 設定逾時時間
     * @param {number} timeout - 逾時時間（毫秒）
     */
    setTimeout(timeout) {
        if (timeout > 0 && timeout <= 120000) {
            this.timeout = timeout;
            console.log('[GeminiClient] 逾時時間已設定:', timeout + 'ms');
        } else {
            console.warn('[GeminiClient] 無效的逾時時間:', timeout);
        }
    }

    /**
     * 估算 Token 數量（粗略估算）
     * @param {string} text - 文字
     * @returns {number} 估算的 Token 數量
     */
    estimateTokens(text) {
        // 粗略估算：中文字約 1.5-2 tokens，英文單字約 1-1.5 tokens
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        const others = text.length - chineseChars - englishWords;

        return Math.ceil(chineseChars * 1.8 + englishWords * 1.2 + others * 0.5);
    }
}

console.log('[GeminiClient] Gemini 客戶端已載入');
