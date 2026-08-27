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

  const loginLink = page.getByRole('link', { name: 'เข้าสู่ระบบ' });
  if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginLink.click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.waitForURL(/.*home/, { timeout: 15000 }).catch(() => { });
  }
}

/**
 * 🗑️ 2. ฟังก์ชันย่อยสำหรับกด "ลบโพสต์" -> ยืนยัน "ใช่, ลบเลย" -> กด "OK"
 * @param {Page} page
 */
async function confirmAndDelete(page) {
  // 1. กดปุ่ม "ลบโพสต์"
  const deleteBtn = page.locator('button:has-text("ลบโพสต์"), button:has-text("ลบ"), a:has-text("ลบโพสต์")').first();
  await deleteBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
  
  if (await deleteBtn.isVisible().catch(() => false)) {
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // 2. กดยืนยันในหน้าต่างแจ้งเตือน -> "ใช่, ลบเลย"
    const confirmBtn = page.getByRole('button', { name: 'ใช่, ลบเลย' });
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(1000);

      // 3. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือนสำเร็จ
      const okBtn = page.getByRole('button', { name: 'OK' });
      if (await okBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await okBtn.click();
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
async function cleanAllDrafts(page) {
  await page.goto(`${APP_URL}/profile`);
  await page.waitForLoadState('domcontentloaded');

  const draftTab = page.getByRole('button', { name: /แบบร่าง/i });
  if (await draftTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await draftTab.click();
    await page.waitForTimeout(1500);

    // วนลูปตามลบแบบร่างทีละรายการ (สูงสุด 5 รายการ)
    for (let i = 0; i < 5; i++) {
      const editDraftBtn = page.getByRole('button', { name: 'แก้ไขโพสต์' }).first();
      const hasDraft = await editDraftBtn.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
      
      if (!hasDraft) break; // ไม่มีแบบร่างแล้ว จบลูป

      console.log(`🧹 [Cleanup] พบแบบร่างที่ ${i + 1} -> กำลังลบ...`);
      await editDraftBtn.click();
      await page.waitForLoadState('domcontentloaded');

      const isDeleted = await confirmAndDelete(page);
      if (isDeleted) {
        console.log(`✅ [Cleanup] ลบแบบร่างที่ ${i + 1} สำเร็จ`);
      }

      // กลับมาหน้าโปรไฟล์แท็บแบบร่างเพื่อลบรายการถัดไป
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
async function cleanAllPosts(page) {
  await page.goto(`${APP_URL}/profile`);
  await page.waitForLoadState('domcontentloaded');

  const myPostsTab = page.getByRole('button', { name: /โพสต์ของฉัน/i });
  if (await myPostsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await myPostsTab.click();
    await page.waitForTimeout(1500);

    // วนลูปตามลบโพสต์ทีละรายการ (สูงสุด 5 รายการ)
    for (let i = 0; i < 5; i++) {
      const postCard = page.locator('.grid h3, .grid h4, a[href*="/post/"]').first();
      const hasPost = await postCard.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
      
      if (!hasPost) break; // ไม่มีโพสต์แล้ว จบลูป

      console.log(`🧹 [Cleanup] พบโพสต์ที่ ${i + 1} -> กำลังลบ...`);
      await postCard.click();
      await page.waitForLoadState('domcontentloaded');

      const isDeleted = await confirmAndDelete(page);
      if (isDeleted) {
        console.log(`✅ [Cleanup] ลบโพสต์ที่ ${i + 1} สำเร็จ`);
      }

      // กลับมาหน้าโปรไฟล์แท็บโพสต์ของฉันเพื่อลบรายการถัดไป
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
    await cleanAllDrafts(page);
    await cleanAllPosts(page);
  } catch (error) {
    console.error('⚠️ [Cleanup Error]:', error);
  }
}

module.exports = {
  APP_URL,
  loginUser,
  confirmAndDelete,
  cleanAllDrafts,
  cleanAllPosts,
  cleanAllUserPostsAndDrafts,
};
