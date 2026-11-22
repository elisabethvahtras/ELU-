<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- ELU+ game state lives in `src/lib/game/store.ts` (localStorage, no backend) and all money math in pure `src/lib/game/finance.ts` with tests — keeps the hackathon demo offline and the formulas verifiable.
- The AI companion is rule-based on the player's own numbers (`aiQuestion`) — deterministic and needs no API key.
- Use pure finance helpers for recurring investment plans, final loan instalments and month-by-month forecasts; forecasts share the game's cash timing to avoid duplicate charges and expired costs.
- Store living expenses at the base price level and convert through `priceLevel` for display and editing; contractual tuition and loan payments are excluded from inflation to keep totals consistent.
- Keep rental properties separate from the player's residence and associate each property with its loan ID; buying and selling must update cash, assets and that loan together without double-counting rental income.
- Persist the last career-action month and allow only one career action per simulated month; time costs must prevent repeated free salary increases.
- Keep the main gameplay shell at dynamic viewport height with a flexible scene and fixed action/navigation rows; secondary financial details and history open in sheets to avoid scrolling the phone dashboard.
- Bank-connection mockups must display DEMO and disclose that no bank data is read; any habits shown are derived only from the local game profile, never represented as imported transactions.
- Treat chosen life expectancy as a forecast horizon, not a medical estimate or game age limit; end-of-life wealth uses the same monthly finance engine and also shows inflation-adjusted purchasing power.
- Automatic career promotions stop at the highest defined career tier; never compound monthly experience into unlimited salary growth.
- Changing residence transfers the previous home and its associated mortgage to the rental portfolio as vacant; preserve its value and costs instead of deleting the asset.
- Keep the editable shopping basket per life in the offline game store; use source-dated public price snapshots and nullable card offers so unverified discounts are never invented.
- Derive the scene goal-completion token from existing goal progress and milestones without changing finances; respect reduced motion.
- Use a fluid gameplay shell with a two-column wide-screen dashboard and a flexible scene; keep the stacked phone view free of page scrolling.
- Keep month review and result presentation in MonthTurn, guard repeated confirmation, and defer event sheets until results close so each turn remains readable.
- Edit goal type, title and target together through GoalEditor; save only on confirmation so cancelling leaves the current goal intact.
- Expose the existing forecast inputs beside negative projections and label them as modelled shortfalls, not actual borrowing; do not hide deficits by clamping wealth.
- CareerLevels derives its table from the finance tier constants; self-reported tier changes use setCareerLevel, reset XP only on a changed tier, and never grant money or promotion raises.
- Partner income is a separately stored contribution used via householdIncome in actual cash flow, forecasts and exports; partner living costs remain base-price values with a backward-compatible default.
- Forecast cash-flow diagnostics use the same inflation and expiring-payment timing as projectFinances; future-city illustrations show existing residence and computed financial state, never assumed purchases.
- Apply optional annual forecast income growth at the same year boundaries as cost inflation; keep actual gameplay salary and forecast assumptions separate.
- Keep FutureTab focused on one result and a clickable streetscape; building sheets reuse its selected age and finance forecast, while assumptions stay in the calculation sheet and scenarios are disabled without market-sensitive holdings — keeps details consistent without scrolling the dashboard.
- GuidedDemo uses an isolated fictional Life and the pure finance engine, never persistent store mutations; a timed script pauses for details and supports immediate exit — protects player data during the pitch.
- GameGuide opens existing views without changing player data and retains its step while mounted; shared GameHelpActions keeps guide/demo controls in the header and unsupported products are disclosed to avoid misleading instructions.
- CreateLife uses visualViewport height with an svh fallback and a separate submit grid row below scrollable fields — mobile browser bars and keyboards must not hide starting.
