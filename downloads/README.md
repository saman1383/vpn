# cPanel download

`vira-cpanel.zip` is the static production build of the front-end at commit
`d2130bbddf28c878222bbb68ea54632a64910be0` (Clear Blue preview).
It is intentionally included here to provide a download independent of the temporary sandbox.

Extract its contents directly into your domain's document root (usually `public_html`).
This package targets a domain/subdomain root, not a nested subdirectory.

This remains a **front-end demo**: no admin authentication, real VPN backend or real payments.
Do not enter real customer data. Rebuild and replace this archive after source changes.

## Connected PHP + MySQL package

`vira-cpanel-connected.zip` includes `public_html/`, `vira-private/` and the Persian installation guide. Extract at the cPanel account home, **not directly inside public_html**. Configure server-only credentials, install the schema and create an admin before use. See [installation and live acceptance checklist](../docs/CPANEL.fa.md). Targets 3x-ui v3.11.0; real gateway/panel/MySQL tests are still required. The older ZIP above remains demo-only.
