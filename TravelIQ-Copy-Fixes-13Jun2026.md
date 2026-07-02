# TravelIQ — Copy Fixes & About Us Rewrite
**13 June 2026 · addresses: messy "One network" headline, off-positioning subhead, "BDM" removal site-wide, disconnected About Us**

Decisions applied: replace "BDM" with **Account Manager** or **Sales Rep** (used contextually); TravelIQ is positioned as an AI sales/support network *for suppliers* serving the **travel trade (agents)** — never as a travel agent itself, and never listing supplier products as things it "speaks".

---

## Fix 1 — "One network" headline (the messy wrap)

> ✅ **FINAL (chosen 13 Jun): "The sales network behind every travel brand."** — keeps the premium "behind" framing but names the active sales benefit, tying back to TravelIQ's positioning. Set as H2; apply the gradient/accent to **"sales network"** (or to "behind every travel brand" — see note). Options below kept for reference.

**Problem:** "One network. Every kind of travel brand." wraps to a stranded "brand." on its own line — looks basic, not premium.

### Option A — keep the wording, fix the layout (safest)
Force a controlled two-line lockup; line 2 carries the gradient accent and never breaks mid-phrase:

> **One network.**
> *Every kind of travel brand.*  ← accent gradient, kept on one line

CSS: `text-wrap: balance;` on the H2, an explicit `<br>` (or a `max-width` ~14ch) after "network.", and `white-space: nowrap` is **not** used (let it sit on one line via width). Mobile: allow natural 2–3 line wrap but keep "travel brand." together with `white-space:nowrap` on that span.

### Options B–D — reworded, tighter & more premium (break cleanly by design)
- **B (recommended):** **One network. Every travel brand.**
- **C (most premium):** **The network behind every travel brand.**
- **D:** **One intelligent network. Every travel brand.**

My pick: **B** for punch on the home page, or **C** if you want a more elevated, futuristic tone. Both wrap cleanly at every breakpoint.

---

## Fix 2 — The sub-line under the headline

**Current (remove):**
> "Your AI assistant speaks your product — fares, cabins, rate plans or itineraries — and answers like your best BDM."

Removes: the product list (off-positioning — these aren't framed well, and TravelIQ isn't a travel agent) and "BDM".

**Recommended replacement:**
> Your Voice AI assistant knows your brand inside out — and answers every agent enquiry like your sharpest account manager, in seconds, 24/7/365.

**Alternative:**
> Trained exclusively on your brand, your AI assistant answers the trade in seconds — accurate, on-brand, around the clock.

---

## Fix 3 — Remove "BDM" everywhere (site-wide rule)

**Rule:** "BDM" / "Business Development Manager" must not appear anywhere on the site. Use **Account Manager** (relationship / always-on framing) or **Sales Rep** (conversion framing), chosen to fit the sentence.

Known instances to change:
- Home sub-line (Fix 2 above) — now "account manager".
- About Us → "Think of it as a Business Development Manager who never sleeps…" → **"Think of it as a sales rep who never sleeps…"** (see rewrite below).
- Action for Claude Code: global search for `BDM` and `Business Development Manager` across all components and replace; confirm zero matches remain.

---

## Fix 4 — About Us page (full rewrite)

The current page drifts into B2C ("travellers expect instant responses") and generic AI language, which disconnects it from the site's trade-focused positioning. Rewrite below keeps the same structure but re-anchors it to the trade, the network idea, and a premium voice. **Replace the page body with:**

---

### About TravelIQ
#### Built for the trade. Powered by AI.

**Our mission**
TravelIQ gives travel brands the sales presence they deserve — without the headcount that makes it impossible to scale. We're building the UK and Europe's dedicated AI support network for the travel trade: intelligent, always-on, and trained exclusively on your brand. Not a generic chatbot. Not a call centre. A smarter way to support every agent and convert every enquiry.

**Why we built it**
The travel industry has a distribution problem. Airlines, tour operators, DMCs, cruise lines and hotel groups pour enormous effort into creating exceptional products — then struggle to answer the trade consistently across every market, language and enquiry.

Meanwhile, the agents who sell those products expect instant, knowledgeable answers. In a competitive market, a 24-hour delay on a trade enquiry isn't neutral — it's a lost booking. TravelIQ closes that gap: AI voice and chat agents that know your product inside out, respond in seconds, and sound exactly like your brand — in 10+ languages, around the clock.

**Who we serve**

✈️ **Travel brands & suppliers** — Airlines, tour operators, DMCs, cruise lines and hotel groups. We deploy AI agents trained on your exact product knowledge and brand voice, so every agent enquiry gets a fast, accurate, on-brand answer — and every conversation becomes a named lead. Think of it as a sales rep who never sleeps, never goes off-script, and scales without headcount.

🤝 **Agencies & distribution partners** — Travel agencies, OTAs and distribution networks who want to offer AI-powered support to their supplier base. White-label the platform, add new revenue streams, and give your partners an edge. Our partnership model flexes from pilot programmes to full network rollouts.

**How we work**

🎯 **Travel-specific** — We don't build generic AI. Every assistant is trained on travel terminology, supplier content and trade workflows. We speak your language because we know the industry.

🔒 **Always on-brand** — Your AI is trained exclusively on the content you provide. No hallucinations, no off-script answers — every response stays within your verified knowledge base.

📈 **Results first** — We measure success in booked demos, captured leads and converted enquiries, not vanity metrics. Partners see meaningful ROI from the first weeks of deployment.

**Built by the trade, for the trade**
TravelIQ was founded by a senior airline commercial leader with two decades managing trade sales, marketing and call-centre performance across UK and European markets — the tool we always wished our trade partners had.

**Ready to see it in action?**
Book a demo and we'll show you exactly how TravelIQ works for your brand — trained on your content, in your voice, live in days.
→ **Book a Demo** (/#/pricing)

---

## Claude Code — implementation notes
1. **Headline (FINAL):** set the vertical-tiles section H2 to **"The sales network behind every travel brand."** Apply the existing gradient/accent treatment to **"sales network"** so it pops; keep the rest in white. Add `text-wrap:balance` so it never breaks awkwardly. Remove the old "One network. Every kind of travel brand." wording.
2. **Sub-line:** replace with the Fix 2 recommended sentence.
3. **BDM:** global find/replace `BDM` and `Business Development Manager` → Account Manager / Sales Rep per context; verify 0 remaining matches.
4. **About Us:** replace page body with the Fix 4 copy. Swap emoji for the site's existing line-icon set (plane / handshake / target / lock / chart) for a more premium feel; keep the three-up grids consistent with the home-page card styling.
5. Keep the four verticals named in the standard order (airlines, cruise lines, hotel groups, tour operators) and the "Live in 48 hours" qualifier intact.
