#!/usr/bin/env node

const PromptToContextPlugin = require('./src/plugins/claude-code/lib/index.js');

async function main() {
    const prompt = process.argv[2];

    if (!prompt) {
        console.error('請提供要轉換的問題');
        process.exit(1);
    }

    try {
        const plugin = new PromptToContextPlugin();
        await plugin.initialize();

        console.log('\n🔄 正在轉換...\n');

        const result = await plugin.convert(prompt);

        console.log('✅ 轉換成功！\n');
        console.log('【原始輸入】');
        console.log(prompt);
        console.log('\n【轉換結果】');
        console.log(result.output);
        console.log('\n【元資料】');
        console.log(`⏱️  執行時間: ${result.metadata.duration}ms`);
        console.log(`📊 輸入長度: ${result.metadata.inputLength} 字元`);
        console.log(`📊 輸出長度: ${result.metadata.outputLength} 字元`);
        console.log(`🤖 使用模型: ${result.metadata.model}`);
        console.log('');

    } catch (error) {
        console.error('❌ 轉換失敗:', error.message);
        process.exit(1);
    }
}

main();
