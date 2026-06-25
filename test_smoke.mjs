import { chromium } from 'playwright';

if (process.env.NODE_OPTIONS) {
  delete process.env.NODE_OPTIONS;
}

const WIDTH = 960;
const HEIGHT = 540;
const BASE = 'http://localhost:8080';
const SDIR = '/workspace';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`[ERR] ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log(`[WARN] ${text}`);
    } else if (text.includes('Error') || text.includes('error')) {
      console.log(`[LOG] ${text.substring(0, 200)}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`PAGE: ${err.message}`);
    console.log(`[PAGE_ERR] ${err.message}`);
  });

  try {
    // ===== STEP 1: Open game =====
    console.log('\n========== STEP 1: Open Game ==========');
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SDIR}/test_e6_start.png`, fullPage: false });
    console.log('[OK] test_e6_start.png');
    if (errors.length > 0) console.log(`[ERR COUNT] ${errors.length} errors on start`);

    // ===== STEP 2: Select elements and enter battle =====
    console.log('\n========== STEP 2: Select Elements ==========');
    const mainBtn = page.locator('#main-domain-btns .btn-domain').filter({ hasText: '力' }).first();
    await mainBtn.click();
    console.log('[OK] Main: 力');

    const subBtn = page.locator('#sub-domain-btns .btn-domain-sub').filter({ hasText: '电' }).first();
    await subBtn.click();
    console.log('[OK] Sub: 电');

    const diff = await page.locator('.btn-diff.active').textContent();
    console.log(`[OK] Diff: ${diff.trim()}`);

    await page.locator('#btn-start-game').click();
    console.log('[OK] Battle started');

    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SDIR}/test_e6_battle.png`, fullPage: false });
    console.log('[OK] test_e6_battle.png');

    // ===== STEP 3: Quick quiz (click first option 3 times) =====
    console.log('\n========== STEP 3: Quiz ==========');

    for (let i = 0; i < 3; i++) {
      // Wait for quiz to appear and render
      await page.waitForSelector('.quiz-option', { timeout: 10000 }).catch(() => {});
      
      const opts = page.locator('.quiz-option');
      const count = await opts.count();
      if (count > 0) {
        const firstOptText = await opts.first().textContent();
        console.log(`[OK] Quiz ${i + 1}: "${firstOptText?.trim()}" (${count} options)`);
        await opts.first().click();
        
        // Wait for feedback animation
        await page.waitForTimeout(1500);
      } else {
        console.log(`[WARN] Quiz ${i + 1}: no quiz-option found`);
        break;
      }
    }

    // Wait for quiz overlay to disappear
    try {
      await page.waitForFunction(() => !document.getElementById('quiz-overlay'), { timeout: 15000 });
      console.log('[OK] Quiz overlay dismissed');
    } catch {
      console.log('[WARN] Quiz overlay still present after timeout');
    }
    await page.waitForTimeout(1000);

    // ===== STEP 4-5: Play phase =====
    console.log('\n========== STEP 4-5: Play Phase ==========');
    await page.screenshot({ path: `${SDIR}/test_e6_play.png`, fullPage: false });
    console.log('[OK] test_e6_play.png');

    // Click first card in hand
    const handCards = page.locator('.hand-card, .card-in-hand, #player-hand .card, [class*="hand"] .card:not(.card-back)');
    const handCount = await handCards.count();
    if (handCount > 0) {
      const cardText = await handCards.first().textContent().catch(() => '');
      console.log(`[OK] Hand cards: ${handCount}, clicking: "${cardText?.trim()?.substring(0, 40)}"`);
      await handCards.first().click();
    } else {
      console.log(`[WARN] No hand cards found, trying .card`);
      const cards = page.locator('.card');
      const c = await cards.count();
      if (c > 0) await cards.first().click();
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SDIR}/test_e6_card.png`, fullPage: false });
    console.log('[OK] test_e6_card.png');

    // Click end turn
    const endBtn = page.locator('#btn-end-turn, button:has-text("结束"), button:has-text("回合")');
    const endCount = await endBtn.count();
    if (endCount > 0) {
      const btnText = await endBtn.first().textContent();
      console.log(`[OK] End turn: "${btnText?.trim()}"`);
      await endBtn.first().click();
    } else {
      console.log('[WARN] End turn button not found');
      const allBtns = await page.locator('button').allTextContents();
      console.log('[INFO] Buttons:', allBtns.map(t => t.trim().substring(0, 40)));
    }

    // ===== STEP 6: Wait for AI =====
    console.log('\n========== STEP 6: AI Turn ==========');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${SDIR}/test_e6_ai.png`, fullPage: false });
    console.log('[OK] test_e6_ai.png');

    // ===== STEP 7: Summary =====
    console.log('\n========== STEP 7: Summary ==========');
    console.log(`Total JS Errors: ${errors.length}`);
    errors.forEach((e, i) => console.log(`  [${i + 1}] ${e.substring(0, 300)}`));
    console.log(`Total JS Warnings: ${warnings.length}`);

    if (errors.length === 0) console.log('[PASS] No JS errors');

  } catch (err) {
    console.error('[FATAL]', err.message);
    await page.screenshot({ path: `${SDIR}/test_e6_error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
