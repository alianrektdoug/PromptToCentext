/**
 * 範本管理器
 * 管理提示詞範本的新增、刪除、搜尋和套用
 */

class TemplateManager {
    constructor() {
        this.templates = [];
        this.defaultTemplates = this.getDefaultTemplates();
        this.loadTemplates();
    }

    /**
     * 載入範本
     */
    loadTemplates() {
        try {
            const savedTemplates = StorageManager.getTemplates();

            // 如果沒有儲存的範本，使用預設範本
            if (savedTemplates.length === 0) {
                this.templates = [...this.defaultTemplates];
                this.saveTemplates();
            } else {
                this.templates = savedTemplates;
            }

            console.log(`[TemplateManager] 已載入 ${this.templates.length} 個範本`);
        } catch (error) {
            console.error('[TemplateManager] 載入範本失敗:', error);
            this.templates = [...this.defaultTemplates];
        }
    }

    /**
     * 儲存範本
     */
    saveTemplates() {
        try {
            const success = StorageManager.setTemplates(this.templates);
            if (success) {
                console.log('[TemplateManager] 範本已儲存');
            }
            return success;
        } catch (error) {
            console.error('[TemplateManager] 儲存範本失敗:', error);
            return false;
        }
    }

    /**
     * 取得預設範本
     * @returns {Array} 預設範本陣列
     */
    getDefaultTemplates() {
        return [
            {
                id: 'default_coding_1',
                name: '程式除錯協助',
                category: 'coding',
                description: '尋求程式錯誤的協助和修正建議',
                content: `我在 {{language}} 開發過程中遇到了問題。

**問題描述：**
{{problem_description}}

**相關程式碼：**
\`\`\`{{language}}
{{code}}
\`\`\`

**錯誤訊息：**
{{error_message}}

**已嘗試的解決方法：**
{{attempted_solutions}}

請幫我分析問題原因，並提供詳細的修正建議和最佳實踐。`,
                variables: ['language', 'problem_description', 'code', 'error_message', 'attempted_solutions'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'default_coding_2',
                name: '程式碼審查',
                category: 'coding',
                description: '請求對程式碼進行專業審查',
                content: `請審查以下 {{language}} 程式碼，並提供改進建議。

**程式碼：**
\`\`\`{{language}}
{{code}}
\`\`\`

**審查重點：**
1. 程式碼品質和可讀性
2. 效能優化機會
3. 潛在的錯誤或安全問題
4. 是否符合最佳實踐
5. 可維護性和可擴展性

請針對每個重點提供具體的建議和範例程式碼。`,
                variables: ['language', 'code'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'default_technical_1',
                name: '技術文件撰寫',
                category: 'technical',
                description: '協助撰寫技術文件',
                content: `我需要為 {{project_name}} 撰寫技術文件。

**專案概述：**
{{project_overview}}

**目標讀者：**
{{target_audience}}

**需要包含的內容：**
{{content_requirements}}

請幫我撰寫一份結構清晰、內容完整的技術文件，包括：
1. 簡介和背景
2. 架構說明
3. 安裝和配置步驟
4. 使用說明和範例
5. API 參考（如適用）
6. 常見問題解答

文件應該易於理解，並包含適當的圖表和程式碼範例。`,
                variables: ['project_name', 'project_overview', 'target_audience', 'content_requirements'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'default_learning_1',
                name: '學習路徑規劃',
                category: 'learning',
                description: '規劃完整的技術學習路徑',
                content: `我想學習 {{topic}}，目前程度是 {{current_level}}。

**學習目標：**
{{learning_goals}}

**可用時間：**
{{available_time}}

**偏好的學習方式：**
{{learning_style}}

請為我規劃一個完整的學習路徑，包括：
1. 學習階段劃分（初級、中級、高級）
2. 每個階段的學習內容和重點
3. 推薦的學習資源（書籍、線上課程、文件）
4. 實作專案建議
5. 預估的學習時程
6. 自我評估的檢查點

請確保路徑循序漸進，適合我的程度和時間安排。`,
                variables: ['topic', 'current_level', 'learning_goals', 'available_time', 'learning_style'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'default_creative_1',
                name: '內容創作',
                category: 'creative',
                description: '協助創作各類型內容',
                content: `我需要創作關於 {{topic}} 的 {{content_type}}。

**目標受眾：**
{{target_audience}}

**內容風格：**
{{style}}

**關鍵訊息：**
{{key_messages}}

**字數要求：**
{{word_count}}

請幫我創作一份引人入勝的內容，需要：
1. 吸引人的開場
2. 清晰的結構和邏輯
3. 生動的描述和例子
4. 有力的結尾和行動呼籲
5. 符合目標受眾的語氣和風格

請確保內容原創、有價值且易於理解。`,
                variables: ['topic', 'content_type', 'target_audience', 'style', 'key_messages', 'word_count'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'default_business_1',
                name: '商業分析',
                category: 'business',
                description: '進行商業分析和策略規劃',
                content: `我需要對 {{business_area}} 進行分析。

**分析背景：**
{{background}}

**分析目標：**
{{objectives}}

**可用資料：**
{{available_data}}

**關注的指標：**
{{key_metrics}}

請提供一份完整的分析報告，包括：
1. 現況分析（SWOT 或其他適合的框架）
2. 市場趨勢和機會
3. 競爭分析
4. 風險評估
5. 具體的建議和行動方案
6. 預期效益和成功指標

請基於資料和事實提供客觀的分析和可行的建議。`,
                variables: ['business_area', 'background', 'objectives', 'available_data', 'key_metrics'],
                isDefault: true,
                isStarred: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];
    }

    /**
     * 新增範本
     * @param {Object} template - 範本資料
     * @returns {Object} 結果
     */
    addTemplate(template) {
        const result = {
            success: false,
            error: null,
            templateId: null
        };

        // 驗證名稱
        const nameValidation = Validators.validateTemplateName(template.name);
        if (!nameValidation.valid) {
            result.error = nameValidation.error;
            return result;
        }

        // 驗證內容
        const contentValidation = Validators.validateTemplateContent(template.content);
        if (!contentValidation.valid) {
            result.error = contentValidation.error;
            return result;
        }

        // 驗證變數
        const variableValidation = Validators.validateTemplateVariables(template.content);
        if (!variableValidation.valid) {
            result.error = variableValidation.error;
            return result;
        }

        // 產生 ID
        const templateId = 'template_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        // 新增範本
        this.templates.push({
            id: templateId,
            name: template.name.trim(),
            category: template.category || 'other',
            description: template.description || '',
            content: template.content.trim(),
            variables: variableValidation.variables,
            isDefault: false,
            isStarred: false,
            usageCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        // 儲存
        const saved = this.saveTemplates();
        if (saved) {
            result.success = true;
            result.templateId = templateId;
            console.log('[TemplateManager] 範本已新增:', templateId);
        } else {
            result.error = '儲存失敗';
            this.templates.pop(); // 回滾
        }

        return result;
    }

    /**
     * 更新範本
     * @param {string} templateId - 範本 ID
     * @param {Object} updates - 更新資料
     * @returns {Object} 結果
     */
    updateTemplate(templateId, updates) {
        const result = {
            success: false,
            error: null
        };

        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            result.error = '範本不存在';
            return result;
        }

        // 不允許更新預設範本的某些欄位
        if (template.isDefault && (updates.content || updates.variables)) {
            result.error = '無法修改預設範本的內容';
            return result;
        }

        // 更新欄位
        if (updates.name !== undefined) {
            const validation = Validators.validateTemplateName(updates.name);
            if (!validation.valid) {
                result.error = validation.error;
                return result;
            }
            template.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            template.description = updates.description.trim();
        }

        if (updates.category !== undefined) {
            template.category = updates.category;
        }

        if (updates.content !== undefined) {
            const validation = Validators.validateTemplateContent(updates.content);
            if (!validation.valid) {
                result.error = validation.error;
                return result;
            }

            const variableValidation = Validators.validateTemplateVariables(updates.content);
            if (!variableValidation.valid) {
                result.error = variableValidation.error;
                return result;
            }

            template.content = updates.content.trim();
            template.variables = variableValidation.variables;
        }

        if (updates.isStarred !== undefined) {
            template.isStarred = updates.isStarred;
        }

        template.updatedAt = Date.now();

        // 儲存
        const saved = this.saveTemplates();
        if (saved) {
            result.success = true;
            console.log('[TemplateManager] 範本已更新:', templateId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 刪除範本
     * @param {string} templateId - 範本 ID
     * @returns {Object} 結果
     */
    deleteTemplate(templateId) {
        const result = {
            success: false,
            error: null
        };

        const index = this.templates.findIndex(t => t.id === templateId);
        if (index === -1) {
            result.error = '範本不存在';
            return result;
        }

        // 不允許刪除預設範本
        if (this.templates[index].isDefault) {
            result.error = '無法刪除預設範本';
            return result;
        }

        this.templates.splice(index, 1);

        const saved = this.saveTemplates();
        if (saved) {
            result.success = true;
            console.log('[TemplateManager] 範本已刪除:', templateId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 取得所有範本
     * @param {Object} filters - 篩選條件
     * @returns {Array} 範本陣列
     */
    getTemplates(filters = {}) {
        let filtered = [...this.templates];

        // 依類別篩選
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }

        // 依收藏篩選
        if (filters.starred) {
            filtered = filtered.filter(t => t.isStarred);
        }

        // 搜尋
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchLower) ||
                t.description.toLowerCase().includes(searchLower) ||
                t.content.toLowerCase().includes(searchLower)
            );
        }

        // 排序
        if (filters.sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filters.sortBy === 'usage') {
            filtered.sort((a, b) => b.usageCount - a.usageCount);
        } else if (filters.sortBy === 'updated') {
            filtered.sort((a, b) => b.updatedAt - a.updatedAt);
        } else {
            // 預設：收藏的在前，然後依更新時間
            filtered.sort((a, b) => {
                if (a.isStarred !== b.isStarred) {
                    return b.isStarred - a.isStarred;
                }
                return b.updatedAt - a.updatedAt;
            });
        }

        return filtered;
    }

    /**
     * 取得範本
     * @param {string} templateId - 範本 ID
     * @returns {Object|null} 範本
     */
    getTemplate(templateId) {
        return this.templates.find(t => t.id === templateId) || null;
    }

    /**
     * 套用範本（替換變數）
     * @param {string} templateId - 範本 ID
     * @param {Object} variables - 變數值
     * @returns {Object} 結果
     */
    applyTemplate(templateId, variables = {}) {
        const result = {
            success: false,
            error: null,
            output: null
        };

        const template = this.getTemplate(templateId);
        if (!template) {
            result.error = '範本不存在';
            return result;
        }

        let output = template.content;

        // 替換變數
        for (const varName of template.variables) {
            const value = variables[varName] || `{{${varName}}}`;
            const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
            output = output.replace(regex, value);
        }

        // 增加使用次數
        template.usageCount++;
        this.saveTemplates();

        result.success = true;
        result.output = output;

        return result;
    }

    /**
     * 重設為預設範本
     */
    resetToDefaults() {
        // 保留自訂範本
        const customTemplates = this.templates.filter(t => !t.isDefault);

        // 重新載入預設範本
        this.templates = [...this.defaultTemplates, ...customTemplates];

        return this.saveTemplates();
    }

    /**
     * 匯出範本
     * @param {Array} templateIds - 範本 ID 陣列（空陣列表示全部）
     * @returns {string} JSON 字串
     */
    exportTemplates(templateIds = []) {
        let templatesToExport;

        if (templateIds.length === 0) {
            templatesToExport = this.templates;
        } else {
            templatesToExport = this.templates.filter(t => templateIds.includes(t.id));
        }

        return JSON.stringify(templatesToExport, null, 2);
    }

    /**
     * 匯入範本
     * @param {string} jsonString - JSON 字串
     * @param {boolean} merge - 是否合併
     * @returns {Object} 結果
     */
    importTemplates(jsonString, merge = true) {
        const result = {
            success: false,
            error: null,
            imported: 0
        };

        try {
            const importedTemplates = JSON.parse(jsonString);

            if (!Array.isArray(importedTemplates)) {
                result.error = '資料格式錯誤';
                return result;
            }

            if (!merge) {
                // 保留預設範本
                this.templates = this.templates.filter(t => t.isDefault);
            }

            let imported = 0;
            for (const template of importedTemplates) {
                // 驗證必要欄位
                if (!template.name || !template.content) {
                    continue;
                }

                // 產生新 ID（避免衝突）
                const newId = 'template_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

                this.templates.push({
                    ...template,
                    id: newId,
                    isDefault: false,
                    usageCount: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });

                imported++;
            }

            const saved = this.saveTemplates();
            if (saved) {
                result.success = true;
                result.imported = imported;
            } else {
                result.error = '儲存失敗';
            }
        } catch (error) {
            console.error('[TemplateManager] 匯入失敗:', error);
            result.error = error.message;
        }

        return result;
    }
}

console.log('[TemplateManager] 範本管理器已載入');
