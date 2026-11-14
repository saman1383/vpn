# Vira VPN — React storefront and dashboards

Persian RTL, responsive VPN website built with React 19, Vite 6, Lucide icons and locally bundled Vazirmatn fonts.

## Run

```sh
npm ci
npm run dev
```

Vite binds to `0.0.0.0`; `.e2b.app` preview hosts are allowed in the development configuration.

```sh
npm run build
npm test
```

## Pages

- `#home` (also the default route): public home page, SVG globe illustration, features, example server locations, pricing, device setup instructions and FAQ accordion.
- `#panel`: user dashboard with service usage, wallet, plans, simulated checkout, support tickets, referrals and account settings.
- `#panel/buy?plan=1&period=3`: simulated checkout for the quarterly professional plan. The public pricing cards carry their plan and period into the panel.
- `#panel/guide`: user setup guide.
- `#panel/support`: user support tickets.
- `#admin`: independent administrator demo. Also accessible through **ورود به پنل مدیریت** in the user sidebar. Links return to the user panel and public home page.

## Administrator demo

- Overview metrics derived from sample records, a revenue bar chart, infrastructure summary, and recent services/tickets.
- Searchable/filterable user list; create, edit, activate/deactivate and delete unreferenced sample users. Duplicate email validation.
- Create/edit subscriptions, change their local status and simulate renewal (resets usage, volume and validity from the associated plan after confirmation).
- Create/edit/delete sample plans and server configurations. Referenced users, plans and servers cannot be deleted.
- Support conversations with locally stored admin replies, close and reopen actions.
- Financial summaries, payment status filters, downloadable filtered CSV, and confirmed **simulated** refunds. No money moves.
- Locally saved settings, up to 200 activity records, and confirmed reset to initial sample data.
- Responsive sidebar and tables, empty states, notices, labelled controls, Escape-to-close dialogs and modal focus trapping/restoration.

### Data and security boundaries

**This is a front-end prototype, not a production VPN or payment system.**

- There is **no authentication or authorization**. `#admin` is public; this is an interface preview, not a secure admin boundary.
- Admin records are stored in this browser's `localStorage` under `vira-admin-demo-v1`. Do not enter real personal information, passwords or API keys. Storage errors display a warning. Reset data via Admin → Settings.
- User-panel data remains in React memory and resets on refresh. User-panel tickets and purchases are **not shared** with the admin demo dataset. Admin plan/settings changes do **not** update the public storefront or real services; the UI explicitly notes this.
- Server load, uptime/status indicators, usage and financial records are sample values. There is no VPN provisioning, live traffic API, payment gateway, actual refund, email/SMS delivery or support dispatch.
- Connection and invite links are intentionally nonfunctional examples.
- Activity logs are locally editable demo records, not security audit logs. Admin settings are local configuration samples only; maintenance mode does not disable the public site.

A production implementation requires a backend with authentication/RBAC, persistent storage, server-side validation, verified payment webhooks, VPN-provider integration, safe secret management, real support delivery and tamper-resistant audit logging.

## Tests

`npm test` runs Node tests covering sample data integrity, relational delete protection, payment totals, ID allocation and storage restoration/fallback.

For browser smoke tests, start `npm run dev` in another terminal, then:

```sh
npx playwright install chromium
npm run test:e2e
```

Optional environment variables: `TEST_URL` (defaults to `http://localhost:5173`) and `CHROMIUM_PATH` (custom Chromium executable).

The browser suite covers user create/edit/delete and persistence, relational guards, ticket replies/closure, simulated refunds/CSV download, service creation/renewal, plan/server creation/deletion, settings/activity log, mobile navigation/overflow, and public/user/admin routing. Tests use a fresh isolated browser context and do not change your own browser data.
