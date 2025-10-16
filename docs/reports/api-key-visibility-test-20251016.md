# API Key 顯示/隱藏功能測試報告

**日期**: 2025-10-16
**測試者**: Claude Code
**功能**: API Key 顯示/隱藏切換
**相關檔案**:
- `src/js/app.js` (line 19-23, 361-440)
- `src/css/styles.css` (line 333-347)

---

## 📋 測試目標

驗證使用者可以透過切換按鈕控制已儲存 API Keys 的顯示狀態，同時確保輸入時 API Key 始終可見。

---

## 🎯 測試範圍

### 1. 基本功能測試

#### 1.1 輸入階段 - API Key 可見性
- [ ] **測試**: 在 API Key 輸入框中輸入文字
- [ ] **預期**: 輸入的文字完全可見（type="text"）
- [ ] **實際**:
- [ ] **狀態**:

#### 1.2 預設狀態 - API Key 遮罩
- [ ] **測試**: 新增一個 API Key 後查看列表
- [ ] **預期**: API Key 顯示為遮罩格式（例如：AIza****123）
- [ ] **實際**:
- [ ] **狀態**:

#### 1.3 切換按鈕存在
- [ ] **測試**: 檢查是否有顯示/隱藏切換按鈕
- [ ] **預期**: 在 API Key 列表上方有切換按鈕，顯示 👁️ 圖示和「顯示 API Keys」文字
- [ ] **實際**:
- [ ] **狀態**:

#### 1.4 切換到顯示狀態
- [ ] **測試**: 點擊「顯示 API Keys」按鈕
- [ ] **預期**:
  - 按鈕文字變為「隱藏 API Keys」
  - 圖示變為 🙈
  - 所有 API Keys 顯示完整內容
  - 出現複製按鈕（📋）
- [ ] **實際**:
- [ ] **狀態**:

#### 1.5 複製功能
- [ ] **測試**: 在顯示狀態下點擊複製按鈕
- [ ] **預期**:
  - API Key 完整內容複製到剪貼簿
  - 顯示「API Key 已複製！」成功通知
- [ ] **實際**:
- [ ] **狀態**:

#### 1.6 切換回隱藏狀態
- [ ] **測試**: 再次點擊按鈕切換到隱藏
- [ ] **預期**:
  - 按鈕文字變回「顯示 API Keys」
  - 圖示變回 👁️
  - API Keys 重新遮罩
  - 複製按鈕消失
- [ ] **實際**:
- [ ] **狀態**:

---

### 2. 互動體驗測試

#### 2.1 視覺反饋
- [ ] **測試**: 滑鼠懸停在 API Key 上
- [ ] **預期**: 背景色變化提供視覺反饋
- [ ] **實際**:
- [ ] **狀態**:

#### 2.2 user-select 行為
- [ ] **測試**: 嘗試用滑鼠選取 API Key 文字
- [ ] **預期**:
  - 隱藏狀態：無法選取（user-select: none）
  - 顯示狀態：可以選取（user-select: text）
- [ ] **實際**:
- [ ] **狀態**:

#### 2.3 按鈕狀態持久性
- [ ] **測試**: 切換顯示狀態後新增新的 API Key
- [ ] **預期**: 列表重新渲染後保持當前顯示狀態
- [ ] **實際**:
- [ ] **狀態**:

---

### 3. 邊界條件測試

#### 3.1 空列表狀態
- [ ] **測試**: 刪除所有 API Keys
- [ ] **預期**: 顯示「尚未設定 API Key」提示，不顯示切換按鈕
- [ ] **實際**:
- [ ] **狀態**:

#### 3.2 單一 API Key
- [ ] **測試**: 只有一個 API Key 時測試切換
- [ ] **預期**: 功能正常運作
- [ ] **實際**:
- [ ] **狀態**:

