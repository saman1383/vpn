export const STORAGE_KEY = 'vira-admin-demo-v1';
export const demoData = {
  users: [
    { id: 1001, name: 'علی محمدی', email: 'ali@example.com', phone: '09123456789', active: true },
    { id: 1002, name: 'سارا احمدی', email: 'sara@example.com', phone: '09121234567', active: true },
    { id: 1003, name: 'رضا کریمی', email: 'reza@example.com', phone: '09351234567', active: true },
    { id: 1004, name: 'نگار حسینی', email: 'negar@example.com', phone: '09131234567', active: false },
    { id: 1005, name: 'امیر رضایی', email: 'amir@example.com', phone: '09151234567', active: true },
  ],
  plans: [
    { id: 1, name: 'اقتصادی', price: 129000, volume: 50, days: 30, devices: 2, active: true },
    { id: 2, name: 'حرفه‌ای', price: 219000, volume: 100, days: 30, devices: 4, active: true },
    { id: 3, name: 'پرحجم', price: 389000, volume: 500, days: 30, devices: 6, active: true },
  ],
  servers: [
    { id: 1, name: 'Frankfurt · DE-01', country: 'آلمان', flag: '🇩🇪', host: 'de01.example.com', capacity: 100, load: 42, active: true },
    { id: 2, name: 'Amsterdam · NL-01', country: 'هلند', flag: '🇳🇱', host: 'nl01.example.com', capacity: 80, load: 28, active: true },
    { id: 3, name: 'Helsinki · FI-01', country: 'فنلاند', flag: '🇫🇮', host: 'fi01.example.com', capacity: 60, load: 0, active: false },
  ],
  services: [
    { id: 20841, userId: 1001, planId: 2, serverId: 1, used: 34, total: 100, days: 23, active: true },
    { id: 20842, userId: 1002, planId: 3, serverId: 2, used: 128, total: 500, days: 18, active: true },
    { id: 20843, userId: 1003, planId: 1, serverId: 1, used: 42, total: 50, days: 5, active: true },
    { id: 20844, userId: 1004, planId: 1, serverId: 2, used: 50, total: 50, days: 0, active: false },
    { id: 20845, userId: 1005, planId: 2, serverId: 1, used: 9, total: 100, days: 27, active: true },
  ],
  tickets: [
    { id: 1042, userId: 1002, title: 'راهنمای اتصال روی آیفون', priority: 'معمولی', status: 'open', messages: [{ author: 'user', text: 'سلام، لطفاً راهنمای اتصال با برنامه Streisand را برای من ارسال کنید.', date: '۱۴۰۵/۰۸/۲۳، ۱۴:۳۲' }] },
    { id: 1043, userId: 1003, title: 'بررسی حجم باقی‌مانده اشتراک', priority: 'بالا', status: 'open', messages: [{ author: 'user', text: 'سلام، چطور می‌توانم مصرف اشتراک را بررسی کنم؟', date: '۱۴۰۵/۰۸/۲۳، ۱۲:۱۵' }] },
    { id: 1044, userId: 1001, title: 'سوال درباره تمدید اشتراک', priority: 'معمولی', status: 'answered', messages: [{ author: 'user', text: 'آیا امکان تمدید اشتراک از پنل وجود دارد؟', date: '۱۴۰۵/۰۸/۲۲، ۱۰:۲۰' }, { author: 'admin', text: 'سلام! بله، از بخش سرویس‌های من می‌توانید پلن خود را انتخاب و خرید مجدد انجام دهید.', date: '۱۴۰۵/۰۸/۲۲، ۱۰:۴۵' }] },
  ],
  payments: [
    { id: 5021, userId: 1001, amount: 219000, status: 'paid', date: '۱۴۰۵/۰۸/۲۳', day: 6, type: 'خرید اشتراک' },
    { id: 5022, userId: 1002, amount: 389000, status: 'paid', date: '۱۴۰۵/۰۸/۲۲', day: 5, type: 'خرید اشتراک' },
    { id: 5023, userId: 1003, amount: 129000, status: 'paid', date: '۱۴۰۵/۰۸/۲۱', day: 4, type: 'تمدید اشتراک' },
    { id: 5024, userId: 1004, amount: 129000, status: 'failed', date: '۱۴۰۵/۰۸/۲۰', day: 3, type: 'خرید اشتراک' },
    { id: 5025, userId: 1005, amount: 219000, status: 'pending', date: '۱۴۰۵/۰۸/۲۳', day: 6, type: 'خرید اشتراک' },
  ],
  settings: { name: 'ویرا', email: 'support@example.com', notice: 'به ویرا خوش آمدید؛ یک دنیا مسیر تازه پیش روی شماست.', maintenance: false, ticketAlerts: true },
  logs: [{ id: 1, action: 'آماده‌سازی محیط آزمایشی مدیریت', date: '۱۴۰۵/۰۸/۲۳، ۰۹:۰۰', actor: 'سیستم نمایشی' }],
};
export function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && ['users','plans','servers','services','tickets','payments','logs'].every(k => Array.isArray(data[k])) && data.settings) return data;
  } catch { /* Unavailable or invalid storage: use sample data. */ }
  return structuredClone(demoData);
}
export const nextId = rows => Math.max(0, ...rows.map(r => r.id)) + 1;
export const canDelete = (db, kind, id) => {
  if (kind === 'users') return !['services','tickets','payments'].some(k => db[k].some(r => r.userId === id));
  if (kind === 'plans') return !db.services.some(s => s.planId === id);
  if (kind === 'servers') return !db.services.some(s => s.serverId === id);
  return true;
};
export function paymentTotals(payments) {
  return { paid: payments.filter(p => p.status === 'paid').reduce((a,p) => a + p.amount, 0), pending: payments.filter(p => p.status === 'pending').reduce((a,p) => a + p.amount, 0), refunded: payments.filter(p => p.status === 'refunded').reduce((a,p) => a + p.amount, 0) };
}
