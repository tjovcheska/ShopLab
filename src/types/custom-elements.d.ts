// Lets TypeScript accept <shoplab-rating> in JSX
// (see src/components/shoplab-rating-element.ts).
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "shoplab-rating": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { label?: string; value?: string; max?: string };
    }
  }
}
