import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Scenario TS-POST-006: ลบโพสต์สำเร็จ', () => {

  test('[Positive] TC-POST-07: ลบโพสต์ของตนเองสำเร็จ', async ({ page }) => {

    /* 📌 0. กำหนดตัวแปรและข้อมูลทดสอบทั้งหมดไว้ด้านบนสุด (Test Data) */

    const postTitle = 'โพสต์สำหรับทดสอบการลบ';
    const shortSummary = 'โพสต์ทดสอบสำหรับการลบโดยเฉพาะ';
    const detailedContent = 'เอกสารสรุปเล่มนี้รวบรวมพื้นฐานภาษาอังกฤษที่สำคัญ สำหรับนำมาใช้ทดสอบระบบการลบโพสต์';

    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-engAZ.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/20pages.pdf');

    /* 1. เข้าสู่หน้าเว็บหลัก และเข้าสู่ระบบเป็น Member */
    await page.goto('https://share-ed-frontend-gamma.vercel.app/');
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill('ptwptw1600@gmail.com');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('_Eart1101');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    /* 2. สร้างโพสต์ชั่วคราวขึ้นมา 1 โพสต์เพื่อใช้เป็นเป้าหมายในการลบ */
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill(postTitle);
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);
    await page.getByRole('textbox', { name: 'อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้ (จะนำไปแสดงบนการ์ดในหน้ารายการ) เช่น สรุปฟิสิกส' }).fill(shortSummary);

    await page.getByRole('button', { name: 'ตั้งค่าวิชาและแท็ก' }).click();
    await page.getByRole('combobox').nth(1).selectOption('ภาษาอังกฤษ');
    await page.getByRole('button', { name: '#เรียนรู้ไปด้วยกัน' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // เติมรายละเอียดเพิ่มเติมใน Rich Text Editor (.ql-editor)
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(detailedContent);

    // อัปโหลดไฟล์ PDF
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);

    // กดปุ่ม "โพสต์สรุปความรู้"
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();
    
    // รอจนกระทั่งป๊อปอัป "โพสต์สำเร็จ!" แสดงผลขึ้นมา แล้วกดปุ่ม OK
    await expect(page.getByRole('dialog', { name: 'โพสต์สำเร็จ!' })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'OK' }).click();

    /* 3. เปิดเมนูผู้ใช้ และไปหน้า "โปรไฟล์ของฉัน" */
    await page.getByRole('button', { name: 'เมนูผู้ใช้' }).click();
    await page.getByRole('link', { name: 'โปรไฟล์ของฉัน' }).click();

    /* 4. กดคลิกเลือกโพสต์ชั่วคราวที่เราเพิ่งสร้างขึ้นมา เพื่อเข้าสู่หน้ารายละเอียดโพสต์ */
    await page.getByRole('heading', { name: postTitle }).click();

    /* 5. คลิกปุ่ม "ลบโพสต์" */
    await page.getByRole('button', { name: 'ลบโพสต์' }).click();

    /* 6. กดยืนยันการลบโพสต์ในป๊อปอัปด้วยปุ่ม "ใช่, ลบเลย" */
    await page.getByRole('button', { name: 'ใช่, ลบเลย' }).click();

    /* 7. ยืนยันผลลัพธ์ (Assertions) */
    // 7.1 ตรวจสอบว่ามีป๊อปอัปแจ้งเตือน "ลบสำเร็จ!" แสดงขึ้นมา
    await expect(page.getByRole('dialog', { name: 'ลบสำเร็จ!' })).toBeVisible({ timeout: 30000 });

    // 7.2 กดปุ่ม OK บนป๊อปอัป "ลบสำเร็จ!"
    await page.getByRole('button', { name: 'OK' }).click();

    /* 8. ยืนยันว่ากลับมาหน้าโปรไฟล์และโพสต์ดังกล่าวถูกลบออกไปแล้ว (toBeHidden) */
    await page.goto('https://share-ed-frontend-gamma.vercel.app/profile');
    await expect(page.getByRole('heading', { name: postTitle })).toBeHidden();
  });

});
