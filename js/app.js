/**
 * 主應用程式控制器
 * 整合所有模組並處理 UI 互動
 */

class App {
    constructor() {
        // 初始化管理器
        this.apiManager = new APIManager();
        this.geminiClient = new GeminiClient(this.apiManager);
        this.templateManager = new TemplateManager();
        this.historyManager = new HistoryManager();
        this.exportManager = new ExportManager();

        // DOM 元素
        this.elements = {};

        // 狀態
        this.state = {
            currentTheme: 'light',
            isConverting: false,
            lastResult: null,
            showApiKeys: false  // 是否顯示完整的 API Keys
        };

        // 初始化
        this.init();
    }

    /**
     * 初始化應用程式
     */
    async init() {
        console.log('[App] 初始化應用程式...');

        // 綁定 DOM 元素
        this.bindElements();

        // 綁定事件
        this.bindEvents();

        // 載入主題
        this.loadTheme();

        // 等待 API Keys 載入完成
        await this.apiManager.loadKeys();

        // 載入 API Keys
        this.renderApiKeys();

        // 載入範本
        this.renderTemplates();

        // 載入歷史記錄
        this.renderHistory();

        // 檢查 API Keys
        this.checkApiKeys();

        console.log('[App] 應用程式初始化完成');
    }

    /**
     * 綁定 DOM 元素
     */
    bindElements() {
        // 輸入區
        this.elements.inputText = document.getElementById('input-text');
        this.elements.charCount = document.getElementById('char-count');
        this.elements.clearBtn = document.getElementById('clear-btn');
        this.elements.templateQuickBtn = document.getElementById('template-quick-btn');
        this.elements.convertBtn = document.getElementById('convert-btn');

        // API Key 管理
        this.elements.apiKeyPanel = document.getElementById('api-key-panel');
        this.elements.apiKeyHeader = document.getElementById('api-key-header');
        this.elements.apiKeyContent = document.getElementById('api-key-content');
        this.elements.apiKeyList = document.getElementById('api-key-list');
        this.elements.newApiKey = document.getElementById('new-api-key');
        this.elements.addKeyBtn = document.getElementById('add-key-btn');

        // 輸出區
        this.elements.outputSection = document.getElementById('output-section');
        this.elements.outputText = document.getElementById('output-text');
        this.elements.outputMeta = document.getElementById('output-meta');
        this.elements.copyBtn = document.getElementById('copy-btn');
        this.elements.exportBtn = document.getElementById('export-btn');
        this.elements.saveHistoryBtn = document.getElementById('save-history-btn');

        // 載入狀態
        this.elements.loadingOverlay = document.getElementById('loading-overlay');

        // 頁首按鈕
        this.elements.themeToggle = document.getElementById('theme-toggle');
        this.elements.historyBtn = document.getElementById('history-btn');
        this.elements.templateBtn = document.getElementById('template-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');

        // 側邊欄
        this.elements.historySidebar = document.getElementById('history-sidebar');
        this.elements.historyClose = document.getElementById('history-close');
        this.elements.historyList = document.getElementById('history-list');
        this.elements.historySearch = document.getElementById('history-search');
        this.elements.historyFilter = document.getElementById('history-filter');

        this.elements.templateSidebar = document.getElementById('template-sidebar');
        this.elements.templateClose = document.getElementById('template-close');
        this.elements.templateList = document.getElementById('template-list');
        this.elements.templateSearch = document.getElementById('template-search');
        this.elements.templateCategory = document.getElementById('template-category');

        this.elements.settingsSidebar = document.getElementById('settings-sidebar');
        this.elements.settingsClose = document.getElementById('settings-close');
        this.elements.storageInfo = document.getElementById('storage-info');
        this.elements.storageUsedBar = document.getElementById('storage-used-bar');
        this.elements.storageText = document.getElementById('storage-text');

        // Toast 容器
        this.elements.toastContainer = document.getElementById('toast-container');
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 輸入區事件
        this.elements.inputText.addEventListener('input', () => this.updateCharCount());
        this.elements.clearBtn.addEventListener('click', () => this.clearInput());
        this.elements.templateQuickBtn.addEventListener('click', () => this.openTemplateSidebar());
        this.elements.convertBtn.addEventListener('click', () => this.convert());

        // API Key 管理事件
        this.elements.apiKeyHeader.addEventListener('click', () => this.toggleApiKeyPanel());
        this.elements.addKeyBtn.addEventListener('click', () => this.addApiKey());
        this.elements.newApiKey.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addApiKey();
        });

        // 輸出區事件
        this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
        this.elements.exportBtn.addEventListener('click', () => this.showExportModal());
        this.elements.saveHistoryBtn.addEventListener('click', () => this.toggleStarred());

        // 頁首按鈕事件
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.historyBtn.addEventListener('click', () => this.openHistorySidebar());
        this.elements.templateBtn.addEventListener('click', () => this.openTemplateSidebar());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettingsSidebar());

        // 側邊欄事件
        this.elements.historyClose.addEventListener('click', () => this.closeHistorySidebar());
        this.elements.templateClose.addEventListener('click', () => this.closeTemplateSidebar());
        this.elements.settingsClose.addEventListener('click', () => this.closeSettingsSidebar());

        this.elements.historySearch.addEventListener('input', () => this.filterHistory());
        this.elements.historyFilter.addEventListener('change', () => this.filterHistory());

        this.elements.templateSearch.addEventListener('input', () => this.filterTemplates());
        this.elements.templateCategory.addEventListener('change', () => this.filterTemplates());

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * 更新字元計數
     */
    updateCharCount() {
        const text = this.elements.inputText.value;
        this.elements.charCount.textContent = `${text.length} 字元`;
    }

    /**
     * 清除輸入
     */
    clearInput() {
        this.elements.inputText.value = '';
        this.updateCharCount();
        this.elements.inputText.focus();
    }

    /**
     * 轉換提示詞
     */
    async convert() {
        if (this.state.isConverting) {
            return;
        }

        const inputText = this.elements.inputText.value.trim();

        // 驗證輸入
        const validation = Validators.validateInputText(inputText);
        if (!validation.valid) {
            this.showToast(validation.error, 'warning');
            return;
        }

        // 檢查 API Keys
        const stats = this.apiManager.getStats();
        if (!stats.hasAvailable) {
            this.showToast('請先新增至少一個 API Key', 'warning');
            this.openApiKeyPanel();
            return;
        }

        // 開始轉換
        this.state.isConverting = true;
        this.showLoading(true);
        this.elements.convertBtn.disabled = true;

        try {
            // 呼叫 API
            const result = await this.geminiClient.convert(inputText);

            if (result.success) {
                // 顯示結果
                this.displayResult(result);

                // 儲存歷史記錄
                this.historyManager.addRecord({
                    input: inputText,
                    output: result.output,
                    status: 'success',
                    duration: result.metadata.duration,
                    keyId: result.metadata.keyId,
                    model: result.metadata.model
                });

                // 重新渲染歷史記錄
                this.renderHistory();

                this.showToast('轉換成功！', 'success');
            } else {
                this.showToast(`轉換失敗：${result.error}`, 'error');

                // 儲存失敗記錄
                this.historyManager.addRecord({
                    input: inputText,
                    output: null,
                    status: 'error',
                    error: result.error,
                    duration: result.metadata.duration,
                    keyId: result.metadata.keyId,
                    model: result.metadata.model
                });
            }

        } catch (error) {
            console.error('[App] 轉換錯誤:', error);
            this.showToast('發生未預期的錯誤', 'error');
        } finally {
            this.state.isConverting = false;
            this.showLoading(false);
            this.elements.convertBtn.disabled = false;
        }
    }

    /**
     * 顯示結果
     */
    displayResult(result) {
        this.state.lastResult = result;

        // 顯示輸出區
        this.elements.outputSection.style.display = 'block';

        // 顯示轉換結果
        this.elements.outputText.textContent = result.output;

        // 顯示元資料
        const meta = result.metadata;
        this.elements.outputMeta.innerHTML = `
            <span>⏱️ 執行時間: ${meta.duration}ms</span>
            <span>📊 輸出長度: ${meta.outputLength} 字元</span>
            <span>🤖 模型: ${meta.model}</span>
        `;

        // 捲動到結果
        this.elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * 複製輸出
     */
    async copyOutput() {
        if (!this.state.lastResult) {
            return;
        }

        const result = await this.exportManager.copyToClipboard(this.state.lastResult.output);

        if (result.success) {
            this.showToast('已複製到剪貼簿！', 'success');
        } else {
            this.showToast('複製失敗', 'error');
        }
    }

    /**
     * 顯示匯出對話框
     */
    showExportModal() {
        if (!this.state.lastResult) {
            return;
        }

        // 簡化版：直接匯出為 Markdown
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `prompt-to-context-${timestamp}.md`;

        this.exportManager.export({
            input: this.elements.inputText.value,
            output: this.state.lastResult.output,
            metadata: this.state.lastResult.metadata
        }, 'md', filename);

        this.showToast('已匯出檔案！', 'success');
    }

    /**
     * 切換收藏狀態
     */
    toggleStarred() {
        // 此功能需要在歷史記錄中實現
        this.showToast('此功能將在歷史記錄中實現', 'info');
    }

    /**
     * 新增 API Key
     */
    async addApiKey() {
        const apiKey = this.elements.newApiKey.value.trim();

        if (!apiKey) {
            this.showToast('請輸入 API Key', 'warning');
            return;
        }

        const result = await this.apiManager.addKey(apiKey);

        if (result.success) {
            this.showToast('API Key 已新增！', 'success');
            this.elements.newApiKey.value = '';
            this.renderApiKeys();
        } else {
            this.showToast(`新增失敗：${result.error}`, 'error');
        }
    }

    /**
     * 刪除 API Key
     */
    async removeApiKey(keyId) {
        if (!confirm('確定要刪除此 API Key 嗎？')) {
            return;
        }

        const result = await this.apiManager.removeKey(keyId);

        if (result.success) {
            this.showToast('API Key 已刪除', 'success');
            this.renderApiKeys();
        } else {
            this.showToast(`刪除失敗：${result.error}`, 'error');
        }
    }

    /**
     * 渲染 API Keys
     */
    renderApiKeys() {
        const keys = this.apiManager.getAllKeys();

        if (keys.length === 0) {
            this.elements.apiKeyList.innerHTML = `
                <div class="api-key-empty">
                    <p>尚未設定 API Key</p>
                    <p class="hint">請新增至少一個 Gemini API Key 以開始使用</p>
                </div>
            `;
            return;
        }

        // 新增顯示/隱藏切換按鈕
        const toggleButton = `
            <div style="margin-bottom: 10px; text-align: right;">
                <button class="btn btn-secondary" onclick="app.toggleShowApiKeys()" style="font-size: 0.875rem;">
                    <span class="icon">${this.state.showApiKeys ? '🙈' : '👁️'}</span>
                    ${this.state.showApiKeys ? '隱藏' : '顯示'} API Keys
                </button>
            </div>
        `;

        const keysList = keys.map(key => {
            // 如果顯示模式開啟，從 apiManager 取得完整的 key
            let displayKey = key.key;
            if (this.state.showApiKeys) {
                // 找到原始的 key 物件
                const fullKey = this.apiManager.keys.find(k => k.id === key.id);
                if (fullKey) {
                    displayKey = fullKey.key;
                }
            }

            return `
                <div class="api-key-item">
                    <span class="api-key-status ${key.status}"></span>
                    <span class="api-key-value" style="font-family: var(--font-mono); user-select: ${this.state.showApiKeys ? 'text' : 'none'};">${displayKey}</span>
                    <div class="api-key-actions">
                        ${this.state.showApiKeys ? `
                        <button class="btn-icon" onclick="app.copyApiKey('${key.id}')" title="複製">
                            <span class="icon">📋</span>
                        </button>
                        ` : ''}
                        <button class="btn-icon" onclick="app.removeApiKey('${key.id}')" title="刪除">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.apiKeyList.innerHTML = toggleButton + keysList;
    }

    /**
     * 切換顯示/隱藏 API Keys
     */
    toggleShowApiKeys() {
        this.state.showApiKeys = !this.state.showApiKeys;
        this.renderApiKeys();
    }

    /**
     * 複製 API Key
     */
    async copyApiKey(keyId) {
        const fullKey = this.apiManager.keys.find(k => k.id === keyId);
        if (!fullKey) {
            this.showToast('找不到 API Key', 'error');
            return;
        }

        const result = await this.exportManager.copyToClipboard(fullKey.key);
        if (result.success) {
            this.showToast('API Key 已複製！', 'success');
        } else {
            this.showToast('複製失敗', 'error');
        }
    }

    /**
     * 檢查 API Keys
     */
    checkApiKeys() {
        const stats = this.apiManager.getStats();

        if (!stats.hasAvailable) {
            // 初次載入時只開啟面板，不顯示提示（避免干擾使用者）
            // Toast 提示只在轉換時顯示（見 convert() 函數）
            this.openApiKeyPanel();
        }
    }

    /**
     * 切換 API Key 面板
     */
    toggleApiKeyPanel() {
        this.elements.apiKeyPanel.classList.toggle('collapsed');
    }

    /**
     * 開啟 API Key 面板
     */
    openApiKeyPanel() {
        this.elements.apiKeyPanel.classList.remove('collapsed');
    }

    /**
     * 切換主題
     */
    toggleTheme() {
        this.state.currentTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.state.currentTheme);
        StorageManager.setTheme(this.state.currentTheme);

        const icon = this.state.currentTheme === 'dark' ? '☀️' : '🌙';
        this.elements.themeToggle.querySelector('.icon').textContent = icon;
    }

    /**
     * 載入主題
     */
    loadTheme() {
        const savedTheme = StorageManager.getTheme();
        this.state.currentTheme = savedTheme;
        this.applyTheme(savedTheme);

        const icon = savedTheme === 'dark' ? '☀️' : '🌙';
        this.elements.themeToggle.querySelector('.icon').textContent = icon;
    }

    /**
     * 套用主題
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    /**
     * 開啟歷史記錄側邊欄
     */
    openHistorySidebar() {
        this.elements.historySidebar.classList.add('open');
        this.renderHistory();
    }

    /**
     * 關閉歷史記錄側邊欄
     */
    closeHistorySidebar() {
        this.elements.historySidebar.classList.remove('open');
    }

    /**
     * 開啟範本側邊欄
     */
    openTemplateSidebar() {
        this.elements.templateSidebar.classList.add('open');
        this.renderTemplates();
    }

    /**
     * 關閉範本側邊欄
     */
    closeTemplateSidebar() {
        this.elements.templateSidebar.classList.remove('open');
    }

    /**
     * 開啟設定側邊欄
     */
    openSettingsSidebar() {
        this.elements.settingsSidebar.classList.add('open');
        this.updateStorageInfo();
    }

    /**
     * 關閉設定側邊欄
     */
    closeSettingsSidebar() {
        this.elements.settingsSidebar.classList.remove('open');
    }

    /**
     * 渲染歷史記錄
     */
    renderHistory() {
        const history = this.historyManager.getHistory({ status: 'all' });

        if (history.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="empty-state">
                    <p>尚無歷史記錄</p>
                </div>
            `;
            return;
        }

        this.elements.historyList.innerHTML = history.slice(0, 20).map(record => `
            <div class="history-item" onclick="app.loadHistoryRecord('${record.id}')">
                <div class="history-input">${this.truncate(record.input, 100)}</div>
                <div class="history-meta">
                    <span>${new Date(record.metadata.timestamp).toLocaleString('zh-TW')}</span>
                    ${record.isStarred ? '<span>⭐</span>' : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * 篩選歷史記錄
     */
    filterHistory() {
        const search = this.elements.historySearch.value;
        const filter = this.elements.historyFilter.value;

        const history = this.historyManager.getHistory({
            search,
            status: filter
        });

        this.elements.historyList.innerHTML = history.map(record => `
            <div class="history-item" onclick="app.loadHistoryRecord('${record.id}')">
                <div class="history-input">${this.truncate(record.input, 100)}</div>
                <div class="history-meta">
                    <span>${new Date(record.metadata.timestamp).toLocaleString('zh-TW')}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * 載入歷史記錄
     */
    loadHistoryRecord(recordId) {
        const record = this.historyManager.getRecord(recordId);
        if (!record) return;

        this.elements.inputText.value = record.input;
        this.updateCharCount();

        if (record.output) {
            this.displayResult({
                output: record.output,
                metadata: record.metadata
            });
        }

        this.closeHistorySidebar();
    }

    /**
     * 渲染範本
     */
    renderTemplates() {
        const templates = this.templateManager.getTemplates();

        if (templates.length === 0) {
            this.elements.templateList.innerHTML = `
                <div class="empty-state">
                    <p>尚無範本</p>
                </div>
            `;
            return;
        }

        this.elements.templateList.innerHTML = templates.map(template => `
            <div class="template-item" onclick="app.applyTemplate('${template.id}')">
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            </div>
        `).join('');
    }

    /**
     * 篩選範本
     */
    filterTemplates() {
        const search = this.elements.templateSearch.value;
        const category = this.elements.templateCategory.value;

        const templates = this.templateManager.getTemplates({
            search,
            category
        });

        this.elements.templateList.innerHTML = templates.map(template => `
            <div class="template-item" onclick="app.applyTemplate('${template.id}')">
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            </div>
        `).join('');
    }

    /**
     * 套用範本
     */
    applyTemplate(templateId) {
        const result = this.templateManager.applyTemplate(templateId, {});

        if (result.success) {
            this.elements.inputText.value = result.output;
            this.updateCharCount();
            this.closeTemplateSidebar();
            this.showToast('已套用範本', 'success');
        }
    }

    /**
     * 處理鍵盤快捷鍵
     */
    handleKeyboard(e) {
        // Ctrl+Enter: 轉換
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.convert();
        }

        // Ctrl+K: API Keys
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            this.toggleApiKeyPanel();
        }

        // Ctrl+H: 歷史記錄
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.openHistorySidebar();
        }

        // Esc: 關閉側邊欄
        if (e.key === 'Escape') {
            this.closeHistorySidebar();
            this.closeTemplateSidebar();
            this.closeSettingsSidebar();
        }
    }

    /**
     * 顯示載入狀態
     */
    showLoading(show) {
        this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    /**
     * 顯示 Toast 通知
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="icon">${this.getToastIcon(type)}</span>
            <span>${message}</span>
        `;

        this.elements.toastContainer.appendChild(toast);

        // 3 秒後移除
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 取得 Toast 圖示
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * 截斷文字
     */
    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * 更新儲存空間資訊
     */
    updateStorageInfo() {
        try {
            // 計算 localStorage 使用量
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }

            // 轉換為 KB
            const usedKB = (totalSize / 1024).toFixed(2);

            // localStorage 限制通常是 5-10 MB，這裡假設 5 MB
            const limitKB = 5 * 1024;
            const usagePercent = ((totalSize / 1024) / limitKB * 100).toFixed(1);

            // 更新進度條
            this.elements.storageUsedBar.style.width = `${Math.min(usagePercent, 100)}%`;

            // 更新文字
            this.elements.storageText.textContent = `已使用 ${usedKB} KB / ${limitKB} KB (${usagePercent}%)`;

            // 如果使用量超過 80%，改變顏色警告
            if (usagePercent > 80) {
                this.elements.storageUsedBar.style.background = 'linear-gradient(90deg, var(--warning-color), var(--error-color))';
            } else {
                this.elements.storageUsedBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))';
            }
        } catch (error) {
            console.error('[App] 更新儲存空間資訊失敗:', error);
            this.elements.storageText.textContent = '無法取得儲存空間資訊';
        }
    }

    /**
     * 匯出所有資料
     */
    exportAllData() {
        try {
            const data = {
                apiKeys: this.apiManager.getAllKeys(),
                history: this.historyManager.getHistory({ status: 'all' }),
                templates: this.templateManager.getTemplates(),
                theme: this.state.currentTheme,
                exportTime: new Date().toISOString()
            };

            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const filename = `prompt-to-context-backup-${timestamp}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            URL.revokeObjectURL(url);

            this.showToast('資料已匯出！', 'success');
        } catch (error) {
            console.error('[App] 匯出資料失敗:', error);
            this.showToast('匯出失敗', 'error');
        }
    }

    /**
     * 匯入資料
     */
    importAllData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;

                const text = await file.text();
                const data = JSON.parse(text);

                // 驗證資料格式
                if (!data.apiKeys || !data.history || !data.templates) {
                    throw new Error('無效的備份檔案格式');
                }

                // 確認匯入
                if (!confirm('匯入將覆蓋現有資料，確定要繼續嗎？')) {
                    return;
                }

                // 匯入資料
                // API Keys
                for (const key of data.apiKeys) {
                    await this.apiManager.addKey(key.key);
                }

                // 歷史記錄
                for (const record of data.history) {
                    this.historyManager.addRecord(record);
                }

                // 主題
                if (data.theme) {
                    this.state.currentTheme = data.theme;
                    this.applyTheme(data.theme);
                    StorageManager.setTheme(data.theme);
                }

                // 重新渲染
                this.renderApiKeys();
                this.renderHistory();
                this.renderTemplates();
                this.updateStorageInfo();

                this.showToast('資料匯入成功！', 'success');
            } catch (error) {
                console.error('[App] 匯入資料失敗:', error);
                this.showToast(`匯入失敗：${error.message}`, 'error');
            }
        };

        input.click();
    }

    /**
     * 清除歷史記錄
     */
    clearHistory() {
        if (!confirm('確定要清除所有歷史記錄嗎？此操作無法復原。')) {
            return;
        }

        try {
            this.historyManager.clearHistory();
            this.renderHistory();
            this.updateStorageInfo();
            this.showToast('歷史記錄已清除', 'success');
        } catch (error) {
            console.error('[App] 清除歷史記錄失敗:', error);
            this.showToast('清除失敗', 'error');
        }
    }

    /**
     * 清除所有資料
     */
    clearAllData() {
        if (!confirm('確定要清除所有資料嗎？此操作無法復原！')) {
            return;
        }

        if (!confirm('這將刪除所有 API Keys、歷史記錄和設定。確定要繼續嗎？')) {
            return;
        }

        try {
            // 清除所有 localStorage
            localStorage.clear();

            // 重新載入頁面
            location.reload();
        } catch (error) {
            console.error('[App] 清除所有資料失敗:', error);
            this.showToast('清除失敗', 'error');
        }
    }
}

// 初始化應用程式
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    console.log('[App] 應用程式已啟動');
});
