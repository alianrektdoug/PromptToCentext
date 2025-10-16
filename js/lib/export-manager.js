/**
 * 匯出管理器
 * 處理各種格式的匯出功能
 */

class ExportManager {
    constructor() {
        this.formats = ['txt', 'md', 'json', 'html', 'csv'];
    }

    /**
     * 匯出轉換結果
     * @param {Object} data - 要匯出的資料
     * @param {string} format - 匯出格式
     * @param {string} filename - 檔案名稱
     * @returns {Object} 結果
     */
    export(data, format, filename) {
        const result = {
            success: false,
            error: null
        };

        try {
            // 驗證格式
            if (!this.formats.includes(format)) {
                result.error = '不支援的匯出格式';
                return result;
            }

            // 驗證檔名
            const filenameValidation = Validators.validateFilename(filename);
            if (!filenameValidation.valid) {
                result.error = filenameValidation.error;
                return result;
            }

            // 產生內容
            let content;
            let mimeType;

            switch (format) {
                case 'txt':
                    content = this.toText(data);
                    mimeType = 'text/plain';
                    break;
                case 'md':
                    content = this.toMarkdown(data);
                    mimeType = 'text/markdown';
                    break;
                case 'json':
                    content = this.toJSON(data);
                    mimeType = 'application/json';
                    break;
                case 'html':
                    content = this.toHTML(data);
                    mimeType = 'text/html';
                    break;
                case 'csv':
                    content = this.toCSV(data);
                    mimeType = 'text/csv';
                    break;
                default:
                    result.error = '未知的格式';
                    return result;
            }

            // 下載檔案
            this.downloadFile(content, filename, mimeType);

            result.success = true;
            console.log('[ExportManager] 匯出成功:', filename);

        } catch (error) {
            console.error('[ExportManager] 匯出失敗:', error);
            result.error = error.message;
        }

        return result;
    }

    /**
     * 轉換為純文字
     * @param {Object} data - 資料
     * @returns {string} 純文字
     */
    toText(data) {
        let text = '';

        // 標題
        text += '='.repeat(50) + '\n';
        text += 'Prompt-to-Context 轉換結果\n';
        text += '='.repeat(50) + '\n\n';

        // 輸入
        text += '【原始輸入】\n';
        text += '-'.repeat(50) + '\n';
        text += data.input + '\n\n';

        // 輸出
        if (data.output) {
            text += '【轉換結果】\n';
            text += '-'.repeat(50) + '\n';
            text += data.output + '\n\n';
        }

        // 元資料
        if (data.metadata) {
            text += '【元資料】\n';
            text += '-'.repeat(50) + '\n';
            text += `轉換時間: ${new Date(data.metadata.timestamp || Date.now()).toLocaleString('zh-TW')}\n`;
            if (data.metadata.duration) {
                text += `執行時間: ${data.metadata.duration}ms\n`;
            }
            text += `輸入長度: ${data.metadata.inputLength} 字元\n`;
            text += `輸出長度: ${data.metadata.outputLength} 字元\n`;
            if (data.metadata.model) {
                text += `使用模型: ${data.metadata.model}\n`;
            }
        }

        text += '\n' + '='.repeat(50) + '\n';
        text += '由 Prompt-to-Context 生成\n';
        text += 'https://github.com/yourusername/PromptToCentext\n';

        return text;
    }

    /**
     * 轉換為 Markdown
     * @param {Object} data - 資料
     * @returns {string} Markdown
     */
    toMarkdown(data) {
        let md = '';

        // 標題
        md += '# Prompt-to-Context 轉換結果\n\n';

        // 輸入
        md += '## 原始輸入\n\n';
        md += '```\n';
        md += data.input + '\n';
        md += '```\n\n';

        // 輸出
        if (data.output) {
            md += '## 轉換結果\n\n';
            md += data.output + '\n\n';
        }

        // 元資料
        if (data.metadata) {
            md += '## 元資料\n\n';
            md += '| 項目 | 值 |\n';
            md += '|------|----|\n';
            md += `| 轉換時間 | ${new Date(data.metadata.timestamp || Date.now()).toLocaleString('zh-TW')} |\n`;
            if (data.metadata.duration) {
                md += `| 執行時間 | ${data.metadata.duration}ms |\n`;
            }
            md += `| 輸入長度 | ${data.metadata.inputLength} 字元 |\n`;
            md += `| 輸出長度 | ${data.metadata.outputLength} 字元 |\n`;
            if (data.metadata.model) {
                md += `| 使用模型 | ${data.metadata.model} |\n`;
            }
        }

        md += '\n---\n\n';
        md += '*由 [Prompt-to-Context](https://github.com/yourusername/PromptToCentext) 生成*\n';

        return md;
    }

