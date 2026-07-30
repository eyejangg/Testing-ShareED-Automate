import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Scenario TS-POST-004: แก้ไขโพสต์สำเร็จโดยเจ้าของโพสต์', () => {

  test('[Positive] TC-POST-05: แก้ไขข้อมูลโพสต์ของตนเอง (เปลี่ยนรูปปก, เอกสาร PDF และเนื้อหาใหม่)', async ({ page }) => {

    /* 📌 0. กำหนดข้อความและตำแหน่งไฟล์ที่ใช้อัปโหลดทั้งหมดไว้ด้านบนสุด (Test Data) */
    const newTitle = 'รวม 50 สำนวน & วลีภาษาอังกฤษสุดฮิต (Fun English Idioms & Phrases 🎈)';
    const detailedContent = `รวบรวมสำนวนภาษาอังกฤษ (Idioms & Expressions) ที่พบบ่อยในข้อสอบและการสื่อสารจริง! 🚀\n\n1. Piece of cake 🍰 = เรื่องหมูๆ / ง่ายมาก\n   • Example: The English exam was a piece of cake!\n\n2. Break a leg 🎭 = ขอให้โชคดี (ใช้กับการแสดง/สอบ)\n   • Example: You have a speech today, break a leg!\n\n3. Hit the books 📚 = อ่านหนังสืออย่างหนัก\n   • Example: I need to hit the books for final exams.`;

    // รวม Path ไฟล์ทั้งหมดที่จะใช้อัปโหลดไว้ที่นี่
    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-สำนวนวลีเด็ด.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/20pages.pdf');
    const imagePaths = [
      path.join(__dirname, '../../test-data/images/Gemini-สำนวน.png'),
      path.join(__dirname, '../../test-data/images/Gemini-วลีเด็ด.png')
    ];

    /* 1. เข้าสู่หน้าเว็บหลัก */
    await page.goto('https://share-ed-frontend-gamma.vercel.app/');

    /* 2. คลิกเข้าสู่ระบบด้วยบัญชี Member */
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill('ptwptw1600@gmail.com');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('_Eart1101');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    /* 3. เปิดเมนูผู้ใช้ และไปที่หน้า "โปรไฟล์ของฉัน" */
    await page.getByRole('button', { name: 'เมนูผู้ใช้' }).click();
    await page.getByRole('link', { name: 'โปรไฟล์ของฉัน' }).click();

    /* 4. ค้นหาและคลิกเลือกโพสต์สรุปไวยากรณ์ภาษาอังกฤษที่สร้างจาก TC-POST-01 */
    await page.getByRole('heading', { name: /สรุปไวยากรณ์ภาษาอังกฤษ/i }).first().click();

    /* 5. กดปุ่ม "แก้ไขโพสต์" */
    await page.getByRole('link', { name: 'แก้ไขโพสต์' }).click();

    /* 6. ลบรูปปกเดิม และอัปโหลดรูปปกใหม่ */
    await page.getByRole('button', { name: 'ลบรูปปก' }).click();
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปกใหม่').setInputFiles(coverPath);

    /* 7. แก้ไขชื่อหัวข้อสรุปใหม่ */
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรตรีโกณมิติ ม' }).fill(newTitle);

    /* 8. แก้ไขบทสรุปย่อ */
    await page.getByRole('textbox', { name: 'เขียนอธิบายคร่าวๆ เกี่ยวกับสรุปความรู้นี้' }).fill(
      'รวม 50 สำนวนภาษาอังกฤษสุดปังที่ใช้ได้จริงในชีวิตประจำวัน เช่น Piece of cake 🍰 (ง่ายเหมือนปอกกล้วย), Break a leg 🎭 (ขอให้โชคดี), Hit the books 📚 (อ่านหนังสือหนัก) พร้อมตัวอย่างประโยคเก็ทง่ายทันที!'
    );

    /* 9. เปลี่ยนระดับชั้นเป็น "มหาวิทยาลัย" */
    await page.getByRole('combobox').selectOption('มหาวิทยาลัย');

    /* 10. แก้ไขรายละเอียดเนื้อหาใน Rich Text Editor (.ql-editor) */
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(detailedContent);

    /* 11. ลบไฟล์ PDF เดิม และอัปโหลดไฟล์ PDF ใหม่ */
    await page.getByRole('button', { name: 'ลบไฟล์ PDF' }).click();
    await page.getByLabel('อัปโหลดไฟล์ PDF ใหม่').setInputFiles(pdfPath);

    /* 12. ลบรูปภาพประกอบเดิม แล้วอัปโหลดรูปภาพใหม่ */
    await page.getByRole('button', { name: 'ลบรูปภาพ' }).first().click();
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    /* 13. กดปุ่ม "บันทึกและโพสต์" */
    await page.getByRole('button', { name: 'บันทึกและโพสต์' }).click();

    /* 14. ยืนยันผลลัพธ์ (Assertions) - รอป๊อปอัป "บันทึกการแก้ไขสำเร็จ!" */
    await expect(page.getByRole('dialog', { name: 'บันทึกการแก้ไขสำเร็จ!' })).toBeVisible({ timeout: 30000 });

    /* 15. กดปุ่ม OK ปิดป๊อปอัป */
    await page.getByRole('button', { name: 'OK' }).click();

    /* 16. ยืนยันว่าชื่อหัวข้อใหม่แสดงผลบนหน้าจอถูกต้อง */
    await expect(page.getByRole('heading', { name: newTitle })).toBeVisible();

  });

});