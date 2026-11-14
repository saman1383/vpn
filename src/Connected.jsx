import React, { useEffect, useState } from 'react';
import './connected.css';
const number = (n) => Number(n || 0).toLocaleString('fa-IR');
let csrf = '';
async function api(action, body) {
  const response = await fetch(`${import.meta.env.BASE_URL}api/index.php?action=${action}`, {
    credentials: 'same-origin', cache: 'no-store',
    ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'خطای اتصال به سرور');
  if (data.csrf) csrf = data.csrf;
  return data;
}
export default function Connected() {
  const [boot, setBoot] = useState(null), [data, setData] = useState({services:[],orders:[]}), [admin, setAdmin] = useState(null);
  const [error,setError] = useState(''), [busy,setBusy] = useState(false), [register,setRegister] = useState(false), [tab,setTab] = useState('dashboard');
  const [tickets,setTickets] = useState({tickets:[],messages:[]}), [traffic,setTraffic] = useState({}), [months,setMonths] = useState(1), [renew,setRenew] = useState('');
  async function load() {
    const b = await api('bootstrap'); setBoot(b);
    if (b.user) {
      setData(await api('dashboard')); setTickets(await api('tickets'));
      if (b.user.role === 'admin') setAdmin(await api('admin'));
    } else { setData({services:[],orders:[]}); setAdmin(null); }
  }
  useEffect(()=>{load().catch(e=>setError(e.message));},[]);
  async function run(fn) { setBusy(true); setError(''); try { await fn(); } catch(e) {setError(e.message);} finally {setBusy(false);} }
  const submit = (fn) => (event) => { event.preventDefault(); const values=Object.fromEntries(new FormData(event.currentTarget)); run(()=>fn(values)); };
  async function checkout(plan) {
    const signature = `${plan.id}:${months}:${renew}`;
    let saved; try { saved=JSON.parse(sessionStorage.getItem('vira-checkout')); } catch { /* new request */ }
    const key = saved?.signature === signature ? saved.key : crypto.randomUUID();
    sessionStorage.setItem('vira-checkout', JSON.stringify({signature,key}));
    const result=await api('checkout',{plan_id:plan.id,months,renewal_service_id:Number(renew)||null,key});
    // Delete only after the API confirms a durable order and authority.
    sessionStorage.removeItem('vira-checkout'); window.location.assign(result.url);
  }
  const orders=(items, isAdmin=false)=><div className="live-table"><table><thead><tr><th>سفارش</th>{isAdmin&&<th>کاربر</th>}<th>مبلغ (تومان)</th><th>وضعیت</th><th>پیگیری درگاه</th><th>عملیات</th></tr></thead><tbody>{items.map(o=><tr key={o.id}><td>#{o.id}</td>{isAdmin&&<td>{o.user_id}</td>}<td>{number(o.amount_rial/10)}</td><td>{({pending:'منتظر پرداخت',paid:'پرداخت‌شده؛ منتظر تحویل',fulfilled:'تحویل‌شده',requesting:'درخواست درگاه؛ نیازمند بررسی'})[o.status]||o.status}</td><td>{o.ref_id||'—'}</td><td>{o.status!=='fulfilled'&&<button disabled={busy} onClick={()=>run(async()=>{await api(isAdmin?'admin-retry':'retry',{id:o.id});await load();})}>بررسی / تحویل مجدد</button>}</td></tr>)}</tbody></table>{!items.length&&<p>هنوز سفارشی ثبت نشده است.</p>}</div>;
  return <div className="live" dir="rtl"><header><a href="#panel" onClick={()=>setTab('dashboard')}><strong>ویرا</strong><span>اتصال امن، مدیریت ساده</span></a>{boot?.user&&<nav><button onClick={()=>setTab('dashboard')}>حساب من</button><button onClick={()=>setTab('support')}>پشتیبانی</button>{boot.user.role==='admin'&&<button onClick={()=>setTab('admin')}>مدیریت</button>}<button disabled={busy} onClick={()=>run(async()=>{await api('logout',{});await load();})}>خروج</button></nav>}</header>
    <main><div className="live-hero"><small>ویرا • سامانه متصل به سرور</small><h1>{boot?.user?`سلام ${boot.user.name}، خوش آمدید`:'اینترنت، با خیال آسوده'}</h1><p>خرید و تمدید اشتراک با پرداخت امن زرین‌پال و مدیریت سرویس 3x-ui</p></div>
    {error&&<div role="alert" className="live-error">{error} <button onClick={()=>run(load)}>تلاش مجدد</button></div>}
    {!boot&&!error&&<p role="status">در حال اتصال به سرور…</p>}
    {boot&&!boot.user&&<section className="live-auth"><h2>{register?'ایجاد حساب':'ورود به حساب'}</h2><form onSubmit={submit(async v=>{await api(register?'register':'login',v);await load();})}>{register&&<label>نام<input name="name" required maxLength={100} autoComplete="name"/></label>}<label>ایمیل<input name="email" type="email" required autoComplete="email" dir="ltr"/></label><label>رمز عبور (حداقل ۱۲ کاراکتر)<input name="password" type="password" required minLength={12} maxLength={128} autoComplete={register?'new-password':'current-password'} dir="ltr"/></label><button disabled={busy}>{busy?'لطفاً صبر کنید…':register?'ثبت‌نام':'ورود'}</button></form>{boot.registration&&<button onClick={()=>setRegister(!register)}>{register?'حساب دارید؟ ورود':'ساخت حساب جدید'}</button>}</section>}
    {boot?.user&&tab==='dashboard'&&<><section><h2>اشتراک‌های من</h2><div className="live-grid">{data.services.map(s=><article key={s.id}><h3>اشتراک #{s.id}</h3><p>{number(s.total_bytes/1073741824)} گیگابایت • {s.status==='active'?'فعال':'در انتظار تحویل'}</p><p>انقضا: {Number(s.expiry_ms)?new Date(Number(s.expiry_ms)).toLocaleDateString('fa-IR'):'—'}</p>{s.status==='active'&&<><label>لینک اشتراک<input readOnly value={s.subscription_url} dir="ltr" onFocus={e=>e.target.select()}/></label><button disabled={busy} onClick={()=>run(async()=>{const t=await api(`traffic&id=${s.id}`);setTraffic(old=>({...old,[s.id]:t}));})}>نمایش مصرف واقعی</button>{traffic[s.id]&&<p>مصرف: {number((traffic[s.id].up+traffic[s.id].down)/1073741824)} گیگابایت</p>}</>}</article>)}</div>{!data.services.length&&<p>هنوز اشتراکی ندارید؛ از پلن‌های زیر انتخاب کنید.</p>}</section>
    <section><h2>خرید و تمدید</h2><div className="live-controls"><label>دوره<select value={months} onChange={e=>setMonths(Number(e.target.value))}><option value={1}>ماهانه</option><option value={3}>سه دوره • ۱۵٪ تخفیف</option></select></label><label>نوع خرید<select value={renew} onChange={e=>setRenew(e.target.value)}><option value="">اشتراک جدید</option>{data.services.filter(s=>s.status==='active').map(s=><option key={s.id} value={s.id}>تمدید اشتراک #{s.id}</option>)}</select></label></div><p>تمدید، حجم و مدت را به باقی‌مانده اضافه می‌کند. پلن باید روی همان سرور باشد؛ سرور این شرط را بررسی می‌کند.</p><div className="live-grid">{boot.plans.map(p=><article key={p.id}><h3>{p.name}</h3><p>{number(p.volume_gb*months)} گیگابایت / {number(p.days*months)} روز</p><h2>{number(months===3?Math.floor(p.price_toman*3*.85):p.price_toman)} <small>تومان</small></h2><button disabled={busy} onClick={()=>run(()=>checkout(p))}>پرداخت با زرین‌پال</button></article>)}</div>{!boot.plans.length&&<p>هنوز پلن فعالی توسط مدیر تعریف نشده است.</p>}</section><section><h2>سفارش‌ها و پرداخت‌ها</h2><p>پرداخت موفق تا تأیید سرور به معنی تحویل نیست. در صورت تأخیر، «بررسی / تحویل مجدد» را بزنید؛ دوباره پرداخت نکنید.</p>{orders(data.orders)}</section></>}
    {boot?.user&&tab==='support'&&<section><h2>پشتیبانی</h2><form onSubmit={submit(async v=>{await api('tickets',v);await load();})}><label>تیکت<select name="ticket_id"><option value="">تیکت جدید</option>{tickets.tickets.map(t=><option key={t.id} value={t.id}>#{t.id} {t.title}</option>)}</select></label><label>عنوان (برای تیکت جدید)<input name="title" maxLength={160}/></label><label>پیام<textarea name="body" required maxLength={4000}/></label><button disabled={busy}>ارسال پیام</button></form>{tickets.tickets.map(t=><article key={t.id}><h3>#{t.id} {t.title}</h3>{tickets.messages.filter(m=>m.ticket_id===t.id).map(m=><p key={m.id}><strong>{m.name}: </strong>{m.body}</p>)}</article>)}</section>}
    {boot?.user?.role==='admin'&&tab==='admin'&&admin&&<><section><h2>مدیریت واقعی</h2><p>{number(admin.users.length)} کاربر • {number(admin.services.length)} سرویس (حداکثر ۲۰۰ مورد اخیر)</p><h3>سفارش‌ها</h3>{orders(admin.orders,true)}</section><section><h2>پلن‌ها</h2><p>تغییر پلن روی مبلغ و حجم سفارش‌های قبلی اثر نمی‌گذارد. برای ویرایش، شناسه پلن موجود را وارد کنید.</p>{admin.plans.map(p=><p key={p.id}>#{p.id} {p.name} — {number(p.price_toman)} تومان — inbound {p.inbound_id} — {Number(p.active)?'فعال':'غیرفعال'}</p>)}<form onSubmit={submit(async v=>{await api('admin-plan',{...v,active:v.active==='on'});await load();})}>{[['id','شناسه برای ویرایش (اختیاری)'],['name','نام پلن'],['price_toman','قیمت تومان'],['volume_gb','حجم گیگابایت'],['days','مدت روز'],['devices','محدودیت IP (صفر نامحدود)'],['inbound_id','شناسه inbound در پنل']].map(([name,label])=><label key={name}>{label}<input name={name} type={name==='name'?'text':'number'} required={name!=='id'} min={name==='devices'?0:1}/></label>)}<label><input name="active" type="checkbox"/> فعال</label><button disabled={busy}>ذخیره پلن</button></form></section><section><h2>کاربران</h2>{admin.users.map(u=><p key={u.id}>#{u.id} {u.name} • {u.email} • {u.role}</p>)}</section></>}
    </main><footer>ویرا • هیچ اطلاعات بانکی در این سایت دریافت نمی‌شود.</footer></div>;
}