#### 3.3 最大數量 API Keys
- [ ] **測試**: 新增 5 個 API Keys 後測試切換
- [ ] **預期**: 所有 Keys 同時切換顯示/隱藏
- [ ] **實際**:
- [ ] **狀態**:

#### 3.4 長 API Key 顯示
- [ ] **測試**: 測試超長的 API Key 字串
- [ ] **預期**: 使用 word-break: break-all 正確換行
- [ ] **實際**:
- [ ] **狀態**:

---

### 4. 安全性測試

#### 4.1 預設安全
- [ ] **測試**: 頁面載入時的預設狀態
- [ ] **預期**: showApiKeys 預設為 false，Keys 被遮罩
- [ ] **實際**:
- [ ] **狀態**:

#### 4.2 複製成功驗證
- [ ] **測試**: 複製後貼上到文字編輯器
- [ ] **預期**: 貼上的是完整的 API Key，不是遮罩版本
- [ ] **實際**:
- [ ] **狀態**:

#### 4.3 遮罩格式正確性
- [ ] **測試**: 檢查遮罩格式
- [ ] **預期**: 顯示前4個和後4個字元，中間用 **** 替代
- [ ] **實際**:
- [ ] **狀態**:

---

## 🎨 UI/UX 檢查清單

### 視覺設計
- [ ] 切換按鈕樣式與整體設計一致
- [ ] 圖示（👁️ / 🙈）清晰易懂
- [ ] API Key 字體使用 monospace，易於閱讀
- [ ] 複製按鈕對齊正確
- [ ] 顏色對比度符合可讀性標準

### 互動體驗
- [ ] 按鈕點擊有即時反饋
- [ ] Toast 通知顯示正確
- [ ] 動畫過渡流暢（transition: all 0.15s）
- [ ] 按鈕 hover 狀態明顯
- [ ] 鍵盤導航支援（Tab 鍵）

### 響應式設計
- [ ] 在桌面瀏覽器正常顯示
- [ ] 在平板裝置正常顯示
- [ ] 在手機裝置正常顯示
- [ ] 按鈕在小螢幕上不會被擠壓

---

## 🧪 測試步驟

### 準備工作
1. 開啟 Chrome 瀏覽器
2. 載入 `file:///C:/Users/alian/Desktop/github/PromptToCentext/src/index.html`
3. 開啟 DevTools (F12)
4. 確認沒有 Console 錯誤

### 執行測試

#### Test Case 1: 輸入可見性
```
步驟:
1. 找到 API Key 輸入框
2. 輸入測試 Key: "AIzaSyTestKey123456789"
3. 觀察輸入內容

驗證點:
✓ 輸入的每個字元都清晰可見
✓ 沒有任何遮罩或密碼點
```

#### Test Case 2: 新增與預設遮罩
```
步驟:
1. 點擊「新增 Key」按鈕
2. 觀察 API Key 列表

驗證點:
✓ Key 顯示為遮罩格式（例如：AIza****789）
✓ 切換按鈕顯示「顯示 API Keys」和 👁️
```

#### Test Case 3: 切換到顯示
```
步驟:
1. 點擊「顯示 API Keys」按鈕
2. 觀察變化

驗證點:
✓ 按鈕文字變為「隱藏 API Keys」
✓ 圖示變為 🙈
✓ API Key 完整顯示
✓ 出現複製按鈕（📋）
```

#### Test Case 4: 複製功能
```
步驟:
1. 在顯示狀態下點擊複製按鈕
2. 開啟記事本貼上 (Ctrl+V)

驗證點:
✓ 顯示「API Key 已複製！」通知
✓ 貼上的是完整 API Key
✓ 格式正確無額外空白
```

#### Test Case 5: 多個 Keys 測試
```
步驟:
1. 新增 3 個不同的 API Keys
2. 點擊顯示按鈕

驗證點:
✓ 所有 Keys 同時顯示/隱藏
✓ 每個 Key 都有獨立的複製按鈕
✓ 每個 Key 都有獨立的刪除按鈕
```

