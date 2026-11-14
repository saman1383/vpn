# Vira VPN — React storefront and dashboards

Persian RTL, responsive VPN website built with React 19, Vite 6, Lucide icons and locally bundled Vazirmatn fonts.

## Automated server installation

See the complete [Persian installation guide](docs/INSTALL.fa.md). From a checkout on a Linux server:

```sh
bash install.sh --dry-run
sudo bash install.sh --yes
# Optional automatic HTTPS (replace the example values; configure DNS first):
sudo bash install.sh --yes --domain vpn.example.com --email owner@example.com
```

The installer bootstraps Docker/Compose on Ubuntu/Debian when needed, builds the front-end with Node 22 in a multi-stage Docker image, runs a non-root/read-only Nginx container on port 8080, and optionally runs Caddy on ports 80/443. HTTPS mode binds direct HTTP to loopback. It validates inputs, protects against taking over an unrelated Compose project, builds before replacing the current web container, and verifies an internal HTTP health endpoint. It does **not** verify public TLS issuance or modify DNS/host firewall/existing web servers. Docker itself may configure its normal host networking. Use the same name/domain/port options when redeploying. No automatic rollback or zero-downtime guarantee is provided.

**This installs the demo UI only, not a VPN server, authentication, database or payment backend.** Admin remains public. Do not use sensitive data. Full Docker deployment/certificate issuance requires validation on your own target host and domain.

## Visual direction

The website uses the selected **Clear Blue** identity: white surfaces, blue accents, neutral typography, a centered product-led home page, an interactive dashboard preview, bento features, revised pricing cards, device instructions and responsive layouts. Both workspaces use light navigation. The user overview combines subscription cards, wallet and usage summaries; the administrator overview uses a revenue line chart, operation shortcuts, infrastructure status and support activity. Assets and fonts are local; no external image/font services are required.

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

- `#home` (also the default route): public home page, interactive dashboard preview, features, example server locations, pricing, device setup instructions and FAQ accordion.
- `#panel`: user dashboard with service usage, wallet, plans, simulated checkout, support tickets, referrals and account settings.
- `#panel/buy?plan=1&period=3`: simulated checkout for the quarterly professional plan. The public pricing cards carry their plan and period into the panel.
- `#panel/guide`: user setup guide.
- `#panel/support`: user support tickets.
- `#admin`: independent administrator demo. Also accessible through **ورود به پنل مدیریت** in the user sidebar. Links return to the user panel and public home page.

## Administrator demo

- Overview metrics derived from sample records, a revenue line chart, infrastructure summary, and recent services/tickets.
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

`npm test` runs Node tests covering sample data integrity, relational delete protection, payment totals, ID allocation, storage restoration/fallback, installer syntax, dry-run behavior and rejection of malformed/unsafe inputs.

For browser smoke tests, start `npm run dev` in another terminal, then:

```sh
npx playwright install chromium
npm run test:e2e
```

Optional environment variables: `TEST_URL` (defaults to `http://localhost:5173`) and `CHROMIUM_PATH` (custom Chromium executable).

The browser suite covers user create/edit/delete and persistence, relational guards, ticket replies/closure, simulated refunds/CSV download, service creation/renewal, plan/server creation/deletion, settings/activity log, mobile navigation/overflow, public/user/admin routing, quarterly checkout handoff, device tabs, FAQ toggles and home-page mobile navigation. It also exercises the new preview location selector and the user overview service details, wallet top-up, guide and purchase flow, checking that wallet and usage totals update. Tests use a fresh isolated browser context and do not change your own browser data.
