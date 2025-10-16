/**
 * 加密解密工具
 * 使用 Web Crypto API 進行 AES-GCM 加密
 */

const CryptoManager = {
    /**
     * 演算法設定
     */
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12, // 96 bits

    /**
     * 從密碼產生加密金鑰
     * @param {string} password - 密碼
     * @param {Uint8Array} salt - 鹽值
     * @returns {Promise<CryptoKey>} 加密金鑰
     */
    async deriveKey(password, salt) {
        try {
            // 將密碼轉換為 ArrayBuffer
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);

            // 匯入密碼作為基礎金鑰
            const baseKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );

            // 使用 PBKDF2 衍生金鑰
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                baseKey,
                {
                    name: this.ALGORITHM,
                    length: this.KEY_LENGTH
                },
                false,
                ['encrypt', 'decrypt']
            );

            return key;
        } catch (error) {
            console.error('[Crypto] 金鑰衍生失敗:', error);
            throw error;
        }
    },

    /**
     * 產生隨機鹽值
     * @returns {Uint8Array} 鹽值
     */
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    },

    /**
     * 產生隨機 IV (Initialization Vector)
     * @returns {Uint8Array} IV
     */
    generateIV() {
        return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    },

    /**
     * 加密資料
     * @param {string} plaintext - 明文
     * @param {string} password - 密碼
     * @returns {Promise<string>} Base64 編碼的加密資料
     */
    async encrypt(plaintext, password) {
        try {
            // 產生鹽值和 IV
            const salt = this.generateSalt();
            const iv = this.generateIV();

            // 衍生金鑰
            const key = await this.deriveKey(password, salt);

            // 編碼明文
            const encoder = new TextEncoder();
            const plaintextBuffer = encoder.encode(plaintext);

            // 加密
            const ciphertext = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                plaintextBuffer
            );

            // 組合：salt + iv + ciphertext
            const combined = new Uint8Array(
                salt.length + iv.length + ciphertext.byteLength
            );
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

            // 轉換為 Base64
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('[Crypto] 加密失敗:', error);
            throw error;
        }
    },

    /**
     * 解密資料
     * @param {string} encryptedData - Base64 編碼的加密資料
     * @param {string} password - 密碼
     * @returns {Promise<string>} 明文
     */
    async decrypt(encryptedData, password) {
        try {
            // 從 Base64 解碼
            const combined = this.base64ToArrayBuffer(encryptedData);

            // 分離 salt, iv, ciphertext
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 16 + this.IV_LENGTH);
            const ciphertext = combined.slice(16 + this.IV_LENGTH);

            // 衍生金鑰
            const key = await this.deriveKey(password, salt);

            // 解密
            const plaintextBuffer = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                ciphertext
            );

            // 解碼明文
            const decoder = new TextDecoder();
            return decoder.decode(plaintextBuffer);
        } catch (error) {
            console.error('[Crypto] 解密失敗:', error);
            throw error;
        }
    },

    /**
     * 雜湊資料（用於產生指紋）
     * @param {string} data - 要雜湊的資料
     * @returns {Promise<string>} 雜湊值（Hex）
     */
    async hash(data) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            return this.arrayBufferToHex(hashBuffer);
        } catch (error) {
            console.error('[Crypto] 雜湊失敗:', error);
            throw error;
        }
    },

    /**
     * 簡易加密（用於 API Key）
     * 使用固定的密碼，僅用於遮蔽顯示
     * @param {string} text - 明文
     * @returns {Promise<string>} 加密文字
     */
    async simpleEncrypt(text) {
        const password = this.getDeviceFingerprint();
        return await this.encrypt(text, password);
    },

    /**
     * 簡易解密（用於 API Key）
     * @param {string} encryptedText - 加密文字
     * @returns {Promise<string>} 明文
     */
    async simpleDecrypt(encryptedText) {
        const password = this.getDeviceFingerprint();
        return await this.decrypt(encryptedText, password);
    },

    /**
     * 取得裝置指紋（用於產生固定密碼）
     * @returns {string} 裝置指紋
     */
    getDeviceFingerprint() {
        // 使用瀏覽器資訊產生唯一識別碼
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ].join('|');

        // 簡單的雜湊（同步版本）
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return 'fp_' + Math.abs(hash).toString(36) + '_ptc';
    },

    /**
     * 遮蔽顯示（用於 API Key）
     * @param {string} text - 原始文字
     * @param {number} visibleChars - 顯示字元數
     * @returns {string} 遮蔽後的文字
     */
    mask(text, visibleChars = 4) {
        if (!text || text.length <= visibleChars * 2) {
            return text;
        }

        const start = text.substring(0, visibleChars);
        const end = text.substring(text.length - visibleChars);
        const maskLength = Math.min(text.length - visibleChars * 2, 8);
        const mask = '*'.repeat(maskLength);

        return `${start}${mask}${end}`;
    },

    /**
     * ArrayBuffer 轉 Base64
     * @param {ArrayBuffer|Uint8Array} buffer - 緩衝區
     * @returns {string} Base64 字串
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Base64 轉 ArrayBuffer
     * @param {string} base64 - Base64 字串
     * @returns {Uint8Array} 緩衝區
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    /**
     * ArrayBuffer 轉 Hex
     * @param {ArrayBuffer} buffer - 緩衝區
     * @returns {string} Hex 字串
     */
    arrayBufferToHex(buffer) {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    /**
     * 檢查 Web Crypto API 可用性
     * @returns {boolean} 是否可用
     */
    isAvailable() {
        return typeof crypto !== 'undefined' &&
               typeof crypto.subtle !== 'undefined';
    }
};

// 在載入時檢查可用性
(function checkCryptoAvailability() {
    if (!CryptoManager.isAvailable()) {
        console.error('[Crypto] Web Crypto API 不可用');
        alert('您的瀏覽器不支援 Web Crypto API，加密功能將無法使用。');
    } else {
        console.log('[Crypto] Web Crypto API 可用');
    }
})();
