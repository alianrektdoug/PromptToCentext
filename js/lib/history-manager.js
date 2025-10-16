/**
 * 歷史記錄管理器
 * 管理轉換歷史的記錄、搜尋和統計
 */

class HistoryManager {
    constructor() {
        this.history = [];
        this.maxItems = 100;
        this.loadHistory();
    }

    /**
     * 載入歷史記錄
     */
    loadHistory() {
        try {
            this.history = StorageManager.getHistory();
            console.log(`[HistoryManager] 已載入 ${this.history.length} 筆歷史記錄`);
        } catch (error) {
            console.error('[HistoryManager] 載入歷史記錄失敗:', error);
            this.history = [];
        }
    }

    /**
     * 儲存歷史記錄
     */
    saveHistory() {
        try {
            const success = StorageManager.setHistory(this.history);
            if (success) {
                console.log('[HistoryManager] 歷史記錄已儲存');
            }
            return success;
        } catch (error) {
            console.error('[HistoryManager] 儲存歷史記錄失敗:', error);
            return false;
        }
    }

    /**
     * 新增歷史記錄
     * @param {Object} record - 記錄資料
     * @returns {Object} 結果
     */
    addRecord(record) {
        const result = {
            success: false,
            error: null,
            recordId: null
        };

        try {
            // 產生 ID
            const recordId = 'record_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

            // 建立記錄
            const historyRecord = {
                id: recordId,
                input: record.input,
                output: record.output,
                status: record.status || 'success',
                error: record.error || null,
                metadata: {
                    inputLength: record.input.length,
                    outputLength: record.output ? record.output.length : 0,
                    duration: record.duration || null,
                    keyId: record.keyId || null,
                    model: record.model || 'gemini-1.5-flash',
                    timestamp: Date.now()
                },
                isStarred: false,
                tags: record.tags || [],
                notes: ''
            };

            // 新增到開頭
            this.history.unshift(historyRecord);

            // 限制數量
            if (this.history.length > this.maxItems) {
                this.history = this.history.slice(0, this.maxItems);
            }

            // 儲存
            const saved = this.saveHistory();
            if (saved) {
                result.success = true;
                result.recordId = recordId;
                console.log('[HistoryManager] 歷史記錄已新增:', recordId);
            } else {
                result.error = '儲存失敗';
                this.history.shift(); // 回滾
            }
        } catch (error) {
            console.error('[HistoryManager] 新增歷史記錄失敗:', error);
            result.error = error.message;
        }

        return result;
    }

    /**
     * 取得歷史記錄
     * @param {Object} filters - 篩選條件
     * @returns {Array} 歷史記錄陣列
     */
    getHistory(filters = {}) {
        let filtered = [...this.history];

        // 依狀態篩選
        if (filters.status && filters.status !== 'all') {
            if (filters.status === 'success') {
                filtered = filtered.filter(r => r.status === 'success');
            } else if (filters.status === 'failed') {
                filtered = filtered.filter(r => r.status === 'error');
            } else if (filters.status === 'starred') {
                filtered = filtered.filter(r => r.isStarred);
            }
        }

        // 依時間範圍篩選
        if (filters.dateFrom) {
            filtered = filtered.filter(r => r.metadata.timestamp >= filters.dateFrom);
        }

        if (filters.dateTo) {
            filtered = filtered.filter(r => r.metadata.timestamp <= filters.dateTo);
        }

        // 依標籤篩選
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(r =>
                filters.tags.some(tag => r.tags.includes(tag))
            );
        }

