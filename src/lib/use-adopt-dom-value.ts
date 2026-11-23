"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Keeps text typed BEFORE React hydrated the page.
 *
 * Server-rendered inputs can be typed into before React takes over. React
 * keeps that text in the DOM, but its state still says "" — and the next
 * re-render (e.g. typing in another field) resets the input to "". Firefox
 * and WebKit hit this often in automated tests. On mount, this hook copies
 * the input's current DOM value into state.
 */
export function useAdoptDomValue(
  ref: RefObject<FormElement | null>,
  value: string,
  apply: (domValue: string) => void,
) {
  const adopt = useEffectEvent(() => {
    const element = ref.current;
    if (element && element.value !== value) apply(element.value);
  });
  useEffect(() => {
    adopt();
  }, []);
}
