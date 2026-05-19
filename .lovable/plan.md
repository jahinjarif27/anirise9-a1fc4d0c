## Goal
Logo behavior in `src/components/site/Navbar.tsx`:
- 1 click → go to home (`/`) via SPA navigation, no full page reload
- 3 quick clicks → open admin password dialog, no reload

## Changes (only `Navbar.tsx`)
1. Replace the `<a href="/">` wrapper with a `<button>` (or keep `<a>` but always `e.preventDefault()`), so the browser never does a hard reload.
2. Rewrite `handleLogoClick`:
   - Always `preventDefault`.
   - Maintain a click counter + a single `setTimeout` (~400ms).
   - If 3 clicks land inside the window → clear timer, open admin dialog (`setAdminOpen(true)`).
   - Otherwise on timeout → `navigate("/")` (SPA, no reload).
3. Use a `useRef` for the timer/counter so re-renders don't lose state.

No other files touched. Admin login flow, edge functions, and routing stay as-is.