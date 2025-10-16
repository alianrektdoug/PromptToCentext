/**
 * 輸入驗證工具
 * 提供各種輸入驗證功能
 */

const Validators = {
    /**
     * 驗證 API Key 格式
     * @param {string} apiKey - API Key
     * @returns {Object} 驗證結果
     */
    validateApiKey(apiKey) {
        const result = {
            valid: false,
            error: null
        };

        // 檢查是否為空
        if (!apiKey || typeof apiKey !== 'string') {
            result.error = 'API Key 不可為空';
            return result;
        }

        // 移除前後空白
        apiKey = apiKey.trim();

        // 檢查長度
        if (apiKey.length < 30) {
            result.error = 'API Key 長度不足（至少 30 個字元）';
            return result;
        }

        // 檢查格式（Gemini API Key 通常以 AIza 開頭）
        if (!apiKey.startsWith('AIza')) {
            result.error = 'API Key 格式錯誤（應以 AIza 開頭）';
            return result;
        }

        // 檢查是否包含特殊字元（API Key 通常只包含英數字和少數符號）
        const validChars = /^[A-Za-z0-9_-]+$/;
        if (!validChars.test(apiKey)) {
            result.error = 'API Key 包含無效字元';
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證輸入文字
     * @param {string} text - 輸入文字
     * @param {Object} options - 選項
     * @returns {Object} 驗證結果
     */
    validateInputText(text, options = {}) {
        const {
            minLength = 1,
            maxLength = 10000,
            required = true
        } = options;

        const result = {
            valid: false,
            error: null
        };

        // 檢查是否為必填
        if (required && (!text || typeof text !== 'string')) {
            result.error = '請輸入問題';
            return result;
        }

        // 非必填且為空時視為有效
        if (!required && !text) {
            result.valid = true;
            return result;
        }

        // 移除前後空白後檢查
        const trimmed = text.trim();

        // 檢查最小長度
        if (trimmed.length < minLength) {
            result.error = `問題至少需要 ${minLength} 個字元`;
            return result;
        }

        // 檢查最大長度
        if (trimmed.length > maxLength) {
            result.error = `問題不可超過 ${maxLength} 個字元`;
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證範本名稱
     * @param {string} name - 範本名稱
     * @returns {Object} 驗證結果
     */
    validateTemplateName(name) {
        const result = {
            valid: false,
            error: null
        };

        if (!name || typeof name !== 'string') {
            result.error = '範本名稱不可為空';
            return result;
        }

        const trimmed = name.trim();

        if (trimmed.length < 2) {
            result.error = '範本名稱至少需要 2 個字元';
            return result;
        }

        if (trimmed.length > 50) {
            result.error = '範本名稱不可超過 50 個字元';
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證範本內容
     * @param {string} content - 範本內容
     * @returns {Object} 驗證結果
     */
    validateTemplateContent(content) {
        const result = {
            valid: false,
            error: null
        };

        if (!content || typeof content !== 'string') {
            result.error = '範本內容不可為空';
            return result;
        }

        const trimmed = content.trim();

        if (trimmed.length < 10) {
            result.error = '範本內容至少需要 10 個字元';
            return result;
        }

        if (trimmed.length > 5000) {
            result.error = '範本內容不可超過 5000 個字元';
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證範本變數
     * @param {string} content - 範本內容
     * @returns {Object} 驗證結果
     */
    validateTemplateVariables(content) {
        const result = {
            valid: true,
            variables: [],
            error: null
        };

        if (!content) {
            return result;
        }

        // 提取所有變數 {{variable_name}}
        const regex = /\{\{([^}]+)\}\}/g;
        let match;
        const variables = new Set();

        while ((match = regex.exec(content)) !== null) {
            const varName = match[1].trim();

            // 驗證變數名稱格式
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
                result.valid = false;
                result.error = `無效的變數名稱: {{${varName}}}（變數名稱只能包含英文字母、數字和底線，且必須以字母或底線開頭）`;
                return result;
            }

            variables.add(varName);
        }

        result.variables = Array.from(variables);
        return result;
    },

    /**
     * 驗證 Email
     * @param {string} email - Email
     * @returns {Object} 驗證結果
     */
    validateEmail(email) {
        const result = {
            valid: false,
            error: null
        };

        if (!email || typeof email !== 'string') {
            result.error = 'Email 不可為空';
            return result;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            result.error = 'Email 格式錯誤';
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證 URL
     * @param {string} url - URL
     * @returns {Object} 驗證結果
     */
    validateUrl(url) {
        const result = {
            valid: false,
            error: null
        };

        if (!url || typeof url !== 'string') {
            result.error = 'URL 不可為空';
            return result;
        }

        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                result.error = 'URL 必須使用 HTTP 或 HTTPS 協定';
                return result;
            }
            result.valid = true;
        } catch (e) {
            result.error = 'URL 格式錯誤';
        }

        return result;
    },

    /**
     * 驗證檔案名稱
     * @param {string} filename - 檔案名稱
     * @returns {Object} 驗證結果
     */
    validateFilename(filename) {
        const result = {
            valid: false,
            error: null
        };

        if (!filename || typeof filename !== 'string') {
            result.error = '檔案名稱不可為空';
            return result;
        }

        // 檢查非法字元
        const illegalChars = /[<>:"/\\|?*\x00-\x1F]/g;
        if (illegalChars.test(filename)) {
            result.error = '檔案名稱包含非法字元';
            return result;
        }

        // 檢查長度
        if (filename.length > 255) {
            result.error = '檔案名稱過長（最多 255 個字元）';
            return result;
        }

        // 檢查保留名稱（Windows）
        const reserved = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
        const nameWithoutExt = filename.split('.')[0];
        if (reserved.test(nameWithoutExt)) {
            result.error = '檔案名稱使用了系統保留名稱';
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 驗證 JSON 格式
     * @param {string} jsonString - JSON 字串
     * @returns {Object} 驗證結果
     */
    validateJson(jsonString) {
        const result = {
            valid: false,
            error: null,
            data: null
        };

        if (!jsonString || typeof jsonString !== 'string') {
            result.error = 'JSON 字串不可為空';
            return result;
        }

        try {
            result.data = JSON.parse(jsonString);
            result.valid = true;
        } catch (e) {
            result.error = `JSON 格式錯誤: ${e.message}`;
        }

        return result;
    },

    /**
     * 清理文字（移除多餘空白）
     * @param {string} text - 文字
     * @returns {string} 清理後的文字
     */
    sanitizeText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .trim()
            .replace(/\s+/g, ' ') // 將多個空白替換為單一空白
            .replace(/\n\s*\n\s*\n/g, '\n\n'); // 將多個換行替換為雙換行
    },

    /**
     * 清理 HTML（防止 XSS）
     * @param {string} html - HTML 字串
     * @returns {string} 清理後的文字
     */
    sanitizeHtml(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    /**
     * 驗證數字範圍
     * @param {number} value - 數值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {Object} 驗證結果
     */
    validateNumberRange(value, min, max) {
        const result = {
            valid: false,
            error: null
        };

        if (typeof value !== 'number' || isNaN(value)) {
            result.error = '必須是有效的數字';
            return result;
        }

        if (value < min) {
            result.error = `數值不可小於 ${min}`;
            return result;
        }

        if (value > max) {
            result.error = `數值不可大於 ${max}`;
            return result;
        }

        result.valid = true;
        return result;
    },

    /**
     * 批次驗證
     * @param {Array} validations - 驗證陣列 [{validator, value, options}]
     * @returns {Object} 驗證結果
     */
    validateBatch(validations) {
        const result = {
            valid: true,
            errors: []
        };

        for (const validation of validations) {
            const { validator, value, options } = validation;

            if (typeof this[validator] !== 'function') {
                console.error(`[Validators] 未知的驗證器: ${validator}`);
                continue;
            }

            const validationResult = this[validator](value, options);
            if (!validationResult.valid) {
                result.valid = false;
                result.errors.push({
                    validator,
                    error: validationResult.error
                });
            }
        }

        return result;
    }
};

console.log('[Validators] 驗證工具已載入');
