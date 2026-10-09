# Research and design rationale

This is the thinking behind the prototype in `/prototype`: what similar systems do, which numbers belong on the home screen, and why the screens are laid out the way they are.

## The business, as briefed

- One person supplies dental students with instruments, materials and kits for their year's requirements list.
- Clients reach him on WhatsApp. He handles everything else himself: quoting, sourcing, delivery, payment.
- He pays for an invoicing subscription to track invoices and clients.
- He can't compete on price, so he competes on service. The clearest example is repairs: he takes a broken device, deals with the service centre, and brings it back.

The system has to do two things: give him full control and a full view of the business, and make the premium service visible and effortless for students.

## What similar systems do

| Kind of system | Examples | What we borrowed |
|---|---|---|
| Repair shop software | RepairDesk, RepairShopr | Configurable ticket statuses; due dates with overdue alerts; estimates the customer approves before work starts; canned status messages by SMS or email. |
| Commerce admin | Shopify home | A small set of headline metrics (Shopify defaults to 4) with a date range; app home pages that show "items needing attention" next to metrics; mobile-first admin. |
| WhatsApp shared inboxes | WATI, respond.io | One business number shared in an inbox with open, pending and closed states; templates; broadcasts; order-update automations. WhatsApp's API has no front end of its own, so an inbox is needed. |
| Student kit retailers | Dentalkart student section (India), a Zagazig-based online store (Egypt) | Organise by year of study; sell preclinical kits as bundles; university-published lists vary by school and by year (University of Malta's list flags items by year). |
| Receivables tools | Stripe, Sage, Plooto | Aging buckets (current, 1–30, 31–60, 61–90, 90+); drill down from bucket to invoice; reminders that escalate by bucket and stop as soon as payment is recorded. |
| Post-purchase tracking | WISMO ("where is my order") tooling | Proactive updates at every milestone; a branded tracking page instead of "any update?" messages; tell customers about delays before they ask. |

Handpiece repair turnaround in the dental trade ranges from same-day or 24–48 hours (manufacturer programmes) to about 5 days (dealer repair centres) to around a week (mail-in services). Loaners are offered by some providers. That's the benchmark his repair service is measured against.

## Numbers on the home screen

Small-business KPI guidance converges on 5–8 metrics tied to the current goal, each with a comparison period. A bare number doesn't say whether things are better or worse. We chose seven:

| Metric | Definition in the prototype | Why it matters here |
|---|---|---|
| **Needs you today** | Ranked list: people waiting for a reply, late orders and repairs, estimates awaiting approval, payment screenshots to confirm, overdue money, low stock | A solo operator's scarcest resource is attention. Exceptions first, totals second. |
| **Revenue** | Sum of confirmed orders and approved repairs in the period. Compared with the **same period last year** | Sales follow the academic calendar (term starts, exams, summer). Month-on-month comparisons mislead. |
| **Gross profit and margin** | Revenue minus cost of goods and partner repair costs, shown against a target line (25% in the sample) | A premium strategy only works if the premium shows up as margin. Revenue can grow while profit shrinks. |
| **Money to collect** | Outstanding invoice balances, split into aging buckets; average days to get paid | Students pay late and in instalments. Old receivables quietly starve cash flow. |
| **Open orders and on-time rate** | Orders not yet delivered, by stage and value; % delivered on or before the promised day (30 days) | The promise date is the product. Being on time is what students remember. |
| **Repairs in progress and turnaround** | Active repairs by stage, late count, loaners out; average pickup-to-hand-back days (90 days); partner on-time rate | Repairs are the differentiator and the most fragile part of the service. |
| **Reply time and rating** | Median first reply today, % answered within 15 minutes, 30-day average rating | Premium means responsive. Published benchmarks put live chat replies at about a minute and email within an hour; we target 15 minutes. |

Deeper metrics live in **Reports**: revenue by month, university and year of study; new vs returning buyers; repeat-purchase rate; channel mix; best sellers with margin; margin by category; repair turnaround by partner.

## Design principles applied

1. **Inverted pyramid.** "Needs you today" sits above the KPIs, and everything on it is one tap from the fix.
2. **Every number has a comparison.** KPI tiles show a delta against the same period last year and a 12-point trend. When the earlier period is tiny, the absolute figure is shown instead of a silly percentage.
3. **Colour only when it means something.** Red is late or overdue, amber is at risk, green is good. Charts use one validated categorical palette and one-hue ramps for ordered data like aging.
4. **Drill-down everywhere.** Tiles, list rows and chart bars link to the records behind them.
5. **Phone first for the owner.** He's on campus, at suppliers and at service centres. The console has a bottom tab bar on mobile, and every board has a list view.
6. **Automate the predictable, keep the personal.** Status updates, reminders and acknowledgements are automatic. Conversations that need judgement stay with him, with suggested replies to speed them up.
7. **Show students the work.** Tracking pages, price approval for repairs, and loaners turn invisible effort into visible value. That's what justifies the higher price.

## Local context and assumptions

- **Market:** Greater Cairo dental faculties (Cairo, Ain Shams, Al-Azhar, FUE, BUE, MSA, MIU). Currency EGP. The brand name "Cusp", the owner's name and every figure are placeholders.
- **Payments:** Cash on delivery remains common in Egyptian e-commerce (one vendor estimate puts it near 40%). InstaPay and mobile wallets (Vodafone Cash) are widely used but are transfers, not checkouts, so screenshots still need confirming. The prototype handles that in the inbox.
- **Academic calendar:** Term 1 starting late September, exams in January, term 2 from February, finals May–June, summer quiet. The sample data follows this pattern.
- **Invoicing:** The system creates invoices and syncs them to his existing invoicing app, so nothing breaks during the switch.

## Questions to ask him before building

1. Which invoicing app is it, and does it have an API or export?
2. Roughly how many orders and repairs a month, and how many active clients?
3. Which faculties does he deliver to, and on which days?
4. Does he hold stock, or buy to order? Who are his main suppliers and service partners?
5. Does he already use a WhatsApp Business account? One number or several?
6. Which payment methods do students actually use with him today?
7. Would he want a helper during term starts, and what should they not see?
8. Are class-rep group orders common? How are they paid?

## Sources

- Shopify Help Center: Shopify Home metrics — https://help.shopify.com/en/manual/shopify-admin/shopify-home
- Shopify app home patterns (metrics card, items needing attention) — https://shopify.dev/docs/api/app-home/patterns/compositions/metrics-card
- Geckoboard: ecommerce KPIs — https://www.geckoboard.com/blog/ecommerce-kpis-with-tips-from-experts/
- SaaS UI: KPI card UX patterns — https://www.saasui.design/blog/saas-metric-kpi-card-ux-patterns
- FusionCharts: dashboard design best practices — https://www.fusioncharts.com/blog/dashboard-design-best-practices/
- RepairDesk: managing ticket statuses — https://help.repairdesk.co/portal/en/kb/articles/how-to-manage-ticket-status
- Burkhart Dental: handpiece repair centre (≈5 day turnaround) — https://www.burkhartdental.com/?p=16736
- Atlanta Dental: handpiece repair turnaround — https://atlantadental.com/services/handpiece-repair
- Dental Products Report: Brasseler handpiece repair service — https://www.dentalproductsreport.com/view/brasseler-usa-introduces-expanded-handpiece-repair-service
- Stripe: what is an aging report — https://stripe.com/en-se/resources/more/what-is-an-aging-report-what-is-in-one-and-how-to-use-it
- Plooto: how to read an AR aging report — https://www.plooto.com/blog/ar-aging-report-how-to-read
- AppMaster: AR aging dashboard with reminders — https://appmaster.io/blog/accounts-receivable-aging-dashboard-reminders
- Gorgias: customer service benchmarks — https://www.gorgias.com/blog/customer-service-benchmarks
- Zoom: customer service benchmarking — https://www.zoom.com/ja/blog/customer-service-benchmarking/
- BoldDesk: customer service standards — https://www.bolddesk.com/blogs/customer-service-standards
- WATI vs respond.io for growing businesses — https://www.wati.io/en/blog/wati-vs-respond-io-for-growing-businesses/
- respond.io: WhatsApp team inbox — https://ja.respond.io/blog/whatsapp-team-inbox
- Claimlane: reducing "where is my order" queries — https://www.claimlane.com/resources/blog/reduce-where-is-my-order-queries
- Orchestrapay: payments in Egypt — https://www.orchestrapay.com/coverage/africa/egypt
- Egyptian Streets: digital payment options in Egypt — https://egyptianstreets.com/2023/05/15/between-e-wallets-and-money-apps-different-digital-payment-options-in-egypt/
- Dentalkart: student section — https://www.dentalkart.com/c/student-section.html
- University of Malta: dental instrument list by year — https://www.um.edu.mt/media/um/docs/faculties/ds/MDSInstrumentsList2026-27FINAL.pdf
- Molar Dental Store (Egypt) — https://molar-dental-store-a284v9c3.durable.site/
- McKinsey: personalised, high-touch service — https://www.mckinsey.com.br/en/capabilities/operations/our-insights/the-future-of-customer-experience-personalized-white-glove-service-for-all
- Inventory KPIs (reorder point, sell-through, dead stock) — https://www.netsuite.com/portal/resource/articles/financial-management/retail-kpis.shtml

Several sources are vendor blogs. Treat their benchmarks as directional, and replace them with his own baseline once the system is running.
