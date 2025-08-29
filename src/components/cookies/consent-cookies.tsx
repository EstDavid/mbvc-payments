'use client';

import { Fragment, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import Script from "next/script";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

const LOCAL_CONSENT = 'localConsent';

export default function ConsentCookies ({ t }: { t: Record<string, string>; }) {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [showGA, setShowGA] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const consentValue = Cookies.get(LOCAL_CONSENT);
    if (consentValue === 'true') {
      setConsent(true);
      setShowGA(true);
    } else if (consentValue === 'false') {
      setConsent(false);
      setShowGA(false);
    }
    setIsInitialized(true); // Mark initialization as complete
  }, []);

  function acceptCookie () {
    Cookies.set(LOCAL_CONSENT, 'true', { expires: 365 });
    setConsent(true);
    setShowGA(true);
  }

  function denyCookie () {
    Cookies.set(LOCAL_CONSENT, 'false', { expires: 1 });
    setConsent(false);
    setShowGA(false);
  }

  if (!isInitialized) {
    return null; // Prevent rendering until initialization is complete
  }

  if (consent === null) {
    return (
      <div className="fixed bottom-3 z-10 max-w-xl mx-5 p-5 rounded-md bg-white text-stone-700 font-light">
        <p className="pb-2">{t.cookieConsentParagraph}</p>
        <Link
          href="https://montgobvc.com/cookies/"
          target="_blank" rel="noopener noreferrer"
          className="flex align-middle items-center gap-2"

        ><p className="py-4">{t.seeCookiePolicy}</p><SquareArrowOutUpRight size={16} /></Link>
        <div className="flex align-middle justify-end space-x-4">
          <Button
            onClick={denyCookie}
            variant='outline'
            className="rounded-lg text-md font-normal px-8"
          >{t.denyAll}</Button>
          <Button
            onClick={acceptCookie}
            className="rounded-lg text-md font-normal px-8 bg-stone-700 hover:bg-accent-foreground"
          >{t.acceptAll}</Button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {showGA && process.env.NEXT_PUBLIC_GTM_ID && (
        <Fragment>
          {/* Global site tag (gtag.js) - Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${process.env.NEXT_PUBLIC_GTM_ID}')
            `}
          </Script>
        </Fragment>
      )}
    </Fragment>
  );
}