        // 搜尋
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(r =>
                r.input.toLowerCase().includes(searchLower) ||
                (r.output && r.output.toLowerCase().includes(searchLower)) ||
                (r.notes && r.notes.toLowerCase().includes(searchLower))
            );
        }

        // 排序
        if (filters.sortBy === 'duration') {
            filtered.sort((a, b) => (b.metadata.duration || 0) - (a.metadata.duration || 0));
        } else {
            // 預設：依時間排序（新的在前）
            filtered.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
        }

        // 分頁
        if (filters.page && filters.pageSize) {
            const start = (filters.page - 1) * filters.pageSize;
            const end = start + filters.pageSize;
            filtered = filtered.slice(start, end);
        }

        return filtered;
    }

    /**
     * 取得單筆記錄
     * @param {string} recordId - 記錄 ID
     * @returns {Object|null} 記錄
     */
    getRecord(recordId) {
        return this.history.find(r => r.id === recordId) || null;
    }

    /**
     * 更新記錄
     * @param {string} recordId - 記錄 ID
     * @param {Object} updates - 更新資料
     * @returns {Object} 結果
     */
    updateRecord(recordId, updates) {
        const result = {
            success: false,
            error: null
        };

        const record = this.getRecord(recordId);
        if (!record) {
            result.error = '記錄不存在';
            return result;
        }

        // 更新允許修改的欄位
        if (updates.isStarred !== undefined) {
            record.isStarred = updates.isStarred;
        }

        if (updates.notes !== undefined) {
            record.notes = updates.notes;
        }

        if (updates.tags !== undefined) {
            record.tags = updates.tags;
        }

        // 儲存
        const saved = this.saveHistory();
        if (saved) {
            result.success = true;
            console.log('[HistoryManager] 記錄已更新:', recordId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 刪除記錄
     * @param {string} recordId - 記錄 ID
     * @returns {Object} 結果
     */
    deleteRecord(recordId) {
        const result = {
            success: false,
            error: null
        };

        const index = this.history.findIndex(r => r.id === recordId);
        if (index === -1) {
            result.error = '記錄不存在';
            return result;
        }

        this.history.splice(index, 1);

        const saved = this.saveHistory();
        if (saved) {
            result.success = true;
            console.log('[HistoryManager] 記錄已刪除:', recordId);
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 批次刪除記錄
     * @param {Array} recordIds - 記錄 ID 陣列
     * @returns {Object} 結果
     */
    deleteRecords(recordIds) {
        const result = {
            success: false,
            error: null,
            deleted: 0
        };

        let deleted = 0;
        for (const recordId of recordIds) {
            const index = this.history.findIndex(r => r.id === recordId);
            if (index !== -1) {
                this.history.splice(index, 1);
                deleted++;
            }
        }

        const saved = this.saveHistory();
        if (saved) {
            result.success = true;
            result.deleted = deleted;
            console.log('[HistoryManager] 已刪除', deleted, '筆記錄');
        } else {
            result.error = '儲存失敗';
        }

        return result;
    }

    /**
     * 清除所有記錄
     * @returns {boolean} 是否成功
     */
    clearAll() {
        this.history = [];
        return this.saveHistory();
    }

    /**
     * 取得統計資訊
     * @param {Object} filters - 篩選條件
     * @returns {Object} 統計資訊
     */
    getStats(filters = {}) {
        const records = this.getHistory(filters);

        const total = records.length;
        const success = records.filter(r => r.status === 'success').length;
        const failed = records.filter(r => r.status === 'error').length;
        const starred = records.filter(r => r.isStarred).length;

        // 計算平均轉換時間
        const durationsfiltered = records
            .filter(r => r.metadata.duration)
            .map(r => r.metadata.duration);

        const avgDuration = durationsfiltered.length > 0
            ? durationsfiltered.reduce((a, b) => a + b, 0) / durationsfiltered.length
            : 0;

        // 計算成功率
        const successRate = total > 0 ? (success / total * 100).toFixed(1) : 0;

        // 統計使用的模型
        const modelCounts = {};
        records.forEach(r => {
            const model = r.metadata.model || 'unknown';
            modelCounts[model] = (modelCounts[model] || 0) + 1;
        });

        // 統計每日使用量
        const dailyUsage = {};
        records.forEach(r => {
            const date = new Date(r.metadata.timestamp).toISOString().split('T')[0];
            dailyUsage[date] = (dailyUsage[date] || 0) + 1;
        });

        return {
            total,
            success,
            failed,
            starred,
            successRate: parseFloat(successRate),
            avgDuration: Math.round(avgDuration),
            modelCounts,
            dailyUsage
        };
    }

    /**
     * 取得所有標籤
     * @returns {Array} 標籤陣列
     */
    getAllTags() {
        const tagsSet = new Set();
        this.history.forEach(r => {
            r.tags.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }

    /**
     * 匯出歷史記錄
     * @param {Object} filters - 篩選條件
     * @param {string} format - 格式（json, csv）
     * @returns {string} 匯出資料
     */
    exportHistory(filters = {}, format = 'json') {
        const records = this.getHistory(filters);

        if (format === 'json') {
            return JSON.stringify(records, null, 2);
        } else if (format === 'csv') {
            return this.toCSV(records);
        }

        return '';
    }

    /**
     * 轉換為 CSV 格式
     * @param {Array} records - 記錄陣列
     * @returns {string} CSV 字串
     */
    toCSV(records) {
        if (records.length === 0) {
            return '';
        }

        // CSV 標題
        const headers = [
            'ID',
            '輸入',
            '輸出',
            '狀態',
            '錯誤',
            '時間',
            '輸入長度',
            '輸出長度',
            '執行時間(ms)',
            '收藏',
            '標籤',
            '備註'
        ];

        // CSV 內容
        const rows = records.map(r => [
            r.id,
            this.escapeCSV(r.input),
            this.escapeCSV(r.output || ''),
            r.status,
            this.escapeCSV(r.error || ''),
            new Date(r.metadata.timestamp).toISOString(),
            r.metadata.inputLength,
            r.metadata.outputLength,
            r.metadata.duration || '',
            r.isStarred ? '是' : '否',
            r.tags.join(';'),
            this.escapeCSV(r.notes)
        ]);

        // 組合 CSV
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    /**
     * 跳脫 CSV 特殊字元
     * @param {string} text - 文字
     * @returns {string} 跳脫後的文字
     */
    escapeCSV(text) {
        if (!text) return '';
        text = text.toString().replace(/"/g, '""');
        if (text.includes(',') || text.includes('\n') || text.includes('"')) {
            text = `"${text}"`;
        }
        return text;
    }

    /**
     * 匯入歷史記錄
     * @param {string} jsonString - JSON 字串
     * @param {boolean} merge - 是否合併
     * @returns {Object} 結果
     */
    importHistory(jsonString, merge = true) {
        const result = {
            success: false,
            error: null,
            imported: 0
        };

        try {
            const importedRecords = JSON.parse(jsonString);

            if (!Array.isArray(importedRecords)) {
                result.error = '資料格式錯誤';
                return result;
            }

            if (!merge) {
                this.history = [];
            }

            let imported = 0;
            for (const record of importedRecords) {
                // 驗證必要欄位
                if (!record.input) {
                    continue;
                }

                // 產生新 ID（避免衝突）
                const newId = 'record_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

                this.history.push({
                    ...record,
                    id: newId
                });

                imported++;

                // 限制數量
                if (this.history.length > this.maxItems) {
                    break;
                }
            }

            const saved = this.saveHistory();
            if (saved) {
                result.success = true;
                result.imported = imported;
            } else {
                result.error = '儲存失敗';
            }
        } catch (error) {
            console.error('[HistoryManager] 匯入失敗:', error);
            result.error = error.message;
        }

        return result;
    }
}

console.log('[HistoryManager] 歷史記錄管理器已載入');
