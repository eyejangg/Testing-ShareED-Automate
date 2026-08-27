// @ts-check
const { Page } = require('@playwright/test');

const APP_URL = 'https://share-ed-frontend-gamma.vercel.app';

/**
 * 🔑 1. ฟังก์ชันเข้าสู่ระบบ (Login)
 * @param {Page} page
 * @param {string} [email]
 * @param {string} [password]
 */
async function loginUser(page, email = 'ptwptw1600@gmail.com', password = '_Eart1101') {
  await page.goto(`${APP_URL}/`);

  if (await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.waitForURL(/.*home/, { timeout: 15000 }).catch(() => { });
  }
}

/**
 * 🗑️ 2. ฟังก์ชันกดยืนยันลบโพสต์ (ลบโพสต์ -> ใช่ ลบเลย -> OK) โดยไม่ต้องใช้ const
 * @param {Page} page
 */
async function deleteCurrentOpenPost(page) {
  // 1. กดปุ่ม "ลบโพสต์"
  if (await page.locator('button:has-text("ลบโพสต์"), button:has-text("ลบ"), a:has-text("ลบโพสต์")').first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.locator('button:has-text("ลบโพสต์"), button:has-text("ลบ"), a:has-text("ลบโพสต์")').first().click();
    await page.waitForTimeout(500);

    // 2. กดยืนยันปุ่มสีแดง "ใช่, ลบเลย"
    if (await page.getByRole('button', { name: /ใช่.*ลบเลย/i }).isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.getByRole('button', { name: /ใช่.*ลบเลย/i }).click();
      await page.waitForTimeout(1000);

      // 3. กดปุ่ม "OK"
      if (await page.getByRole('button', { name: 'OK' }).isVisible({ timeout: 4000 }).catch(() => false)) {
        await page.getByRole('button', { name: 'OK' }).click();
        await page.waitForTimeout(500);
      }
      return true;
    }
  }
  return false;
}

/**
 * 🧹 3. ฟังก์ชันหลักสำหรับเคลียร์ทั้งแบบร่างและโพสต์ทั้งหมดในบัญชี
 * @param {Page} page
 */
async function cleanAllUserPostsAndDrafts(page) {
  try {
    console.log('🧹 [Cleanup] กำลังตรวจสอบและเคลียร์ข้อมูลใน Profile...');

    // ------------------------------------------
    // 📌 1. เคลียร์แท็บ "แบบร่าง" (Drafts)
    // ------------------------------------------
    await page.goto(`${APP_URL}/profile`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    if (await page.getByRole('button', { name: /แบบร่าง/i }).isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: /แบบร่าง/i }).click();
      await page.waitForTimeout(1500);

      for (let i = 0; i < 5; i++) {
        // ตรวจสอบว่ามีการ์ดแบบร่างเหลืออยู่หรือไม่
        const hasDraft = await page.getByRole('button', { name: 'แก้ไขโพสต์' }).first().waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
        if (!hasDraft) break;

        console.log(`🧹 [Cleanup] พบแบบร่างที่ ${i + 1} -> กำลังลบ...`);
        await page.getByRole('button', { name: 'แก้ไขโพสต์' }).first().click();
        await page.waitForLoadState('domcontentloaded');

        await deleteCurrentOpenPost(page);
        console.log(`✅ [Cleanup] ลบแบบร่างที่ ${i + 1} สำเร็จ`);

        await page.goto(`${APP_URL}/profile`);
        await page.getByRole('button', { name: /แบบร่าง/i }).click();
        await page.waitForTimeout(1500);
      }
    }

    // ------------------------------------------
    // 📌 2. เคลียร์แท็บ "โพสต์ของฉัน" (My Posts)
    // ------------------------------------------
    await page.goto(`${APP_URL}/profile`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    if (await page.getByRole('button', { name: /โพสต์ของฉัน/i }).isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: /โพสต์ของฉัน/i }).click();
      await page.waitForTimeout(1500);

      for (let i = 0; i < 5; i++) {
        // ตรวจสอบว่ามีการ์ดโพสต์เหลืออยู่หรือไม่
        const hasPost = await page.locator('.grid h3, .grid h4, a[href*="/post/"]').first().waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
        if (!hasPost) break;

        console.log(`🧹 [Cleanup] พบโพสต์ที่ ${i + 1} -> กำลังลบ...`);
        await page.locator('.grid h3, .grid h4, a[href*="/post/"]').first().click();
        await page.waitForLoadState('domcontentloaded');

        await deleteCurrentOpenPost(page);
        console.log(`✅ [Cleanup] ลบโพสต์ที่ ${i + 1} สำเร็จ`);

        await page.goto(`${APP_URL}/profile`);
        await page.getByRole('button', { name: /โพสต์ของฉัน/i }).click();
        await page.waitForTimeout(1500);
      }
    }
  } catch (error) {
    console.error('⚠️ [Cleanup Error]:', error);
  }
}

module.exports = {
  APP_URL,
  loginUser,
  deleteCurrentOpenPost,
  cleanAllUserPostsAndDrafts,
};
