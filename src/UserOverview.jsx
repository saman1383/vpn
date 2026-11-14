import React from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  Plus,
  Wallet,
  Headphones,
  Download,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Globe2,
  ShoppingBag,
  Check,
  Gift,
  Activity,
} from "lucide-react";
const fa = (n) => new Intl.NumberFormat("fa-IR").format(n);
export default function UserOverview({
  services,
  balance,
  openTickets,
  navigate,
  openModal,
}) {
  const total = services.reduce((sum, s) => sum + s.total, 0),
    used = services.reduce((sum, s) => sum + s.used, 0),
    remaining = total - used;
  return (
    <div className="uo">
      <div className="uo-top-grid">
        <section className="uo-membership">
          <div className="uo-membership-copy">
            <span>
              <ShieldCheck size={15} /> همراه تو، در تمام مسیر
            </span>
            <h2>
              یک پنل ساده،
              <br />
              برای دنیای تو.
            </h2>
            <p>
              اشتراک‌هایت را مدیریت کن، از مصرفت باخبر باش
              <br />و هر زمان که خواستی، مسیرت را ادامه بده.
            </p>
            <button onClick={() => navigate("خرید اشتراک")}>
              کشف اشتراک‌ها <ArrowLeft size={16} />
            </button>
          </div>
          <div className="uo-passport" aria-hidden="true">
            <div>
              <ShieldCheck size={22} />
              <span>
                VIRA
                <br />
                <small>YOUR DIGITAL PASS</small>
              </span>
            </div>
            <div className="uo-passport-rings">
              <Globe2 size={100} strokeWidth={0.8} />
            </div>
            <span className="uo-passport-bottom">
              یک اشتراک، هزاران مسیر <ArrowUpLeft size={18} />
            </span>
          </div>
          <div className="uo-membership-pattern" />
        </section>
        <section className="uo-wallet">
          <div>
            <span className="uo-wallet-icon">
              <Wallet size={21} />
            </span>
            <span>
              کیف پول من <small>موجودی قابل استفاده</small>
            </span>
            <button
              aria-label="مشاهده کیف پول"
              onClick={() => navigate("کیف پول و تراکنش‌ها")}
            >
              <ArrowUpLeft size={17} />
            </button>
          </div>
          <strong>
            {fa(balance)} <small>تومان</small>
          </strong>
          <button className="uo-wallet-add" onClick={() => openModal("wallet")}>
            <Plus size={16} /> افزایش موجودی کیف پول
          </button>
          <p>
            <ShieldCheck size={12} /> پرداخت و موجودی در این نسخه آزمایشی است.
          </p>
        </section>
      </div>
      <div className="uo-body-grid">
        <div className="uo-primary-col">
          <section className="uo-services">
            <div className="uo-section-heading">
              <div>
                <h2>
                  اشتراک‌های من <span>{fa(services.length)}</span>
                </h2>
                <p>مسیرهایت را در یک نگاه مدیریت کن.</p>
              </div>
              <button onClick={() => navigate("سرویس‌های من")}>
                مشاهده همه <ChevronLeft size={15} />
              </button>
            </div>
            <div className="uo-service-grid">
              {services.slice(0, 2).map((s) => (
                <article className="uo-service-card" key={s.id}>
                  <div className="uo-service-top">
                    <span className="uo-server-code">
                      {s.loc === "هلند" ? "NL" : "DE"}
                    </span>
                    <div>
                      <h3>{s.name}</h3>
                      <span>
                        {s.loc} <i /> <b dir="ltr">{s.id}</b>
                      </span>
                    </div>
                    <span className="uo-active">
                      <i />
                      فعال
                    </span>
                  </div>
                  <div className="uo-service-volume">
                    <strong>
                      {fa(s.total - s.used)} <small>گیگابایت باقی‌مانده</small>
                    </strong>
                    <span>از {fa(s.total)} گیگابایت</span>
                  </div>
                  <div
                    className={
                      "uo-meter " + (s.used / s.total > 0.8 ? "amber" : "")
                    }
                  >
                    <i style={{ width: (s.used / s.total) * 100 + "%" }} />
                  </div>
                  <div className="uo-service-expiry">
                    <span>
                      <Clock size={13} />
                      {fa(s.days)} روز باقی‌مانده
                    </span>
                    <span>{fa(s.used)} گیگ مصرف‌شده</span>
                  </div>
                  <button className="uo-manage" onClick={() => openModal(s)}>
                    جزئیات و تمدید <ArrowLeft size={15} />
                  </button>
                </article>
              ))}
            </div>
            <button
              className="uo-new-service"
              onClick={() => navigate("خرید اشتراک")}
            >
              <Plus size={17} />
              <span>یک مسیر جدید اضافه کن</span>
              <small>انتخاب و خرید اشتراک</small>
              <ArrowLeft size={15} />
            </button>
          </section>
          <section className="uo-recent">
            <div className="uo-section-heading">
              <div>
                <h2>فعالیت‌های نمونه</h2>
                <p>نگاهی به رویدادهای حساب کاربری</p>
              </div>
              <button onClick={() => navigate("کیف پول و تراکنش‌ها")}>
                تراکنش‌ها <ChevronLeft size={15} />
              </button>
            </div>
            {[
              {
                Icon: ShoppingBag,
                title: "خرید اشتراک حرفه‌ای",
                detail: "نمونه تراکنش خرید",
                amount: "۲۱۹٬۰۰۰",
                deposit: false,
              },
              {
                Icon: Wallet,
                title: "افزایش موجودی کیف پول",
                detail: "نمونه شارژ کیف پول",
                amount: "۴۰۰٬۰۰۰",
                deposit: true,
              },
            ].map((t, i) => (
              <div className="uo-activity" key={i}>
                <span
                  className={"uo-activity-icon " + (t.deposit ? "deposit" : "")}
                >
                  <t.Icon size={19} />
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.detail}</small>
                </div>
                <span className={"uo-amount " + (t.deposit ? "deposit" : "")}>
                  {t.deposit ? "+" : "−"}
                  {t.amount}
                  <small>تومان</small>
                </span>
                <span className="uo-done">
                  <Check size={13} /> نمونه موفق
                </span>
              </div>
            ))}
          </section>
        </div>
        <aside className="uo-secondary-col">
          <section className="uo-consumption">
            <div className="uo-section-heading">
              <h2>خلاصه مصرف</h2>
              <Activity size={17} />
            </div>
            <div
              className="uo-usage-ring"
              style={{ "--used": total ? (used / total) * 100 + "%" : "0%" }}
            >
              <div>
                <strong>{fa(remaining)}</strong>
                <span>گیگابایت باقی‌مانده</span>
              </div>
            </div>
            <div className="uo-usage-key">
              <span>
                <i />
                مصرف‌شده <b>{fa(used)} GB</b>
              </span>
              <span>
                <i />
                حجم کل <b>{fa(total)} GB</b>
              </span>
            </div>
          </section>
          <section className="uo-help">
            <span>
              <Headphones size={23} />
            </span>
            <h2>یک سوال کوچک؟</h2>
            <p>
              از راهنمای اتصال شروع کن؛
              <br />
              اگر نیاز داشتی، برایمان تیکت بفرست.
            </p>
            <button onClick={() => openModal("guide")}>
              <Download size={15} /> راهنمای اتصال <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => {
                navigate("تیکت‌های پشتیبانی");
                openModal("ticket");
              }}
            >
              <Headphones size={15} /> گفتگو با پشتیبانی{" "}
              <ChevronLeft size={14} />
            </button>
            <small>{fa(openTickets)} تیکت در انتظار پاسخ</small>
          </section>
        </aside>
      </div>
      <section className="uo-invite">
        <span>
          <Gift size={27} />
        </span>
        <div>
          <h3>تجربه‌های خوب، با دوست‌ها بهترند.</h3>
          <p>شرایط دعوت دوستان و اعتبار هدیه را در پنل ببین.</p>
        </div>
        <button onClick={() => navigate("دعوت از دوستان")}>
          دعوت از دوستان <ArrowLeft size={16} />
        </button>
      </section>
      <div className="uo-demo-disclaimer">
        <ShieldCheck size={15} /> اطلاعات این محیط نمونه است؛ مصرف، اتصال و
        پرداخت واقعی هنوز به بک‌اند متصل نیستند.
      </div>
    </div>
  );
}
