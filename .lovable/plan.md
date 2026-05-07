## Goal

Admin er **Site Pages** ke "section group" based banano (Home, Services, +custom groups). Prottek section ekta collapsible dropdown (right-arrow toggle). Section er vitor multiple pages thakbe. Page er `Section location` card remove kore, prottek page er nijer "Location" selector dewa hobe — ja diye user oi page-ke onno section-e move korte parbe. Jegula Home er baire, segula nijer route pabe (eg `/portfolio`) and 3-dot menu theke link hobe (Blog er moto).

## Changes

### 1. Data model (`AdminContext.tsx`)
- Notun `SectionGroup` type: `{ id, key, label, isHome: boolean }`. Default groups: `home` (isHome=true) + `services` (demo).
- `homeMembership: Record<SectionKey, boolean>` ke replace kora hobe `pageLocation: Record<string, string>` diye — value = group key (`"home"`, `"services"`, ya `""` for standalone route).
- `CustomPage`-e `groupKey?: string` (optional) — kon group-er dropdown-e dekhabe.
- Migration: existing membership → "home" or "" ("" = standalone route).
- CRUD: `addSectionGroup / updateSectionGroup / deleteSectionGroup` (home group delete kora jabe na).

### 2. Routing (`App.tsx`)
- Built-in pages jegula Home-e nei (location !== "home"), tader jonno auto route generate hobe: `/services`, `/about`, `/portfolio`, `/testimonials`, `/contact`. Page render = ekta wrapper ja Navbar + se section component + Footer dekhabe.
- 3-dot menu (Navbar links) dynamically generate hobe: jegula Home-e ache → hash link (`/#section`), jegula nai → full route (`/section`). Same for custom pages.

### 3. Index.tsx (Home page)
- `homeMembership` er bodole `pageLocation[k] === "home"` check kore section render hobe.
- Custom pages jader `groupKey === "home"` segulao Home-e show korbe (existing `homeSections` flow er moto).

### 4. Admin Dashboard — Pages tab
- Left sidebar:
  - Section groups list (Home, Services, +custom). Prottek group ekta collapsible header with right-arrow chevron (Collapsible component already available).
  - Group expand korle vitorer pages list dekhabe (jara `pageLocation[page] === group.key`).
  - "+ Add page" button per group → custom page create with `groupKey` preset.
  - "+ Add section group" button group list er niche.
- `MembershipToggle` (Section location card) **remove**.
- Prottek built-in page editor er top-e notun **Location selector** Card add hobe: dropdown of all group keys + "Standalone route" option. Change korle page realtime oi group-er dropdown-e move korbe.
- Custom page editor-eo Location selector (optional) — empty = root standalone, value = group.

### 5. Demo
- Default e `services` group thakbe with: WebsiteSEO, EcommerceSEO, GraphicsDesign er placeholder children entries (link-only references — already routable via `/services/...`).

## Technical notes

- `SECTION_KEYS` aage hardcoded 7 ta — segulao "page" hisebe treat korbo, group e drop kora jabe.
- Standalone route render: ekta `<SectionPage section={Component} />` wrapper banabo `src/pages/SectionPage.tsx`.
- Bengali user-facing strings noi — admin labels English-i thakbe (existing pattern follow).

## Out of scope
- Persistence (localStorage/Cloud). Existing context already in-memory; same.
- Blog page restructure — already separate route, untouched.

Confirm korle implement kore felbo.