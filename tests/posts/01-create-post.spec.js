// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { cleanAllUserPostsAndDrafts } = require('../utils/cleanup');
/* cSpell:disable */

// กำหนดให้รันทดสอบเรียงลำดับทีละเคส (Sequential / Serial execution)
test.describe.configure({ mode: 'serial' });

// ⏱️ กำหนด Timeout เริ่มต้น 60 วินาทีสำหรับแต่ละเคส
test.beforeEach(async () => {
  test.setTimeout(60000);
});



test.describe('Scenario 2.1: ผู้ใช้งานสามารถสร้างและเผยแพร่โพสต์ใหม่', () => {

  test('[Positive] TC-POST-01: สร้างโพสต์ด้วยข้อมูลที่ถูกต้องครบถ้วน', async ({ page }) => {
    // ขยายเวลารองรับการเคลียร์ข้อมูลเดิมและสร้างโพสต์ใหม่
    test.setTimeout(90000);

    /* 📌 0. กำหนดข้อความและตำแหน่งไฟล์ที่ใช้อัปโหลดทั้งหมดไว้ด้านบนสุด (Test Data) */
    const postTitle = 'สรุปไวยากรณ์ภาษาอังกฤษ A–Z (English Grammar Essentials: A–Z Guide)';
    const shortSummary = 'สรุปเนื้อหาวิชาภาษาอังกฤษตั้งแต่ A–Z ครอบคลุมคำศัพท์ ไวยากรณ์ \nโครงสร้างประโยค กาล (Tenses) และการใช้ภาษาในชีวิตประจำวัน \nเหมาะสำหรับนักเรียนระดับมัธยมต้น ใช้ทบทวนก่อนสอบได้อย่างรวดเร็ว';
    const detailedContent = 'เอกสารสรุปเล่มนี้รวบรวมพื้นฐานภาษาอังกฤษที่สำคัญ ได้แก่ ตัวอักษรภาษาอังกฤษ\n\n (Alphabet) สระ a, e, i, o, u คำนาม (Nouns) คำสรรพนาม (Pronouns) \n\nคำกริยา (Verbs) คำคุณศัพท์ (Adjectives) คำวิเศษณ์ (Adverbs) บุพบท (Prepositions) \n\nคำสันธาน (Conjunctions) โครงสร้างประโยค (Sentence Structure) เครื่องหมายวรรคตอน (Punctuation) \n\nและการใช้ Tenses พร้อมตัวอย่างประโยคและแบบฝึกหัด เพื่อพัฒนาทักษะการฟัง พูด อ่าน และเขียนภาษาอังกฤษ';

    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-engAZ.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/สรุปข้อมูล.pdf');
    const imagePaths = [
      path.join(__dirname, '../../test-data/images/คำนาม.png'),
      path.join(__dirname, '../../test-data/images/สระ.png')
    ];

    // 1. เคลียร์โพสต์และแบบร่างเดิมที่มีอยู่ในบัญชีออกทั้งหมดก่อนเริ่มการทดสอบ (Auto Cleanup)
    await cleanAllUserPostsAndDrafts(page);

    // 2. เข้าสู่หน้าแรก (ใช้ Session ล็อกอินจาก Global Setup อัตโนมัติ)
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    // 3. กดปุ่ม "สร้างโพสต์"
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 4. กรอกชื่อหัวข้อสรุป
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill(postTitle);

    // 5. เลือกระดับชั้น "มัธยมศึกษาตอนต้น"
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    // 6. อัปโหลดรูปปก
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);

    // 7. กรอกบทสรุปย่อ
    await page.getByRole('textbox', { name: 'อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้ (จะนำไปแสดงบนการ์ดในหน้ารายการ) เช่น สรุปฟิสิกส' }).fill(shortSummary);

    // 8. เลือกหมวดหมู่วิชาและแท็ก
    await page.getByRole('button', { name: 'ตั้งค่าวิชาและแท็ก' }).click();
    await page.getByRole('combobox').nth(1).selectOption('ภาษาอังกฤษ');
    await page.getByRole('button', { name: '#เรียนรู้ไปด้วยกัน' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 9. กรอกรายละเอียดเพิ่มเติมใน Rich Text Editor (.ql-editor)
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(detailedContent);

    // 10. อัปโหลดไฟล์เอกสาร PDF
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);

    // 11. อัปโหลดไฟล์รูปภาพประกอบ
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    // 12. กดปุ่ม "โพสต์สรุปความรู้"
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();

    // 13. ยืนยันผลลัพธ์ (Assertions): ตรวจสอบหน้าต่างแจ้งเตือน "โพสต์สำเร็จ!"
    await expect(page.getByRole('dialog', { name: /โพสต์สำเร็จ/i })).toBeVisible({ timeout: 30000 });

    // 14. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือน เพื่อให้ระบบเปลี่ยนหน้าไปยังหน้าแรก
    if (await page.getByRole('button', { name: 'OK' }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: 'OK' }).click();
    }

    // 15. ยืนยันผลลัพธ์ว่าโพสต์ปรากฏบนหน้าแรกหรือหน้าสำรวจจริง (Data Persistence Assertion)
    await expect(page).toHaveURL(/.*(home|explore)/, { timeout: 15000 });
    await expect(page.getByText(/สรุปไวยากรณ์ภาษาอังกฤษ A–Z/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('[Negative] TC-POST-02: การสร้างโพสต์เมื่อข้อมูลช่องที่บังคับไม่ครบ', async ({ page }) => { // ขาด แท็ค 
    // 1. เข้าสู่หน้าแรก (ใช้ Session จาก Global Setup)
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    // 2. กดปุ่มเมนูผู้ใช้ (ถ้ามี) หรือกดเข้าหน้าสร้างโพสต์โดยตรง
    if (await page.getByRole('button', { name: 'เมนูผู้ใช้' }).isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'เมนูผู้ใช้' }).click();
    }
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 3. กดปุ่ม "โพสต์สรุปความรู้" โดยไม่กรอกข้อมูลบังคับ
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();

    // 4. ยืนยันผลลัพธ์ (Assertions): ตรวจสอบข้อความ Inline Error แจ้งเตือนช่องบังคับครบทั้ง 3 จุด
    await expect(page.getByText('กรุณากรอกชื่อหัวข้อสรุปความรู้')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('กรุณาเลือกระดับชั้น')).toBeVisible({ timeout: 5000 });
    await page.getByText('กรุณากรอกบทสรุปย่อ').scrollIntoViewIfNeeded();
    await expect(page.getByText('กรุณากรอกบทสรุปย่อ')).toBeVisible({ timeout: 5000 });
  });

});

test.describe('Scenario 2.2: ผู้ใช้งานสามารถบันทึกโพสต์เป็นแบบร่าง', () => {

  test('[Positive] TC-POST-03: การบันทึกโพสต์ฉบับร่างเมื่อข้อมูลช่องที่บังคับครบถ้วน', async ({ page }) => {
    /* 📌 0. กำหนดข้อความและตำแหน่งไฟล์ที่ใช้ทดสอบ (Test Data) */
    const draftTitle = '[แบบร่าง / DRAFT] สรุปเนื้อหาเตรียมสอบเคมีเบื้องต้น';
    const draftSummary = '[ฉบับร่าง] สรุปเนื้อหาเตรียมสอบวิชาเคมี ม.ปลาย สำหรับบันทึกแบบร่าง (Draft Post)';
    const draftContent = 'เนื้อหาฉบับร่าง (Draft Content) โครงสร้างอะตอมและตารางธาตุ อยู่ระหว่างการรวบรวมข้อมูลเพิ่มเติม...';

    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-engAZ.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/สรุปข้อมูล.pdf');
    const imagePaths = [
      path.join(__dirname, '../../test-data/images/คำนาม.png'),
      path.join(__dirname, '../../test-data/images/สระ.png')
    ];

    // 1. เข้าสู่หน้าสร้างโพสต์โดยตรง
    await page.goto('/home');
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 2. กรอกหัวข้อ, คำอธิบายย่อของโพสต์, รายละเอียดโพสต์ และหัวข้อบังคับให้ครบถ้วน
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill(draftTitle);
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนปลาย');
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);
    await page.getByRole('textbox', { name: 'อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้ (จะนำไปแสดงบนการ์ดในหน้ารายการ) เช่น สรุปฟิสิกส' }).fill(draftSummary);

    await page.getByRole('button', { name: 'ตั้งค่าวิชาและแท็ก' }).click();
    await page.getByRole('combobox').nth(1).selectOption('วิทยาศาสตร์');
    await page.getByRole('button', { name: '#เรียนรู้ไปด้วยกัน' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(draftContent);
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    // 3. กดปุ่ม "บันทึกแบบร่าง"
    await page.getByRole('button', { name: 'บันทึกแบบร่าง' }).click();

    // 4. ยืนยันผลลัพธ์ (Assertions): ตรวจสอบ Modal "บันทึกสำเร็จ!" หรือแจ้งเตือนโควตา
    await expect(page.getByText('บันทึกสำเร็จ!').or(page.getByText(/คุณสร้างโพสต์ครบขีดจำกัด/i))).toBeVisible({ timeout: 15000 });

    // 5. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือน
    if (await page.getByRole('button', { name: 'OK' }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: 'OK' }).click();
    }

    // 6. กลับมาที่หน้าโปรไฟล์ และตรวจสอบแท็บ "แบบร่าง" ว่ามีโพสต์แบบร่างแสดงอยู่จริง
    await page.goto('/profile');
    await page.getByRole('button', { name: /แบบร่าง/i }).click();
    await page.getByText(draftTitle).first().scrollIntoViewIfNeeded();
    await expect(page.getByText(draftTitle).first()).toBeVisible({ timeout: 10000 }); // expect ว่า มีชื่อโพสต์แบบร่าง อยู่ป่าว เป็นการจบ
  });

});

test.describe('Scenario 2.3: ผู้ใช้งานสามารถแก้ไขโพสต์ของตนเอง', () => {

  test('[Positive] TC-POST-04: ผู้ใช้งานสามารถแก้ไขโพสต์ของตนเอง', async ({ page }) => {
    /* 📌 0. กำหนดข้อมูลที่ต้องการแก้ไข (Test Data) */
    const targetPostTitle = 'สรุปไวยากรณ์ภาษาอังกฤษ A–Z (English Grammar Essentials: A–Z Guide)';
    const updatedSummary = 'อัปเดตคำอธิบายย่อใหม่: รวบรวมสรุปไวยากรณ์ฉบับปรับปรุงใหม่ล่าสุด 2026';
    const updatedContent = 'เนื้อหาอัปเดตใหม่ทั้งหมด: สรุปหลักไวยากรณ์ โครงสร้างประโยค และแบบฝึกหัดเพิ่มเติมฉบับสมบูรณ์ 2026';
    const updatedPdfPath = path.join(__dirname, '../../test-data/files/แก้ไขโพสต์.pdf');
    const updatedImagePaths = [
      path.join(__dirname, '../../test-data/images/แก้ไข_ภาษาไทย.png')
    ];

    // 1. ไปยังหน้าโปรไฟล์
    await page.goto('/profile');

    // 2. กดปุ่มแท็บ "โพสต์ของฉัน"
    await page.getByRole('button', { name: /โพสต์ของฉัน/i }).click();

    // 3. คลิกเข้าสู่หน้ารายละเอียดโพสต์ของตนเองจากชื่อโพสต์
    await page.getByText(targetPostTitle).first().click();

    // 4. กดปุ่ม "แก้ไขโพสต์"
    await page.locator('button:has-text("แก้ไขโพสต์"), a:has-text("แก้ไขโพสต์")').first().click();

    // 5. ยืนยันว่าเข้าสู่หน้า "แก้ไขสรุปความรู้ของคุณ" และระบบดึงข้อมูลเดิมมาแสดง
    await expect(page.getByText('แก้ไขสรุปความรู้ของคุณ')).toBeVisible({ timeout: 15000 });

    // 6. แก้ไขคำอธิบายใหม่ทั้งหมด (คำอธิบายย่อ, เนื้อหาละเอียด, ไฟล์ PDF และรูปภาพประกอบ)
    await page.getByRole('textbox', { name: /อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้/i }).fill(updatedSummary);
    await page.locator('.ql-editor').fill(updatedContent);
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(updatedPdfPath);
    await page.getByLabel('', { exact: true }).setInputFiles(updatedImagePaths);

    // ยืนยันว่าไฟล์เอกสาร PDF แสดงขึ้นมาในหน้าฟอร์มแก้ไข
    await page.getByText('แก้ไขโพสต์.pdf').scrollIntoViewIfNeeded();
    await expect(page.getByText('แก้ไขโพสต์.pdf')).toBeVisible({ timeout: 15000 });

    // 7. กดปุ่ม "บันทึกและโพสต์"
    await page.getByRole('button', { name: 'บันทึกและโพสต์' }).click();

    // 8. ยืนยันผลลัพธ์ (Assertions): ตรวจสอบข้อความแจ้งเตือนบันทึกการแก้ไขสำเร็จ
    await expect(page.getByText('บันทึกการแก้ไขสำเร็จ!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('แก้ไขโพสต์สรุปความรู้เรียบร้อยแล้ว')).toBeVisible({ timeout: 15000 });

    // 9. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือน
    await page.getByRole('button', { name: 'OK' }).click();

    // 10. ยืนยันข้อมูลถูกอัปเดตจริง (Data Persistence Assertion)
    await page.getByText(targetPostTitle).first().scrollIntoViewIfNeeded();
    await expect(page.getByText(targetPostTitle).first()).toBeVisible({ timeout: 15000 });

    await page.getByText(updatedSummary).scrollIntoViewIfNeeded();
    await expect(page.getByText(updatedSummary)).toBeVisible({ timeout: 15000 });

    await page.getByText(updatedContent).scrollIntoViewIfNeeded();
    await expect(page.getByText(updatedContent)).toBeVisible({ timeout: 15000 });
  });

});

test.describe('Scenario 2.4: ผู้ใช้งานสามารถลบโพสต์ของตนเองได้สำเร็จ', () => {

  test('[Positive] TC-POST-05: ผู้ใช้งานสามารถลบโพสต์ของตนเองได้สำเร็จ', async ({ page }) => {
    /* 📌 0. กำหนดชื่อโพสต์ที่ต้องการลบ */
    const targetPostTitle = 'สรุปไวยากรณ์ภาษาอังกฤษ A–Z (English Grammar Essentials: A–Z Guide)';

    // 1. ไปยังหน้าโปรไฟล์ และเลือกแท็บ "โพสต์ของฉัน"
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /โพสต์ของฉัน/i }).click();
    await page.waitForTimeout(1500);

    // 2. คลิกเข้าสู่หน้ารายละเอียดโพสต์ของตนเองจากชื่อโพสต์
    await page.getByText(targetPostTitle).first().scrollIntoViewIfNeeded();
    await page.getByText(targetPostTitle).first().click();
    await page.waitForLoadState('domcontentloaded');

    // 3. กดเลือกปุ่ม "ลบโพสต์"
    await page.locator('button:has-text("ลบโพสต์"), a:has-text("ลบโพสต์")').first().click();

    // 4. กดยืนยันในหน้าต่างแจ้งเตือน -> กดปุ่ม "ใช่, ลบเลย"
    const confirmDeleteBtn = page.getByRole('button', { name: /ใช่.*ลบเลย/i });
    await confirmDeleteBtn.scrollIntoViewIfNeeded();
    await expect(confirmDeleteBtn).toBeVisible({ timeout: 10000 });
    await confirmDeleteBtn.click();

    // 5. ตรวจสอบหน้าต่างแจ้งเตือน "ลบสำเร็จ!" และ "โพสต์ของคุณถูกลบเรียบร้อยแล้ว"
    await expect(page.getByRole('heading', { name: 'ลบสำเร็จ!' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('โพสต์ของคุณถูกลบเรียบร้อยแล้ว')).toBeVisible({ timeout: 15000 });

    // 6. กดปุ่ม "OK" บนหน้าต่างแจ้งเตือน
    if (await page.getByRole('button', { name: 'OK' }).isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'OK' }).click();
    }

    // 7. ยืนยันผลลัพธ์ (Assertions): ตรวจสอบว่าชื่อโพสต์นั้นถูกถอนออกและมองไม่เห็นแล้ว
    await expect(page.getByText(targetPostTitle)).toBeHidden({ timeout: 15000 });
  });

});

test.describe('Scenario 2.5: ตรวจสอบประเภทไฟล์ที่ระบบรองรับและไม่รองรับ', () => {

  test('[Positive] TC-POST-06: อัพโหลด ไฟล์ประเภทที่ ระบบรองรับ (PNG, JPEG, PDF)', async ({ page }) => {
    /* 📌 0. กำหนดไฟล์ที่ระบบรองรับ (Valid Files: .png, .jpg, .pdf) */
    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-engAZ.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/สรุปข้อมูล.pdf');
    const imagePaths = [
      path.join(__dirname, '../../test-data/images/คำนาม.png'),
      path.join(__dirname, '../../test-data/images/สระ.png')
    ];

    // 1. กดคลิกเข้าสู่หน้าสร้างโพสต์
    await page.goto('/home');
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 2. กรอกข้อมูลจำเป็น
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill('ทดสอบอัปโหลดไฟล์ประเภทที่ระบบรองรับ');
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    // 3. แนบรูปปก (PNG/JPEG)
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);

    // 4. แนบไฟล์เอกสาร (PDF)
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);

    // 5. แนบรูปภาพประกอบ (PNG/JPEG)
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    // 6. ยืนยันผลลัพธ์ (Assertions): ระบบอนุญาตให้อัปโหลดไฟล์ที่ถูกประเภท และแสดงไฟล์ขึ้นมาถูกต้อง
    await page.getByText('สรุปข้อมูล.pdf').scrollIntoViewIfNeeded();
    await expect(page.getByText('สรุปข้อมูล.pdf')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('สามารถอัปโหลดไฟล์ .jpg,.jpeg,.png เท่านั้น')).toBeHidden();
    await expect(page.getByText('สามารถอัปโหลดไฟล์ .pdf เท่านั้น')).toBeHidden();
  });

  test('[Negative] TC-POST-07: อัพโหลด ไฟล์ประเภทที่ ระบบไม่รองรับ (.DOCX หรือ .GIF)', async ({ page }) => {
    /* 📌 0. กำหนดไฟล์ที่ไม่รองรับ (Invalid Files: .docx, .gif) */
    const invalidDocPath = path.join(__dirname, '../../test-data/files/sample-invalid.docx');
    const invalidGifPath = path.join(__dirname, '../../test-data/images/sample-invalid.gif');

    // 1. เข้าสู่หน้าสร้างโพสต์
    await page.goto('/home');
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 2. กรอกข้อมูลบังคับ
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill('ทดสอบอัปโหลดไฟล์ประเภทที่ไม่รองรับ');
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    // 3. ทดสอบที่ 1: อัปโหลดไฟล์ไม่ถูกต้องที่ช่อง "รูปปก" (.docx / .gif)
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(invalidGifPath);
    await page.getByText('สามารถอัปโหลดไฟล์ .jpg,.jpeg,.png เท่านั้น').first().scrollIntoViewIfNeeded();
    await expect(page.getByText('สามารถอัปโหลดไฟล์ .jpg,.jpeg,.png เท่านั้น').first()).toBeVisible({ timeout: 10000 });

    // 4. ทดสอบที่ 2: อัปโหลดไฟล์ไม่ถูกต้องที่ช่อง "ไฟล์เอกสาร PDF" (.docx)
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(invalidDocPath);
    await page.getByText('สามารถอัปโหลดไฟล์ .pdf เท่านั้น').scrollIntoViewIfNeeded();
    await expect(page.getByText('สามารถอัปโหลดไฟล์ .pdf เท่านั้น')).toBeVisible({ timeout: 10000 });

    // 5. ทดสอบที่ 3: อัปโหลดไฟล์ไม่ถูกต้องที่ช่อง "รูปภาพประกอบ" (.docx / .gif)
    await page.getByLabel('', { exact: true }).setInputFiles([invalidGifPath]);
    await page.getByText('สามารถอัปโหลดไฟล์ .jpg,.jpeg,.png เท่านั้น').last().scrollIntoViewIfNeeded();
    await expect(page.getByText('สามารถอัปโหลดไฟล์ .jpg,.jpeg,.png เท่านั้น').last()).toBeVisible({ timeout: 10000 });
  });

});