    /**
     * 轉換為 JSON
     * @param {Object} data - 資料
     * @returns {string} JSON
     */
    toJSON(data) {
        return JSON.stringify({
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            data: data
        }, null, 2);
    }

    /**
     * 轉換為 HTML
     * @param {Object} data - 資料
     * @returns {string} HTML
     */
    toHTML(data) {
        const escapedInput = this.escapeHtml(data.input);
        const escapedOutput = data.output ? this.escapeHtml(data.output) : '';

        return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt-to-Context 轉換結果</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #4F46E5;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 10px;
        }
        h2 {
            color: #6366F1;
            margin-top: 30px;
            border-left: 4px solid #6366F1;
            padding-left: 15px;
        }
        .content {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
            margin: 15px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .output {
            background: #EEF2FF;
            border-color: #C7D2FE;
        }
        .metadata {
            background: #F3F4F6;
            padding: 15px;
            border-radius: 8px;
            font-size: 0.9em;
        }
        .metadata table {
            width: 100%;
            border-collapse: collapse;
        }
        .metadata td {
            padding: 8px;
            border-bottom: 1px solid #E5E7EB;
        }
        .metadata td:first-child {
            font-weight: 600;
            width: 30%;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>🎯 Prompt-to-Context 轉換結果</h1>

    <h2>原始輸入</h2>
    <div class="content">${escapedInput}</div>

    ${data.output ? `
    <h2>轉換結果</h2>
    <div class="content output">${escapedOutput}</div>
    ` : ''}

    ${data.metadata ? `
    <h2>元資料</h2>
    <div class="metadata">
        <table>
            <tr>
                <td>轉換時間</td>
                <td>${new Date(data.metadata.timestamp || Date.now()).toLocaleString('zh-TW')}</td>
            </tr>
            ${data.metadata.duration ? `
            <tr>
                <td>執行時間</td>
                <td>${data.metadata.duration}ms</td>
            </tr>
            ` : ''}
            <tr>
                <td>輸入長度</td>
                <td>${data.metadata.inputLength} 字元</td>
            </tr>
            <tr>
                <td>輸出長度</td>
                <td>${data.metadata.outputLength} 字元</td>
            </tr>
            ${data.metadata.model ? `
            <tr>
                <td>使用模型</td>
                <td>${data.metadata.model}</td>
            </tr>
            ` : ''}
        </table>
    </div>
    ` : ''}

    <div class="footer">
        由 <a href="https://github.com/yourusername/PromptToCentext">Prompt-to-Context</a> 生成
    </div>
</body>
</html>`;
    }

    /**
     * 轉換為 CSV
     * @param {Object} data - 資料
     * @returns {string} CSV
     */
    toCSV(data) {
        const headers = ['欄位', '內容'];
        const rows = [
            ['原始輸入', this.escapeCSV(data.input)],
            ['轉換結果', this.escapeCSV(data.output || '')],
            ['轉換時間', new Date(data.metadata?.timestamp || Date.now()).toLocaleString('zh-TW')],
            ['執行時間(ms)', data.metadata?.duration || ''],
            ['輸入長度', data.metadata?.inputLength || ''],
            ['輸出長度', data.metadata?.outputLength || ''],
            ['使用模型', data.metadata?.model || '']
        ];

        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    /**
     * 批次匯出
     * @param {Array} dataArray - 資料陣列
     * @param {string} format - 匯出格式
     * @param {string} filename - 檔案名稱
     * @returns {Object} 結果
     */
    exportBatch(dataArray, format, filename) {
        const result = {
            success: false,
            error: null
        };

        try {
            if (format === 'json') {
                // JSON 格式支援陣列
                const content = JSON.stringify({
                    version: '1.0.0',
                    exportedAt: new Date().toISOString(),
                    count: dataArray.length,
                    data: dataArray
                }, null, 2);

                this.downloadFile(content, filename, 'application/json');
                result.success = true;

            } else if (format === 'csv') {
                // CSV 格式合併所有記錄
                const headers = [
                    'ID',
                    '原始輸入',
                    '轉換結果',
                    '轉換時間',
                    '執行時間(ms)',
                    '輸入長度',
                    '輸出長度',
                    '使用模型'
                ];

                const rows = dataArray.map((data, index) => [
                    index + 1,
                    this.escapeCSV(data.input),
                    this.escapeCSV(data.output || ''),
                    new Date(data.metadata?.timestamp || Date.now()).toLocaleString('zh-TW'),
                    data.metadata?.duration || '',
                    data.metadata?.inputLength || '',
                    data.metadata?.outputLength || '',
                    data.metadata?.model || ''
                ]);

                const content = [headers, ...rows]
                    .map(row => row.join(','))
                    .join('\n');

                this.downloadFile(content, filename, 'text/csv');
                result.success = true;

            } else {
                // 其他格式打包成 ZIP（需要 JSZip 函式庫）
                result.error = '批次匯出目前僅支援 JSON 和 CSV 格式';
            }

        } catch (error) {
            console.error('[ExportManager] 批次匯出失敗:', error);
            result.error = error.message;
        }

        return result;
    }

    /**
     * 下載檔案
     * @param {string} content - 檔案內容
     * @param {string} filename - 檔案名稱
     * @param {string} mimeType - MIME 類型
     */
    downloadFile(content, filename, mimeType) {
        // 建立 Blob
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });

        // 建立下載連結
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';

        // 觸發下載
        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 複製到剪貼簿
     * @param {string} text - 文字
     * @returns {Promise<Object>} 結果
     */
    async copyToClipboard(text) {
        const result = {
            success: false,
            error: null
        };

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // 使用 Clipboard API
                await navigator.clipboard.writeText(text);
                result.success = true;
            } else {
                // 使用 fallback 方法
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);

                if (successful) {
                    result.success = true;
                } else {
                    result.error = '複製失敗';
                }
            }

            if (result.success) {
                console.log('[ExportManager] 已複製到剪貼簿');
            }

        } catch (error) {
            console.error('[ExportManager] 複製失敗:', error);
            result.error = error.message;
        }

        return result;
    }

    /**
     * 分享（使用 Web Share API）
     * @param {Object} data - 分享資料
     * @returns {Promise<Object>} 結果
     */
    async share(data) {
        const result = {
            success: false,
            error: null
        };

        try {
            if (navigator.share) {
                await navigator.share({
                    title: data.title || 'Prompt-to-Context 轉換結果',
                    text: data.text,
                    url: data.url
                });
                result.success = true;
                console.log('[ExportManager] 分享成功');
            } else {
                result.error = '您的瀏覽器不支援 Web Share API';
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[ExportManager] 使用者取消分享');
            } else {
                console.error('[ExportManager] 分享失敗:', error);
                result.error = error.message;
            }
        }

        return result;
    }

    /**
     * 跳脫 HTML 特殊字元
     * @param {string} text - 文字
     * @returns {string} 跳脫後的文字
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
     * 取得支援的格式
     * @returns {Array} 格式陣列
     */
    getSupportedFormats() {
        return this.formats.map(format => ({
            format,
            extension: format,
            name: this.getFormatName(format),
            description: this.getFormatDescription(format)
        }));
    }

    /**
     * 取得格式名稱
     * @param {string} format - 格式
     * @returns {string} 名稱
     */
    getFormatName(format) {
        const names = {
            txt: '純文字',
            md: 'Markdown',
            json: 'JSON',
            html: 'HTML',
            csv: 'CSV'
        };
        return names[format] || format.toUpperCase();
    }

    /**
     * 取得格式描述
     * @param {string} format - 格式
     * @returns {string} 描述
     */
    getFormatDescription(format) {
        const descriptions = {
            txt: '適合閱讀和列印',
            md: '適合文件編輯和版本控制',
            json: '適合程式處理和資料交換',
            html: '適合網頁瀏覽和分享',
            csv: '適合 Excel 開啟和資料分析'
        };
        return descriptions[format] || '';
    }
}

console.log('[ExportManager] 匯出管理器已載入');
