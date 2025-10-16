# Prompt-to-Context Web UI 測試計畫
最後更新: 2025-10-16

## 測試概述
本文件詳細記錄 Prompt-to-Context Web UI 的完整功能測試計畫和測試結果。

---

## 測試環境

### 目標檔案
- **路徑**: `C:\Users\alian\Desktop\github\PromptToCentext\src\index.html`
- **瀏覽器**: Chrome (最新版本)
- **開啟方式**: `file:///C:/Users/alian/Desktop/github/PromptToCentext/src/index.html`

### 依賴檔案分析

#### CSS 檔案
1. `css/styles.css` - 主要樣式表
2. `css/dark-theme.css` - 深色主題樣式

#### JavaScript 模組
1. **工具類 (Utils)**
   - `js/utils/storage.js` - LocalStorage 管理
   - `js/utils/crypto.js` - 加密/解密工具
   - `js/utils/validators.js` - 輸入驗證

2. **核心模組 (Lib)**
   - `js/lib/api-manager.js` - API Key 管理
   - `js/lib/gemini-client.js` - Gemini API 客戶端
   - `js/lib/template-manager.js` - 範本管理
   - `js/lib/history-manager.js` - 歷史記錄管理
   - `js/lib/export-manager.js` - 匯出功能

3. **主應用程式**
   - `js/app.js` - 主控制器

---

## 測試項目

### 1. 基本 UI 載入測試

#### 測試目標
驗證頁面是否正常載入,所有資源是否正確引用。

#### 測試步驟
1. 開啟 Chrome 瀏覽器
2. 按 F12 開啟 Developer Tools
3. 切換到 Console 面板
4. 開啟測試頁面: `file:///C:/Users/alian/Desktop/github/PromptToCentext/src/index.html`
5. 檢查 Console 是否有錯誤訊息

#### 預期結果
- [ ] 頁面成功載入
- [ ] Console 顯示: `[Storage] LocalStorage 可用`
- [ ] Console 顯示: `[APIManager] API 管理器已載入`
- [ ] Console 顯示: `[App] 初始化應用程式...`
- [ ] Console 顯示: `[App] 已載入 X 組 API Keys`
- [ ] Console 顯示: `[App] 應用程式初始化完成`
- [ ] Console 顯示: `[App] 應用程式已啟動`
- [ ] 無 404 錯誤(資源未找到)
- [ ] 無 JavaScript 錯誤

#### 檢查元素
- [ ] 標題顯示: "🎯 Prompt-to-Context"
- [ ] 四個頁首按鈕: 主題切換、歷史記錄、範本庫、設定
- [ ] 輸入區域正常顯示
- [ ] 字元計數顯示: "0 字元"
- [ ] API Key 管理面板正常顯示

#### 截圖位置
- `screenshots/20251016/01-initial-load.png`
- `screenshots/20251016/01-console-logs.png`

---

### 2. 主題切換功能測試

#### 測試目標
驗證深色模式和淺色模式是否正常切換。

#### 測試步驟
1. 點擊右上角的主題切換按鈕 (🌙)
2. 觀察頁面顏色變化
3. 檢查按鈕圖示是否變更為 ☀️
4. 再次點擊,切換回淺色模式
5. 檢查 DevTools > Application > Local Storage
6. 確認 `prompt_to_context_theme` 的值