#### Test Case 6: 狀態持久性
```
步驟:
1. 切換到顯示狀態
2. 新增一個新的 API Key
3. 觀察新 Key 的顯示狀態

驗證點:
✓ 新 Key 也是顯示狀態
✓ 舊 Keys 保持顯示狀態
✓ 按鈕狀態保持「隱藏 API Keys」
```

---

## 📊 測試結果摘要

| 測試類別 | 測試項目 | 通過 | 失敗 | 待測 |
|---------|---------|------|------|------|
| 基本功能 | 6 | - | - | 6 |
| 互動體驗 | 3 | - | - | 3 |
| 邊界條件 | 4 | - | - | 4 |
| 安全性 | 3 | - | - | 3 |
| UI/UX | 13 | - | - | 13 |
| **總計** | **29** | **0** | **0** | **29** |

---

## 🐛 發現的問題

### 嚴重問題
（尚未測試）

### 中等問題
（尚未測試）

### 輕微問題
（尚未測試）

---

## 💡 建議改進

### 功能建議
1. 考慮新增「全部複製」功能（複製所有 Keys）
2. 新增「匯出 Keys」功能（加密匯出）
3. 新增「顯示計時器」（N 秒後自動隱藏）

### UI/UX 建議
1. 考慮新增鍵盤快捷鍵（例如：Ctrl+Shift+K 切換顯示）
2. 複製成功後，按鈕短暫顯示 ✅ 圖示
3. 長 API Key 考慮新增橫向捲動

### 安全性建議
1. 新增「複製時確認」選項（防止誤觸）
2. 記錄 API Key 顯示/複製操作到日誌
3. 新增「顯示時間限制」設定

---

## 🔍 程式碼審查

### app.js 變更
```javascript
// Line 19-23: 新增狀態變數
this.state = {
    currentTheme: 'light',
    isConverting: false,
    lastResult: null,
    showApiKeys: false  // ✅ 新增
};

// Line 418-422: 切換函數
toggleShowApiKeys() {
    this.state.showApiKeys = !this.state.showApiKeys;
    this.renderApiKeys();
}

// Line 427-440: 複製函數
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

// Line 361-414: renderApiKeys() 修改
// ✅ 新增切換按鈕
// ✅ 條件式顯示完整/遮罩 Key
// ✅ 條件式顯示複製按鈕
```

### CSS 變更
```css
/* Line 333-347: API Key 值樣式 */
.api-key-value {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--text-secondary);
    word-break: break-all;        /* ✅ 新增：長字串換行 */
    padding: 4px 8px;             /* ✅ 新增：內邊距 */
    background: var(--bg-primary); /* ✅ 新增：背景色 */
    border-radius: var(--radius-sm); /* ✅ 新增：圓角 */
    transition: all var(--transition-fast); /* ✅ 新增：過渡效果 */
}

.api-key-value:hover {
    background: var(--bg-tertiary); /* ✅ 新增：hover 效果 */
}
```

---

## ✅ 測試簽核

- [ ] 開發者自測完成
- [ ] 功能測試完成
- [ ] UI/UX 測試完成
- [ ] 安全性測試完成
- [ ] 跨瀏覽器測試完成
- [ ] 響應式測試完成

**測試完成日期**: _______________
**簽核人員**: _______________

---

## 📎 相關文件

- [Progress.md](../knowledge/progress.md) - 專案進度記錄
- [API Manager 文件](../../src/js/lib/api-manager.js) - API Key 管理邏輯
- [Crypto Manager 文件](../../src/js/utils/crypto.js) - 加密與遮罩邏輯
- [主應用程式](../../src/js/app.js) - 主控制器
- [OpenSpec Proposal](../../openspec/changes/add-prompt-to-context-tool/proposal.md)

---

**報告產生時間**: 2025-10-16 14:35:00
**版本**: 1.0.0