test.describe('Scenario 2.6: ระบบไม่อนุญาตให้แก้ไขหรือลบโพสต์ของบุคคลอื่น', () => {

  test('[Negative] TC-POST-08: ระบบไม่อนุญาตให้แก้ไขหรือลบโพสต์ของบุคคลอื่น', async ({ page }) => {
    // 1. ตรวจสอบที่หน้ารายละเอียดโพสต์ของ Member B ว่าไม่มีปุ่มแก้ไขและลบโพสต์
    const otherUserPostId = 'ae92e738-17e4-4b05-a045-da9773518e15';
    await page.goto(`/post/${otherUserPostId}`);
    await page.waitForTimeout(2000);

    await expect(page.locator('button:has-text("แก้ไขโพสต์"), a:has-text("แก้ไขโพสต์")')).toBeHidden();
    await expect(page.locator('button:has-text("ลบโพสต์"), a:has-text("ลบโพสต์")')).toBeHidden();

    // 2. Member A พยายามเข้าถึง URL สำหรับแก้ไขโพสต์ที่เป็นของ Member B โดยตรง (ID โพสต์ของผู้อื่น)
    await page.goto(`/post/edit/${otherUserPostId}`);
    await page.waitForTimeout(2000);

    // 3. พยายามกดปุ่ม "บันทึกและโพสต์"
    await page.getByRole('button', { name: 'บันทึกและโพสต์' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'บันทึกและโพสต์' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'บันทึกและโพสต์' }).click();

    // 4. ยืนยันว่าระบบแสดงแจ้งเตือนปฏิเสธการแก้ไขโพสต์ของผู้อื่น
    await expect(page.getByText('คุณไม่มีสิทธิ์แก้ไขโพสต์ของผู้อื่น')).toBeVisible({ timeout: 10000 });
    if (await page.getByRole('button', { name: 'OK' }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: 'OK' }).click();
    }
  });

});