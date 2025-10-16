# Prompt-to-Context Web UI 快速測試指南
最後更新: 2025-10-16

## 如何開始測試

### 步驟 1: 開啟檔案
```
方法 A: 直接開啟
1. 開啟 Chrome 瀏覽器
2. 將檔案拖曳到瀏覽器視窗
   檔案路徑: C:\Users\alian\Desktop\github\PromptToCentext\src\index.html

方法 B: 使用命令列
在專案目錄執行:
> start chrome "file:///C:/Users/alian/Desktop/github/PromptToCentext/src/index.html"
```

### 步驟 2: 開啟 Developer Tools
```
按 F12 或 Ctrl+Shift+I
```

### 步驟 3: 檢查 Console
確認看到以下訊息:
```
[Storage] LocalStorage 可用
[APIManager] API 管理器已載入
[App] 初始化應用程式...
[App] 已載入 0 組 API Keys
[App] 應用程式初始化完成
[App] 應用程式已啟動
```

---

## 快速測試檢查表

### ✅ 基本功能 (5分鐘)
```
□ 頁面載入無錯誤
□ 主題切換正常 (🌙 ↔ ☀️)
□ 輸入文字,字元計數器更新
□ 清除按鈕清空輸入
□ API Key 面板可展開/收合
```

### ✅ API Key 管理 (5分鐘)
```
□ 新增測試 Key: AIzaSyTest123456789_TestKey001
□ Key 顯示為遮蔽格式
□ 新增第二個 Key 成功
□ 刪除 Key 功能正常
□ LocalStorage 儲存 Key (加密)
```

### ✅ 側邊欄功能 (5分鐘)
```
□ 範本側邊欄開啟 (左側滑入)
□ 歷史記錄側邊欄開啟 (右側滑入)
□ Esc 鍵關閉側邊欄
□ 關閉按鈕 (✕) 正常運作
```

### ✅ 鍵盤快捷鍵 (3分鐘)
```
□ Ctrl+K → 切換 API Key 面板
□ Ctrl+H → 開啟歷史記錄
□ Ctrl+Enter → 觸發轉換 (顯示警告)
□ Esc → 關閉側邊欄
```

### ✅ 響應式設計 (5分鐘)
```
□ 桌面模式 (1920x1080) 正常
□ 平板模式 (768x1024) 正常
□ 手機模式 (375x667) 正常
□ 側邊欄在小螢幕全螢幕顯示
```

---

## 常見問題排查

### 問題 1: Console 顯示錯誤 "Failed to load resource"
**原因**: 檔案路徑錯誤或檔案不存在
**解決**:
1. 檢查所有檔案是否存在
2. 確認檔案路徑正確
3. 檢查檔案名稱大小寫

**需要的檔案**:
```
src/
├── index.html
├── css/
│   ├── styles.css
│   └── dark-theme.css
└── js/
    ├── utils/
    │   ├── storage.js
    │   ├── crypto.js
    │   └── validators.js
    ├── lib/
    │   ├── api-manager.js
    │   ├── gemini-client.js
    │   ├── template-manager.js
    │   ├── history-manager.js
    │   └── export-manager.js
    └── app.js
```

### 問題 2: JavaScript 錯誤 "XXX is not defined"
**原因**: 模組載入順序錯誤或檔案缺失
**解決**:
1. 檢查 index.html 中的 script 標籤順序
2. 確認依賴關係:
   - storage.js, crypto.js, validators.js 必須先載入
   - 然後是 lib/ 目錄的檔案
   - 最後是 app.js

### 問題 3: LocalStorage 不可用
**原因**: 瀏覽器設定或檔案協議限制
**解決**:
1. 檢查瀏覽器設定是否允許 LocalStorage
2. 嘗試使用本地伺服器而非 file:// 協議
3. 使用 Live Server 擴充套件 (VS Code)

### 問題 4: 樣式顯示異常
**原因**: CSS 檔案未載入或路徑錯誤
**解決**:
1. 檢查 Network 面板,確認 CSS 檔案載入成功
2. 檢查 styles.css 和 dark-theme.css 路徑
3. 確認 CSS 變數是否正確定義

### 問題 5: API Key 無法新增
**原因**: 驗證器或加密模組問題
**解決**:
1. 檢查 Console 是否有錯誤
2. 確認 crypto.js 和 validators.js 已載入
3. 測試使用正確格式的 Key (以 AIza 開頭)

---

## 截圖建議

### 截圖時機
```
1. 初始載入畫面
2. Console 日誌
3. 深色模式
4. 淺色模式
5. API Key 管理 (新增前)
6. API Key 管理 (新增後)
7. API Key 遮蔽顯示
8. 範本側邊欄
9. 歷史記錄側邊欄
10. 手機版佈局
11. LocalStorage 資料
12. Toast 通知範例
```

### 截圖方式
```
方法 1: 使用 Windows 截圖工具
Win+Shift+S → 選擇區域 → 儲存

方法 2: Chrome DevTools
右鍵元素 > Capture node screenshot

方法 3: 全頁面截圖
Ctrl+Shift+P > Capture full size screenshot
```

### 儲存位置
```
screenshots/20251016/
├── 01-initial-load.png
├── 02-dark-theme.png
├── 03-input-text.png
├── 04-api-key-add.png
├── 05-template-sidebar.png
├── 06-history-sidebar.png
├── 07-mobile-layout.png
├── 08-keyboard-shortcuts.png
├── 09-toast-success.png
└── 10-localstorage.png
```

---

## 測試報告範本

測試完成後,請更新以下資訊:

### 測試環境
- **日期**: 2025-10-16
- **測試人員**: ___________
- **瀏覽器**: Chrome ___________
- **作業系統**: Windows 11
- **螢幕解析度**: ___________

### 測試結果
- **總測試項目**: 70
- **通過**: ___ / 70
- **失敗**: ___ / 70
- **跳過**: ___ / 70
- **通過率**: ___%

### 發現的主要問題
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### 建議
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

## 進階測試 (選用)

### 效能測試
```
1. 開啟 DevTools > Lighthouse
2. 選擇 "Performance" 類別
3. 點擊 "Analyze page load"
4. 檢查分數和建議
```

**目標分數**:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 80

### 記憶體測試
```
1. 開啟 DevTools > Memory
2. 點擊 "Take heap snapshot"
3. 操作應用程式 5 分鐘
4. 再次 "Take heap snapshot"
5. 比較兩次快照,檢查記憶體洩漏
```

### 無障礙測試
```
1. 安裝 WAVE 擴充套件
2. 開啟測試頁面
3. 點擊 WAVE 圖示
4. 檢查無障礙問題
```

**檢查項目**:
- 所有圖片有 alt 屬性
- 表單元素有 label
- 顏色對比度符合 WCAG AA
- 可用鍵盤操作所有功能

---

## 測試完成檢查

測試完成後,請確認:

□ 所有測試項目已執行
□ 截圖已儲存到正確位置
□ 測試結果已記錄
□ 發現的問題已記錄
□ 測試報告已更新
□ 相關文件已更新

---

## 聯絡資訊

如有問題或需要協助,請聯絡:
- **專案負責人**: ___________
- **技術支援**: ___________

---

**文件版本**: 1.0
**最後更新**: 2025-10-16
