# TradeTracker Pro Onboarding & Subscriptions Guide

This document explains the dynamic trial onboarding, access control locks, email scheduler, and Cashfree checkout systems configured for the portal.

---

## 1. Membership Tiers & User Badges
A user's profile badge in the dashboard sidebar dynamically displays one of the following labels based on live backend evaluations:

1. **`FREE` (Default):** Unverified users who have restricted access. Redirected to the onboarding gate on dashboard routes.
2. **`PROMO TRIAL`:** Users who bypass the gate by entering a promo code (e.g. `rdx10`). They receive up to 10 days of trial access.
3. **`OPERATOR HQ`:** Users who have their partner broker account verification request successfully approved by the admin. Permanent free access.
4. **`PREMIUM`:** Users who purchase a monthly or annual paid subscription via Cashfree. Permanent access during active billing cycle.

---

## 2. Promotional Trial Rules (`rdx10`)
* **Code Activation:** Entering `rdx10` (case-insensitive) bypasses the onboarding gate.
* **Capped Expiry (August 31, 2026 Cutoff):**
  * Trials last for **10 days** from activation.
  * **Absolute Hard Cutoff:** Trial access completely ceases for everyone on **August 31, 2026 UTC** regardless of activation date. (e.g., activating on August 29 results in a 2-day trial).

---

## 3. Feature Access Restriction Locks
Promo Trial users are locked out of specific institutional trading features. If accessed, they render a modern lock card prompting upgrade or broker verification:
- `/market` (Live streaming WebRTC chart room)
- `/operator-hq` (Real-time operator signals feed)
- `/calendar` (Institutional Economic Calendar)
- `/position-calculator` (Position size lot calculator)

*Note: In benefits list, the economic calendar has been swapped for **Trading Resources** (featuring educational PDF guides).*

---

## 4. Paid Subscription Plans (Razorpay Integration)
Payment checkout under `/premium` gathers customer Name, Email, and Phone number to initialize orders:

* **Monthly Plan:** **$8.99/month** (Auto-applies `LAUNCH40` coupon, charged as **₹955 INR** using fallback exchange rate).
* **Annual Launch Plan:** **$80/year** (Auto-applies `LAUNCH55` coupon for 55% discount off standard $180, charged as **₹8,334 INR** fallback exchange rate).
* **Auto-Sync:** Verified instantly inside the standard Razorpay checkout modal handler callback, upgrading the next-auth browser session to `PREMIUM` and redirecting back to `/dashboard` without reload.

---

## 5. Drip Email Campaigns (Resend API)
A background scheduler boots with the server checking status logs every 12 hours:
- **2-Day Expiry Alert:** Sends a warning email to users whose trials expire in $\le 2$ days.
- **Trial Ended Alert:** Sends an email on the expiration date notifying users that access has been locked.
- **Verification Sync:** Automatically skips sending warnings if the user has upgraded to Premium or has an approved broker verification.
