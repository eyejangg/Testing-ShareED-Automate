// @ts-check
const { Page } = require('@playwright/test');

const APP_URL = 'https://share-ed-frontend-gamma.vercel.app';

/**
 * 🔑 ฟังก์ชันเข้าสู่ระบบด้วยบัญชีผู้ใช้
 * @param {import('@playwright/test').Page} page
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
 * 🧹 ฟังก์ชันเคลียร์/ลบโพสต์และแบบร่างทั้งหมดในบัญชี
 * @param {import('@playwright/test').Page} page
 */
async function cleanAllUserPostsAndDrafts(page) {
  try {
    console.log('🧹 [Cleanup] กำลังตรวจสอบและเคลียร์ข้อมูลใน Profile...');

    // ==========================================
    // 📌 1. เคลียร์แท็บ "แบบร่าง" (Drafts)
    // ==========================================
    await page.goto(`${APP_URL}/profile`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const draftTab = page.getByRole('button', { name: /แบบร่าง/i });
    if (await draftTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await draftTab.click();
      await page.waitForTimeout(1500);

      // วนลูปตามลบแบบร่างทีละรายการ (สูงสุด 5 รายการ)
      for (let i = 0; i < 5; i++) {
        const editDraftBtn = page.getByRole('button', { name: 'แก้ไขโพสต์' }).first();

        // รอให้การ์ดแบบร่างโหลดจาก API เสร็จสิ้น
        const hasDraft = await editDraftBtn.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
        if (!hasDraft) {
          break; // ถ้าไม่มีแบบร่างแล้ว ให้จบการลูป
        }

        console.log(`🧹 [Cleanup] พบแบบร่างที่ ${i + 1} -> กำลังกดแก้ไขเพื่อลบ...`);
        await editDraftBtn.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // 2. กดปุ่ม "ลบโพสต์"
        const deleteBtn = page.getByRole('button', { name: 'ลบโพสต์' });
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);

          // 3. กดยืนยันปุ่มสีแดง "ใช่, ลบเลย"
          const confirmBtn = page.getByRole('button', { name: 'ใช่, ลบเลย' });
          await confirmBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
          if (await confirmBtn.isVisible().catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);

            // 4. กดปุ่ม "OK"
            const okBtn = page.getByRole('button', { name: 'OK' });
            if (await okBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
              await okBtn.click();
              await page.waitForTimeout(500);
            }
            console.log(`✅ [Cleanup] ลบแบบร่างที่ ${i + 1} สำเร็จ`);
          }
        }

        // กลับมาที่หน้าโปรไฟล์แท็บแบบร่างเพื่อลบรายการถัดไป
        await page.goto(`${APP_URL}/profile`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: /แบบร่าง/i }).click();
        await page.waitForTimeout(1500);
      }
    }

    // ==========================================
    // 📌 2. เคลียร์แท็บ "โพสต์ของฉัน" (My Posts)
    // ==========================================
    await page.goto(`${APP_URL}/profile`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const myPostsTab = page.getByRole('button', { name: /โพสต์ของฉัน/i });
    if (await myPostsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await myPostsTab.click();
      await page.waitForTimeout(1500);

      // วนลูปตามลบโพสต์ทีละรายการ (สูงสุด 5 รายการ)
      for (let i = 0; i < 5; i++) {
        const myPostCard = page.locator('.grid h3, .grid h4, a[href*="/post/"]').first();

        // รอให้การ์ดโพสต์โหลดจาก API เสร็จสิ้น
        const hasPost = await myPostCard.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
        if (!hasPost) {
          break; // ถ้าไม่มีโพสต์แล้ว ให้จบการลูป
        }

        console.log(`🧹 [Cleanup] พบโพสต์ที่ ${i + 1} -> กำลังกดเข้าเพื่อลบ...`);
        await myPostCard.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // 2. กดปุ่ม "ลบโพสต์"
        const deletePostBtn = page.locator('button:has-text("ลบโพสต์"), button:has-text("ลบ"), a:has-text("ลบโพสต์")').first();
        await deletePostBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
        if (await deletePostBtn.isVisible().catch(() => false)) {
          await deletePostBtn.click();
          await page.waitForTimeout(500);

          // 3. กดยืนยัน "ใช่, ลบเลย"
          const confirmPostBtn = page.getByRole('button', { name: 'ใช่, ลบเลย' });
          await confirmPostBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
          if (await confirmPostBtn.isVisible().catch(() => false)) {
            await confirmPostBtn.click();
            await page.waitForTimeout(1000);

            // 4. กดปุ่ม "OK"
            const okPostBtn = page.getByRole('button', { name: 'OK' });
            if (await okPostBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
              await okPostBtn.click();
              await page.waitForTimeout(500);
            }
            console.log(`✅ [Cleanup] ลบโพสต์ที่ ${i + 1} สำเร็จ`);
          }
        }

        // กลับมาที่หน้าโปรไฟล์แท็บโพสต์ของฉันเพื่อลบรายการถัดไป
        await page.goto(`${APP_URL}/profile`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
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
  cleanAllUserPostsAndDrafts,
};
