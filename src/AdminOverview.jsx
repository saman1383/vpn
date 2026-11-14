import React from "react";
import {
  Users,
  Wifi,
  Wallet,
  Ticket,
  ArrowLeft,
  ArrowUpLeft,
  Plus,
  Server,
  ChevronLeft,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { paymentTotals } from "./adminData";
const fa = (n) => new Intl.NumberFormat("fa-IR").format(n);
const days = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
function RevenueChart({ payments }) {
  const values = days.map((_, i) =>
    payments
      .filter((p) => p.day === i && p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
  );
  const max = Math.max(1000, Math.ceil(Math.max(0, ...values) / 1000) * 1000),
    points = values.map((v, i) => `${600 - i * 100},${155 - (v / max) * 120}`);
  return (
    <figure className="ao-chart">
      <div className="ao-chart-canvas">
        <div className="ao-chart-scale">
          <span>{fa(Math.ceil(max / 1000))} هزار</span>
          <span>{fa(Math.ceil(max / 2000))} هزار</span>
          <span>۰</span>
        </div>
        <svg
          viewBox="0 0 600 175"
          preserveAspectRatio="none"
          role="img"
          aria-label="درآمد موفق نمونه در روزهای هفته"
        >
          <defs>
            <linearGradient id="aoRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#6fa0f9" stopOpacity=".22" />
              <stop offset="1" stopColor="#6fa0f9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#edf2fa" strokeDasharray="4 5">
            <path d="M0 35H600M0 95H600M0 155H600" />
          </g>
          <path
            d={`M600,155 L${points.join(" L")} L0,155Z`}
            fill="url(#aoRevenueFill)"
          />
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#5186ee"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
          {values.map((v, i) => (
            <circle
              key={i}
              cx={600 - i * 100}
              cy={155 - (v / max) * 120}
              r="4"
              fill="#fff"
              stroke="#5186ee"
              strokeWidth="2"
            >
              <title>
                {days[i]}: {fa(v)} تومان
              </title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="ao-chart-days">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <figcaption>
        بر اساس تراکنش‌های موفق همین محیط نمونه؛ داده زنده نیست.
      </figcaption>
    </figure>
  );
}
export default function AdminOverview({
  db,
  go,
  edit,
  renderServices,
  renderTickets,
}) {
  const revenue = paymentTotals(db.payments).paid,
    open = db.tickets.filter((t) => t.status === "open").length,
    expiring = db.services.filter((s) => s.active && s.days <= 5).length;
  const metrics = [
    {
      title: "درآمد موفق",
      value: revenue,
      unit: "تومان",
      Icon: Wallet,
      note: `${fa(db.payments.filter((p) => p.status === "paid").length)} تراکنش موفق نمونه`,
      color: "blue",
    },
    {
      title: "کاربران ثبت‌شده",
      value: db.users.length,
      unit: "کاربر",
      Icon: Users,
      note: `${fa(db.users.filter((u) => u.active).length)} حساب فعال`,
      color: "violet",
    },
    {
      title: "اشتراک‌های فعال",
      value: db.services.filter((s) => s.active).length,
      unit: "سرویس",
      Icon: Wifi,
      note: `از مجموع ${fa(db.services.length)} اشتراک`,
      color: "mint",
    },
    {
      title: "منتظر پاسخ",
      value: open,
      unit: "تیکت",
      Icon: Ticket,
      note: "صندوق پشتیبانی",
      color: "amber",
    },
  ];
  return (
    <div className="ao">
      <section className="ao-summary">
        {metrics.map((m) => (
          <article key={m.title}>
            <div>
              <span>{m.title}</span>
              <span className={"ao-metric-icon " + m.color}>
                <m.Icon size={20} />
              </span>
            </div>
            <strong>
              {fa(m.value)} <small>{m.unit}</small>
            </strong>
            <p>{m.note}</p>
            <svg viewBox="0 0 100 30" aria-hidden="true">
              <path d="M0 27H15V22H32V17H47V20H62V10H79V4H100" />
            </svg>
          </article>
        ))}
      </section>
      <section className="ao-action-center">
        <div>
          <span>
            <Activity size={21} />
          </span>
          <div>
            <h2>میز کار امروز شما</h2>
            <p>
              {fa(open)} تیکت منتظر پاسخ و {fa(expiring)} اشتراک نزدیک به پایان
              اعتبار
            </p>
          </div>
        </div>
        <div>
          <button onClick={() => edit("users")}>
            <Plus size={15} />
            افزودن کاربر
          </button>
          <button onClick={() => go("tickets")}>
            رفتن به پشتیبانی <ArrowLeft size={15} />
          </button>
        </div>
      </section>
      <div className="ao-grid">
        <section className="ao-panel ao-revenue">
          <div className="ao-panel-heading">
            <div>
              <h2>گزارش درآمد</h2>
              <p>توزیع پرداخت‌های موفق نمونه در هفته</p>
            </div>
            <button onClick={() => go("payments")}>
              گزارش مالی <ChevronLeft size={14} />
            </button>
          </div>
          <div className="ao-revenue-total">
            <strong>
              {fa(revenue)} <small>تومان</small>
            </strong>
            <span>
              <i /> درآمد موفق نمونه
            </span>
          </div>
          <RevenueChart payments={db.payments} />
        </section>
        <section className="ao-panel ao-infrastructure">
          <div className="ao-panel-heading">
            <div>
              <h2>زیرساخت و سرورها</h2>
              <p>وضعیت پیکربندی‌های نمونه</p>
            </div>
            <Server size={18} />
          </div>
          <div className="ao-server-count">
            <span>
              <Server size={24} />
            </span>
            <strong>
              {fa(db.servers.filter((s) => s.active).length)}
              <small>سرور فعال از {fa(db.servers.length)} سرور</small>
            </strong>
          </div>
          <div className="ao-server-list">
            {db.servers.slice(0, 3).map((s) => (
              <div key={s.id}>
                <span className="ao-server-initial">
                  {s.country === "هلند"
                    ? "NL"
                    : s.country === "فنلاند"
                      ? "FI"
                      : "DE"}
                </span>
                <div>
                  <b>{s.country}</b>
                  <small dir="ltr">{s.name}</small>
                </div>
                <span
                  className={"ao-server-state " + (s.active ? "active" : "")}
                >
                  <i />
                  {s.active ? "فعال" : "غیرفعال"}
                </span>
              </div>
            ))}
          </div>
          <button className="ao-full-link" onClick={() => go("servers")}>
            مدیریت زیرساخت <ArrowLeft size={15} />
          </button>
        </section>
        <section className="ao-panel ao-services">
          <div className="ao-panel-heading">
            <div>
              <h2>آخرین اشتراک‌ها</h2>
              <p>مصرف و اعتبار کاربران در یک نگاه</p>
            </div>
            <button onClick={() => go("services")}>
              مشاهده همه <ChevronLeft size={14} />
            </button>
          </div>
          {renderServices(db.services.slice(0, 4))}
        </section>
        <section className="ao-panel ao-support">
          <div className="ao-panel-heading">
            <div>
              <h2>
                صندوق پشتیبانی <b>{fa(open)}</b>
              </h2>
              <p>گفتگوهای اخیر کاربران</p>
            </div>
            <button
              aria-label="مشاهده همه تیکت‌ها"
              onClick={() => go("tickets")}
            >
              <ArrowUpLeft size={18} />
            </button>
          </div>
          {db.tickets.length ? (
            renderTickets(db.tickets.slice(0, 3))
          ) : (
            <p className="ad-empty">هنوز تیکتی وجود ندارد.</p>
          )}
          <button className="ao-full-link" onClick={() => go("tickets")}>
            ورود به مرکز پشتیبانی <ArrowLeft size={15} />
          </button>
        </section>
      </div>
      <div className="ao-local-note">
        <ShieldCheck size={15} />
        <span>
          عملیات و اطلاعات این پنل آزمایشی است؛ هیچ فرمانی به سرور واقعی ارسال
          نمی‌شود.
        </span>
        <button onClick={() => go("logs")}>
          گزارش فعالیت‌ها <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
}
