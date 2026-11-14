import { chromium } from 'playwright';
import assert from 'node:assert/strict';

// Run against `npm run dev`. Optionally set CHROMIUM_PATH for a system browser.
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/#admin`);
  await page.getByRole('heading', { name: 'همه چیز، در یک نگاه' }).waitFor();
  console.log('Admin initial load: OK');

  const nav = name => page.locator('.ad-sidebar').getByRole('button', { name, exact: true });
  await nav('مدیریت کاربران').click();
  await page.getByRole('button', { name: 'کاربر جدید', exact: true }).click();
  await page.getByLabel('نام و نام خانوادگی', { exact: true }).fill('کاربر تست');
  await page.getByLabel('ایمیل', { exact: true }).fill('test@example.com');
  await page.getByLabel('شماره موبایل (اختیاری)').fill('09121112233');
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await page.getByRole('cell', { name: 'کاربر تست test@example.com' }).waitFor();
  await page.reload();
  await nav('مدیریت کاربران').click();
  await page.getByRole('cell', { name: 'کاربر تست test@example.com' }).waitFor();
  await page.getByRole('button', { name: 'ویرایش کاربر تست', exact: true }).click();
  await page.getByLabel('نام و نام خانوادگی', { exact: true }).fill('کاربر تست ویرایش');
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await page.getByRole('button', { name: 'حذف کاربر تست ویرایش', exact: true }).click();
  await page.getByRole('button', { name: 'حذف رکورد', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'حذف کاربر تست ویرایش', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'حذف علی محمدی', exact: true }).click();
  await page.getByText('این مورد به سوابق دیگر متصل است؛ به‌جای حذف، آن را غیرفعال کنید.').waitFor();
  console.log('User create / persistence / edit / deletion and relational guard: OK');

  await nav('تیکت‌های پشتیبانی').click();
  await page.getByRole('button', { name: 'مشاهده و پاسخ' }).first().click();
  await page.getByLabel('پاسخ شما').fill('پاسخ آزمایشی مدیر');
  await page.getByRole('button', { name: 'ثبت پاسخ محلی' }).click();
  await page.getByText('پاسخ آزمایشی مدیر', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'بستن تیکت', exact: true }).click();
  await page.getByRole('button', { name: 'بازگشایی تیکت', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  console.log('Reply and close ticket / Escape dialog dismissal: OK');

  await nav('امور مالی').click();
  await page.getByRole('button', { name: 'برگشت آزمایشی', exact: false }).first().click();
  await page.getByRole('button', { name: 'تأیید عملیات آزمایشی' }).click();
  await page.getByRole('cell', { name: 'برگشت‌خورده', exact: true }).waitFor();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'خروجی CSV' }).click();
  assert.equal((await download).suggestedFilename(), 'vira-demo-payments.csv');
  console.log('Refund simulation / CSV download: OK');

  await nav('اشتراک‌ها').click();
  await page.getByRole('button', { name: 'اشتراک جدید', exact: true }).click();
  await page.getByLabel('کاربر', { exact: true }).selectOption('1001');
  await page.getByLabel('پلن', { exact: true }).selectOption('2');
  await page.getByLabel('سرور', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await page.getByText('VR-20846', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'تمدید سرویس 20846', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید عملیات آزمایشی' }).click();
  console.log('Create and renew service: OK');

  await nav('پلن‌های فروش').click();
  await page.getByRole('button', { name: 'پلن جدید', exact: true }).click();
  await page.getByLabel('نام پلن', { exact: true }).fill('پلن تست');
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await page.getByRole('heading', { name: 'پلن تست', exact: true }).waitFor();
  await page.getByRole('button', { name: 'حذف پلن پلن تست', exact: true }).click();
  await page.getByRole('button', { name: 'حذف رکورد', exact: true }).click();
  console.log('Plan create / delete: OK');

  await nav('مدیریت سرورها').click();
  await page.getByRole('button', { name: 'سرور جدید', exact: true }).click();
  await page.getByLabel('نام سرور', { exact: true }).fill('Test Server');
  await page.getByLabel('کشور', { exact: true }).fill('کشور تست');
  await page.getByLabel('آدرس نمایشی سرور', { exact: true }).fill('test.example.com');
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await page.getByRole('heading', { name: 'کشور تست', exact: true }).waitFor();
  await page.getByRole('button', { name: 'حذف سرور Test Server', exact: true }).click();
  await page.getByRole('button', { name: 'حذف رکورد', exact: true }).click();
  console.log('Server create / delete: OK');

  await nav('تنظیمات').click();
  await page.getByLabel('نام نمایشی کسب‌وکار', { exact: true }).fill('ویرا تست');
  await page.getByRole('button', { name: 'ذخیره تنظیمات', exact: true }).click();
  await nav('گزارش فعالیت‌ها').click();
  await page.getByRole('cell', { name: 'ویرایش تنظیمات محیط مدیریت', exact: true }).waitFor();
  console.log('Settings save / audit trail: OK');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('heading', { name: 'همه چیز، در یک نگاه' }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'No page-level mobile overflow');
  await page.getByRole('button', { name: 'باز کردن منو', exact: true }).click();
  await nav('مدیریت سرورها').click();
  await page.getByRole('heading', { name: 'مدیریت سرورها', exact: true }).waitFor();
  console.log('Mobile navigation / no page overflow: OK');

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/#home`);
  await page.getByRole('heading', { name: /بزرگ‌تر از/ }).waitFor();
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/#panel`);
  await page.getByRole('heading', { name: /روزت بخیر/ }).waitFor();
  await page.getByRole('button', { name: 'ورود به پنل مدیریت', exact: true }).last().click();
  await page.getByRole('heading', { name: 'همه چیز، در یک نگاه' }).waitFor();
  console.log('Home / user panel / admin routing: OK');
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/#home`);
  await page.getByRole('button', { name: /سه‌ماهه/ }).click();
  await page.getByRole('link', { name: 'انتخاب حرفه‌ای', exact: true }).click();
  await page.getByRole('heading', { name: 'تأیید خرید اشتراک حرفه‌ای', exact: true }).waitFor();
  assert.match(await page.locator('.modal').innerText(), /۵۵۸٬۴۵۰/);
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/#home`);
  await page.getByRole('button', { name: 'ویندوز', exact: true }).click();
  await page.getByRole('heading', { name: 'ویرا روی ویندوز', exact: true }).waitFor();
  await page.getByRole('button', { name: 'روی چه دستگاه‌هایی می‌توانم متصل شوم؟', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'روی چه دستگاه‌هایی می‌توانم متصل شوم؟', exact: true }).getAttribute('aria-expanded'), 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'Home mobile layout stays inside viewport');
  await page.getByRole('button', { name: 'باز کردن منو', exact: true }).click();
  await page.getByRole('button', { name: 'تعرفه‌ها', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'باز کردن منو', exact: true }).getAttribute('aria-expanded'), 'false');
  console.log('Redesigned home: quarterly checkout / device tabs / FAQ / mobile navigation: OK');
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally { await browser.close(); }
