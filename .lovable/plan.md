
## Goal
Jokhon notun **review** ba **lead** website e submit hobe, tomar email (`jahinjarif27@gmail.com`) e ekta notification jabe — recipient name, content, rating etc soho.

## Approach
Lovable Cloud already enabled, tai backend ready. Email pathanor jonno **Resend** connector use korbo (free tier, domain lage na — `onboarding@resend.dev` theke pathabe, recipient sudhu tomar nijer email so eta safe).

Phone notification (Twilio/SMS) free plan e cost lagbe, tai skip korchi — chaile pore add kora jabe.

## Steps

1. **Resend connector connect koro**
   - Tumi ekta Resend account banabe (free, 3000 email/month free) → API key generate korbe → Lovable e connect korbe (ami prompt dekhabo).

2. **Ekta backend function (`notify-admin`) toiri korbo**
   - Eta `to`, `subject`, `html` accept korbe.
   - Resend gateway diye `jahinjarif27@gmail.com` e email pathabe.
   - Sender: `AniRise <onboarding@resend.dev>`.

3. **Review & Lead submission e trigger lagabo**
   - `Testimonials.tsx` er `submit()` e — review insert korar pore `notify-admin` invoke korbe ("New review from {name}: {quote}, rating: {rating}").
   - `StrategyCall.tsx` er `handleSubmit()` e — lead insert korar pore `notify-admin` invoke korbe ("New lead: {name}, {email}, {phone}, service: {service}, message: ...").
   - Email pathano fail hole o user-facing submit success thakbe (silent fail + console log).

4. **Test**
   - Ekta test review ar test lead submit kore tomar inbox check korte bolbo.

## Technical Notes
- Resend free tier: 3,000 emails/month, 100/day — tomar volume er jonno jothesto.
- `onboarding@resend.dev` theke sudhu **tomar own Resend account email** e pathano jay (verified domain chara). Tomar email Resend account er sathe match korle kaaj korbe. Na korle ekta verified domain lagbe.
- Future e tumi nijer domain add korle branded email (`noreply@yourdomain.com`) theke pathano jabe.

## Cost
Fully free. Free plan e cholbe, kono upgrade lage na.

## Future option (optional)
- Telegram bot setup korle phone e instant notification o ashbe — eta free, chaile pore add kore debo.
