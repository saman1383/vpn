import React, { useState, useEffect, useRef } from "react";
import Landing from "./Landing";
import Admin from "./Admin";
import UserOverview from "./UserOverview";
import { createRoot } from "react-dom/client";
import {
  ShieldCheck,
  LayoutDashboard,
  Wifi,
  ShoppingBag,
  Wallet,
  Ticket,
  Gift,
  Settings,
  ChevronLeft,
  ChevronDown,
  ArrowUpLeft,
  ArrowDownLeft,
  Plus,
  Bell,
  Copy,
  Check,
  ArrowLeft,
  Globe2,
  Zap,
  Headphones,
  Download,
  Menu,
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
} from "lucide-react";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-500.css";
import "@fontsource/vazirmatn/arabic-600.css";
import "@fontsource/vazirmatn/arabic-700.css";
import "@fontsource/vazirmatn/arabic-800.css";
import "./style.css";
import "./studio.css";
const fa = (n) => new Intl.NumberFormat("fa-IR").format(n);
const initialServices = [
  {
    id: "VR-20841",
    name: "اشتراک حرفه‌ای",
    loc: "آلمان",
    flag: "🇩🇪",
    used: 34,
    total: 100,
    days: 23,
    active: true,
  },
  {
    id: "VR-20712",
    name: "اشتراک اقتصادی",
    loc: "هلند",
    flag: "🇳🇱",
    used: 42,
    total: 50,
    days: 8,
    active: true,
  },
];
function App({
  initialPage = "داشبورد",
  initialModal = null,
  initialPeriod = "ماهانه",
}) {
  const [page, setPage] = useState(initialPage);
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(initialModal);
  const [notice, setNotice] = useState("");
  const [services, setServices] = useState(initialServices);
  const [balance, setBalance] = useState(245000);
  const [amount, setAmount] = useState(100000);
  const [period, setPeriod] = useState(initialPeriod);
  const [tickets, setTickets] = useState([
    {
      title: "راهنمای اتصال در آیفون",
      status: "پاسخ داده شده",
      date: "۲۴ خرداد ۱۴۰۴",
    },
  ]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notif, setNotif] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("علی محمدی");
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!modal) return;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("button")?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") setModal(null);
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          "button, input, textarea, select, a[href]",
        ) || [],
      ).filter((el) => !el.disabled && el.offsetParent !== null);
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = oldOverflow;
      previousFocus?.focus();
    };
  }, [modal]);
  useEffect(() => {
    if (!mobile) return;
    const close = (e) => {
      if (e.key === "Escape") setMobile(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobile]);
  const toast = (t) => {
    setNotice(t);
    setTimeout(() => setNotice(""), 4000);
  };
  const navigate = (p) => {
    setPage(p);
    setMobile(false);
  };
  const purchase = (plan) => {
    if (balance < plan.price) {
      toast("موجودی کیف پول کافی نیست؛ ابتدا کیف پول را شارژ کنید.");
      setModal("wallet");
      return;
    }
    setBalance((b) => b - plan.price);
    setServices((s) => [
      ...s,
      {
        id: "VR-" + (20842 + s.length),
        name: plan.name,
        loc: "آلمان",
        flag: "🇩🇪",
        used: 0,
        total: plan.volume,
        days: period === "ماهانه" ? 30 : 90,
        active: true,
      },
    ]);
    setModal(null);
    toast("اشتراک جدید با موفقیت فعال شد.");
    navigate("سرویس‌های من");
  };
  const nav = [
    { name: "داشبورد", icon: LayoutDashboard },
    { name: "سرویس‌های من", icon: Wifi, badge: services.length },
    { name: "خرید اشتراک", icon: ShoppingBag },
    { name: "کیف پول و تراکنش‌ها", icon: Wallet },
    { name: "تیکت‌های پشتیبانی", icon: Ticket, badge: tickets.length },
    { name: "دعوت از دوستان", icon: Gift },
  ];
  const plans = [
    {
      name: "اقتصادی",
      volume: 50,
      price: 129000,
      desc: "برای استفاده روزمره",
      devices: "۲ دستگاه",
    },
    {
      name: "حرفه‌ای",
      volume: 100,
      price: 219000,
      desc: "انتخابی برای بدون مرز بودن",
      devices: "۴ دستگاه",
    },
    {
      name: "پرحجم",
      volume: 500,
      price: 389000,
      desc: "برای حرفه‌ای‌ها و خانواده",
      devices: "۶ دستگاه",
    },
  ];
  return (
    <div className="app">
      <aside
        id="user-sidebar"
        aria-label="منوی پنل کاربری"
        className={"sidebar " + (mobile ? "open" : "")}
      >
        <button
          className="brand"
          aria-label="بازگشت به داشبورد"
          onClick={() => navigate("داشبورد")}
        >
          <div className="brand-icon">
            <ShieldCheck size={30} />
          </div>
          <div>
            ویرا<span>VIRA VPN</span>
          </div>
        </button>
        <div className="workspace">
          <span className="small-avatar">
            <ShieldCheck size={18} />
          </span>
          <div>
            پنل کاربری<small>فضای امن شما</small>
          </div>
          <button
            onClick={() => {
              window.location.hash = "#admin";
            }}
            title="ورود به پنل مدیریت"
          >
            <ChevronDown size={16} />
          </button>
        </div>
        <div className="nav-label">منوی اصلی</div>
        <nav>
          {nav.map((n) => (
            <button
              aria-current={page === n.name ? "page" : undefined}
              className={page === n.name ? "active" : ""}
              key={n.name}
              onClick={() => navigate(n.name)}
            >
              <n.icon size={20} />
              <span>{n.name}</span>
              {n.badge && <b>{fa(n.badge)}</b>}
            </button>
          ))}
        </nav>
        <div className="nav-label other">حساب کاربری</div>
        <nav>
          <button
            onClick={() => navigate("تنظیمات")}
            className={page === "تنظیمات" ? "active" : ""}
          >
            <Settings size={20} />
            <span>تنظیمات حساب</span>
          </button>
          <button
            onClick={() => {
              window.location.hash = "#admin";
            }}
          >
            <ShieldCheck size={20} />
            <span>ورود به پنل مدیریت</span>
            <ArrowUpLeft size={15} />
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-orb">
            <Headphones size={25} />
          </div>
          <strong>کنارت هستیم، همیشه</strong>
          <p>سوالی داری؟ روی ما حساب کن.</p>
          <button
            onClick={() => {
              navigate("تیکت‌های پشتیبانی");
              setModal("ticket");
            }}
          >
            گفتگو با پشتیبانی <ArrowUpLeft size={15} />
          </button>
        </div>
        <div className="sidebar-foot">
          <i /> محیط آزمایشی ویرا
        </div>
      </aside>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <div className="main">
        <header>
          <div className="breadcrumb">
            <a
              href="#home"
              className="panel-home-link"
              title="بازگشت به صفحه اصلی"
            >
              <Globe2 size={17} />
              <span>صفحه اصلی</span>
            </a>
            <button
              className="mobile-menu"
              aria-label="باز کردن منو"
              aria-expanded={mobile}
              aria-controls="user-sidebar"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>پنل کاربری</span>
            <ChevronLeft size={14} />
            <strong>{page}</strong>
          </div>
          <div className="header-tools">
            <span className="today">
              {new Date().toLocaleDateString("fa-IR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="notification-wrap">
              <button className="bell" onClick={() => setNotif(!notif)}>
                <Bell size={20} />
                <i />
              </button>
              {notif && (
                <div className="notification">
                  <b>اعلان‌های شما</b>
                  <p>به ویرا خوش آمدید! سرویس‌های شما فعال هستند.</p>
                  <small>همین حالا</small>
                </div>
              )}
            </div>
            <span className="header-divider" />
            <button className="profile" onClick={() => navigate("تنظیمات")}>
              <div className="avatar">ع‌م</div>
              <span>
                {userName}
                <small>حساب کاربری</small>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">به دنیای بدون مرز خوش آمدید</div>
              <h1>
                {page === "داشبورد" ? (
                  <>
                    سلام {userName.split(" ")[0]}، روزت بخیر{" "}
                    <span className="wave">✦</span>
                  </>
                ) : (
                  page
                )}
              </h1>
              <p>
                {page === "داشبورد"
                  ? "همه چیز برای یک اتصال امن و پایدار، همین‌جاست."
                  : "سرویس‌ها و حساب کاربری خود را به‌آسانی مدیریت کنید."}
              </p>
            </div>
            <button className="primary" onClick={() => navigate("خرید اشتراک")}>
              <Plus size={18} /> خرید اشتراک جدید
            </button>
          </div>
          {page === "داشبورد" && (
            <UserOverview
              services={services}
              balance={balance}
              openTickets={
                tickets.filter((t) => t.status === "در انتظار پاسخ").length
              }
              navigate={navigate}
              openModal={setModal}
            />
          )}
          {page === "سرویس‌های من" && (
            <section className="panel">
              <SectionTitle icon={Wifi} title="اشتراک‌های شما" />
              <div className="service-table full-table">
                <div className="table-head">
                  <span>نام سرویس / موقعیت</span>
                  <span>حجم مصرفی</span>
                  <span>زمان باقی‌مانده</span>
                  <span>وضعیت</span>
                  <span />
                </div>
                {services.map((s) => (
                  <Service key={s.id} s={s} onClick={() => setModal(s)} />
                ))}
              </div>
            </section>
          )}
          {page === "خرید اشتراک" && (
            <>
              <div className="plans-intro">
                <span className="pill">یک انتخاب، هزاران مسیر</span>
                <h2>اشتراک مناسب خودت رو پیدا کن</h2>
                <p>
                  تمام پلن‌ها با اتصال پرسرعت، پشتیبانی و امنیت یکسان ارائه
                  می‌شوند.
                </p>
                <div className="segmented">
                  {["ماهانه", "سه‌ماهه"].map((p) => (
                    <button
                      className={period === p ? "selected" : ""}
                      onClick={() => setPeriod(p)}
                      key={p}
                    >
                      {p}
                      {p === "سه‌ماهه" && <small>۱۵٪ تخفیف</small>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="plans">
                {plans.map((p, i) => {
                  const price =
                    period === "ماهانه"
                      ? p.price
                      : Math.round(p.price * 3 * 0.85);
                  return (
                    <div
                      className={"plan " + (i === 1 ? "featured" : "")}
                      key={p.name}
                    >
                      {i === 1 && (
                        <div className="popular">محبوب‌ترین انتخاب</div>
                      )}
                      <span className="icon-box purple">
                        <Zap />
                      </span>
                      <h2>{p.name}</h2>
                      <p>{p.desc}</p>
                      <div className="price">
                        {fa(price)}{" "}
                        <small>
                          تومان / {period === "ماهانه" ? "ماه" : "۳ ماه"}
                        </small>
                      </div>
                      <ul>
                        {[
                          `${fa(p.volume * (period === "ماهانه" ? 1 : 3))} گیگابایت حجم`,
                          p.devices + " هم‌زمان",
                          "سرورهای آلمان، هلند و فنلاند",
                          "پشتیبانی آنلاین",
                          "پروتکل امن V2Ray",
                        ].map((x) => (
                          <li key={x}>
                            <CheckCircle2 size={17} />
                            {x}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={i === 1 ? "primary" : "outline"}
                        onClick={() =>
                          setModal({
                            type: "buy",
                            ...p,
                            price,
                            volume: p.volume * (period === "ماهانه" ? 1 : 3),
                          })
                        }
                      >
                        انتخاب اشتراک <ArrowLeft size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {page === "کیف پول و تراکنش‌ها" && (
            <>
              <div className="wallet-banner">
                <Wallet size={42} />
                <div>
                  <p>موجودی قابل استفاده</p>
                  <h2>
                    {fa(balance)} <small>تومان</small>
                  </h2>
                </div>
                <button className="primary" onClick={() => setModal("wallet")}>
                  <Plus size={18} />
                  افزایش موجودی
                </button>
              </div>
              <section className="panel">
                <SectionTitle icon={Wallet} title="تاریخچه تراکنش‌ها" />
                <Transactions />
              </section>
              <p className="demo-note">
                نسخه نمایشی: افزایش موجودی و تراکنش‌ها آزمایشی هستند و پرداخت
                واقعی انجام نمی‌شود.
              </p>
            </>
          )}
          {page === "تیکت‌های پشتیبانی" && (
            <section className="panel">
              <SectionTitle
                icon={Ticket}
                title="گفتگوهای شما"
                action="تیکت جدید +"
                onClick={() => setModal("ticket")}
              />
              {tickets.map((t, i) => (
                <div className="ticket-row" key={i}>
                  <span className="icon-box purple">
                    <Ticket size={21} />
                  </span>
                  <div>
                    <strong>{t.title}</strong>
                    <small>
                      {t.date} · #{fa(1042 + i)}
                    </small>
                  </div>
                  <span
                    className={
                      "status " +
                      (t.status === "در انتظار پاسخ" ? "pending" : "")
                    }
                  >
                    {t.status}
                  </span>
                  <button
                    className="outline"
                    onClick={() => setModal({ type: "ticketDetail", ...t })}
                  >
                    مشاهده <ChevronLeft size={15} />
                  </button>
                </div>
              ))}
            </section>
          )}
          {page === "دعوت از دوستان" && (
            <div className="invite-page panel">
              <span className="invite-gift">
                <Gift size={60} />
              </span>
              <h2>تجربه خوب، با دوست‌ها بهتره.</h2>
              <p>
                لینک اختصاصی خود را با دوستانتان به اشتراک بگذارید.
                <br />
                با اولین خرید آن‌ها، ۳۰ هزار تومان اعتبار هدیه بگیرید.
              </p>
              <div className="invite-link">
                <code>vira.example/invite/ali2084</code>
                <button
                  className="primary"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      "https://vira.example/invite/ali2084",
                    );
                    setCopied(true);
                    toast("لینک دعوت کپی شد");
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />} کپی لینک
                </button>
              </div>
              <small>لینک دعوت در نسخه نمایشی فعال نیست.</small>
            </div>
          )}
          {page === "تنظیمات" && (
            <section className="panel settings">
              <SectionTitle icon={Settings} title="اطلاعات حساب کاربری" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast("اطلاعات حساب ذخیره شد");
                }}
              >
                <label>
                  نام و نام خانوادگی
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  ایمیل
                  <input
                    type="email"
                    defaultValue="ali.mohammadi@gmail.com"
                    required
                    dir="ltr"
                  />
                </label>
                <label>
                  شماره موبایل
                  <input
                    defaultValue="09123456789"
                    pattern="09[0-9]{9}"
                    dir="ltr"
                  />
                </label>
                <button className="primary" type="submit">
                  ذخیره تغییرات <Check size={17} />
                </button>
              </form>
            </section>
          )}

          <footer>
            <span>© ۱۴۰۴ ویرا. برای دنیایی بدون مرز.</span>
            <div>
              <button onClick={() => setModal("guide")}>راهنمای اتصال</button>
              <i>•</i>
              <button onClick={() => setModal("terms")}>قوانین و مقررات</button>
              <i>•</i>
              <span>
                با خیال راحت، متصل بمانید <ShieldCheck size={13} />
              </span>
            </div>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast">
          <CheckCircle2 size={20} />
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            ref={dialogRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              aria-label="بستن پنجره"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            {modal === "wallet" ? (
              <>
                <span className="icon-box orange">
                  <Wallet />
                </span>
                <h2 id="user-dialog-title">افزایش موجودی کیف پول</h2>
                <p>مبلغ مورد نظر را برای شارژ آزمایشی انتخاب کنید.</p>
                <div className="amounts">
                  {[100000, 250000, 500000].map((a) => (
                    <button
                      className={amount === a ? "selected" : ""}
                      onClick={() => setAmount(a)}
                      key={a}
                    >
                      {fa(a)}
                    </button>
                  ))}
                </div>
                <label>
                  مبلغ (تومان)
                  <input
                    type="number"
                    min="10000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </label>
                <p className="demo-note">
                  این عملیات نمایشی است و به درگاه بانکی متصل نیست.
                </p>
                <button
                  className="primary wide"
                  onClick={() => {
                    if (amount < 10000)
                      return toast("حداقل مبلغ ۱۰ هزار تومان است");
                    setBalance((b) => b + amount);
                    setModal(null);
                    toast("موجودی آزمایشی کیف پول افزایش یافت");
                  }}
                >
                  افزایش موجودی <Plus size={17} />
                </button>
              </>
            ) : modal === "ticket" ? (
              <>
                <span className="icon-box green">
                  <Headphones />
                </span>
                <h2 id="user-dialog-title">چطور می‌تونیم کمک کنیم؟</h2>
                <p>پیامتان را بفرستید؛ همراه شما هستیم.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setTickets((t) => [
                      {
                        title: subject,
                        status: "در انتظار پاسخ",
                        date: "همین حالا",
                        message,
                      },
                      ...t,
                    ]);
                    setSubject("");
                    setMessage("");
                    setModal(null);
                    navigate("تیکت‌های پشتیبانی");
                    toast("تیکت در نسخه نمایشی ثبت شد");
                  }}
                >
                  <label>
                    موضوع
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="موضوع درخواست"
                    />
                  </label>
                  <label>
                    پیام شما
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="جزئیات را اینجا بنویسید..."
                    />
                  </label>
                  <button className="primary wide" type="submit">
                    ارسال تیکت <Send size={16} />
                  </button>
                </form>
              </>
            ) : modal === "guide" ? (
              <>
                <span className="icon-box blue">
                  <Download />
                </span>
                <h2 id="user-dialog-title">راهنمای اتصال به ویرا</h2>
                <p>فقط چند قدم تا یک اتصال امن فاصله دارید.</p>
                <ol className="guide">
                  <li>
                    کلاینت سازگار با V2Ray را روی دستگاه خود نصب کنید (v2rayNG
                    برای اندروید و Streisand برای iOS).
                  </li>
                  <li>
                    از قسمت «سرویس‌های من»، اشتراک موردنظر را باز کنید و لینک
                    اتصال را کپی کنید.
                  </li>
                  <li>
                    در برنامه، گزینه Import from clipboard را بزنید و اتصال را
                    فعال کنید.
                  </li>
                </ol>
                <p className="demo-note">
                  لینک‌های این نسخه نمایشی هستند. اتصال واقعی نیاز به بک‌اند و
                  سرور VPN دارد.
                </p>
              </>
            ) : modal === "terms" ? (
              <>
                <h2 id="user-dialog-title">قوانین و حریم خصوصی</h2>
                <p>
                  این وب‌سایت یک نمونه رابط کاربری است و سرویس VPN یا پرداخت
                  واقعی ارائه نمی‌دهد. اطلاعات واردشده تنها در حافظه همین صفحه
                  نگهداری می‌شوند و با بازنشانی صفحه پاک خواهند شد.
                </p>
              </>
            ) : modal.type === "buy" ? (
              <>
                <span className="icon-box purple">
                  <ShoppingBag />
                </span>
                <h2 id="user-dialog-title">تأیید خرید اشتراک {modal.name}</h2>
                <p>{fa(modal.volume)} گیگابایت حجم با اتصال پرسرعت</p>
                <div className="purchase-summary">
                  <span>مبلغ قابل پرداخت</span>
                  <b>{fa(modal.price)} تومان</b>
                </div>
                <div className="purchase-summary">
                  <span>موجودی کیف پول</span>
                  <b>{fa(balance)} تومان</b>
                </div>
                <button
                  className="primary wide"
                  onClick={() => purchase(modal)}
                >
                  خرید با کیف پول <CheckCircle2 size={18} />
                </button>
                <small className="demo-note">
                  خرید آزمایشی؛ بدون پرداخت واقعی
                </small>
              </>
            ) : modal.type === "ticketDetail" ? (
              <>
                <h2 id="user-dialog-title">{modal.title}</h2>
                <span className="status">{modal.status}</span>
                <p>
                  {modal.message || "سلام، چطور می‌توانم روی آیفون متصل شوم؟"}
                </p>
                {modal.status === "پاسخ داده شده" && (
                  <div className="reply">
                    <b>پشتیبانی ویرا</b>
                    <p>
                      سلام! برنامه Streisand را نصب کنید، سپس لینک اشتراک را از
                      صفحه سرویس خود کپی و در برنامه وارد کنید. راهنمای اتصال
                      نیز در پنل در دسترس است.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="icon-box purple">
                  <Wifi />
                </span>
                <h2 id="user-dialog-title">{modal.name}</h2>
                <p>
                  {modal.flag} سرور {modal.loc} ·{" "}
                  <span dir="ltr">{modal.id}</span>
                </p>
                <div className="purchase-summary">
                  <span>حجم باقی‌مانده</span>
                  <b>{fa(modal.total - modal.used)} گیگابایت</b>
                </div>
                <div className="purchase-summary">
                  <span>اعتبار اشتراک</span>
                  <b>{fa(modal.days)} روز</b>
                </div>
                <button
                  className="outline wide"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      "vless://demo-only@server.example:443#Vira-Demo",
                    );
                    toast("لینک نمایشی کپی شد؛ قابل اتصال نیست");
                  }}
                >
                  <Copy size={17} />
                  کپی لینک اتصال نمایشی
                </button>
                <button
                  className="primary wide"
                  onClick={() => {
                    setModal(null);
                    navigate("خرید اشتراک");
                  }}
                >
                  <RefreshCw size={17} />
                  تمدید و خرید مجدد
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function SectionTitle({ icon: Icon, title, action, onClick }) {
  return (
    <div className="section-title">
      <h3>
        {Icon && <Icon size={19} />} {title}
      </h3>
      {action && (
        <button onClick={onClick}>
          {action}
          <ChevronLeft size={14} />
        </button>
      )}
    </div>
  );
}
function Service({ s, onClick }) {
  return (
    <div
      className="service-row"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="service-name">
        <span className="flag">{s.flag}</span>
        <div>
          <strong>{s.name}</strong>
          <small>
            {s.loc} <i>•</i> <span dir="ltr">{s.id}</span>
          </small>
        </div>
      </div>
      <div className="usage">
        <span>
          <b>{fa(s.used)}</b> از {fa(s.total)} <small>گیگابایت</small>
        </span>
        <div
          className={"usage-track " + (s.used / s.total > 0.8 ? "warning" : "")}
        >
          <i style={{ width: (s.used / s.total) * 100 + "%" }} />
        </div>
      </div>
      <div className={"remaining " + (s.days < 10 ? "warning-text" : "")}>
        <Clock size={13} />
        {fa(s.days)} روز <small>باقی‌مانده</small>
      </div>
      <span className="status">
        <i />
        فعال
      </span>
      <button className="row-arrow" aria-label="جزئیات سرویس">
        <ChevronLeft size={17} />
      </button>
    </div>
  );
}
function Transactions() {
  return (
    <div className="transactions-list">
      {[
        {
          title: "خرید اشتراک حرفه‌ای",
          date: "۲۳ خرداد ۱۴۰۴، ۱۴:۳۲",
          amount: "۲۱۹٬۰۰۰",
          icon: ShoppingBag,
          out: true,
        },
        {
          title: "افزایش موجودی کیف پول",
          date: "۲۳ خرداد ۱۴۰۴، ۱۴:۲۸",
          amount: "۴۰۰٬۰۰۰",
          icon: ArrowDownLeft,
        },
        {
          title: "خرید اشتراک اقتصادی",
          date: "۱۱ خرداد ۱۴۰۴، ۱۰:۱۵",
          amount: "۱۲۹٬۰۰۰",
          icon: ShoppingBag,
          out: true,
        },
      ].map((t, i) => (
        <div className="transaction" key={i}>
          <span className={"transaction-icon " + (!t.out ? "deposit" : "")}>
            <t.icon size={18} />
          </span>
          <div>
            <strong>{t.title}</strong>
            <small>{t.date}</small>
          </div>
          <span className={"transaction-amount " + (!t.out ? "positive" : "")}>
            {t.out ? "−" : "+"}
            {t.amount} <small>تومان</small>
          </span>
          <span className="paid">
            <i />
            موفق
          </span>
        </div>
      ))}
    </div>
  );
}
function Site() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  if (route.startsWith("#admin")) return <Admin />;
  if (!route.startsWith("#panel")) return <Landing />;
  const params = new URLSearchParams(route.split("?")[1] || "");
  const quarterly = params.get("period") === "3";
  const planIndex = Number(params.get("plan"));
  const selected = [
    { name: "اقتصادی", volume: 50, price: 129000 },
    { name: "حرفه‌ای", volume: 100, price: 219000 },
    { name: "پرحجم", volume: 500, price: 389000 },
  ][planIndex];
  const buying = route.startsWith("#panel/buy");
  const initialModal =
    buying && selected && params.has("plan")
      ? {
          type: "buy",
          ...selected,
          volume: selected.volume * (quarterly ? 3 : 1),
          price: quarterly
            ? Math.round(selected.price * 3 * 0.85)
            : selected.price,
        }
      : route.startsWith("#panel/guide")
        ? "guide"
        : null;
  return (
    <App
      key={route}
      initialPage={
        buying
          ? "خرید اشتراک"
          : route.startsWith("#panel/support")
            ? "تیکت‌های پشتیبانی"
            : "داشبورد"
      }
      initialPeriod={quarterly ? "سه‌ماهه" : "ماهانه"}
      initialModal={initialModal}
    />
  );
}
createRoot(document.getElementById("root")).render(<Site />);