#### 預期結果
- [ ] 點擊後頁面切換為深色模式
- [ ] 按鈕圖示從 🌙 變更為 ☀️
- [ ] 背景色變為深色 (#111827)
- [ ] 文字色變為淺色 (#F9FAFB)
- [ ] 所有元素顏色正確更新
- [ ] LocalStorage 儲存主題設定 (`dark` 或 `light`)
- [ ] 再次點擊可切換回淺色模式
- [ ] 主題設定持久化(重新整理後仍保持)

#### CSS 變數檢查
開啟 DevTools > Elements > 選擇 `<body>` > 檢查 Styles

深色模式時應該有:
```css
body.dark-mode {
    --bg-primary: #1F2937;
    --bg-secondary: #111827;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
}
```

#### 截圖位置
- `screenshots/20251016/02-light-theme.png`
- `screenshots/20251016/02-dark-theme.png`
- `screenshots/20251016/02-localstorage.png`

---

### 3. 輸入功能測試

#### 測試目標
驗證文字輸入和字元計數器是否正常運作。

#### 測試步驟
1. 在輸入框中輸入測試文字: "如何學習 JavaScript?"
2. 觀察字元計數器變化
3. 輸入多行文字
4. 測試特殊字元(中文、Emoji、符號)
5. 點擊"清除"按鈕
6. 驗證輸入框是否清空

#### 預期結果
- [ ] 輸入文字正常顯示
- [ ] 字元計數器即時更新(例: "16 字元")
- [ ] 支援多行輸入
- [ ] 支援中文、英文、Emoji
- [ ] Placeholder 文字正確顯示
- [ ] 點擊"清除"按鈕後輸入框清空
- [ ] 清除後字元計數回到 "0 字元"
- [ ] 焦點自動回到輸入框

#### 測試案例
```
案例 1: "如何學習 JavaScript?" → 16 字元
案例 2: "Hello World 🌍" → 14 字元
案例 3: 多行文字 (50+ 字元)
案例 4: 空輸入 → 0 字元
```

#### 截圖位置
- `screenshots/20251016/03-input-text.png`
- `screenshots/20251016/03-char-count.png`
- `screenshots/20251016/03-clear-button.png`

---

### 4. API Key 管理功能測試

#### 測試目標
驗證 API Key 的新增、顯示、刪除功能。

#### 測試步驟
1. 點擊 "API Key 管理" 展開面板
2. 在輸入框輸入測試 Key: `AIzaSyTest123456789_TestKey001`
3. 點擊"新增 Key"
4. 檢查 Key 是否顯示(應該遮蔽顯示)
5. 新增第二個 Key: `AIzaSyTest987654321_TestKey002`
6. 檢查是否顯示兩個 Key
7. 測試刪除功能
8. 檢查 LocalStorage 儲存

#### 預期結果
- [ ] 點擊標題可展開/收合面板
- [ ] 箭頭圖示正確旋轉
- [ ] 初始狀態顯示"尚未設定 API Key"
- [ ] 輸入 Key 後可成功新增
- [ ] Key 顯示為遮蔽格式(例: `AIza...ey001`)
- [ ] 顯示狀態指示器(綠色圓點 = active)
- [ ] 可新增多個 Key(最多5個)
- [ ] 點擊刪除按鈕(🗑️)會彈出確認對話框
- [ ] 確認後 Key 被刪除
- [ ] LocalStorage 正確儲存加密後的 Key

#### 驗證加密
開啟 DevTools > Application > Local Storage > 檢查 `prompt_to_context_api_keys`
應該看到加密後的資料結構,而非明文 Key。

#### 測試快捷鍵
- 按 `Ctrl+K` 應該切換 API Key 面板

#### 錯誤測試
- [ ] 輸入空 Key → 顯示警告 "請輸入 API Key"
- [ ] 輸入不合法格式 → 顯示錯誤訊息
- [ ] 輸入重複 Key → 顯示 "此 API Key 已存在"
- [ ] 新增超過5個 Key → 顯示 "最多只能新增 5 組 API Keys"

#### 截圖位置
- `screenshots/20251016/04-api-key-empty.png`
- `screenshots/20251016/04-api-key-add.png`
- `screenshots/20251016/04-api-key-list.png`
- `screenshots/20251016/04-api-key-masked.png`
- `screenshots/20251016/04-api-key-delete.png`
- `screenshots/20251016/04-localstorage-encrypted.png`

---

### 5. 範本功能測試

#### 測試目標
驗證範本側邊欄的開啟、搜尋、篩選功能。

#### 測試步驟
1. 點擊右上角"範本庫"按鈕 (📚)
2. 觀察側邊欄從左側滑入
3. 檢查是否載入預設範本
4. 測試搜尋功能
5. 測試類別篩選
6. 點擊範本項目
7. 檢查是否套用到輸入框
8. 點擊關閉按鈕 (✕)

#### 預期結果
- [ ] 點擊按鈕後側邊欄從左側滑入
- [ ] 顯示範本列表(若有預設範本)
- [ ] 或顯示"尚無範本"空狀態
- [ ] 搜尋框可輸入文字
- [ ] 類別下拉選單有5個選項:
  - 所有類別
  - 程式開發
  - 技術文件
  - 學習教學
  - 創意寫作
  - 商業分析
- [ ] 點擊範本項目後自動套用到輸入框
- [ ] 套用後側邊欄自動關閉
- [ ] 顯示 Toast 通知: "已套用範本"
- [ ] 點擊關閉按鈕後側邊欄滑出

#### 測試快捷鍵
- 按 `Esc` 應該關閉側邊欄

#### 動畫測試
- [ ] 側邊欄滑入動畫流暢(250ms)
- [ ] 側邊欄滑出動畫流暢(250ms)

#### 截圖位置
- `screenshots/20251016/05-template-sidebar-open.png`
- `screenshots/20251016/05-template-list.png`
- `screenshots/20251016/05-template-search.png`
- `screenshots/20251016/05-template-category.png`
- `screenshots/20251016/05-template-applied.png`

---

### 6. 歷史記錄功能測試

#### 測試目標
驗證歷史記錄側邊欄的開啟、搜尋、篩選功能。

#### 測試步驟
1. 點擊右上角"歷史記錄"按鈕 (📝)
2. 觀察側邊欄從右側滑入
3. 檢查初始狀態(應該為空)
4. 測試搜尋功能
5. 測試狀態篩選
6. 點擊關閉按鈕

#### 預期結果
- [ ] 點擊按鈕後側邊欄從右側滑入
- [ ] 初始狀態顯示"尚無歷史記錄"
- [ ] 搜尋框可輸入文字
- [ ] 狀態篩選有4個選項:
  - 全部
  - 僅成功
  - 僅失敗
  - 僅收藏
- [ ] 若有歷史記錄,顯示最近20筆
- [ ] 每筆記錄顯示:
  - 輸入內容(截斷到100字元)
  - 時間戳記(台灣時區)
  - 收藏星號(若有)
- [ ] 點擊記錄可載入到輸入框
- [ ] 點擊關閉按鈕後側邊欄滑出

#### 測試快捷鍵
- 按 `Ctrl+H` 應該開啟歷史記錄側邊欄
- 按 `Esc` 應該關閉側邊欄

#### 截圖位置
- `screenshots/20251016/06-history-sidebar-open.png`
- `screenshots/20251016/06-history-empty.png`
- `screenshots/20251016/06-history-search.png`
- `screenshots/20251016/06-history-filter.png`

---

### 7. 響應式設計測試

#### 測試目標
驗證在不同視窗大小下的佈局和功能。

#### 測試步驟
1. 開啟 DevTools > Toggle Device Toolbar (Ctrl+Shift+M)
2. 測試以下尺寸:
   - 桌面: 1920x1080
   - 筆電: 1366x768
   - 平板: 768x1024
   - 手機: 375x667 (iPhone SE)
3. 檢查各元素是否正確調整
4. 測試側邊欄在小螢幕的表現

#### 預期結果

##### 桌面 (>1200px)
- [ ] 容器最大寬度 1200px,置中顯示
- [ ] 所有元素正常顯示
- [ ] 側邊欄寬度 400px

##### 平板 (768px - 1200px)
- [ ] 容器寬度自適應
- [ ] 按鈕間距縮小
- [ ] 側邊欄寬度 400px

##### 手機 (<768px)
- [ ] 標題字體縮小到 1.5rem
- [ ] 按鈕垂直排列
- [ ] 側邊欄全螢幕顯示(100%寬度)
- [ ] 輸入區按鈕垂直堆疊
- [ ] 輸出區按鈕垂直堆疊

#### 觸控測試(模擬)
- [ ] 按鈕點擊區域足夠大(≥44px)
- [ ] 滑動手勢流暢

#### 截圖位置
- `screenshots/20251016/07-desktop-1920.png`
- `screenshots/20251016/07-laptop-1366.png`
- `screenshots/20251016/07-tablet-768.png`
- `screenshots/20251016/07-mobile-375.png`

---

### 8. 鍵盤快捷鍵測試

#### 測試目標
驗證所有鍵盤快捷鍵是否正常運作。

#### 測試項目

##### Ctrl+Enter: 轉換提示詞
1. 在輸入框輸入文字
2. 按 `Ctrl+Enter`
3. 檢查是否觸發轉換功能

**預期結果**:
- [ ] 按下後觸發轉換(若有 API Key)
- [ ] 或顯示"請先新增 API Key"警告(若無 API Key)

##### Ctrl+K: API Key 管理
1. 按 `Ctrl+K`
2. 檢查 API Key 面板是否切換

**預期結果**:
- [ ] 第一次按下展開面板
- [ ] 第二次按下收合面板

##### Ctrl+H: 歷史記錄
1. 按 `Ctrl+H`
2. 檢查歷史記錄側邊欄是否開啟

**預期結果**:
- [ ] 側邊欄從右側滑入

##### Esc: 關閉側邊欄
1. 開啟任一側邊欄
2. 按 `Esc`
3. 檢查側邊欄是否關閉

**預期結果**:
- [ ] 歷史記錄側邊欄關閉
- [ ] 範本側邊欄關閉

#### 快捷鍵提示
檢查頁尾是否顯示快捷鍵提示:
```
快捷鍵提示：
[Ctrl+Enter] 轉換 | [Ctrl+K] API Keys | [Ctrl+H] 歷史記錄
```

#### 截圖位置
- `screenshots/20251016/08-keyboard-shortcuts.png`
- `screenshots/20251016/08-footer-hints.png`

---

### 9. Toast 通知測試

#### 測試目標
驗證 Toast 通知是否正確顯示和消失。

#### 測試場景
1. 新增 API Key 成功 → 顯示成功 Toast
2. 刪除 API Key 成功 → 顯示成功 Toast
3. 套用範本 → 顯示資訊 Toast
4. 輸入驗證失敗 → 顯示警告 Toast
5. 操作失敗 → 顯示錯誤 Toast

#### 預期結果
- [ ] Toast 從右上角滑入(動畫流暢)
- [ ] 顯示對應圖示:
  - ✅ 成功
  - ❌ 錯誤
  - ⚠️ 警告
  - ℹ️ 資訊
- [ ] 左側邊框顏色對應類型:
  - 綠色: 成功
  - 紅色: 錯誤
  - 橙色: 警告
  - 藍色: 資訊
- [ ] 3秒後自動淡出並移除
- [ ] 多個 Toast 垂直堆疊顯示

#### 截圖位置
- `screenshots/20251016/09-toast-success.png`
- `screenshots/20251016/09-toast-error.png`
- `screenshots/20251016/09-toast-warning.png`
- `screenshots/20251016/09-toast-info.png`

---

### 10. LocalStorage 資料驗證

#### 測試目標
驗證資料是否正確儲存到 LocalStorage。

#### 檢查項目
開啟 DevTools > Application > Local Storage > file://

應該看到以下鍵:
1. `prompt_to_context_theme` - 主題設定
2. `prompt_to_context_api_keys` - API Keys (加密)
3. `prompt_to_context_templates` - 範本
4. `prompt_to_context_history` - 歷史記錄
5. `prompt_to_context_settings` - 應用程式設定

#### 預期結果
- [ ] 所有資料都是 JSON 格式
- [ ] API Keys 已加密(看不到明文)
- [ ] 資料結構正確
- [ ] 重新整理後資料仍存在

#### 資料結構範例
```json
{
  "prompt_to_context_theme": "dark",
  "prompt_to_context_api_keys": [
    {
      "id": "key_1234567890_abc123",
      "encrypted": "...",
      "status": "active",
      "lastUsed": 1697472000000,
      "errorCount": 0,
      "createdAt": 1697472000000
    }
  ],
  "prompt_to_context_settings": {
    "theme": "dark",
    "autoSave": true,
    "maxHistoryItems": 100,
    "apiTimeout": 30000,
    "enableAnalytics": false
  }
}
```

#### 截圖位置
- `screenshots/20251016/10-localstorage-overview.png`
- `screenshots/20251016/10-localstorage-theme.png`
- `screenshots/20251016/10-localstorage-keys.png`
- `screenshots/20251016/10-localstorage-settings.png`

---

## 效能測試

### 載入效能
開啟 DevTools > Network > 重新整理頁面

檢查項目:
- [ ] DOMContentLoaded < 500ms
- [ ] Load 完成 < 1000ms
- [ ] 所有資源成功載入(無404)
- [ ] CSS 檔案載入時間 < 100ms
- [ ] JavaScript 檔案載入時間 < 200ms

### 執行效能
開啟 DevTools > Performance > 錄製5秒操作

檢查項目:
- [ ] FPS 保持 60fps
- [ ] 無長任務(>50ms)
- [ ] 記憶體使用穩定
- [ ] 無記憶體洩漏

---

## 相容性測試

### 瀏覽器
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)

### 作業系統
- [ ] Windows 10/11
- [ ] macOS
- [ ] Linux (Ubuntu)

---

## 已知限制

### 檔案協議限制
由於使用 `file://` 協議開啟,可能遇到以下限制:
1. CORS 限制 - 無法載入外部資源
2. LocalStorage 可能不同步
3. 部分 API 可能無法使用

### 建議
測試時建議使用本地伺服器(例如 Live Server)以避免檔案協議的限制。

---

## 測試總結

### 測試統計
- 總測試項目: 70+
- 完成項目: ___ / 70
- 通過項目: ___ / 70
- 失敗項目: ___ / 70

### 發現的問題
(測試完成後填寫)

| ID | 嚴重性 | 問題描述 | 重現步驟 | 預期結果 | 實際結果 | 狀態 |
|----|--------|----------|----------|----------|----------|------|
| 001 | - | - | - | - | - | - |

### 建議改進
(測試完成後填寫)

---

## 附錄

### 測試工具
- Chrome DevTools
- Lighthouse (效能測試)
- WAVE (無障礙測試)

### 參考文件
- [Web API 文件](https://developer.mozilla.org/en-US/docs/Web/API)
- [Chrome DevTools 指南](https://developer.chrome.com/docs/devtools/)

---

**測試執行人員**: Claude Code
**測試日期**: 2025-10-16
**文件版本**: 1.0
