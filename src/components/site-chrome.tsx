"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps every page in the banner, header, and footer, except:
 *   /embed/*  pages shown inside iframes (payment form, frames playground)
 *   /popup/*  pages opened in small popup windows (share)
 * Those must not contain a second copy of the site around them.
 */
export function SiteChrome({
  banner,
  header,
  footer,
  children,
}: {
  banner: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/embed/") || pathname.startsWith("/popup/")) {
    return children;
  }

  return (
    <>
      {banner}
      {header}
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      {footer}
    </>
  );
}
