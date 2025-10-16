# Bug 修復報告：移除初始化時的干擾性警告

**日期**: 2025-10-16 15:00
**優先級**: 🟡 中（UX 改進）
**狀態**: ✅ 已修復

---

## 🐛 問題描述

### 使用者反饋
> "我現在web ui 還沒有填，還是被遮罩住，請幫我修正"

### 問題
首次載入頁面時，如果沒有 API Key，會立即跳出 Toast 警告：
- 「請先新增 API Key 才能使用轉換功能」
- 同時自動開啟 API Key 面板

這種行為過於主動，干擾使用者的初次體驗。

### 預期行為
- 首次載入時：靜默開啟 API Key 面板（視覺提示即可）
- 嘗試轉換時：才顯示 Toast 警告（此時提示有意義）

---

## 🔧 解決方案

### 修改策略
在 `checkApiKeys()` 函數中：
- ❌ 移除初始化時的 Toast 警告
- ✅ 保留靜默開啟面板的行為
- ✅ 轉換時的警告保持不變（在 `convert()` 函數中）

### 程式碼變更

**檔案**: `src/js/app.js` (Line 448-456)

**修改前**:
```javascript
checkApiKeys() {
    const stats = this.apiManager.getStats();

    if (!stats.hasAvailable) {
        this.showToast('請先新增 API Key 才能使用轉換功能', 'info'); // ❌ 干擾使用者
        this.openApiKeyPanel();
    }
}
```

**修改後**:
```javascript
checkApiKeys() {
    const stats = this.apiManager.getStats();

    if (!stats.hasAvailable) {
        // 初次載入時只開啟面板，不顯示提示（避免干擾使用者）
        // Toast 提示只在轉換時顯示（見 convert() 函數）
        this.openApiKeyPanel();  // ✅ 靜默提示
    }
}
```

**轉換時的警告保持不變** (`convert()` 函數 Line 192-196):
```javascript
// 檢查 API Keys
const stats = this.apiManager.getStats();
if (!stats.hasAvailable) {
    this.showToast('請先新增至少一個 API Key', 'warning');  // ✅ 此時提示有意義
    this.openApiKeyPanel();
    return;
}
```

---

## ✅ 驗證測試

### 測試場景 1：首次訪問（無 API Key）
```
步驟:
1. 清除 localStorage
2. 重新載入頁面

預期:
✓ 不顯示任何 Toast 警告
✓ API Key 面板自動展開
✓ 顯示「尚未設定 API Key」提示
✓ 使用者可以平靜地查看頁面
```

### 測試場景 2：嘗試轉換（無 API Key）
```
步驟:
1. 在輸入框輸入文字
2. 點擊「轉換」按鈕

預期:
✓ 顯示 Toast 警告：「請先新增至少一個 API Key」
✓ 自動開啟 API Key 面板
✓ 轉換不執行
```

### 測試場景 3：已有 API Key
```
步驟:
1. 新增一個 API Key
2. 重新載入頁面

預期:
✓ 不顯示任何警告
✓ API Key 面板保持收合狀態（已有 Key）
✓ 正常顯示轉換功能
```

---

## 📊 影響範圍

### 受影響的功能
- ✅ 初始化流程（移除干擾性警告）
- ✅ UX 改進（更友善的首次體驗）

### 不受影響的功能
- ✅ API Key 管理
- ✅ 轉換功能
- ✅ 轉換時的警告提示（保持不變）
- ✅ 其他所有功能

---

## 💡 設計理念

### Toast 通知的最佳實踐

**❌ 錯誤做法：過度主動**
- 頁面載入就跳出提示
- 在使用者還沒有行動前就警告
- 預設假設使用者「需要幫助」

**✅ 正確做法：適時引導**
- 視覺提示優先（開啟面板）
- 只在使用者執行動作時提示
- 只在真正需要時才顯示警告

### 層級化的提示策略

```
提示強度: 低 ────────────────► 高

1. 視覺引導   2. 說明文字   3. Toast 提示   4. 模態對話框
   (面板展開)    (提示文字)    (使用者操作時)  (阻斷性錯誤)

本次修改: 從 Level 3 降低到 Level 1
```

---

## 🎯 使用者體驗對比

### 修改前（干擾性體驗）
```
使用者載入頁面
  ↓
立即跳出 Toast 警告 💥
  ↓
使用者:「我才剛進來，還沒開始使用就警告我？」
  ↓
負面印象
```

### 修改後（友善體驗）
```
使用者載入頁面
  ↓
看到 API Key 面板自動展開 👀
  ↓
看到提示文字:「請新增至少一個 Gemini API Key 以開始使用」
  ↓
使用者:「了解，我可以慢慢看」
  ↓
當嘗試轉換時才顯示警告
  ↓
使用者:「對，我確實需要先新增 Key」
  ↓
正面體驗
```

---

## 📝 相關檔案

- `src/js/app.js` (Line 448-456, 192-196)
- `docs/knowledge/progress.md`
- `docs/reports/bugfix-api-key-loading-20251016.md`（相關的時序問題修復）

---

## ✍️ 簽核

- [x] Bug 已修復
- [x] 程式碼已審查
- [ ] 使用者驗證（待使用者確認）

**修復者**: Claude Code
**完成時間**: 2025-10-16 15:00

---

**總結**: 這次修復遵循「不過度干擾使用者」的 UX 原則，將主動警告改為靜默引導，大幅提升首次使用體驗。
