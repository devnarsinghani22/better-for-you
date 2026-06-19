import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy — Better for You by Food Pharmer",
  description:
    "How Better for You by Food Pharmer collects, uses, and protects the details you share with us.",
  // Self-canonical (resolved against metadataBase) — collapses any
  // tracking-param variants of this footer-linked page.
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "betterforyou@foodpharmer.net";
const UPDATED = "May 2026";
// NOTE: the "Our mobile app & notifications" section below is required for the
// Google Play / App Store data-safety disclosures. Keep it in sync with what
// the app actually does (FCM/APNs push token + notification preference).

export default function PrivacyPage() {
  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-[760px] w-full mx-auto px-5 sm:px-10 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
          Better for You · Privacy
        </p>
        <h1 className="mt-4 font-display font-medium leading-[0.95] tracking-[-0.02em] text-4xl sm:text-6xl text-[color:var(--ink)]">
          Privacy Policy
        </h1>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          Last updated · {UPDATED}
        </p>

        <div className="mt-10 space-y-9 text-[color:var(--ink-soft)] text-base sm:text-lg leading-relaxed">
          <p>
            This policy explains what we collect when you share your details
            with <em>Better for You by Food Pharmer</em>, why we collect it, and
            the choices you have. We keep it short on purpose.
          </p>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              What we collect
            </h2>
            <p className="mt-3">
              When you sign up to hear about a launch (for example, our
              Restaurants list), we collect the details you enter:{" "}
              <strong>your name, email address, and phone number</strong>. We do
              not collect anything else, and we don&rsquo;t use hidden trackers
              to build a profile of you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              Why we collect it
            </h2>
            <p className="mt-3">
              Only to tell you when the thing you signed up for goes live, and
              to send occasional updates about it — over{" "}
              <strong>WhatsApp and email</strong>. That&rsquo;s it. We process
              this information on the basis of your consent, which you give by
              ticking the box and submitting the form.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              Our mobile app &amp; notifications
            </h2>
            <p className="mt-3">
              If you use the <em>Better for You</em> mobile app and allow
              notifications, your device is issued a{" "}
              <strong>push notification token</strong> by Google (Android) or
              Apple (iOS). We store this token only so we can send you the
              occasional update — for example, when we add a new approved
              product. It is not linked to your name and is not used to track
              you. You can turn notifications off at any time in your phone&rsquo;s
              settings, and we delete tokens that are no longer valid.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              We never sell or share it
            </h2>
            <p className="mt-3">
              We do not sell, rent, or trade your details. We don&rsquo;t share
              them with advertisers. We only use trusted service providers (for
              example, to send the messages) and only to the extent needed to
              contact you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              How long we keep it
            </h2>
            <p className="mt-3">
              We keep your details until you ask us to remove them. You can
              request deletion of your data at any time, and we will act on it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              Your rights
            </h2>
            <p className="mt-3">
              Under India&rsquo;s Digital Personal Data Protection Act, 2023,
              you can ask us to access, correct, or delete your details, and you
              can withdraw your consent at any time. To do any of these, just
              email us — we&rsquo;ll act on it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
              Contact us
            </h2>
            <p className="mt-3">
              For any privacy question, or to withdraw consent or delete your
              data, write to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[color:var(--ink)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t rule">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)] transition-colors"
          >
            ← Back to Better for You
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
