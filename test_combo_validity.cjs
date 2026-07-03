/**
 * Combo 有效性检查 — 轻量验证
 * 验证 COMBO_TABLE 中所有键的格式和引用完整性
 * 配合 test_all_cards.cjs 全量测试，此脚本专门防 combo 退化
 */
import('./js/combo_table.js').then(mod => {
  const table = mod.COMBO_TABLE;
  const keys = Object.keys(table);
  let errors = 0;

  console.log(`Combo 有效性检查 — ${new Date().toISOString()}`);
  console.log(`总 combo 数: ${keys.length}\n`);

  for (const key of keys) {
    const entry = table[key];

    // 1. 必须有 type 字段
    if (!entry.type) {
      console.log(`❌ [${key}] 缺少 type 字段`);
      errors++;
      continue;
    }

    // 2. effects 必须是数组
    if (!Array.isArray(entry.effects) || entry.effects.length === 0) {
      console.log(`❌ [${key}] effects 为空或不是数组`);
      errors++;
      continue;
    }

    // 3. 每个 effect 必须有 type
    for (const eff of entry.effects) {
      if (!eff.type) {
        console.log(`❌ [${key}] effect 缺少 type`);
        errors++;
      }
    }

    // 4. 键格式检查（→ ↔ vs 升 降）
    if (!key.match(/[→↔]|vs/) && !key.includes('升') && !key.includes('降')) {
      console.log(`⚠️ [${key}] 键格式可能有误`);
    }
  }

  console.log(`\n${errors === 0 ? '✅ 全部通过' : `❌ ${errors} 个错误`}`);
  process.exit(errors === 0 ? 0 : 1);
});
