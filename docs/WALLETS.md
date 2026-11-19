# Wallet directory (`/wallets`)

Public pages that help people choose and secure a wallet for SI Coin.

| Route | Page | Indexed |
| --- | --- | --- |
| `/wallets` | Directory: search, type/platform/interface filters, compare selection, how-to steps, FAQ | yes |
| `/wallets/:id` | One page per wallet (generated from the dataset) | yes |
| `/wallets/guide` | Choosing and securing a wallet | yes |
| `/wallets/compare?ids=a,b,c` | Side-by-side comparison, shareable link | no (`noindex`) |

Filter state lives in the URL (`?q=&cat=&device=&cap=&sort=`), so every view is linkable. Invalid values fall back to defaults.

## Where things live

- `apps/web/src/data/wallets.js` — **the single source of truth** (plus `wallets.d.ts` for types). It also holds the filter,
  sort, URL-state and compare logic. It is plain ESM so the Node build step can use it.
- `apps/web/src/seo/core.js` generates a `PAGES` entry per wallet from that file, so detail pages are pre-rendered, listed in
  `sitemap.xml` and checked by `npm run seo:check` automatically.
- `apps/web/src/components/wallets/` — card, filters, compare tray, accordion, token-import dialog.
- `apps/web/src/pages/public/Wallet*Page.tsx` — the four pages.
- `apps/web/scripts/wallets.test.mjs` — data and logic tests (`npm test -w apps/web`).

## Adding or editing a wallet

1. Add an object to `WALLETS` in `src/data/wallets.js` (see the `Wallet` typedef at the top of that file).
2. Use the provider's **official** `https` site with no tracking parameters, and open it once to confirm it is the real domain.
3. Write original, modest copy. The tests reject unverifiable claims ("30 million users", "most trusted", "gold standard"…).
4. `npm test -w apps/web && npm run build -w apps/web && npm run seo:check -w apps/web`.

## Editorial rules (why the copy is cautious)

SI Coin's own standard is *no fabricated metrics*. So the directory does not publish user counts, rankings, ratings or
"verified/certified" labels. Listing a wallet is **not** an endorsement, and SI Coin has not audited any listed wallet.
Logos are neutral monograms on purpose: third-party logos are trademarks and should only be used under each provider's brand
guidelines.

## "Add SI to wallet"

The dialog reads `GET /api/v1/coin/config` (address, decimals, ticker, network, explorer) and never hardcodes a token. If no
valid contract address is configured it says so and offers no import. When one is configured it asks the wallet to track the
token with exactly those values, and shows a test-network warning when the network name contains "testnet"/"sepolia".
Publish the contract address in the admin coin configuration, not in code.
