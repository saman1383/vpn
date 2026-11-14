import React, { useState } from "react";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowUpLeft,
  Zap,
  Globe2,
  Headphones,
  Check,
  ChevronLeft,
  Plus,
  Minus,
  Menu,
  X,
  Monitor,
  Smartphone,
  Laptop,
  Wifi,
  LockKeyhole,
  Download,
  CreditCard,
  LayoutDashboard,
  Wallet,
  Activity,
  MousePointer2,
  CheckCircle2,
} from "lucide-react";
import "./landing.css";
const fa = (n) => new Intl.NumberFormat("fa-IR").format(n);
const plans = [
  {
    name: "اقتصادی",
    caption: "برای کارهای روزمره",
    volume: 50,
    price: 129000,
    devices: 2,
    icon: Wifi,
  },
  {
    name: "حرفه‌ای",
    caption: "برای همه‌ی مسیرهای پیش رو",
    volume: 100,
    price: 219000,
    devices: 4,
    icon: Zap,
  },
  {
    name: "پرحجم",
    caption: "برای بیشتر دیدن و بیشتر ساختن",
    volume: 500,
    price: 389000,
    devices: 6,
    icon: Globe2,
  },
];
const countries = [
  { code: "DE", title: "آلمان", city: "Frankfurt", color: "gold" },
  { code: "NL", title: "هلند", city: "Amsterdam", color: "coral" },
  { code: "FI", title: "فنلاند", city: "Helsinki", color: "blue" },
];
const faqs = [
  [
    "چطور اشتراک ویرا را تهیه کنم؟",
    "پلن و دوره دلخواه را انتخاب کنید تا وارد پنل شوید. در پنل، جزئیات اشتراک و خرید آزمایشی در دسترس شماست. درگاه پرداخت واقعی هنوز متصل نیست.",
  ],
  [
    "روی چه دستگاه‌هایی می‌توانم متصل شوم؟",
    "کلاینت‌های سازگار با V2Ray روی اندروید، iOS، ویندوز و مک در دسترس‌اند. تعداد دستگاه هم‌زمان به پلن انتخابی بستگی دارد. راهنمای نصب هر دستگاه در همین صفحه و پنل قرار دارد.",
  ],
  [
    "حجم و اعتبار اشتراک را از کجا ببینم؟",
    "در داشبورد و بخش «سرویس‌های من»، حجم مصرفی و زمان باقی‌مانده نمایش داده می‌شود. داده‌های فعلی نمونه هستند و به سرور واقعی متصل نیستند.",
  ],
  [
    "آیا امکان تمدید اشتراک وجود دارد؟",
    "بله؛ اشتراک را در پنل انتخاب و گزینه تمدید و خرید مجدد را بزنید. این عملیات در نسخه فعلی آزمایشی است.",
  ],
  [
    "برای راهنمایی و پشتیبانی چه کار کنم؟",
    "از بخش «تیکت‌های پشتیبانی» در پنل درخواست ثبت کنید. تیکت‌های این نسخه نمونه هستند و هنوز به سامانه پشتیبانی زنده ارسال نمی‌شوند.",
  ],
];
function Brand() {
  return (
    <a className="home-brand" href="#home" aria-label="ویرا، صفحه اصلی">
      <span>
        <ShieldCheck size={28} strokeWidth={1.8} />
      </span>
      <b>
        ویرا<small>VIRA VPN</small>
      </b>
    </a>
  );
}
function Preview() {
  const [location, setLocation] = useState(0);
  return (
    <div className="home-preview-wrap">
      <div className="home-preview-grid" />
      <div className="home-preview-note">
        <span>
          <i /> پنل ساده. کنترل کامل.
        </span>
        <small>پیش‌نمایش امکانات · داده‌های نمونه</small>
      </div>
      <div className="home-preview">
        <div className="hp-sidebar">
          <span className="hp-mini-brand">
            <ShieldCheck size={20} /> ویرا
          </span>
          <span className="selected">
            <LayoutDashboard size={15} /> داشبورد
          </span>
          <span>
            <Wifi size={15} /> سرویس‌های من
          </span>
          <span>
            <Wallet size={15} /> کیف پول
          </span>
          <span>
            <Headphones size={15} /> پشتیبانی
          </span>
          <div className="hp-user">
            <span>ع‌م</span>
            <div>
              علی محمدی<small>حساب کاربری نمونه</small>
            </div>
          </div>
        </div>
        <div className="hp-main">
          <div className="hp-heading">
            <div>
              <small>همه چیز، در دسترس تو</small>
              <strong>یک اتصال ساده، یک دنیای تازه.</strong>
            </div>
            <span className="hp-preview-label">نسخه نمایشی</span>
          </div>
          <div className="hp-content">
            <div className="hp-connection">
              <div className="hp-orbit">
                <span>
                  <ShieldCheck size={35} strokeWidth={1.5} />
                </span>
                <i className="hp-orbit-dot" />
              </div>
              <strong>آماده‌ی یک مسیر تازه‌ای؟</strong>
              <p>مدیریت اتصال و اشتراک در یک نگاه</p>
              <a href="#panel">
                ورود به پنل کاربری <ArrowLeft size={14} />
              </a>
            </div>
            <div className="hp-detail">
              <div className="hp-subscription">
                <span>
                  اشتراک حرفه‌ای <b>نمونه</b>
                </span>
                <strong>
                  ۶۶ <small>گیگابایت باقی‌مانده</small>
                </strong>
                <div className="hp-meter">
                  <i />
                </div>
                <small>۳۴ از ۱۰۰ گیگابایت مصرف شده</small>
              </div>
              <div className="hp-locations">
                <span>موقعیت را کشف کن</span>
                {countries.map((c, i) => (
                  <button
                    aria-label={"انتخاب موقعیت نمونه " + c.title}
                    className={location === i ? "chosen" : ""}
                    aria-pressed={location === i}
                    key={c.code}
                    onClick={() => setLocation(i)}
                  >
                    <span className={"country-code " + c.color}>{c.code}</span>
                    <span>
                      {c.title}
                      <small>{c.city}</small>
                    </span>
                    {location === i ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span className="hp-radio" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hp-footer">
            <LockKeyhole size={13} />
            <span>V2Ray · مسیر انتخاب‌شده: {countries[location].title}</span>
            <span>نمونه رابط کاربری</span>
          </div>
        </div>
      </div>
      <div className="hp-floating">
        <span>
          <MousePointer2 size={17} />
        </span>
        <div>
          همه چیز تحت کنترل توست<small>حجم، تمدید، پرداخت و پشتیبانی</small>
        </div>
        <CheckCircle2 size={18} />
      </div>
    </div>
  );
}
export default function Landing() {
  const [menu, setMenu] = useState(false),
    [quarterly, setQuarterly] = useState(false),
    [faq, setFaq] = useState(0),
    [device, setDevice] = useState("اندروید");
  const jump = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  };
  return (
    <div className="home" id="top">
      <div className="home-topline">
        <div className="home-container">
          <span>
            <ShieldCheck size={13} /> یک تجربه ساده‌تر از دنیای بدون مرز
          </span>
          <a href="#panel/support">
            همراه شما هستیم <Headphones size={13} />
          </a>
        </div>
      </div>
      <div className="home-nav-wrap">
        <div className="home-nav home-container">
          <Brand />
          <nav className={menu ? "is-open" : ""} aria-label="ناوبری اصلی">
            {[
              ["top", "خانه"],
              ["features", "چرا ویرا؟"],
              ["pricing", "تعرفه‌ها"],
              ["connect", "راهنمای اتصال"],
              ["faq", "سوالات متداول"],
            ].map(([id, title]) => (
              <button key={id} onClick={() => jump(id)}>
                {title}
              </button>
            ))}
          </nav>
          <div className="home-nav-actions">
            <a className="home-login" href="#panel">
              ورود به حساب <ArrowUpLeft size={16} />
            </a>
            <button
              className="home-menu"
              aria-label={menu ? "بستن منو" : "باز کردن منو"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      <section className="home-hero">
        <div className="home-container">
          <span className="home-eyebrow">
            <span>VIRA</span> برای زندگی دیجیتال امروز <ChevronLeft size={12} />
          </span>
          <h1>
            دنیای تو،
            <br className="home-mobile-break" /> بزرگ‌تر از{" "}
            <span>محدودیت‌هاست.</span>
          </h1>
          <p>
            به یادگرفتن، ساختن و در ارتباط ماندن ادامه بده.
            <br />
            ویرا؛ یک مسیر ساده‌تر برای رسیدن به دنیایی بزرگ‌تر.
          </p>
          <div className="home-hero-actions">
            <button className="home-button" onClick={() => jump("pricing")}>
              اشتراک مناسب من <ArrowLeft size={17} />
            </button>
            <button
              className="home-button subtle"
              onClick={() => jump("connect")}
            >
              چطور شروع کنم؟ <ChevronLeft size={16} />
            </button>
          </div>
          <div className="home-assurances">
            <span>
              <Check size={14} /> راه‌اندازی آسان
            </span>
            <span>
              <Check size={14} />
              مدیریت شفاف مصرف
            </span>
            <span>
              <Check size={14} />
              همراهی در پشتیبانی
            </span>
          </div>
          <Preview />
        </div>
      </section>
      <section className="home-devices home-container">
        <span>یک اشتراک، برای دستگاه‌های تو</span>
        <div>
          <Monitor /> Windows
        </div>
        <div>
          <Smartphone /> Android
        </div>
        <div>
          <Smartphone /> iOS
        </div>
        <div>
          <Laptop /> macOS
        </div>
        <div>
          <Monitor /> Linux
        </div>
      </section>
      <section className="home-section home-container" id="features">
        <div className="home-section-heading">
          <div>
            <span className="home-section-tag">چرا ویرا؟</span>
            <h2>
              جزئیات کمتر برای تو،
              <br />
              امکان‌های بیشتر برای <em>دنیای تو.</em>
            </h2>
          </div>
          <p>
            از انتخاب اشتراک تا مدیریت مصرف؛
            <br />
            همه چیز ساده، مرتب و در دسترس.
          </p>
        </div>
        <div className="home-bento">
          <article className="home-bento-primary">
            <div className="home-icon">
              <LayoutDashboard size={24} />
            </div>
            <h3>یک پنل، برای همه چیز.</h3>
            <p>
              اشتراک‌ها، حجم باقی‌مانده، کیف پول و تمدید.
              <br />
              بدون سردرگمی؛ فقط چیزی که نیاز داری.
            </p>
            <a href="#panel">
              پنل را کشف کن <ArrowLeft size={16} />
            </a>
            <div className="home-mini-usage">
              <div>
                <span>
                  <Activity size={16} /> حجم باقی‌مانده
                </span>
                <b>
                  ۶۶ <small>GB</small>
                </b>
              </div>
              <div className="home-mini-bars">
                {[
                  36, 58, 44, 75, 50, 91, 64, 80, 52, 68, 92, 71, 86, 57, 98,
                  73, 66, 86,
                ].map((h, i) => (
                  <i key={i} style={{ height: h + "%" }} />
                ))}
              </div>
              <small>نمایش اطلاعات نمونه</small>
            </div>
          </article>
          <article>
            <span className="home-icon mint">
              <ShieldCheck size={24} />
            </span>
            <h3>مسیر امن‌تر، خیال راحت‌تر.</h3>
            <p>
              پشتیبانی از پروتکل V2Ray در کلاینت‌های سازگار، برای یک مسیر
              رمزنگاری‌شده.
            </p>
            <span className="home-feature-label">
              <LockKeyhole size={12} /> V2Ray protocol
            </span>
          </article>
          <article>
            <span className="home-icon peach">
              <Headphones size={24} />
            </span>
            <h3>در مسیرت تنها نیستی.</h3>
            <p>
              راهنمای قدم‌به‌قدم اتصال و تیکت پشتیبانی، در همان جایی که اشتراکت
              را مدیریت می‌کنی.
            </p>
            <a href="#panel/support">
              ارتباط با پشتیبانی <ArrowUpLeft size={15} />
            </a>
          </article>
        </div>
      </section>
      <section className="home-locations-wrap">
        <div className="home-container home-locations">
          <div>
            <span className="home-section-tag">فراتر از فاصله‌ها</span>
            <h2>
              یک دنیا مسیر.
              <br />
              <em>یک انتخاب ساده.</em>
            </h2>
            <p>
              از میان موقعیت‌های نمونه، مسیر مناسب خودت را پیدا کن.
              <br />
              اشتراکت را در پنل ببین و هر وقت خواستی تمدید کن.
            </p>
            <a className="home-text-link" href="#panel">
              مشاهده سرویس‌ها <ArrowLeft size={16} />
            </a>
          </div>
          <div className="home-locations-board">
            <div className="home-board-label">
              <Globe2 size={16} /> VIRA NETWORK <span>موقعیت‌های نمونه</span>
            </div>
            {countries.map((c) => (
              <div className="home-location" key={c.code}>
                <span className={"country-code " + c.color}>{c.code}</span>
                <div>
                  <b>{c.title}</b>
                  <small>{c.city}</small>
                </div>
                <span className="home-location-line" />
                <span>V2Ray</span>
                <ChevronLeft size={15} />
              </div>
            ))}
            <small className="home-sample-note">
              سرورها و اطلاعات این نسخه، نمایشی هستند.
            </small>
          </div>
        </div>
      </section>
      <section
        className="home-section home-container home-pricing"
        id="pricing"
      >
        <div className="home-centered-heading">
          <span className="home-section-tag">برای هر سبک استفاده</span>
          <h2>
            اشتراک ساده.<em> انتخاب هوشمندانه.</em>
          </h2>
          <p>از گشت‌وگذار روزمره تا کارهای بزرگ‌تر، پلن خودت را پیدا کن.</p>
          <div className="home-period" aria-label="دوره اشتراک">
            <button
              className={!quarterly ? "chosen" : ""}
              aria-pressed={!quarterly}
              onClick={() => setQuarterly(false)}
            >
              یک‌ماهه
            </button>
            <button
              className={quarterly ? "chosen" : ""}
              aria-pressed={quarterly}
              onClick={() => setQuarterly(true)}
            >
              سه‌ماهه <small>۱۵٪ تخفیف</small>
            </button>
          </div>
        </div>
        <div className="home-plans">
          {plans.map((p, i) => (
            <article
              className={"home-plan " + (i === 1 ? "featured" : "")}
              key={p.name}
            >
              {i === 1 && (
                <div className="home-recommended">
                  <Zap size={13} /> پیشنهاد ویرا
                </div>
              )}
              <div className="home-plan-top">
                <span className="home-icon">
                  <p.icon size={22} />
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.caption}</p>
                </div>
              </div>
              <div className="home-price">
                {fa(quarterly ? Math.round(p.price * 3 * 0.85) : p.price)}
                <small>
                  تومان <span>/ {quarterly ? "سه ماه" : "ماه"}</span>
                </small>
              </div>
              <div className="home-volume">
                <b>{fa(p.volume * (quarterly ? 3 : 1))}</b>
                <span>گیگابایت حجم</span>
                <small>{quarterly ? "۹۰" : "۳۰"} روز اعتبار</small>
              </div>
              <ul>
                {[
                  `${fa(p.devices)} دستگاه هم‌زمان`,
                  "موقعیت‌های متنوع سرور",
                  "سازگار با موبایل و کامپیوتر",
                  "پنل مدیریت حجم و تمدید",
                  "راهنمای اتصال و پشتیبانی",
                ].map((item) => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                className={"home-button " + (i === 1 ? "" : "outline")}
                href={`#panel/buy?plan=${i}&period=${quarterly ? 3 : 1}`}
              >
                انتخاب {p.name} <ArrowLeft size={16} />
              </a>
            </article>
          ))}
        </div>
        <p className="home-pricing-disclaimer">
          <LockKeyhole size={13} /> خرید و پرداخت در نسخه فعلی آزمایشی هستند و
          سرویس واقعی فعال نمی‌شود.
        </p>
      </section>
      <section className="home-setup-wrap" id="connect">
        <div className="home-container home-setup">
          <div>
            <span className="home-section-tag">شروعی بدون پیچیدگی</span>
            <h2>
              فقط سه قدم،
              <br />
              تا مسیر <em>تازه‌ی تو.</em>
            </h2>
            <div className="home-steps">
              {[
                {
                  icon: CreditCard,
                  title: "اشتراکت را انتخاب کن",
                  text: "پلن و دوره مناسب مصرفت را پیدا کن.",
                },
                {
                  icon: Download,
                  title: "برنامه را نصب کن",
                  text: "یک کلاینت سازگار با دستگاهت نصب کن.",
                },
                {
                  icon: Wifi,
                  title: "لینک را وارد کن و متصل شو",
                  text: "لینک اشتراک را از پنل به برنامه اضافه کن.",
                },
              ].map((s, i) => (
                <div key={s.title}>
                  <span>{fa(i + 1)}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                  <s.icon size={18} />
                </div>
              ))}
            </div>
          </div>
          <div className="home-device-guide">
            <div className="home-device-tabs">
              {["اندروید", "آیفون", "ویندوز", "مک"].map((d) => (
                <button
                  aria-pressed={device === d}
                  className={device === d ? "active" : ""}
                  key={d}
                  onClick={() => setDevice(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="home-device-guide-body">
              <span className="home-device-illustration">
                {device === "اندروید" || device === "آیفون" ? (
                  <Smartphone size={56} strokeWidth={1.2} />
                ) : (
                  <Laptop size={62} strokeWidth={1.2} />
                )}
                <span>
                  <Check size={13} />
                </span>
              </span>
              <h3>ویرا روی {device}</h3>
              <p>
                با{" "}
                {device === "اندروید"
                  ? "v2rayNG"
                  : device === "آیفون"
                    ? "Streisand"
                    : device === "ویندوز"
                      ? "v2rayN"
                      : "V2Box"}{" "}
                شروع کنید.
              </p>
              <ol>
                <li>برنامه را از منبع رسمی آن نصب کنید.</li>
                <li>لینک اشتراک را از پنل خود کپی کنید.</li>
                <li>گزینه Import from clipboard را انتخاب کنید.</li>
              </ol>
              <a href="#panel/guide" className="home-text-link">
                راهنمای کامل در پنل <ArrowLeft size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="home-section home-container home-faq" id="faq">
        <div>
          <span className="home-section-tag">پاسخ، قبل از پرسش</span>
          <h2>
            سوالی توی
            <br />
            <em>ذهنت مانده؟</em>
          </h2>
          <p>
            این چند پاسخ، شروع خوبی است.
            <br />
            برای سوال‌های بیشتر، کنار تو هستیم.
          </p>
          <a href="#panel/support" className="home-text-link">
            ارتباط با پشتیبانی <ArrowUpLeft size={16} />
          </a>
        </div>
        <div className="home-questions">
          {faqs.map(([q, a], i) => (
            <div className={faq === i ? "expanded" : ""} key={q}>
              <button
                aria-expanded={faq === i}
                aria-controls={"home-answer-" + i}
                onClick={() => setFaq(faq === i ? null : i)}
              >
                {q}
                {faq === i ? <Minus size={17} /> : <Plus size={17} />}
              </button>
              <p id={"home-answer-" + i} hidden={faq !== i}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="home-container home-cta">
        <div>
          <span>یک قدم تا تجربه‌ای متفاوت</span>
          <h2>دنیای بزرگ‌ترت، از اینجا شروع می‌شود.</h2>
          <p>پلن مناسب خودت را پیدا کن؛ بقیه مسیر، ساده است.</p>
        </div>
        <button className="home-button" onClick={() => jump("pricing")}>
          انتخاب اشتراک <ArrowLeft size={17} />
        </button>
        <Globe2 className="home-cta-globe" size={230} strokeWidth={0.6} />
      </section>
      <footer className="home-footer home-container">
        <div className="home-footer-main">
          <div>
            <Brand />
            <p>
              یک مسیر ساده‌تر برای زندگی دیجیتال.
              <br />
              برای دنیایی که به تو نزدیک‌تر است.
            </p>
          </div>
          <div>
            <h3>کشف ویرا</h3>
            <button onClick={() => jump("features")}>چرا ویرا؟</button>
            <button onClick={() => jump("pricing")}>
              اشتراک‌ها و تعرفه‌ها
            </button>
            <a href="#panel">پنل کاربری</a>
          </div>
          <div>
            <h3>راهنما و همراهی</h3>
            <button onClick={() => jump("connect")}>راهنمای اتصال</button>
            <button onClick={() => jump("faq")}>سوالات متداول</button>
            <a href="#panel/support">تیکت پشتیبانی</a>
          </div>
          <div className="home-transparency">
            <ShieldCheck size={21} />
            <b>شفافیت، بخشی از اعتماد است.</b>
            <p>
              این سایت نمونه‌ی رابط کاربری است. پرداخت، اتصال VPN و پشتیبانی
              زنده هنوز فعال نیستند.
            </p>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>
            © {fa(new Date().getFullYear())} ویرا؛ برای دنیایی بدون مرز.
          </span>
          <span>طراحی برای یک تجربه ساده‌تر</span>
          <button onClick={() => jump("top")}>بازگشت به بالا ↑</button>
        </div>
      </footer>
    </div>
  );
}
