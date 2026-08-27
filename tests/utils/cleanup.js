// @ts-check
const { Page } = require('@playwright/test');

const APP_URL = 'https://share-ed-frontend-gamma.vercel.app';
const DEFAULT_EMAIL = 'ptwptw1600@gmail.com';
const DEFAULT_PASSWORD = '_Eart1101';

/**
 * 🔑 1. ฟังก์ชันเข้าสู่ระบบ (Login)
 * @param {Page} page
 * @param {string} [email]
 * @param {string} [password]
 */
async function loginUser(page, email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) {
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
 * 🗑️ 2. ฟังก์ชันกดยืนยันลบโพสต์ที่เปิดอยู่ (ลบโพสต์ -> ใช่, ลบเลย -> OK)
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

      // 3. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือนสำเร็จ
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
 * 📝 3. ฟังก์ชันเคลียร์ "แบบร่าง" (Drafts) ทั้งหมดในบัญชี
 * @param {Page} page
 */
async function cleanDrafts(page) {
  await page.goto(`${APP_URL}/profile`);
  await page.waitForLoadState('domcontentloaded');

  if (await page.getByRole('button', { name: /แบบร่าง/i }).isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole('button', { name: /แบบร่าง/i }).click();
    await page.waitForTimeout(1500);

    // วนลูปตามลบแบบร่างทีละรายการ (สูงสุด 5 รายการ)
    for (let i = 0; i < 5; i++) {
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
}

/**
 * 📰 4. ฟังก์ชันเคลียร์ "โพสต์ของฉัน" (My Posts) ทั้งหมดในบัญชี
 * @param {Page} page
 */
async function cleanMyPosts(page) {
  await page.goto(`${APP_URL}/profile`);
  await page.waitForLoadState('domcontentloaded');

  if (await page.getByRole('button', { name: /โพสต์ของฉัน/i }).isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole('button', { name: /โพสต์ของฉัน/i }).click();
    await page.waitForTimeout(1500);

    // วนลูปตามลบโพสต์ทีละรายการ (สูงสุด 5 รายการ)
    for (let i = 0; i < 5; i++) {
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
}

/**
 * 🧹 5. ฟังก์ชันหลักสำหรับเคลียร์ทั้งแบบร่างและโพสต์ทั้งหมด
 * @param {Page} page
 */
async function cleanAllUserPostsAndDrafts(page) {
  try {
    console.log('🧹 [Cleanup] กำลังตรวจสอบและเคลียร์ข้อมูลใน Profile...');
    await cleanDrafts(page);
    await cleanMyPosts(page);
  } catch (error) {
    console.error('⚠️ [Cleanup Error]:', error);
  }
}

module.exports = {
  APP_URL,
  loginUser,
  deleteCurrentOpenPost,
  cleanDrafts,
  cleanMyPosts,
  cleanAllUserPostsAndDrafts,
};
