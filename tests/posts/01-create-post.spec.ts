import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Scenario TS-POST-001: สร้างและเผยแพร่โพสต์สำเร็จ', () => {

  test('[Positive] TC-POST-01: สร้างโพสต์ด้วยข้อมูลที่ถูกต้องครบถ้วน', async ({ page }) => {
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

    // 1. เข้าสู่หน้าเว็บหลัก
    await page.goto('https://share-ed-frontend-gamma.vercel.app/');

    // 2. คลิกข้อความบนหน้าหลัก
    await page.getByText('แพลตฟอร์มการเรียนรู้แห่งใหม่สำหรับคุณแบ่งปันความรู้ สู่ความสำเร็จเรียนฟรีไม่มี').click();

    // 3. คลิกปุ่ม "เข้าสู่ระบบ"
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();

    // 4. เข้าสู่ระบบ
    await page.getByRole('heading', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill('ptwptw1600@gmail.com');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('_Eart1101');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    // 5. คลิก icon ปากกา และกด ปุ่ม "สร้างโพสต์" 
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();
    
    // 6. กรอกชื่อหัวข้อสรุป
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill(postTitle);
    
    // 7. เลือกระดับชั้น "มัธยมศึกษาตอนต้น"
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    // 8. อัปโหลดรูปปก
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);

    // 9. กรอกบทสรุปย่อ
    await page.getByRole('textbox', { name: 'อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้ (จะนำไปแสดงบนการ์ดในหน้ารายการ) เช่น สรุปฟิสิกส' }).fill(shortSummary);

    // 10. เลือกหมวดหมู่วิชาและแท็ก
    await page.getByRole('button', { name: 'ตั้งค่าวิชาและแท็ก' }).click();
    await page.getByRole('combobox').nth(1).selectOption('ภาษาอังกฤษ');
    await page.getByRole('button', { name: '#เรียนรู้ไปด้วยกัน' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 11. กรอกรายละเอียดเพิ่มเติมใน Rich Text Editor (.ql-editor)
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(detailedContent);

    // 12. อัปโหลดไฟล์เอกสาร PDF
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);

    // 13. อัปโหลดไฟล์รูปภาพประกอบ
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    // 14. กดปุ่ม "โพสต์สรุปความรู้"
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();

    // 15. ยืนยันผลลัพธ์ (Assertions)
    await expect(page.getByRole('dialog', { name: 'โพสต์สำเร็จ!' })).toBeVisible({ timeout: 30000 });

    // 16. ยืนยันว่า ตอนนี้ URL อยู่ที่หน้าแรก 
    await expect(page).toHaveURL('https://share-ed-frontend-gamma.vercel.app/home');
  });

  test('[Positive] TC-POST-02: สร้างโพสต์โดยใช้ตัวอักษรพิเศษและ Unicode', async ({ page }) => {
    /* 📌 0. กำหนดข้อความและตำแหน่งไฟล์ที่ใช้อัปโหลดทั้งหมดไว้ด้านบนสุด (Test Data) */
    const postTitle = '★☆ [Unicode Test] สรุปไวยากรณ์ 🔥 𝓔𝓷𝓰𝓵𝓲𝓼𝓱 𝓖𝓻𝓪𝓶𝓶𝓪𝓻 (x² + y² = z²) ~!@#$%^&*()_+';
    const shortSummary = '✨ สรุปเนื้อหาตัวอักษรพิเศษ & Emojis 🚀 (Unicode test: English - 日本語 - 🌟 - ½ ¾ ¼) 💯 #SpecialChars @2026!';
    const detailedContent = 'เอกสารสรุปเล่มนี้ทดสอบตัวอักษรพิเศษ 🌐 & Special Characters 🔥\n\n (α, β, γ, θ, ∑, ∞, ≤, ≥, ≠, ±) พร้อม Emojis 📚✨💡\n\n [Test Cases: !@#$%^&*()_+-={}|[]\\:";\'<>?,./]';

    const coverPath = path.join(__dirname, '../../test-data/images/Gemini-cover-engAZ.png');
    const pdfPath = path.join(__dirname, '../../test-data/files/สรุปข้อมูล.pdf');
    const imagePaths = [
      path.join(__dirname, '../../test-data/images/คำนาม.png'),
      path.join(__dirname, '../../test-data/images/สระ.png')
    ];

    // 1. เข้าสู่หน้าเว็บหลัก
    await page.goto('https://share-ed-frontend-gamma.vercel.app/');

    // 2. คลิกข้อความบนหน้าหลัก
    await page.getByText('แพลตฟอร์มการเรียนรู้แห่งใหม่สำหรับคุณแบ่งปันความรู้ สู่ความสำเร็จเรียนฟรีไม่มี').click();

    // 3. คลิกปุ่ม "เข้าสู่ระบบ"
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();

    // 4. เข้าสู่ระบบ
    await page.getByRole('heading', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill('ptwptw1600@gmail.com');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('_Eart1101');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    // 5. คลิก icon ปากกา และกด ปุ่ม "สร้างโพสต์" 
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();
    
    // 6. กรอกชื่อหัวข้อสรุปที่มีอักขระพิเศษ สัญลักษณ์คณิตศาสตร์ และ Unicode Emojis
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill(postTitle);
    
    // 7. เลือกระดับชั้น "มัธยมศึกษาตอนต้น"
    await page.getByRole('combobox').selectOption('มัธยมศึกษาตอนต้น');

    // 8. อัปโหลดรูปปก
    await page.getByLabel('คลิกเพื่ออัปโหลดรูปปก').setInputFiles(coverPath);

    // 9. กรอกบทสรุปย่อด้วย Unicode และ Emojis 
    await page.getByRole('textbox', { name: 'อธิบายสั้นๆ เกี่ยวกับไฟล์สรุปนี้ (จะนำไปแสดงบนการ์ดในหน้ารายการ) เช่น สรุปฟิสิกส' }).fill(shortSummary);

    // 10. เลือกหมวดหมู่วิชาและแท็ก
    await page.getByRole('button', { name: 'ตั้งค่าวิชาและแท็ก' }).click();
    await page.getByRole('combobox').nth(1).selectOption('ภาษาอังกฤษ');
    await page.getByRole('button', { name: '#เรียนรู้ไปด้วยกัน' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 11. กรอกรายละเอียดเพิ่มเติมใน Rich Text Editor ด้วยสัญลักษณ์ทางคณิตศาสตร์และอักขระพิเศษ
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill(detailedContent);

    // 12. อัปโหลดไฟล์เอกสาร PDF
    await page.getByLabel('อัปโหลดไฟล์ PDF').setInputFiles(pdfPath);

    // 13. อัปโหลดไฟล์รูปภาพประกอบ
    await page.getByLabel('', { exact: true }).setInputFiles(imagePaths);

    // 14. กดปุ่ม "โพสต์สรุปความรู้"
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();

    // 15. ยืนยันผลลัพธ์ (Assertions)
    await expect(page.getByRole('dialog', { name: 'โพสต์สำเร็จ!' })).toBeVisible({ timeout: 30000 });

    // 16. ยืนยันว่า ตอนนี้ URL อยู่ที่หน้าแรก 
    await expect(page).toHaveURL('https://share-ed-frontend-gamma.vercel.app/home');
  });

});

test.describe('Scenario TS-POST-002: สร้างโพสต์ไม่สำเร็จเนื่องจากไม่กรอกข้อมูลที่จำเป็นให้ครบถ้วน', () => {

  test('[Negative] TC-POST-03: พยายามสร้างโพสต์โดยไม่กรอกข้อมูลที่จำเป็น', async ({ page }) => {
    // 1. เข้าสู่หน้าเว็บหลัก และเข้าสู่ระบบ
    await page.goto('https://share-ed-frontend-gamma.vercel.app/');
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('textbox', { name: 'อีเมล' }).fill('ptwptw1600@gmail.com');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('_Eart1101');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    // 2. คลิกไปหน้าสร้างโพสต์
    await page.getByRole('link', { name: 'สร้างโพสต์' }).click();

    // 3. ไม่กรอกข้อมูลใดๆ (เว้นว่างช่องชื่อหัวข้อสรุปและข้อมูลจำเป็น)
    await page.getByRole('textbox', { name: 'เช่น สรุปสูตรฟิสิกส์ ม.4 เทอม' }).fill('');

    // 4. พยายามกดปุ่ม "โพสต์สรุปความรู้"
    await page.getByRole('button', { name: 'โพสต์สรุปความรู้' }).click();

    // 5. ยืนยันผลลัพธ์ (Assertion): ระบบต้องไม่อนุญาตให้สร้างโพสต์ (ป๊อปอัป "โพสต์สำเร็จ!" ต้องซ่อนอยู่ toBeHidden)
    await expect(page.getByRole('dialog', { name: 'โพสต์สำเร็จ!' })).toBeHidden();
  });

});
