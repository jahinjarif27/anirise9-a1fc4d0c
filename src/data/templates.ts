export type BlogTemplate = { id: string; name: string; description: string; body: string };

export const blogTemplates: BlogTemplate[] = [
  {
    id: "howto",
    name: "How-to Guide",
    description: "Step-by-step tutorial with intro, steps, and conclusion.",
    body: `## Introduction

Briefly explain the problem this guide solves and who it's for.

## What you'll need

- Item one
- Item two
- Item three

## Step 1 — Set the foundation

Describe the first action with clear instructions. Add a screenshot or code block if helpful.

\`\`\`bash
example command
\`\`\`

## Step 2 — Build on it

Continue with the next action. Keep paragraphs short.

## Step 3 — Polish and ship

Wrap up the implementation. Mention common mistakes to avoid.

## Conclusion

Summarise the result and what to try next.

> **Pro tip:** Add a CTA at the end pointing readers to a related service or article.
`,
  },
  {
    id: "casestudy",
    name: "Case Study",
    description: "Client result story with challenge, solution, results.",
    body: `## Client snapshot

**Industry:** _e.g. Ecommerce_
**Goal:** _e.g. Double organic traffic in 90 days_

## The challenge

Describe the situation the client was in before working with you. Use numbers if possible.

## Our approach

1. **Audit** — what we discovered.
2. **Strategy** — the plan we built.
3. **Execution** — what we shipped, week by week.

## Results

| Metric | Before | After |
| --- | --- | --- |
| Organic traffic | 1,200/mo | 4,800/mo |
| Leads | 12 | 56 |
| Revenue | $5k | $22k |

## Key takeaways

- Lesson one
- Lesson two
- Lesson three

> _"AniRise transformed our online presence."_ — Client name, Role
`,
  },
  {
    id: "listicle",
    name: "Listicle (Top 10)",
    description: "Numbered list post — great for SEO and social shares.",
    body: `## Why this list matters

One short paragraph explaining the value of the list to the reader.

### 1. First item

Quick explanation in 2-3 sentences.

### 2. Second item

Quick explanation in 2-3 sentences.

### 3. Third item

Quick explanation in 2-3 sentences.

### 4. Fourth item

### 5. Fifth item

## Final thoughts

Wrap up and invite readers to take the next step.
`,
  },
  {
    id: "news",
    name: "News / Announcement",
    description: "Short update post for product news or company updates.",
    body: `## The news in one line

State the announcement clearly.

## What's changing

Explain in 2-3 short paragraphs what is new and why it matters to your audience.

## What it means for you

- Benefit one
- Benefit two
- Benefit three

## What's next

Tell readers what to expect or do next.
`,
  },
];

export type PageTemplate = { id: string; name: string; description: string; body: string };

export const pageTemplates: PageTemplate[] = [
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero, features, CTA — perfect for a campaign or offer.",
    body: `# Grow your business with AniRise

A one-line promise that grabs attention and tells visitors what they get.

[Get a free consultation](/contact)

---

## Why choose us

### Proven results
Trusted by 50+ brands across Bangladesh to drive measurable growth.

### Transparent pricing
No hidden fees. You always know what you're paying for and why.

### Dedicated team
A senior strategist works on your account from day one.

---

## What you get

- Tailored SEO and marketing strategy
- Monthly performance reports
- Direct access to your project manager
- Continuous optimization

---

## Ready to start?

Book a free 30-minute strategy call and walk away with 3 quick wins for your site.

[Schedule my call](/contact)
`,
  },
  {
    id: "service",
    name: "Service Page",
    description: "Service overview, deliverables, pricing, FAQ.",
    body: `# Service name

A short value proposition under the title — what the service does and who it's for.

## What's included

- Deliverable one — short description
- Deliverable two — short description
- Deliverable three — short description
- Deliverable four — short description

## How it works

1. **Discovery call** — we learn about your business and goals.
2. **Strategy** — we build a custom plan for your industry.
3. **Execution** — we ship the work and report weekly.
4. **Optimization** — we refine based on real data.

## Pricing

| Plan | Best for | Price |
| --- | --- | --- |
| Starter | Small businesses | ৳15,000/mo |
| Growth | Scaling brands | ৳35,000/mo |
| Enterprise | Established companies | Custom |

## Frequently asked questions

**How long until I see results?**
Most clients see meaningful traction within 60-90 days.

**Can I cancel anytime?**
Yes. No long-term contracts.

**Do you offer one-time projects?**
Yes, ask for a custom quote.

[Request a custom quote](/contact)
`,
  },
  {
    id: "about",
    name: "About Page",
    description: "Story, mission, team — build trust with visitors.",
    body: `# About AniRise

We help businesses in Bangladesh grow online — through SEO, smart marketing, and design that converts.

## Our story

AniRise started with a simple belief: every business deserves a fair shot at being found online. Whether you're a local shop or a growing brand, the right digital strategy can change everything.

## What drives us

- **Results over promises** — we measure everything.
- **Honest partnerships** — no fluff, no jargon.
- **Long-term thinking** — we build, not just rank.

## The team

A small group of strategists, designers, and developers who care deeply about your success.

## Let's talk

If our values match yours, we'd love to hear about your project.

[Contact us](/contact)
`,
  },
  {
    id: "faq",
    name: "FAQ Page",
    description: "Question and answer layout for support or sales.",
    body: `# Frequently asked questions

Everything you need to know before working with us.

## Getting started

**How do I start a project with AniRise?**
Use the contact form or WhatsApp us. We respond within 24 hours.

**Do you offer a free consultation?**
Yes — a 30-minute call to understand your goals and recommend a path forward.

## Services

**What services do you offer?**
SEO (website & ecommerce), graphic design, social media marketing, and web development.

**Can I hire you for a single project?**
Yes, we work on both retainers and one-time projects.

## Pricing & payments

**How much does it cost?**
Most engagements start at ৳15,000/mo. We provide a custom quote after the discovery call.

**What payment methods do you accept?**
bKash, Nagad, bank transfer, and international wire.

## Still have questions?

[Get in touch](/contact)
`,
  },
];
